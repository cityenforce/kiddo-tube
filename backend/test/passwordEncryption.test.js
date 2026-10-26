const test = require('node:test');
const assert = require('node:assert/strict');
const { randomBytes } = require('node:crypto');

process.env.CHILD_PASSWORD_ENCRYPTION_KEY = randomBytes(32).toString('base64');
const { encryptPassword, decryptPassword } = require('../src/utils/passwordEncryption');

test('child password encryption round-trips without storing plaintext', () => {
  const password = 'child secret 123';
  const encrypted = encryptPassword(password, 'kid_test');

  assert.notEqual(encrypted, password);
  assert.match(encrypted, /^v1\./);
  assert.equal(decryptPassword(encrypted, 'kid_test'), password);
});

test('encrypting the same child password produces unique ciphertext', () => {
  assert.notEqual(
    encryptPassword('same password', 'kid_test'),
    encryptPassword('same password', 'kid_test')
  );
});

test('tampered ciphertext is rejected', () => {
  const encrypted = encryptPassword('child secret 123', 'kid_test');
  const parts = encrypted.split('.');
  parts[3] = `${parts[3][0] === 'A' ? 'B' : 'A'}${parts[3].slice(1)}`;

  assert.throws(() => decryptPassword(parts.join('.'), 'kid_test'), /could not be decrypted/);
});

test('ciphertext cannot be reassigned to another child', () => {
  const encrypted = encryptPassword('child secret 123', 'kid_test');

  assert.throws(() => decryptPassword(encrypted, 'kid_other'), /could not be decrypted/);
});

test('malformed encrypted password is rejected', () => {
  assert.throws(() => decryptPassword('not-encrypted', 'kid_test'), /is invalid/);
});
