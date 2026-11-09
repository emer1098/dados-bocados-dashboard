import React from 'react'
import { Download, BarChart3, TrendingUp } from 'lucide-react'

export interface ReportesModuleProps {
  sales: any[]
  products: any[]
  totalSalesAmount: number
  onExportCSV: () => void
}

export function ReportesModule({
  sales,
  products,
  totalSalesAmount,
  onExportCSV,
}: ReportesModuleProps) {
  const averageTicket = sales.length > 0 ? totalSalesAmount / sales.length : 0

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <span className="eyebrow">NEGOCIO · RENDIMIENTO COMERCIAL</span>
          <h1 className="text-3xl font-bold font-cormorant text-[#1a1b21] mt-1">Reportes y Analítica</h1>
          <p className="text-sm text-[#555869] mt-0.5">Métricas de facturación, rotación de productos y ticket promedio en Soles.</p>
        </div>
        <button
          onClick={onExportCSV}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-[#1a1b21] text-white hover:opacity-90 transition-opacity"
        >
          <Download className="w-3.5 h-3.5" /> Exportar balance Excel
        </button>
      </div>

      {/* 3 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="living-card p-5 flex flex-col gap-1">
          <div className="w-8 h-8 rounded-xl bg-[oklch(92%_0.06_55)]/40 text-[oklch(48%_0.16_45)] flex items-center justify-center mb-2">
            <BarChart3 className="w-4 h-4" />
          </div>
          <span className="eyebrow">Recaudación Histórica</span>
          <span className="text-2xl font-extrabold text-[#1a1b21] tabular-nums">S/ {totalSalesAmount.toFixed(2)}</span>
          <span className="text-xs text-[#555869]">Total acumulado en caja</span>
        </div>

        <div className="living-card p-5 flex flex-col gap-1">
          <div className="w-8 h-8 rounded-xl bg-[oklch(92%_0.06_55)]/40 text-[oklch(48%_0.16_45)] flex items-center justify-center mb-2">
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="eyebrow">Comprobantes Emitidos</span>
          <span className="text-2xl font-extrabold text-[#1a1b21] tabular-nums">{sales.length}</span>
          <span className="text-xs text-[#555869]">Transacciones completadas</span>
        </div>

        <div className="living-card p-5 flex flex-col gap-1">
          <div className="w-8 h-8 rounded-xl bg-[oklch(92%_0.06_55)]/40 text-[oklch(48%_0.16_45)] flex items-center justify-center mb-2">
            <BarChart3 className="w-4 h-4" />
          </div>
          <span className="eyebrow">Ticket Promedio</span>
          <span className="text-2xl font-extrabold text-[#1a1b21] tabular-nums">S/ {averageTicket.toFixed(2)}</span>
          <span className="text-xs text-[#555869]">Consumo promedio por comanda</span>
        </div>
      </div>

      {/* Tabla de productos con mayor rotación */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold font-cormorant text-[#1a1b21] m-0">
            Productos con Mayor Rotación
          </h3>
          <span className="text-xs text-[#555869]">Top catálogo</span>
        </div>

        <div className="living-card overflow-hidden">
          <table className="living-table w-full">
            <thead>
              <tr>
                <th>#</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th className="text-right">Precio (S/)</th>
                <th className="text-right">Stock</th>
                <th>Rendimiento</th>
              </tr>
            </thead>
            <tbody>
              {products.slice(0, 8).map((p, idx) => (
                <tr key={p.id || idx}>
                  <td>
                    <span className="w-6 h-6 rounded-full bg-black/5 text-[11px] font-bold text-[#555869] flex items-center justify-center">
                      {idx + 1}
                    </span>
                  </td>
                  <td className="font-bold text-[#1a1b21]">{p.name}</td>
                  <td>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-black/5 text-[#555869]">
                      {p.category}
                    </span>
                  </td>
                  <td className="text-right font-extrabold text-[#1a1b21] tabular-nums">
                    S/ {(Number(p.price) || 0).toFixed(2)}
                  </td>
                  <td className={`text-right font-bold tabular-nums ${p.stock < 5 ? 'text-[#b91c1c]' : 'text-[oklch(48%_0.16_45)]'}`}>
                    {p.stock} uds.
                  </td>
                  <td>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      idx < 3
                        ? 'bg-[oklch(92%_0.06_55)]/40 text-[oklch(48%_0.16_45)]'
                        : 'bg-black/5 text-[#555869]'
                    }`}>
                      {idx < 3 ? 'Alta Rotación' : 'Demanda Regular'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
