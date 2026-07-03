// Bản quyền thuộc dalymmo.com
import { FeedStock, FeedType, MedicineStock, MedicineType } from '@prisma/client'

export interface FeedStockWithDetails extends FeedStock {
  feedType?: FeedType | null
}

export interface MedicineStockWithDetails extends MedicineStock {
  medicineType?: MedicineType | null
}
