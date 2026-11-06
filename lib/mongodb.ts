import { MongoClient, Db } from 'mongodb'

const uri = process.env.MONGODB_URI || ''
const dbName = process.env.MONGODB_DB || 'dados_bocados'

let client: MongoClient
let clientPromise: Promise<MongoClient>

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

if (!uri) {
  // Aviso controlado cuando falta la variable de entorno
  console.warn('⚠️ ADVERTENCIA: MONGODB_URI no está definida en las variables de entorno (.env.local)')
}

if (process.env.NODE_ENV === 'development') {
  // En modo desarrollo usamos una variable global para preservar la conexión
  // entre recargas de módulos causadas por HMR (Hot Module Replacement)
  if (!global._mongoClientPromise) {
    if (uri) {
      client = new MongoClient(uri)
      global._mongoClientPromise = client.connect()
    } else {
      global._mongoClientPromise = Promise.reject(new Error('MONGODB_URI no está configurada en .env.local'))
    }
  }
  clientPromise = global._mongoClientPromise
} else {
  // En producción es mejor no usar una variable global
  if (uri) {
    client = new MongoClient(uri)
    clientPromise = client.connect()
  } else {
    clientPromise = Promise.reject(new Error('MONGODB_URI no está configurada en las variables de entorno'))
  }
}

export async function getDatabase(): Promise<Db> {
  const client = await clientPromise
  return client.db(dbName)
}

export default clientPromise

