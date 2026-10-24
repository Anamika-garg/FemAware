import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterAll, afterEach, beforeAll } from 'vitest';
import app from '../app.js';
import { seedContent } from '../teen/seedContent.js';

export { app };

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

let counter = 0;

/** Registers a fresh account and returns a client that sends its bearer token. */
export async function newUser({ password = 'Password123!' } = {}) {
  counter += 1;
  const email = `teen${counter}-${Date.now()}@example.com`;
  const { body } = await request(app)
    .post('/api/auth/register')
    .send({ name: `Teen ${counter}`, email, password })
    .expect(201);
  const auth = (req) => req.set('Authorization', `Bearer ${body.token}`);
  return {
    user: body.user,
    email,
    password,
    get: (url) => auth(request(app).get(url)),
    post: (url) => auth(request(app).post(url)),
    patch: (url) => auth(request(app).patch(url)),
    delete: (url) => auth(request(app).delete(url)),
  };
}

export const isoDay = (offsetDays = 0) => new Date(Date.now() + offsetDays * 86_400_000).toISOString().slice(0, 10);
