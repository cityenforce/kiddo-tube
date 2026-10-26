const db = require('../models/db');
const { ACCOUNT_STATUS } = require('../constants/roles');
const { hashPassword } = require('../utils/cryptoUtils');
const { encryptPassword, decryptPassword } = require('../utils/passwordEncryption');
const { getTodayDateString } = require('../utils/dateUtils');
const { randomUUID } = require('node:crypto');

async function getChildren(parentId) {
  const children = await db.findChildrenByParentId(parentId);
  const parent = await db.findParentById(parentId);
  const dailyLimitMinutes = parent ? parent.dailyLimitMinutes : 60;
  const today = getTodayDateString();

  const results = [];
  for (const c of children) {
    const watchRecord = await db.getWatchTimeRecord(parentId, c.id, today);
    const { passwordHash, passwordEncrypted, plainPassword, ...safeChild } = c;
    results.push({
      ...safeChild,
      dailyLimitMinutes,
      secondsWatchedToday: watchRecord.secondsWatched,
      minutesWatchedToday: Math.floor(watchRecord.secondsWatched / 60),
      tempExtensionMinutes: watchRecord.tempExtensionMinutes
    });
  }
  return results;
}

async function createChild(parentId, { username, displayName, password, avatarEmoji = '🚀', colorHex = 0xFF00A6FB, ageGroup = 6 }) {
  if (!username || typeof username !== 'string' || !username.trim()) {
    throw { statusCode: 400, message: 'Child username is required' };
  }

  const cleanUsername = username.trim();
  const existing = await db.findChildByGlobalUsername(cleanUsername);
  if (existing) {
    throw { statusCode: 409, message: `Username "${cleanUsername}" already exists. Please choose a different username.` };
  }

  const cleanPassword = typeof password === 'string' ? password.trim() : '';
  if (cleanPassword.length < 4) {
    throw { statusCode: 400, message: 'Password must be at least 4 characters long' };
  }

  let newChild;
  try {
    const childId = `kid_${randomUUID()}`;
    newChild = await db.createChild({
      id: childId,
      parentId,
      username: cleanUsername,
      displayName: (displayName || cleanUsername).trim(),
      passwordHash: hashPassword(cleanPassword),
      passwordEncrypted: encryptPassword(cleanPassword, childId),
      avatarEmoji: avatarEmoji || '🚀',
      colorHex: colorHex || 0xFF00A6FB,
      ageGroup: Number(ageGroup) || 6,
      status: ACCOUNT_STATUS.ACTIVE,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    if (error && error.code === 11000) {
      throw { statusCode: 409, message: `Username "${cleanUsername}" already exists. Please choose a different username.` };
    }
    throw error;
  }

  const { passwordHash, passwordEncrypted, plainPassword, ...safeChild } = newChild;
  return safeChild;
}

async function updateChild(parentId, childId, updates) {
  const child = await db.findChildById(childId);
  if (!child || child.parentId !== parentId) {
    throw { statusCode: 404, message: 'Child not found' };
  }

  const allowedFields = {};
  if (updates.displayName !== undefined) allowedFields.displayName = updates.displayName.trim();
  if (updates.avatarEmoji !== undefined) allowedFields.avatarEmoji = updates.avatarEmoji;
  if (updates.colorHex !== undefined) allowedFields.colorHex = updates.colorHex;
  if (updates.ageGroup !== undefined) allowedFields.ageGroup = Number(updates.ageGroup);
  if (updates.status !== undefined) allowedFields.status = updates.status;

  const updated = await db.updateChild(childId, allowedFields);
  const { passwordHash, passwordEncrypted, plainPassword, ...safeChild } = updated;
  return safeChild;
}

async function resetChildPassword(parentId, childId, newPassword) {
  const child = await db.findChildById(childId);
  if (!child || child.parentId !== parentId) {
    throw { statusCode: 404, message: 'Child not found' };
  }

  if (!newPassword || newPassword.trim().length < 4) {
    throw { statusCode: 400, message: 'Password must be at least 4 characters long' };
  }

  const cleanPass = newPassword.trim();
  const updated = await db.updateChild(childId, {
    passwordHash: hashPassword(cleanPass),
    passwordEncrypted: encryptPassword(cleanPass, childId)
  });

  return {
    success: true,
    message: `Password reset successfully for ${updated.displayName}`,
    username: updated.username
  };
}

async function getChildPassword(parentId, childId) {
  const child = await db.findChildById(childId);
  if (!child || child.parentId !== parentId) {
    throw { statusCode: 404, message: 'Child not found' };
  }

  const encryptedPassword = await db.findChildPasswordEncrypted(childId);
  if (!encryptedPassword) {
    throw {
      statusCode: 409,
      message: 'This password was set before secure viewing was available. Reset it to enable password viewing.'
    };
  }

  return { password: decryptPassword(encryptedPassword, childId) };
}

async function deleteChild(parentId, childId) {
  const child = await db.findChildById(childId);
  if (!child || child.parentId !== parentId) {
    throw { statusCode: 404, message: 'Child not found' };
  }

  await db.deleteChild(childId);
  return { success: true, message: 'Child profile deleted successfully' };
}

module.exports = {
  getChildren,
  createChild,
  updateChild,
  resetChildPassword,
  getChildPassword,
  deleteChild
};
