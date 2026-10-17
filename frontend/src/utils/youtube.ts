// src/utils/youtube.ts

/**
 * YouTube URL & ID Utilities
 * Used by player + parent content approval dialogs
 */

/**
 * Extract 11-char YouTube video ID from a full URL or raw ID
 * Handles:
 *   - https://www.youtube.com/watch?v=dQw4w9WgXcQ
 *   - https://youtu.be/dQw4w9WgXcQ
 *   - https://www.youtube.com/embed/dQw4w9WgXcQ
 *   - dQw4w9WgXcQ (raw)
 */
export const extractYoutubeId = (input: string): string | null => {
  const value = input.trim();
  if (!value) return null;

  // Raw 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) {
    return value;
  }

  // URL patterns
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /[?&]v=([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match && match[1]) return match[1];
  }

  return null;
};

/**
 * Extract YouTube playlist ID from URL or raw ID
 * Handles:
 *   - https://www.youtube.com/playlist?list=PLxxxxxx
 *   - https://www.youtube.com/watch?v=xxx&list=PLxxxxxx
 *   - PLxxxxxx (raw)
 */
export const extractPlaylistId = (input: string): string | null => {
  const value = input.trim();
  if (!value) return null;

  // Raw playlist ID (typically starts with PL, UU, LL, FL, etc.)
  if (/^(PL|UU|LL|FL|RD|OL)[a-zA-Z0-9_-]+$/.test(value)) {
    return value;
  }

  const match = value.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
};

/**
 * Build YouTube thumbnail URL from video ID
 * Kotlin: "https://img.youtube.com/vi/$ytId/hqdefault.jpg"
 */
export const buildYoutubeThumbnail = (youtubeId: string): string => {
  return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
};

/**
 * Build the HTML for the YouTube IFrame embed player
 * Migrated 1:1 from Kotlin KidsVideoPlayerScreen.kt htmlContent
 * 
 * Uses youtube-nocookie.com for child-safe mode
 */
export const buildYoutubePlayerHtml = (youtubeId: string): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { box-sizing: border-box; }
    body, html {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background-color: #000000;
      overflow: hidden;
    }
    .wrapper {
      position: relative;
      width: 100%;
      height: 100%;
    }
    iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <iframe
      id="ytplayer"
      type="text/html"
      src="https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&enablejsapi=1&playsinline=1&controls=1&fs=1&rel=0&modestbranding=1&iv_load_policy=3"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen>
    </iframe>
  </div>
</body>
</html>
  `.trim();
};