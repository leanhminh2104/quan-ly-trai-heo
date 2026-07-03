// Bản quyền thuộc dalymmo.com
import { Metadata } from 'next'
import { Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Hệ thống đang bảo trì | PFMS',
  description: 'Hệ thống đang trong quá trình bảo trì',
}

export default function MaintenancePage() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 text-center">
      <div className="flex flex-col items-center max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-4 mb-6">
          <Wrench className="h-12 w-12 text-red-600 dark:text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl mb-4">
          Hệ thống đang bảo trì
        </h1>
        
        <p className="text-base text-gray-600 dark:text-gray-300 mb-8">
          Chúng tôi đang nâng cấp hệ thống để mang lại trải nghiệm tốt hơn. Vui lòng quay lại sau ít phút. Xin lỗi vì sự bất tiện này!
        </p>

        <div className="flex gap-4 w-full">
          <Link href="/login" className="w-full">
            <Button variant="outline" className="w-full">
              Đăng nhập bằng tài khoản khác
            </Button>
          </Link>
        </div>
      </div>
      
      <p className="mt-8 text-sm text-gray-500">
        Bản quyền thuộc dalymmo.com
      </p>
    </div>
  )
}
