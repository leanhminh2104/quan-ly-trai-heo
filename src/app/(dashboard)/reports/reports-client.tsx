'use client'
// Bản quyền thuộc dalymmo.com

import React, { useState } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { SummaryCards } from '@/components/reports/summary-cards'
import { FinancialChart } from '@/components/reports/financial-chart'
import { PopulationChart } from '@/components/reports/population-chart'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function ReportsClient() {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/export')
      if (!response.ok) throw new Error('Export failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = 'BaoCao_TrangTrai.xlsx'
      if (contentDisposition && contentDisposition.includes('filename=')) {
        filename = contentDisposition.split('filename=')[1].replace(/"/g, '')
      }
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
      toast.success('Xuất báo cáo thành công!')
    } catch (error) {
      console.error(error)
      toast.error('Lỗi khi tải file báo cáo')
    } finally {
      setIsExporting(false)
    }
  }
  return (
    <div className="space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Báo cáo & Thống kê"
          description="Tổng hợp dữ liệu, phân tích hoạt động và tài chính của trang trại"
        />
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport} disabled={isExporting}>
            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />} 
            Xuất báo cáo Excel
          </Button>
        </div>
      </div>

      <SummaryCards />

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3 mt-4">
        <FinancialChart />
        <PopulationChart />
      </div>
    </div>
  )
}
