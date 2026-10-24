import mongoose from 'mongoose';

/**
 * Connect to MongoDB. In development, set USE_MEMORY_DB=true to run an
 * ephemeral MongoDB instance that is automatically seeded with demo data.
 * Production deployments must provide a persistent MONGODB_URI.
 */
export const connectDB = async () => {
  let uri = process.env.MONGODB_URI;

  if (process.env.USE_MEMORY_DB === 'true') {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri('cyclesense');
    process.env.MEMORY_MONGO_URI = uri;
    console.log('🧪 Using in-memory MongoDB for development');
  }

  if (!uri) {
    throw new Error(
      'MONGODB_URI is not defined. Add it to server/.env or run with USE_MEMORY_DB=true.'
    );
  }

  mongoose.set('strictQuery', true);
  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log(`✅ MongoDB connected: ${conn.connection.host}`);

  if (process.env.USE_MEMORY_DB === 'true') {
    const { User } = await import('../models/User.js');
    const [existingDemo, existingSenior] = await Promise.all([
      User.findOne({ email: 'demo@cyclesense.app' }),
      User.findOne({ email: 'senior@cyclesense.app' }),
    ]);
    if (!existingDemo || !existingSenior) {
      const { seedDatabase } = await import('../seed/seedData.js');
      await seedDatabase({ silent: true });
      console.log('🌱 Demo data seeded for the in-memory database');
    }
  }

  return conn;
};
