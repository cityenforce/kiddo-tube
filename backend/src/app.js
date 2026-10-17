const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const parentRoutes = require('./routes/parentRoutes');
const childRoutes = require('./routes/childRoutes');
const contentRoutes = require('./routes/contentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

// System health probe
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'KidsStream Central Production Backend',
    version: '3.0.0',
    database: 'MongoDB Production NoSQL Database',
    time: new Date().toISOString()
  });
});

// Mounted Production API Routes
app.use('/api/auth', authRoutes);
app.use('/api/parent', parentRoutes);
app.use('/api/child', childRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/admin', adminRoutes);

// Compatibility route for existing Android /api/parental/verify-pin and child endpoints
const parentController = require('./controllers/parentController');
const childController = require('./controllers/childController');
app.post('/api/parental/verify-pin', parentController.verifyPinHandler);
app.post('/api/parental/extend-time', childController.requestPinExtensionHandler);
app.post('/api/parental/sync-watch', childController.syncWatchTimeHandler);

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
