import { Metadata } from 'next'
import { PigForm } from '@/components/pigs/pig-form'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Cập nhật cá thể lợn | PFMS',
  description: 'Chỉnh sửa thông tin cá thể lợn',
}

export default async function EditPigPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Suspense fallback={<div>Đang tải biểu mẫu...</div>}>
        <PigForm initialId={resolvedParams.id} />
      </Suspense>
    </div>
  )
}
