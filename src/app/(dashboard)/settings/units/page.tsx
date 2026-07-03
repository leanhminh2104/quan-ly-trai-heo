// Bản quyền thuộc dalymmo.com
import { UnitsList } from '@/components/settings/units-list'

export default function UnitsSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Đơn vị tính</h3>
        <p className="text-sm text-muted-foreground">
          Cài đặt và quản lý đơn vị đo lường (kg, bao, lít...).
        </p>
      </div>
      <div className="border-t"></div>
      <UnitsList />
    </div>
  )
}
