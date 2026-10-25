const db = require('../models/db');
const { hashPassword, verifyPassword, hashPin, verifyPin, generateSessionToken } = require('../utils/cryptoUtils');
const { getTodayDateString } = require('../utils/dateUtils');
const { CONTENT_STATUS } = require('../constants/roles');
const { validateEmail } = require('../validators/inputValidators');

async function getParentDashboard(parentId) {
  const parent = await db.findParentById(parentId);
  if (!parent) {
    throw { statusCode: 404, message: 'Parent account not found' };
  }

  const children = await db.findChildrenByParentId(parentId);
  const channels = await db.getChannels(parentId, CONTENT_STATUS.APPROVED);
  const playlists = await db.getPlaylists(parentId, CONTENT_STATUS.APPROVED);
  const videos = await db.getVideos(parentId, CONTENT_STATUS.APPROVED);

  const today = getTodayDateString();
  let totalWatchedSecondsToday = 0;
  for (const c of children) {
    const rec = await db.getWatchTimeRecord(parentId, c.id, today);
    totalWatchedSecondsToday += rec.secondsWatched || 0;
  }

  const { passwordHash, pinHash, ...safeParent } = parent;

  return {
    parent: safeParent,
    stats: {
      totalChildren: children.length,
      dailyLimitMinutes: parent.dailyLimitMinutes,
      todayTotalWatchedMinutes: Math.floor(totalWatchedSecondsToday / 60),
      totalApprovedChannels: channels.length,
      totalApprovedPlaylists: playlists.length,
      totalApprovedVideos: videos.length
    }
  };
}

async function updateDailyLimit(parentId, newLimitMinutes) {
  const limit = Number(newLimitMinutes);
  if (isNaN(limit) || limit < 1 || limit > 360) {
    throw { statusCode: 400, message: 'Daily limit must be between 1 and 360 minutes' };
  }

  const updated = await db.updateParent(parentId, { dailyLimitMinutes: limit });
  if (!updated) {
    throw { statusCode: 404, message: 'Parent account not found' };
  }

  return {
    success: true,
    dailyLimitMinutes: updated.dailyLimitMinutes,
    message: `Daily limit updated to ${updated.dailyLimitMinutes} minutes for all children.`
  };
}

async function verifyParentPin(parentId, enteredPin) {
  const parent = await db.findParentById(parentId);
  if (!parent) {
    throw { statusCode: 404, message: 'Parent account not found' };
  }

  // Check lockout
  const attempts = await db.getPinAttempts(parentId);
  const now = Date.now();
  if (now < attempts.lockedUntil) {
    const remainingSeconds = Math.ceil((attempts.lockedUntil - now) / 1000);
    return {
      success: false,
      isLockedOut: true,
      remainingSeconds,
      message: `Account locked due to too many failed PIN attempts. Wait ${remainingSeconds}s.`
    };
  }

  const isCorrect = verifyPin(enteredPin, parent.pinHash);
  if (isCorrect) {
    await db.resetPinAttempts(parentId);
    return {
      success: true,
      overrideToken: generateSessionToken('pin_override'),
      dailyLimitMinutes: parent.dailyLimitMinutes,
      message: 'Parent PIN verified successfully'
    };
  } else {
    const updatedAttempts = await db.recordFailedPinAttempt(parentId);
    if (updatedAttempts.lockedUntil > now) {
      return {
        success: false,
        isLockedOut: true,
        remainingSeconds: Math.ceil((updatedAttempts.lockedUntil - now) / 1000),
        message: 'Account locked due to 3 failed attempts.'
      };
    }

    const attemptsLeft = 3 - updatedAttempts.failedCount;
    return {
      success: false,
      isLockedOut: false,
      attemptsLeft,
      message: `Incorrect PIN. ${attemptsLeft} attempts remaining.`
    };
  }
}

async function updateParentPin(parentId, currentPin, newPin) {
  const parent = await db.findParentById(parentId);
  if (!parent) {
    throw { statusCode: 404, message: 'Parent account not found' };
  }

  if (!/^\d{4}$/.test(newPin.trim())) {
    throw { statusCode: 400, message: 'New PIN must be exactly 4 digits' };
  }

  // If currentPin is provided, verify it. If omitted (direct PIN reset), allow new PIN directly
  if (currentPin && parent.pinHash && !verifyPin(currentPin, parent.pinHash)) {
    throw { statusCode: 401, message: 'Current PIN is incorrect' };
  }

  await db.updateParent(parentId, {
    pinHash: hashPin(newPin.trim())
  });

  await db.resetPinAttempts(parentId);
  return { success: true, message: 'Parent PIN updated successfully' };
}

async function updateParentProfile(parentId, { username, displayName, email }) {
  const parent = await db.findParentById(parentId);
  if (!parent) {
    throw { statusCode: 404, message: 'Parent account not found' };
  }

  const allowed = {};
  const nextUsername = typeof username === 'string' ? username.trim() : parent.username;
  const nextEmail = typeof email === 'string' ? email.trim().toLowerCase() : parent.email;
  const nextDisplayName =
    typeof displayName === 'string'
      ? displayName.trim()
      : typeof username === 'string'
        ? nextUsername
        : parent.displayName;

  if (!nextUsername) {
    throw { statusCode: 400, message: 'Username is required' };
  }
  if (!nextEmail || !validateEmail(nextEmail)) {
    throw { statusCode: 400, message: 'A valid email address is required' };
  }

  for (const identifier of [nextUsername, nextEmail]) {
    const existing = await db.findParentByUsernameOrEmail(identifier);
    if (existing && existing.id !== parent.id) {
      throw { statusCode: 409, message: 'Username or email already in use' };
    }
  }

  allowed.username = nextUsername;
  allowed.displayName = nextDisplayName || nextUsername;
  allowed.email = nextEmail;

  const updated = await db.updateParent(parentId, allowed);
  const { passwordHash, pinHash, ...safeParent } = updated;
  return safeParent;
}

async function changeParentPassword(parentId, currentPassword, newPassword) {
  const parent = await db.findParentById(parentId);
  if (!parent) {
    throw { statusCode: 404, message: 'Parent account not found' };
  }

  const isValid = verifyPassword(currentPassword, parent.passwordHash);
  if (!isValid) {
    throw { statusCode: 401, message: 'Current password is incorrect' };
  }

  if (!newPassword || newPassword.trim().length < 6) {
    throw { statusCode: 400, message: 'New password must be at least 6 characters' };
  }

  await db.updateParent(parentId, {
    passwordHash: hashPassword(newPassword.trim())
  });

  return { success: true, message: 'Password changed successfully' };
}

module.exports = {
  getParentDashboard,
  updateDailyLimit,
  verifyParentPin,
  updateParentPin,
  updateParentProfile,
  changeParentPassword
};
