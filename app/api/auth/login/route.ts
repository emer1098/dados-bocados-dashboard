import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import clientPromise from '@/lib/mongodb'

function getJwtSecret(): string | null {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET
  if (process.env.NODE_ENV === 'production') return null
  return 'dev_only_secret_do_not_use_in_production'
}

// Seed default admin if no users exist
async function ensureDefaultUser(usersCollection: any) {
  const count = await usersCollection.countDocuments()
  if (count === 0) {
    const hashedPassword = await bcrypt.hash('dados2024', 10)
    await usersCollection.insertOne({
      username: 'admin',
      password: hashedPassword,
      name: 'María C.',
      role: 'Administradora',
      initials: 'MC',
      createdAt: new Date(),
    })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Usuario y contraseña requeridos' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB || 'dados_bocados')
    const usersCollection = db.collection('users')

    await ensureDefaultUser(usersCollection)

    const user = await usersCollection.findOne({ username: username.toLowerCase().trim() })

    if (!user) {
      return NextResponse.json({ success: false, error: 'Usuario o contraseña incorrectos' }, { status: 401 })
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Usuario o contraseña incorrectos' }, { status: 401 })
    }

    const jwtSecret = getJwtSecret()
    if (!jwtSecret) {
      return NextResponse.json(
        { success: false, error: 'Configuración del servidor incompleta: define JWT_SECRET en el entorno' },
        { status: 500 }
      )
    }

    const token = jwt.sign(
      { userId: user._id.toString(), username: user.username, name: user.name, role: user.role, initials: user.initials },
      jwtSecret,
      { expiresIn: '8h' }
    )

    const response = NextResponse.json({
      success: true,
      user: { name: user.name, role: user.role, initials: user.initials, username: user.username },
    })

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/',
    })

    return response
  } catch (err: any) {
    console.error('Error en login:', err)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}

