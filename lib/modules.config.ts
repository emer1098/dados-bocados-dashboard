import React from 'react'
import {
  ShoppingBag,
  Gamepad2,
  Boxes,
  UtensilsCrossed,
  ChefHat,
  LayoutDashboard,
  Landmark,
  BarChart3,
  AlertTriangle,
  Settings,
} from 'lucide-react'

export interface LiveDataArgs {
  salesCount?: number
  totalSales?: number
  activeTablesCount?: number
  totalTablesCount?: number
  lowIngredientsCount?: number
  readyRecipesCount?: number
  totalRecipesCount?: number
  productsCount?: number
}

export interface ModuleConfig {
  id: string
  name: string
  path: string
  group: 'Operaciones' | 'Inventario' | 'Negocio' | 'Sistema'
  icon: any
  shortDescription: string
  getLiveData: (args: LiveDataArgs) => string
  allowedRoles?: string[]
}

export const MODULES_CONFIG: ModuleConfig[] = [
  // 1. OPERACIONES
  {
    id: 'ventas',
    name: 'Ventas y Caja',
    path: '/ventas',
    group: 'Operaciones',
    icon: ShoppingBag,
    shortDescription: 'Punto de venta POS, registro de tickets y cobro en Soles.',
    getLiveData: (args) => `${args.salesCount || 0} tickets registrados hoy`,
    allowedRoles: ['Administradora', 'Cajero', 'Mesero'],
  },
  {
    id: 'mesas',
    name: 'Mesas y Ludoteca',
    path: '/mesas',
    group: 'Operaciones',
    icon: Gamepad2,
    shortDescription: 'Monitoreo de 6 mesas activas, juegos asignados y tiempos de partida.',
    getLiveData: (args) => `${args.activeTablesCount || 0} de ${args.totalTablesCount || 6} mesas ocupadas`,
    allowedRoles: ['Administradora', 'Cajero', 'Mesero'],
  },
  {
    id: 'catalogo',
    name: 'Catálogo de Venta',
    path: '/catalogo',
    group: 'Operaciones',
    icon: Boxes,
    shortDescription: 'Cafetería, postres y juegos de mesa con fotos reales y precios.',
    getLiveData: (args) => `${args.productsCount || 0} productos para venta`,
    allowedRoles: ['Administradora', 'Cajero'],
  },

  // 2. INVENTARIO
  {
    id: 'ingredientes',
    name: 'Ingredientes',
    path: '/ingredientes',
    group: 'Inventario',
    icon: UtensilsCrossed,
    shortDescription: 'Control de stock de materias primas, compras y reposición en almacén.',
    getLiveData: (args) =>
      args.lowIngredientsCount && args.lowIngredientsCount > 0
        ? `${args.lowIngredientsCount} insumos en nivel crítico`
        : 'Stock en nivel óptimo',
    allowedRoles: ['Administradora', 'Cocinero'],
  },
  {
    id: 'cocina',
    name: 'Recetas y Cocina',
    path: '/cocina',
    group: 'Inventario',
    icon: ChefHat,
    shortDescription: 'Asistente de preparación, recetas posibles hoy y fichas de costeo.',
    getLiveData: (args) => `${args.readyRecipesCount || 0} de ${args.totalRecipesCount || 18} listas para preparar`,
    allowedRoles: ['Administradora', 'Cocinero'],
  },

  // 3. NEGOCIO
  {
    id: 'resumen',
    name: 'Resumen Diario',
    path: '/dashboard',
    group: 'Negocio',
    icon: LayoutDashboard,
    shortDescription: 'Cifras clave del turno, caja del día y rotación de productos.',
    getLiveData: (args) => `S/ ${(args.totalSales || 0).toFixed(2)} recaudados`,
    allowedRoles: ['Administradora'],
  },
  {
    id: 'finanzas',
    name: 'Costos y Finanzas',
    path: '/finanzas',
    group: 'Negocio',
    icon: Landmark,
    shortDescription: 'Costos fijos mensuales (S/ 1,260.12), punto de equilibrio y socios.',
    getLiveData: () => 'S/ 1,260.12 costo fijo / mes',
    allowedRoles: ['Administradora'],
  },
  {
    id: 'reportes',
    name: 'Reportes',
    path: '/reportes',
    group: 'Negocio',
    icon: BarChart3,
    shortDescription: 'Balance mensual, analítica de recaudación y productos más vendidos.',
    getLiveData: () => 'Analítica en vivo',
    allowedRoles: ['Administradora'],
  },
  {
    id: 'alertas',
    name: 'Alertas de Stock',
    path: '/alertas',
    group: 'Negocio',
    icon: AlertTriangle,
    shortDescription: 'Detección automática de materias primas agotadas y reposición urgente.',
    getLiveData: (args) => `${args.lowIngredientsCount || 0} alertas prioritarias`,
    allowedRoles: ['Administradora', 'Cocinero'],
  },

  // 4. SISTEMA
  {
    id: 'configuracion',
    name: 'Configuración',
    path: '/configuracion',
    group: 'Sistema',
    icon: Settings,
    shortDescription: 'Sedes, cuentas de usuario, estado de conexión y parámetros.',
    getLiveData: () => 'Sistema en línea ✓',
    allowedRoles: ['Administradora'],
  },
]

export const LIVING_GROUPS: Array<'Operaciones' | 'Inventario' | 'Negocio' | 'Sistema'> = [
  'Operaciones',
  'Inventario',
  'Negocio',
  'Sistema',
]

