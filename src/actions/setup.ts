// Bản quyền thuộc dalymmo.com
'use server'

import { setupSystemSchema, type SetupSystemInput } from '@/validators/setup'
import { prisma } from '@/lib/prisma'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function setupSystem(data: SetupSystemInput) {
  try {
    // 1. Kiểm tra lại xem hệ thống đã khởi tạo chưa
    const existingUsers = await prisma.user.count()
    if (existingUsers > 0) {
      return { success: false, error: 'Hệ thống đã được khởi tạo' }
    }

    const validated = setupSystemSchema.parse(data)

    // 2. Tạo User trên Supabase Auth
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
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validated.email,
      password: validated.password,
      options: {
        data: {
          name: validated.adminName,
        }
      }
    })

    if (authError || !authData.user) {
      return { success: false, error: authError?.message || 'Lỗi khi tạo tài khoản Auth' }
    }

    // 3. Khởi tạo Database Transaction
    await prisma.$transaction(async (tx) => {
      // 3.1 Tạo Farm
      const farm = await tx.farm.create({
        data: {
          name: validated.farmName,
          code: validated.farmCode,
          address: validated.address,
          phone: validated.phone,
        }
      })

      // 3.2 Tạo User trong DB với role OWNER
      const user = await tx.user.create({
        data: {
          email: validated.email,
          name: validated.adminName,
          supabaseId: authData.user!.id,
          isActive: true,
        }
      })

      // 3.3 Link User vào Farm với role OWNER
      await tx.farmMember.create({
        data: {
          farmId: farm.id,
          userId: user.id,
          role: 'OWNER',
        }
      })
      
      // 3.4 Khởi tạo danh mục mặc định (Optional - Ví dụ các loại thuốc/cám) có thể thêm sau
    })

    return { success: true }
  } catch (error: any) {
    console.error('[SETUP_ERROR]', error)
    return { success: false, error: error.message || 'Có lỗi xảy ra khi khởi tạo hệ thống' }
  }
}
