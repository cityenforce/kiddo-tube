const db = require('../models/db');
const { ROLES, ACCOUNT_STATUS } = require('../constants/roles');

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.replace(/^Bearer\s+/i, '').trim() : req.query.token;

    if (!token) {
      req.user = null;
      return next();
    }

    const session = await db.getSession(token);
    if (!session) {
      req.user = null;
      return next();
    }

    // Check account status: disabled accounts must not continue using protected APIs
    if (session.role === ROLES.PARENT) {
      const parent = await db.findParentById(session.parentId || session.userId);
      if (!parent || parent.status === ACCOUNT_STATUS.DISABLED) {
        req.user = null;
        req.accountDisabled = true;
        return next();
      }
    } else if (session.role === ROLES.CHILD) {
      const child = await db.findChildById(session.childId || session.userId);
      const parent = child ? await db.findParentById(child.parentId) : null;
      if (!child || child.status === ACCOUNT_STATUS.DISABLED || (parent && parent.status === ACCOUNT_STATUS.DISABLED)) {
        req.user = null;
        req.accountDisabled = true;
        return next();
      }
    }

    req.user = {
      id: session.userId,
      username: session.username,
      role: session.role,
      parentId: session.parentId,
      childId: session.childId,
      token
    };

    return next();
  } catch (err) {
    next(err);
  }
}

function requireAuth(req, res, next) {
  if (req.accountDisabled) {
    return res.status(403).json({
      success: false,
      error: 'Account has been disabled by an administrator.'
    });
  }
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please sign in.'
    });
  }
  return next();
}

function requireRole(allowedRoles) {
  const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.'
      });
    }

    if (!rolesArray.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You do not have permission to access this resource.'
      });
    }

    return next();
  };
}

const requireParent = requireRole(ROLES.PARENT);
const requireAdmin = requireRole(ROLES.ADMIN);
const requireChild = requireRole(ROLES.CHILD);

module.exports = {
  authenticate,
  requireAuth,
  requireRole,
  requireParent,
  requireAdmin,
  requireChild
};
