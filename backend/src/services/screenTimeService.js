const db = require('../models/db');
const { getTodayDateString } = require('../utils/dateUtils');

async function getScreenTimeStatus(parentId, childId) {
  const parent = await db.findParentById(parentId);
  const dailyLimitMinutes = parent ? parent.dailyLimitMinutes : 60;
  const today = getTodayDateString();

  const record = await db.getWatchTimeRecord(parentId, childId, today);
  const totalAllowedMinutes = dailyLimitMinutes + (record.tempExtensionMinutes || 0);
  const totalAllowedSeconds = totalAllowedMinutes * 60;
  const remainingSeconds = Math.max(0, totalAllowedSeconds - (record.secondsWatched || 0));
  const remainingMinutes = Math.floor(remainingSeconds / 60);

  return {
    childId,
    date: today,
    dailyLimitMinutes,
    tempExtensionMinutes: record.tempExtensionMinutes || 0,
    totalAllowedMinutes,
    secondsWatched: record.secondsWatched || 0,
    minutesWatched: Math.floor((record.secondsWatched || 0) / 60),
    remainingSeconds,
    remainingMinutes,
    isTimeUp: remainingSeconds <= 0
  };
}

async function recordWatchSeconds(parentId, childId, secondsIncrement = 1) {
  // Cap increment between 0 and 300 seconds to allow standard periodic sync batches
  const inc = Math.min(300, Math.max(0, Number(secondsIncrement) || 1));
  const today = getTodayDateString();
  await db.incrementWatchTime(parentId, childId, inc, today);
  return getScreenTimeStatus(parentId, childId);
}

async function applyTemporaryExtension(parentId, childId, extensionMinutes = 30) {
  const mins = Math.max(5, Number(extensionMinutes) || 15);
  const today = getTodayDateString();
  await db.applyTemporaryExtension(parentId, childId, mins, today);
  return getScreenTimeStatus(parentId, childId);
}

module.exports = {
  getScreenTimeStatus,
  recordWatchSeconds,
  applyTemporaryExtension
};
