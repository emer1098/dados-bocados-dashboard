import React, { useState } from 'react'
import {
  Settings,
  Store,
  Users,
  Wifi,
  Save,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Shield,
} from 'lucide-react'

export interface ConfiguracionModuleProps {
  currentBranch: string
  onChangeBranch: (b: string) => void
  dbStatus: { connected: boolean; database?: string; error?: string }
  onTestConnection: () => Promise<boolean>
  onShowToast: (msg: string) => void
}

export function ConfiguracionModule({
  currentBranch,
  onChangeBranch,
  dbStatus,
  onTestConnection,
  onShowToast,
}: ConfiguracionModuleProps) {
  const [activeTab, setActiveTab] = useState<'negocio' | 'usuarios' | 'conexion'>('negocio')

  // Estado formulario Negocio
  const [storeName, setStoreName] = useState('Dados & Bocados')
  const [currency] = useState('Soles (S/)')
  const [phone, setPhone] = useState('+51 984 123 456')
  const [address, setAddress] = useState('Av. El Sol 450, Centro')
  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)

  // Estado avanzado conexión
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [testing, setTesting] = useState(false)

  // Lista de usuarios
  const mockUsers = [
    { id: '1', name: 'María Gonzales', username: 'admin', role: 'Administradora', status: 'Activo' },
    { id: '2', name: 'Carlos Ramos', username: 'carlos_pos', role: 'Cajero / POS', status: 'Activo' },
    { id: '3', name: 'Lucía Mendoza', username: 'lucia_chef', role: 'Cocinera', status: 'Activo' },
    { id: '4', name: 'Jorge Pérez', username: 'jorge_m', role: 'Mesero / Ludoteca', status: 'Activo' },
  ]

  const handleSaveBusiness = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setHasChanges(false)
      onShowToast('Los cambios del establecimiento han sido guardados.')
    }, 400)
  }

  const handleTestPing = async () => {
    setTesting(true)
    const ok = await onTestConnection()
    setTesting(false)
    onShowToast(
      ok
        ? 'Comprobación de enlace exitosa: Base de datos sincronizada.'
        : 'No hay conexión con la base de datos. Verifica MONGODB_URI y revisa la pestaña Estado del Sistema.'
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <span className="eyebrow">SISTEMA · AJUSTES GENERALES</span>
          <h1 className="text-3xl font-bold font-cormorant text-[#1a1b21] mt-1">Configuración</h1>
          <p className="text-sm text-[#555869] mt-0.5">
            Datos comerciales, personal y enlace con la base de datos.
          </p>
        </div>
        {activeTab === 'negocio' && hasChanges && (
          <button
            onClick={handleSaveBusiness}
            disabled={saving}
            className="flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold bg-[#1a1b21] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        )}
      </div>

      {/* Pestañas de Navegación Living */}
      <div className="flex bg-black/5 p-1 rounded-full border border-black/8 w-fit gap-1">
        {[
          { id: 'negocio', label: 'Datos del Local', icon: Store },
          { id: 'usuarios', label: 'Personal y Turnos', icon: Users },
          { id: 'conexion', label: 'Estado del Sistema', icon: Wifi },
        ].map((tab) => {
          const IconComp = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                isActive
                  ? 'bg-[#1a1b21] text-white shadow-xs'
                  : 'text-[#555869] hover:text-[#1a1b21]'
              }`}
            >
              <IconComp className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* PESTAÑA 1: DATOS DEL NEGOCIO */}
      {activeTab === 'negocio' && (
        <div className="living-card max-w-2xl p-6 flex flex-col gap-6">
          <div className="border-b border-black/6 pb-3">
            <h3 className="text-xl font-bold font-cormorant text-[#1a1b21] m-0">
              Información de la Cafetería
            </h3>
            <p className="text-xs text-[#555869] m-0 mt-1">
              Estos datos se imprimen en los tickets de comanda y reportes de caja.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-[#1a1b21]">Nombre Comercial:</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => {
                  setStoreName(e.target.value)
                  setHasChanges(true)
                }}
                className="living-input"
              />
              <span className="text-[11px] text-[#555869]">Nombre oficial visible en comandas y reportes</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#1a1b21]">Sede / Sucursal:</label>
              <select
                value={currentBranch}
                onChange={(e) => {
                  onChangeBranch(e.target.value)
                  setHasChanges(true)
                }}
                className="living-select"
              >
                <option value="Local Centro">Local Centro (Principal)</option>
                <option value="Sede Miraflores">Sede Miraflores</option>
                <option value="Sede San Isidro">Sede San Isidro</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#1a1b21]">Moneda Oficial:</label>
              <input
                type="text"
                value={currency}
                disabled
                className="living-input bg-black/5 cursor-not-allowed opacity-75"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#1a1b21]">Teléfono de Contacto:</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value)
                  setHasChanges(true)
                }}
                className="living-input"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#1a1b21]">Dirección:</label>
              <input
                type="text"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value)
                  setHasChanges(true)
                }}
                className="living-input"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-black/6 flex items-center justify-between">
            <span className="text-xs text-[#555869]">
              {hasChanges ? 'Hay modificaciones pendientes de guardar' : 'Todos los datos están sincronizados'}
            </span>
            <button
              disabled={!hasChanges || saving}
              onClick={handleSaveBusiness}
              className="px-5 py-2 rounded-full text-xs font-bold bg-[#1a1b21] text-white hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              Guardar cambios
            </button>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: CUENTAS DE USUARIOS */}
      {activeTab === 'usuarios' && (
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-xl font-bold font-cormorant text-[#1a1b21] m-0">
              Personal Registrado
            </h3>
            <p className="text-xs text-[#555869] m-0 mt-1">
              Roles y permisos asignados para el turno de atención.
            </p>
          </div>

          <div className="living-card overflow-hidden">
            <table className="living-table w-full">
              <thead>
                <tr>
                  <th>Nombre Completo</th>
                  <th>Usuario</th>
                  <th>Rol Asignado</th>
                  <th>Estado</th>
                  <th>Nivel de Acceso</th>
                </tr>
              </thead>
              <tbody>
                {mockUsers.map((u) => (
                  <tr key={u.id}>
                    <td className="font-bold text-[#1a1b21]">{u.name}</td>
                    <td className="font-mono text-xs text-[#555869]">@{u.username}</td>
                    <td>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-black/5 text-[#1a1b21]">
                        <Shield className="w-3 h-3 text-[oklch(48%_0.16_45)]" />
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[oklch(92%_0.06_55)]/40 text-[oklch(48%_0.16_45)]">
                        Activo
                      </span>
                    </td>
                    <td className="text-xs text-[#555869]">
                      {u.role === 'Administradora'
                        ? 'Acceso total a finanzas, ventas y almacén'
                        : u.role === 'Cajero / POS'
                        ? 'Cobro en Soles y control de mesas'
                        : 'Gestión de comandas y recetas'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PESTAÑA 3: ESTADO DEL SISTEMA (LENGUAJE OPERATIVO AMIGABLE) */}
      {activeTab === 'conexion' && (
        <div className="max-w-2xl flex flex-col gap-5">
          <div className="living-card p-6 flex flex-col gap-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${dbStatus.connected ? 'bg-[oklch(92%_0.06_55)]/40 text-[oklch(48%_0.16_45)]' : 'bg-[#fee2e2] text-[#b91c1c]'}`}>
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-cormorant text-[#1a1b21] m-0">
                    {dbStatus.connected ? 'Sistema Sincronizado' : 'Sin conexión con la base de datos'}
                  </h3>
                  <p className={`text-xs font-semibold m-0 mt-0.5 ${dbStatus.connected ? 'text-[oklch(48%_0.16_45)]' : 'text-[#b91c1c]'}`}>
                    {dbStatus.connected
                      ? 'Operando con normalidad ✓ · Enlace activo'
                      : 'Los datos más recientes pueden no verse reflejados'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleTestPing}
                disabled={testing}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-black/5 text-[#1a1b21] hover:bg-black/10 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                <span>{testing ? 'Comprobando...' : 'Comprobar'}</span>
              </button>
            </div>

            <p className="text-xs text-[#555869] leading-relaxed m-0 pt-4 border-t border-black/6">
              {dbStatus.connected ? (
                'Las ventas, pedidos en mesa y ajustes de existencias se guardan automáticamente. La tablet y los terminales de caja están sincronizados.'
              ) : (
                `No se pudo conectar con MongoDB${dbStatus.error ? `: ${dbStatus.error}` : ''}. La app sigue funcionando con datos locales; regístralos después de reconectar.`
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
