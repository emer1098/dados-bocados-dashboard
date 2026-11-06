import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { getDatabase } from '@/lib/mongodb'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: 'No se envió ningún archivo' }, { status: 400 })
    }

    // Validar tamaño (máx 5MB)
    const MAX_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: 'La imagen supera los 5MB. Usa una imagen más ligera.' },
        { status: 413 }
      )
    }

    // Validar tipo de imagen (Rechazar SVG por seguridad)
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Formato no válido. Debe ser JPG, PNG o WEBP.' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Sanitizar nombre de archivo con timestamp
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const uniqueFileName = `${Date.now()}_${cleanName}`

    // 1. Guardar en MongoDB Atlas (Garantiza persistencia permanente en Render gratuito)
    try {
      const db = await getDatabase()
      await db.collection('uploads').updateOne(
        { filename: uniqueFileName },
        {
          $set: {
            filename: uniqueFileName,
            contentType: file.type || 'image/webp',
            data: buffer,
            size: file.size,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        { upsert: true }
      )
    } catch (dbError: any) {
      console.error('Error al guardar imagen en MongoDB Atlas:', dbError)
    }

    // 2. Guardar en disco local si es posible (desarrollo local)
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')
      await mkdir(uploadDir, { recursive: true })
      const filePath = path.join(uploadDir, uniqueFileName)
      await writeFile(filePath, buffer)
    } catch (fsError: any) {
      // En entornos cloud de solo lectura o sin persistencia de disco, esto puede fallar de forma segura
      console.warn('Aviso: no se pudo escribir en disco local (normal en contenedores cloud):', fsError?.message)
    }

    // URL accesible a través de la API persistente
    const fileUrl = `/api/uploads/${uniqueFileName}`

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: uniqueFileName,
    })
  } catch (error: any) {
    console.error('Error al subir imagen:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Error al procesar la subida' },
      { status: 500 }
    )
  }
}
