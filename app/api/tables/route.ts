import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDatabase } from '@/lib/mongodb'

const defaultTables = [
  { tableNumber: 'Mesa 01', status: 'Disponible' },
  { tableNumber: 'Mesa 02', status: 'Disponible' },
  { tableNumber: 'Mesa 03', status: 'Disponible' },
  { tableNumber: 'Mesa 04', status: 'Disponible' },
  { tableNumber: 'Mesa 05', status: 'Disponible' },
  { tableNumber: 'Mesa 06', status: 'Disponible' },
]

export async function GET() {
  try {
    const db = await getDatabase()
    let tables = await db.collection('tables').find({}).toArray()

    if (tables.length === 0) {
      const docs = defaultTables.map((t, idx) => ({
        ...t,
        tableId: idx + 1,
        createdAt: new Date(),
      }))
      await db.collection('tables').insertMany(docs)
      tables = await db.collection('tables').find({}).toArray()
    }

    const mapped = tables.map((t) => ({
      ...t,
      id: t._id.toString(),
    }))

    return NextResponse.json({ success: true, data: mapped })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tableNumber, name, players } = body
    const newName = (name ?? tableNumber)?.toString().trim()
    if (!newName) {
      return NextResponse.json({ success: false, error: 'El nombre de la mesa es obligatorio' }, { status: 400 })
    }

    const db = await getDatabase()
    const collection = db.collection('tables')

    const existing = await collection.findOne({ tableNumber: newName })
    if (existing) {
      return NextResponse.json({ success: false, error: 'Ya existe una mesa con ese nombre' }, { status: 409 })
    }

    const doc = {
      tableNumber: newName,
      status: 'Disponible',
      players: Number(players) || 4,
      currentGame: null,
      startedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(doc)
    return NextResponse.json({
      success: true,
      data: { id: result.insertedId.toString(), ...doc, tableId: result.insertedId.toString() },
      message: 'Mesa creada',
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, tableNumber, name, status, currentGame, players, currentBill, startedAt } = body

    const db = await getDatabase()
    const collection = db.collection('tables')

    const newName = (name ?? tableNumber)?.toString().trim()
    const setFields: Record<string, unknown> = { updatedAt: new Date() }
    if (newName) setFields.tableNumber = newName
    if (status !== undefined) setFields.status = status
    if (currentGame !== undefined) setFields.currentGame = currentGame || null
    if (players !== undefined) setFields.players = players || null
    if (currentBill !== undefined) setFields.currentBill = Number(currentBill) || 0
    if (startedAt !== undefined) setFields.startedAt = startedAt || null

    let query: any
    if (id) {
      try {
        query = { _id: new ObjectId(id) }
      } catch {
        query = { tableNumber: name ?? tableNumber }
      }
    } else {
      query = { tableNumber: name ?? tableNumber }
    }

    const result = await collection.updateOne(query, { $set: setFields })
    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: 'Mesa no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Mesa actualizada en MongoDB' })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

