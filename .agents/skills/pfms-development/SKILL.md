---
name: pfms-development
description: |
  Comprehensive development skill for the Pig Farm Management System (PFMS).
  Use this skill for ALL development tasks related to the PFMS project including:
  - Creating or modifying any module (pigs, barns, breeding, inventory, finance, etc.)
  - Database schema changes or Prisma operations
  - UI component development with shadcn/ui + TailwindCSS
  - Authentication and authorization (RBAC)
  - Server Actions and API Routes
  - Audit logging
  - Report generation and data export
  This skill MUST be consulted before writing any code in this project.
---

# PFMS Development Skill

## 1. Technology Stack (MANDATORY)

All code MUST use these exact technologies. Do NOT substitute or add alternatives.

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js | 15 |
| UI Library | React | 19 |
| Language | TypeScript | strict mode |
| Styling | TailwindCSS | latest |
| Components | shadcn/ui | latest |
| Animation | Framer Motion | latest |
| Forms | React Hook Form + Zod | latest |
| Tables | TanStack Table | latest |
| Data Fetching | TanStack Query | latest |
| Charts | Recharts | latest |
| Drag & Drop | dnd-kit | latest |
| ORM | Prisma | latest |
| Database | Supabase PostgreSQL | free tier |
| Auth | Supabase Auth | Email + Google |
| Storage | Supabase Storage | free tier |
| Export PDF | jsPDF | latest |
| Export Excel | SheetJS (xlsx) | latest |
| PWA | next-pwa | latest |

---

## 2. Architecture Rules

### 2.1 App Router Only
- Use Next.js App Router exclusively
- NO Pages Router
- NO Express server
- API logic goes in: `src/app/api/` (API Routes) or `src/actions/` (Server Actions)

### 2.2 Domain Driven Design
- Each module is independent: pig, barn, breeding, health, inventory, finance, employee, task
- Modules communicate only through foreign keys in the database
- Each module has its own: types, actions, components, hooks, validators

### 2.3 File Organization
```
src/
├── app/           # Pages and layouts (App Router)
├── components/    # UI components (organized by domain)
├── hooks/         # Custom React hooks
├── lib/           # Utilities, helpers, configs
├── actions/       # Server Actions (mutations)
├── types/         # TypeScript type definitions
├── validators/    # Zod validation schemas
└── middleware.ts  # Auth + RBAC middleware
```

---

## 3. Database Rules (CRITICAL)

### 3.1 Never Delete Data
```typescript
// ❌ NEVER DO THIS
await prisma.pig.delete({ where: { id } })

// ✅ ALWAYS DO THIS (Soft Delete)
await prisma.pig.update({
  where: { id },
  data: { 
    status: 'INACTIVE',
    deletedAt: new Date() 
  }
})
```

### 3.2 Always Log Changes (Audit Log)
Every create, update, or status change MUST be logged:

```typescript
import { createAuditLog } from '@/lib/audit'

// After any mutation:
await createAuditLog({
  farmId,
  userId,
  action: 'UPDATE',
  entity: 'PIG',
  entityId: pig.id,
  dataBefore: JSON.stringify(oldData),
  dataAfter: JSON.stringify(newData),
  ipAddress: request.headers.get('x-forwarded-for'),
  userAgent: request.headers.get('user-agent'),
})
```

### 3.3 Multi-Tenant Queries
EVERY database query MUST filter by `farmId`:

```typescript
// ❌ DANGEROUS - leaks data across farms
const pigs = await prisma.pig.findMany()

// ✅ CORRECT - scoped to current farm
const pigs = await prisma.pig.findMany({
  where: { farmId: currentFarmId }
})
```

### 3.4 Prisma Best Practices
- Use `prisma.$transaction()` for multi-step operations
- Use `include` and `select` to optimize queries
- Always handle errors with try/catch
- Use Prisma middleware for automatic audit logging when possible

### 3.5 Common Fields
Every business entity table MUST have:
```prisma
model Example {
  id        String   @id @default(cuid())
  farmId    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?
  createdBy String
  updatedBy String?
  notes     String?
  // ... entity-specific fields
}
```

---

## 4. Authentication & Authorization

### 4.1 Auth Flow
```
Browser → Supabase Auth → JWT → Next.js Middleware → Verify → Allow/Deny
```

### 4.2 RBAC Roles
| Role | Level | Description |
|------|-------|-------------|
| `OWNER` | 5 | Full access, all settings |
| `MANAGER` | 4 | Manage everything except admin settings |
| `VETERINARIAN` | 3 | Health, breeding, limited pig management |
| `WORKER` | 2 | Update tasks, limited pig data |
| `VIEWER` | 1 | Read-only access |

