'use client'

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'

// Living Design System
import { LoginView } from '@/components/living/LoginView'
import { HomeCenteredView } from '@/components/living/HomeCenteredView'
import { ModuleTopPill } from '@/components/living/ModuleTopPill'
import { CommandPalette } from '@/components/living/CommandPalette'
import { ModuleSwitcher } from '@/components/living/ModuleSwitcher'

// Module Views
import { VentasModule } from '@/components/modules/VentasModule'
import { MesasModule, TableSession } from '@/components/modules/MesasModule'
import { CatalogoModule, ProductItem } from '@/components/modules/CatalogoModule'
import { IngredientesModule, IngredienteItem } from '@/components/modules/IngredientesModule'
import { RecetasModule } from '@/components/modules/RecetasModule'
import { DashboardModule } from '@/components/modules/DashboardModule'
import { FinanzasModule } from '@/components/modules/FinanzasModule'
import { ReportesModule } from '@/components/modules/ReportesModule'
import { AlertasModule } from '@/components/modules/AlertasModule'
import { ConfiguracionModule } from '@/components/modules/ConfiguracionModule'

// Config & Data
import { MODULES_CONFIG, ModuleConfig, LiveDataArgs } from '@/lib/modules.config'
import {
  RECIPES_DATA,
  checkRecipeFeasibility,
  INITIAL_INGREDIENTS_DATA,
} from '@/lib/businessData'
import excelProducts from '@/lib/excelProducts.json'

// ─── Mesas iniciales ─────────────────────────────────────────────────────────
const INITIAL_TABLES: TableSession[] = [
  { id: '1', name: 'Mesa 01 (Zona Cafetería)', status: 'Libre' },
  { id: '2', name: 'Mesa 02 (Zona Ventana)', status: 'Ocupada', currentGame: 'Catan', playersCount: 4, totalTimeMinutes: 45 },
  { id: '3', name: 'Mesa 03 (Terraza)', status: 'Libre' },
  { id: '4', name: 'Mesa 04 (Salón Principal)', status: 'Ocupada', currentGame: 'Ticket to Ride', playersCount: 3, totalTimeMinutes: 20 },
  { id: '5', name: 'Mesa 05 (VIP Ludoteca)', status: 'Libre' },
  { id: '6', name: 'Mesa 06 (Salón Principal)', status: 'Libre' },
]

