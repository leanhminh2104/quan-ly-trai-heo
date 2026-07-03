// Bản quyền thuộc dalymmo.com
import { z } from 'zod'
import { TaskType, TaskStatus } from '@prisma/client'

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tiêu đề công việc'),
  type: z.nativeEnum(TaskType, { message: 'Vui lòng chọn loại công việc' }),
  description: z.string().optional().nullable(),
  priority: z.coerce.number().int().min(0).max(5).default(0),
  dueDate: z.date().optional().nullable(),
  assignedTo: z.array(z.string()).min(1, 'Vui lòng chọn ít nhất 1 người thực hiện'),
  notes: z.string().optional().nullable(),
  penId: z.string().optional().nullable(),
  pigId: z.string().optional().nullable(),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>

export const updateTaskSchema = createTaskSchema.extend({
  status: z.nativeEnum(TaskStatus).optional(),
}).partial()

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>

export const completeTaskSchema = z.object({
  taskId: z.string(),
  notes: z.string().optional().nullable(),
  images: z.array(z.string()).optional(),
})

export type CompleteTaskInput = z.infer<typeof completeTaskSchema>

export const queryTaskSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).default(10),
  search: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  type: z.nativeEnum(TaskType).optional(),
  assignedToMe: z.boolean().optional(),
})

export type QueryTaskInput = z.infer<typeof queryTaskSchema>
