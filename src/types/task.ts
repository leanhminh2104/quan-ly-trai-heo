// Bản quyền thuộc dalymmo.com
import { Task, TaskAssignment, TaskCompletion, Employee } from '@prisma/client'

export interface TaskAssignmentWithEmployee extends TaskAssignment {
  employee: Pick<Employee, 'id' | 'name' | 'avatar'>
}

export interface TaskCompletionWithDetails extends TaskCompletion {
  completedByName?: string
}

export interface TaskWithDetails extends Task {
  assignments: TaskAssignmentWithEmployee[]
  completions: TaskCompletionWithDetails[]
}
