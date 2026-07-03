'use client'
// Bản quyền thuộc dalymmo.com

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { movePigToLayoutPen, unassignPig } from '@/actions/pig-movement'
import { useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Lock,
  Unlock,
  Minus,
  MoveRight,
  Plus,
  RotateCcw,
  Search,
  Maximize,
  Minimize,
} from 'lucide-react'
import { Input } from '@/components/ui/input'

const LayoutContext = React.createContext<{ 
  isLocked: boolean; 
  setIsLocked: (val: boolean) => void;
  movingPig: DragItem | null;
  setMovingPig: (val: DragItem | null) => void;
  onPenClick: (penId: string | null, layoutCode: string, penName: string) => void;
  onPigClick: (pig: PigData, penId: string | null, penName: string) => void;
}>({
  isLocked: true,
  setIsLocked: () => {},
  movingPig: null,
  setMovingPig: () => {},
  onPenClick: () => {},
  onPigClick: () => {},
})

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

interface PenData {
  id: string
  code: string
  name: string
  capacity: number
  status: string
  pigs: PigData[]
}

interface PigData {
  id: string
  code: string
  earTag?: string | null
  name?: string | null
  status: string
  type: string
  gender: string
}

interface BarnData {
  id: string
  code: string
  name: string
  pens: PenData[]
}

interface DragItem {
  pig: PigData
  fromPenId: string | null
  fromPenName: string
}

interface PendingMove {
  pig: PigData
  fromPenId: string | null
  fromPenName: string
  toPenId?: string
  toLayoutCode: string
  toPenName: string
  action?: 'MOVE' | 'UNASSIGN'
}

// ═══════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════

const PIG_STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-emerald-500',
  PREGNANT: 'bg-pink-500',
  NURSING: 'bg-purple-500',
  FATTENING_STATUS: 'bg-amber-500',
  TREATMENT: 'bg-red-500',
  SOLD: 'bg-gray-400',
  CULLED: 'bg-gray-500',
  DEAD: 'bg-gray-600',
  INACTIVE: 'bg-gray-400',
}

const PIG_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Khỏe mạnh',
  PREGNANT: 'Đang mang thai',
  NURSING: 'Đang nuôi con',
  FATTENING_STATUS: 'Vỗ béo',
  TREATMENT: 'Điều trị',
  SOLD: 'Đã bán',
  CULLED: 'Loại thải',
  DEAD: 'Đã chết',
  INACTIVE: 'Không hoạt động',
}

const PIG_GENDER_ICONS: Record<string, string> = {
  MALE: '♂',
  FEMALE: '♀',
}

const PIG_TYPE_LABELS: Record<string, string> = {
  SOW: 'Nái',
  BOAR: 'Đực',
  PIGLET: 'Con',
  FATTENING: 'Thịt',
  GILT: 'Hậu bị',
}

// ═══════════════════════════════════════════
// DATA HELPERS
// ═══════════════════════════════════════════

/** Flatten hierarchy data into flat lists of pens and barns */
function buildDataMaps(hierarchy: any[]) {
  const allPens: PenData[] = []
  const allBarns: BarnData[] = []

  if (!hierarchy || !Array.isArray(hierarchy)) return { allPens, allBarns }

  for (const zone of hierarchy) {
    for (const row of zone.rows || []) {
      for (const barn of row.barns || []) {
        const barnPens: PenData[] = []
        for (const pen of barn.pens || []) {
          const penData: PenData = {
            id: pen.id,
            code: pen.code,
            name: pen.name,
            capacity: pen.capacity ?? 1,
            status: pen.status ?? 'AVAILABLE',
            pigs: pen.pigs ?? [],
          }
          allPens.push(penData)
          barnPens.push(penData)
        }
        allBarns.push({
          id: barn.id,
          code: barn.code,
          name: barn.name,
          pens: barnPens,
        })
      }
    }
  }

  return { allPens, allBarns }
}

/** Find pen by code - tries multiple matching strategies */
function findPen(allPens: PenData[], code: string): PenData | undefined {
  let pen = allPens.find(p => p.code === code)
  if (pen) return pen
  pen = allPens.find(p => p.name === code)
  if (pen) return pen
  return undefined
}

/** Find barn by code/name - flexible matching */
function findBarn(allBarns: BarnData[], ...identifiers: string[]): BarnData | undefined {
  for (const id of identifiers) {
    const barn = allBarns.find(
      b => b.code === id || b.name === id || b.name.includes(id) || b.code.includes(id)
    )
    if (barn) return barn
  }
  return undefined
}

// ═══════════════════════════════════════════
// DRAGGABLE PIG BADGE
// ═══════════════════════════════════════════

