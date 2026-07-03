// Bản quyền thuộc dalymmo.com
import { Pen, PenStatus, PenType, Barn, BarnRow, BarnZone } from '@prisma/client'

// Extending the generated Prisma Pen type with calculated fields and relations
export interface PenWithDetails extends Pen {
  currentPigsCount?: number
  availableCapacity?: number
  utilizationRate?: number // percentage 0-100
  barn?: Barn & {
    row?: BarnRow & {
      zone?: BarnZone
    }
  }
}

export const PEN_TYPE_LABELS: Record<PenType, string> = {
  MATING: 'Chuồng phối',
  GESTATION: 'Chuồng mang thai',
  FARROWING: 'Chuồng đẻ',
  NURSERY: 'Chuồng úm',
  FATTENING: 'Chuồng thịt',
  GILT_PEN: 'Chuồng hậu bị',
  BOAR_PEN: 'Chuồng đực',
  QUARANTINE: 'Chuồng cách ly',
  GENERAL: 'Chuồng chung',
}

export const PEN_STATUS_LABELS: Record<PenStatus, string> = {
  AVAILABLE: 'Trống',
  OCCUPIED: 'Đang dùng',
  MAINTENANCE: 'Đang sửa',
  CLEANING: 'Đang vệ sinh',
  DISABLED: 'Không sử dụng',
}

export const PEN_STATUS_COLORS: Record<PenStatus, { bg: string, text: string }> = {
  AVAILABLE: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' },
  OCCUPIED: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
  MAINTENANCE: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
  CLEANING: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-400' },
  DISABLED: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
}

export const PEN_TYPE_COLORS: Record<PenType, { bg: string, text: string }> = {
  MATING: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400' },
  GESTATION: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400' },
  FARROWING: { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-700 dark:text-pink-400' },
  NURSERY: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
  FATTENING: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400' },
  GILT_PEN: { bg: 'bg-lime-100 dark:bg-lime-900/30', text: 'text-lime-700 dark:text-lime-400' },
  BOAR_PEN: { bg: 'bg-slate-100 dark:bg-slate-900/30', text: 'text-slate-700 dark:text-slate-400' },
  QUARANTINE: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
  GENERAL: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-700 dark:text-gray-400' },
}
