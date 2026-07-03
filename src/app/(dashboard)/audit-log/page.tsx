// Bản quyền thuộc dalymmo.com
import { Metadata } from 'next'
import { AuditLogClient } from './audit-log-client'

export const metadata: Metadata = {
  title: 'Nhật ký Hệ thống | Quản lý Trại Lợn Thông Minh',
  description: 'Tra cứu và theo dõi lịch sử thao tác của người dùng',
}

export default function AuditLogPage() {
  return <AuditLogClient />
}
