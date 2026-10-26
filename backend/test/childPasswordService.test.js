const test = require('node:test');
const assert = require('node:assert/strict');
const { randomBytes } = require('node:crypto');

process.env.CHILD_PASSWORD_ENCRYPTION_KEY = randomBytes(32).toString('base64');
const db = require('../src/models/db');
const childService = require('../src/services/childService');
const { verifyPassword } = require('../src/utils/cryptoUtils');
const { decryptPassword } = require('../src/utils/passwordEncryption');

async function withDbStubs(stubs, run) {
  const originals = {};
  for (const [method, stub] of Object.entries(stubs)) {
    originals[method] = db[method];
    db[method] = stub;
  }

  try {
    await run();
  } finally {
    for (const [method, original] of Object.entries(originals)) {
      db[method] = original;
    }
  }
}

test('creating a child stores both a bcrypt hash and an encrypted password', async () => {
  let savedChild;
  await withDbStubs({
    findChildByGlobalUsername: async () => null,
    createChild: async (child) => {
      savedChild = child;
      return { ...child };
    }
  }, async () => {
    const result = await childService.createChild('parent_test', {
      username: 'kid-test',
      password: 'child-password'
    });

    assert.equal(verifyPassword('child-password', savedChild.passwordHash), true);
    assert.equal(decryptPassword(savedChild.passwordEncrypted, savedChild.id), 'child-password');
    assert.equal(result.passwordHash, undefined);
    assert.equal(result.passwordEncrypted, undefined);
  });
});

test('resetting a child password updates its hash and encrypted copy', async () => {
  const child = { id: 'kid_test', parentId: 'parent_test', displayName: 'Kid' };
  let savedUpdates;
  await withDbStubs({
    findChildById: async () => child,
    updateChild: async (_id, updates) => {
      savedUpdates = updates;
      return { ...child, ...updates };
    }
  }, async () => {
    await childService.resetChildPassword('parent_test', 'kid_test', 'new-password');

    assert.equal(verifyPassword('new-password', savedUpdates.passwordHash), true);
    assert.equal(decryptPassword(savedUpdates.passwordEncrypted, child.id), 'new-password');
  });
});

test('only the owning parent can retrieve the child password', async () => {
  const encrypted = require('../src/utils/passwordEncryption')
    .encryptPassword('child-password', 'kid_test');
  let ciphertextRequested = false;
  await withDbStubs({
    findChildById: async () => ({ id: 'kid_test', parentId: 'parent_owner' }),
    findChildPasswordEncrypted: async () => {
      ciphertextRequested = true;
      return encrypted;
    }
  }, async () => {
    const result = await childService.getChildPassword('parent_owner', 'kid_test');
    assert.deepEqual(result, { password: 'child-password' });

    ciphertextRequested = false;
    await assert.rejects(
      childService.getChildPassword('another_parent', 'kid_test'),
      (error) => error.statusCode === 404
    );
    assert.equal(ciphertextRequested, false);
  });
});
