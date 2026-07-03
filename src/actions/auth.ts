// Bản quyền thuộc dalymmo.com
'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { success: false, error: 'Vui lòng nhập đầy đủ email và mật khẩu' }
  }

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
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  )

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    let errorMessage = 'Email hoặc mật khẩu không chính xác'
    if (error.message.includes('Email not confirmed')) {
      errorMessage = 'Tài khoản chưa được xác thực. Vui lòng kiểm tra hộp thư email hoặc tắt "Confirm email" trong Supabase.'
    } else if (error.message.includes('Invalid login credentials')) {
      errorMessage = 'Email hoặc mật khẩu không chính xác.'
    } else {
      errorMessage = error.message // Hiển thị lỗi gốc nếu có lỗi khác
    }
    return { success: false, error: errorMessage }
  }

  return { success: true }
}

export async function register(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  if (!email || !password || !name) {
    return { success: false, error: 'Vui lòng nhập đầy đủ thông tin' }
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (error) {}
        },
      },
    }
  )

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }
    }
  })

  if (error) {
    return { success: false, error: error.message }
  }

  if (data.user) {
    try {
      const exists = await prisma.user.findUnique({ where: { email } })
      if (!exists) {
        const totalUsers = await prisma.user.count()
        const isFirstUser = totalUsers === 0

        let isActive = isFirstUser
        let autoActivate = false

        if (!isFirstUser) {
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
            email,
            name,
            supabaseId: data.user.id,
            isActive
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
      }
    } catch (dbError) {
      console.error('Error creating user in DB:', dbError)
    }
  }

  return { success: true }
}

export async function loginWithGoogle(redirectTo: string) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (error) {}
        },
      },
    }
  )

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        prompt: 'select_account'
      }
    }
  })

    if (data?.url) {
      return { success: true, url: data.url }
    }
  
    return { success: false, error: error?.message || 'Không thể đăng nhập bằng Google' }
  }

export async function checkAccountStatus(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    })
    return { success: true, isActive: !!user?.isActive }
  } catch (error) {
    return { success: false, isActive: false }
  }
}

