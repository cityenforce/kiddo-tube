const crypto = require('crypto');

// In-memory security state for rate-limiting and PIN validation
const PIN_ATTEMPT_STORE = new Map();
const MAX_ATTEMPTS = 3;
const LOCKOUT_WINDOW_MS = 60 * 1000; // 1 minute lockout

// Default parental PIN hash (SHA-256 of "1234")
let currentParentPinHash = crypto.createHash('sha256').update('1234').digest('hex');

function hashPin(pin) {
  return crypto.createHash('sha256').update(pin.trim()).digest('hex');
}

function verifyPin(parentId, enteredPin) {
  const now = Date.now();
  const attemptRecord = PIN_ATTEMPT_STORE.get(parentId) || { count: 0, lockedUntil: 0 };

  if (now < attemptRecord.lockedUntil) {
    const remainingSeconds = Math.ceil((attemptRecord.lockedUntil - now) / 1000);
    return {
      success: false,
      isLockedOut: true,
      remainingSeconds,
      message: `Too many failed attempts. Please wait ${remainingSeconds}s.`
    };
  }

  const enteredHash = hashPin(enteredPin);
  if (enteredHash === currentParentPinHash) {
    PIN_ATTEMPT_STORE.delete(parentId);
    return {
      success: true,
      overrideToken: crypto.randomBytes(16).toString('hex'),
      message: 'Parent access verified successfully'
    };
  } else {
    attemptRecord.count += 1;
    if (attemptRecord.count >= MAX_ATTEMPTS) {
      attemptRecord.lockedUntil = now + LOCKOUT_WINDOW_MS;
      PIN_ATTEMPT_STORE.set(parentId, attemptRecord);
      return {
        success: false,
        isLockedOut: true,
        remainingSeconds: Math.ceil(LOCKOUT_WINDOW_MS / 1000),
        message: 'Account locked due to 3 failed attempts.'
      };
    }

    PIN_ATTEMPT_STORE.set(parentId, attemptRecord);
    const attemptsLeft = MAX_ATTEMPTS - attemptRecord.count;
    return {
      success: false,
      isLockedOut: false,
      attemptsLeft,
      message: `Incorrect PIN. ${attemptsLeft} attempts remaining.`
    };
  }
}

function updatePin(parentId, newPin) {
  currentParentPinHash = hashPin(newPin);
  PIN_ATTEMPT_STORE.delete(parentId);
  return { success: true };
}

module.exports = {
  verifyPin,
  updatePin,
  hashPin
};
