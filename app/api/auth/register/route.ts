import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import clientPromise from '@/lib/mongodb'

export async function POST(req: NextRequest) {
  try {
    const { username, password, name, role } = await req.json()

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Usuario y contraseña son requeridos' },
        { status: 400 }
      )
    }

    if (password.length < 4) {
      return NextResponse.json(
        { success: false, error: 'La contraseña debe tener al menos 4 caracteres' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB || 'dados_bocados')
    const usersCollection = db.collection('users')

    const cleanUsername = username.toLowerCase().trim()
    const existing = await usersCollection.findOne({ username: cleanUsername })
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Este nombre de usuario ya está registrado' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const displayName = name?.trim() || cleanUsername
    const initials = displayName
      .split(' ')
      .map((w: string) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'DB'

    const newUser = {
      username: cleanUsername,
      password: hashedPassword,
      name: displayName,
      role: role || 'Operador',
      initials,
      createdAt: new Date(),
    }

    await usersCollection.insertOne(newUser)

    return NextResponse.json({
      success: true,
      message: 'Usuario creado exitosamente. Ahora puedes iniciar sesión.',
      user: { username: cleanUsername, name: displayName, role: newUser.role, initials },
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
