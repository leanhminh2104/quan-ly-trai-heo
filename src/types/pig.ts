// Bản quyền thuộc dalymmo.com
import { Pig, Breed, Pen, Barn, BarnRow, BarnZone } from '@prisma/client'

export interface PigWithDetails extends Pig {
  breed?: Breed | null
  pen?: (Pen & {
    barn?: Barn & {
      row?: BarnRow & {
        zone?: BarnZone
      }
    }
  }) | null
  ageInDays?: number
}
