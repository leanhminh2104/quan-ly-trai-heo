// Bản quyền thuộc dalymmo.com
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import PendingApprovalClient from './pending-approval-client'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Chờ kích hoạt | Quản lý Trại Lợn Thông Minh',
  description: 'Tài khoản đang chờ phê duyệt',
}

export default async function PendingApprovalPage() {
  const sessionUser = await getSession()

  if (!sessionUser || !sessionUser.email) {
    redirect('/login')
  }

  return <PendingApprovalClient email={sessionUser.email} />
}
