import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDatabase } from '@/lib/mongodb'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { total, paymentMethod, table, items } = body

    let query: any
    try {
      query = { _id: new ObjectId(id) }
    } catch {
      return NextResponse.json({ success: false, error: 'ID de venta inválido' }, { status: 400 })
    }

    const db = await getDatabase()
    const setFields: Record<string, unknown> = { updatedAt: new Date() }
    if (total !== undefined) setFields.total = Number(total) || 0
    if (paymentMethod !== undefined) setFields.paymentMethod = paymentMethod
    if (table !== undefined) setFields.table = table
    if (items !== undefined) setFields.items = items

    const result = await db.collection('sales').updateOne(query, { $set: setFields })
    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: 'Venta no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Venta actualizada' })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    let query: any
    try {
      query = { _id: new ObjectId(id) }
    } catch {
      return NextResponse.json({ success: false, error: 'ID de venta inválido' }, { status: 400 })
    }

    const db = await getDatabase()
    const result = await db.collection('sales').deleteOne(query)
    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Venta no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Venta eliminada' })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}