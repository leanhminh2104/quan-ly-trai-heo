'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'

import { useRouter } from 'next/navigation'

import { login, loginWithGoogle } from '@/actions/auth'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export default function LoginClient({ googleLoginEnabled = true, emailLoginEnabled = true }: { googleLoginEnabled?: boolean, emailLoginEnabled?: boolean }) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)
    
    const result = await login(formData)
    
    setIsLoading(false)
    
    if (result.success) {
      toast.success('Đăng nhập thành công')
      router.push('/dashboard')
    } else {
      toast.error(result.error || 'Có lỗi xảy ra')
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const origin = window.location.origin
      const result = await loginWithGoogle(`${origin}/auth/callback`)
      if (result.success && result.url) {
        window.location.href = result.url
      } else {
        toast.error(result.error || 'Lỗi khi kết nối với Google')
      }
    } catch (error) {
      toast.error('Lỗi khi đăng nhập Google')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoLTZ2LTZoNnptMC0zMHY2aC02VjRoNnptMjAgMjB2NmgtNnYtNmg2em0wLTIwdjZoLTZWNGg2em0tNDAgMjB2NmgtNnYtNmg2em0wLTIwdjZoLTZWNGg2eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-6xl mb-6">🐷</div>
            <h1 className="text-4xl font-bold mb-4">
              Quản Lý Trại Lợn<br />Thông Minh
            </h1>
            <p className="text-lg text-white/80 mb-8 max-w-md">
              Hệ thống quản lý toàn diện giúp bạn theo dõi đàn lợn, sinh sản, 
              kho vật tư, tài chính và mọi hoạt động của trang trại.
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-sm">
              {[
                { emoji: '📊', text: 'Báo cáo thông minh' },
                { emoji: '🏥', text: 'Quản lý sức khỏe' },
                { emoji: '💰', text: 'Theo dõi tài chính' },
                { emoji: '📱', text: 'Thao tác nhanh 3 click' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-2 text-sm text-white/90"
                >
                  <span>{item.emoji}</span>
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side - login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center">
            <div className="text-5xl mb-2">🐷</div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
              PFMS
            </h1>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Đăng nhập</h2>
            <p className="text-muted-foreground">
              {emailLoginEnabled ? 'Nhập thông tin tài khoản để truy cập hệ thống' : 'Bạn chỉ có thể đăng nhập bằng tài khoản Google'}
            </p>
          </div>

          {emailLoginEnabled ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    placeholder="admin@farm.vn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-11 rounded-lg border border-input bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full h-11 rounded-lg border border-input bg-background pl-10 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 text-white font-medium text-sm hover:from-emerald-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/25"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                ) : (
                  'Đăng nhập'
                )}
              </button>
            </form>
          ) : (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg text-amber-800 dark:text-amber-500 text-sm text-center">
              Quản trị viên đã tắt tính năng đăng nhập bằng Email và Mật khẩu. Vui lòng sử dụng Đăng nhập bằng Google.
            </div>
          )}

          {googleLoginEnabled && (
            <div className="space-y-4 pt-2">
              {emailLoginEnabled && (
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Hoặc tiếp tục với
                    </span>
                  </div>
                </div>
              )}

              <Button 
                type="button" 
                variant="outline" 
                className="w-full h-11"
                onClick={handleGoogleLogin}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Đăng nhập với Google
              </Button>
            </div>
          )}

          {/* Register link */}
          <p className="text-center text-sm text-muted-foreground">
            Chưa có tài khoản?{' '}
            <Link
              href="/register"
              className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 transition-colors"
            >
              Đăng ký ngay
            </Link>
          </p>
          
          {/* Copyright */}
          <p className="text-center text-[10px] text-muted-foreground pt-4">
            Bản quyền thuộc dalymmo.com
          </p>
        </motion.div>
      </div>
    </div>
  )
}
