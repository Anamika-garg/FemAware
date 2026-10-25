import 'dotenv/config';
import app from './app.js';

// Vercel's zero-config Express runtime imports this file (or app.js) and calls
// the default export as the request handler. Local development and `npm start`
// use local.js, which connects to MongoDB and opens a port listener.
export default app;
