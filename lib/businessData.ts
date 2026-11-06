// Datos financieros y operativos oficiales extraídos de DATOS dados y bocados.xlsx

export interface RecipeIngredient {
  ingredient: string
  quantity: string
  unit: string
  cost: number
}

export interface ProductRecipe {
  productName: string
  category: string
  yieldDescription: string // ej: "Rendimiento: 6 porciones" o "1 Jarra de 1 Litro"
  costDirecto: number // CV
  costoFijoUnitario: number // CF asignado (S/. 1.80)
  costoTotalUnitario: number // CTU = CV + CF
  precioVenta: number // PV en Soles
  margenUtilidad: number // % margen
  gananciaNeta: number
  ingredients: RecipeIngredient[]
  decorations?: RecipeIngredient[]
  notes?: string
  imageUrl?: string
}

export const RECIPE_IMAGE_MAP: Record<string, string> = {
  'Waffle especial': 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600&auto=format&fit=crop&q=80',
  'Waffle sencillo': 'https://images.unsplash.com/photo-1598214886806-c87b84b7078b?w=600&auto=format&fit=crop&q=80',
  'Frappuccino': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80',
  'Moca': 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=600&auto=format&fit=crop&q=80',
  'Nutella': 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=600&auto=format&fit=crop&q=80',
  'Fresa': 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&auto=format&fit=crop&q=80',
  'Oreo': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
  'Limonada frozen (1 L)': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
  'Maracuyá (1 L)': 'https://images.unsplash.com/photo-1546173159-315724a31696?w=600&auto=format&fit=crop&q=80',
  'Chicha morada (1 L)': 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
  'Jugo de fresa con leche': 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&auto=format&fit=crop&q=80',
  'Jugo de mango con leche': 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=600&auto=format&fit=crop&q=80',
  'Jugo de piña': 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=600&auto=format&fit=crop&q=80',
  'Jugo de plátano': 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600&auto=format&fit=crop&q=80',
  'Jugo de papaya': 'https://images.unsplash.com/photo-1526401485004-46910ecc8e51?w=600&auto=format&fit=crop&q=80',
  'Ensalada de fruta especial': 'https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=600&auto=format&fit=crop&q=80',
  'Chocolatada': 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=600&auto=format&fit=crop&q=80',
  'Café': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
}

export function getRecipeImage(name: string): string {
  if (RECIPE_IMAGE_MAP[name]) return RECIPE_IMAGE_MAP[name]
  for (const [key, url] of Object.entries(RECIPE_IMAGE_MAP)) {
    if (name.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(name.toLowerCase())) {
      return url
    }
  }
  return 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=600&auto=format&fit=crop&q=80'
}

export interface FixedCostItem {
  category: string
  concept: string
  monthlyCost: number
  annualCost: number
  notes?: string
}

export interface PartnerEquity {
  name: string
  role: string
  amount: number
  percentage: number
  initials: string
}

export interface InvestmentAsset {
  group: 'Activos Fijos - Equipos' | 'Activos Fijos - Mobiliario' | 'Enseres de Cocina' | 'Gastos Pre-Operativos' | 'Capital de Trabajo Inicial'
  item: string
  quantity: number
  unitCost: number
  totalCost: number
  detail?: string
}

