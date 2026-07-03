// Bản quyền thuộc dalymmo.com
import { Metadata } from 'next'
import { getBarnHierarchy, getUnassignedPigs } from '@/actions/barn'
import MapClient from './map-client'

export const metadata: Metadata = {
  title: 'Sơ đồ chuồng trại',
  description: 'Trực quan hóa sơ đồ các dãy chuồng và trạng thái ô chuồng',
}

export default async function BarnMapPage() {
  const [hierarchyResult, unassignedResult] = await Promise.all([
    getBarnHierarchy(),
    getUnassignedPigs(),
  ])
  const hierarchy = hierarchyResult?.success ? hierarchyResult.data : []
  const unassignedPigs = unassignedResult?.success ? unassignedResult.data : []

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* @ts-ignore */}
      <MapClient initialData={hierarchy} initialUnassigned={unassignedPigs} />
    </div>
  )
}
