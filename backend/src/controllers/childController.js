const db = require('../models/db');
const contentService = require('../services/contentService');
const screenTimeService = require('../services/screenTimeService');
const parentService = require('../services/parentService');

function resolveParentAndChild(req) {
  if (!req.user) {
    return { parentId: null, childId: null };
  }

  // Derive identity strictly from the authenticated token session
  const parentId = req.user.parentId || req.user.id;
  const childId = req.user.childId || (req.user.role === 'CHILD' ? req.user.id : null);

  return { parentId, childId };
}

async function getChildProfilesHandler(req, res, next) {
  try {
    let parentId = null;
    if (req.user) {
      parentId = req.user.parentId || req.user.id;
    } else if (req.query.parentId) {
      parentId = req.query.parentId;
    }

    let children = [];
    let dailyLimitMinutes = 60;

    if (parentId) {
      children = await db.findChildrenByParentId(parentId);
      const parent = await db.findParentById(parentId);
      if (parent) dailyLimitMinutes = parent.dailyLimitMinutes || 60;
    } else {
      // When opening child login screen, list active children
      const dbInstance = await db.getDb();
      const docs = await dbInstance.collection('children').find({ status: 'ACTIVE' }).toArray();
      children = docs.map(d => db.mapDoc(d));
    }

    const safeProfiles = children
      .filter(c => c.status === 'ACTIVE')
      .map(c => ({
        id: c.id,
        name: c.displayName || c.username,
        username: c.username,
        avatarEmoji: c.avatarEmoji,
        colorHex: c.colorHex,
        dailyLimitMinutes: c.dailyLimitMinutes || dailyLimitMinutes,
        ageGroup: c.ageGroup
      }));

    return res.status(200).json({
      success: true,
      count: safeProfiles.length,
      profiles: safeProfiles
    });
  } catch (err) {
    next(err);
  }
}

async function getHomeContentHandler(req, res, next) {
  try {
    let { parentId } = resolveParentAndChild(req);
    if (!parentId && req.query.parentId) {
      parentId = req.query.parentId;
    }
    // If still no parentId, fallback to latest parent with approved content
    if (!parentId) {
      const dbInstance = await db.getDb();
      const latestVideo = await dbInstance.collection('videos').findOne(
        { status: 'APPROVED' },
        { sort: { createdAt: -1 } }
      );
      if (latestVideo) {
        parentId = latestVideo.parentId;
      }
    }

    if (!parentId) {
      return res.status(200).json({
        success: true,
        count: 0,
        videos: [],
        channels: [],
        playlists: []
      });
    }

    const { category, search, channel } = req.query;
    const content = await contentService.getApprovedContent(parentId, { category, search, channel });
    return res.status(200).json({
      success: true,
      ...content
    });
  } catch (err) {
    next(err);
  }
}

async function getWatchTimeHandler(req, res, next) {
  try {
    const { parentId, childId } = resolveParentAndChild(req);
    if (!parentId || !childId) {
      return res.status(401).json({
        success: false,
        error: 'Child session authentication required to access watch time'
      });
    }

    const status = await screenTimeService.getScreenTimeStatus(parentId, childId);
    return res.status(200).json({ success: true, session: status });
  } catch (err) {
    next(err);
  }
}

async function syncWatchTimeHandler(req, res, next) {
  try {
    const { parentId, childId } = resolveParentAndChild(req);
    if (!parentId || !childId) {
      return res.status(401).json({
        success: false,
        error: 'Child session authentication required to sync watch time'
      });
    }

    const { secondsIncrement = 1 } = req.body;
    const status = await screenTimeService.recordWatchSeconds(parentId, childId, secondsIncrement);
    return res.status(200).json({ success: true, session: status });
  } catch (err) {
    next(err);
  }
}

async function requestPinExtensionHandler(req, res, next) {
  try {
    const { parentId, childId } = resolveParentAndChild(req);
    const { pin, extensionMinutes = 30 } = req.body;

    if (!parentId || !childId) {
      return res.status(401).json({ success: false, error: 'Authenticated child session required' });
    }

    if (!pin) {
      return res.status(400).json({ success: false, error: 'Parent PIN is required' });
    }

    const pinResult = await parentService.verifyParentPin(parentId, pin);
    if (!pinResult.success) {
      const statusCode = pinResult.isLockedOut ? 429 : 401;
      return res.status(statusCode).json(pinResult);
    }

    // PIN verified: Apply temporary extension for today only in MongoDB
    const updatedStatus = await screenTimeService.applyTemporaryExtension(parentId, childId, extensionMinutes);
    return res.status(200).json({
      success: true,
      message: `🎉 +${extensionMinutes} minutes granted by parent!`,
      session: updatedStatus
    });
  } catch (err) {
    next(err);
  }
}

async function updateChildAvatarHandler(req, res, next) {
  try {
    const childId = req.user?.childId || (req.user?.role === 'CHILD' ? req.user.id : null);
    if (!childId) {
      return res.status(403).json({ success: false, error: 'Only child accounts can update their avatar.' });
    }
    const { avatarEmoji, colorHex } = req.body;
    if (!avatarEmoji) {
      return res.status(400).json({ success: false, error: 'Avatar emoji is required' });
    }
    const updates = { avatarEmoji };
    if (colorHex !== undefined) {
      updates.colorHex = colorHex;
    }
    const updated = await db.updateChild(childId, updates);
    const { passwordHash, ...safeChild } = updated;
    return res.status(200).json({
      success: true,
      message: 'Avatar updated successfully! 🎨',
      child: safeChild
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getChildProfilesHandler,
  getHomeContentHandler,
  getWatchTimeHandler,
  syncWatchTimeHandler,
  requestPinExtensionHandler,
  updateChildAvatarHandler
};
