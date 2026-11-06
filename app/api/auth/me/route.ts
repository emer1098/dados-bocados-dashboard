import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

function getJwtSecret(): string | null {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET
  if (process.env.NODE_ENV === 'production') return null
  return 'dev_only_secret_do_not_use_in_production'
}

export async function GET(req: NextRequest) {
  const jwtSecret = getJwtSecret()
  if (!jwtSecret) {
    return NextResponse.json(
      { success: false, error: 'Configuración del servidor incompleta: define JWT_SECRET en el entorno' },
      { status: 500 }
    )
  }

  try {
    const token = req.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 })
    }

    const decoded = jwt.verify(token, jwtSecret) as any
    return NextResponse.json({
      success: true,
      user: {
        name: decoded.name,
        role: decoded.role,
        initials: decoded.initials,
        username: decoded.username,
      },
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Sesión expirada' }, { status: 401 })
  }
}

