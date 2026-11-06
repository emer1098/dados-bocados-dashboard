import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'

export async function GET() {
  try {
    const db = await getDatabase()
    // Ping para verificar conectividad
    const ping = await db.command({ ping: 1 })
    const productsCount = await db.collection('products').countDocuments()
    const salesCount = await db.collection('sales').countDocuments()

    return NextResponse.json({
      connected: true,
      database: db.databaseName,
      ping: ping.ok === 1,
      stats: {
        products: productsCount,
        sales: salesCount,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        connected: false,
        error: error.message || 'No se pudo conectar a MongoDB',
        hint: 'Verifica tu MONGODB_URI en el archivo .env.local',
      },
      { status: 500 }
    )
  }
}

