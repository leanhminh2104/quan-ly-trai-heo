// Bản quyền thuộc dalymmo.com
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  // Lấy đúng tên miền gốc kể cả khi qua proxy (Ngrok, Vercel)
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000';
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const realOrigin = `${protocol}://${host}`;

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
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
            } catch (error) {
              // Ignore if middleware is handling it
            }
          },
        },
      }
    )

    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Check if user exists in our DB
      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: data.user.email }
        })

        if (!existingUser) {
          // Check if this is the very first user in the system
          const totalUsers = await prisma.user.count()
          const isFirstUser = totalUsers === 0

          let isActive = isFirstUser
          let autoActivate = false

          if (!isFirstUser) {
            // Check auto activate parameter
            const firstFarm = await prisma.farm.findFirst()
            if (firstFarm) {
              const param = await prisma.systemParameter.findUnique({
                where: {
                  farmId_key: {
                    farmId: firstFarm.id,
                    key: 'AUTO_ACTIVATE_ACCOUNT',
                  }
                }
              })
              if (param?.value === 'true') {
                isActive = true
                autoActivate = true
              }
            }
          }

          const newUser = await prisma.user.create({
            data: {
              email: data.user.email!,
              name: data.user.user_metadata?.name || data.user.user_metadata?.full_name || 'Người dùng Google',
              supabaseId: data.user.id,
              isActive,
            }
          })
          
          if (autoActivate) {
            const firstFarm = await prisma.farm.findFirst()
            if (firstFarm) {
              await prisma.farmMember.create({
                data: {
                  farmId: firstFarm.id,
                  userId: newUser.id,
                  role: 'VIEWER',
                  isActive: true,
                }
              })
            }
          }

          if (!isActive) {
            return NextResponse.redirect(`${realOrigin}/pending-approval`)
          }
        } else if (!existingUser.isActive) {
          return NextResponse.redirect(`${realOrigin}/pending-approval`)
        }
      } catch (dbError) {
        console.error('Error handling Google OAuth callback DB sync:', dbError)
      }
    }
  }

  // Return the user to an error page or destination
  return NextResponse.redirect(`${realOrigin}${next}`)
}