function DraggablePig({
  pig,
  penId,
  penName,
  size = 'sm',
}: {
  pig: PigData
  penId: string | null
  penName: string
  size?: 'sm' | 'md'
}) {
  const { isLocked, onPigClick, movingPig } = React.useContext(LayoutContext)
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `pig-${pig.id}`,
    data: { pig, fromPenId: penId, fromPenName: penName } as DragItem,
    disabled: isLocked,
  })

  const statusDot = PIG_STATUS_COLORS[pig.status] || 'bg-gray-400'

  if (size === 'md') {
    return (
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        data-pig="true"
        onClick={(e) => {
          e.stopPropagation()
          onPigClick(pig, penId, penName)
        }}
        title={`${pig.earTag || pig.code}${pig.name ? ` - ${pig.name}` : ''} (${PIG_STATUS_LABELS[pig.status] || pig.status})`}
        className={cn(
          'inline-flex items-center gap-1.5 px-2 py-1 rounded-lg',
          'text-xs font-bold leading-tight',
          'bg-white dark:bg-gray-800',
          'shadow-sm border border-gray-200 dark:border-gray-600',
          !isLocked && 'cursor-grab active:cursor-grabbing select-none',
          'hover:shadow-md hover:border-emerald-400 hover:-translate-y-0.5',
          'transition-all duration-150 ease-out',
          isDragging && 'opacity-25 scale-90'
        )}
      >
        <span className={cn('w-2 h-2 rounded-full shrink-0 ring-1 ring-white', statusDot)} />
        <span className="truncate">{pig.earTag || pig.code}</span>
        <span className="text-[9px] text-muted-foreground">{PIG_TYPE_LABELS[pig.type] || pig.type}</span>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      data-pig="true"
      onClick={(e) => {
        e.stopPropagation()
        onPigClick(pig, penId, penName)
      }}
      title={`${pig.earTag || pig.code}${pig.name ? ` - ${pig.name}` : ''} (${pig.status})`}
      className={cn(
        'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md',
        'text-[10px] font-bold leading-tight',
        'bg-white/95 dark:bg-gray-800/95',
        'shadow-sm border border-gray-200/80 dark:border-gray-600/80',
        !isLocked && 'cursor-grab active:cursor-grabbing select-none',
        'hover:shadow-md hover:border-emerald-400 hover:-translate-y-px',
        'transition-all duration-150 ease-out',
        isDragging && 'opacity-25 scale-90'
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0 ring-1 ring-white', statusDot)} />
      <span className="truncate max-w-[40px]">{pig.earTag || pig.code}</span>
      <span className="text-[8px] text-muted-foreground ml-0.5">{PIG_TYPE_LABELS[pig.type] || pig.type}</span>
    </div>
  )
}

// ═══════════════════════════════════════════
// DROPPABLE PEN CELL
// ═══════════════════════════════════════════

type PenVariant = 'sow' | 'boar' | 'fattening' | 'piglet' | 'gilt'

interface DroppablePenProps {
  pen?: PenData
  layoutCode: string
  label?: string
  defaultPenName?: string
  variant?: PenVariant
  className?: string
  showCapacity?: boolean
  compact?: boolean
  style?: React.CSSProperties
}

const VARIANT_STYLES: Record<PenVariant, { base: string; header: string }> = {
  sow: {
    base: 'bg-sky-400/85 dark:bg-sky-700/60 border-sky-500/60',
    header: 'text-white/95 border-sky-500/40',
  },
  boar: {
    base: 'bg-lime-400/80 dark:bg-lime-700/55 border-lime-500/60',
    header: 'text-lime-950 dark:text-lime-100 border-lime-500/40',
  },
  fattening: {
    base: 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600',
    header: 'text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600',
  },
  piglet: {
    base: 'bg-pink-300/80 dark:bg-pink-700/55 border-pink-400/60',
    header: 'text-pink-950 dark:text-pink-100 border-pink-400/40',
  },
  gilt: {
    base: 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600',
    header: 'text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600',
  },
}

function DroppablePen({
  pen,
  layoutCode,
  label,
  defaultPenName,
  variant = 'sow',
  className,
  showCapacity = true,
  compact = false,
  style,
}: DroppablePenProps) {
  const { isLocked, movingPig, onPenClick } = React.useContext(LayoutContext)
  const { isOver, setNodeRef } = useDroppable({
    id: `pen-${pen?.id || `layout-${layoutCode}`}`,
    data: { pen, layoutCode, label: defaultPenName || label || layoutCode },
    disabled: isLocked,
  })

  const styles = VARIANT_STYLES[variant]
  const isEmpty = !pen || pen.pigs.length === 0
  const isFull = pen ? pen.pigs.length >= pen.capacity : false
  const displayLabel = label || pen?.name || layoutCode

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onPenClick(pen?.id || null, layoutCode, displayLabel)}
      className={cn(
        'rounded-lg border-2 flex flex-col overflow-hidden transition-all duration-200 cursor-pointer',
        styles.base,
        !isLocked && isOver && pen && !isFull && 'ring-2 ring-emerald-400 ring-offset-1 ring-offset-gray-700 scale-[1.03] shadow-lg shadow-emerald-500/20 border-emerald-400 z-10',
        !isLocked && isOver && isFull && 'ring-2 ring-red-400 ring-offset-1 ring-offset-gray-700 border-red-400',
        movingPig && 'ring-2 ring-amber-400 ring-offset-1 ring-offset-gray-700 scale-[1.02] shadow-md shadow-amber-500/20 z-10 hover:bg-amber-100/10',
        !pen && 'opacity-35 border-dashed',
        className
      )}
    >
      {/* Header */}
      <div className={cn(
        'text-center font-bold py-0.5 border-b text-[11px] leading-tight shrink-0',
        styles.header,
        compact && 'text-[9px] py-px'
      )}>
        {displayLabel}
      </div>

      {/* Pig Badges Area */}
      <div className={cn(
        'flex-1 p-1 flex flex-wrap gap-[3px] items-start content-start overflow-y-auto',
        compact ? 'min-h-[24px]' : 'min-h-[36px]'
      )}>
        {pen?.pigs.map(pig => (
          <DraggablePig key={pig.id} pig={pig} penId={pen.id} penName={pen.name} />
        ))}
        {isEmpty && (
          <span className={cn(
            'w-full text-center self-center italic',
            'text-[9px] leading-none',
            variant === 'sow' || variant === 'boar' || variant === 'piglet'
              ? 'text-white/40'
              : 'text-gray-400 dark:text-gray-500'
          )}>
            Trống
          </span>
        )}
      </div>

      {/* Capacity Bar */}
      {showCapacity && pen && !compact && (
        <div className={cn(
          'text-[8px] text-center py-px border-t shrink-0 font-medium',
          styles.header,
          isFull ? 'text-red-500 dark:text-red-400 font-bold' : 'opacity-60'
        )}>
          {pen.pigs.length}/{pen.capacity}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════
// STATIC NON-DROPPABLE BLOCKS
// ═══════════════════════════════════════════

function StaticBlock({
  children,
  className,
  style,
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      style={style}
      className={cn(
        'rounded-lg flex items-center justify-center text-xs font-semibold select-none',
        className
      )}
    >
      {children}
    </div>
  )
}

// ═══════════════════════════════════════════
// HẬU BỊ BLOCK (areas 16 / 17)
// ═══════════════════════════════════════════

function HauBiRow({
  number,
  count,
  allPens,
}: {
  number: number
  count: number
  allPens: PenData[]
}) {
  return (
    <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-600 flex flex-col overflow-hidden">
      <div className="text-center py-1.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shrink-0">
        <div className="text-sm font-black text-gray-800 dark:text-gray-100">Dãy {number}</div>
        <div className="text-[9px] text-gray-500 dark:text-gray-400 mt-0.5">({count} ô)</div>
      </div>
      <div className="flex-1 p-1 flex flex-col gap-1 overflow-y-auto">
        {Array.from({ length: count }, (_, i) => {
          const code = `${number}-${i + 1}`
          const pen = findPen(allPens, code) || findPen(allPens, `HB${number}-${i + 1}`) || findPen(allPens, `Lợn hậu bị ${number}-${i + 1}`)
          return (
            <DroppablePen
              key={code}
              pen={pen}
              layoutCode={`HB${number}-${i + 1}`}
              label={`Ô ${i + 1}`}
              defaultPenName={`Sàn nái hậu bị ${number} - Ô ${i + 1}`}
              variant="gilt"
              showCapacity={false}
              compact
              className="min-h-[40px]"
            />
          )
        })}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════
// EXIT LABEL
// ═══════════════════════════════════════════

function ExitLabel({ direction, className }: { direction: 'left' | 'right' | 'down'; className?: string }) {
  const arrow = { left: '←', right: '→', down: '↓' }[direction]
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <span className="text-[10px] font-black tracking-widest text-amber-400 dark:text-amber-300 uppercase">
        {direction === 'left' ? `${arrow} CỬA RA` : `CỬA RA ${arrow}`}
      </span>
    </div>
  )
}

// ═══════════════════════════════════════════
// PIG PANEL (Bottom drawer with pig list)
// ═══════════════════════════════════════════

function PigPanel({ pigs, allPens }: { pigs: PigData[]; allPens: PenData[] }) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('UNASSIGNED')

  // Collect all pigs from pens + unassigned
  const allPigs = useMemo(() => {
    return pigs.map(p => {
      const assignedPen = allPens.find(pen => pen.pigs.some(penPig => penPig.id === p.id))
      return { 
        ...p, 
        penName: assignedPen?.name || 'Chưa phân ô', 
        penId: assignedPen?.id || '',
        isAssigned: !!assignedPen
      }
    })
  }, [pigs, allPens])

  const filtered = useMemo(() => {
    return allPigs.filter(p => {
      const matchSearch = !searchQuery ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.name?.toLowerCase().includes(searchQuery.toLowerCase())
      
      let matchType = true
      if (filterType === 'UNASSIGNED') matchType = !p.isAssigned
      else if (filterType !== 'ALL') matchType = p.type === filterType
      
      return matchSearch && matchType
    })
  }, [allPigs, searchQuery, filterType])

  const unassignedCount = allPigs.filter(p => !p.isAssigned).length

  const { isLocked } = React.useContext(LayoutContext)
  const { isOver, setNodeRef } = useDroppable({
    id: 'unassigned-zone',
    data: { action: 'UNASSIGN' },
    disabled: isLocked,
  })

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "border-t-2 border-gray-600 dark:border-gray-700 bg-gray-800/95 dark:bg-gray-950/95 backdrop-blur-sm transition-all duration-200",
        !isLocked && isOver && "ring-4 ring-inset ring-emerald-500 bg-gray-800/80"
      )}
    >
      {/* Toggle Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-white">🐷 Danh sách lợn</span>
          {unassignedCount > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-medium animate-pulse">
              {unassignedCount} chưa phân ô
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-3 space-y-2">
          {/* Search + Filter Bar */}
          <div className="flex gap-2 items-center">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm mã lợn..."
                className="h-7 pl-7 text-xs bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="flex gap-1">
              {[
                { key: 'UNASSIGNED', label: 'Chưa ô' },
                { key: 'ALL', label: 'Tất cả' },
                { key: 'SOW', label: 'Nái' },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilterType(f.key)}
                  className={cn(
                    'px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors',
                    filterType === f.key
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-gray-300'
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pig List - Scrollable */}
          <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto py-1 scrollbar-thin">
            {filtered.length === 0 ? (
              <span className="text-xs text-gray-500 italic py-2">
                {searchQuery ? 'Không tìm thấy lợn nào' : 'Không có lợn phù hợp'}
              </span>
            ) : (
              filtered.map(pig => (
                <DraggablePig
                  key={pig.id}
                  pig={pig}
                  penId={pig.penId || null}
                  penName={pig.penName || 'Chưa phân ô'}
                  size="md"
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════
// ZOOM & PAN CONTAINER
// ═══════════════════════════════════════════

function ZoomPanContainer({ children, overlay, bottomPanel }: { children: React.ReactNode, overlay?: React.ReactNode, bottomPanel?: React.ReactNode }) {
  const [scale, setScale] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const panStart = useRef({ x: 0, y: 0, tx: 0, ty: 0, dist: 1, scale: 1 })
  const containerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const { isLocked, setIsLocked } = React.useContext(LayoutContext)

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setScale(prev => Math.min(2, Math.max(0.4, prev + delta)))
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const isPig = (e.target as HTMLElement).closest('[data-pig="true"]')
    if (isLocked || !isPig) {
      setIsPanning(true)
      panStart.current = { x: e.clientX, y: e.clientY, tx: translate.x, ty: translate.y }
    }
  }, [translate, isLocked])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return
    const dx = e.clientX - panStart.current.x
    const dy = e.clientY - panStart.current.y
    setTranslate({ x: panStart.current.tx + dx, y: panStart.current.ty + dy })
  }, [isPanning])

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const isPig = (e.target as HTMLElement).closest('[data-pig="true"]')
    if (isPig) return // Let pig handle its click

    if (e.touches.length === 2) {
      setIsPanning(true)
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      
      const centerX = (touch1.clientX + touch2.clientX) / 2
      const centerY = (touch1.clientY + touch2.clientY) / 2
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY)

      panStart.current = { 
        x: centerX, 
        y: centerY, 
        tx: translate.x, 
        ty: translate.y,
        dist: dist,
        scale: scale
      }
    }
  }, [translate, scale])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPanning || e.touches.length !== 2) return
    
    const touch1 = e.touches[0]
    const touch2 = e.touches[1]
    
    const centerX = (touch1.clientX + touch2.clientX) / 2
    const centerY = (touch1.clientY + touch2.clientY) / 2
    const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY)

    const dx = centerX - panStart.current.x
    const dy = centerY - panStart.current.y
    
    const scaleDiff = dist / panStart.current.dist
    const newScale = Math.min(2, Math.max(0.4, panStart.current.scale * scaleDiff))

    setTranslate({ x: panStart.current.tx + dx, y: panStart.current.ty + dy })
    setScale(newScale)
  }, [isPanning])

  const handleTouchEnd = useCallback(() => {
    setIsPanning(false)
  }, [])

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsPanning(false)
    window.addEventListener('mouseup', handleGlobalMouseUp)
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [])

  useEffect(() => {
    const handler = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false)
      }
    }
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  const handleReset = () => {
    setScale(1)
    setTranslate({ x: 0, y: 0 })
  }

  const toggleFullscreen = async () => {
    if (!isFullscreen) {
      await document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      await document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  return (
    <div 
      className={cn(
        "relative flex flex-col transition-all duration-200 bg-gray-50/50 dark:bg-gray-900/50 overflow-hidden rounded-2xl", 
        isFullscreen ? "fixed inset-0 z-[100] bg-gray-50 dark:bg-gray-900 m-0 rounded-none border-none" : "h-[calc(100vh-280px)] min-h-[400px]"
      )} 
      ref={wrapperRef}
    >
      {/* Zoom Controls & Lock */}
      <div className="absolute top-2 right-2 z-20 flex gap-1 bg-gray-800/90 backdrop-blur-sm rounded-lg p-1 shadow-lg border border-gray-700">
        <button
          onClick={toggleFullscreen}
          className="w-7 h-7 rounded-md flex items-center justify-center bg-gray-700/50 hover:bg-gray-600 text-gray-300 transition-colors"
          title={isFullscreen ? "Thu nhỏ" : "Toàn màn hình"}
        >
          {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
        </button>
        <div className="w-px bg-gray-600 mx-0.5" />
        <button
          onClick={() => setIsLocked(!isLocked)}
          className={cn("w-7 h-7 rounded-md flex items-center justify-center transition-colors",
            isLocked ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
          )}
          title={isLocked ? "Đang khóa (Nhấn để bật chế độ sửa)" : "Đang sửa (Nhấn để khóa)"}
        >
          {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
        </button>
        <div className="w-px bg-gray-600 mx-0.5" />
        <button
          onClick={() => setScale(prev => Math.min(2, prev + 0.15))}
          className="w-7 h-7 rounded-md flex items-center justify-center text-white hover:bg-gray-600 transition-colors"
          title="Phóng to"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <span className="w-10 h-7 flex items-center justify-center text-[10px] font-bold text-gray-300">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={() => setScale(prev => Math.max(0.4, prev - 0.15))}
          className="w-7 h-7 rounded-md flex items-center justify-center text-white hover:bg-gray-600 transition-colors"
          title="Thu nhỏ"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <div className="w-px bg-gray-600 mx-0.5" />
        <button
          onClick={handleReset}
          className="w-7 h-7 rounded-md flex items-center justify-center text-white hover:bg-gray-600 transition-colors"
          title="Đặt lại"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Pan/Zoom Area */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'none' }}
        className={cn(
          'flex-1 overflow-hidden rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900/50',
          isPanning ? 'cursor-grabbing' : 'cursor-grab'
        )}
      >
        <div
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isPanning ? 'none' : 'transform 0.15s ease-out',
          }}
        >
          {children}
        </div>
      </div>

      {/* Hint */}
      <div className="mt-1 text-[10px] text-muted-foreground text-center shrink-0">
        🖱️ {isLocked ? 'Bật nút Sửa để di chuyển lợn. Kéo thả để di chuyển bản đồ.' : 'Kéo thả lợn vào chuồng. Kéo thả nền để di chuyển bản đồ.'}
      </div>

      {bottomPanel}
      {/* Overlay */}
      {overlay}
    </div>
  )
}

