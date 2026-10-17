const express = require('express');
const router = express.Router();
const childController = require('../controllers/childController');
const { authenticate, requireAuth } = require('../middleware/authMiddleware');

router.use(authenticate);

// Child endpoints: profiles and home feed support session
router.get('/profiles', requireAuth, childController.getChildProfilesHandler);
router.get('/home', childController.getHomeContentHandler);
router.get('/watch-time', requireAuth, childController.getWatchTimeHandler);
router.post('/watch-time/sync', requireAuth, childController.syncWatchTimeHandler);
router.post('/extension/request', requireAuth, childController.requestPinExtensionHandler);
router.put('/avatar', requireAuth, childController.updateChildAvatarHandler);

module.exports = router;
