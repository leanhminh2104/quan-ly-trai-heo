// Bản quyền thuộc dalymmo.com
import { Metadata } from 'next'
import { getPigDetails } from '@/actions/pig'
import { notFound } from 'next/navigation'
import PigDetailsClient from './pig-details-client'

export const metadata: Metadata = {
  title: 'Chi tiết lợn | PFMS',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PigDetailsPage({ params }: PageProps) {
  const { id } = await params
  const result = await getPigDetails(id)

  if (!result.success || !result.data) {
    notFound()
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* @ts-ignore */}
      <PigDetailsClient initialData={result.data} />
    </div>
  )
}
