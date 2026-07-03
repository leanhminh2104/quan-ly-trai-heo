// Bản quyền thuộc dalymmo.com
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Create Supabase client for Server Components / Server Actions / Route Handlers
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  )
}

/**
 * Get current authenticated user session
 */
export async function getSession() {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }

  return user
}

import { UserRole, Farm } from '@prisma/client'

export type CurrentUser = {
  id: string
  email: string
  name: string | null
  avatar: string | null
  supabaseId: string
  isActive: boolean
} & (
  | { farmId: string; farm: Farm; role: UserRole }
  | { farmId: null; farm: null; role: null }
)

/**
 * Get current user's farm membership info
 * Returns user + farm + role
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }

  // Import prisma dynamically to avoid circular deps
  const { prisma } = await import('./prisma')
  
  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    include: {
      memberships: {
        where: { isActive: true },
        include: { farm: true },
        take: 1,
      },
    },
  })

  if (!dbUser) {
    return null
  }

  if (dbUser.memberships.length === 0) {
    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      avatar: dbUser.avatar,
      supabaseId: dbUser.supabaseId,
      isActive: dbUser.isActive,
      farmId: null,
      farm: null,
      role: null,
    }
  }

  const membership = dbUser.memberships[0]

  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    avatar: dbUser.avatar,
    supabaseId: dbUser.supabaseId,
    isActive: dbUser.isActive,
    farmId: membership.farmId,
    farm: membership.farm,
    role: membership.role,
  }
}
