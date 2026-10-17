const authService = require('../services/authService');
const db = require('../models/db');
const { ROLES } = require('../constants/roles');

async function registerParentHandler(req, res, next) {
  try {
    const { username, email, password, pin } = req.body;
    const result = await authService.registerParent({ username, email, password, pin });
    return res.status(201).json({
      success: true,
      data: result.parent,
      token: result.token,
      role: ROLES.PARENT,
      message: 'Parent account registered successfully.'
    });
  } catch (err) {
    next(err);
  }
}

async function loginParentHandler(req, res, next) {
  try {
    const { username, email, identifier: rawIdentifier, password } = req.body;
    const identifier = rawIdentifier || username || email;
    const result = await authService.loginParent(identifier, password);
    return res.status(200).json({
      success: true,
      data: result.parent,
      token: result.token,
      role: ROLES.PARENT,
      message: 'Parent logged in successfully.'
    });
  } catch (err) {
    next(err);
  }
}

async function loginChildHandler(req, res, next) {
  try {
    const { username, password, profileId } = req.body;
    console.log(`[Auth API] Child login attempt: username="${username || ''}", profileId="${profileId || ''}"`);
    const result = await authService.loginChild({ username, password, profileId });
    console.log(`[Auth API] Child login SUCCESS for "${result.child.username}" (${result.child.id})`);
    return res.status(200).json({
      success: true,
      child: result.child,
      data: result.child,
      token: result.token,
      role: ROLES.CHILD,
      message: `Welcome back, ${result.child.displayName || result.child.username}! 🚀`
    });
  } catch (err) {
    console.error(`[Auth API] Child login FAILED for username="${req.body?.username || ''}":`, err.message || err);
    next(err);
  }
}

async function loginAdminHandler(req, res, next) {
  try {
    const { username, email, identifier: rawIdentifier, password } = req.body;
    const identifier = rawIdentifier || username || email;
    const result = await authService.loginAdmin(identifier, password);
    return res.status(200).json({
      success: true,
      data: result.admin,
      token: result.token,
      role: ROLES.ADMIN,
      message: 'Admin authenticated successfully.'
    });
  } catch (err) {
    next(err);
  }
}

async function logoutHandler(req, res, next) {
  try {
    const token = req.user ? req.user.token : (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    await authService.logout(token);
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (err) {
    next(err);
  }
}

async function meHandler(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, authenticated: false });
    }

    let userDetails = null;
    if (req.user.role === ROLES.PARENT) {
      const p = await db.findParentById(req.user.id);
      if (p) {
        const { passwordHash, pinHash, ...safe } = p;
        userDetails = safe;
      }
    } else if (req.user.role === ROLES.CHILD) {
      const c = await db.findChildById(req.user.id);
      if (c) {
        const { passwordHash, ...safe } = c;
        userDetails = safe;
      }
    } else if (req.user.role === ROLES.ADMIN) {
      const a = await db.findAdminById(req.user.id);
      if (a) {
        const { passwordHash, ...safe } = a;
        userDetails = safe;
      }
    }

    return res.status(200).json({
      success: true,
      authenticated: true,
      user: {
        ...req.user,
        details: userDetails
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  registerParentHandler,
  loginParentHandler,
  loginChildHandler,
  loginAdminHandler,
  logoutHandler,
  meHandler
};
