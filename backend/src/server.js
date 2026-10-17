const app = require('./app');
const db = require('./models/db');
const { PORT } = require('./config');

async function startServer() {
  try {
    console.log('[Server] Connecting to MongoDB...');
    await db.init();
    console.log('[Server] MongoDB connection active and indexes verified.');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Server] KidsStream API backend listening on 0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error('[Server] Fatal MongoDB connection failure:', err.message);
    process.exit(1);
  }
}

startServer();
