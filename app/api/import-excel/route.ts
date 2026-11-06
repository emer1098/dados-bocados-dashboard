import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import { getDatabase } from '@/lib/mongodb'
import * as XLSX from 'xlsx'

export async function POST(request: Request) {
  try {
    let wb: XLSX.WorkBook

    // 1. Si el usuario subió el archivo por FormData
    const contentType = request.headers.get('content-type') || ''
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file') as File | null
      if (file) {
        const bytes = await file.arrayBuffer()
        wb = XLSX.read(Buffer.from(bytes), { type: 'buffer' })
      } else {
        throw new Error('No se encontró archivo en el formulario')
      }
    } else {
      // 2. Leer desde el archivo copiado en el proyecto o ruta externa
      const localPath = path.join(process.cwd(), 'DATOS_dados_y_bocados.xlsx')
      const externalPath = path.resolve('..', 'DATOS dados y bocados.xlsx')

      let filePath = ''
      if (fs.existsSync(localPath)) {
        filePath = localPath
      } else if (fs.existsSync(externalPath)) {
        filePath = externalPath
      } else {
        throw new Error('No se encontró el archivo DATOS_dados_y_bocados.xlsx en el proyecto')
      }

      // Leer mediante buffer para evitar locks exclusivos de Excel en Windows
      const fileBuffer = fs.readFileSync(filePath)
      wb = XLSX.read(fileBuffer, { type: 'buffer' })
    }

    const sheet = wb.Sheets['Costos otros pvu']
    if (!sheet) {
      return NextResponse.json({ success: false, error: 'No se encontró la hoja "Costos otros pvu"' }, { status: 400 })
    }

    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 })
    let currentCategory = 'General'
    const productsToInsert: any[] = []

    for (let i = 7; i < rows.length; i++) {
      const r = rows[i]
      if (!r || !r[0]) continue

      const first = String(r[0]).trim()

      // Si la fila es un encabezado de categoría
      if (typeof r[1] !== 'number' || r[1] === null) {
        currentCategory = first
        continue
      }

      const price = r[6]
      const cost = r[3]

      if (typeof price === 'number') {
        const isGame = currentCategory.toUpperCase().includes('JUEGOS')
        productsToInsert.push({
          name: first,
          category: isGame ? 'Juegos de mesa' : 'Alimentos y bebidas',
          subCategory: currentCategory,
          sku: isGame
            ? `JUE-${String(productsToInsert.length + 1).padStart(4, '0')}`
            : `ALI-${String(productsToInsert.length + 1).padStart(4, '0')}`,
          price: `S/. ${price.toFixed(2)}`,
          cost: cost ? Number(cost.toFixed(2)) : 0,
          stock: 12,
          imageUrl: null,
          tone: isGame ? 'blue' : 'amber',
          createdAt: new Date(),
        })
      }
    }

    if (productsToInsert.length === 0) {
      return NextResponse.json({ success: false, error: 'No se encontraron productos en el Excel' }, { status: 400 })
    }

    const db = await getDatabase()
    // Limpiar catálogo previo e insertar el catálogo real completo
    await db.collection('products').deleteMany({})
    const result = await db.collection('products').insertMany(productsToInsert)

    return NextResponse.json({
      success: true,
      count: result.insertedCount,
      message: `¡Se importaron exitosamente ${result.insertedCount} productos reales desde el Excel a MongoDB!`,
    })
  } catch (error: any) {
    console.error('Error al importar Excel:', error)
    return NextResponse.json({ success: false, error: error.message || 'Error al procesar el archivo Excel' }, { status: 500 })
  }
}