// ==========================================
// 1. RECETAS Y ESCANDALLOS DE ALIMENTOS
// ==========================================
export const RECIPES_DATA: ProductRecipe[] = [
  {
    productName: 'Waffle especial',
    category: 'WAFFLES Y POSTRES',
    yieldDescription: 'Receta base para 6 porciones (Decoración individual por porción)',
    costDirecto: 2.80,
    costoFijoUnitario: 1.80,
    costoTotalUnitario: 4.60,
    precioVenta: 12.00,
    margenUtilidad: 1.21,
    gananciaNeta: 7.40,
    ingredients: [
      { ingredient: 'Harina preparada', quantity: '140 g', unit: 'Bolsa 1 kg (S/ 5.00)', cost: 0.70 },
      { ingredient: 'Huevo fresco', quantity: '1 und', unit: 'Unidad', cost: 0.50 },
      { ingredient: 'Polvo de hornear (Royal)', quantity: '3 g', unit: 'Sobre 20 g (S/ 1.50)', cost: 0.23 },
      { ingredient: 'Azúcar rubia', quantity: '50 g', unit: 'Bolsa 1 kg (S/ 5.00)', cost: 0.25 },
      { ingredient: 'Leche entera', quantity: '101 ml', unit: 'Lata 390 g (S/ 3.00)', cost: 0.78 },
      { ingredient: 'Aceite vegetal', quantity: '51 ml', unit: 'Botella 900 ml (S/ 8.00)', cost: 0.45 },
      { ingredient: 'Esencia de vainilla', quantity: '3 ml', unit: 'Frasco 90 ml (S/ 2.50)', cost: 0.08 },
    ],
    decorations: [
      { ingredient: 'Fresas frescas en rodajas', quantity: '60 g', unit: 'Porción', cost: 1.50 },
      { ingredient: 'Plátano en rodajas', quantity: '1/2 und', unit: 'Porción', cost: 0.50 },
      { ingredient: 'Fudge de chocolate y grageas', quantity: '1 toque', unit: 'Porción', cost: 0.30 },
    ],
    notes: 'El batido rinde 6 waffles grandes. Se sirve caliente recién salido de la wafflera.',
  },
  {
    productName: 'Waffle sencillo',
    category: 'WAFFLES Y POSTRES',
    yieldDescription: 'Porción individual con mantequilla y miel',
    costDirecto: 0.50,
    costoFijoUnitario: 1.80,
    costoTotalUnitario: 2.30,
    precioVenta: 9.00,
    margenUtilidad: 2.32,
    gananciaNeta: 6.70,
    ingredients: [
      { ingredient: 'Masa base de waffle (1 porción)', quantity: '1 porción', unit: '6 waffles rinden S/ 2.99', cost: 0.50 },
      { ingredient: 'Miel o jarabe de maple', quantity: '15 ml', unit: 'Pote 500 ml', cost: 0.30 },
    ],
  },
  {
    productName: 'Frappuccino',
    category: 'FRAPPES',
    yieldDescription: 'Vaso 16 oz con crema batida y sirope',
    costDirecto: 3.18,
    costoFijoUnitario: 1.80,
    costoTotalUnitario: 4.98,
    precioVenta: 9.00,
    margenUtilidad: 0.53,
    gananciaNeta: 4.02,
    ingredients: [
      { ingredient: 'Café instantáneo premium', quantity: '6 g (2 cdas)', unit: 'Frasco 15 g (S/ 2.50)', cost: 0.15 },
      { ingredient: 'Cocoa en polvo', quantity: '9 g (2 cdas)', unit: 'Bolsa 11 g (S/ 0.80)', cost: 0.65 },
      { ingredient: 'Leche entera', quantity: '150 ml (1/2 vaso)', unit: 'Botella 1 L (S/ 3.00)', cost: 0.45 },
      { ingredient: 'Azúcar rubia', quantity: '25 g (2 cdas)', unit: 'Bolsa 1 kg (S/ 5.00)', cost: 0.13 },
      { ingredient: 'Hielo en cubos', quantity: '150 g (6 cubitos)', unit: 'Bolsa 1 kg (S/ 3.00)', cost: 0.45 },
      { ingredient: 'Crema batida chantilly', quantity: '30 g', unit: 'Envase 500 g (S/ 15.00)', cost: 0.90 },
      { ingredient: 'Jarabe de chocolate', quantity: '15 ml', unit: 'Botella 300 ml (S/ 9.00)', cost: 0.45 },
    ],
    notes: 'Licuar a alta velocidad por 30 segundos hasta textura suave. Decorar con roseta de crema batida.',
  },
  {
    productName: 'Moca',
    category: 'FRAPPES',
    yieldDescription: 'Vaso 16 oz con espresso, chocolate y chispas',
    costDirecto: 2.95,
    costoFijoUnitario: 1.80,
    costoTotalUnitario: 4.75,
    precioVenta: 10.00,
    margenUtilidad: 0.78,
    gananciaNeta: 5.25,
    ingredients: [
      { ingredient: 'Hielo cristalino', quantity: '200 g', unit: 'Bolsa 2 kg (S/ 3.00)', cost: 0.30 },
      { ingredient: 'Espresso de café concentrado', quantity: '60 ml', unit: 'Filtro barista', cost: 0.15 },
      { ingredient: 'Leche entera evaporada', quantity: '100 ml', unit: 'Lata 390 ml (S/ 3.00)', cost: 0.77 },
      { ingredient: 'Cocoa selecta', quantity: '11 g', unit: 'Envase 1 kg', cost: 0.62 },
      { ingredient: 'Azúcar', quantity: '15 g', unit: '1 kg', cost: 0.40 },
      { ingredient: 'Crema batida', quantity: '30 g', unit: '500 g', cost: 0.45 },
      { ingredient: 'Chispas de chocolate', quantity: '5 g', unit: 'Bolsa 200 g (S/ 10.50)', cost: 0.26 },
    ],
  },
  {
    productName: 'Nutella',
    category: 'FRAPPES',
    yieldDescription: 'Vaso 16 oz con Nutella italiana original y crema batida',
    costDirecto: 6.00,
    costoFijoUnitario: 1.80,
    costoTotalUnitario: 7.80,
    precioVenta: 11.00,
    margenUtilidad: 0.20,
    gananciaNeta: 3.20,
    ingredients: [
      { ingredient: 'Nutella original', quantity: '40 g (2 cdas colmadas)', unit: 'Pote 650 g (S/ 62.00)', cost: 3.82 },
      { ingredient: 'Leche entera', quantity: '150 ml', unit: 'Lata 390 ml (S/ 3.00)', cost: 1.15 },
      { ingredient: 'Hielo', quantity: '200 g', unit: 'Bolsa 2 kg', cost: 0.30 },
      { ingredient: 'Azúcar', quantity: '15 g (1 cda)', unit: '1 kg', cost: 0.08 },
      { ingredient: 'Esencia de vainilla', quantity: '2 ml', unit: 'Frasco 90 ml', cost: 0.06 },
      { ingredient: 'Crema batida (roseta)', quantity: '20 g', unit: 'Envase 500 g', cost: 0.60 },
    ],
  },
  {
    productName: 'Fresa',
    category: 'FRAPPES',
    yieldDescription: 'Vaso 16 oz frappe de fresas congeladas seleccionadas',
    costDirecto: 3.87,
    costoFijoUnitario: 1.80,
    costoTotalUnitario: 5.67,
    precioVenta: 10.00,
    margenUtilidad: 0.49,
    gananciaNeta: 4.33,
    ingredients: [
      { ingredient: 'Fresas congeladas', quantity: '120 g', unit: 'Bolsa 1 kg (S/ 11.00)', cost: 1.32 },
      { ingredient: 'Leche fresca', quantity: '120 ml', unit: 'Botella 1 L', cost: 0.92 },
      { ingredient: 'Leche condensada Nestlé', quantity: '20 g (1.5 cdas)', unit: 'Lata 100 g (S/ 2.90)', cost: 0.58 },
      { ingredient: 'Hielo en cubos', quantity: '150 g', unit: '1 kg', cost: 0.45 },
      { ingredient: 'Crema batida', quantity: '20 g', unit: '500 g', cost: 0.60 },
    ],
  },
  {
    productName: 'Oreo',
    category: 'FRAPPES',
    yieldDescription: 'Vaso 16 oz con galletas Oreo, helado de vainilla y café',
    costDirecto: 4.01,
    costoFijoUnitario: 1.80,
    costoTotalUnitario: 5.81,
    precioVenta: 10.00,
    margenUtilidad: 0.46,
    gananciaNeta: 4.19,
    ingredients: [
      { ingredient: 'Galletas Oreo originales', quantity: '36 g (3 galletas)', unit: 'Paquete 36 g (S/ 1.00)', cost: 1.00 },
      { ingredient: 'Leche entera', quantity: '120 ml', unit: 'Lata 390 ml', cost: 0.92 },
      { ingredient: 'Helado artesanal de vainilla', quantity: '50 g (1 bola)', unit: 'Pote 1 L (S/ 8.90)', cost: 0.49 },
      { ingredient: 'Café instantáneo', quantity: '3 g (1 cda)', unit: 'Frasco 15 g', cost: 0.50 },
      { ingredient: 'Hielo', quantity: '120 g', unit: 'Bolsa 3 kg', cost: 0.36 },
      { ingredient: 'Crema batida', quantity: '20 g', unit: 'Envase 500 g', cost: 0.60 },
      { ingredient: 'Vainilla y azúcar', quantity: '2 ml + 15 g', unit: 'Insumos', cost: 0.13 },
    ],
  },
  {
    productName: 'Limonada frozen (1 L)',
    category: 'BEBIDAS DE 1 LITRO',
    yieldDescription: 'Jarra completa de 1 Litro para compartir en mesa de juegos',
    costDirecto: 2.40,
    costoFijoUnitario: 1.80,
    costoTotalUnitario: 4.20,
    precioVenta: 9.00,
    margenUtilidad: 0.82,
    gananciaNeta: 4.80,
    ingredients: [
      { ingredient: 'Limón fresco peruano', quantity: '150 g (3 a 4 limones)', unit: 'Kilo a S/ 4.00', cost: 0.60 },
      { ingredient: 'Cubos de hielo', quantity: '300 g (12 a 15 cubos)', unit: 'Kilo a S/ 3.00', cost: 0.90 },
      { ingredient: 'Azúcar rubia', quantity: '80 g (5 a 6 cdas)', unit: 'Kilo a S/ 5.00', cost: 0.40 },
      { ingredient: 'Agua purificada', quantity: '500 ml', unit: 'Bidón 7 L (S/ 7.00)', cost: 0.50 },
    ],
    notes: 'Exprimir al momento. No triturar la cáscara blanca para evitar amargor.',
  },
  {
    productName: 'Maracuyá (1 L)',
    category: 'BEBIDAS DE 1 LITRO',
    yieldDescription: 'Jarra de 1 Litro refrescante con pulpa natural',
    costDirecto: 2.80,
    costoFijoUnitario: 1.80,
    costoTotalUnitario: 4.60,
    precioVenta: 9.00,
    margenUtilidad: 0.66,
    gananciaNeta: 4.40,
    ingredients: [
      { ingredient: 'Maracuyá natural de fruta', quantity: '200 g (2 unidades)', unit: 'Kilo a S/ 5.00', cost: 1.00 },
      { ingredient: 'Azúcar blanca / rubia', quantity: '90 g (6 cdas)', unit: 'Kilo a S/ 5.00', cost: 0.45 },
      { ingredient: 'Hielo cristalino', quantity: '250 g', unit: 'Kilo a S/ 3.00', cost: 0.75 },
      { ingredient: 'Agua tratada', quantity: '600 ml', unit: 'Bidón 7 L', cost: 0.60 },
    ],
  },
  {
    productName: 'Chicha morada (1 L)',
    category: 'BEBIDAS DE 1 LITRO',
    yieldDescription: 'Jarra tradicional hervida con frutas y canela',
    costDirecto: 1.63,
    costoFijoUnitario: 1.80,
    costoTotalUnitario: 3.43,
    precioVenta: 9.00,
    margenUtilidad: 1.23,
    gananciaNeta: 5.57,
    ingredients: [
      { ingredient: 'Maíz morado seleccionado', quantity: '85 g', unit: 'Kilo a S/ 6.00', cost: 0.51 },
      { ingredient: 'Cáscara de piña', quantity: '100 g', unit: 'Kilo a S/ 3.00', cost: 0.30 },
      { ingredient: 'Membrillo fresco', quantity: '50 g (1/3 und)', unit: 'Kilo a S/ 5.00', cost: 0.25 },
      { ingredient: 'Azúcar rubia', quantity: '85 g', unit: 'Kilo a S/ 5.00', cost: 0.43 },
      { ingredient: 'Limón recién exprimido', quantity: '35 g (1 limón chico)', unit: 'Kilo a S/ 4.00', cost: 0.14 },
    ],
  },
  {
    productName: 'Jugo de fresa con leche',
    category: 'JUGOS NATURALES',
    yieldDescription: 'Vaso grande 16 oz espumoso con leche entera',
    costDirecto: 3.49,
    costoFijoUnitario: 1.80,
    costoTotalUnitario: 5.29,
    precioVenta: 8.00,
    margenUtilidad: 0.28,
    gananciaNeta: 2.71,
    ingredients: [
      { ingredient: 'Fresas congeladas de calidad', quantity: '150 g', unit: 'Kilo a S/ 10.00', cost: 1.50 },
      { ingredient: 'Leche entera fresca', quantity: '200 ml', unit: 'Lata 390 ml (S/ 3.00)', cost: 1.54 },
      { ingredient: 'Agua purificada', quantity: '60 ml', unit: 'Bidón 7 L', cost: 0.42 },
      { ingredient: 'Esencia de vainilla', quantity: '1 ml (gotitas)', unit: 'Frasquito 90 ml', cost: 0.03 },
    ],
  },
  {
    productName: 'Jugo de mango con leche',
    category: 'JUGOS NATURALES',
    yieldDescription: 'Vaso 16 oz con pulpa de mango fresco',
    costDirecto: 3.25,
    costoFijoUnitario: 1.80,
    costoTotalUnitario: 5.05,
    precioVenta: 7.00,
    margenUtilidad: 0.17,
    gananciaNeta: 1.95,
    ingredients: [
      { ingredient: 'Mango criollo dulce', quantity: '200 g (aprox. 1/2 mango)', unit: 'Kilo a S/ 8.00', cost: 1.60 },
      { ingredient: 'Leche entera', quantity: '200 ml', unit: 'Lata 390 ml', cost: 1.54 },
      { ingredient: 'Agua purificada', quantity: '80 ml', unit: 'Bidón 7 L', cost: 0.08 },
      { ingredient: 'Vainilla', quantity: '1 ml', unit: 'Frasco', cost: 0.03 },
    ],
  },
  {
    productName: 'Jugo de piña',
    category: 'JUGOS NATURALES',
    yieldDescription: 'Vaso 16 oz 100% natural',
    costDirecto: 2.03,
    costoFijoUnitario: 1.80,
    costoTotalUnitario: 3.83,
    precioVenta: 7.00,
    margenUtilidad: 0.55,
    gananciaNeta: 3.17,
    ingredients: [
      { ingredient: 'Piña golden dulce', quantity: '250 g (1 rodaja grande)', unit: 'Piña 1.5 kg (S/ 4.00)', cost: 1.50 },
      { ingredient: 'Agua tratada', quantity: '250 ml', unit: 'Bidón 7 L', cost: 0.25 },
      { ingredient: 'Hielo en cubos', quantity: '50 g', unit: 'Kilo', cost: 0.15 },
      { ingredient: 'Azúcar rubia', quantity: '25 g (1.5 cdas)', unit: 'Kilo', cost: 0.13 },
    ],
  },
  {
    productName: 'Jugo de plátano',
    category: 'JUGOS NATURALES',
    yieldDescription: 'Vaso 16 oz plátano de seda con cacao y leche',
    costDirecto: 2.14,
    costoFijoUnitario: 1.80,
    costoTotalUnitario: 3.94,
    precioVenta: 7.00,
    margenUtilidad: 0.51,
    gananciaNeta: 3.06,
    ingredients: [
      { ingredient: 'Plátano de seda maduro', quantity: '120 g (1 unidad)', unit: 'Mano S/ 3.00', cost: 0.60 },
      { ingredient: 'Leche entera', quantity: '220 ml', unit: 'Botella 1 L', cost: 0.66 },
      { ingredient: 'Cacao en polvo selecto', quantity: '5 g (1 cdta)', unit: 'Bolsa 200 g (S/ 6.00)', cost: 0.75 },
      { ingredient: 'Agua', quantity: '60 ml', unit: 'Bidón', cost: 0.06 },
      { ingredient: 'Azúcar', quantity: '15 g (1 cda)', unit: 'Kilo', cost: 0.07 },
    ],
  },
  {
    productName: 'Jugo de papaya',
    category: 'JUGOS NATURALES',
    yieldDescription: 'Vaso 16 oz papaya arequipeña fresca',
    costDirecto: 1.58,
    costoFijoUnitario: 1.80,
    costoTotalUnitario: 3.38,
    precioVenta: 7.00,
    margenUtilidad: 0.76,
    gananciaNeta: 3.62,
    ingredients: [
      { ingredient: 'Papaya fresca seleccionada', quantity: '250 g', unit: 'Kilo a S/ 5.00', cost: 1.25 },
      { ingredient: 'Agua tratada', quantity: '200 ml', unit: 'Bidón 7 L', cost: 0.20 },
      { ingredient: 'Azúcar rubia', quantity: '25 g (1.5 cdas)', unit: 'Kilo', cost: 0.13 },
    ],
  },
  {
    productName: 'Ensalada de fruta especial',
    category: 'WAFFLES Y POSTRES',
    yieldDescription: 'Bowl abundante con 6 frutas, miel, algarrobina y yogurt',
    costDirecto: 3.29,
    costoFijoUnitario: 1.80,
    costoTotalUnitario: 5.09,
    precioVenta: 9.00,
    margenUtilidad: 0.50,
    gananciaNeta: 3.91,
    ingredients: [
      { ingredient: 'Plátano de seda picado', quantity: '70 g (1/2 plátano)', unit: 'Kilo a S/ 3.00', cost: 0.21 },
      { ingredient: 'Fresas frescas lavadas', quantity: '60 g (2 fresas)', unit: 'Kilo a S/ 10.00', cost: 0.60 },
      { ingredient: 'Mandarina en gajos', quantity: '50 g', unit: 'Kilo a S/ 3.00', cost: 0.15 },
      { ingredient: 'Manzana verde en cubos', quantity: '50 g', unit: 'Kilo a S/ 2.50', cost: 0.13 },
      { ingredient: 'Uva morada sin pepa', quantity: '30 g', unit: 'Kilo a S/ 8.00', cost: 0.24 },
      { ingredient: 'Papaya picada', quantity: '80 g', unit: 'Kilo a S/ 4.00', cost: 0.32 },
      { ingredient: 'Yogurt natural de fresa', quantity: '70 ml', unit: 'Botella 1 L (S/ 8.00)', cost: 0.56 },
      { ingredient: 'Miel de abeja pura', quantity: '15 ml', unit: 'Pote 500 ml (S/ 10.00)', cost: 0.60 },
      { ingredient: 'Algarrobina piurana', quantity: '10 ml', unit: 'Botella 500 ml (S/ 12.00)', cost: 0.48 },
    ],
  },
  {
    productName: 'Chocolatada',
    category: 'BEBIDAS CALIENTES',
    yieldDescription: 'Taza grande 10 oz con chocolate cusqueño y canela',
    costDirecto: 4.46,
    costoFijoUnitario: 1.80,
    costoTotalUnitario: 6.26,
    precioVenta: 8.00,
    margenUtilidad: 0.08,
    gananciaNeta: 1.74,
    ingredients: [
      { ingredient: 'Chocolate para taza / cobertura', quantity: '5 g', unit: 'Tableta 100 g (S/ 4.00)', cost: 2.00 },
      { ingredient: 'Leche evaporada de lata', quantity: '35 ml', unit: 'Lata 400 ml (S/ 4.50)', cost: 0.98 },
      { ingredient: 'Leche entera en caja', quantity: '50 ml', unit: 'Caja 1 L (S/ 5.00)', cost: 0.64 },
      { ingredient: 'Cocoa pura en polvo', quantity: '2 g', unit: 'Bolsa 200 g (S/ 6.00)', cost: 0.30 },
      { ingredient: 'Esencia de vainilla', quantity: '1 ml', unit: 'Frasquito', cost: 0.31 },
      { ingredient: 'Canela en rama aromática', quantity: '0.5 g', unit: 'Paquetito', cost: 0.20 },
      { ingredient: 'Azúcar al gusto', quantity: '5 g', unit: 'Kilo', cost: 0.02 },
    ],
  },
  {
    productName: 'Café',
    category: 'BEBIDAS CALIENTES',
    yieldDescription: 'Taza 8 oz espresso / americano de especialidad',
    costDirecto: 0.50,
    costoFijoUnitario: 1.80,
    costoTotalUnitario: 2.30,
    precioVenta: 4.00,
    margenUtilidad: 0.47,
    gananciaNeta: 1.70,
    ingredients: [
      { ingredient: 'Café molido de especialidad', quantity: '8 g', unit: 'Grano molido', cost: 0.35 },
      { ingredient: 'Agua purificada caliente', quantity: '180 ml', unit: 'Filtrada', cost: 0.10 },
      { ingredient: 'Azúcar sobre', quantity: '1 sachet', unit: 'Unidad', cost: 0.05 },
    ],
  },
]

