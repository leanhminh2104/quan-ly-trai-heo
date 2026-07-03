// Bản quyền thuộc dalymmo.com
import { Metadata } from 'next'
import { TasksClient } from './tasks-client'

export const metadata: Metadata = {
  title: 'Công việc | Quản lý Trại Lợn Thông Minh',
  description: 'Quản lý, phân công và theo dõi công việc',
}

export default function TasksPage() {
  return <TasksClient />
}
