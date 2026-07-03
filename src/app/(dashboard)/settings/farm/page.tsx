// Bản quyền thuộc dalymmo.com
import { FarmInfoForm } from '@/components/settings/farm-info-form'

export default function FarmSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Trang trại</h3>
        <p className="text-sm text-muted-foreground">
          Quản lý thông tin và thành viên trang trại của bạn.
        </p>
      </div>
      <div className="border-t"></div>
      <FarmInfoForm />
    </div>
  )
}
