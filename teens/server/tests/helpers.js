import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { createApp } from '../src/app.js';
import { seedContent } from '../src/scripts/seedContent.js';

export function useTestDatabase() {
  let mongo;
  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri('femaware_test'));
    await mongoose.connection.syncIndexes();
    await seedContent();
  });
  afterEach(async () => {
    const { collections } = mongoose.connection;
    await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
    await seedContent();
  });
  afterAll(async () => {
    await mongoose.disconnect();
    await mongo?.stop();
  });
}

/** A supertest agent with its own cookie jar = one anonymous demo session. */
export async function newVisitor(app = createApp()) {
  const agent = request.agent(app);
  const send = (method, url) => agent[method](url).set('X-FemAware-Client', '1');
  const client = {
    agent,
    get: (url) => agent.get(url),
    post: (url) => send('post', url),
    patch: (url) => send('patch', url),
    delete: (url) => send('delete', url),
  };
  await client.post('/api/session').expect(201);
  return client;
}

export const isoDay = (offsetDays = 0) => new Date(Date.now() + offsetDays * 86_400_000).toISOString().slice(0, 10);
