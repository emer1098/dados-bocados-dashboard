import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'

export async function GET() {
  try {
    const db = await getDatabase()
    const products = await db.collection('products').find({}, { projection: { category: 1 } }).toArray()
    const counts: Record<string, number> = {}
    for (const p of products) {
      const c = (p.category || 'Otros').toString().trim() || 'Otros'
      counts[c] = (counts[c] || 0) + 1
    }
    const categories = Object.entries(counts).map(([name, count]) => ({ name, count }))
    return NextResponse.json({ success: true, data: categories })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { oldName, newName } = body
    const from = (oldName || '').toString().trim()
    const to = (newName || '').toString().trim()
    if (!from || !to) {
      return NextResponse.json({ success: false, error: 'Nombre anterior y nuevo son obligatorios' }, { status: 400 })
    }
    if (from === to) {
      return NextResponse.json({ success: true, message: 'Sin cambios' })
    }
    const db = await getDatabase()
    const result = await db.collection('products').updateMany(
      { category: from },
      { $set: { category: to, updatedAt: new Date() } }
    )
    return NextResponse.json({ success: true, message: 'Categoría renombrada', modified: result.modifiedCount })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const name = (searchParams.get('name') || '').trim()
    if (!name) {
      return NextResponse.json({ success: false, error: 'Nombre de categoría requerido' }, { status: 400 })
    }
    const db = await getDatabase()
    const result = await db.collection('products').updateMany(
      { category: name },
      { $set: { category: 'Otros', updatedAt: new Date() } }
    )
    return NextResponse.json({ success: true, message: 'Categoría eliminada (productos reasignados a Otros)', modified: result.modifiedCount })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}