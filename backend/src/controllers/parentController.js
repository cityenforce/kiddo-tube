const parentService = require('../services/parentService');
const childService = require('../services/childService');
const db = require('../models/db');

async function getDashboardHandler(req, res, next) {
  try {
    const parentId = req.user.parentId || req.user.id;
    const dashboard = await parentService.getParentDashboard(parentId);
    return res.status(200).json({ success: true, data: dashboard });
  } catch (err) {
    next(err);
  }
}

async function getChildrenHandler(req, res, next) {
  try {
    const parentId = req.user.parentId || req.user.id;
    const children = await childService.getChildren(parentId);
    return res.status(200).json({ success: true, count: children.length, data: children });
  } catch (err) {
    next(err);
  }
}

async function createChildHandler(req, res, next) {
  try {
    const parentId = req.user.parentId || req.user.id;
    const { username, displayName, password, avatarEmoji, colorHex, ageGroup } = req.body;
    const newChild = await childService.createChild(parentId, {
      username,
      displayName,
      password,
      avatarEmoji,
      colorHex,
      ageGroup
    });
    return res.status(201).json({
      success: true,
      data: newChild,
      message: `Child profile "${newChild.displayName || newChild.username}" created successfully.`
    });
  } catch (err) {
    next(err);
  }
}

async function checkChildUsernameHandler(req, res, next) {
  try {
    const { username } = req.query;
    if (!username || !username.trim()) {
      return res.status(200).json({
        success: true,
        available: false,
        message: 'Username cannot be empty.'
      });
    }
    const clean = username.trim();
    if (clean.length < 3) {
      return res.status(200).json({
        success: true,
        available: false,
        message: 'Username must be at least 3 characters.'
      });
    }
    const existing = await db.findChildByGlobalUsername(clean);
    if (existing) {
      return res.status(200).json({
        success: true,
        available: false,
        message: `Username "${clean}" is already taken.`
      });
    }
    return res.status(200).json({
      success: true,
      available: true,
      message: 'Username is available! ✓'
    });
  } catch (err) {
    next(err);
  }
}

async function updateChildHandler(req, res, next) {
  try {
    const parentId = req.user.parentId || req.user.id;
    const { childId } = req.params;
    const updated = await childService.updateChild(parentId, childId, req.body);
    return res.status(200).json({
      success: true,
      data: updated,
      message: 'Child profile updated.'
    });
  } catch (err) {
    next(err);
  }
}

async function resetChildPasswordHandler(req, res, next) {
  try {
    const parentId = req.user.parentId || req.user.id;
    const { childId } = req.params;
    const { newPassword } = req.body;
    const result = await childService.resetChildPassword(parentId, childId, newPassword);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function deleteChildHandler(req, res, next) {
  try {
    const parentId = req.user.parentId || req.user.id;
    const { childId } = req.params;
    const result = await childService.deleteChild(parentId, childId);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function updateDailyLimitHandler(req, res, next) {
  try {
    const parentId = req.user.parentId || req.user.id;
    const { dailyLimitMinutes } = req.body;
    const result = await parentService.updateDailyLimit(parentId, dailyLimitMinutes);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function verifyPinHandler(req, res, next) {
  try {
    // Identity must be derived from the authenticated session (child or parent token)
    let parentId = null;
    if (req.user) {
      parentId = req.user.parentId || req.user.id;
    } else if (req.body.parentId) {
      parentId = req.body.parentId;
    }

    if (!parentId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication session required to verify parent PIN'
      });
    }

    const { pin } = req.body;
    if (!pin || typeof pin !== 'string') {
      return res.status(400).json({ success: false, error: 'Valid 4-digit PIN is required' });
    }

    const result = await parentService.verifyParentPin(parentId, pin);
    const statusCode = result.success ? 200 : (result.isLockedOut ? 429 : 401);
    return res.status(statusCode).json(result);
  } catch (err) {
    next(err);
  }
}

async function updatePinHandler(req, res, next) {
  try {
    const parentId = req.user.parentId || req.user.id;
    const { currentPin, newPin } = req.body;
    const result = await parentService.updateParentPin(parentId, currentPin, newPin);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function updateProfileHandler(req, res, next) {
  try {
    const parentId = req.user.parentId || req.user.id;
    const updated = await parentService.updateParentProfile(parentId, req.body);
    return res.status(200).json({ success: true, data: updated, message: 'Profile updated.' });
  } catch (err) {
    next(err);
  }
}

async function changePasswordHandler(req, res, next) {
  try {
    const parentId = req.user.parentId || req.user.id;
    const { currentPassword, newPassword } = req.body;
    const result = await parentService.changeParentPassword(parentId, currentPassword, newPassword);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboardHandler,
  getChildrenHandler,
  createChildHandler,
  checkChildUsernameHandler,
  updateChildHandler,
  resetChildPasswordHandler,
  deleteChildHandler,
  updateDailyLimitHandler,
  verifyPinHandler,
  updatePinHandler,
  updateProfileHandler,
  changePasswordHandler
};
