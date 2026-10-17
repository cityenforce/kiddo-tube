const pinService = require('../services/pinVerificationService');
const screenTimeService = require('../services/screenTimeService');

function verifyPinHandler(req, res) {
  const { parentId = 'default_parent', pin } = req.body;
  if (!pin || typeof pin !== 'string') {
    return res.status(400).json({ error: 'Valid 4-digit PIN is required' });
  }

  const result = pinService.verifyPin(parentId, pin);
  if (result.success) {
    const session = screenTimeService.getSession('kid_default');
    return res.status(200).json({
      success: true,
      message: result.message,
      overrideToken: result.overrideToken,
      timeUsedMinutes: Math.floor(session.secondsWatched / 60),
      dailyLimitMinutes: session.dailyLimitMinutes
    });
  } else if (result.isLockedOut) {
    return res.status(429).json({
      success: false,
      error: result.message,
      lockoutSecondsRemaining: result.remainingSeconds
    });
  } else {
    return res.status(401).json({
      success: false,
      error: result.message,
      attemptsLeft: result.attemptsLeft
    });
  }
}

function extendTimeHandler(req, res) {
  const { childId = 'kid_default', extensionMinutes = 30 } = req.body;
  const updated = screenTimeService.applyExtension(childId, Number(extensionMinutes));
  return res.status(200).json({
    success: true,
    session: updated
  });
}

function updateDailyLimitHandler(req, res) {
  const { childId = 'kid_default', limitMinutes = 45 } = req.body;
  const updated = screenTimeService.updateDailyLimit(childId, Number(limitMinutes));
  return res.status(200).json({
    success: true,
    session: updated
  });
}

function syncWatchHandler(req, res) {
  const { childId = 'kid_default', secondsIncrement = 1 } = req.body;
  const updated = screenTimeService.syncWatchTime(childId, Number(secondsIncrement));
  return res.status(200).json({
    success: true,
    session: updated
  });
}

function getScreenTimeHandler(req, res) {
  const { childId = 'kid_default' } = req.query;
  const session = screenTimeService.getSession(childId);
  const totalAllowed = (session.dailyLimitMinutes + session.tempExtensionMinutes) * 60;
  return res.status(200).json({
    success: true,
    session: {
      ...session,
      isTimeUp: session.secondsWatched >= totalAllowed,
      remainingMinutes: Math.floor(Math.max(0, totalAllowed - session.secondsWatched) / 60)
    }
  });
}

module.exports = {
  verifyPinHandler,
  extendTimeHandler,
  updateDailyLimitHandler,
  syncWatchHandler,
  getScreenTimeHandler
};
