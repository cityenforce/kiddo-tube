const db = require('../models/db');
const { ACCOUNT_STATUS, CONTENT_STATUS, ROLES } = require('../constants/roles');
const { hashPassword, hashPin } = require('../utils/cryptoUtils');
const { validateEmail } = require('../validators/inputValidators');

async function getAdminDashboardHandler(req, res, next) {
  try {
    const parents = await db.getAllParents();
    const children = await db.getAllChildren();
    const channels = await db.getAllSystemChannels();
    const playlists = await db.getAllSystemPlaylists();
    const videos = await db.getAllSystemVideos();

    const activeParents = parents.filter(p => p.status === ACCOUNT_STATUS.ACTIVE).length;
    const disabledParents = parents.filter(p => p.status === ACCOUNT_STATUS.DISABLED).length;

    const activeChildren = children.filter(c => c.status === ACCOUNT_STATUS.ACTIVE).length;
    const disabledChildren = children.filter(c => c.status === ACCOUNT_STATUS.DISABLED).length;

    const stats = {
      totalParents: parents.length,
      activeParents,
      disabledParents,
      totalChildren: children.length,
      activeChildren,
      disabledChildren,
      totalChannels: channels.length,
      totalPlaylists: playlists.length,
      totalVideos: videos.length,
      systemStatus: 'ONLINE / HEALTHY',
      uptimeSeconds: Math.floor(process.uptime()),
      nodeVersion: process.version,
      databaseType: 'MongoDB NoSQL Document Database'
    };

    return res.status(200).json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
}

async function getAllParentsHandler(req, res, next) {
  try {
    const { search, status } = req.query;
    let parents = await db.getAllParents();

    if (status) {
      parents = parents.filter(p => p.status === status.toUpperCase());
    }

    if (search) {
      const q = search.trim().toLowerCase();
      parents = parents.filter(p =>
        p.username.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        (p.displayName && p.displayName.toLowerCase().includes(q))
      );
    }

    const safeParents = [];
    for (const p of parents) {
      const children = await db.findChildrenByParentId(p.id);
      // Strictly remove password and pin hashes
      const { passwordHash, pinHash, ...safe } = p;
      safeParents.push({
        ...safe,
        childrenCount: children.length
      });
    }

    return res.status(200).json({ success: true, count: safeParents.length, data: safeParents });
  } catch (err) {
    next(err);
  }
}

async function toggleParentStatusHandler(req, res, next) {
  try {
    const { parentId } = req.params;
    const parent = await db.findParentById(parentId);
    if (!parent) {
      return res.status(404).json({ success: false, error: 'Parent account not found' });
    }

    const newStatus = parent.status === ACCOUNT_STATUS.ACTIVE ? ACCOUNT_STATUS.DISABLED : ACCOUNT_STATUS.ACTIVE;
    const updated = await db.updateParent(parentId, { status: newStatus });

    if (newStatus === ACCOUNT_STATUS.DISABLED) {
      await db.deleteSessionsForParent(parentId);
    }

    const { passwordHash, pinHash, ...safe } = updated;
    return res.status(200).json({
      success: true,
      data: safe,
      message: `Parent account ${newStatus === ACCOUNT_STATUS.ACTIVE ? 'activated' : 'disabled'}.`
    });
  } catch (err) {
    next(err);
  }
}

async function getAllChildrenHandler(req, res, next) {
  try {
    const { search, status } = req.query;
    let children = await db.getAllChildren();

    if (status) {
      children = children.filter(c => c.status === status.toUpperCase());
    }

    if (search) {
      const q = search.trim().toLowerCase();
      children = children.filter(c =>
        c.username.toLowerCase().includes(q) ||
        (c.displayName && c.displayName.toLowerCase().includes(q))
      );
    }

    const safeChildren = [];
    for (const c of children) {
      const parent = await db.findParentById(c.parentId);
      // Strictly remove password hash
      const { passwordHash, ...safe } = c;
      safeChildren.push({
        ...safe,
        parentUsername: parent ? parent.username : 'Unknown'
      });
    }

    return res.status(200).json({ success: true, count: safeChildren.length, data: safeChildren });
  } catch (err) {
    next(err);
  }
}

async function toggleChildStatusHandler(req, res, next) {
  try {
    const { childId } = req.params;
    const child = await db.findChildById(childId);
    if (!child) {
      return res.status(404).json({ success: false, error: 'Child account not found' });
    }

    const newStatus = child.status === ACCOUNT_STATUS.ACTIVE ? ACCOUNT_STATUS.DISABLED : ACCOUNT_STATUS.ACTIVE;
    const updated = await db.updateChild(childId, { status: newStatus });

    if (newStatus === ACCOUNT_STATUS.DISABLED) {
      await db.deleteSessionsForChild(childId);
    }

    const { passwordHash, ...safe } = updated;
    return res.status(200).json({
      success: true,
      data: safe,
      message: `Child account ${newStatus === ACCOUNT_STATUS.ACTIVE ? 'activated' : 'disabled'}.`
    });
  } catch (err) {
    next(err);
  }
}

async function getAllContentHandler(req, res, next) {
  try {
    const channels = await db.getAllSystemChannels();
    const playlists = await db.getAllSystemPlaylists();
    const videos = await db.getAllSystemVideos();

    return res.status(200).json({
      success: true,
      data: {
        channels,
        playlists,
        videos
      }
    });
  } catch (err) {
    next(err);
  }
}

async function moderateContentHandler(req, res, next) {
  try {
    const { type, id, action } = req.body; // type: 'channel' | 'playlist' | 'video', action: 'BLOCK' | 'REMOVE'
    if (!type || !id) {
      return res.status(400).json({ success: false, error: 'Content type and id are required' });
    }

    if (type === 'channel') {
      if (action === 'REMOVE') await db.deleteChannel(id);
      else await db.updateChannel(id, { status: CONTENT_STATUS.BLOCKED });
    } else if (type === 'playlist') {
      if (action === 'REMOVE') await db.deletePlaylist(id);
      else await db.updatePlaylist(id, { status: CONTENT_STATUS.BLOCKED });
    } else if (type === 'video') {
      if (action === 'REMOVE') await db.deleteVideo(id);
      else await db.updateVideo(id, { status: CONTENT_STATUS.BLOCKED });
    }

    return res.status(200).json({
      success: true,
      message: `Content ${id} moderated with action ${action || 'BLOCK'}.`
    });
  } catch (err) {
    next(err);
  }
}

async function createParentHandler(req, res, next) {
  try {
    const { username, email, password, displayName, dailyLimitMinutes, pin } = req.body;
    if (!username || typeof username !== 'string' || !username.trim()) {
      return res.status(400).json({ success: false, error: 'Username is required' });
    }
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }
    if (!validateEmail(email.trim())) {
      return res.status(400).json({ success: false, error: 'A valid email address is required' });
    }
    if (!password || typeof password !== 'string' || password.trim().length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }
    if (pin != null && pin !== '' && (!/^\d{4}$/.test(String(pin).trim()))) {
      return res.status(400).json({ success: false, error: 'Parent PIN must be exactly 4 digits' });
    }

    const cleanUser = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    // Check uniqueness across both username and email
    const existing = (await db.findParentByUsernameOrEmail(cleanUser)) || (await db.findParentByUsernameOrEmail(cleanEmail));
    if (existing) {
      return res.status(409).json({ success: false, error: 'Username or email already in use' });
    }

    const parentId = `parent_${Date.now()}`;
    const newParent = await db.createParent({
      id: parentId,
      username: cleanUser,
      displayName: (displayName && displayName.trim()) || cleanUser,
      email: cleanEmail,
      passwordHash: hashPassword(password.trim()),
      pinHash: pin ? hashPin(String(pin).trim()) : null,
      dailyLimitMinutes: Number(dailyLimitMinutes) || 60,
      status: ACCOUNT_STATUS.ACTIVE,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const { passwordHash, pinHash, ...safeParent } = newParent;
    return res.status(201).json({
      success: true,
      data: safeParent,
      message: `Parent account "${safeParent.username}" created successfully.`
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAdminDashboardHandler,
  getAllParentsHandler,
  createParentHandler,
  toggleParentStatusHandler,
  getAllChildrenHandler,
  toggleChildStatusHandler,
  getAllContentHandler,
  moderateContentHandler
};