### 4.3 Permission Check Pattern
```typescript
import { checkPermission } from '@/lib/rbac'

// In Server Action:
export async function updatePig(data: PigUpdateInput) {
  const session = await getSession()
  await checkPermission(session.userId, session.farmId, 'pig:update')
  // ... proceed with update
}

// In Component (hide UI elements):
{hasPermission('pig:update') && <EditButton />}
```

---

## 5. Server Actions Pattern

### 5.1 Structure
```typescript
// src/actions/pig.ts
'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'
import { checkPermission } from '@/lib/rbac'
import { pigCreateSchema } from '@/validators/pig'
import { getSession } from '@/lib/auth'

export async function createPig(formData: FormData) {
  // 1. Auth check
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  
  // 2. Permission check
  await checkPermission(session.userId, session.farmId, 'pig:create')
  
  // 3. Validate input
  const validated = pigCreateSchema.safeParse(Object.fromEntries(formData))
  if (!validated.success) {
    return { error: validated.error.flatten() }
  }
  
  // 4. Execute in transaction
  const pig = await prisma.$transaction(async (tx) => {
    const newPig = await tx.pig.create({
      data: {
        ...validated.data,
        farmId: session.farmId,
        createdBy: session.userId,
      }
    })
    
    // 5. Audit log
    await createAuditLog({
      farmId: session.farmId,
      userId: session.userId,
      action: 'CREATE',
      entity: 'PIG',
      entityId: newPig.id,
      dataAfter: JSON.stringify(newPig),
    })
    
    return newPig
  })
  
  // 6. Revalidate cache
  revalidatePath('/pigs')
  
  return { success: true, data: pig }
}
```

---

## 6. Component Patterns

### 6.1 Page Component
```tsx
// src/app/(dashboard)/pigs/page.tsx
import { Suspense } from 'react'
import { PigList } from '@/components/pig/pig-list'
import { PigListSkeleton } from '@/components/pig/pig-list-skeleton'
import { PageHeader } from '@/components/layout/page-header'

export default function PigsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý đàn lợn"
        description="Theo dõi và quản lý toàn bộ đàn lợn"
        action={{ label: "Thêm lợn", href: "/pigs/new" }}
      />
      <Suspense fallback={<PigListSkeleton />}>
        <PigList />
      </Suspense>
    </div>
  )
}
```

### 6.2 Form Component
```tsx
// Always use React Hook Form + Zod
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { pigCreateSchema, type PigCreateInput } from '@/validators/pig'

export function PigForm() {
  const form = useForm<PigCreateInput>({
    resolver: zodResolver(pigCreateSchema),
    defaultValues: { /* ... */ }
  })
  
  // Use shadcn/ui Form components
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* FormField, FormItem, FormLabel, FormControl, FormMessage */}
      </form>
    </Form>
  )
}
```

### 6.3 Data Table
```tsx
// Always use TanStack Table with the shared DataTable component
import { DataTable } from '@/components/shared/data-table'
import { columns } from './columns'

export function PigList({ data }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="name"
      filterOptions={[
        { key: 'status', label: 'Trạng thái', options: [...] },
        { key: 'type', label: 'Loại', options: [...] },
      ]}
      exportFileName="danh-sach-lon"
    />
  )
}
```

---

## 7. Validation (Zod Schemas)

### 7.1 Pattern
```typescript
// src/validators/pig.ts
import { z } from 'zod'

export const pigCreateSchema = z.object({
  code: z.string().min(1, 'Mã lợn không được trống'),
  name: z.string().optional(),
  earTag: z.string().optional(),
  breedId: z.string().min(1, 'Chọn giống'),
  gender: z.enum(['MALE', 'FEMALE']),
  birthDate: z.coerce.date().optional(),
  importDate: z.coerce.date(),
  weight: z.coerce.number().positive('Cân nặng phải > 0').optional(),
  penId: z.string().optional(),
  type: z.enum(['SOW', 'BOAR', 'GILT', 'FATTENING', 'PIGLET']),
  notes: z.string().optional(),
})

export type PigCreateInput = z.infer<typeof pigCreateSchema>
```

### 7.2 Rules
- Define schemas in `src/validators/`
- Use `z.coerce` for form data (strings → numbers/dates)
- Vietnamese error messages
- Export both schema and inferred type
- Reuse schemas between client and server

---

## 8. UI/UX Rules

### 8.1 Language
- ALL UI text in **Vietnamese**
- Variable names and code in **English**
- Comments can be in English or Vietnamese

### 8.2 Design System
- Use shadcn/ui components as the base
- Dark mode support (via `next-themes`)
- Consistent spacing: use Tailwind spacing scale
- Color coding for statuses:
  - 🟢 Green: Active, Healthy, Completed
  - 🟡 Yellow: Warning, Pending
  - 🔴 Red: Critical, Dead, Overdue
  - 🔵 Blue: Info, In Progress
  - ⚫ Gray: Inactive, Archived

