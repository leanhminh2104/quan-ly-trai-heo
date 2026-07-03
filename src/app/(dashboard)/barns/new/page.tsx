'use client'
// Bản quyền thuộc dalymmo.com

import { PageHeader } from '@/components/shared/page-header'
import { BarnForm } from '@/components/barns/barn-form'
import { useCreateBarn } from '@/hooks/use-barn'
import { PenInput } from '@/validators/barn'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function CreateBarnPage() {
  const router = useRouter()
  const { mutateAsync: createBarn, isPending } = useCreateBarn()

  const handleSubmit = async (data: PenInput) => {
    try {
      await createBarn(data)
      router.push('/barns')
    } catch (error) {
      // Error is handled by the hook
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-8 pt-6 max-w-4xl mx-auto">
      <PageHeader
        title="Thêm mới chuồng (ô chuồng)"
        description="Điền thông tin chi tiết để thêm mới chuồng vào hệ thống"
        action={{
          label: 'Quay lại',
          onClick: () => router.push('/barns'),
          icon: <ArrowLeft className="w-4 h-4 mr-2" />
        }}
      />
      
      <div className="bg-card border rounded-xl shadow-sm p-6">
        <BarnForm onSubmit={handleSubmit} isSubmitting={isPending} />
      </div>
    </div>
  )
}
