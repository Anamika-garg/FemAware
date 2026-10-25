import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = Number(process.env.PORT) || 5000;

const start = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`\n🌸 FemAware API running on http://localhost:${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);
    });

    const shutdown = async (signal) => {
      console.log(`\n${signal} received. Closing server…`);
      server.close(() => process.exit(0));
      setTimeout(() => process.exit(1), 10000).unref();
    };
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('❌ Failed to start FemAware API:', error.message);
    process.exit(1);
  }
};

start();
