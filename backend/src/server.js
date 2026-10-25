const http = require('http');
const https = require('https');
const net = require('net');
const fs = require('fs');
const path = require('path');
const app = require('./app');
const db = require('./models/db');
const { PORT } = require('./config');

const certDir = path.join(__dirname, '../certs');
const keyPath = path.join(certDir, 'server.key');
const certPath = path.join(certDir, 'server.crt');

function getSslCredentials() {
  try {
    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      return {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      };
    }
  } catch (err) {
    console.warn('[Server] Could not load SSL certificates:', err.message);
  }
  return null;
}

async function startServer() {
  try {
    console.log('[Server] Connecting to MongoDB...');
    await db.init();
    console.log('[Server] MongoDB connection active and indexes verified.');

    const sslCreds = getSslCredentials();

    if (!sslCreds) {
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`[Server] KidsStream API backend listening on http://0.0.0.0:${PORT}`);
      });
      return;
    }

    // Dual HTTP + HTTPS Multiplexing Server on the same port
    const httpServer = http.createServer(app);
    const httpsServer = https.createServer(sslCreds, app);

    const server = net.createServer((socket) => {
      socket.once('data', (buffer) => {
        socket.pause();
        socket.unshift(buffer);

        // Byte 0x16 (22) is TLS/SSL Handshake record -> route to HTTPS server
        if (buffer[0] === 22) {
          httpsServer.emit('connection', socket);
        } else {
          // Plain HTTP request (GET, POST, OPTIONS, etc.) -> route to HTTP server
          httpServer.emit('connection', socket);
        }

        process.nextTick(() => socket.resume());
      });

      socket.on('error', (err) => {
        if (err.code !== 'ECONNRESET') {
          console.debug('[Socket] Connection notice:', err.message);
        }
      });
    });

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`[Server] KidsStream API backend listening on 0.0.0.0:${PORT}`);
      console.log(`[Server] -> HTTP:  http://localhost:${PORT}/api/health`);
      console.log(`[Server] -> HTTPS: https://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('[Server] Fatal MongoDB connection failure:', err.message);
    process.exit(1);
  }
}

startServer();
