# PFMS Project Rules

## Project Overview
This is the **Pig Farm Management System (PFMS)** - Hệ Thống Quản Lý Trại Lợn Thông Minh.
A comprehensive web application for managing pig farm operations.

---

## MANDATORY Rules

### 1. Technology Compliance
- **ALWAYS** use Next.js 15 App Router (NOT Pages Router)
- **ALWAYS** use TypeScript with strict mode
- **ALWAYS** use shadcn/ui + TailwindCSS for UI
- **ALWAYS** use Prisma for database access
- **ALWAYS** use Supabase for Auth, Storage, and Database
- **ALWAYS** use React Hook Form + Zod for forms
- **ALWAYS** use TanStack Query for client-side data fetching
- **ALWAYS** use TanStack Table for data tables
- **ALWAYS** use Recharts for charts
- **NEVER** install or use alternative libraries without explicit approval

### 2. Data Integrity (CRITICAL)
- **NEVER** hard-delete business data (pigs, barns, transactions, etc.)
- **ALWAYS** use soft delete (set `deletedAt` timestamp and `status` change)
- **ALWAYS** create an audit log entry for every create, update, and status change
- **ALWAYS** filter queries by `farmId` for multi-tenant isolation
- **ALWAYS** use Prisma transactions for multi-step operations

### 3. Security
- **ALWAYS** check authentication in Server Actions and API Routes
- **ALWAYS** check RBAC permissions before any mutation
- **NEVER** expose internal IDs or sensitive data in client responses without authorization
- **ALWAYS** validate input with Zod on both client and server side
- **NEVER** trust client-side data without server-side validation

### 4. UI/UX Standards
- **ALL** user-facing text must be in **Vietnamese** (Tiếng Việt)
- **ALL** code (variables, functions, types) must be in **English**
- **ALWAYS** use shadcn/ui components as base elements
- **ALWAYS** include loading skeletons for async data
- **ALWAYS** include empty state displays when no data
- **ALWAYS** support dark mode
- **ALWAYS** make layouts responsive (mobile-first)
- **ALWAYS** use Framer Motion for meaningful animations
- **MAXIMUM 3 clicks** for any field update operation
- **ALWAYS** use Drawer/Dialog for quick actions instead of page navigation

### 5. Code Style
- **ALWAYS** use `'use server'` directive for Server Actions
- **ALWAYS** use `'use client'` directive only when needed (forms, interactivity)
- **PREFER** Server Components by default
- **ALWAYS** handle errors with try/catch and return structured responses
- **ALWAYS** use `toast` (sonner) for user feedback
- **ALWAYS** use `revalidatePath` after mutations
- **ALWAYS** add JSDoc comments for public functions

### 6. File Naming Conventions
- Components: `kebab-case.tsx` (e.g., `pig-form.tsx`)
- Pages: `page.tsx` inside route directories
- Server Actions: `{module}.ts` in `src/actions/`
- Types: `{module}.ts` in `src/types/`
- Validators: `{module}.ts` in `src/validators/`
- Hooks: `use-{name}.ts` in `src/hooks/`
- Utilities: `{name}.ts` in `src/lib/`

### 7. Module Completeness
Every new module MUST include:
- Types, Validators, Server Actions, Hooks
- CRUD pages with list view
- Data table with search, filter, sort, pagination
- Export to Excel/PDF capability
- Image/attachment upload support
- Notes field
- Audit logging
- RBAC enforcement
- Mobile responsive design
- Vietnamese labels

### 8. Copyright & Branding (MANDATORY)
- **ALL** code files MUST include the following copyright header:
  `// Bản quyền thuộc dalymmo.com`
- **ALL** UI footers (Sidebar, Login page, Setup page) MUST display:
  `Bản quyền thuộc dalymmo.com`

### 9. Commit & Progress
- **ALWAYS** ensure `npm run build` passes before completing work
- **ALWAYS** update the task checklist after completing items
- **ALWAYS** verify Prisma schema is valid with `npx prisma validate`

---

## Status Color Convention
| Status | Color | TailwindCSS |
|--------|-------|-------------|
| Active / Healthy / Done | Green | `text-green-500` / `bg-green-500` |
| Warning / Pending | Yellow | `text-yellow-500` / `bg-yellow-500` |
| Critical / Dead / Overdue | Red | `text-red-500` / `bg-red-500` |
| Info / In Progress | Blue | `text-blue-500` / `bg-blue-500` |
| Inactive / Archived | Gray | `text-gray-400` / `bg-gray-400` |

---

## Pig Status Flow
```
IMPORTED → ACTIVE → PREGNANT → NURSING → ACTIVE (cycle)
                  → FATTENING → SOLD
                  → TREATMENT → ACTIVE
                  → CULLED
                  → DEAD
```

## Breeding Flow
```
ESTRUS → MATING → PREGNANT → ULTRASOUND → FARROWING → NURSING → WEANING → (back to ESTRUS)
                → NOT_PREGNANT → RE-MATING
```
