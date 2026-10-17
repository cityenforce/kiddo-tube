const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const { authenticate, requireAuth, requireParent } = require('../middleware/authMiddleware');

router.use(authenticate);

// Content viewing endpoints derive parentId from user session
router.get('/approved', requireAuth, contentController.getApprovedVideos);
router.get('/search', requireAuth, contentController.searchContent);
router.get('/video/:id', requireAuth, contentController.getVideoById);

// Parent content management - requires authentication AND PARENT role
router.post('/channel', requireAuth, requireParent, contentController.addChannel);
router.delete('/channel/:id', requireAuth, requireParent, contentController.removeChannel);

router.post('/playlist', requireAuth, requireParent, contentController.addPlaylist);
router.delete('/playlist/:id', requireAuth, requireParent, contentController.removePlaylist);

router.post('/video', requireAuth, requireParent, contentController.addVideo);
router.delete('/video/:id', requireAuth, requireParent, contentController.removeVideo);

module.exports = router;
