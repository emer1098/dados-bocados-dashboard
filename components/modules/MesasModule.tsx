import { InputField } from '@/components/living/InputField'
import { copy } from '@/lib/copy'
import React, { useState } from 'react'
import {
  Gamepad2,
  Clock,
  CheckCircle2,
  X,
  Search,
  Plus,
  Receipt,
  LogOut,
  Pencil,
} from 'lucide-react'
import { useOverlayBehavior } from '@/components/hooks/useOverlayBehavior'
import { OverlayPortal } from '@/components/overlay/OverlayPortal'

export interface TableSession {
  id: string
  name: string
  status: 'Libre' | 'Ocupada' | 'Reservada'
  currentGame?: string
  gameImage?: string
  playersCount?: number
  startTime?: string
  totalTimeMinutes?: number
  currentBill?: number
  zone?: 'Cafetería' | 'Ventana' | 'Terraza' | 'Salón Principal' | 'VIP'
}

export interface MesasModuleProps {
  tables: TableSession[]
  onUpdateTable: (id: string, data: Partial<TableSession>) => Promise<void>
  onCreateTable?: (data: { name: string; playersCount?: number }) => Promise<boolean>
  onShowToast: (msg: string) => void
  onNavigateToPOS?: (tableName: string) => void
}

const GAMES_LIST = [
  { name: 'Catan', image: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=300&q=80' },
  { name: 'Carcassonne', image: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=300&q=80' },
  { name: 'Ticket to Ride', image: 'https://images.unsplash.com/photo-1563941402622-4e7a488bcc57?w=300&q=80' },
  { name: 'Dixit', image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&q=80' },
  { name: 'Exploding Kittens', image: 'https://images.unsplash.com/photo-1544654803-b69140b285a1?w=300&q=80' },
  { name: 'Azul', image: 'https://images.unsplash.com/photo-1585504198199-20277593b94f?w=300&q=80' },
  { name: 'Solo Cafetería', image: '' },
]

const ZONES = ['Todas', 'Cafetería', 'Ventana', 'Terraza', 'Salón Principal', 'VIP'] as const

// Deducción de zona a partir del nombre si no viene explícita
function getTableZone(name: string): string {
  if (name.includes('Cafetería')) return 'Cafetería'
  if (name.includes('Ventana')) return 'Ventana'
  if (name.includes('Terraza')) return 'Terraza'
  if (name.includes('VIP')) return 'VIP'
  return 'Salón Principal'
}

export function MesasModule({ tables, onUpdateTable, onCreateTable, onShowToast, onNavigateToPOS }: MesasModuleProps) {
  const [selectedTable, setSelectedTable] = useState<TableSession | null>(null)
  const [modalMode, setModalMode] = useState<'assign' | 'edit' | 'create' | null>(null)
  const tableModalRef = useOverlayBehavior<HTMLDivElement>(modalMode !== null, () => setModalMode(null))
  const [assignedGame, setAssignedGame] = useState('Catan')
  const [players, setPlayers] = useState(4)

  // Editar info de mesa
  const [editName, setEditName] = useState('')
  const [editCapacity, setEditCapacity] = useState(4)

  // Crear mesa
  const [newTableName, setNewTableName] = useState('')
  const [newTableCapacity, setNewTableCapacity] = useState(4)
  const [creating, setCreating] = useState(false)

  // Filtros
  const [filterStatus, setFilterStatus] = useState<'Todas' | 'Libre' | 'Ocupada' | 'Reservada'>('Todas')
  const [search, setSearch] = useState('')

  // Totales e Indicadores precisos
  const totalCount = tables.length
  const occupiedCount = tables.filter((t) => t.status === 'Ocupada').length
  const freeCount = tables.filter((t) => t.status === 'Libre').length
  const totalPlayersInTables = tables.reduce((acc, t) => acc + (t.status === 'Ocupada' ? (t.playersCount || 0) : 0), 0)
  const maxCapacity = totalCount * 4

  const handleFreeTable = async (table: TableSession) => {
    await onUpdateTable(table.id, {
      status: 'Libre',
      currentGame: undefined,
      playersCount: 0,
      totalTimeMinutes: 0,
      currentBill: 0,
    })
    onShowToast(`${table.name} liberada exitosamente.`)
  }

  const handleConfirmAssign = async () => {
    if (!selectedTable) return
    const gameObj = GAMES_LIST.find((g) => g.name === assignedGame)
    await onUpdateTable(selectedTable.id, {
      status: 'Ocupada',
      currentGame: assignedGame,
      gameImage: gameObj?.image,
      playersCount: players,
      totalTimeMinutes: 5,
    })
    onShowToast(`Partida de ${assignedGame} iniciada en ${selectedTable.name}.`)
    setSelectedTable(null)
    setModalMode(null)
  }

  const handleSaveEdit = async () => {
    if (!selectedTable) return
    const trimmed = editName.trim()
    if (!trimmed) {
      onShowToast('El nombre de la mesa no puede estar vacío.')
      return
    }
    await onUpdateTable(selectedTable.id, {
      name: trimmed,
      playersCount: editCapacity,
    })
    onShowToast(`Mesa actualizada: ${trimmed}.`)
    setSelectedTable(null)
    setModalMode(null)
  }

  const openEdit = (table: TableSession) => {
    setSelectedTable(table)
    setEditName(table.name)
    setEditCapacity(table.playersCount || 4)
    setModalMode('edit')
  }

  const handleCreate = async () => {
    const trimmed = newTableName.trim()
    if (!trimmed) {
      onShowToast('El nombre de la mesa no puede estar vacío.')
      return
    }
    if (!onCreateTable) return
    setCreating(true)
    const ok = await onCreateTable({ name: trimmed, playersCount: newTableCapacity })
    setCreating(false)
    if (ok) {
      setNewTableName('')
      setNewTableCapacity(4)
      setModalMode(null)
    }
  }

  // Filtrado de mesas
  const filteredTables = tables.filter((t) => {
    const matchesStatus = filterStatus === 'Todas' || t.status === filterStatus
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || (t.currentGame && t.currentGame.toLowerCase().includes(search.toLowerCase()))
    return matchesStatus && matchesSearch
  })

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <span className="eyebrow">OPERACIONES</span>
          <h1 className="text-3xl font-bold font-cormorant text-[#1a1b21] mt-1">
            Mesas y Ludoteca
          </h1>
          <p className="text-sm text-[#555869] mt-0.5">
            Monitoreo en vivo de mesas, partidas asignadas, tiempos y comandas.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setNewTableName('')
            setNewTableCapacity(4)
            setModalMode('create')
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-[#1a1b21] text-white hover:opacity-90 transition-opacity self-start sheen"
        >
          <Plus className="w-3.5 h-3.5" />
          Nueva mesa
        </button>
      </div>

      {/* 2. Indicadores Coherentes con los Totales Reales */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="living-card p-4 flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#555869]">
            Mesas ocupadas
          </span>
          <span className="text-2xl font-bold text-[#1a1b21] numeral-clean">
            {occupiedCount} de {totalCount}
          </span>
          <span className="text-[11px] text-[#555869]">
            {occupiedCount === 0 ? 'Sin partidas en curso' : `${occupiedCount} mesas con consumo activo`}
          </span>
        </div>

        <div className="living-card p-4 flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#555869]">
            Mesas libres
          </span>
          <span className="text-2xl font-bold text-[oklch(48%_0.16_45)] numeral-clean">
            {freeCount} de {totalCount}
          </span>
          <span className="text-[11px] text-[#555869]">
            Listas para recibir nuevos grupos
          </span>
        </div>

        <div className="living-card p-4 flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#555869]">
            Jugadores en mesa
          </span>
          <span className="text-2xl font-bold text-[#1a1b21] numeral-clean">
            {totalPlayersInTables} de {maxCapacity} (capacidad)
          </span>
          <span className="text-[11px] text-[#555869]">
            Promedio de 4 sillas por mesa
          </span>
        </div>
      </div>

      {/* 3. Barra de Filtros y Búsqueda */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filtro Estado */}
          <div className="flex bg-black/5 p-1 rounded-full border border-black/8">
            {(['Todas', 'Libre', 'Ocupada', 'Reservada'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  filterStatus === st
                    ? 'bg-[#1a1b21] text-white shadow-xs'
                    : 'text-[#555869] hover:text-[#1a1b21]'
                }`}
              >
                {st === 'Todas' ? 'Todas' : `${st}s`}
              </button>
            ))}
          </div>
        </div>

        {/* Buscador */}
        <div className="w-full sm:w-64">
          <InputField
            leftIcon={<Search className="w-4 h-4" />}
            placeholder={copy.placeholders.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="!h-10 !min-h-[40px] text-xs"
          />
        </div>
      </div>

      {/* 4. Cuadrícula de mesas (un solo piso) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredTables.map((table) => {
          const isBusy = table.status === 'Ocupada'
          const isReserved = table.status === 'Reservada'

          // MESA OCUPADA
          if (isBusy) {
            return (
              <div
                key={table.id}
                className="living-card p-5 flex flex-col justify-between gap-4 border-2 border-[#b91c1c]/20 bg-[#fffdfd] transition-all hover:shadow-lg squircle bloom"
              >
                <div className="flex items-center justify-between pb-2 border-b border-black/6">
                  <span className="text-base font-bold text-[#1a1b21] numeral-clean">
                    {table.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(table)}
                      className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/5 text-[#555869]"
                      aria-label="Editar mesa"
                      title="Editar mesa"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#fee2e2] text-[#b91c1c]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#b91c1c] animate-pulse" />
                      Ocupada
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-11 h-11 rounded-xl bg-black/5 overflow-hidden border border-black/10 shrink-0 flex items-center justify-center">
                    {table.gameImage ? (
                      <img src={table.gameImage} alt={table.currentGame} className="w-full h-full object-cover" />
                    ) : (
                      <Gamepad2 className="w-5 h-5 text-[oklch(48%_0.16_45)]" />
                    )}
                  </div>
                  <div className="flex flex-col leading-tight min-w-0">
                    <span className="text-xs font-bold text-[#1a1b21] truncate">
                      {table.currentGame || 'Catan'}
                    </span>
                    <span className="text-[11px] text-[#555869]">
                      {table.playersCount || 4} jugadores
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1 px-2 rounded-xl bg-black/[0.03] text-xs">
                  <span className="flex items-center gap-1 text-[#555869] text-[11px]">
                    <Clock className="w-3 h-3 text-[#b91c1c]" />
                    <span className="font-semibold text-[#b91c1c] numeral-clean">
                      {table.totalTimeMinutes || 25} min
                    </span>
                  </span>
                  <span className="font-bold text-[#1a1b21] numeral-clean">
                            S/ {(table.currentBill || 0).toFixed(2)}
                  </span>
                </div>

                <div className="pt-2 border-t border-black/6 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onNavigateToPOS?.(table.name)}
                    className="flex-1 py-1.5 rounded-full text-[11px] font-bold bg-black/5 hover:bg-black/10 text-[#1a1b21] transition-colors"
                  >
                    + Consumo
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFreeTable(table)}
                    className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-[#fee2e2] text-[#b91c1c] hover:bg-[#fecaca] transition-colors"
                    title="Liberar mesa"
                  >
                    Liberar
                  </button>
                </div>
              </div>
            )
          }

          // MESA LIBRE / RESERVADA
          return (
            <div
              key={table.id}
                className="living-card p-5 flex flex-col justify-between gap-4 transition-all hover:shadow-lg squircle bloom"
            >
              <div className="flex items-center justify-between pb-2 border-b border-black/6">
                <span className="text-sm font-bold text-[#1a1b21] numeral-clean">
                  {table.name}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(table)}
                    className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/5 text-[#555869]"
                    aria-label="Editar mesa"
                    title="Editar mesa"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    isReserved
                      ? 'bg-[#fef3c7] text-[#b45309]'
                      : 'bg-[oklch(92%_0.06_55)]/40 text-[oklch(48%_0.16_45)]'
                  }`}>
                    {isReserved ? 'Reservada' : 'Libre'}
                  </span>
                </div>
              </div>

              <div className="py-2 flex flex-col items-center justify-center text-center">
                <span className="text-xs text-[#555869]">Capacidad: {table.playersCount || 4} personas</span>
                <span className="text-[11px] text-[oklch(48%_0.16_45)] font-medium mt-0.5">
                  Disponible para asignar
                </span>
              </div>

              <div className="pt-2 border-t border-black/6">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTable(table)
                    setModalMode('assign')
                  }}
                  className="w-full py-1.5 rounded-full text-xs font-bold bg-black/5 hover:bg-black/10 text-[#1a1b21] transition-colors focus-visible:ring-2 focus-visible:ring-[oklch(48%_0.16_45)]"
                >
                  Asignar juego
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {filteredTables.length === 0 && (
        <div className="living-card p-8 text-center text-sm text-[#555869]">
          No hay mesas que coincidan con el filtro.
        </div>
      )}

      {/* Modal Crear Mesa */}
      {modalMode === 'create' && (
        <OverlayPortal>
          <div ref={tableModalRef} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 ">
            <div className="glass-card !bg-white max-w-md w-full !p-6 flex flex-col gap-5 living-zoom-in">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold font-cormorant text-[#1a1b21] m-0">
                  Nueva mesa
                </h2>
                <p className="text-xs text-[#555869] mt-0.5">
                  Agrega una mesa al salón (un solo piso).
                </p>
              </div>
              <button
                onClick={() => setModalMode(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/8 text-[#555869]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <InputField
              label="Mesa *"
              type="text"
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              placeholder="Mesa 07"
              autoFocus
            />

            <InputField
              label="Capacidad"
              type="number"
              min="1"
              max="20"
              suffixText="pers."
              value={newTableCapacity}
              onChange={(e) => setNewTableCapacity(Number(e.target.value))}
              className="numeral-clean font-bold"
            />

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-black/6">
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="px-4 py-2 rounded-full text-xs font-bold bg-black/5 text-[#1a1b21] hover:bg-black/10 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={creating}
                className="px-5 py-2 rounded-full text-xs font-bold bg-[#1a1b21] text-white hover:opacity-90 transition-opacity disabled:opacity-50 sheen"
              >
                {creating ? 'Creando...' : 'Crear mesa'}
              </button>
            </div>
          </div>
        </div>
        </OverlayPortal>
      )}

      {/* Modal Editar Mesa */}
      {modalMode === 'edit' && selectedTable && (
        <OverlayPortal>
          <div ref={tableModalRef} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 ">
            <div className="glass-card !bg-white max-w-md w-full !p-6 flex flex-col gap-5 living-zoom-in">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold font-cormorant text-[#1a1b21] m-0">
                  Editar mesa
                </h2>
                <p className="text-xs text-[#555869] mt-0.5 numeral-clean">
                  {selectedTable.name}
                </p>
              </div>
              <button
                onClick={() => setModalMode(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/8 text-[#555869]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <InputField
              label="Mesa *"
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Mesa 01"
            />

            <InputField
              label="Capacidad"
              type="number"
              min="1"
              max="20"
              suffixText="pers."
              value={editCapacity}
              onChange={(e) => setEditCapacity(Number(e.target.value))}
              className="numeral-clean font-bold"
            />

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-black/6">
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="px-4 py-2 rounded-full text-xs font-bold bg-black/5 text-[#1a1b21] hover:bg-black/10 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-full text-xs font-bold bg-[#1a1b21] text-white hover:opacity-90 transition-opacity sheen"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
        </OverlayPortal>
      )}

      {/* Modal Asignar Juego */}
      {modalMode === 'assign' && selectedTable && (
        <OverlayPortal>
          <div ref={tableModalRef} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 ">
            <div className="glass-card !bg-white max-w-md w-full !p-6 flex flex-col gap-5 living-zoom-in">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold font-cormorant text-[#1a1b21] m-0">
                  Asignar partida
                </h2>
                <p className="text-xs text-[#555869] mt-0.5 numeral-clean">
                  {selectedTable.name}
                </p>
              </div>
              <button
                onClick={() => setModalMode(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/8 text-[#555869]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#1a1b21]">Título del juego:</label>
              <select
                value={assignedGame}
                onChange={(e) => setAssignedGame(e.target.value)}
                className="living-select"
              >
                {GAMES_LIST.map((g) => (
                  <option key={g.name} value={g.name}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <InputField
              label="Jugadores"
              type="number"
              min="1"
              max="8"
              suffixText="pers."
              value={players}
              onChange={(e) => setPlayers(Number(e.target.value))}
              className="numeral-clean font-bold"
            />

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-black/6">
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="px-4 py-2 rounded-full text-xs font-bold bg-black/5 text-[#1a1b21] hover:bg-black/10 transition-colors"
              >
                Cancelar
              </button>
              {/* Máximo UN botón primario ink */}
              <button
                type="button"
                onClick={handleConfirmAssign}
                className="px-5 py-2 rounded-full text-xs font-bold bg-[#1a1b21] text-white hover:opacity-90 transition-opacity sheen"
              >
                Iniciar partida
              </button>
            </div>
          </div>
        </div>
        </OverlayPortal>
      )}
    </div>
  )
}
