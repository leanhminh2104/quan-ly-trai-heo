import { prisma } from '../src/lib/prisma'

async function main() {
  // Tìm Farm đầu tiên (farm mặc định)
  const farm = await prisma.farm.findFirst()

  if (!farm) {
    console.log('Không tìm thấy Farm nào. Hãy tạo tài khoản và farm trước.')
    return
  }

  console.log(`Đang khởi tạo dữ liệu chuồng trại cho Farm: ${farm.name} (${farm.id})`)

  // 1. Tạo BarnZone (Khu)
  let zone = await prisma.barnZone.findFirst({
    where: { farmId: farm.id, code: 'KHU_A' }
  })

  if (!zone) {
    zone = await prisma.barnZone.create({
      data: {
        farmId: farm.id,
        name: 'Khu A',
        code: 'KHU_A',
        description: 'Khu chăn nuôi trung tâm'
      }
    })
    console.log('Đã tạo: Khu A')
  }

  // 2. Tạo BarnRow (Dãy)
  let row = await prisma.barnRow.findFirst({
    where: { zoneId: zone.id, code: 'DAY_1' }
  })

  if (!row) {
    row = await prisma.barnRow.create({
      data: {
        zoneId: zone.id,
        name: 'Dãy 1',
        code: 'DAY_1'
      }
    })
    console.log('Đã tạo: Dãy 1')
  }

  // 3. Tạo Barn (Nhà chuồng)
  let barn = await prisma.barn.findFirst({
    where: { rowId: row.id, code: 'NHA_1' }
  })

  if (!barn) {
    barn = await prisma.barn.create({
      data: {
        rowId: row.id,
        name: 'Nhà 1',
        code: 'NHA_1',
        description: 'Nhà chuồng số 1'
      }
    })
    console.log('Đã tạo: Nhà 1')
  }

  console.log('✅ Khởi tạo dữ liệu cấu trúc chuồng trại thành công!')
}

main()
  .catch((e) => {
    console.error('Lỗi khi chạy script:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
