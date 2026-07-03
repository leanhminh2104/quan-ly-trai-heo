// Bản quyền thuộc dalymmo.com
/**
 * System-wide constants for the Pig Farm Management System
 */

// Default breeding parameters
export const BREEDING_DEFAULTS = {
  /** Thời gian mang thai (ngày) */
  GESTATION_DAYS: 114,
  /** Thời gian cai sữa (ngày) */
  WEANING_DAYS: 28,
  /** Ngày siêu âm sau phối */
  ULTRASOUND_DAYS: 28,
  /** Ngày chuyển chuồng đẻ (trước đẻ) */
  MOVE_TO_FARROWING_DAYS_BEFORE: 7,
  /** Ngày chờ phối lại nếu không đậu */
  RE_MATING_WAIT_DAYS: 21,
} as const

// Pig status labels (Vietnamese)
export const PIG_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Đang nuôi',
  PREGNANT: 'Mang thai',
  NURSING: 'Nuôi con',
  FATTENING_STATUS: 'Vỗ béo',
  TREATMENT: 'Điều trị',
  SOLD: 'Đã bán',
  CULLED: 'Loại thải',
  DEAD: 'Chết',
  INACTIVE: 'Không hoạt động',
}

// Pig type labels (Vietnamese)
export const PIG_TYPE_LABELS: Record<string, string> = {
  SOW: 'Nái',
  BOAR: 'Đực giống',
  GILT: 'Hậu bị',
  FATTENING: 'Lợn thịt',
  PIGLET: 'Lợn con',
}

// Pen type labels
export const PEN_TYPE_LABELS: Record<string, string> = {
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

// Pen status labels
export const PEN_STATUS_LABELS: Record<string, string> = {
  AVAILABLE: 'Trống',
  OCCUPIED: 'Đang dùng',
  MAINTENANCE: 'Đang sửa',
  CLEANING: 'Đang vệ sinh',
  DISABLED: 'Không sử dụng',
}

// Breeding status labels
export const BREEDING_STATUS_LABELS: Record<string, string> = {
  ESTRUS: 'Động dục',
  MATED: 'Đã phối',
  PREGNANT: 'Mang thai',
  NOT_PREGNANT: 'Không đậu',
  FARROWED: 'Đã đẻ',
  WEANED: 'Đã cai sữa',
  ABORTED: 'Sảy thai',
  CANCELLED: 'Hủy',
}

// Task type labels
export const TASK_TYPE_LABELS: Record<string, string> = {
  FEEDING: 'Cho ăn',
  VACCINATION: 'Tiêm phòng',
  TREATMENT: 'Điều trị',
  CLEANING: 'Vệ sinh',
  DISINFECTION: 'Sát trùng',
  WEIGHING: 'Cân',
  DEWORMING: 'Tẩy giun',
  MATING: 'Phối giống',
  FARROWING: 'Đỡ đẻ',
  WEANING: 'Cai sữa',
  MOVING: 'Di chuyển',
  OTHER: 'Khác',
}

// Task status labels
export const TASK_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ thực hiện',
  IN_PROGRESS: 'Đang làm',
  COMPLETED: 'Hoàn thành',
  OVERDUE: 'Quá hạn',
  CANCELLED: 'Đã hủy',
}

