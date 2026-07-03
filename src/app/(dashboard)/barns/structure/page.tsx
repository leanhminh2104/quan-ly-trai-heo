'use client'
// Bản quyền thuộc dalymmo.com

import { useState } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { useBarnHierarchy } from '@/hooks/use-barn'
import { Button } from '@/components/ui/button'
import { Plus, Building2, AlignJustify, Home } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StructureModals } from '@/components/barns/structure-modals'

export default function BarnStructurePage() {
  const { data: hierarchy, isLoading } = useBarnHierarchy()
  const [modalState, setModalState] = useState<{
    type: 'zone' | 'row' | 'barn' | 'pen' | null,
    parentId?: string,
    initialData?: any
  }>({ type: null })

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Cấu trúc chuồng trại" 
        description="Quản lý sơ đồ tổ chức Khu vực, Dãy chuồng và Nhà chuồng"
        action={{
          label: 'Thêm Khu vực',
          onClick: () => setModalState({ type: 'zone' }),
          icon: <Plus className="w-4 h-4 mr-2" />
        }}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 opacity-50">
          <Card><CardContent className="h-40 animate-pulse bg-muted" /></Card>
        </div>
      ) : hierarchy?.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Chưa có dữ liệu</h3>
          <p className="mt-1 text-sm text-gray-500">Bắt đầu bằng cách tạo khu vực chăn nuôi đầu tiên.</p>
          <div className="mt-6">
            <Button onClick={() => setModalState({ type: 'zone' })} className="bg-emerald-600">
              <Plus className="w-4 h-4 mr-2" /> Thêm Khu vực
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {hierarchy?.map((zone: any) => (
            <Card key={zone.id} className="overflow-hidden border-blue-100">
              <CardHeader className="bg-blue-50/50 pb-4">
                <div className="flex items-center justify-between">
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:bg-blue-100/50 p-1.5 -ml-1.5 rounded-md transition-colors"
                    onClick={() => setModalState({ type: 'zone', initialData: zone })}
                  >
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <CardTitle className="text-lg text-blue-900">{zone.name} ({zone.code})</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setModalState({ type: 'row', parentId: zone.id })}>
                      <Plus className="w-4 h-4 mr-1" /> Thêm Dãy
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setModalState({ type: 'zone', initialData: zone })}>Sửa</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {zone.rows.length === 0 ? (
                  <div className="p-6 text-center text-sm text-gray-500">Chưa có dãy chuồng nào trong khu vực này.</div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {zone.rows.map((row: any) => (
                      <div key={row.id} className="p-4 pl-8 bg-gray-50/50">
                        <div className="flex items-center justify-between mb-4">
                          <div 
                            className="flex items-center gap-2 cursor-pointer hover:bg-emerald-50 p-1.5 -ml-1.5 rounded-md transition-colors"
                            onClick={() => setModalState({ type: 'row', initialData: row })}
                          >
                            <AlignJustify className="w-4 h-4 text-emerald-600" />
                            <span className="font-medium text-emerald-900">{row.name} ({row.code})</span>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setModalState({ type: 'barn', parentId: row.id })}>
                              <Plus className="w-3 h-3 mr-1" /> Thêm Nhà
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setModalState({ type: 'row', initialData: row })}>Sửa</Button>
                          </div>
                        </div>

                        {row.barns.length === 0 ? (
                          <div className="pl-6 text-sm text-gray-400">Chưa có nhà chuồng nào.</div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pl-6">
                            {row.barns.map((barn: any) => (
                              <Card key={barn.id} className="bg-white shadow-sm hover:shadow transition-shadow">
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between">
                                    <div 
                                      className="flex items-center gap-2 cursor-pointer hover:bg-orange-50 p-1.5 -ml-1.5 rounded-md transition-colors"
                                      onClick={() => setModalState({ type: 'barn', initialData: barn })}
                                    >
                                      <Home className="w-4 h-4 text-orange-500" />
                                      <div>
                                        <div className="font-medium text-gray-900">{barn.name}</div>
                                        <div className="text-xs text-gray-500">{barn.code}</div>
                                      </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-2 text-gray-400 hover:text-gray-900" onClick={() => setModalState({ type: 'barn', initialData: barn })}>
                                      <span className="sr-only">Sửa</span>
                                      <span className="text-lg leading-none">&hellip;</span>
                                    </Button>
                                  </div>
                                  <div className="mt-3 text-xs text-gray-500 flex items-center justify-between border-b pb-2 mb-2">
                                    <span>{barn.pens?.length || 0} ô chuồng</span>
                                    <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={() => setModalState({ type: 'pen', parentId: barn.id })}>
                                      <Plus className="w-3 h-3 mr-1" /> Thêm ô
                                    </Button>
                                  </div>
                                  {barn.pens && barn.pens.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {barn.pens.map((pen: any) => (
                                        <span 
                                          key={pen.id} 
                                          className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-100 text-orange-800 border border-orange-200 cursor-pointer hover:bg-orange-200 transition-colors"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setModalState({ type: 'pen', initialData: pen })
                                          }}
                                        >
                                          {pen.name}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <StructureModals 
        isOpen={modalState.type !== null}
        type={modalState.type}
        parentId={modalState.parentId}
        initialData={modalState.initialData}
        onClose={() => setModalState({ type: null })}
      />
    </div>
  )
}
