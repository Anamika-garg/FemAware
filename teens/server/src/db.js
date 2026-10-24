import mongoose from 'mongoose';
import { config } from './config.js';

let memoryServer;

export async function connectDatabase(uri = config.mongoUri) {
  let target = uri;
  if (config.useInMemoryDb) {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    target = memoryServer.getUri('femaware_demo');
    console.warn('[db] Using an in-memory MongoDB. All data is lost when the server stops.');
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(target);
  await mongoose.connection.syncIndexes();
  return mongoose.connection;
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
}
