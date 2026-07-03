import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import LoginClient from './login-client'
import { getGoogleLoginStatus, getEmailLoginStatus } from '@/actions/security'

export default async function LoginPage() {
  // Check if system is initialized
  let shouldRedirect = false
  try {
    const existingUsers = await prisma.user.count()
    if (existingUsers === 0) {
      shouldRedirect = true
    }
  } catch (error) {
    console.error('Error checking setup status:', error)
  }

  if (shouldRedirect) {
    redirect('/setup')
  }

  const googleLoginEnabled = await getGoogleLoginStatus()
  const emailLoginEnabled = await getEmailLoginStatus()

  return <LoginClient googleLoginEnabled={googleLoginEnabled} emailLoginEnabled={emailLoginEnabled} />
}
