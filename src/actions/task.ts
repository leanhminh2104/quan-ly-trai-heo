'use server'
// Bản quyền thuộc dalymmo.com

import { prisma } from '@/lib/prisma'
import { ActionResponse, PaginatedResponse } from '@/types/common'
import { CreateTaskInput, UpdateTaskInput, QueryTaskInput, CompleteTaskInput, createTaskSchema, updateTaskSchema, queryTaskSchema, completeTaskSchema } from '@/validators/task'
import { TaskWithDetails } from '@/types/task'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth'
import { createAuditLogTx } from '@/lib/audit'
import { Prisma, TaskStatus } from '@prisma/client'

/**
 * Lấy danh sách công việc
 */
export async function getTasks(params: QueryTaskInput): Promise<ActionResponse<PaginatedResponse<TaskWithDetails>>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    const validated = queryTaskSchema.parse(params)
    const { page, pageSize, search, status, type, assignedToMe } = validated
    const skip = (page - 1) * pageSize

    // Tìm employeeId của user hiện tại nếu cần lọc theo assignedToMe
    let myEmployeeId: string | undefined = undefined
    if (assignedToMe) {
      // Tìm employee tương ứng với user trong farm này
      // PFMS design: FarmMember links User to Farm, Employee holds the farm staff.
      // Giả sử có link qua email hoặc phone. Tạm thời tìm employee có email khớp user.email
      const myEmployee = await prisma.employee.findFirst({
        where: { farmId: user.farmId, email: user.email, deletedAt: null }
      })
      if (myEmployee) {
        myEmployeeId = myEmployee.id
      } else {
        // Nếu không tìm thấy, trả về rỗng vì user này chưa được map vào employee nào
        return {
          success: true,
          data: { items: [], total: 0, page, pageSize, totalPages: 0 }
        }
      }
    }

    const where: Prisma.TaskWhereInput = {
      farmId: user.farmId,
      deletedAt: null,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(status && { status }),
      ...(type && { type }),
      ...(assignedToMe && myEmployeeId && {
        assignments: {
          some: { employeeId: myEmployeeId }
        }
      })
    }

    const total = await prisma.task.count({ where })
    const items = await prisma.task.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        assignments: {
          include: {
            employee: {
              select: { id: true, name: true, avatar: true }
            }
          }
        },
        completions: true,
      }
    })

    return {
      success: true,
      data: {
        items: items as TaskWithDetails[],
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      }
    }
  } catch (error) {
    console.error('Lỗi khi lấy danh sách công việc:', error)
    return { success: false, error: 'Có lỗi xảy ra' }
  }
}

/**
 * Tạo công việc mới
 */
export async function createTask(data: CreateTaskInput): Promise<ActionResponse<TaskWithDetails>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.farmId) return { success: false, error: 'Chưa đăng nhập hoặc chưa có trang trại' }

    const validated = createTaskSchema.parse(data)
    const { assignedTo, ...taskData } = validated

    const newTask = await prisma.$transaction(async (tx) => {
      const task = await tx.task.create({
        data: {
          ...taskData,
          farmId: user.farmId,
          createdBy: user.id,
          assignments: {
            create: assignedTo.map(empId => ({
              employeeId: empId
            }))
          }
        },
        include: {
          assignments: {
            include: { employee: { select: { id: true, name: true, avatar: true } } }
          },
          completions: true,
        }
      })

      await createAuditLogTx(tx, {
        action: 'CREATE',
        entity: 'TASK',
        entityId: task.id,
        farmId: user.farmId,
        userId: user.id,
        dataAfter: task,
        description: `Tạo công việc mới: ${task.title}`
      })

      return task
    })

    revalidatePath('/tasks')
    return { success: true, data: newTask as TaskWithDetails }
  } catch (error) {
    console.error('Lỗi tạo công việc:', error)
    return { success: false, error: 'Dữ liệu không hợp lệ hoặc có lỗi xảy ra' }
  }
}

/**
 * Hoàn thành công việc
 */
export async function completeTask(data: CompleteTaskInput): Promise<ActionResponse<boolean>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.farmId) return { success: false, error: 'Chưa đăng nhập hoặc chưa có trang trại' }

    const validated = completeTaskSchema.parse(data)

    await prisma.$transaction(async (tx) => {
      await tx.task.update({
        where: { id: validated.taskId, farmId: user.farmId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        }
      })

      await tx.taskCompletion.create({
        data: {
          taskId: validated.taskId,
          completedBy: user.name || user.email,
          notes: validated.notes,
          images: validated.images || []
        }
      })

      await createAuditLogTx(tx, {
        action: 'UPDATE',
        entity: 'TASK',
        entityId: validated.taskId,
        farmId: user.farmId,
        userId: user.id,
        description: `Hoàn thành công việc`
      })
    })

    revalidatePath('/tasks')
    return { success: true, data: true }
  } catch (error) {
    console.error('Lỗi cập nhật hoàn thành công việc:', error)
    return { success: false, error: 'Có lỗi xảy ra' }
  }
}

/**
 * Xóa công việc
 */
export async function deleteTask(id: string): Promise<ActionResponse<boolean>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.farmId) return { success: false, error: 'Chưa đăng nhập hoặc chưa có trang trại' }

    await prisma.$transaction(async (tx) => {
      const task = await tx.task.findFirst({
        where: { id, farmId: user.farmId }
      })
      if (!task) throw new Error('Không tìm thấy công việc')

      await tx.task.update({
        where: { id },
        data: { deletedAt: new Date() }
      })

      await createAuditLogTx(tx, {
        action: 'DELETE',
        entity: 'TASK',
        entityId: id,
        farmId: user.farmId,
        userId: user.id,
        description: `Xóa công việc: ${task.title}`
      })
    })

    revalidatePath('/tasks')
    return { success: true, data: true }
  } catch (error) {
    console.error('Lỗi xóa công việc:', error)
    return { success: false, error: 'Có lỗi xảy ra' }
  }
}
