import { InputField } from '@/components/living/InputField'
import { copy } from '@/lib/copy'
import React, { useState, useEffect } from 'react'
import {
  ShoppingBag,
  CreditCard,
  Banknote,
  Smartphone,
  Plus,
  Minus,
  Trash2,
  Download,
  ArrowLeft,
  CheckCircle2,
  Search,
  Pencil,
  X,
} from 'lucide-react'
import { useOverlayBehavior } from '@/components/hooks/useOverlayBehavior'
import { OverlayPortal } from '@/components/overlay/OverlayPortal'

export interface SaleItem {
  id: string
  name: string
  price: number
  quantity: number
}

export interface VentasModuleProps {
  sales: any[]
  products: any[]
  tables?: any[]
  onRegisterSale: (saleData: {
    total: number
    items: string
    paymentMethod: string
    table: string
  }) => Promise<boolean>
  onUpdateSale?: (id: string, data: { total?: number; paymentMethod?: string; table?: string; items?: string }) => Promise<boolean>
  onDeleteSale?: (id: string) => Promise<void>
  onExportCSV: () => void
}

export function VentasModule({
  sales,
  products,
  tables = [],
  onRegisterSale,
  onUpdateSale,
  onDeleteSale,
  onExportCSV,
}: VentasModuleProps) {
  const [viewMode, setViewMode] = useState<'history' | 'pos'>('history')
  const [cart, setCart] = useState<SaleItem[]>([])
  const [selectedTable, setSelectedTable] = useState('Mesa 01')

  // Sincronizar mesa seleccionada con las mesas reales
  useEffect(() => {
    if (tables.length > 0 && !tables.some((t: any) => t.name === selectedTable)) {
      setSelectedTable(tables[0].name)
    }
  }, [tables])
  const [paymentMethod, setPaymentMethod] = useState<'Efectivo' | 'Tarjeta' | 'Yape'>('Efectivo')
  const [categoryFilter, setCategoryFilter] = useState('Todos')
  const [productSearch, setProductSearch] = useState('')
  const [filterMethod, setFilterMethod] = useState<string>('Todos')
  const [submitting, setSubmitting] = useState(false)

  // Edición / eliminación de venta
  const [editingSale, setEditingSale] = useState<any | null>(null)
  const [editTotal, setEditTotal] = useState('')
  const [editPayment, setEditPayment] = useState<'Efectivo' | 'Tarjeta' | 'Yape'>('Efectivo')
  const [editTable, setEditTable] = useState('')
  const [editItems, setEditItems] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)
  const [deletingSale, setDeletingSale] = useState<any | null>(null)
  const [deleting, setDeleting] = useState(false)
  const editModalRef = useOverlayBehavior<HTMLDivElement>(editingSale !== null, () => setEditingSale(null))
  const deleteModalRef = useOverlayBehavior<HTMLDivElement>(deletingSale !== null, () => setDeletingSale(null))

  // Cálculos de métricas
  const totalSold = sales.reduce((acc, s) => acc + (Number(s.total) || 0), 0)
  const ticketsCount = sales.length
  const averageTicket = ticketsCount > 0 ? totalSold / ticketsCount : 0

  // Total del carrito
  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)

  // Agregar al carrito
  const addToCart = (product: any) => {
    const existing = cart.find((i) => i.id === product.id)
    if (existing) {
      setCart(
        cart.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      )
    } else {
      setCart([
        ...cart,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price) || 0,
          quantity: 1,
        },
      ])
    }
  }

  // Quitar del carrito
  const removeFromCart = (id: string) => {
    const existing = cart.find((i) => i.id === id)
    if (existing && existing.quantity > 1) {
      setCart(
        cart.map((i) =>
          i.id === id ? { ...i, quantity: i.quantity - 1 } : i
        )
      )
    } else {
      setCart(cart.filter((i) => i.id !== id))
    }
  }

  // Finalizar cobro
  const handleCheckout = async () => {
    if (cart.length === 0) return
    setSubmitting(true)
    const itemsDescription = cart
      .map((i) => `${i.quantity}x ${i.name}`)
      .join(', ')

    const success = await onRegisterSale({
      total: cartTotal,
      items: itemsDescription,
      paymentMethod,
      table: selectedTable,
    })

    if (success) {
      setCart([])
      setViewMode('history')
    }
    setSubmitting(false)
  }

  // Categorías automáticas extraídas de los productos existentes
  const availableCategories = [
    'Todos',
    ...Array.from(new Set(products.map((p) => p.subCategory || p.category || 'General'))).filter(Boolean),
  ]

  // Filtrado de productos para el POS
  const filteredProducts = products.filter((p) => {
    const matchesCat =
      categoryFilter === 'Todos' ||
      p.category === categoryFilter ||
      p.subCategory === categoryFilter
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase())
    return matchesCat && matchesSearch
  })

  // Filtrado de historial
  const filteredSales = sales.filter((s) => {
    if (filterMethod === 'Todos') return true
    return s.paymentMethod === filterMethod
  })

  // Render método de pago con icono (Living badges)
  const renderPaymentBadge = (method: string) => {
    if (method === 'Tarjeta') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
          💳 Tarjeta
        </span>
      )
    }
    if (method === 'Yape' || method === 'Plin') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700">
          📱 {method}
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[oklch(92%_0.06_55)]/40 text-[oklch(48%_0.16_45)]">
        💵 Efectivo
      </span>
    )
  }

  const openEditSale = (sale: any) => {
    setEditingSale(sale)
    setEditTotal(String(sale.total ?? ''))
    setEditPayment((sale.paymentMethod as any) || 'Efectivo')
    setEditTable(sale.table || 'Mostrador')
    setEditItems(sale.items || '')
  }

  const handleSaveEdit = async () => {
    if (!editingSale || !onUpdateSale) return
    const totalNum = Number(editTotal)
    if (Number.isNaN(totalNum) || totalNum < 0) {
      return
    }
    setSavingEdit(true)
    const ok = await onUpdateSale(editingSale.id, {
      total: totalNum,
      paymentMethod: editPayment,
      table: editTable,
      items: editItems,
    })
    setSavingEdit(false)
    if (ok) setEditingSale(null)
  }

  const handleConfirmDelete = async () => {
    if (!deletingSale || !onDeleteSale) return
    setDeleting(true)
    await onDeleteSale(deletingSale.id)
    setDeleting(false)
    setDeletingSale(null)
  }


  return (
    <div className="flex flex-col gap-6 pb-12">
      {viewMode === 'history' ? (
        <>
          {/* ── Header Living ── */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <span className="eyebrow">OPERACIONES · CAJA</span>
              <h1 className="text-3xl font-bold font-cormorant text-[#1a1b21] mt-1">
                Ventas y Caja
              </h1>
              <p className="text-sm text-[#555869] mt-0.5">
                Registro de tickets y cobro en Soles.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setViewMode('pos')}
                className="bg-[#1a1b21] text-white rounded-full px-4 py-2 text-xs font-bold hover:opacity-90 inline-flex items-center gap-1.5 transition-opacity sheen"
              >
                <Plus className="w-3.5 h-3.5" />
                Nueva venta
              </button>
              <button
                onClick={onExportCSV}
                className="bg-black/5 text-[#1a1b21] rounded-full px-4 py-2 text-xs font-bold hover:bg-black/10 inline-flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Exportar CSV
              </button>
            </div>
          </div>

          {/* ── 3 KPI Cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="living-card bloom p-5 flex flex-col gap-1">
              <span className="eyebrow">TOTAL VENDIDO</span>
              <span className="text-3xl font-extrabold text-[#1a1b21] tabular-nums">
                S/ {totalSold.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-[#555869]">Recaudación neta del día</span>
            </div>

            <div className="living-card bloom p-5 flex flex-col gap-1">
              <span className="eyebrow">TICKETS EMITIDOS</span>
              <span className="text-3xl font-extrabold text-[#1a1b21] tabular-nums">
                {ticketsCount}
              </span>
              <span className="text-xs text-[#555869]">Comprobantes generados</span>
            </div>

            <div className="living-card bloom p-5 flex flex-col gap-1">
              <span className="eyebrow">TICKET PROMEDIO</span>
              <span className="text-3xl font-extrabold text-[#1a1b21] tabular-nums">
                S/ {averageTicket.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-[#555869]">Gasto promedio por comanda</span>
            </div>
          </div>

          {/* ── Filtros de Métodos de Pago ── */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-[#555869] mr-1">Filtrar por:</span>
            {['Todos', 'Efectivo', 'Tarjeta', 'Yape'].map((m) => (
              <button
                key={m}
                onClick={() => setFilterMethod(m)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${filterMethod === m
                    ? 'bg-[#1a1b21] text-white'
                    : 'bg-black/5 text-[#555869] hover:bg-black/10'
                  }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* ── Tabla de Ventas o Estado Vacío ── */}
          {filteredSales.length === 0 ? (
            <div className="living-card p-12 flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-black/5 flex items-center justify-center">
                <ShoppingBag className="w-7 h-7 text-[#555869]" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-base font-bold text-[#1a1b21]">Aún no hay ventas registradas</p>
                <p className="text-sm text-[#555869] max-w-sm">
                  Empieza cobrando el primer ticket de café, waffles o juegos en el mostrador.
                </p>
              </div>
              <button
                onClick={() => setViewMode('pos')}
                className="bg-[#1a1b21] text-white rounded-full px-4 py-2 text-xs font-bold hover:opacity-90 transition-opacity"
              >
                Realizar primera venta
              </button>
            </div>
          ) : (
            <div className="living-card overflow-hidden">
              <table className="living-table w-full">
                <thead>
                  <tr>
                    <th>ID Ticket</th>
                    <th>Mesa / Ubicación</th>
                    <th>Detalle de Productos</th>
                    <th>Método de Pago</th>
                    <th className="text-right">Total Cobrado</th>
                    <th className="text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale, idx) => (
                    <tr key={sale.id || idx}>
                      <td className="font-mono text-xs text-[#555869]">
                        #{sale.id ? sale.id.slice(-6).toUpperCase() : `TK-${idx + 1}`}
                      </td>
                      <td className="font-semibold text-[#1a1b21]">
                        {sale.table || 'Mostrador'}
                      </td>
                      <td className="max-w-md text-sm text-[#555869] truncate">
                        {sale.items || 'Consumo general'}
                      </td>
                      <td>{renderPaymentBadge(sale.paymentMethod || 'Efectivo')}</td>
                      <td className="text-right font-bold text-[#1a1b21] text-base tabular-nums">
                        S/ {(Number(sale.total) || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="text-right">
                        <div className="inline-flex items-center gap-1">
                          {onUpdateSale && (
                            <button
                              type="button"
                              onClick={() => openEditSale(sale)}
                              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 text-[#555869]"
                              aria-label="Editar venta"
                              title="Editar venta"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {onDeleteSale && (
                            <button
                              type="button"
                              onClick={() => setDeletingSale(sale)}
                              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#fee2e2] text-[#b91c1c]"
                              aria-label="Eliminar venta"
                              title="Eliminar venta"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        /* ===================================================
           PANTALLA DE COBRO / POS TÁCTIL
           =================================================== */
        <div className="flex flex-col gap-6">
          {/* POS Header */}
          <div className="flex items-center justify-between pb-4 border-b border-black/8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode('history')}
                className="bg-black/5 text-[#1a1b21] rounded-full px-4 py-2 text-xs font-bold hover:bg-black/10 inline-flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Volver
              </button>
              <h1 className="text-3xl font-bold font-cormorant text-[#1a1b21] m-0">
                Terminal de Cobro POS
              </h1>
            </div>
            <span className="text-xs font-semibold text-[#555869]">
              {products.length} productos disponibles
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── Columna Izquierda: Categorías, Buscador y Productos ── */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {/* Macro-track de categorías dinámicas */}
              <div className="flex bg-black/5 p-1 rounded-full border border-black/8 overflow-x-auto gap-1">
                {availableCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${categoryFilter === cat
                        ? 'bg-[#1a1b21] text-white shadow-xs'
                        : 'text-[#555869] hover:text-[#1a1b21]'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Buscador táctil */}
              <InputField
                leftIcon={<Search className="w-4 h-4" />}
                placeholder={copy.placeholders.search}
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />

              {/* Cuadrícula de Productos Táctiles */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 max-h-[600px] overflow-y-auto pr-1">
                {filteredProducts.map((prod) => (
                  <button
                    key={prod.id}
                    onClick={() => addToCart(prod)}
                    className="living-card bloom p-5 text-left flex flex-col gap-2.5 hover:shadow-xl transition-all duration-300 cursor-pointer active:scale-95 squircle"
                  >
                    {prod.image && (
                      <div className="w-full h-24 rounded-xl overflow-hidden bg-black/5">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-base font-bold text-[#1a1b21] leading-tight line-clamp-2">
                        {prod.name}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#555869] bg-black/5 px-2 py-0.5 rounded-full shrink-0">
                        {prod.category === 'Alimentos y bebidas' ? 'A&B' : prod.category === 'Juegos de mesa' ? 'Juegos' : prod.category}
                      </span>
                    </div>
                    <span className="text-xl font-extrabold text-[#1a1b21] tabular-nums">
                      S/ {(Number(prod.price) || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Columna Derecha: Ticket de Venta ── */}
            <div className="bg-white rounded-3xl border border-black/6 shadow-sm p-6 flex flex-col gap-4">
              {/* Cart Header */}
              <div className="flex items-center justify-between pb-3 border-b border-black/8">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#555869]" />
                  <h3 className="text-lg font-bold font-cormorant text-[#1a1b21] m-0">
                    Ticket de Venta
                  </h3>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={() => setCart([])}
                    className="text-xs text-red-500 hover:text-red-700 hover:underline transition-colors"
                  >
                    Vaciar
                  </button>
                )}
              </div>

              {/* Selección de Mesa con indicador de estado en vivo */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#555869]">Mesa / Destino:</label>
                  {(() => {
                    const selObj = tables.find((t: any) =>
                      t.name === selectedTable ||
                      (t.name.replace(/\D/g, '') && t.name.replace(/\D/g, '') === selectedTable.replace(/\D/g, ''))
                    )
                    if (!selObj) {
                      return (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/5 text-[#555869]">
                          Mostrador
                        </span>
                      )
                    }
                    return (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selObj.status === 'Ocupada'
                          ? 'bg-[#fee2e2] text-[#b91c1c] border border-[#fca5a5]'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                        {selObj.status === 'Ocupada' ? '● Ocupada' : '✓ Libre'}
                      </span>
                    )
                  })()}
                </div>
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="living-select text-xs font-semibold h-11"
                >
                  <option value="Para Llevar">Para Llevar / Mostrador</option>
                  {tables.map((t: any) => (
                    <option key={t.id || t.name} value={t.name}>
                      {t.name} {t.status === 'Ocupada' ? '— (Ocupada)' : '— (Libre)'}
                    </option>
                  ))}
                </select>

                {/* Banner de estado de mesa en vivo */}
                {(() => {
                  const selObj = tables.find((t: any) =>
                    t.name === selectedTable ||
                    (t.name.replace(/\D/g, '') && t.name.replace(/\D/g, '') === selectedTable.replace(/\D/g, ''))
                  )
                  if (!selObj) return null
                  return (
                    <div className={`p-2 rounded-xl text-xs flex items-center justify-between ${selObj.status === 'Ocupada'
                        ? 'bg-amber-50 border border-amber-200 text-amber-900'
                        : 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                      }`}>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${selObj.status === 'Ocupada' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        <span className="font-semibold">
                          {selObj.status === 'Ocupada'
                            ? `Mesa ocupada · Consumo S/ ${(Number(selObj.currentBill) || 0).toFixed(2)}`
                            : 'Mesa libre · Se marcará ocupada al cobrar'}
                        </span>
                      </div>
                    </div>
                  )
                })()}
              </div>

              {/* Lista de productos en carrito */}
              <div className="flex flex-col divide-y divide-black/6 max-h-60 overflow-y-auto pr-1 flex-1">
                {cart.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#555869]">
                    Toca un producto de la izquierda para agregarlo a la comanda.
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between gap-2">
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-xs font-bold text-[#1a1b21] truncate">
                          {item.name}
                        </span>
                        <span className="text-[11px] text-[#555869] tabular-nums">
                          S/ {item.price.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} c/u
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-6 h-6 rounded-full bg-black/5 text-[#555869] flex items-center justify-center hover:bg-black/10 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold tabular-nums w-4 text-center text-[#1a1b21]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => addToCart(item)}
                          className="w-6 h-6 rounded-full bg-black/5 text-[#555869] flex items-center justify-center hover:bg-black/10 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs font-bold text-[#1a1b21] tabular-nums shrink-0 w-16 text-right">
                        S/ {(item.price * item.quantity).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Métodos de Pago y Total */}
              <div className="flex flex-col gap-4 pt-4 border-t border-black/8">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#555869]">Método de Pago:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'Efectivo', icon: Banknote },
                      { id: 'Tarjeta', icon: CreditCard },
                      { id: 'Yape', icon: Smartphone },
                    ].map((m) => {
                      const IconComp = m.icon
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setPaymentMethod(m.id as any)}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-semibold gap-1 transition-all ${paymentMethod === m.id
                              ? 'bg-[#1a1b21] text-white border-[#1a1b21]'
                              : 'bg-white text-[#555869] border-black/10 hover:bg-black/5'
                            }`}
                        >
                          <IconComp className="w-4 h-4" />
                          <span>{m.id}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Gran Total */}
                <div className="p-3.5 rounded-2xl bg-black/4 flex items-baseline justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#555869]">
                    Total a Cobrar:
                  </span>
                  <span className="text-2xl font-black text-[#1a1b21] tabular-nums">
                    S/ {cartTotal.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <button
                  disabled={cart.length === 0 || submitting}
                  onClick={handleCheckout}
                  className="w-full bg-[#1a1b21] text-white rounded-full px-4 py-3 text-sm font-bold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity inline-flex items-center justify-center gap-2 sheen"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Procesando…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Cobrar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal Editar Venta */}
      {editingSale && (
        <OverlayPortal>
          <div ref={editModalRef} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 ">
            <div className="glass-card !bg-white max-w-md w-full !p-6 flex flex-col gap-5 living-zoom-in">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold font-cormorant text-[#1a1b21] m-0">Editar venta</h2>
                  <p className="text-xs text-[#555869] mt-0.5">Ticket #{editingSale.id?.slice(-6).toUpperCase()}</p>
                </div>
                <button onClick={() => setEditingSale(null)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/8 text-[#555869]">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <InputField
                label="Total (S/)"
                prefixText="S/"
                type="number"
                min="0"
                step="0.01"
                value={editTotal}
                onChange={(e) => setEditTotal(e.target.value)}
                className="font-bold numeral-clean"
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#1a1b21]">Método de pago:</label>
                <select value={editPayment} onChange={(e) => setEditPayment(e.target.value as any)} className="living-select">
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta">Tarjeta</option>
                  <option value="Yape">Yape</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#1a1b21]">Mesa / Ubicación:</label>
                <input type="text" value={editTable} onChange={(e) => setEditTable(e.target.value)} className="living-input text-base" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#1a1b21]">Detalle de productos:</label>
                <textarea value={editItems} onChange={(e) => setEditItems(e.target.value)} className="living-input text-sm" rows={2} />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-black/6">
                <button type="button" onClick={() => setEditingSale(null)} className="px-4 py-2 rounded-full text-xs font-bold bg-black/5 text-[#1a1b21] hover:bg-black/10 transition-colors">
                  Cancelar
                </button>
                <button type="button" onClick={handleSaveEdit} disabled={savingEdit} className="px-5 py-2 rounded-full text-xs font-bold bg-[#1a1b21] text-white hover:opacity-90 transition-opacity disabled:opacity-50">
                  {savingEdit ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </OverlayPortal>
      )}

      {/* Modal Confirmar Eliminación */}
      {deletingSale && (
        <OverlayPortal>
          <div ref={deleteModalRef} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 ">
            <div className="glass-card !bg-white max-w-sm w-full !p-6 flex flex-col gap-4 text-center living-zoom-in">
              <div className="w-12 h-12 rounded-2xl bg-[#fee2e2] text-[#b91c1c] flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-cormorant text-[#1a1b21] m-0">Eliminar venta</h3>
                <p className="text-xs text-[#555869] mt-1">
                  ¿Eliminar el ticket #{deletingSale.id?.slice(-6).toUpperCase()} por S/ {(Number(deletingSale.total) || 0).toFixed(2)}? Esta acción no se puede deshacer.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button type="button" onClick={() => setDeletingSale(null)} className="flex-1 px-4 py-2 rounded-full text-xs font-bold bg-black/5 text-[#1a1b21] hover:bg-black/10 transition-colors">
                  Cancelar
                </button>
                <button type="button" onClick={handleConfirmDelete} disabled={deleting} className="flex-1 px-4 py-2 rounded-full text-xs font-bold bg-[#b91c1c] text-white hover:opacity-90 transition-opacity disabled:opacity-50">
                  {deleting ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </OverlayPortal>
      )}
    </div>
  )
}