// ==========================================
// 2. COSTOS FIJOS Y PUNTO DE EQUILIBRIO
// ==========================================
export const FIXED_COSTS_DATA: FixedCostItem[] = [
  { category: 'Infraestructura', concept: 'Alquiler del local comercial', monthlyCost: 600.00, annualCost: 7200.00, notes: 'Contrato anual formal' },
  { category: 'Servicios Básicos', concept: 'Servicio de Agua potable', monthlyCost: 40.00, annualCost: 480.00, notes: 'Uso comercial de cocina y baños' },
  { category: 'Servicios Básicos', concept: 'Energía eléctrica', monthlyCost: 80.00, annualCost: 960.00, notes: 'Waffleras, licuadoras, vitrina y refrigerador' },
  { category: 'Personal', concept: 'Sueldo de Cocinero / Barista', monthlyCost: 500.00, annualCost: 6000.00, notes: 'Preparación de alimentos y atención' },
  { category: 'Marketing', concept: 'Publicidad y redes sociales', monthlyCost: 15.00, annualCost: 180.00, notes: 'Campañas locales en Facebook e Instagram' },
  { category: 'Operaciones', concept: 'Transporte semanal para compra de insumos', monthlyCost: 20.00, annualCost: 240.00, notes: 'Abastecimiento en mercados mayoristas' },
  { category: 'Contable', concept: 'Depreciación mensual de activos fijos', monthlyCost: 61.46, annualCost: 737.52, notes: 'Depreciación técnica de equipos' },
]

