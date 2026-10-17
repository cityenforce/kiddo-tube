const db = require('../models/db');
const { ROLES, ACCOUNT_STATUS } = require('../constants/roles');
const {
  hashPassword,
  verifyPassword,
  hashPin,
  generateSessionToken
} = require('../utils/cryptoUtils');

async function registerParent({ username, email, password, pin }) {
  if (!username || !email || !password) {
    throw { statusCode: 400, message: 'Username, email, and password are required' };
  }

  if (password.length < 6) {
    throw { statusCode: 400, message: 'Password must be at least 6 characters' };
  }

  if (pin != null && (typeof pin !== 'string' || !/^\d{4}$/.test(pin.trim()))) {
    throw { statusCode: 400, message: 'PIN must be a 4-digit code' };
  }

  const existing = (await db.findParentByUsernameOrEmail(username)) || (await db.findParentByUsernameOrEmail(email));
  if (existing) {
    throw { statusCode: 409, message: 'Username or email already in use' };
  }

  const parentId = `parent_${Date.now()}`;

  const newParent = await db.createParent({
    id: parentId,
    username: username.trim(),
    displayName: username.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: hashPassword(password),
    pinHash: pin == null ? null : hashPin(pin),
    dailyLimitMinutes: 60,
    status: ACCOUNT_STATUS.ACTIVE,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const token = generateSessionToken('parent');
  await db.createSession(token, {
    userId: newParent.id,
    username: newParent.username,
    role: ROLES.PARENT,
    parentId: newParent.id
  });

  const { passwordHash, pinHash, ...safeParent } = newParent;
  return { parent: safeParent, token };
}

async function loginParent(identifier, password) {
  if (!identifier || !password) {
    throw { statusCode: 400, message: 'Username/Email and password are required' };
  }

  const parent = await db.findParentByUsernameOrEmail(identifier);
  if (!parent) {
    throw { statusCode: 401, message: 'Invalid credentials' };
  }

  if (parent.status === ACCOUNT_STATUS.DISABLED) {
    throw { statusCode: 403, message: 'Your account has been disabled. Please contact support.' };
  }

  const isValid = verifyPassword(password, parent.passwordHash);
  if (!isValid) {
    throw { statusCode: 401, message: 'Invalid credentials' };
  }

  const token = generateSessionToken('parent');
  await db.createSession(token, {
    userId: parent.id,
    username: parent.username,
    role: ROLES.PARENT,
    parentId: parent.id
  });

  const { passwordHash, pinHash, ...safeParent } = parent;
  return { parent: safeParent, token };
}

async function loginChild({ username, password, profileId }) {
  if (!username && !profileId) {
    throw { statusCode: 400, message: 'Please enter child username or choose profile' };
  }

  let child = null;
  const cleanUsername = username ? String(username).trim() : '';

  // 1. If child typed or entered a username, search strictly for that username/displayName
  if (cleanUsername) {
    child = await db.findChildByGlobalUsername(cleanUsername);
    if (!child && cleanUsername.startsWith('kid_')) {
      child = await db.findChildById(cleanUsername);
    }
    if (!child) {
      throw { statusCode: 404, message: `Child profile "${cleanUsername}" not found. Please check username or ask mom or dad for help!` };
    }
  } else if (profileId) {
    // 2. Only if no username was typed and child selected an avatar directly
    child = await db.findChildById(profileId);
  }

  if (!child) {
    throw { statusCode: 401, message: 'Child profile not found. Ask mom or dad for help!' };
  }

  if (child.status === ACCOUNT_STATUS.DISABLED) {
    throw { statusCode: 403, message: 'This explorer profile has been paused by parents.' };
  }

  // Real authentication: child must supply the correct password configured by parent
  const cleanPassword = password != null ? String(password).trim() : '';
  if (!cleanPassword) {
    throw { statusCode: 400, message: 'Please enter your secret password code!' };
  }

  const isValid = verifyPassword(cleanPassword, child.passwordHash);
  if (!isValid) {
    throw { statusCode: 401, message: 'Incorrect password. Ask mom or dad for help!' };
  }

  // Get parent settings to load shared daily limit
  const parent = await db.findParentById(child.parentId);
  if (!parent) {
    throw { statusCode: 404, message: 'Parent account not found' };
  }
  if (parent.status === ACCOUNT_STATUS.DISABLED) {
    throw { statusCode: 403, message: 'Parent account is currently disabled.' };
  }

  const dailyLimitMinutes = parent.dailyLimitMinutes || 60;

  const token = generateSessionToken('child');
  await db.createSession(token, {
    userId: child.id,
    username: child.username,
    role: ROLES.CHILD,
    parentId: child.parentId,
    childId: child.id
  });

  const { passwordHash, ...safeChild } = child;
  return {
    child: {
      ...safeChild,
      dailyLimitMinutes
    },
    token
  };
}

async function loginAdmin(identifier, password) {
  if (!identifier || !password) {
    throw { statusCode: 400, message: 'Admin username/email and password are required' };
  }

  const admin = await db.findAdminByUsernameOrEmail(identifier);
  if (!admin) {
    throw { statusCode: 401, message: 'Invalid admin credentials' };
  }

  if (admin.status === ACCOUNT_STATUS.DISABLED) {
    throw { statusCode: 403, message: 'Admin account disabled' };
  }

  const isValid = verifyPassword(password, admin.passwordHash);
  if (!isValid) {
    throw { statusCode: 401, message: 'Invalid admin credentials' };
  }

  const token = generateSessionToken('admin');
  await db.createSession(token, {
    userId: admin.id,
    username: admin.username,
    role: ROLES.ADMIN
  });

  const { passwordHash, ...safeAdmin } = admin;
  return { admin: safeAdmin, token };
}

async function logout(token) {
  if (token) {
    await db.deleteSession(token);
  }
  return true;
}

module.exports = {
  registerParent,
  loginParent,
  loginChild,
  loginAdmin,
  logout
};