### 8.3 Responsive Design
- Mobile-first approach
- Sidebar collapses on mobile
- Tables scroll horizontally on small screens
- Forms stack vertically on mobile
- Touch-friendly button sizes (min 44px)

### 8.4 Quick Action Principle
- Maximum **3 clicks** to complete any field update
- Use Drawers for quick edits (don't navigate away)
- Inline editing where possible
- Keyboard shortcuts for power users

### 8.5 Animation
```tsx
// Use Framer Motion for:
import { motion, AnimatePresence } from 'framer-motion'

// Page transitions
// Card hover effects
// Drawer open/close
// List item add/remove
// Progress bar animations
// Chart animations
```

---

## 9. Automatic Schedule Calculations

When a mating event is recorded, automatically calculate:

```typescript
// src/lib/schedule.ts
export function calculateBreedingSchedule(matingDate: Date, params: SystemParams) {
  return {
    ultrasoundDate: addDays(matingDate, params.ultrasoundDays ?? 28),
    expectedFarrowingDate: addDays(matingDate, params.gestationDays ?? 114),
    moveToFarrowingDate: addDays(matingDate, (params.gestationDays ?? 114) - 7),
    expectedWeaningDate: addDays(
      addDays(matingDate, params.gestationDays ?? 114),
      params.weaningDays ?? 28
    ),
  }
}
```

---

## 10. Export Patterns

### 10.1 Excel Export
```typescript
import * as XLSX from 'xlsx'

export function exportToExcel(data: any[], filename: string) {
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Data')
  XLSX.writeFile(wb, `${filename}.xlsx`)
}
```

### 10.2 PDF Export
```typescript
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export function exportToPDF(data: any[], columns: string[], filename: string) {
  const doc = new jsPDF()
  doc.autoTable({
    head: [columns],
    body: data,
  })
  doc.save(`${filename}.pdf`)
}
```

---

## 11. Error Handling

### 11.1 Server Actions
```typescript
export async function createPig(data: PigCreateInput) {
  try {
    // ... logic
    return { success: true, data: result }
  } catch (error) {
    console.error('[PIG_CREATE]', error)
    return { 
      error: error instanceof Error ? error.message : 'Đã có lỗi xảy ra' 
    }
  }
}
```

### 11.2 Client Error Handling
```tsx
// Use toast notifications for user feedback
import { toast } from 'sonner'

const result = await createPig(data)
if (result.error) {
  toast.error('Lỗi', { description: result.error })
} else {
  toast.success('Thành công', { description: 'Đã thêm lợn mới' })
}
```

---

## 12. File Upload Pattern

```typescript
// src/lib/upload.ts
import { createClient } from '@supabase/supabase-js'

export async function uploadFile(
  file: File, 
  bucket: string, 
  path: string
): Promise<string> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const fileName = `${path}/${Date.now()}-${file.name}`
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file)
  
  if (error) throw error
  
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)
  
  return publicUrl
}
```

---

## 13. Notification System

### Types of notifications:
1. **Cám sắp hết** → Warning when feed stock < threshold
2. **Thuốc sắp hết** → Warning when medicine stock low
3. **Tinh sắp hết hạn** → Warning when semen nearing expiry
4. **Vaccine sắp hết** → Warning when vaccine stock low
5. **Lợn sắp đẻ** → Alert 7 days before expected farrowing
6. **Lợn tới lịch tiêm** → Schedule reminder
7. **Lợn cần phối** → Estrus detection reminder
8. **Chuồng chưa vệ sinh** → Cleaning overdue

### Implementation:
- Compute on dashboard load
- Store in `Notification` table
- Real-time via Supabase Realtime
- Bell icon in header with badge count

---

## 14. Checklist for Every New Module

When creating a new module, ensure ALL of the following:

- [ ] TypeScript types defined in `src/types/`
- [ ] Zod validators in `src/validators/`
- [ ] Server Actions in `src/actions/`
- [ ] Custom hooks in `src/hooks/`
- [ ] Page components in `src/app/(dashboard)/`
- [ ] UI components in `src/components/{module}/`
- [ ] RBAC permissions configured
- [ ] Audit logging for all mutations
- [ ] Multi-tenant filtering (farmId)
- [ ] Search, filter, sort functionality
- [ ] Export to Excel/PDF
- [ ] Image/attachment support
- [ ] Notes field
- [ ] Loading skeletons
- [ ] Empty states
- [ ] Error handling with toast
- [ ] Mobile responsive
- [ ] Vietnamese labels
- [ ] Soft delete (no hard delete)
