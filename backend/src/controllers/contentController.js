const contentService = require('../services/contentService');
const db = require('../models/db');

async function resolveParentId(req) {
  if (req.user) {
    if (req.user.role === 'ADMIN' && req.query.parentId) {
      return req.query.parentId;
    }
    return req.user.parentId || req.user.id;
  }
  if (req.query.parentId) {
    return req.query.parentId;
  }
  try {
    const dbInstance = await db.getDb();
    const latestVideo = await dbInstance.collection('videos').findOne(
      { status: 'APPROVED' },
      { sort: { createdAt: -1 } }
    );
    if (latestVideo) return latestVideo.parentId;
  } catch {}
  return null;
}

async function getApprovedVideos(req, res, next) {
  try {
    const parentId = await resolveParentId(req);
    if (!parentId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication session required to access approved content'
      });
    }

    const { category, search, channel } = req.query;
    const result = await contentService.getApprovedContent(parentId, { category, search, channel });
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

async function getVideoById(req, res, next) {
  try {
    const parentId = await resolveParentId(req);
    if (!parentId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication session required to access video'
      });
    }

    const { id } = req.params;
    const video = await contentService.getVideoById(parentId, id);
    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found, removed, or not approved by parent'
      });
    }

    return res.status(200).json({ success: true, data: video });
  } catch (err) {
    next(err);
  }
}

async function searchContent(req, res, next) {
  try {
    const parentId = await resolveParentId(req);
    if (!parentId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication session required to search content'
      });
    }

    const q = req.query.q || req.query.query || '';
    const result = await contentService.getApprovedContent(parentId, { search: q });
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

async function addChannel(req, res, next) {
  try {
    const parentId = await resolveParentId(req);
    if (!parentId) {
      return res.status(401).json({ success: false, error: 'Parent authentication required' });
    }
    const channel = await contentService.addChannel(parentId, req.body);
    return res.status(201).json({ success: true, data: channel, message: 'Channel approved.' });
  } catch (err) {
    next(err);
  }
}

async function removeChannel(req, res, next) {
  try {
    const parentId = await resolveParentId(req);
    if (!parentId) {
      return res.status(401).json({ success: false, error: 'Parent authentication required' });
    }
    const { id } = req.params;
    const result = await contentService.removeChannel(parentId, id);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function addPlaylist(req, res, next) {
  try {
    const parentId = await resolveParentId(req);
    if (!parentId) {
      return res.status(401).json({ success: false, error: 'Parent authentication required' });
    }
    const playlist = await contentService.addPlaylist(parentId, req.body);
    return res.status(201).json({ success: true, data: playlist, message: 'Playlist approved.' });
  } catch (err) {
    next(err);
  }
}

async function removePlaylist(req, res, next) {
  try {
    const parentId = await resolveParentId(req);
    if (!parentId) {
      return res.status(401).json({ success: false, error: 'Parent authentication required' });
    }
    const { id } = req.params;
    const result = await contentService.removePlaylist(parentId, id);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function addVideo(req, res, next) {
  try {
    const parentId = await resolveParentId(req);
    if (!parentId) {
      return res.status(401).json({ success: false, error: 'Parent authentication required' });
    }
    const video = await contentService.addVideo(parentId, req.body);
    return res.status(201).json({ success: true, data: video, message: 'Video approved.' });
  } catch (err) {
    next(err);
  }
}

async function removeVideo(req, res, next) {
  try {
    const parentId = await resolveParentId(req);
    if (!parentId) {
      return res.status(401).json({ success: false, error: 'Parent authentication required' });
    }
    const { id } = req.params;
    const result = await contentService.removeVideo(parentId, id);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getApprovedVideos,
  getVideoById,
  searchContent,
  addChannel,
  removeChannel,
  addPlaylist,
  removePlaylist,
  addVideo,
  removeVideo
};
