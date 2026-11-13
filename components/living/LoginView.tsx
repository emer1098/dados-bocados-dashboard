import React, { useState } from 'react'
import { Eye, EyeOff, Lock, UserCheck, AlertTriangle } from 'lucide-react'
import { Button } from './Button'
import { InputField } from './InputField'
import { copy } from '@/lib/copy'

export interface LoginViewProps {
  onLogin: (u: string, p: string) => Promise<void>
  onRegister: (name: string, u: string, p: string, role: string) => Promise<void>
  loading: boolean
  error: string
  notice: string
}

export function LoginView({
  onLogin,
  onRegister,
  loading,
  error,
  notice,
}: LoginViewProps) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [regUsername, setRegUsername] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regRole, setRegRole] = useState('Cajero')
  const [showPassword, setShowPassword] = useState(false)
  const [logoError, setLogoError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isRegistering) {
      onLogin(username, password)
    } else {
      onRegister(fullName, regUsername, regPassword, regRole)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-[#1c1917] via-[#292524] to-[#0c0a09]">
      {/* Fondo cinematográfico con fallback sólido para bloqueadores */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center pointer-events-none scale-105 opacity-80"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1600&q=80)' }}
      />

      {/* Viñeta oscura con desenfoque suave para contraste óptimo */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] pointer-events-none" />

      {/* Toast Flotante */}
      {notice && (
        <div className="fixed top-6 z-50 px-4 py-2 rounded-full bg-white/95 border border-black/10 text-[#1a1b21] text-xs font-semibold shadow-xl flex items-center gap-2">
          <span className="text-[oklch(48%_0.16_45)]">✓</span> {notice}
        </div>
      )}

      {/* Tarjeta de Vidrio CENTRADA Limpia - Negro y Dorado elegante estilo logo */}
      <div className="relative z-10 w-full max-w-sm bg-[#121319]/95 backdrop-blur-2xl rounded-3xl p-7 flex flex-col gap-5 shadow-[0_25px_60px_rgba(0,0,0,0.85)] animate-fade-in border border-amber-500/35">
        {/* Encabezado con Logo */}
        <div className="flex flex-col items-center text-center gap-2.5">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-400/40 shadow-lg bg-black/60 flex items-center justify-center">
            {!logoError ? (
              <img
                src="/logo.jpg"
                alt="Dados & Bocados"
                className="w-full h-full object-cover"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="w-full h-full bg-[#121319] flex flex-col items-center justify-center text-amber-400 font-bold text-xs p-1">
                <span>🎲 D&B</span>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold font-cormorant text-amber-300 m-0">
              {isRegistering ? copy.login.createAccount : copy.login.title}
            </h1>
            <p className="text-xs text-amber-200/70 m-0 mt-0.5">
              {isRegistering
                ? 'Registra tu acceso de personal'
                : copy.login.subtitle}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-2.5 rounded-2xl bg-[#fee2e2] border border-[#fca5a5] text-[#b91c1c] text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {!isRegistering ? (
            <>
              {/* Campo Usuario con zona de icono separada de 44px */}
              <InputField
                label={copy.login.userInputLabel}
                leftIcon={<UserCheck className="w-4 h-4" />}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={copy.login.userInputPlaceholder}
                autoComplete="username"
                required
              />

              {/* Campo Contraseña con icono izquierdo (44px) y botón de ojo (44x44px) */}
              <InputField
                label={copy.login.passwordInputLabel}
                leftIcon={<Lock className="w-4 h-4" />}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={copy.login.passwordInputPlaceholder}
                autoComplete="current-password"
                rightAction={
                  <button
                    type="button"
                    aria-label={showPassword ? copy.login.hidePassword : copy.login.showPassword}
                    className="w-11 h-11 flex items-center justify-center text-[#555869] hover:text-[#1a1b21] transition-colors rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1b21]/20"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                required
              />

              {/* Botón Entrar limpio, sin destellos */}
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="w-full mt-1.5 h-12 text-sm font-bold"
              >
                {copy.login.button}
              </Button>

              <div className="flex items-center justify-center text-xs text-amber-200/70 pt-1">
                <button
                  type="button"
                  onClick={() => setIsRegistering(true)}
                  className="hover:underline font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                >
                  {copy.login.register}
                </button>
              </div>
            </>
          ) : (
            <>
              <InputField
                label="Nombre"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Carlos Ramos"
                required
              />

              <InputField
                label={copy.login.userInputLabel}
                type="text"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                placeholder="carlos"
                required
              />

              <InputField
                label={copy.login.passwordInputLabel}
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-amber-200/90 select-none">Rol</label>
                <select
                  className="living-select h-12 text-xs !bg-[#14151d] !border-amber-500/25 !text-[#f5f5f7]"
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                >
                  <option value="Cajero">Cajero</option>
                  <option value="Mesero">Mesero</option>
                  <option value="Cocinero">Cocinero</option>
                  <option value="Administradora">Administradora</option>
                </select>
              </div>

              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="w-full mt-1.5 h-12 text-sm font-bold"
              >
                {copy.buttons.create}
              </Button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className="text-xs text-amber-200/70 hover:underline"
                >
                  ¿Ya tienes cuenta? <span className="font-bold text-amber-300">{copy.login.backToLogin}</span>
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
export default LoginView
