// Bản quyền thuộc dalymmo.com
import { Metadata } from 'next'
import RolesClient from './roles-client'
import { getRoleMatrix } from '@/actions/role-matrix'

export const metadata: Metadata = {
  title: 'Phân quyền | PFMS',
  description: 'Quản lý vai trò và quyền hạn của thành viên',
}

export default async function RolesPage() {
  const res = await getRoleMatrix()
  const initialMatrix = res.success ? res.data : {}
  return <RolesClient initialMatrix={initialMatrix} />
}
