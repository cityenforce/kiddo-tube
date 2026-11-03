
const http = require('http');
const app = require('./app');
const db = require('./models/db');
const { PORT: CONFIG_PORT } = require('./config');

const PORT = process.env.PORT || CONFIG_PORT || 4000;

let databaseReady = false;

// Start the HTTP server immediately.
// Hostinger can detect the application without waiting for MongoDB.
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

// Listen on the port provided by the hosting platform.
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

    // The application cannot serve API requests without the database.
    server.close(() => {
      process.exit(1);
    });
  }
}

initializeDatabase();