// ═══════════════════════════════════════════
// MAIN FARM LAYOUT COMPONENT
// ═══════════════════════════════════════════

export function FarmLayout({
  initialData,
  initialUnassigned = [],
}: {
  initialData: any[]
  initialUnassigned?: any[]
}) {
  const queryClient = useQueryClient()
  const [activeDrag, setActiveDrag] = useState<DragItem | null>(null)
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null)
  const [isMoving, setIsMoving] = useState(false)
  const [isLocked, setIsLocked] = useState(true)

  // Touch UI States
  const [movingPig, setMovingPig] = useState<DragItem | null>(null)
  const [pigMenuOpen, setPigMenuOpen] = useState(false)
  const [selectedPigInfo, setSelectedPigInfo] = useState<DragItem | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)

  // ── Data Maps ──
  const { allPens, allBarns } = useMemo(
    () => buildDataMaps(initialData),
    [initialData]
  )

  const getPen = useCallback(
    (code: string) => findPen(allPens, code),
    [allPens]
  )

  const getBarn = useCallback(
    (...ids: string[]) => findBarn(allBarns, ...ids),
    [allBarns]
  )

  // Hậu bị sub-pens
  const hauBi16Pens = useMemo(() => {
    const barn = getBarn('16', 'HB16', 'Sàn lợn hậu bị 16', 'Hậu bị 16')
    return barn?.pens || []
  }, [getBarn])

  const hauBi17Pens = useMemo(() => {
    const barn = getBarn('17', 'HB17', 'Sàn lợn hậu bị 17', 'Hậu bị 17')
    return barn?.pens || []
  }, [getBarn])

  // ── DnD Sensors ──
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    })
  )

  const handlePigClick = useCallback((pig: PigData, penId: string | null, penName: string) => {
    setSelectedPigInfo({ pig, fromPenId: penId, fromPenName: penName })
    setPigMenuOpen(true)
  }, [])

  const handlePenClick = useCallback((penId: string | null, layoutCode: string, penName: string) => {
    if (!movingPig) return

    if (penId === movingPig.fromPenId && penId !== null) {
      setMovingPig(null)
      toast.info('Đã hủy chuyển ô', { description: 'Lợn đang ở ô này rồi.' })
      return
    }

    setPendingMove({
      pig: movingPig.pig,
      fromPenId: movingPig.fromPenId,
      fromPenName: movingPig.fromPenName,
      toPenId: penId || undefined,
      toLayoutCode: layoutCode,
      toPenName: penName,
    })
    setMovingPig(null)
  }, [movingPig])

  // ── DnD Handlers ──
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current as DragItem
    setActiveDrag(data)
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveDrag(null)

    const { active, over } = event
    if (!over || !active.data.current) return

    const dragData = active.data.current as DragItem

    if (over.data.current?.action === 'UNASSIGN') {
      if (!dragData.fromPenId) return // Already unassigned
      
      setPendingMove({
        pig: dragData.pig,
        fromPenId: dragData.fromPenId,
        fromPenName: dragData.fromPenName,
        toLayoutCode: 'UNASSIGN',
        toPenName: 'Danh sách chờ',
        action: 'UNASSIGN'
      })
      return
    }

    const dropPen = over.data.current?.pen as PenData | undefined

    if (!dropPen && !over.data.current?.layoutCode) return
    if (dropPen && dropPen.id === dragData.fromPenId) return
    
    // Check capacity if pen exists
    if (dropPen && dropPen.pigs.length >= dropPen.capacity) {
      toast.error('Ô chuồng đã đầy', {
        description: `${dropPen.name} đã đạt sức chứa tối đa (${dropPen.capacity})`,
      })
      return
    }

    // Show confirmation dialog
    setPendingMove({
      pig: dragData.pig,
      fromPenId: dragData.fromPenId,
      fromPenName: dragData.fromPenName,
      toPenId: dropPen?.id,
      toLayoutCode: over.data.current?.layoutCode,
      toPenName: dropPen?.name || over.data.current?.label || over.data.current?.layoutCode,
    })
  }, [])

  const handleConfirmMove = useCallback(async () => {
    if (!pendingMove) return
    setIsMoving(true)

    try {
      let result;
      if (pendingMove.action === 'UNASSIGN') {
        result = await unassignPig(pendingMove.pig.id)
      } else {
        result = await movePigToLayoutPen({
          pigId: pendingMove.pig.id,
          layoutCode: pendingMove.toLayoutCode,
          penName: pendingMove.toPenName,
          reason: `Chuyển từ ${pendingMove.fromPenName} sang ${pendingMove.toPenName} qua sơ đồ`,
        })
      }

      if (!result.success) {
        toast.error('Lỗi chuyển lợn', { description: result.error })
      } else {
        toast.success('Đã chuyển lợn thành công', {
          description: `${pendingMove.pig.code} → ${pendingMove.toPenName}`,
          icon: <MoveRight className="w-4 h-4" />,
        })
        queryClient.invalidateQueries({ queryKey: ['barnHierarchy'] })
      }
    } catch {
      toast.error('Đã có lỗi xảy ra')
    } finally {
      setIsMoving(false)
      setPendingMove(null)
    }
  }, [pendingMove, queryClient])

  // ── Stats ──
  const totalPigs = allPens.reduce((acc, p) => acc + p.pigs.length, 0)
  const totalPens = allPens.length
  const emptyPens = allPens.filter(p => p.pigs.length === 0).length

  const confirmOverlay = pendingMove ? (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-popover border shadow-2xl rounded-xl w-full max-w-md p-0 overflow-hidden animate-in zoom-in-95 duration-200 text-popover-foreground">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MoveRight className="w-5 h-5 text-emerald-600" />
            Xác nhận chuyển lợn
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Bạn có muốn chuyển lợn này?</p>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg text-sm">
            <div className="text-center shrink-0">
              <div className="font-bold text-foreground">{pendingMove.pig.earTag || pendingMove.pig.code}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {pendingMove.pig.earTag ? pendingMove.pig.code : (pendingMove.pig.name || 'Chưa đặt tên')}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-xs font-medium truncate max-w-[120px]" title={pendingMove.fromPenName || 'Chưa có ô'}>
                {pendingMove.fromPenName || 'Chưa có ô'}
              </span>
              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded text-xs font-medium truncate max-w-[120px]" title={pendingMove.toPenName}>
                {pendingMove.toPenName}
              </span>
            </div>
          </div>
        </div>
        <div className="p-4 border-t bg-muted/30 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => setPendingMove(null)} disabled={isMoving}>
            Hủy
          </Button>
          <Button onClick={handleConfirmMove} disabled={isMoving} className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[140px]">
            {isMoving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang chuyển...
              </span>
            ) : (
              'Xác nhận chuyển'
            )}
          </Button>
        </div>
      </div>
    </div>
  ) : null

  const pigMenuOverlay = (
    <Dialog open={pigMenuOpen} onOpenChange={setPigMenuOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Lợn: {selectedPigInfo?.pig.code}</DialogTitle>
          <DialogDescription>
            Ô hiện tại: {selectedPigInfo?.fromPenName || 'Chưa phân ô'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-4">
          <Button 
            className="w-full justify-start gap-3 h-12 bg-emerald-600 hover:bg-emerald-700 text-white" 
            onClick={() => { 
              setMovingPig(selectedPigInfo); 
              setPigMenuOpen(false); 
              toast('Vui lòng chọn ô chuồng để chuyển đến');
            }}
          >
            <MoveRight className="w-5 h-5" />
            Di chuyển sang ô khác
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start gap-3 h-12"
            onClick={() => { 
              setDetailsDialogOpen(true);
              setPigMenuOpen(false);
            }}
          >
            <Search className="w-5 h-5" />
            Xem thông tin chi tiết
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start gap-3 h-12"
            onClick={() => { 
              setDetailsDialogOpen(true);
              setPigMenuOpen(false);
            }}
          >
            <RotateCcw className="w-5 h-5" />
            Ghi nhật ký
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )

  const detailsOverlay = (
    <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Thông tin lợn {selectedPigInfo?.pig.code}</DialogTitle>
          <DialogDescription>
            Chi tiết và nhật ký hoạt động
          </DialogDescription>
        </DialogHeader>
        <div className="py-6 text-center text-muted-foreground border-2 border-dashed rounded-xl mt-2">
          <p className="font-medium mb-2">Tính năng đang được phát triển</p>
          <p className="text-sm">Giao diện chi tiết và ghi chú cho từng con sẽ được cập nhật ở phiên bản sau.</p>
        </div>
        <DialogFooter>
          <Button onClick={() => setDetailsDialogOpen(false)}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return (
    <LayoutContext.Provider value={{ isLocked, setIsLocked, movingPig, setMovingPig, onPenClick: handlePenClick, onPigClick: handlePigClick }}>
      {pigMenuOverlay}
      {detailsOverlay}
      
      {/* ── HEADER INFO ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <GripVertical className="w-4 h-4" />
          <span>Kéo thả mã lợn để chuyển chuồng</span>
        </div>
        <div className="flex gap-3 text-xs">
          <span className="px-2 py-1 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium">
            🐷 {totalPigs} con
          </span>
          <span className="px-2 py-1 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium">
            📦 {totalPens} ô
          </span>
          <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium">
            ⬜ {emptyPens} trống
          </span>
        </div>
      </div>

      {/* ── LEGEND ── */}
      <div className="flex flex-wrap gap-x-5 gap-y-1 mb-4 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-2.5 rounded-sm bg-gray-700 dark:bg-gray-900 inline-block" />
          <span>Lối đi</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-2.5 rounded-sm bg-sky-400 inline-block" />
          <span>Sàn lợn đẻ (13 ô)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-2.5 rounded-sm bg-white border border-gray-300 inline-block" />
          <span>Hậu bị (33 ô)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-2.5 rounded-sm bg-lime-400 inline-block" />
          <span>Chuồng đực (3 ô)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-2.5 rounded-sm bg-pink-300 inline-block" />
          <span>Lợn con (2 ô)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="w-3.5 h-2.5 rounded-sm border border-gray-300 inline-block"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
              backgroundColor: 'white',
            }}
          />
          <span>Lợn thịt (2 ô)</span>
        </div>
      </div>

      {/* ── FARM LAYOUT ── */}
      <DndContext
        id="farm-dnd-context"
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-gray-300 dark:border-gray-700 relative">
          
          {movingPig && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-white px-5 py-2.5 rounded-full shadow-lg border-2 border-white flex items-center gap-4 text-sm font-medium animate-in slide-in-from-top-4">
              <span>Đang chọn ô đích cho lợn <b>{movingPig.pig.code}</b>...</span>
              <button 
                onClick={() => setMovingPig(null)} 
                className="bg-amber-700 hover:bg-amber-800 px-3 py-1.5 rounded-full text-xs font-bold transition-colors"
              >
                Hủy
              </button>
            </div>
          )}

          {/* Map Area with Zoom/Pan */}
          <ZoomPanContainer 
            overlay={confirmOverlay}
            bottomPanel={<PigPanel pigs={initialUnassigned} allPens={allPens} />}
          >
            <div className="min-w-[720px] max-w-[960px] mx-auto p-4">
              {/* Farm Outer Walls */}
              <div className="bg-gray-700 dark:bg-gray-900 rounded-2xl p-4 shadow-2xl border border-gray-600 dark:border-gray-700 flex flex-col gap-4 relative">
                
                {/* ═════ TOP SECTION ═════ */}
                <div className="flex gap-4" style={{ minHeight: '520px' }}>

                  {/* ── Hậu Bị 16 & 17 ── */}
                  <div className="flex gap-4" style={{ width: '30%' }}>
                    <HauBiRow number={16} count={17} allPens={allPens} />
                    <HauBiRow number={17} count={16} allPens={allPens} />
                  </div>

                  {/* ── Center: Biogas + Pens 4-7 ── */}
                  <div className="flex flex-col gap-1.5" style={{ width: '35%' }}>
                    {/* Biogas (Gộp Hố chứa nước thải cũ) */}
                    <StaticBlock className="bg-white dark:bg-gray-950 border-2 border-gray-300 dark:border-gray-700 flex-[2]">
                      <span className="text-gray-800 dark:text-gray-400 text-sm tracking-widest uppercase font-bold">Biogas</span>
                    </StaticBlock>

                    {/* Pens 4, 5, 6, 7 */}
                    <div className="grid grid-cols-2 gap-1.5 flex-[2]">
                      <DroppablePen pen={getPen('4')} layoutCode="4" label="4" defaultPenName="Sàn lợn đẻ 4" variant="sow" />
                      <DroppablePen pen={getPen('6')} layoutCode="6" label="6" defaultPenName="Sàn lợn đẻ 6" variant="sow" />
                      <DroppablePen pen={getPen('5')} layoutCode="5" label="5" defaultPenName="Sàn lợn đẻ 5" variant="sow" />
                      <DroppablePen pen={getPen('7')} layoutCode="7" label="7" defaultPenName="Sàn lợn đẻ 7" variant="sow" />
                    </div>
                  </div>

                  {/* ── Right: Pens 1, 2, 3 and Empty Space ── */}
                  <div className="flex flex-col gap-4 flex-1">
                    {/* Pens 1, 2, 3 */}
                    <div className="flex flex-col gap-1.5 flex-[2.5]">
                      <DroppablePen pen={getPen('1')} layoutCode="1" label="1" defaultPenName="Sàn lợn đẻ 1" variant="sow" className="flex-1" />
                      <DroppablePen pen={getPen('2')} layoutCode="2" label="2" defaultPenName="Sàn lợn đẻ 2" variant="sow" className="flex-1" />
                      <DroppablePen pen={getPen('3')} layoutCode="3" label="3" defaultPenName="Sàn lợn đẻ 3" variant="sow" className="flex-1" />
                    </div>
                    {/* Gian trống */}
                    <div className="flex-[1.5] border-2 border-dashed border-gray-500 dark:border-gray-700 rounded-lg opacity-30 flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Gian trống</span>
                    </div>
                  </div>
                </div>

                {/* ═════ MIDDLE SECTION ═════ */}
                <div className="flex gap-4" style={{ minHeight: '120px' }}>
                  {/* Kho cám (dưới) với Cửa Ra */}
                  <div className="relative shrink-0" style={{ width: '12%' }}>
                    {/* CỬA RA (Left) */}
                    <div className="absolute top-1/2 left-0 -translate-x-full -translate-y-1/2 pr-3">
                      <ExitLabel direction="left" />
                    </div>
                    <StaticBlock
                      className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 h-full w-full"
                    >
                      <span className="text-gray-500 dark:text-gray-400 text-[11px] font-bold text-center leading-tight uppercase">
                        Kho<br />cám
                      </span>
                    </StaticBlock>
                  </div>

                  {/* Pens 13 → 8 */}
                  <div className="flex-1 flex gap-1.5">
                    {[13, 12, 11, 10, 9, 8].map(n => (
                      <DroppablePen
                        key={n}
                        pen={getPen(String(n))}
                        layoutCode={String(n)}
                        label={String(n)}
                        defaultPenName={`Sàn lợn đẻ ${n}`}
                        variant="sow"
                        className="flex-1"
                      />
                    ))}
                  </div>

                  {/* Chuồng lợn đực 1-3 */}
                  <div className="flex flex-col gap-1.5 shrink-0" style={{ width: '22%' }}>
                    {[1, 2, 3].map(n => (
                      <DroppablePen
                        key={`LD${n}`}
                        pen={getPen(`LD${n}`) || getPen(`Lợn đực ${n}`) || getPen(`Chuồng lợn đực ${n}`)}
                        layoutCode={`LD${n}`}
                        label={`Chuồng lợn đực ${n}`}
                        variant="boar"
                        className="flex-1 min-h-[30px]"
                        compact
                      />
                    ))}
                  </div>
                </div>

                {/* ═════ BOTTOM SECTION ═════ */}
                <div className="flex" style={{ minHeight: '100px' }}>
                  {/* Lợn thịt 1, 2 và Lợn con 1 */}
                  <div className="flex gap-1.5 flex-[0.78]">
                    {/* Lợn thịt 1 */}
                    <div
                      className="flex-1 rounded-lg border-2 border-gray-300 dark:border-gray-600 overflow-hidden"
                      style={{
                        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.05) 4px, rgba(0,0,0,0.05) 8px)',
                        backgroundColor: 'white',
                      }}
                    >
                      <DroppablePen pen={getPen('LT1') || getPen('Lợn thịt 1')} layoutCode="LT1" label="Lợn thịt 1" variant="fattening" className="h-full border-0 rounded-none bg-transparent" />
                    </div>

                    {/* Lợn thịt 2 */}
                    <div
                      className="flex-1 rounded-lg border-2 border-gray-300 dark:border-gray-600 overflow-hidden"
                      style={{
                        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.05) 4px, rgba(0,0,0,0.05) 8px)',
                        backgroundColor: 'white',
                      }}
                    >
                      <DroppablePen pen={getPen('LT2') || getPen('Lợn thịt 2')} layoutCode="LT2" label="Lợn thịt 2" variant="fattening" className="h-full border-0 rounded-none bg-transparent" />
                    </div>

                    {/* Lợn con 1 */}
                    <DroppablePen pen={getPen('LC1') || getPen('Lợn con 1')} layoutCode="LC1" label="Lợn con 1" variant="piglet" className="flex-[0.7]" />
                  </div>

                  {/* Lối đi dọc / Cửa ra dưới */}
                  <div className="w-[4%] relative flex items-end justify-center pb-2">
                    <ExitLabel direction="down" className="absolute -bottom-8" />
                  </div>

                  {/* Lợn con 2 */}
                  <div className="flex-[0.22] pr-1.5">
                    <DroppablePen pen={getPen('LC2') || getPen('Lợn con 2')} layoutCode="LC2" label="Lợn con 2" variant="piglet" className="h-full" />
                  </div>
                </div>

              </div>
            </div>
          </ZoomPanContainer>
        </div>

        {/* ── Drag Overlay ── */}
        <DragOverlay dropAnimation={null}>
          {activeDrag && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-white shadow-2xl border-2 border-emerald-500 scale-110 ring-4 ring-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{activeDrag.pig.code}</span>
              <ArrowRight className="w-3 h-3 text-emerald-500" />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </LayoutContext.Provider>
  )
}
