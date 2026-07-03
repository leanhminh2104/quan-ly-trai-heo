// Bản quyền thuộc dalymmo.com
import { CategoriesList } from '@/components/settings/categories-list'

export default function CategoriesSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Danh mục</h3>
        <p className="text-sm text-muted-foreground">
          Cài đặt và phân loại dữ liệu hệ thống.
        </p>
      </div>
      <div className="border-t"></div>
      <CategoriesList />
    </div>
  )
}
