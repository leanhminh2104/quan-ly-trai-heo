// Bản quyền thuộc dalymmo.com
import { Metadata } from 'next'
import SecurityClient from './security-client'
import { getGoogleLoginStatus, getSystemParameter, getEmailLoginStatus, getAllowedDomains, getDomainWhitelistStatus } from '@/actions/security'

export const metadata: Metadata = {
  title: 'Xác thực & Bảo mật | PFMS',
  description: 'Cài đặt xác thực và bảo mật hệ thống',
}

export default async function SecurityPage() {
  const [googleLoginEnabled, maintenanceMode, autoActivate, emailLoginEnabled, allowedDomains, domainWhitelistEnabled] = await Promise.all([
    getGoogleLoginStatus(),
    getSystemParameter('MAINTENANCE_MODE'),
    getSystemParameter('AUTO_ACTIVATE_ACCOUNT'),
    getEmailLoginStatus(),
    getAllowedDomains(),
    getDomainWhitelistStatus(),
  ])

  return (
    <SecurityClient
      initialGoogleLoginEnabled={googleLoginEnabled}
      initialMaintenanceMode={maintenanceMode}
      initialAutoActivate={autoActivate}
      initialEmailLoginEnabled={emailLoginEnabled}
      initialAllowedDomains={allowedDomains}
      initialDomainWhitelistEnabled={domainWhitelistEnabled}
    />
  )
}
