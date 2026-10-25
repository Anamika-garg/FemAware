import mongoose from 'mongoose';

/**
 * Connect to MongoDB. In development, set USE_MEMORY_DB=true to run an
 * ephemeral MongoDB instance that is automatically seeded with demo data.
 * Production deployments must provide a persistent MONGODB_URI (e.g. Atlas).
 */
const connect = async () => {
  let uri = process.env.MONGODB_URI;

  if (process.env.USE_MEMORY_DB === 'true') {
    if (process.env.VERCEL) {
      throw new Error(
        'USE_MEMORY_DB cannot be used on Vercel. Set MONGODB_URI to a persistent database.'
      );
    }
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    // Cold starts on Windows can exceed the 10s default.
    const memoryServer = await MongoMemoryServer.create({ instance: { launchTimeout: 60000 } });
    uri = memoryServer.getUri('femaware');
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

  console.log(`✅ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);

  // Teen lessons and guided-check guidance are shared content. Seeding is
  // idempotent and keeps existing clinician sign-offs for unchanged text.
  const { seedContent } = await import('../teen/seedContent.js');
  const content = await seedContent();
  if (content.created || content.updated) {
    console.log(`📚 Teen content: ${content.created} created, ${content.updated} updated`);
  }

  // Demo accounts are part of the product tour, so keep them available in
  // every environment — including Vercel — unless explicitly disabled. The
  // helper is idempotent and locks across instances so concurrent cold starts
  // cannot seed over each other.
  if (process.env.SEED_DEMO_ACCOUNTS !== 'false') {
    const { ensureDemoAccounts } = await import('../seed/seedData.js');
    const result = await ensureDemoAccounts({ silent: true });
    if (result.seeded) console.log('🌱 Demo accounts seeded');
  }

  return conn;
};

let connectionPromise = null;

/**
 * Connect once per process. Serverless platforms reuse a warm instance, so
 * caching the promise avoids reconnecting (and re-seeding) on every request.
 * A failed attempt is cleared so the next request can retry.
 */
export const connectDB = () => {
  if (!connectionPromise) {
    connectionPromise = connect().catch((error) => {
      connectionPromise = null;
      throw error;
    });
  }
  return connectionPromise;
};