export const FINANCIAL_METRICS = {
  totalMonthlyFixedCost: 1260.12,
  totalAnnualFixedCost: 14941.46,
  estimatedMonthlyUnits: 700,
  fixedCostPerUnit: 1.80, // CF por unidad
  igvRate: 0.18,
  transporteRate: 0.78,
  breakEvenMonthlyUnits: 250, // Unidades necesarias para no perder dinero
  breakEvenRevenueMonthly: 2250.00,
}

// ==========================================
// 3. ESTRUCTURA FINANCIERA Y SOCIOS
// ==========================================
export const PARTNERS_DATA: PartnerEquity[] = [
  { name: 'Miguel Tapia Dávila', role: 'Socio Fundador / Gerencia Operativa', amount: 4300.00, percentage: 25, initials: 'MT' },
  { name: 'José Wilmar Espinoza Borda', role: 'Socio Fundador / Administración', amount: 4300.00, percentage: 25, initials: 'JE' },
  { name: 'Yudith Benito Soria', role: 'Socia Fundadora / Finanzas & Compras', amount: 4300.00, percentage: 25, initials: 'YB' },
  { name: 'Jennifer Araseli Palma Chipane', role: 'Socia Fundadora / Marketing & Comunidad', amount: 4300.00, percentage: 25, initials: 'JP' },
]

