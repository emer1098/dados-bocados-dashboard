import React from 'react'
import {
  ShoppingBag,
  Gamepad2,
  Package,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react'

export interface DashboardModuleProps {
  totalSalesAmount: number
  sales: any[]
  products: any[]
  tables: any[]
  ingredients: any[]
  onNavigate: (module: string, path: string) => void
}

export function DashboardModule({
  totalSalesAmount,
  sales,
  products,
  tables,
  ingredients,
  onNavigate,
}: DashboardModuleProps) {
  const activeTables = tables.filter((t) => t.status === 'Ocupada').length
  const lowIngredients = ingredients.filter((i) => i.currentStock <= i.minStock)
  const lowProducts = products.filter((p) => p.stock < 5)
  const inventoryValue = products.reduce((acc, p) => acc + (Number(p.price) || 0) * (Number(p.stock) || 0), 0)
  const avgTicket = sales.length > 0 ? totalSalesAmount / sales.length : 0

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div>
        <span className="eyebrow">NEGOCIO · SUPERVISIÓN GENERAL</span>
        <h1 className="text-3xl font-bold font-cormorant text-[#1a1b21] mt-1">Resumen Diario</h1>
        <p className="text-sm text-[#555869] mt-0.5">Flujo comercial, disponibilidad de mesas y existencias de almacén en tiempo real.</p>
      </div>

      {/* 4 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="living-card p-5 flex flex-col gap-1">
          <div className="w-8 h-8 rounded-xl bg-[oklch(92%_0.06_55)]/40 text-[oklch(48%_0.16_45)] flex items-center justify-center mb-2">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <span className="eyebrow">Ventas Acumuladas</span>
          <span className="text-2xl font-extrabold text-[#1a1b21] tabular-nums">S/ {totalSalesAmount.toFixed(2)}</span>
          <span className="text-xs text-[#555869]">{sales.length} tickets · Prom. S/ {avgTicket.toFixed(2)}</span>
        </div>

        <div className="living-card p-5 flex flex-col gap-1">
          <div className="w-8 h-8 rounded-xl bg-[oklch(92%_0.06_55)]/40 text-[oklch(48%_0.16_45)] flex items-center justify-center mb-2">
            <Package className="w-4 h-4" />
          </div>
          <span className="eyebrow">Valor de Inventario</span>
          <span className="text-2xl font-extrabold text-[#1a1b21] tabular-nums">S/ {inventoryValue.toFixed(2)}</span>
          <span className="text-xs text-[#555869]">{products.length} productos en catálogo</span>
        </div>

        <div className="living-card p-5 flex flex-col gap-1">
          <div className="w-8 h-8 rounded-xl bg-[oklch(92%_0.06_55)]/40 text-[oklch(48%_0.16_45)] flex items-center justify-center mb-2">
            <Gamepad2 className="w-4 h-4" />
          </div>
          <span className="eyebrow">Mesas Ocupadas</span>
          <span className="text-2xl font-extrabold text-[#1a1b21] tabular-nums">
            {activeTables} <span className="text-base font-normal text-[#555869]">/ {tables.length}</span>
          </span>
          <span className="text-xs text-[#555869]">Partidas en curso en ludoteca</span>
        </div>

        <div className="living-card p-5 flex flex-col gap-1">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${(lowIngredients.length + lowProducts.length) > 0 ? 'bg-[#fee2e2] text-[#b91c1c]' : 'bg-[oklch(92%_0.06_55)]/40 text-[oklch(48%_0.16_45)]'}`}>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <span className="eyebrow">Alertas de Stock</span>
          <span className={`text-2xl font-extrabold tabular-nums ${(lowIngredients.length + lowProducts.length) > 0 ? 'text-[#b91c1c]' : 'text-[oklch(48%_0.16_45)]'}`}>
            {lowIngredients.length + lowProducts.length}
          </span>
          <span className="text-xs text-[#555869]">Ítems por debajo del mínimo</span>
        </div>
      </div>

      {/* Panel dividido: Ventas + Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Últimas ventas */}
        <div className="lg:col-span-2 living-card p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold font-cormorant text-[#1a1b21] m-0">Últimas Transacciones</h3>
            <button
              onClick={() => onNavigate('ventas', '/ventas')}
              className="text-xs font-bold text-[oklch(48%_0.16_45)] flex items-center gap-1 hover:gap-2 transition-all"
            >
              Ver todas <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {sales.length === 0 ? (
            <p className="text-xs text-[#555869] text-center py-8">No hay ventas registradas hoy.</p>
          ) : (
            <table className="living-table w-full">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Mesa / Ubicación</th>
                  <th>Productos</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {sales.slice(0, 6).map((s, idx) => (
                  <tr key={s.id || idx}>
                    <td className="font-mono text-xs text-[#555869]">
                      #{s.id ? s.id.slice(-6).toUpperCase() : `TK-${idx + 1}`}
                    </td>
                    <td className="font-semibold text-[#1a1b21]">{s.table || 'Mostrador'}</td>
                    <td className="text-xs text-[#555869] max-w-[180px] truncate">{s.items || 'Consumo'}</td>
                    <td className="font-bold text-[#1a1b21] tabular-nums text-right">
                      S/ {(Number(s.total) || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Alertas críticas */}
        <div className="living-card p-6 flex flex-col gap-4">
          <h3 className="text-xl font-bold font-cormorant text-[#1a1b21] m-0">Alertas de Reposición</h3>

          {lowIngredients.length === 0 && lowProducts.length === 0 ? (
            <p className="text-xs text-[oklch(48%_0.16_45)] font-semibold text-center py-6">
              ✓ Todo el inventario está sobre el stock mínimo.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {lowIngredients.slice(0, 5).map((ing) => (
                <div
                  key={ing.id}
                  className="p-3 rounded-2xl bg-[#fef3c7] border border-[#fde68a] flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-[#1a1b21] block">{ing.name}</span>
                    <span className="text-[#b45309]">Stock: {ing.currentStock} {ing.unit}</span>
                  </div>
                  <button
                    onClick={() => onNavigate('ingredientes', '/ingredientes')}
                    className="text-xs font-bold text-[#b45309] hover:underline"
                  >
                    Reponer
                  </button>
                </div>
              ))}

              <button
                onClick={() => onNavigate('alertas', '/alertas')}
                className="w-full px-4 py-2 rounded-full text-xs font-bold bg-black/5 text-[#1a1b21] hover:bg-black/10 transition-colors mt-2"
              >
                Ver centro de alertas ({lowIngredients.length + lowProducts.length})
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
