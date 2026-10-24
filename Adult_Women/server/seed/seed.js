import 'dotenv/config';
import mongoose from 'mongoose';
import { seedDatabase } from './seedData.js';

const run = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('❌ Add MONGODB_URI to server/.env before seeding.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    await seedDatabase();
    console.log('✨ Seed complete.');
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
