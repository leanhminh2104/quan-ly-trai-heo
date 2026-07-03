import { Metadata } from 'next'
import { PigForm } from '@/components/pigs/pig-form'

export const metadata: Metadata = {
  title: 'Nhập đàn mới | PFMS',
  description: 'Thêm thông tin lợn hoặc lô lợn mới vào hệ thống',
}

import { Suspense } from 'react'

export default function NewPigPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Suspense fallback={<div>Đang tải biểu mẫu...</div>}>
        <PigForm />
      </Suspense>
    </div>
  )
}
