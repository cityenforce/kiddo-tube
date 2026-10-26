const { randomBytes, createCipheriv, createDecipheriv } = require('node:crypto');
const { CHILD_PASSWORD_ENCRYPTION_KEY } = require('../config');

function getEncryptionKey() {
  const encodedKey = CHILD_PASSWORD_ENCRYPTION_KEY;
  if (!/^[A-Za-z0-9+/]{43}=$/.test(encodedKey)) {
    throw new Error('CHILD_PASSWORD_ENCRYPTION_KEY must be a base64-encoded 32-byte key');
  }

  const key = Buffer.from(encodedKey, 'base64');
  if (key.length !== 32) {
    throw new Error('CHILD_PASSWORD_ENCRYPTION_KEY must be a base64-encoded 32-byte key');
  }
  return key;
}

function encryptPassword(password, childId) {
  if (typeof password !== 'string' || !password || typeof childId !== 'string' || !childId) {
    throw new Error('Child password and ID are required');
  }

  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
  cipher.setAAD(Buffer.from(childId, 'utf8'));
  const ciphertext = Buffer.concat([
    cipher.update(password, 'utf8'),
    cipher.final()
  ]);
  const authTag = cipher.getAuthTag();

  return `v1.${iv.toString('base64')}.${authTag.toString('base64')}.${ciphertext.toString('base64')}`;
}

function decryptPassword(encryptedPassword, childId) {
  if (typeof encryptedPassword !== 'string' || typeof childId !== 'string' || !childId) {
    throw new Error('Stored child password is invalid');
  }

  const [version, encodedIv, encodedAuthTag, encodedCiphertext, ...extra] = encryptedPassword.split('.');
  if (version !== 'v1' || !encodedIv || !encodedAuthTag || !encodedCiphertext || extra.length) {
    throw new Error('Stored child password is invalid');
  }

  const key = getEncryptionKey();
  try {
    const decipher = createDecipheriv(
      'aes-256-gcm',
      key,
      Buffer.from(encodedIv, 'base64')
    );
    decipher.setAAD(Buffer.from(childId, 'utf8'));
    decipher.setAuthTag(Buffer.from(encodedAuthTag, 'base64'));
    return Buffer.concat([
      decipher.update(Buffer.from(encodedCiphertext, 'base64')),
      decipher.final()
    ]).toString('utf8');
  } catch {
    throw new Error('Stored child password could not be decrypted');
  }
}

module.exports = { encryptPassword, decryptPassword };
