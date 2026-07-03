// Bản quyền thuộc dalymmo.com
'use client'

import { motion } from 'framer-motion'
import { Clock, ArrowLeft, LogOut } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { checkAccountStatus } from '@/actions/auth'

export default function PendingApprovalClient({ email }: { email: string }) {
  const router = useRouter()
  
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    const checkStatus = async () => {
      const res = await checkAccountStatus(email)
      if (res.success && res.isActive) {
        clearInterval(interval)
        router.push('/dashboard')
        router.refresh()
      }
    }

    interval = setInterval(checkStatus, 5000)

    return () => clearInterval(interval)
  }, [email, router])

  const handleLogout = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center space-y-8 p-8 rounded-2xl border bg-card shadow-lg"
      >
        <div className="mx-auto w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 rounded-full flex items-center justify-center relative">
          <Clock className="w-8 h-8" />
          <span className="absolute top-0 right-0 w-3 h-3 bg-amber-500 rounded-full animate-ping"></span>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-bold tracking-tight">Tài khoản chờ kích hoạt</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Tài khoản <span className="font-semibold text-foreground">{email}</span> đã được đăng ký thành công, nhưng cần sự phê duyệt từ Quản trị viên trước khi truy cập vào hệ thống.
          </p>
          <p className="text-muted-foreground text-sm font-medium">
            Vui lòng liên hệ Admin để được cấp quyền!
          </p>
        </div>

        <div className="pt-4 space-y-3">
          <Button variant="default" className="w-full" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Đăng xuất
          </Button>
          <Link href="/">
            <Button variant="ghost" className="w-full text-muted-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại trang chủ
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

