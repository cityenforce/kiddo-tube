const API_BASE_URL = 'https://www.googleapis.com/youtube/v3';
const REQUEST_TIMEOUT_MS = 12000;

function getApiKey() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw {
      statusCode: 503,
      message: 'YouTube import is not configured. Set YOUTUBE_API_KEY on the backend.'
    };
  }
  return apiKey;
}

async function request(resource, params) {
  const url = new URL(`${API_BASE_URL}/${resource}`);
  url.search = new URLSearchParams({
    ...params,
    key: getApiKey()
  }).toString();

  let response;
  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    });
  } catch {
    throw {
      statusCode: 502,
      message: 'YouTube request timed out or could not be reached.'
    };
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw {
      statusCode: 502,
      message: 'YouTube returned an unreadable response.'
    };
  }
  if (!response.ok) {
    throw {
      statusCode: 502,
      message: `YouTube returned an error (${response.status}). Check the link, API key, and YouTube Data API configuration.`
    };
  }
  return payload;
}

function thumbnailFrom(thumbnails = {}) {
  return thumbnails.maxres?.url ||
    thumbnails.high?.url ||
    thumbnails.medium?.url ||
    thumbnails.default?.url ||
    '';
}

function formatDuration(duration = '') {
  const match = duration.match(
    /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/
  );
  if (!match) return '00:00';
  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);
  const totalMinutes = hours * 60 + minutes;
  return `${String(totalMinutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

async function getVideoMetadata(videoIds) {
  if (videoIds.length === 0) return [];
  const data = await request('videos', {
    part: 'snippet,contentDetails',
    id: videoIds.slice(0, 50).join(',')
  });
  return data.items.map((item) => ({
    youtubeId: item.id,
    title: item.snippet.title,
    channelTitle: item.snippet.channelTitle,
    thumbnailUrl: thumbnailFrom(item.snippet.thumbnails),
    durationText: formatDuration(item.contentDetails.duration),
    description: item.snippet.description || ''
  }));
}

async function getChannel(identifier) {
  const isChannelId = /^UC[a-zA-Z0-9_-]{22}$/.test(identifier);
  let data = await request('channels', {
    part: 'snippet,contentDetails,statistics',
    [isChannelId ? 'id' : 'forHandle']: identifier.replace(/^@/, '')
  });
  let channel = data.items[0];
  if (!channel && !isChannelId) {
    const search = await request('search', {
      part: 'snippet',
      type: 'channel',
      q: identifier
    });
    const channelId = search.items[0]?.id?.channelId;
    if (channelId) {
      data = await request('channels', {
        part: 'snippet,contentDetails,statistics',
        id: channelId
      });
      channel = data.items[0];
    }
  }
  if (!channel) {
    throw { statusCode: 404, message: 'YouTube channel was not found.' };
  }
  return channel;
}

async function getPlaylist(playlistId) {
  const data = await request('playlists', {
    part: 'snippet,contentDetails',
    id: playlistId
  });
  const playlist = data.items[0];
  if (!playlist) {
    throw { statusCode: 404, message: 'YouTube playlist was not found.' };
  }
  return playlist;
}

async function getPlaylistVideoIds(playlistId) {
  const data = await request('playlistItems', {
    part: 'contentDetails',
    playlistId,
    maxResults: '50'
  });
  return data.items
    .map((item) => item.contentDetails?.videoId)
    .filter(Boolean);
}

async function getChannelVideos(uploadsPlaylistId) {
  if (!uploadsPlaylistId) return [];
  const data = await request('playlistItems', {
    part: 'contentDetails',
    playlistId: uploadsPlaylistId,
    maxResults: '50'
  });
  return data.items
    .map((item) => item.contentDetails?.videoId)
    .filter(Boolean);
}

module.exports = {
  getApiKey,
  getChannel,
  getPlaylist,
  getPlaylistVideoIds,
  getChannelVideos,
  getVideoMetadata,
  thumbnailFrom,
  formatDuration
};
