// Bản quyền thuộc dalymmo.com
import { Vaccination, Treatment, Pig, VaccineType, MedicineType } from '@prisma/client'

export interface VaccinationWithDetails extends Vaccination {
  pig?: Pig | null
  vaccineType?: VaccineType | null
}

export interface TreatmentWithDetails extends Treatment {
  pig?: Pig | null
  medicineType?: MedicineType | null
}
