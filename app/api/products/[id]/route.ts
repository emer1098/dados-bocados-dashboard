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
    const db = await getDatabase()

    let query: any
    try {
      query = { _id: new ObjectId(id) }
    } catch {
      query = { id: id }
    }

    const updateDoc: any = { $set: {} }

    if (body.stock !== undefined) {
      updateDoc.$set.stock = Math.max(0, Number(body.stock))
    }
    if (body.price !== undefined) {
      updateDoc.$set.price = body.price
    }
    if (body.name !== undefined) {
      updateDoc.$set.name = body.name
    }
    if (body.category !== undefined) {
      updateDoc.$set.category = body.category
    }
    if (body.imageUrl !== undefined) {
      updateDoc.$set.imageUrl = body.imageUrl
    }
    if (body.subCategory !== undefined) {
      updateDoc.$set.subCategory = body.subCategory
    }

    updateDoc.$set.updatedAt = new Date()

    const result = await db.collection('products').updateOne(query, updateDoc)

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: 'Producto no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Producto actualizado' })
  } catch (error: any) {
    console.error('Error al actualizar producto:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = await getDatabase()

    let query: any
    try {
      query = { _id: new ObjectId(id) }
    } catch {
      query = { id: id }
    }

    const result = await db.collection('products').deleteOne(query)

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Producto no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Producto eliminado de MongoDB' })
  } catch (error: any) {
    console.error('Error al eliminar producto:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

