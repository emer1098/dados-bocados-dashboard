import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import excelProducts from '@/lib/excelProducts.json'

export async function GET() {
  try {
    const db = await getDatabase()
    const collection = db.collection('products')

    const count = await collection.countDocuments()

    // Sembrar el catálogo inicial solo si la colección está vacía (no destructivo)
    if (count === 0) {
      const initialDocs = (excelProducts as any[]).map((p) => ({
        name: p.name,
        category: p.category,
        subCategory: p.subCategory,
        sku: p.sku,
        price: Number(p.price) || 0,
        cost: Number(p.cost) || 0,
        stock: Number(p.stock) || 15,
        imageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
      await collection.insertMany(initialDocs)
    }

    const products = await collection.find({}).sort({ category: 1, name: 1 }).toArray()
    
    const mapped = products.map((doc: any) => ({
      id: doc._id.toString(),
      name: doc.name,
      category: doc.category,
      subCategory: doc.subCategory || doc.category,
      sku: doc.sku || `SKU-${doc._id.toString().slice(-4)}`,
      price: typeof doc.price === 'string'
        ? parseFloat(doc.price.replace(/[^\d.]/g, '')) || 0
        : Number(doc.price) || 0,
      cost: Number(doc.cost) || 0,
      stock: Number(doc.stock) || 0,
      image: doc.imageUrl || doc.image || null,
      imageUrl: doc.imageUrl || doc.image || null,
    }))

    return NextResponse.json({ success: true, data: mapped })
  } catch (error: any) {
    console.error('Error al obtener productos de MongoDB:', error)
    // Fallback a los 79 productos de Excel si la BD falla
    return NextResponse.json({
      success: true,
      data: (excelProducts as any[]).map((p) => ({
        ...p,
        image: null,
        imageUrl: null,
      })),
    })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, category, subCategory, sku, price, stock, imageUrl, cost } = body

    if (!name || !category) {
      return NextResponse.json(
        { success: false, error: 'Nombre y categoría requeridos' },
        { status: 400 }
      )
    }

    const numericPrice = typeof price === 'string'
      ? parseFloat(price.replace(/[^\d.]/g, '')) || 0
      : Number(price) || 0

    const db = await getDatabase()
    const newProduct = {
      name: name.trim(),
      category,
      subCategory: subCategory || (category === 'Juegos de mesa' ? 'JUEGOS DE MESA' : 'ALIMENTOS'),
      sku: sku ? sku.trim() : `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      price: numericPrice,
      cost: cost ? Number(cost) : 0,
      stock: Number(stock) || 0,
      imageUrl: imageUrl || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection('products').insertOne(newProduct)
    return NextResponse.json({
      success: true,
      data: {
        id: result.insertedId.toString(),
        ...newProduct,
        image: newProduct.imageUrl,
      },
    })
  } catch (error: any) {
    console.error('Error al crear producto:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Error al guardar el producto' },
      { status: 500 }
    )
  }
}
