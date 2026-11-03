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
    const childId = req.user?.role === 'CHILD'
      ? req.user.childId || req.user.id
      : null;
    const result = await contentService.getApprovedContent(parentId, {
      category,
      search,
      channel,
      childId
    });
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
    const childId = req.user?.role === 'CHILD'
      ? req.user.childId || req.user.id
      : null;
    const video = await contentService.getVideoById(parentId, id, childId);
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

async function syncChannelHandler(req, res, next) {
  try {
    const parentId = await resolveParentId(req);
    if (!parentId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    const { id } = req.params;
    const result = await contentService.syncChannel(parentId, id);
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

let ytdlInstance = null;
function getYtdl() {
  if (!ytdlInstance) {
    const ytdl = require('@distube/ytdl-core');
    ytdlInstance = new ytdl.Ytdl({
      clients: [ytdl.Client.Tv, ytdl.Client.Mweb, ytdl.Client.WebEmbedded]
    });
  }
  return ytdlInstance;
}

async function streamVideo(req, res) {
  const { youtubeId } = req.params;
  if (!youtubeId || typeof youtubeId !== 'string') {
    return res.status(400).json({ success: false, error: 'Missing youtubeId' });
  }

  try {
    const client = getYtdl();
    const info = await client.getInfo(youtubeId);

    // Prioritize format 18 (360p MP4 muxed with video and audio) or any muxed audio+video format
    const chosenFormat =
      info.formats.find((f) => f.itag === 18 && f.hasAudio && f.hasVideo) ||
      info.formats.find((f) => f.itag === 18) ||
      info.formats.find((f) => f.hasVideo && f.hasAudio && f.container === 'mp4') ||
      info.formats.find((f) => f.hasVideo && f.hasAudio) ||
      info.formats.find((f) => f.container === 'mp4');

    if (!chosenFormat) {
      console.warn(`[streamVideo] No playable format found for ${youtubeId}`);
      return res.status(404).json({ success: false, error: 'No stream format found for video' });
    }

    const rangeHeader = req.headers.range;
    let downloadOptions = { format: chosenFormat };

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="${youtubeId}.mp4"`);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=86400');

    if (rangeHeader && chosenFormat.contentLength) {
      const totalSize = parseInt(chosenFormat.contentLength, 10);
      const parts = rangeHeader.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;

      if (!isNaN(start) && start < totalSize) {
        res.status(206);
        res.setHeader('Content-Range', `bytes ${start}-${end}/${totalSize}`);
        res.setHeader('Content-Length', end - start + 1);
        downloadOptions.range = { start, end };
      } else {
        res.setHeader('Content-Length', chosenFormat.contentLength);
      }
    } else if (chosenFormat.contentLength) {
      res.setHeader('Content-Length', chosenFormat.contentLength);
    }

    const stream = client.download(info, downloadOptions);

    stream.on('response', (response) => {
      if (response && response.headers && response.headers['content-length'] && !res.getHeader('Content-Length')) {
        res.setHeader('Content-Length', response.headers['content-length']);
      }
    });

    stream.on('error', (err) => {
      console.warn(`[ytdl-stream error for ${youtubeId}]:`, err.message);
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: err.message });
      }
    });

    req.on('close', () => {
      try {
        if (typeof stream.destroy === 'function') stream.destroy();
      } catch {}
    });

    stream.pipe(res);
  } catch (err) {
    console.warn(`[ytdl stream exception for ${youtubeId}]:`, err.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

module.exports = {
  getApprovedVideos,
  getVideoById,
  searchContent,
  addChannel,
  removeChannel,
  syncChannel: syncChannelHandler,
  addPlaylist,
  removePlaylist,
  addVideo,
  removeVideo,
  streamVideo,
};