export const TOTAL_EQUITY = {
  totalPatrimonio: 17200.00,
  totalDeuda: 0.00, // 100% financiamiento propio
  totalInversionRealizada: 17180.61,
  saldoCajaInicial: 1200.00,
}

// ==========================================
// 4. INVENTARIO DE INVERSIÓN Y ACTIVOS FIJOS
// ==========================================
export const INVESTMENT_ASSETS: InvestmentAsset[] = [
  { group: 'Activos Fijos - Equipos', item: 'Máquina de helados', quantity: 1, unitCost: 3500, totalCost: 3500, detail: 'Equipo industrial comercial' },
  { group: 'Activos Fijos - Equipos', item: 'Laptop de gestión y punto de venta', quantity: 1, unitCost: 1400, totalCost: 1400, detail: 'Terminal para sistema de caja' },
  { group: 'Activos Fijos - Equipos', item: 'Vitrina exhibidora refrigerada', quantity: 1, unitCost: 1049, totalCost: 1049, detail: 'Exhibición de postres y bebidas' },
  { group: 'Activos Fijos - Equipos', item: 'Barra de atención y cafetería', quantity: 1, unitCost: 1000, totalCost: 1000, detail: 'Mueble de despacho y caja' },
  { group: 'Activos Fijos - Equipos', item: 'Cafetera eléctrica profesional', quantity: 1, unitCost: 800, totalCost: 800, detail: 'Preparación de espresso y café' },
  { group: 'Activos Fijos - Equipos', item: 'Refrigeradora', quantity: 1, unitCost: 600, totalCost: 600, detail: 'Conservación de lácteos y frutas' },
  { group: 'Activos Fijos - Equipos', item: 'Microondas', quantity: 1, unitCost: 179, totalCost: 179, detail: 'Calentamiento rápido' },
  { group: 'Activos Fijos - Equipos', item: 'Licuadora de alta potencia', quantity: 1, unitCost: 179, totalCost: 179, detail: 'Frappes y jugos naturales' },
  { group: 'Activos Fijos - Equipos', item: 'Freidora de aire', quantity: 1, unitCost: 135, totalCost: 135, detail: 'Snacks y bocados sin aceite' },

  { group: 'Activos Fijos - Mobiliario', item: 'Juegos de mesa y 4 sillas (6 mesas)', quantity: 6, unitCost: 500, totalCost: 3000, detail: 'Capacidad para 24 jugadores sentados' },
  { group: 'Activos Fijos - Mobiliario', item: 'Mostrador estantería para juegos', quantity: 1, unitCost: 300, totalCost: 300, detail: 'Exhibición de la ludoteca' },
  { group: 'Activos Fijos - Mobiliario', item: 'Decoración temática y extintor de seguridad', quantity: 1, unitCost: 250, totalCost: 250, detail: 'Ambientación lúdica y seguridad ITSE' },

  { group: 'Enseres de Cocina', item: 'Implementos de cocina (wafflera, bowls, jarras, espátulas)', quantity: 1, unitCost: 200, totalCost: 200, detail: 'Vajilla y utensilios de cafetería' },

  { group: 'Capital de Trabajo Inicial', item: 'Lote inicial de 17 juegos de mesa', quantity: 1, unitCost: 580.51, totalCost: 580.51, detail: 'Monopoly, Uno, Cód. Secreto, Virus, Taco Gato, Carcassonne, etc.' },
  { group: 'Capital de Trabajo Inicial', item: 'Stock inicial de insumos y perecibles', quantity: 1, unitCost: 794.30, totalCost: 794.30, detail: 'Harina, leches, frutas, nutella, café, chocolate' },
  { group: 'Capital de Trabajo Inicial', item: 'Efectivo en caja chica inicial', quantity: 1, unitCost: 1200, totalCost: 1200, detail: 'Fondo de cambio para transacciones' },

  { group: 'Gastos Pre-Operativos', item: 'Constitución SUNARP (Búsqueda, reserva, minuta, escritura)', quantity: 1, unitCost: 381.20, totalCost: 381.20, detail: 'Personería jurídica formal' },
  { group: 'Gastos Pre-Operativos', item: 'Licencia municipal y certificado ITSE de seguridad', quantity: 1, unitCost: 163.80, totalCost: 163.80, detail: 'Permisos legales de apertura' },
  { group: 'Gastos Pre-Operativos', item: 'Acondicionamiento del local y letrero exterior', quantity: 1, unitCost: 1450, totalCost: 1450, detail: 'Letrero principal y pintura temática' },
  { group: 'Gastos Pre-Operativos', item: 'Publicidad inicial y uniformes del equipo', quantity: 1, unitCost: 330, totalCost: 330, detail: 'Banners, redes y camisetas temáticas' },
]

