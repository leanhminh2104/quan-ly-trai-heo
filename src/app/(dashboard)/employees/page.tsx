// Bản quyền thuộc dalymmo.com
import { Metadata } from 'next'
import EmployeesClient from './employees-client'

export const metadata: Metadata = {
  title: 'Quản lý nhân sự | PFMS',
  description: 'Quản lý danh sách nhân viên, công nhân tại trang trại',
}

export default function EmployeesPage() {
  return <EmployeesClient />
}
