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

  const clean = String(identifier).trim();
  const parent = await db.findParentByUsernameOrEmail(clean);
  if (!parent) {
    throw { statusCode: 401, message: 'Invalid credentials. Please verify your username or email.' };
  }

  if (parent.status === ACCOUNT_STATUS.BLOCKED) {
    throw { statusCode: 403, message: 'Your parent account has been blocked by the administrator.' };
  }

  if (parent.status === ACCOUNT_STATUS.DISABLED) {
    throw { statusCode: 403, message: 'Your account has been deactivated. Please contact support.' };
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

  if (child.status === ACCOUNT_STATUS.BLOCKED) {
    throw { statusCode: 403, message: 'This child profile has been blocked by the administrator.' };
  }
  if (child.status === ACCOUNT_STATUS.DISABLED) {
    throw { statusCode: 403, message: 'This child profile is deactivated.' };
  }

  // Get parent settings to load shared daily limit
  const parent = await db.findParentById(child.parentId);
  if (!parent) {
    throw { statusCode: 404, message: 'Parent account not found' };
  }
  if (parent.status === ACCOUNT_STATUS.BLOCKED) {
    throw { statusCode: 403, message: 'Parent account has been blocked by the administrator.' };
  }
  if (parent.status === ACCOUNT_STATUS.DISABLED) {
    throw { statusCode: 403, message: 'Parent account is currently deactivated.' };
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

const { sendPasswordResetOtpEmail } = require('./emailService');

const passwordResetStore = new Map(); // email.toLowerCase() -> { otp, expiresAt, parentId }

async function requestParentPasswordResetOtp(email) {
  if (!email || !email.includes('@')) {
    throw { statusCode: 400, message: 'Please provide a valid email address.' };
  }
  const cleanEmail = email.trim().toLowerCase();
  const parent = await db.findParentByUsernameOrEmail(cleanEmail);
  if (!parent) {
    throw { statusCode: 404, message: 'No parent account found registered with this email.' };
  }

  // Generate 6-digit OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins

  passwordResetStore.set(cleanEmail, {
    otp: otpCode,
    expiresAt,
    parentId: parent.id
  });

  try {
    const dbInstance = await db.getDb();
    await dbInstance.collection('passwordResetOtps').updateOne(
      { email: cleanEmail },
      { $set: { email: cleanEmail, otp: otpCode, expiresAt: new Date(expiresAt), parentId: parent.id } },
      { upsert: true }
    );
  } catch (dbErr) {
    console.warn('[AuthService] Could not persist OTP in DB, using memory store:', dbErr.message);
  }

  const emailRes = await sendPasswordResetOtpEmail(parent.email, otpCode, parent.displayName || parent.username);
  return {
    success: true,
    message: 'Verification code sent to your email.',
    devOtp: emailRes.devOtp
  };
}

async function resetParentPasswordWithOtp(email, otp, newPassword) {
  if (!email || !otp || !newPassword) {
    throw { statusCode: 400, message: 'Email, OTP code, and new password are required.' };
  }
  const cleanEmail = email.trim().toLowerCase();
  const cleanOtp = String(otp).trim();
  const cleanPass = newPassword.trim();

  if (cleanPass.length < 6) {
    throw { statusCode: 400, message: 'Password must be at least 6 characters long.' };
  }

  let record = passwordResetStore.get(cleanEmail);
  if (!record) {
    try {
      const dbInstance = await db.getDb();
      const doc = await dbInstance.collection('passwordResetOtps').findOne({ email: cleanEmail });
      if (doc && new Date(doc.expiresAt).getTime() > Date.now()) {
        record = { otp: doc.otp, expiresAt: new Date(doc.expiresAt).getTime(), parentId: doc.parentId };
      }
    } catch (e) {
      // fallback
    }
  }

  if (!record || Date.now() > record.expiresAt) {
    throw { statusCode: 400, message: 'Verification code has expired. Please request a new one.' };
  }

  if (record.otp !== cleanOtp) {
    throw { statusCode: 400, message: 'Invalid verification code. Please check your email.' };
  }

  // Update password in database
  await db.updateParent(record.parentId, {
    passwordHash: hashPassword(cleanPass)
  });

  passwordResetStore.delete(cleanEmail);
  try {
    const dbInstance = await db.getDb();
    await dbInstance.collection('passwordResetOtps').deleteOne({ email: cleanEmail });
  } catch (e) {}

  return {
    success: true,
    message: 'Your password has been successfully reset! You can now log in.'
  };
}

module.exports = {
  registerParent,
  loginParent,
  loginChild,
  loginAdmin,
  logout,
  requestParentPasswordResetOtp,
  resetParentPasswordWithOtp
};