// ==========================================
// 5. INSUMOS Y MATERIAS PRIMAS (EXCEL)
// ==========================================
export interface IngredientStockItem {
  name: string
  category: string
  currentStock: number
  unit: string
  presentation: string
  unitCost: number // Costo de compra en Soles (S/.)
  minStock: number
}

export const INITIAL_INGREDIENTS_DATA: IngredientStockItem[] = [
  { name: 'Harina preparada', category: 'Repostería y Panadería', currentStock: 12, unit: 'kg', presentation: 'Bolsa 1 kg', unitCost: 5.00, minStock: 3 },
  { name: 'Huevo fresco', category: 'Lácteos y Huevos', currentStock: 60, unit: 'und', presentation: 'Plancha 30 und', unitCost: 0.50, minStock: 15 },
  { name: 'Polvo de hornear (Royal)', category: 'Repostería y Panadería', currentStock: 10, unit: 'sobres', presentation: 'Sobre 20 g', unitCost: 1.50, minStock: 3 },
  { name: 'Azúcar rubia', category: 'Abarrotes Dulces', currentStock: 15, unit: 'kg', presentation: 'Bolsa 1 kg', unitCost: 5.00, minStock: 4 },
  { name: 'Leche entera', category: 'Lácteos y Huevos', currentStock: 24, unit: 'latas/litros', presentation: 'Lata 390 g / Botella 1 L', unitCost: 3.00, minStock: 6 },
  { name: 'Aceite vegetal', category: 'Abarrotes', currentStock: 8, unit: 'botellas', presentation: 'Botella 900 ml', unitCost: 8.00, minStock: 2 },
  { name: 'Esencia de vainilla', category: 'Repostería y Panadería', currentStock: 5, unit: 'frascos', presentation: 'Frasco 90 ml', unitCost: 2.50, minStock: 1 },
  { name: 'Fresas frescas de temporada', category: 'Frutas y Perecibles', currentStock: 6, unit: 'kg', presentation: 'Bandeja fresca 1 kg', unitCost: 6.50, minStock: 2 },
  { name: 'Plátano seda selecto', category: 'Frutas y Perecibles', currentStock: 8, unit: 'kg', presentation: 'Mano 1 kg', unitCost: 3.50, minStock: 2 },
  { name: 'Fudge de chocolate repostero', category: 'Salsas y Toppings', currentStock: 6, unit: 'potes', presentation: 'Pote 500 g', unitCost: 8.00, minStock: 2 },
  { name: 'Miel de abeja / Jarabe de Maple', category: 'Salsas y Toppings', currentStock: 4, unit: 'frascos', presentation: 'Frasco 500 ml', unitCost: 9.00, minStock: 1 },
  { name: 'Café instantáneo gourmet', category: 'Cafetería', currentStock: 8, unit: 'frascos', presentation: 'Frasco 150 g', unitCost: 15.00, minStock: 2 },
  { name: 'Café de especialidad en grano', category: 'Cafetería', currentStock: 6, unit: 'bolsas', presentation: 'Bolsa 250 g tostado', unitCost: 18.00, minStock: 2 },
  { name: 'Cocoa pura en polvo', category: 'Cafetería', currentStock: 10, unit: 'bolsas', presentation: 'Bolsa 110 g Winter', unitCost: 4.50, minStock: 3 },
  { name: 'Hielo en cubos purificado', category: 'Bebidas e Insumos Fríos', currentStock: 15, unit: 'bolsas', presentation: 'Bolsa 2 kg', unitCost: 3.50, minStock: 4 },
  { name: 'Crema batida Chantilly', category: 'Lácteos y Huevos', currentStock: 7, unit: 'envases', presentation: 'Envase 500 g', unitCost: 15.00, minStock: 2 },
  { name: 'Jarabe sirope de chocolate', category: 'Salsas y Toppings', currentStock: 5, unit: 'botellas', presentation: 'Botella 300 ml', unitCost: 9.00, minStock: 1 },
  { name: 'Jarabe sirope de caramelo', category: 'Salsas y Toppings', currentStock: 4, unit: 'botellas', presentation: 'Botella 300 ml', unitCost: 9.00, minStock: 1 },
  { name: 'Nutella crema de avellana', category: 'Salsas y Toppings', currentStock: 5, unit: 'frascos', presentation: 'Frasco 350 g', unitCost: 18.50, minStock: 2 },
  { name: 'Maracuyá fresca', category: 'Frutas y Perecibles', currentStock: 5, unit: 'kg', presentation: 'Malla 1 kg', unitCost: 5.00, minStock: 2 },
  { name: 'Mango criollo maduro', category: 'Frutas y Perecibles', currentStock: 6, unit: 'kg', presentation: 'Malla 1 kg', unitCost: 4.50, minStock: 2 },
  { name: 'Piña Golden selecta', category: 'Frutas y Perecibles', currentStock: 4, unit: 'und', presentation: 'Unidad grande', unitCost: 4.00, minStock: 1 },
  { name: 'Pan de molde blanco artesanal', category: 'Repostería y Panadería', currentStock: 8, unit: 'bolsas', presentation: 'Bolsa 500 g rebanado', unitCost: 6.00, minStock: 2 },
  { name: 'Jamón inglés premium', category: 'Embutidos y Fiambres', currentStock: 4, unit: 'kg', presentation: 'Paquete 500 g rebanado', unitCost: 24.00, minStock: 1 },
  { name: 'Queso Edam en láminas', category: 'Lácteos y Huevos', currentStock: 5, unit: 'kg', presentation: 'Paquete 500 g rebanado', unitCost: 28.00, minStock: 1 },
  { name: 'Mantequilla con sal', category: 'Lácteos y Huevos', currentStock: 8, unit: 'potes', presentation: 'Pote 200 g Gloria/Laive', unitCost: 6.50, minStock: 2 },
  { name: 'Galletas Oreo clásicas', category: 'Snacks y Dulces', currentStock: 12, unit: 'paquetes', presentation: 'Paquete tubo 6 unidades', unitCost: 4.50, minStock: 3 },
  { name: 'Chispas de chocolate bitter', category: 'Repostería y Panadería', currentStock: 6, unit: 'bolsas', presentation: 'Bolsa 250 g', unitCost: 6.00, minStock: 2 },
  { name: 'Canela molida selecta', category: 'Especias', currentStock: 4, unit: 'frascos', presentation: 'Frasco 50 g', unitCost: 3.50, minStock: 1 },
  { name: 'Infusiones surtidas (Manzanilla, Anís, Té verde)', category: 'Cafetería', currentStock: 6, unit: 'cajas', presentation: 'Caja 25 sobres', unitCost: 5.50, minStock: 2 },
  { name: 'Vasos y tapas descartables 16 oz', category: 'Descartables y Empaques', currentStock: 2, unit: 'cientos', presentation: 'Paquete x 100 vasos', unitCost: 18.00, minStock: 1 },
  { name: 'Sorbetes biodegradables de polipapel', category: 'Descartables y Empaques', currentStock: 3, unit: 'cientos', presentation: 'Caja x 100 sorbetes', unitCost: 6.00, minStock: 1 },
  { name: 'Servilletas de mesa cuadradas', category: 'Descartables y Empaques', currentStock: 5, unit: 'paquetes', presentation: 'Paquete x 200 hojas', unitCost: 4.00, minStock: 2 },
]

