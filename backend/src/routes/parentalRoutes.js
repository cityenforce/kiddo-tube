const express = require('express');
const router = express.Router();
const parentalController = require('../controllers/parentalController');

router.post('/verify-pin', parentalController.verifyPinHandler);
router.post('/extend-time', parentalController.extendTimeHandler);
router.put('/daily-limit', parentalController.updateDailyLimitHandler);
router.post('/sync-watch', parentalController.syncWatchHandler);
router.get('/status', parentalController.getScreenTimeHandler);

module.exports = router;
