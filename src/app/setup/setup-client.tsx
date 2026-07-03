// Bản quyền thuộc dalymmo.com
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { setupSystemSchema, type SetupSystemInput } from '@/validators/setup'
import { setupSystem } from '@/actions/setup'
import { Building2, User, ArrowRight, ArrowLeft, CheckCircle2, Loader2, PiggyBank } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function SetupClient() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<SetupSystemInput>({
    resolver: zodResolver(setupSystemSchema),
  })

  const onNext = async () => {
    // Validate fields in step 1 before proceeding
    const isStep1Valid = await trigger(['adminName', 'email', 'password'])
    if (isStep1Valid) {
      setStep(2)
    }
  }

  const onSubmit = async (data: SetupSystemInput) => {
    setIsSubmitting(true)
    const result = await setupSystem(data)
    setIsSubmitting(false)

    if (result.success) {
      toast.success('Khởi tạo hệ thống thành công!', {
        description: 'Đang chuyển hướng vào hệ thống...'
      })
      router.push('/dashboard')
    } else {
      toast.error('Có lỗi xảy ra', {
        description: result.error
      })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="max-w-xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-100 text-emerald-600 rounded-full mb-4">
            <PiggyBank className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Chào mừng đến với PFMS</h1>
          <p className="text-muted-foreground mt-2">
            Hệ thống quản lý trại lợn thông minh chưa được khởi tạo. Vui lòng thiết lập tài khoản quản trị và thông tin trang trại đầu tiên.
          </p>
        </div>

        {/* Stepper indicator */}
        <div className="flex items-center justify-center mb-8 gap-2">
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
              step >= 1 ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-200 bg-transparent text-slate-400'
            }`}>
              <User className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium mt-2">Quản trị viên</span>
          </div>
          <div className={`w-16 h-1 rounded-full ${step >= 2 ? 'bg-emerald-600' : 'bg-slate-200'}`} />
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
              step >= 2 ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-200 bg-transparent text-slate-400'
            }`}>
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium mt-2">Trang trại</span>
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-border shadow-lg">
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="pt-6">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="adminName">Họ và tên</Label>
                      <Input id="adminName" placeholder="Nguyễn Văn A" {...register('adminName')} />
                      {errors.adminName && <p className="text-sm text-destructive">{errors.adminName.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email đăng nhập</Label>
                      <Input id="email" type="email" placeholder="admin@farm.vn" {...register('email')} />
                      {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Mật khẩu</Label>
                      <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
                      {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="farmCode">Mã trang trại</Label>
                        <Input id="farmCode" placeholder="FARM01" {...register('farmCode')} />
                        {errors.farmCode && <p className="text-sm text-destructive">{errors.farmCode.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="farmName">Tên trang trại</Label>
                        <Input id="farmName" placeholder="Trang trại Xanh" {...register('farmName')} />
                        {errors.farmName && <p className="text-sm text-destructive">{errors.farmName.message}</p>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại</Label>
                      <Input id="phone" placeholder="0987654321" {...register('phone')} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Địa chỉ</Label>
                      <Input id="address" placeholder="123 Đường X, Tỉnh Y" {...register('address')} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>

            <CardFooter className="flex justify-between border-t border-border p-6">
              {step === 2 ? (
                <Button type="button" variant="outline" onClick={() => setStep(1)} disabled={isSubmitting}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại
                </Button>
              ) : (
                <div /> // Spacer
              )}

              {step === 1 ? (
                <Button type="button" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={onNext}>
                  Tiếp tục
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  )}
                  Hoàn tất Cài đặt
                </Button>
              )}
            </CardFooter>
          </form>
        </Card>
        
        <p className="text-center text-[10px] text-muted-foreground mt-8">
          Bản quyền thuộc dalymmo.com
        </p>
      </div>
    </div>
  )
}
