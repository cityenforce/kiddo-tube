const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

// All admin routes strictly require authentication AND ADMIN role (Part 21)
router.use(authenticate);
router.use(requireAdmin);

router.get('/dashboard', adminController.getAdminDashboardHandler);
router.get('/parents', adminController.getAllParentsHandler);
router.post('/parents', adminController.createParentHandler);
router.post('/users', adminController.createParentHandler);
router.patch('/parents/:parentId/toggle-status', adminController.toggleParentStatusHandler);
router.put('/parent/:parentId/status', adminController.toggleParentStatusHandler);
router.put('/parents/:parentId/status', adminController.toggleParentStatusHandler);

router.get('/children', adminController.getAllChildrenHandler);
router.patch('/children/:childId/toggle-status', adminController.toggleChildStatusHandler);
router.put('/child/:childId/status', adminController.toggleChildStatusHandler);
router.put('/children/:childId/status', adminController.toggleChildStatusHandler);

router.get('/content', adminController.getAllContentHandler);
router.post('/content/moderate', adminController.moderateContentHandler);

module.exports = router;
