// Bản quyền thuộc dalymmo.com
'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

const GOOGLE_LOGIN_KEY = 'ENABLE_GOOGLE_LOGIN'

export async function getSystemParameter(key: string, farmId?: string) {
  try {
    let targetFarmId = farmId

    if (!targetFarmId) {
      const firstFarm = await prisma.farm.findFirst()
      if (!firstFarm) return false
      targetFarmId = firstFarm.id
    }

    const param = await prisma.systemParameter.findUnique({
      where: {
        farmId_key: {
          farmId: targetFarmId,
          key,
        }
      }
    })

    return param?.value === 'true'
  } catch (error) {
    console.error(`Error fetching parameter ${key}:`, error)
    return false
  }
}

export async function updateSystemParameter(key: string, enabled: boolean, description?: string) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.farmId) {
      return { success: false, error: 'Chưa đăng nhập hoặc không thuộc trang trại nào' }
    }

    if (user.role !== 'OWNER' && user.role !== 'MANAGER') {
      return { success: false, error: 'Bạn không có quyền thay đổi cài đặt này' }
    }

    await prisma.systemParameter.upsert({
      where: {
        farmId_key: {
          farmId: user.farmId,
          key,
        }
      },
      update: {
        value: enabled ? 'true' : 'false',
      },
      create: {
        farmId: user.farmId,
        key,
        value: enabled ? 'true' : 'false',
        description: description || `Cấu hình ${key}`,
      }
    })

    revalidatePath('/')
    revalidatePath('/settings/security')
    revalidatePath('/login')
    revalidatePath('/register')
    
    return { success: true }
  } catch (error) {
    console.error(`Error updating parameter ${key}:`, error)
    return { success: false, error: 'Lỗi khi cập nhật cài đặt' }
  }
}

export async function getGoogleLoginStatus(farmId?: string) {
  return getSystemParameter(GOOGLE_LOGIN_KEY, farmId)
}

export async function updateGoogleLoginStatus(enabled: boolean) {
  return updateSystemParameter(GOOGLE_LOGIN_KEY, enabled, 'Cho phép đăng nhập bằng tài khoản Google')
}

export async function getEmailLoginStatus(farmId?: string) {
  try {
    let targetFarmId = farmId
    if (!targetFarmId) {
      const firstFarm = await prisma.farm.findFirst()
      if (!firstFarm) return true // Mặc định là true
      targetFarmId = firstFarm.id
    }
    const param = await prisma.systemParameter.findUnique({
      where: { farmId_key: { farmId: targetFarmId, key: 'EMAIL_LOGIN_ENABLED' } }
    })
    return param ? param.value === 'true' : true // Nếu chưa cấu hình thì mặc định true
  } catch (error) {
    return true
  }
}

export async function updateEmailLoginStatus(enabled: boolean) {
  return updateSystemParameter('EMAIL_LOGIN_ENABLED', enabled, 'Cho phép đăng nhập bằng tài khoản Email/Mật khẩu')
}

export async function getAllowedDomains(farmId?: string) {
  try {
    let targetFarmId = farmId
    if (!targetFarmId) {
      const firstFarm = await prisma.farm.findFirst()
      if (!firstFarm) return ''
      targetFarmId = firstFarm.id
    }
    const param = await prisma.systemParameter.findUnique({
      where: { farmId_key: { farmId: targetFarmId, key: 'ALLOWED_DOMAINS' } }
    })
    return param?.value || ''
  } catch (error) {
    console.error(`Error fetching ALLOWED_DOMAINS:`, error)
    return ''
  }
}

export async function updateAllowedDomains(domains: string) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.farmId) {
      return { success: false, error: 'Chưa đăng nhập hoặc không thuộc trang trại nào' }
    }

    if (user.role !== 'OWNER' && user.role !== 'MANAGER') {
      return { success: false, error: 'Bạn không có quyền thay đổi cài đặt này' }
    }

    await prisma.systemParameter.upsert({
      where: {
        farmId_key: {
          farmId: user.farmId,
          key: 'ALLOWED_DOMAINS',
        }
      },
      update: {
        value: domains,
      },
      create: {
        farmId: user.farmId,
        key: 'ALLOWED_DOMAINS',
        value: domains,
        description: 'Danh sách các tên miền được phép truy cập, phân cách bằng dấu phẩy',
      }
    })

    return { success: true }
  } catch (error) {
    console.error(`Error updating ALLOWED_DOMAINS:`, error)
    return { success: false, error: 'Lỗi khi cập nhật danh sách tên miền' }
  }
}