// ==========================================
// 6. ASISTENTE INTELIGENTE DE ELABORACIÓN
// ==========================================
export interface RecipeFeasibilityResult {
  canPrepare: boolean
  status: 'DISPONIBLE' | 'FALTANTE_CRITICO' | 'STOCK_BAJO'
  maxPortionsPossible: number
  missingIngredients: Array<{
    name: string
    requiredAmount: string
    availableStock: number
    unit: string
    unitCost: number
  }>
  warnings: string[]
}

/**
 * Evalúa si una receta se puede preparar basándose en el inventario actual de insumos
 */
export function checkRecipeFeasibility(
  recipe: ProductRecipe,
  currentStockList: Array<{ name: string; currentStock: number; unit?: string; unitCost?: number }>
): RecipeFeasibilityResult {
  const missing: RecipeFeasibilityResult['missingIngredients'] = []
  const warnings: string[] = []
  let maxPortions = 999

  for (const ing of recipe.ingredients) {
    // Búsqueda inteligente por nombre aproximado
    const ingLower = ing.ingredient.toLowerCase()
    const foundStock = currentStockList.find((stockItem) => {
      const stockLower = stockItem.name.toLowerCase()
      // Comparación por palabras clave
      const keywords = ingLower.split(' ').filter((w) => w.length > 3)
      return keywords.some((kw) => stockLower.includes(kw)) || stockLower.includes(ingLower) || ingLower.includes(stockLower)
    })

    if (!foundStock || foundStock.currentStock <= 0) {
      missing.push({
        name: ing.ingredient,
        requiredAmount: ing.quantity,
        availableStock: foundStock ? foundStock.currentStock : 0,
        unit: ing.unit,
        unitCost: ing.cost,
      })
      maxPortions = 0
    } else {
      if (foundStock.currentStock <= 2) {
        warnings.push(`Stock bajo de ${foundStock.name} (${foundStock.currentStock} ${foundStock.unit || 'und'})`)
      }
      maxPortions = Math.min(maxPortions, foundStock.currentStock * 4) // aproximación de rinde
    }
  }

  const canPrepare = missing.length === 0 && maxPortions > 0
  const status = !canPrepare ? 'FALTANTE_CRITICO' : warnings.length > 0 ? 'STOCK_BAJO' : 'DISPONIBLE'

  return {
    canPrepare,
    status,
    maxPortionsPossible: canPrepare ? Math.max(1, Math.floor(maxPortions)) : 0,
    missingIngredients: missing,
    warnings,
  }
}


