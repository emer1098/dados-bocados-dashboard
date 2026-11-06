import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'
import { INITIAL_INGREDIENTS_DATA } from '@/lib/businessData'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB || 'dados_bocados')
    const collection = db.collection('ingredients')

    const count = await collection.countDocuments()
    if (count === 0) {
      await collection.insertMany(
        INITIAL_INGREDIENTS_DATA.map((item) => ({
          ...item,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
      )
    }

    const ingredients = await collection.find({}).sort({ name: 1 }).toArray()
    const formatted = ingredients.map((item: any) => ({
      id: item._id.toString(),
      name: item.name,
      category: item.category || 'Insumo de Cocina',
      currentStock: Number(item.currentStock) || 0,
      unit: item.unit || 'unidad',
      presentation: item.presentation || '',
      unitCost: Number(item.unitCost) || 0,
      minStock: Number(item.minStock) || 2,
    }))

    return NextResponse.json({ success: true, data: formatted })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.name || body.unitCost === undefined) {
      return NextResponse.json({ success: false, error: 'Nombre y costo unitario son obligatorios' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB || 'dados_bocados')
    const collection = db.collection('ingredients')

    const newDoc = {
      name: body.name.trim(),
      category: body.category || 'Insumo de Cocina',
      currentStock: Number(body.currentStock) || 0,
      unit: body.unit || 'kg',
      presentation: body.presentation || '',
      unitCost: Number(body.unitCost) || 0,
      minStock: Number(body.minStock) || 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(newDoc)
    return NextResponse.json({
      success: true,
      data: { id: result.insertedId.toString(), ...newDoc },
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, stockDelta, newStock, ...rest } = body
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID de ingrediente requerido' }, { status: 400 })
    }

    let objectId: ObjectId
    try {
      objectId = new ObjectId(id)
    } catch {
      return NextResponse.json({ success: false, error: 'ID de ingrediente inválido' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB || 'dados_bocados')
    const collection = db.collection('ingredients')
    const now = new Date()

    if (stockDelta !== undefined) {
      const update: Record<string, unknown> = {}
      if (rest.name !== undefined) update.name = String(rest.name).trim()
      if (rest.minStock !== undefined) update.minStock = Math.max(0, Number(rest.minStock))
      if (rest.unit !== undefined) update.unit = String(rest.unit)
      if (rest.category !== undefined) update.category = String(rest.category)
      if (rest.presentation !== undefined) update.presentation = String(rest.presentation)
      if (rest.unitCost !== undefined) update.unitCost = Math.max(0, Number(rest.unitCost))

      await collection.updateOne(
        { _id: objectId },
        [
          {
            $set: {
              ...update,
              updatedAt: now,
              currentStock: { $max: [0, { $add: ['$currentStock', Number(stockDelta)] }] },
            },
          },
        ]
      )
      return NextResponse.json({ success: true, message: 'Ingrediente actualizado' })
    }

    const updateFields: Record<string, unknown> = { updatedAt: now }
    if (rest.name !== undefined) updateFields.name = String(rest.name).trim()
    if (rest.currentStock !== undefined) updateFields.currentStock = Math.max(0, Number(rest.currentStock))
    if (rest.minStock !== undefined) updateFields.minStock = Math.max(0, Number(rest.minStock))
    if (rest.unit !== undefined) updateFields.unit = String(rest.unit)
    if (rest.category !== undefined) updateFields.category = String(rest.category)
    if (rest.presentation !== undefined) updateFields.presentation = String(rest.presentation)
    if (rest.unitCost !== undefined) updateFields.unitCost = Math.max(0, Number(rest.unitCost))
    if (newStock !== undefined) updateFields.currentStock = Math.max(0, Number(newStock))

    if (Object.keys(updateFields).length === 1) {
      return NextResponse.json({ success: false, error: 'No hay campos para actualizar' }, { status: 400 })
    }

    const result = await collection.updateOne({ _id: objectId }, { $set: updateFields })
    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: 'Ingrediente no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Ingrediente actualizado' })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID de ingrediente requerido' }, { status: 400 })
    }

    let objectId: ObjectId
    try {
      objectId = new ObjectId(id)
    } catch {
      return NextResponse.json({ success: false, error: 'ID de ingrediente inválido' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB || 'dados_bocados')
    const result = await db.collection('ingredients').deleteOne({ _id: objectId })

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Ingrediente no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Ingrediente eliminado' })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