// Status colors
export const STATUS_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  ACTIVE: { text: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' },
  PREGNANT: { text: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200' },
  NURSING: { text: 'text-pink-600', bg: 'bg-pink-100', border: 'border-pink-200' },
  FATTENING_STATUS: { text: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-200' },
  TREATMENT: { text: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-200' },
  SOLD: { text: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' },
  CULLED: { text: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' },
  DEAD: { text: 'text-red-700', bg: 'bg-red-200', border: 'border-red-300' },
  INACTIVE: { text: 'text-gray-500', bg: 'bg-gray-100', border: 'border-gray-200' },
  // Pen statuses
  AVAILABLE: { text: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' },
  OCCUPIED: { text: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' },
  MAINTENANCE: { text: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-200' },
  CLEANING: { text: 'text-cyan-600', bg: 'bg-cyan-100', border: 'border-cyan-200' },
  DISABLED: { text: 'text-gray-500', bg: 'bg-gray-100', border: 'border-gray-200' },
  // Task statuses
  PENDING: { text: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-200' },
  IN_PROGRESS: { text: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' },
  COMPLETED: { text: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' },
  OVERDUE: { text: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' },
  CANCELLED: { text: 'text-gray-500', bg: 'bg-gray-100', border: 'border-gray-200' },
}

// User role labels
export const USER_ROLE_LABELS: Record<string, string> = {
  OWNER: 'Chủ trại',
  MANAGER: 'Quản lý',
  VETERINARIAN: 'Bác sĩ thú y',
  WORKER: 'Nhân viên',
  VIEWER: 'Chỉ xem',
}

// Navigation items
export const NAV_ITEMS = [
  {
    title: 'Tổng quan',
    href: '/dashboard',
    icon: 'LayoutDashboard',
  },
  {
    title: 'Chuồng trại',
    href: '/barns',
    icon: 'Warehouse',
    children: [
      { title: 'Danh sách chuồng', href: '/barns' },
      { title: 'Sơ đồ chuồng', href: '/barns/map' },
      { title: 'Cấu trúc trại', href: '/barns/structure' },
    ],
  },
  {
    title: 'Đàn lợn',
    href: '/pigs',
    icon: 'PiggyBank',
    children: [
      { title: 'Tất cả', href: '/pigs' },
      { title: 'Nái', href: '/pigs/sows' },
      { title: 'Đực giống', href: '/pigs/boars' },
      { title: 'Hậu bị', href: '/pigs/gilts' },
      { title: 'Lợn thịt', href: '/pigs/fattening' },
      { title: 'Lợn con', href: '/pigs/piglets' },
    ],
  },
  {
    title: 'Sinh sản',
    href: '/breeding',
    icon: 'Heart',
    children: [
      { title: 'Phối giống', href: '/breeding/mating' },
      { title: 'Mang thai', href: '/breeding/pregnancy' },
      { title: 'Đẻ', href: '/breeding/farrowing' },
      { title: 'Cai sữa', href: '/breeding/weaning' },
    ],
  },
  {
    title: 'Sức khỏe',
    href: '/health',
    icon: 'Stethoscope',
    children: [
      { title: 'Tiêm phòng', href: '/health/vaccines' },
      { title: 'Điều trị', href: '/health/treatments' },
    ],
  },
  {
    title: 'Kho',
    href: '/inventory',
    icon: 'Package',
    children: [
      { title: 'Kho cám', href: '/inventory/feed' },
      { title: 'Kho thuốc & Vaccine', href: '/inventory/medicine' },
    ],
  },
  {
    title: 'Tài chính',
    href: '/finance',
    icon: 'DollarSign',
    children: [
      { title: 'Sổ quỹ (Thu / Chi)', href: '/finance/transactions' },
    ],
  },
  {
    title: 'Nhân viên',
    href: '/employees',
    icon: 'Users',
  },
  {
    title: 'Công việc',
    href: '/tasks',
    icon: 'ClipboardList',
  },
  {
    title: 'Báo cáo',
    href: '/reports',
    icon: 'BarChart3',
  },
  {
    title: 'Nhật ký',
    href: '/audit-log',
    icon: 'ScrollText',
  },
  {
    title: 'Thiết lập',
    href: '/settings',
    icon: 'Settings',
    children: [
      { title: 'Thông tin trại', href: '/settings/farm' },
      { title: 'Danh mục', href: '/settings/categories' },
      { title: 'Đơn vị tính', href: '/settings/units' },
      { title: 'Thông số', href: '/settings/parameters' },
      { title: 'Phân quyền', href: '/settings/roles' },
      { title: 'Bảo mật', href: '/settings/security' },
    ],
  },
] as const

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const
