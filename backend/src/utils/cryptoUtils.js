const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const BCRYPT_SALT_ROUNDS = 10;

function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }
  return bcrypt.hashSync(password, BCRYPT_SALT_ROUNDS);
}

function verifyPassword(password, storedHash) {
  if (!password || !storedHash) return false;
  try {
    return bcrypt.compareSync(password, storedHash);
  } catch (err) {
    return false;
  }
}

function hashPin(pin) {
  if (!pin || typeof pin !== 'string') {
    throw new Error('PIN must be a non-empty string');
  }
  return bcrypt.hashSync(pin.trim(), BCRYPT_SALT_ROUNDS);
}

function verifyPin(pin, storedHash) {
  if (!pin || !storedHash) return false;
  try {
    return bcrypt.compareSync(pin.trim(), storedHash);
  } catch (err) {
    return false;
  }
}

function generateSessionToken(prefix = 'sess') {
  return `${prefix}_${Date.now()}_${crypto.randomBytes(24).toString('hex')}`;
}

module.exports = {
  hashPassword,
  verifyPassword,
  hashPin,
  verifyPin,
  generateSessionToken
};