export default function Page() {
  // ─── Auth ────────────────────────────────────────────────────────────────
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authUser, setAuthUser] = useState<{ username: string; name: string; role: string } | null>(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  // ─── Navegación ──────────────────────────────────────────────────────────
  // null = Inicio Centrado; string = id del módulo activo
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [moduleSwitcherOpen, setModuleSwitcherOpen] = useState(false)
  const [currentBranch, setCurrentBranch] = useState('Local Centro')
  const [notice, setNotice] = useState<string | null>(null)

  // ─── Datos ───────────────────────────────────────────────────────────────
  const [products, setProducts] = useState<ProductItem[]>([])
  const [ingredients, setIngredients] = useState<IngredienteItem[]>([])
  const [tables, setTables] = useState<TableSession[]>(INITIAL_TABLES)
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; database?: string; error?: string }>({ connected: false })

  // ─── Helpers ─────────────────────────────────────────────────────────────
  const toastTimerRef = useRef<number | null>(null)
  const showToast = useCallback((msg: string) => {
    setNotice(msg)
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current)
    toastTimerRef.current = window.setTimeout(() => {
      setNotice(null)
      toastTimerRef.current = null
    }, 3200)
  }, [])

  // Módulo activo derivado de MODULES_CONFIG
  const activeModule: ModuleConfig | null = useMemo(
    () => (activeModuleId ? MODULES_CONFIG.find((m) => m.id === activeModuleId) ?? null : null),
    [activeModuleId]
  )

  // ─── URL sync ────────────────────────────────────────────────────────────
  const navigateToModule = useCallback((mod: ModuleConfig | null) => {
    const path = mod ? mod.path : '/'
    setActiveModuleId(mod ? mod.id : null)
    setModuleSwitcherOpen(false)
    if (typeof window !== 'undefined') {
      window.history.pushState({ moduleId: mod?.id ?? null }, '', path)
      window.scrollTo({ top: 0 })
    }
  }, [])

  // Leer ruta inicial
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname
      const matched = MODULES_CONFIG.find((m) => m.path === pathname)
      if (matched) setActiveModuleId(matched.id)
      else setActiveModuleId(null)
    }
  }, [])

  // Soporte Atrás / Adelante
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const pathname = window.location.pathname
        const matched = MODULES_CONFIG.find((m) => m.path === pathname)
        setActiveModuleId(matched ? matched.id : null)
        window.scrollTo({ top: 0 })
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Sincronizar URL con estado auth
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!isAuthenticated) {
        window.history.replaceState({}, '', '/login')
      } else {
        const target = activeModule ? activeModule.path : '/'
        if (window.location.pathname !== target) {
          window.history.replaceState({ moduleId: activeModuleId }, '', target)
        }
      }
    }
  }, [activeModuleId, activeModule, isAuthenticated])

  // ─── Ctrl+K ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen((v) => !v)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  // ─── Carga de datos ──────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const fetchJson = async (url: string) => {
        const res = await fetch(url)
        if (!res.ok) return null
        return res.json()
      }

      const [healthRes, productsRes, ingredientsRes, tablesRes, salesRes] = await Promise.allSettled([
        fetchJson('/api/health'),
        fetchJson('/api/products'),
        fetchJson('/api/ingredients'),
        fetchJson('/api/tables'),
        fetchJson('/api/sales'),
      ])

      if (healthRes.status === 'fulfilled' && healthRes.value && typeof healthRes.value.connected === 'boolean') {
        setDbStatus(healthRes.value)
      } else {
        setDbStatus({ connected: false })
      }

      if (productsRes.status === 'fulfilled' && productsRes.value?.success && Array.isArray(productsRes.value.data) && productsRes.value.data.length > 0) {
        setProducts(productsRes.value.data)
      } else {
        setProducts(excelProducts as any[])
      }

      if (ingredientsRes.status === 'fulfilled' && ingredientsRes.value?.success && Array.isArray(ingredientsRes.value.data) && ingredientsRes.value.data.length > 0) {
        setIngredients(ingredientsRes.value.data)
      } else {
        setIngredients(INITIAL_INGREDIENTS_DATA.map((item, idx) => ({
          id: (idx + 1).toString(),
          name: item.name,
          category: item.category,
          currentStock: item.currentStock,
          minStock: item.minStock,
          unit: item.unit,
          unitCost: item.unitCost,
        } as IngredienteItem)))
      }

      if (tablesRes.status === 'fulfilled' && tablesRes.value?.success && Array.isArray(tablesRes.value.data) && tablesRes.value.data.length > 0) {
          setTables(tablesRes.value.data.map((t: any) => ({
            id: t.id || t._id,
            name: t.tableNumber || `Mesa ${t.tableId || '01'}`,
            status: t.status === 'Disponible' || t.status === 'Libre' ? 'Libre' : 'Ocupada',
            currentGame: t.currentGame || undefined,
            playersCount: t.players || 0,
            currentBill: Number(t.currentBill) || 0,
            totalTimeMinutes: t.startedAt ? Math.round((Date.now() - new Date(t.startedAt).getTime()) / 60000) : 0,
          })))
      }

      if (salesRes.status === 'fulfilled' && salesRes.value?.success && Array.isArray(salesRes.value.data)) {
        setSales(salesRes.value.data)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // ─── Verificar sesión al montar ──────────────────────────────────────────
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        if (data.success && data.user) {
          setIsAuthenticated(true)
          setAuthUser(data.user)
        } else {
          setIsAuthenticated(false)
          setAuthUser(null)
        }
      } catch {
        setIsAuthenticated(false)
        setAuthUser(null)
      }
    }
    checkAuth()
    loadData()
  }, [loadData])

  // ─── Handlers Auth ───────────────────────────────────────────────────────
  const handleLogin = async (u: string, p: string) => {
    setAuthLoading(true)
    setAuthError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p }),
      })
      const data = await res.json()
      if (data.success) {
        setIsAuthenticated(true)
        setAuthUser(data.user)
        showToast(`Bienvenido/a, ${data.user.name || u}`)
      } else {
        setAuthError(data.error || 'Credenciales incorrectas')
      }
    } catch {
      setAuthError('No se pudo conectar con el servidor. Inténtalo de nuevo.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleRegister = async (name: string, u: string, p: string, role: string) => {
    setAuthLoading(true)
    setAuthError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username: u, password: p, role }),
      })
      const data = await res.json()
      if (data.success) {
        setIsAuthenticated(true)
        setAuthUser({ username: u, name, role })
        showToast('Usuario creado con éxito.')
      } else {
        setAuthError(data.error || 'No se pudo crear el usuario')
      }
    } catch (err: any) {
      setAuthError(err.message || 'Error al conectar con la base de datos')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }) } catch {}
    setIsAuthenticated(false)
    setAuthUser(null)
    setActiveModuleId(null)
    showToast('Has cerrado sesión.')
  }

  // ─── Handlers CRUD ───────────────────────────────────────────────────────
  const handleCreateSale = async (saleData: { total: number; items: string; paymentMethod: string; table: string }): Promise<boolean> => {
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData),
      })
      const data = await res.json()
      if (!data.success || !data.data) {
        showToast(data.error || 'Error al registrar la venta')
        return false
      }
      setSales((prev) => [data.data, ...prev])

      // Actualizar la mesa automáticamente si la venta se asignó a una mesa real
      const tableName = saleData.table
      if (tableName && !tableName.toLowerCase().includes('llevar') && !tableName.toLowerCase().includes('mostrador')) {
        let currentBillToUpdate = 0
        let playersToUpdate = 4

        setTables((prevTables) => {
          const target = prevTables.find((t) =>
            t.name.trim().toLowerCase() === tableName.trim().toLowerCase() ||
            (t.name.replace(/\D/g, '') && t.name.replace(/\D/g, '') === tableName.replace(/\D/g, ''))
          )
          if (!target) return prevTables

          currentBillToUpdate = (Number(target.currentBill) || 0) + Number(saleData.total || 0)
          playersToUpdate = target.playersCount || 4
          const wasFree = target.status === 'Libre'

          return prevTables.map((t) =>
            t.id === target.id
              ? {
                  ...t,
                  status: 'Ocupada',
                  currentBill: currentBillToUpdate,
                  playersCount: playersToUpdate,
                  ...(wasFree ? { totalTimeMinutes: 0 } : {}),
                }
              : t
          )
        })

        const targetTable = tables.find((t) =>
          t.name.trim().toLowerCase() === tableName.trim().toLowerCase() ||
          (t.name.replace(/\D/g, '') && t.name.replace(/\D/g, '') === tableName.replace(/\D/g, ''))
        )
        if (targetTable?.id) {
          fetch('/api/tables', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: targetTable.id,
              status: 'Ocupada',
              currentBill: (Number(targetTable.currentBill) || 0) + Number(saleData.total || 0),
              players: targetTable.playersCount || 4,
              startedAt: new Date().toISOString(),
            }),
          }).catch(console.error)
        }
      }

      showToast(`Ticket cobrado: S/ ${saleData.total.toFixed(2)}`)
      return true
    } catch {
      showToast('Error al registrar la venta')
      return false
    }
  }

  const handleUpdateSale = async (id: string, updateData: { total?: number; paymentMethod?: string; table?: string; items?: string }): Promise<boolean> => {
    try {
      const res = await fetch(`/api/sales/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        showToast(data.error || 'Error al actualizar venta')
        return false
      }
      setSales((prev) => prev.map((s) => (s.id === id ? { ...s, ...updateData } : s)))
      showToast('Venta actualizada.')
      return true
    } catch {
      showToast('Error al actualizar venta')
      return false
    }
  }

  const handleDeleteSale = async (id: string) => {
    try {
      const res = await fetch(`/api/sales/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok || !data.success) {
        showToast(data.error || 'Error al eliminar venta')
        return
      }
      setSales((prev) => prev.filter((s) => s.id !== id))
      showToast('Venta eliminada.')
    } catch {
      showToast('Error al eliminar venta')
    }
  }

  const handleCreateProduct = async (prodData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prodData),
      })
      const data = await res.json()
      if (!data.success || !data.data) {
        showToast(data.error || 'Error al registrar producto')
        return false
      }
      setProducts((prev) => [data.data, ...prev])
      showToast(`${prodData.name} añadido al catálogo.`)
      return true
    } catch {
      showToast('Error al registrar producto')
      return false
    }
  }

  const handleUpdateProduct = async (id: string, updateData: Partial<ProductItem>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        showToast(data.error || 'Error al actualizar producto')
        return false
      }
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updateData } : p)))
      showToast('Producto actualizado.')
      return true
    } catch {
      showToast('Error al actualizar producto')
      return false
    }
  }

  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok || !data.success) {
        showToast(data.error || 'Error al eliminar producto')
        return
      }
      setProducts((prev) => prev.filter((p) => p.id !== id))
      showToast('Producto eliminado del catálogo.')
    } catch {
      showToast('Error al eliminar producto')
    }
  }

  const handleAdjustStock = async (id: string, delta: number, reason: string) => {
    try {
      const res = await fetch('/api/ingredients', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, stockDelta: delta }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        showToast(data.error || 'Error al actualizar stock de insumo')
        return
      }
      setIngredients((prev) => prev.map((i) => i.id === id ? { ...i, currentStock: Math.max(0, i.currentStock + delta) } : i))
      showToast(`Stock actualizado (${delta > 0 ? `+${delta}` : delta}): ${reason}`)
    } catch {
      showToast('Error al actualizar stock de insumo')
    }
  }

  const handleUpdateIngredient = async (id: string, updateData: Partial<IngredienteItem>) => {
    try {
      const res = await fetch('/api/ingredients', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updateData }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        showToast(data.error || 'Error al actualizar ingrediente')
        return
      }
      setIngredients((prev) => prev.map((i) => (i.id === id ? { ...i, ...updateData } : i)))
      showToast('Ingrediente actualizado.')
    } catch {
      showToast('Error al actualizar ingrediente')
    }
  }

  const handleDeleteIngredient = async (id: string) => {
    try {
      const res = await fetch(`/api/ingredients?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok || !data.success) {
        showToast(data.error || 'Error al eliminar ingrediente')
        return
      }
      setIngredients((prev) => prev.filter((i) => i.id !== id))
      showToast('Ingrediente eliminado del almacén.')
    } catch {
      showToast('Error al eliminar ingrediente')
    }
  }

  const handleCreateIngredient = async (ingData: any) => {
    try {
      const res = await fetch('/api/ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ingData),
      })
      const data = await res.json()
      if (!data.success || !data.data) {
        showToast(data.error || 'Error al crear ingrediente')
        return
      }
      setIngredients((prev) => [...prev, data.data])
      showToast(`Ingrediente ${ingData.name} creado.`)
    } catch {
      showToast('Error al crear ingrediente')
    }
  }

  const handleCreateTable = async (tableData: { name: string; playersCount?: number }): Promise<boolean> => {
    try {
      const res = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tableData.name, players: tableData.playersCount }),
      })
      const data = await res.json()
      if (!res.ok || !data.success || !data.data) {
        showToast(data.error || 'Error al crear mesa')
        return false
      }
      const t = data.data
      setTables((prev) => [...prev, {
        id: t.id,
        name: t.tableNumber || tableData.name,
        status: 'Libre',
        playersCount: t.players || tableData.playersCount || 4,
        totalTimeMinutes: 0,
      }])
      showToast(`Mesa ${tableData.name} creada.`)
      return true
    } catch {
      showToast('Error al crear mesa')
      return false
    }
  }
  const handleUpdateTable = async (id: string, tableData: Partial<TableSession>) => {
    try {
      const current = tables.find((t) => t.id === id)
      if (current) {
        const newName = tableData.name?.trim() || current.name
        const res = await fetch('/api/tables', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id,
              tableNumber: newName,
              status: tableData.status,
              currentGame: tableData.currentGame,
              players: tableData.playersCount,
              currentBill: tableData.currentBill,
              startedAt: tableData.status === 'Ocupada' ? new Date().toISOString() : (tableData.status === 'Libre' ? null : undefined),
            }),
        })
        if (!res.ok) {
          showToast('Error al actualizar mesa')
          return
        }
      }
      setTables((prev) => prev.map((t) => (t.id === id ? { ...t, ...tableData, name: tableData.name?.trim() || t.name } : t)))
    } catch {
      showToast('Error al actualizar mesa')
    }
  }

  const handleRenameCategory = async (oldName: string, newName: string): Promise<boolean> => {
    const trimmed = newName.trim()
    if (!trimmed || trimmed === oldName) return false
    try {
      const res = await fetch('/api/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldName, newName: trimmed }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        showToast(data.error || 'Error al renombrar categoría')
        return false
      }
      setProducts((prev) => prev.map((p) => (p.category === oldName ? { ...p, category: trimmed } : p)))
      showToast(`Categoría renombrada a "${trimmed}".`)
      return true
    } catch {
      showToast('Error al renombrar categoría')
      return false
    }
  }

  const handleDeleteCategory = async (name: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/categories?name=${encodeURIComponent(name)}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok || !data.success) {
        showToast(data.error || 'Error al eliminar categoría')
        return false
      }
      setProducts((prev) => prev.map((p) => (p.category === name ? { ...p, category: 'Otros' } : p)))
      showToast(`Categoría eliminada. Productos reasignados a "Otros".`)
      return true
    } catch {
      showToast('Error al eliminar categoría')
      return false
    }
  }
  const THIN_BORDER = {
    top: { style: 'thin', color: { argb: 'FFBFBFBF' } },
    left: { style: 'thin', color: { argb: 'FFBFBFBF' } },
    bottom: { style: 'thin', color: { argb: 'FFBFBFBF' } },
    right: { style: 'thin', color: { argb: 'FFBFBFBF' } },
  } as any

  const styleHeaderRow = (row: any, fill: string = 'FF1A1B21') => {
    row.eachCell((cell: any) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } }
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
      cell.border = THIN_BORDER
    })
    row.height = 22
  }

  const styleTitleRow = (ws: any, title: string, lastCol: number) => {
    ws.mergeCells(1, 1, 1, lastCol)
    const cell = ws.getCell(1, 1)
    cell.value = title
    cell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A1B21' } }
    cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
    ws.getRow(1).height = 26
  }

  const styleSubtitleRow = (ws: any, text: string, lastCol: number) => {
    ws.mergeCells(2, 1, 2, lastCol)
    const cell = ws.getCell(2, 1)
    cell.value = text
    cell.font = { italic: true, size: 10, color: { argb: 'FF555869' } }
    cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
    ws.getRow(2).height = 16
  }

  const styleSectionRow = (ws: any, row: number, title: string, lastCol: number) => {
    ws.mergeCells(row, 1, row, lastCol)
    const cell = ws.getCell(row, 1)
    cell.value = title
    cell.font = { bold: true, size: 12, color: { argb: 'FF1A1B21' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8E4DD' } }
    cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
    ws.getRow(row).height = 20
  }

  const addTable = (ws: any, startRow: number, headers: string[], rows: any[][], widths?: number[]) => {
    let r = startRow
    const headerRow = ws.getRow(r)
    headers.forEach((h, i) => { headerRow.getCell(i + 1).value = h })
    styleHeaderRow(headerRow)
    r++
    rows.forEach((row) => {
      const dataRow = ws.getRow(r)
      row.forEach((v, i) => { dataRow.getCell(i + 1).value = v })
      dataRow.eachCell((cell: any) => {
        cell.border = THIN_BORDER
        cell.alignment = { vertical: 'middle', wrapText: true }
        cell.font = { size: 11 }
      })
      r++
    })
    if (widths) {
      widths.forEach((w, i) => { ws.getColumn(i + 1).width = w })
    }
    return r
  }

  const downloadXlsx = async (filename: string, build: (wb: any) => void) => {
    const ExcelJS = await import('exceljs')
    const wb = new ExcelJS.Workbook()
    wb.creator = 'Dados & Bocados'
    wb.created = new Date()
    build(wb)
    const buffer = await wb.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleExportCatalogXlsx = async () => {
    await downloadXlsx(`catalogo_dados_bocados_${Date.now()}.xlsx`, (wb) => {
      const ws = wb.addWorksheet('Catalogo')
      const lastCol = 9
      styleTitleRow(ws, 'Catalogo de Productos - Dados & Bocados', lastCol)
      styleSubtitleRow(ws, `Exportado el ${new Date().toLocaleString('es-PE')}`, lastCol)
      const rows = products.map((p: any) => [
        p.id,
        p.name,
        p.category,
        p.subCategory || '',
        p.sku || '',
        Number(p.price || 0),
        Number(p.cost || 0),
        p.stock ?? 0,
        (p.image || p.imageUrl) ? 'Si' : 'No',
      ])
      addTable(ws, 4, ['ID', 'Producto', 'Categoria', 'Seccion', 'Codigo (SKU)', 'Precio (S/)', 'Costo (S/)', 'Stock (uds.)', 'Foto'], rows, [8, 34, 22, 26, 14, 12, 12, 12, 8])
      const priceCol = ws.getColumn(6)
      const costCol = ws.getColumn(7)
      priceCol.numFmt = '#,##0.00'
      costCol.numFmt = '#,##0.00'
    })
    showToast('Catalogo descargado en formato Excel.')
  }

  const handleExportSalesXlsx = async () => {
    await downloadXlsx(`ventas_dados_bocados_${Date.now()}.xlsx`, (wb) => {
      const ws = wb.addWorksheet('Ventas')
      const lastCol = 6
      styleTitleRow(ws, 'Tickets de Venta - Dados & Bocados', lastCol)
      styleSubtitleRow(ws, `Exportado el ${new Date().toLocaleString('es-PE')}`, lastCol)
      const rows = sales.map((s: any, idx: number) => [
        s.id ? `#${s.id.slice(-6).toUpperCase()}` : `TK-${idx + 1}`,
        s.table || 'Mostrador',
        s.items || 'Consumo general',
        s.paymentMethod || 'Efectivo',
        Number(s.total || 0),
        s.createdAt ? new Date(s.createdAt).toLocaleString('es-PE') : (s.time || ''),
      ])
      let r = addTable(ws, 4, ['ID Ticket', 'Mesa / Ubicacion', 'Detalle de Productos', 'Metodo de Pago', 'Total Cobrado (S/)', 'Fecha'], rows, [14, 22, 46, 16, 16, 22])
      ws.getColumn(5).numFmt = '#,##0.00'
      r += 1
      styleSectionRow(ws, r, 'Resumen', lastCol)
      r += 1
      const summaryRows = [
        ['Total vendido (S/)', totalSalesAmount],
        ['Tickets emitidos', sales.length],
        ['Ticket promedio (S/)', sales.length > 0 ? totalSalesAmount / sales.length : 0],
      ]
      const sHeader = ws.getRow(r)
      sHeader.getCell(1).value = 'Concepto'
      sHeader.getCell(2).value = 'Valor'
      styleHeaderRow(sHeader)
      r++
      summaryRows.forEach((row) => {
        const dataRow = ws.getRow(r)
        dataRow.getCell(1).value = row[0]
        dataRow.getCell(2).value = row[1]
        dataRow.eachCell((cell: any) => { cell.border = THIN_BORDER; cell.font = { size: 11 } })
        if (typeof row[1] === 'number') ws.getCell(r, 2).numFmt = '#,##0.00'
        r++
      })
    })
    showToast('Ventas descargadas en formato Excel.')
  }

  const handleExportReportsXlsx = async () => {
    await downloadXlsx(`reportes_dados_bocados_${Date.now()}.xlsx`, (wb) => {
      const ws = wb.addWorksheet('Reportes')
      const lastCol = 6
      styleTitleRow(ws, 'Reportes y Analitica - Dados & Bocados', lastCol)
      styleSubtitleRow(ws, `Exportado el ${new Date().toLocaleString('es-PE')}`, lastCol)
      let r = 4
      styleSectionRow(ws, r, 'Resumen de Rendimiento', lastCol)
      r++
      const kHeader = ws.getRow(r)
      kHeader.getCell(1).value = 'Concepto'
      kHeader.getCell(2).value = 'Valor'
      styleHeaderRow(kHeader)
      r++
      const kpiRows = [
        ['Recaudacion historica (S/)', totalSalesAmount],
        ['Comprobantes emitidos', sales.length],
        ['Ticket promedio (S/)', sales.length > 0 ? totalSalesAmount / sales.length : 0],
      ]
      kpiRows.forEach((row) => {
        const dataRow = ws.getRow(r)
        dataRow.getCell(1).value = row[0]
        dataRow.getCell(2).value = row[1]
        dataRow.eachCell((cell: any) => { cell.border = THIN_BORDER; cell.font = { size: 11 } })
        if (typeof row[1] === 'number') ws.getCell(r, 2).numFmt = '#,##0.00'
        r++
      })
      r += 1
      styleSectionRow(ws, r, 'Top Productos por Rotacion', lastCol)
      r++
      const topRows = products.slice(0, 8).map((p: any, idx: number) => [
        idx + 1,
        p.name,
        p.category,
        Number(p.price || 0),
        p.stock ?? 0,
        idx < 3 ? 'Alta Rotacion' : 'Demanda Regular',
      ])
      addTable(ws, r, ['#', 'Producto', 'Categoria', 'Precio (S/)', 'Stock (uds.)', 'Rendimiento'], topRows, [6, 34, 22, 14, 14, 18])
      ws.getColumn(4).numFmt = '#,##0.00'
    })
    showToast('Reporte descargado en formato Excel.')
  }


  // ─── Métricas derivadas ───────────────────────────────────────────────────
  const totalSalesAmount = useMemo(() => sales.reduce((acc, s) => acc + (Number(s.total) || 0), 0), [sales])
  const lowIngredientsCount = useMemo(() => ingredients.filter((i) => i.currentStock <= i.minStock).length, [ingredients])
  const readyRecipesCount = useMemo(() => RECIPES_DATA.filter((r) => checkRecipeFeasibility(r, ingredients).canPrepare).length, [ingredients])
  const activeTablesCount = useMemo(() => tables.filter((t) => t.status === 'Ocupada').length, [tables])

  const liveArgs: LiveDataArgs = {
    salesCount: sales.length,
    totalSales: totalSalesAmount,
    activeTablesCount,
    totalTablesCount: tables.length,
    lowIngredientsCount,
    readyRecipesCount,
    totalRecipesCount: RECIPES_DATA.length,
    productsCount: products.length,
  }

  // ─── Helper: ir a módulo por id ──────────────────────────────────────────
  const goToModuleById = (id: string) => {
    const mod = MODULES_CONFIG.find((m) => m.id === id)
    if (mod) navigateToModule(mod)
  }

  // ─── Acciones rápidas desde Inicio ───────────────────────────────────────
  const handleQuickAction = (key: string) => {
    const map: Record<string, string> = {
      ventas: 'ventas',
      mesas: 'mesas',
      ingredientes: 'ingredientes',
      alertas: 'alertas',
    }
    const id = map[key]
    if (id) goToModuleById(id)
  }

  // ─── Toast global flotante ───────────────────────────────────────────────
  const ToastBanner = notice ? (
    <div className="fixed top-6 right-6 z-[200] px-4 py-2.5 rounded-full bg-white border border-black/10 text-[#1a1b21] text-xs font-bold shadow-xl flex items-center gap-2 animate-fade-in">
      <span className="w-5 h-5 rounded-full bg-[oklch(48%_0.16_45)] text-white flex items-center justify-center text-[10px]">✓</span>
      <span>{notice}</span>
    </div>
  ) : null

  // ─── 1. PANTALLA DE LOGIN ─────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <>
        {ToastBanner}
        <LoginView
          onLogin={handleLogin}
          onRegister={handleRegister}
          loading={authLoading}
          error={authError}
          notice={notice || ''}
        />
      </>
    )
  }

  // ─── 2. INICIO CENTRADO (sin módulo activo) ───────────────────────────────
  if (activeModule === null) {
    return (
      <div className="living-bg">
        {ToastBanner}

        <CommandPalette
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
          onNavigateModule={(id) => goToModuleById(id)}
          onTriggerAction={(action) => handleQuickAction(action)}
          products={products}
        />

        <HomeCenteredView
          userName={authUser?.name || 'María'}
          userRole={authUser?.role || 'Administradora'}
          currentBranch={currentBranch}
          onChangeBranch={setCurrentBranch}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onSelectModule={navigateToModule}
          onQuickAction={handleQuickAction}
          onLogout={handleLogout}
          liveArgs={liveArgs}
        />
      </div>
    )
  }

  // ─── 3. MÓDULO ACTIVO (con píldora flotante) ──────────────────────────────
  return (
    <div className="living-bg min-h-screen">
      {ToastBanner}

      {/* Píldora flotante de navegación — centrada, sin sidebar */}
      <ModuleTopPill
        currentModule={activeModule}
        onBackToHome={() => navigateToModule(null)}
        onOpenModuleSwitcher={() => setModuleSwitcherOpen(true)}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        currentBranch={currentBranch}
        onChangeBranch={setCurrentBranch}
        unreadAlertsCount={lowIngredientsCount}
        onOpenAlerts={() => goToModuleById('alertas')}
        userName={authUser?.name}
        userRole={authUser?.role}
        onLogout={handleLogout}
      />

      {/* CommandPalette (Ctrl+K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigateModule={(id) => goToModuleById(id)}
        onTriggerAction={(action) => handleQuickAction(action)}
        products={products}
      />

      {/* Selector de módulo (dropdown desde la píldora) */}
      <ModuleSwitcher
        isOpen={moduleSwitcherOpen}
        onClose={() => setModuleSwitcherOpen(false)}
        currentModuleId={activeModule.id}
        onSelectModule={navigateToModule}
      />

      {/* Área principal del módulo — margen top para no quedar bajo la píldora */}
      <main className="max-w-[1500px] w-full mx-auto px-3 sm:px-4 md:px-8 pb-20 min-w-0">
        <div key={activeModuleId ?? 'home'} className="living-fade-up">

        {/* VENTAS Y CAJA */}
        {activeModule.id === 'ventas' && (
          <VentasModule
            sales={sales}
            products={products}
            tables={tables}
            onRegisterSale={handleCreateSale}
            onUpdateSale={handleUpdateSale}
            onDeleteSale={handleDeleteSale}
onExportCSV={handleExportSalesXlsx}
          />
        )}

        {/* MESAS Y LUDOTECA */}
        {activeModule.id === 'mesas' && (
          <MesasModule
            tables={tables}
            onUpdateTable={handleUpdateTable}
            onCreateTable={handleCreateTable}
            onShowToast={showToast}
            onNavigateToPOS={(tableName) => goToModuleById('ventas')}
          />
        )}

        {/* CATÁLOGO DE VENTA */}
        {activeModule.id === 'catalogo' && (
          <CatalogoModule
            products={products}
            onCreateProduct={handleCreateProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onRenameCategory={handleRenameCategory}
            onDeleteCategory={handleDeleteCategory}
onExportCSV={handleExportCatalogXlsx}
          />
        )}

        {/* INGREDIENTES */}
        {activeModule.id === 'ingredientes' && (
          <IngredientesModule
            ingredients={ingredients}
            onAdjustStock={handleAdjustStock}
            onUpdateIngredient={handleUpdateIngredient}
            onDeleteIngredient={handleDeleteIngredient}
            onCreateIngredient={handleCreateIngredient}
          />
        )}

        {/* RECETAS Y COCINA */}
        {activeModule.id === 'cocina' && (
          <RecetasModule
            ingredients={ingredients}
            onNavigateToIngredients={() => goToModuleById('ingredientes')}
          />
        )}

        {/* RESUMEN DIARIO */}
        {activeModule.id === 'resumen' && (
          <DashboardModule
            totalSalesAmount={totalSalesAmount}
            sales={sales}
            products={products}
            tables={tables}
            ingredients={ingredients}
            onNavigate={(id, _path) => goToModuleById(id)}
          />
        )}

        {/* COSTOS Y FINANZAS */}
        {activeModule.id === 'finanzas' && <FinanzasModule />}

        {/* REPORTES */}
        {activeModule.id === 'reportes' && (
          <ReportesModule
            sales={sales}
            products={products}
            totalSalesAmount={totalSalesAmount}
onExportCSV={handleExportReportsXlsx}
          />
        )}

        {/* ALERTAS DE STOCK */}
        {activeModule.id === 'alertas' && (
          <AlertasModule
            ingredients={ingredients}
            products={products}
            onNavigateToIngredients={() => goToModuleById('ingredientes')}
            onNavigateToCatalog={() => goToModuleById('catalogo')}
          />
        )}

        {/* CONFIGURACIÓN */}
        {activeModule.id === 'configuracion' && (
          <ConfiguracionModule
            currentBranch={currentBranch}
            onChangeBranch={setCurrentBranch}
            dbStatus={dbStatus}
            onTestConnection={async () => {
              try {
                const res = await fetch('/api/health')
                const d = await res.json()
                const ok = Boolean(d?.connected)
                setDbStatus(ok ? d : { connected: false, database: d?.database, error: d?.error })
                return ok
              } catch {
                setDbStatus({ connected: false})
                return false
              }
            }}
            onShowToast={showToast}
          />
        )}
        </div>
      </main>
    </div>
  )
}
