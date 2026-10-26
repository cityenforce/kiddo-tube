
const http = require('http');
const app = require('./app');
const db = require('./models/db');
const { PORT: CONFIG_PORT } = require('./config');

const PORT = process.env.PORT || CONFIG_PORT || 4000;

let databaseReady = false;

// Start listening immediately for Hostinger.
const server = http.createServer((req, res) => {
  if (!databaseReady) {
    res.writeHead(503, {
      'Content-Type': 'application/json; charset=utf-8',
      'Retry-After': '3',
    });

    res.end(JSON.stringify({
      success: false,
      message: 'Service is starting. Please try again shortly.',
    }));

    return;
  }

  app(req, res);
});

server.on('error', (err) => {
  console.error('[Server] HTTP server error:', err.message);
  process.exit(1);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(
    `[Server] KidsStream API listening on 0.0.0.0:${PORT}`
  );
});

// Initialize MongoDB after the HTTP server starts.
async function initializeDatabase() {
  try {
    console.log('[Server] Connecting to MongoDB...');

    await db.init();

    databaseReady = true;

    console.log(
      '[Server] MongoDB connection active and indexes verified.'
    );
    console.log('[Server] KidsStream API backend is ready.');
  } catch (err) {
    console.error(
      '[Server] MongoDB initialization failed:',
      err.message
    );

    // Do not keep the application running without its database.
    server.close(() => {
      process.exit(1);
    });
  }
}

initializeDatabase();
