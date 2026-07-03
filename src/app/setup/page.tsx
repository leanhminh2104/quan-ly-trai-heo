import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import SetupClient from './setup-client'

export default async function SetupPage() {
  // Check if system is already initialized
  let shouldRedirect = false
  try {
    const existingUsers = await prisma.user.count()
    if (existingUsers > 0) {
      shouldRedirect = true
    }
  } catch (error) {
    console.error('Error checking setup status:', error)
  }

  if (shouldRedirect) {
    redirect('/login')
  }

  return <SetupClient />
}
