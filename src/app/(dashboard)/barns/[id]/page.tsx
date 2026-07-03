'use client'
// Bản quyền thuộc dalymmo.com

import { use } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { BarnForm } from '@/components/barns/barn-form'
import { useBarn, useUpdateBarn } from '@/hooks/use-barn'
import { UpdateBarnInput } from '@/validators/barn'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function EditBarnPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { data: barn, isLoading } = useBarn(resolvedParams.id)
  const { mutateAsync: updateBarn, isPending } = useUpdateBarn()

  const handleSubmit = async (data: any) => {
    try {
      const payload: UpdateBarnInput = { ...data, id: resolvedParams.id }
      await updateBarn(payload)
      router.push('/barns')
    } catch (error) {
      // Error is handled by the hook
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!barn) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <h2 className="text-xl font-semibold">Không tìm thấy chuồng</h2>
        <p className="text-muted-foreground">Chuồng này có thể đã bị xóa hoặc bạn không có quyền truy cập.</p>
        <button
          onClick={() => router.push('/barns')}
          className="text-emerald-600 hover:underline"
        >
          Quay lại danh sách
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-8 pt-6 max-w-4xl mx-auto">
      <PageHeader
        title={`Cập nhật chuồng: ${barn.name}`}
        description="Chỉnh sửa thông tin chi tiết và trạng thái của chuồng"
        action={{
          label: 'Quay lại',
          onClick: () => router.push('/barns'),
          icon: <ArrowLeft className="w-4 h-4 mr-2" />
        }}
      />
      
      <div className="bg-card border rounded-xl shadow-sm p-6">
        <BarnForm initialData={barn} onSubmit={handleSubmit} isSubmitting={isPending} />
      </div>
    </div>
  )
}
