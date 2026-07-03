// Bản quyền thuộc dalymmo.com
import { Employee } from '@prisma/client'

export interface EmployeeWithDetails extends Employee {
  // If we fetch assigned zone details later
  assignedZoneName?: string | null
}
