import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { readFile } from 'fs/promises'
import path from 'path'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params

    if (!filename) {
      return new NextResponse('Filename missing', { status: 400 })
    }

    // 1. Intentar servir desde MongoDB (persistente y funciona en Render sin disco local)
    try {
      const db = await getDatabase()
      const uploadDoc = await db.collection('uploads').findOne({ filename })

      if (uploadDoc && uploadDoc.data) {
        const buffer = Buffer.isBuffer(uploadDoc.data)
          ? uploadDoc.data
          : Buffer.from(uploadDoc.data.buffer || uploadDoc.data)

        return new NextResponse(buffer, {
          status: 200,
          headers: {
            'Content-Type': uploadDoc.contentType || 'image/webp',
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        })
      }
    } catch (dbErr) {
      console.warn('No se pudo consultar MongoDB para la imagen:', dbErr)
    }

    // 2. Fallback: buscar en disco local (desarrollo local o archivos estáticos)
    try {
      const localPath = path.join(process.cwd(), 'public', 'uploads', filename)
      const fileBuffer = await readFile(localPath)
      const ext = path.extname(filename).toLowerCase()
      const mimeTypes: Record<string, string> = {
        '.webp': 'image/webp',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
      }

      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': mimeTypes[ext] || 'image/webp',
          'Cache-Control': 'public, max-age=86400',
        },
      })
    } catch {
      // Archivo no encontrado en disco ni en base de datos
    }

    return new NextResponse('Image not found', { status: 404 })
  } catch (error: any) {
    console.error('Error al servir imagen:', error)
    return new NextResponse('Error loading image', { status: 500 })
  }
}

