// Bản quyền thuộc dalymmo.com
'use client'

import React, { useState, useEffect } from 'react'
import { getUsersAndRoles, updateMemberRole } from '@/actions/role'
import { updateRoleMatrix } from '@/actions/role-matrix'
import { toggleUserActivation } from '@/actions/user'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/page-header'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CyberSwitch } from '@/components/ui/cyber-switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle, Check, Save } from 'lucide-react'
import { UserRole } from '@prisma/client'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'

type UnifiedUser = {
  id: string
  memberId: string | null
  name: string | null
  email: string
  isActive: boolean
  role: UserRole | null
  createdAt: Date
}

const ROLE_LABELS: Record<UserRole, string> = {
  OWNER: 'Chủ trại (Toàn quyền)',
  MANAGER: 'Quản lý',
  VETERINARIAN: 'Bác sĩ thú y',
  WORKER: 'Công nhân',
  VIEWER: 'Người xem',
}

const PERMISSIONS_LIST = [
  { id: 'dashboard:view', name: 'Xem Dashboard', group: 'Dashboard' },
  { id: 'barn:view', name: 'Xem chuồng', group: 'Chuồng trại' },
  { id: 'barn:create', name: 'Thêm chuồng', group: 'Chuồng trại' },
  { id: 'barn:update', name: 'Sửa chuồng', group: 'Chuồng trại' },
  { id: 'barn:delete', name: 'Xóa chuồng', group: 'Chuồng trại' },
  { id: 'pig:view', name: 'Xem lợn', group: 'Lợn' },
  { id: 'pig:create', name: 'Thêm lợn', group: 'Lợn' },
  { id: 'pig:update', name: 'Sửa lợn', group: 'Lợn' },
  { id: 'pig:delete', name: 'Xóa lợn', group: 'Lợn' },
  { id: 'pig:move', name: 'Chuyển chuồng', group: 'Lợn' },
  { id: 'pig:weight', name: 'Cân lợn', group: 'Lợn' },
  { id: 'breeding:view', name: 'Xem sinh sản', group: 'Sinh sản' },
  { id: 'breeding:create', name: 'Tạo ghi nhận', group: 'Sinh sản' },
  { id: 'breeding:update', name: 'Cập nhật', group: 'Sinh sản' },
  { id: 'breeding:delete', name: 'Xóa ghi nhận', group: 'Sinh sản' },
  { id: 'health:view', name: 'Xem sức khỏe', group: 'Sức khỏe' },
  { id: 'health:create', name: 'Tạo phiếu', group: 'Sức khỏe' },
  { id: 'health:update', name: 'Cập nhật', group: 'Sức khỏe' },
  { id: 'health:delete', name: 'Xóa phiếu', group: 'Sức khỏe' },
  { id: 'inventory:view', name: 'Xem kho', group: 'Kho' },
  { id: 'inventory:create', name: 'Nhập xuất', group: 'Kho' },
  { id: 'inventory:update', name: 'Cập nhật', group: 'Kho' },
  { id: 'inventory:delete', name: 'Xóa phiếu', group: 'Kho' },
  { id: 'finance:view', name: 'Xem tài chính', group: 'Tài chính' },
  { id: 'finance:create', name: 'Tạo phiếu', group: 'Tài chính' },
  { id: 'finance:update', name: 'Cập nhật', group: 'Tài chính' },
  { id: 'finance:delete', name: 'Xóa phiếu', group: 'Tài chính' },
  { id: 'employee:view', name: 'Xem nhân viên', group: 'Nhân sự' },
  { id: 'employee:create', name: 'Thêm', group: 'Nhân sự' },
  { id: 'employee:update', name: 'Cập nhật', group: 'Nhân sự' },
  { id: 'employee:delete', name: 'Xóa', group: 'Nhân sự' },
  { id: 'task:view', name: 'Xem công việc', group: 'Công việc' },
  { id: 'task:create', name: 'Giao việc', group: 'Công việc' },
  { id: 'task:update', name: 'Cập nhật việc', group: 'Công việc' },
  { id: 'task:complete', name: 'Hoàn thành việc', group: 'Công việc' },
  { id: 'task:delete', name: 'Xóa việc', group: 'Công việc' },
  { id: 'report:view', name: 'Xem báo cáo', group: 'Báo cáo' },
  { id: 'report:export', name: 'Xuất báo cáo', group: 'Báo cáo' },
  { id: 'audit:view', name: 'Xem nhật ký', group: 'Hệ thống' },
  { id: 'settings:view', name: 'Xem cài đặt', group: 'Hệ thống' },
  { id: 'settings:update', name: 'Sửa cài đặt', group: 'Hệ thống' },
  { id: 'settings:categories', name: 'Quản lý DM', group: 'Hệ thống' },
  { id: 'settings:parameters', name: 'Tham số', group: 'Hệ thống' },
  { id: 'farm:update', name: 'Cập nhật trại', group: 'Hệ thống' },
  { id: 'farm:members', name: 'Thành viên', group: 'Hệ thống' },
]

