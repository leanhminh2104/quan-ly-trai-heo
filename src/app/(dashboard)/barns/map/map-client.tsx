'use client'
// Bản quyền thuộc dalymmo.com

import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { ArrowLeft, LayoutGrid, Map as MapIcon } from 'lucide-react'
import Link from 'next/link'
import { useBarnHierarchy } from '@/hooks/use-barn'
import { Skeleton } from '@/components/ui/skeleton'
import { FarmLayout } from '@/components/barns/farm-layout'

interface MapClientProps {
  initialData: any[]
  initialUnassigned: any[]
}

export default function MapClient({ initialData, initialUnassigned }: MapClientProps) {
  const { data: hierarchy, isLoading } = useBarnHierarchy()

  // Ưu tiên dữ liệu realtime từ TanStack Query, fallback về initialData
  const data = hierarchy ?? initialData ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sơ đồ chuồng trại"
        description="Kéo thả mã lợn để chuyển chuồng trực quan"
        action={{
          label: 'Quay lại danh sách',
          href: '/barns',
          icon: <ArrowLeft className="w-4 h-4 mr-2" />,
        }}
      >
        <div className="hidden sm:flex bg-muted p-1 rounded-lg">
          <Link
            href="/barns"
            className="inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors hover:text-foreground text-muted-foreground"
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Danh sách
          </Link>
          <Button variant="secondary" size="sm" className="h-8 bg-background shadow-sm">
            <MapIcon className="h-4 w-4 mr-2" />
            Sơ đồ
          </Button>
        </div>
      </PageHeader>

      {isLoading && !initialData?.length ? (
        <div className="space-y-4">
          <div className="flex gap-3 justify-end">
            <Skeleton className="h-7 w-20 rounded-md" />
            <Skeleton className="h-7 w-20 rounded-md" />
            <Skeleton className="h-7 w-20 rounded-md" />
          </div>
          <Skeleton className="h-[500px] w-full rounded-2xl" />
        </div>
      ) : (
        <FarmLayout initialData={data} initialUnassigned={initialUnassigned} />
      )}
    </div>
  )
}
