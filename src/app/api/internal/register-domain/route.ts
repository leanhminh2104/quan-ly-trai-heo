import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { domain } = await request.json()
    if (!domain) return NextResponse.json({ success: false, error: 'Thiếu domain' }, { status: 400 })

    const firstFarm = await prisma.farm.findFirst()
    if (!firstFarm) return NextResponse.json({ success: false, error: 'Chưa có trang trại' }, { status: 400 })

    const param = await prisma.systemParameter.findUnique({
      where: { farmId_key: { farmId: firstFarm.id, key: 'ALLOWED_DOMAINS' } }
    })

    const currentList = param?.value ? param.value.split(',').map(d => d.trim().toLowerCase()).filter(Boolean) : []
    const cleanDomain = domain.trim().toLowerCase()

    if (!currentList.includes(cleanDomain)) {
      currentList.push(cleanDomain)
      await prisma.systemParameter.upsert({
        where: { farmId_key: { farmId: firstFarm.id, key: 'ALLOWED_DOMAINS' } },
        update: { value: currentList.join(', ') },
        create: { farmId: firstFarm.id, key: 'ALLOWED_DOMAINS', value: currentList.join(', '), description: 'Danh sách các tên miền được phép truy cập' }
      })
    }
    
    return NextResponse.json({ success: true, domains: currentList })
  } catch (error: any) {
    console.error('Lỗi API register-domain:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
