// Bản quyền thuộc dalymmo.com
import RegisterClient from './register-client'
import { getGoogleLoginStatus } from '@/actions/security'

export default async function RegisterPage() {
  const isGoogleLoginEnabled = await getGoogleLoginStatus()
  return <RegisterClient googleLoginEnabled={isGoogleLoginEnabled} />
}
