const express = require('express');
const router = express.Router();
const parentController = require('../controllers/parentController');
const { authenticate, requireParent } = require('../middleware/authMiddleware');

// Protected Parent Endpoints (Requires Valid Parent Session)
router.use(authenticate);

// PIN verification can be called with or without active parent session (e.g. child timeout dialog)
router.post('/verify-pin', parentController.verifyPinHandler);

// All subsequent routes require PARENT role
router.get('/dashboard', requireParent, parentController.getDashboardHandler);

// Children Management
router.get('/children/check-username', parentController.checkChildUsernameHandler);
router.get('/children', requireParent, parentController.getChildrenHandler);
router.post('/children', requireParent, parentController.createChildHandler);
router.put('/children/:childId', requireParent, parentController.updateChildHandler);
router.post('/children/:childId/reset-password', requireParent, parentController.resetChildPasswordHandler);
router.get('/children/:childId/password', requireParent, parentController.getChildPasswordHandler);
router.delete('/children/:childId', requireParent, parentController.deleteChildHandler);

// Settings & PIN Management
router.put('/settings/daily-limit', requireParent, parentController.updateDailyLimitHandler);
router.put('/settings/pin', requireParent, parentController.updatePinHandler);

// Account Settings
router.put('/profile', requireParent, parentController.updateProfileHandler);
router.post('/change-password', requireParent, parentController.changePasswordHandler);

module.exports = router;