export default function RolesClient({ initialMatrix = {} }: { initialMatrix?: Record<string, string[]> }) {
  const [users, setUsers] = useState<UnifiedUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  
  const [matrix, setMatrix] = useState<Record<string, string[]>>(initialMatrix)
  const [isSavingMatrix, setIsSavingMatrix] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    const res = await getUsersAndRoles()
    if (res.success && res.data) {
      setUsers(res.data)
    } else {
      toast.error(res.error || 'Lỗi tải dữ liệu')
    }
    setIsLoading(false)
  }

  const handleRoleChange = async (userId: string, memberId: string | null, newRole: UserRole) => {
    if (!memberId) {
      toast.error('Người dùng chưa được kích hoạt vào trang trại')
      return
    }
    setIsUpdating(memberId)
    const res = await updateMemberRole(memberId, newRole)
    
    if (res.success) {
      toast.success('Đã cập nhật phân quyền')
      setUsers(users.map(u => u.memberId === memberId ? { ...u, role: newRole } : u))
    } else {
      toast.error(res.error || 'Có lỗi xảy ra')
    }
    setIsUpdating(null)
  }

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    setIsUpdating(userId)
    const newStatus = !currentStatus
    const res = await toggleUserActivation(userId, newStatus)
    
    if (res.success) {
      toast.success(`Đã ${newStatus ? 'kích hoạt' : 'khóa'} tài khoản`)
      await fetchData()
    } else {
      toast.error(res.error || 'Có lỗi xảy ra')
    }
    setIsUpdating(null)
  }

  const handleSaveMatrix = async () => {
    setIsSavingMatrix(true)
    const res = await updateRoleMatrix(JSON.stringify(matrix))
    if (res.success) {
      toast.success('Lưu cấu hình phân quyền thành công')
    } else {
      toast.error(res.error || 'Lỗi khi lưu phân quyền')
    }
    setIsSavingMatrix(false)
  }

  const togglePermission = (permissionId: string, role: string) => {
    if (role === 'OWNER') return // Prevent OWNER from losing any permission
    
    setMatrix(prev => {
      const currentRoles = prev[permissionId] || []
      const newRoles = currentRoles.includes(role)
        ? currentRoles.filter(r => r !== role)
        : [...currentRoles, role]
      
      return {
        ...prev,
        [permissionId]: newRoles
      }
    })
  }

  const toggleGroupPermission = (groupPerms: typeof PERMISSIONS_LIST, role: string, forceState: boolean) => {
    if (role === 'OWNER') return
    setMatrix(prev => {
      const next = { ...prev }
      groupPerms.forEach(perm => {
        const currentRoles = next[perm.id] || []
        if (forceState && !currentRoles.includes(role)) {
          next[perm.id] = [...currentRoles, role]
        } else if (!forceState && currentRoles.includes(role)) {
          next[perm.id] = currentRoles.filter(r => r !== role)
        }
      })
      return next
    })
  }

  // Group permissions for table rendering
  const permissionGroups = PERMISSIONS_LIST.reduce((acc, perm) => {
    if (!acc[perm.group]) acc[perm.group] = []
    acc[perm.group].push(perm)
    return acc
  }, {} as Record<string, typeof PERMISSIONS_LIST>)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tài khoản & Phân quyền"
        description="Duyệt tài khoản mới, gán vai trò và giới hạn quyền truy cập cho nhân viên."
      />

      <Tabs defaultValue="accounts" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="accounts">Danh sách tài khoản</TabsTrigger>
          <TabsTrigger value="roles">Cấu hình phân quyền (Role)</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lưu ý về Tài khoản</AlertTitle>
            <AlertDescription>
              - <b>Chủ trại (OWNER)</b>: Có toàn quyền hệ thống, thay đổi cài đặt và quản lý phân quyền.<br/>
              - Xem chi tiết và thiết lập quyền hạn cho từng chức danh tại tab <b>Cấu hình phân quyền (Role)</b>.
            </AlertDescription>
          </Alert>

          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nhân viên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Kích hoạt</TableHead>
                  <TableHead>Vai trò hiện tại</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Chưa có tài khoản nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.name || 'Chưa cập nhật'}
                        {!user.isActive && (
                          <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                            Chưa duyệt
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <CyberSwitch
                          disabled={isUpdating === user.id}
                          checked={user.isActive}
                          onCheckedChange={() => handleToggleActive(user.id, user.isActive)}
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          disabled={!user.isActive || !user.memberId || isUpdating === user.memberId}
                          value={user.role || ''}
                          onValueChange={(val) => handleRoleChange(user.id, user.memberId, val as UserRole)}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder={user.isActive ? "Chọn vai trò" : "Chưa kích hoạt"}>
                              {user.role ? ROLE_LABELS[user.role] : ''}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(ROLE_LABELS).map(([roleValue, roleLabel]) => (
                              <SelectItem key={roleValue} value={roleValue}>
                                {roleLabel}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <div className="rounded-md border bg-card flex flex-col">
            <div className="p-4 bg-muted/30 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
               <div>
                  <h3 className="font-semibold text-lg">Bảng Phân Quyền Chi Tiết (Role Matrix)</h3>
                  <p className="text-sm text-muted-foreground">Tùy chỉnh quyền hạn truy cập của từng vai trò trong hệ thống.</p>
               </div>
               <Button onClick={handleSaveMatrix} disabled={isSavingMatrix}>
                  {isSavingMatrix ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Lưu cấu hình
                </Button>
            </div>
            
            <div className="flex-1 overflow-x-auto">
              <Table>
                <TableHeader className="bg-background">
                  <TableRow>
                    <TableHead className="min-w-[200px]">Chức năng</TableHead>
                    {Object.entries(ROLE_LABELS).map(([role, label]) => (
                      <TableHead key={role} className="text-center min-w-[120px]">{label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(permissionGroups).map(([group, perms]) => (
                    <React.Fragment key={group}>
                      <TableRow className="bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 border-t-2">
                        <TableCell colSpan={1} className="font-semibold text-emerald-700 dark:text-emerald-400 py-3 uppercase tracking-wider text-xs">
                          {group}
                        </TableCell>
                        {Object.keys(ROLE_LABELS).map(role => {
                          if (role === 'OWNER') {
                            return <TableCell key={role} className="text-center py-3"></TableCell>
                          }
                          const allChecked = perms.every(p => (matrix[p.id] || []).includes(role))
                          return (
                            <TableCell key={role} className="text-center py-3">
                              <div className="flex justify-center items-center gap-2">
                                <Checkbox
                                  checked={allChecked}
                                  onCheckedChange={(checked) => toggleGroupPermission(perms, role, checked === true)}
                                  className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                                />
                              </div>
                            </TableCell>
                          )
                        })}
                      </TableRow>
                      {perms.map((perm, idx) => (
                        <TableRow key={perm.id} className={idx === perms.length - 1 ? 'border-b-2' : ''}>
                          <TableCell className="pl-6 text-sm text-muted-foreground">{perm.name}</TableCell>
                          {Object.keys(ROLE_LABELS).map(role => {
                            const hasPerm = (matrix[perm.id] || []).includes(role)
                            if (role === 'OWNER') {
                              return (
                                <TableCell key={role} className="text-center">
                                  <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                  </div>
                                </TableCell>
                              )
                            }
                            return (
                              <TableCell key={role} className="text-center">
                                <div className="flex justify-center">
                                  <Checkbox
                                    checked={hasPerm}
                                    onCheckedChange={() => togglePermission(perm.id, role)}
                                    className="w-5 h-5"
                                  />
                                </div>
                              </TableCell>
                            )
                          })}
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
