// Bản quyền thuộc dalymmo.com
'use client'

import { useState, useTransition } from 'react'
import { updateGoogleLoginStatus, updateSystemParameter, updateEmailLoginStatus, updateAllowedDomains } from '@/actions/security'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/page-header'
import { CyberSwitch } from '@/components/ui/cyber-switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldCheck, Mail, Info, ExternalLink, Wrench, UserCheck, GlobeLock } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Props {
  initialGoogleLoginEnabled: boolean
  initialMaintenanceMode: boolean
  initialAutoActivate: boolean
  initialEmailLoginEnabled: boolean
  initialAllowedDomains: string
  initialDomainWhitelistEnabled: boolean
}

export default function SecurityClient({ initialGoogleLoginEnabled, initialMaintenanceMode, initialAutoActivate, initialEmailLoginEnabled, initialAllowedDomains, initialDomainWhitelistEnabled }: Props) {
  const [googleLoginEnabled, setGoogleLoginEnabled] = useState(initialGoogleLoginEnabled)
  const [emailLoginEnabled, setEmailLoginEnabled] = useState(initialEmailLoginEnabled)
  const [maintenanceMode, setMaintenanceMode] = useState(initialMaintenanceMode)
  const [autoActivate, setAutoActivate] = useState(initialAutoActivate)
  const [domainWhitelistEnabled, setDomainWhitelistEnabled] = useState(initialDomainWhitelistEnabled)
  const [allowedDomains, setAllowedDomains] = useState(initialAllowedDomains)
  const [isLoading, setIsLoading] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleToggleDomainWhitelist = async (checked: boolean) => {
    setIsLoading(true)
    const res = await updateSystemParameter('DOMAIN_WHITELIST_ENABLED', checked, 'Bật/tắt tính năng khóa tên miền')
    if (res.success) {
      setDomainWhitelistEnabled(checked)
      toast.success(checked ? 'Đã BẬT Khóa Tên Miền' : 'Đã TẮT Khóa Tên Miền')
    } else {
      toast.error(res.error || 'Có lỗi xảy ra')
      setDomainWhitelistEnabled(!checked)
    }
    setIsLoading(false)
  }

  const handleToggleGoogleLogin = async (checked: boolean) => {
    setIsLoading(true)
    const res = await updateGoogleLoginStatus(checked)
    if (res.success) {
      setGoogleLoginEnabled(checked)
      toast.success(checked ? 'Đã bật đăng nhập bằng Google' : 'Đã tắt đăng nhập bằng Google')
    } else {
      toast.error(res.error || 'Có lỗi xảy ra')
      setGoogleLoginEnabled(!checked)
    }
    setIsLoading(false)
  }

  const handleToggleMaintenance = async (checked: boolean) => {
    setIsLoading(true)
    const res = await updateSystemParameter('MAINTENANCE_MODE', checked, 'Chế độ bảo trì hệ thống')
    if (res.success) {
      setMaintenanceMode(checked)
      toast.success(checked ? 'Hệ thống đã chuyển sang Chế độ bảo trì' : 'Đã tắt Chế độ bảo trì')
    } else {
      toast.error(res.error || 'Có lỗi xảy ra')
      setMaintenanceMode(!checked)
    }
    setIsLoading(false)
  }

  const handleToggleAutoActivate = async (checked: boolean) => {
    setIsLoading(true)
    const res = await updateSystemParameter('AUTO_ACTIVATE_ACCOUNT', checked, 'Tự động kích hoạt tài khoản đăng ký mới')
    if (res.success) {
      setAutoActivate(checked)
      toast.success(checked ? 'Đã bật Tự động kích hoạt tài khoản' : 'Đã tắt Tự động kích hoạt tài khoản')
    } else {
      toast.error(res.error || 'Có lỗi xảy ra')
      setAutoActivate(!checked)
    }
    setIsLoading(false)
  }

  const handleToggleEmailLogin = async (checked: boolean) => {
    setIsLoading(true)
    const res = await updateEmailLoginStatus(checked)
    if (res.success) {
      setEmailLoginEnabled(checked)
      toast.success(checked ? 'Đã bật đăng nhập bằng Email/Mật khẩu' : 'Đã tắt đăng nhập bằng Email/Mật khẩu')
    } else {
      toast.error(res.error || 'Có lỗi xảy ra')
      setEmailLoginEnabled(!checked)
    }
    setIsLoading(false)
  }

  const handleSaveDomains = () => {
    startTransition(async () => {
      const res = await updateAllowedDomains(allowedDomains)
      if (res.success) {
        toast.success('Đã cập nhật danh sách tên miền')
      } else {
        toast.error(res.error || 'Có lỗi xảy ra')
      }
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Xác thực & Bảo mật"
        description="Cấu hình các phương thức đăng nhập và bảo mật cho hệ thống."
      />

      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500 rounded-lg">
              <Wrench className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base text-red-600 dark:text-red-500">Chế độ bảo trì (Maintenance Mode)</CardTitle>
              <CardDescription>
                Khi bật, chỉ Chủ trại (OWNER) mới có thể truy cập hệ thống. Các nhân viên khác sẽ thấy trang thông báo bảo trì.
              </CardDescription>
            </div>
            <CyberSwitch
              checked={maintenanceMode}
              disabled={isLoading}
              onCheckedChange={handleToggleMaintenance}
              className="data-[state=checked]:bg-red-600"
            />
          </CardHeader>
        </Card>

        <Card className="border-red-200 dark:border-red-900/50">
          <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500 rounded-lg mt-1">
              <GlobeLock className="w-6 h-6" />
            </div>
            <div className="flex-1 space-y-2">
              <CardTitle className="text-base text-red-600 dark:text-red-500">Khóa Tên Miền (Domain Whitelist)</CardTitle>
              <CardDescription>
                Chỉ cho phép truy cập từ các tên miền cụ thể. Ngăn chặn bị "chôm" tên miền từ người khác. Phân cách bằng dấu phẩy (Ví dụ: <code className="text-xs bg-muted px-1 rounded">traiheo.vn, dalymmo.com</code>). Bỏ trống để cho phép mọi tên miền.
              </CardDescription>
            </div>
            <CyberSwitch
              checked={domainWhitelistEnabled}
              disabled={isLoading}
              onCheckedChange={handleToggleDomainWhitelist}
            />
          </CardHeader>
          
          {domainWhitelistEnabled && (
            <CardContent className="pt-0">
              <div className="flex gap-2 items-center">
                <Input 
                  value={allowedDomains}
                  onChange={(e) => setAllowedDomains(e.target.value)}
                  placeholder="Nhập tên miền, ví dụ: traiheo.vn, dalymmo.com" 
                  className="flex-1"
                />
                <Button 
                  onClick={handleSaveDomains} 
                  disabled={isPending || allowedDomains === initialAllowedDomains}
                  variant="default"
                >
                  {isPending ? 'Đang lưu...' : 'Lưu tên miền'}
                </Button>
              </div>

              {allowedDomains.trim().length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {allowedDomains.split(',').map((domain, index) => {
                    const cleanDomain = domain.trim().toLowerCase()
                    if (!cleanDomain) return null
                    return (
                      <div key={index} className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm font-medium flex items-center gap-1.5">
                        <GlobeLock className="w-3.5 h-3.5" />
                        {cleanDomain}
                      </div>
                    )
                  })}
                </div>
              )}

              <Alert className="bg-red-50 text-red-800 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50 mt-4">
                <Info className="h-4 w-4" />
                <AlertTitle className="text-xs font-semibold">Cảnh báo cực kỳ quan trọng</AlertTitle>
                <AlertDescription className="text-xs mt-1">
                  Nếu bạn cấu hình sai hoặc quên điền tên miền đang dùng, <b>chính bạn sẽ bị khóa khỏi hệ thống</b>. Hãy chắc chắn đã điền đúng tên miền hiện tại (vd: <code className="bg-background px-1 rounded font-mono">localhost</code>).
                </AlertDescription>
              </Alert>
            </CardContent>
          )}
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-500 rounded-lg">
              <UserCheck className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base">Tự động duyệt tài khoản mới</CardTitle>
              <CardDescription>
                Tự động kích hoạt và cấp quyền "Người xem" cho các tài khoản vừa đăng ký mà không cần Admin phê duyệt.
              </CardDescription>
            </div>
            <CyberSwitch
              checked={autoActivate}
              disabled={isLoading}
              onCheckedChange={handleToggleAutoActivate}
            />
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-500 rounded-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base">Đăng nhập bằng Google</CardTitle>
              <CardDescription>
                Cho phép người dùng đăng nhập hoặc đăng ký bằng tài khoản Google. (Chỉ Admin mới có thể thay đổi)
              </CardDescription>
            </div>
            <CyberSwitch
              checked={googleLoginEnabled}
              disabled={isLoading}
              onCheckedChange={handleToggleGoogleLogin}
            />
          </CardHeader>
          <CardContent>
            {googleLoginEnabled && (
              <Alert className="bg-muted/50 mt-4">
                <Info className="h-4 w-4" />
                <AlertTitle className="text-lg font-semibold">Hướng dẫn chi tiết thiết lập Google Login</AlertTitle>
                <AlertDescription className="mt-4 space-y-4 text-sm text-muted-foreground">
                  <p>Hệ thống sử dụng Supabase Auth để xử lý đăng nhập. Bạn cần thiết lập trên cả Google Cloud và Supabase theo các bước sau:</p>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Bước 1: Tạo OAuth Client trên Google Cloud Console</h4>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Truy cập <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center font-medium">Google Cloud Console <ExternalLink className="w-3 h-3 ml-1" /></a>.</li>
                      <li>Ở menu cột trái, tìm mục <b>API và dịch vụ</b> (biểu tượng 3 thanh ngang) &gt; chọn <b>Thông tin xác thực</b> (Credentials).</li>
                      <li><i>(Nếu là dự án mới)</i> Bạn phải cấu hình <b>Màn hình xin phép bằng OAuth</b> trước: Chọn <b>Bên ngoài</b> (External), điền Tên ứng dụng, Email hỗ trợ rồi bấm Lưu/Tiếp tục cho đến hết.</li>
                      <li>Quay lại màn hình Thông tin xác thực, nhìn lên góc trên cùng bấm nút <b>+ TẠO THÔNG TIN XÁC THỰC</b> &gt; Chọn <b>ID ứng dụng khách OAuth</b>.</li>
                      <li>Chọn Loại ứng dụng là <b>Ứng dụng Web</b> và đặt Tên tùy ý.</li>
                      <li>Cuộn xuống mục <b>Các URI chuyển hướng được cho phép</b> (Authorized redirect URIs), bấm <b>+ Thêm URI</b> và dán chính xác đường link sau (không để thừa khoảng trắng):
                        <code className="block mt-1 p-2 bg-background border rounded-md text-xs text-primary select-all">
                          {process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/callback
                        </code>
                      </li>
                      <li>Bấm nút <b>Lưu/Tạo</b> ở cuối trang. Một bảng thông báo sẽ hiện ra chứa <b>Mã khách hàng (Client ID)</b> và <b>Mã bí mật (Client Secret)</b>. Nếu không thấy mã bí mật, hãy bấm <i>"Tải xuống ở định dạng JSON"</i> và mở file ra để lấy dòng <code>client_secret</code>.</li>
                    </ol>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Bước 2: Cấu hình trên Supabase</h4>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Truy cập <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center font-medium">Supabase Dashboard <ExternalLink className="w-3 h-3 ml-1" /></a>.</li>
                      <li>Chọn dự án của bạn &gt; Nhìn cột menu trái chọn <b>Authentication</b> &gt; <b>Providers</b>.</li>
                      <li>Tìm đến mục <b>Google</b> và bật công tắc <b>Enable Sign in with Google</b>.</li>
                      <li>Copy và Dán <b>Client ID</b> cùng <b>Client Secret</b> vừa lấy từ Google vào 2 ô tương ứng.</li>
                      <li>Cuộn xuống góc dưới cùng bên phải và bấm nút <b>Save</b> màu xanh.</li>
                    </ol>
                  </div>

                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-md">
                    <p className="font-medium text-amber-800 dark:text-amber-500 mb-1">⚠️ Xử lý lỗi thường gặp:</p>
                    <p className="text-amber-700 dark:text-amber-400">Nếu bạn gặp lỗi màn hình đen <b>Lỗi 400: redirect_uri_mismatch</b> khi bấm Đăng nhập, đó là do máy chủ Google chưa kịp cập nhật. Bạn chỉ cần pha một tách cà phê, <b>chờ khoảng 5-10 phút</b>, sau đó mở Tab Ẩn danh (Incognito Mode) và thử lại là sẽ thành công!</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500 rounded-lg">
              <Mail className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base">Đăng nhập bằng Email/Mật khẩu</CardTitle>
              <CardDescription>
                Phương thức đăng nhập cơ bản bằng Email và Mật khẩu. (Mặc định)
              </CardDescription>
            </div>
            <CyberSwitch
              checked={emailLoginEnabled}
              disabled={isLoading || (!emailLoginEnabled && !googleLoginEnabled)}
              onCheckedChange={handleToggleEmailLogin}
            />
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
