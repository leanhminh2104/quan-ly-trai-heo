// Bản quyền thuộc dalymmo.com
import { Metadata } from 'next'
import { ReportsClient } from './reports-client'

export const metadata: Metadata = {
  title: 'Báo cáo Thống kê | Quản lý Trại Lợn Thông Minh',
  description: 'Trang tổng quan báo cáo và thống kê',
}

export default function ReportsPage() {
  return <ReportsClient />
}
