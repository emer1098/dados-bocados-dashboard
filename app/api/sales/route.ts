import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'

export async function GET() {
  try {
    const db = await getDatabase()
    const sales = await db.collection('sales').find({}).sort({ createdAt: -1 }).toArray()
    const mapped = sales.map((s) => ({
      ...s,
      id: s._id.toString(),
    }))
    return NextResponse.json({ success: true, data: mapped })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { items, total, paymentMethod, table } = body
    const db = await getDatabase()

    const newSale = {
      ticketNumber: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      items: items || 'Consumo en tienda',
      total: Number(total) || 0,
      paymentMethod: paymentMethod || 'Efectivo',
      table: table || 'Caja',
      createdAt: new Date(),
    }

    const result = await db.collection('sales').insertOne(newSale)
    return NextResponse.json({
      success: true,
      data: { ...newSale, id: result.insertedId.toString() },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

