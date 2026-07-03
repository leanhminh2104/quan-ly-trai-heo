// Bản quyền thuộc dalymmo.com
import { Mating, Pig, Farrowing } from '@prisma/client'

export interface MatingWithDetails extends Mating {
  sow?: Pig | null
  boar?: Pig | null
  farrowing?: Farrowing | null
  daysSinceMating?: number
}
