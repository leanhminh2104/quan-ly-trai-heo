// Bản quyền thuộc dalymmo.com
import { Metadata } from 'next'
import SecurityClient from './security-client'
import { getGoogleLoginStatus, getSystemParameter, getEmailLoginStatus } from '@/actions/security'

export const metadata: Metadata = {
  title: 'Xác thực & Bảo mật | PFMS',
  description: 'Cài đặt xác thực và bảo mật hệ thống',
}

export default async function SecurityPage() {
  const isGoogleLoginEnabled = await getGoogleLoginStatus()
  const isMaintenanceMode = await getSystemParameter('MAINTENANCE_MODE')
  const isAutoActivate = await getSystemParameter('AUTO_ACTIVATE_ACCOUNT')
  const isEmailLoginEnabled = await getEmailLoginStatus()
  
  return (
    <SecurityClient 
      initialGoogleLoginEnabled={isGoogleLoginEnabled} 
      initialMaintenanceMode={isMaintenanceMode}
      initialAutoActivate={isAutoActivate}
      initialEmailLoginEnabled={isEmailLoginEnabled}
    />
  )
}
