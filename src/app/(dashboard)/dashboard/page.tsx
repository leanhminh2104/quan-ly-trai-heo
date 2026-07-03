// Bản quyền thuộc dalymmo.com
import { Metadata } from 'next'
import { DashboardClient } from './dashboard-client'

export const metadata: Metadata = {
  title: 'Tổng quan | Quản lý Trại Lợn Thông Minh',
  description: 'Trang tổng quan hệ thống',
}

export default function DashboardPage() {
  return <DashboardClient />
}
