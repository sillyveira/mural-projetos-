import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Por favor, adicione a variável MONGODB_URI no arquivo .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Declaração global para TypeScript
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

  client = new MongoClient(uri, options);
  clientPromise = client.connect();

/**
 * Obtém o cliente MongoDB conectado
 * @returns Promise com o MongoClient
 */
export async function getMongoClient(): Promise<MongoClient> {
  return clientPromise;
}

/**
 * Obtém o banco de dados
 * @param dbName - Nome do banco de dados (opcional, usa o padrão da URI se não fornecido)
 * @returns Promise com a instância do banco de dados
 */
export async function getDatabase(dbName?: string): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}

/**
 * Testa a conexão com o MongoDB
 * @returns Promise<boolean> - true se conectado, false caso contrário
 */
export async function testConnection(): Promise<boolean> {
  try {
    const client = await clientPromise;
    await client.db('admin').command({ ping: 1 });
    console.log('✅ Conectado ao MongoDB Atlas com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error);
    return false;
  }
}

// Exporta o clientPromise como padrão para uso no Next.js
export default clientPromise;
