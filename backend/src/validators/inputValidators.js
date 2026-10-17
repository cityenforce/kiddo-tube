function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validatePin(pin) {
  if (!pin || typeof pin !== 'string') return false;
  return /^\d{4}$/.test(pin.trim());
}

function extractYouTubeVideoId(input) {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  // If it's already an 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  // Standard or shortened URL
  const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function extractYouTubePlaylistId(input) {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  const match = trimmed.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  if (/^[a-zA-Z0-9_-]{12,}$/.test(trimmed)) return trimmed;
  return null;
}

function extractYouTubeChannelIdentifier(input) {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  // Handle URL with @handle
  const handleMatch = trimmed.match(/(?:youtube\.com\/|@)(@?[a-zA-Z0-9_.-]{3,30})/);
  if (handleMatch) {
    const handle = handleMatch[1].startsWith('@') ? handleMatch[1] : `@${handleMatch[1]}`;
    return handle;
  }
  // Channel ID starting with UC
  const ucMatch = trimmed.match(/(?:youtube\.com\/channel\/)?(UC[a-zA-Z0-9_-]{22})/);
  if (ucMatch) return ucMatch[1];
  // Custom URL /c/ or /user/
  const customMatch = trimmed.match(/youtube\.com\/(?:c|user)\/([a-zA-Z0-9_.-]+)/);
  if (customMatch) return customMatch[1];
  // If plain non-url alphanumeric identifier or handle
  if (/^[a-zA-Z0-9_.@-]{3,50}$/.test(trimmed)) {
    return trimmed;
  }
  return null;
}

module.exports = {
  validateEmail,
  validatePin,
  extractYouTubeVideoId,
  extractYouTubePlaylistId,
  extractYouTubeChannelIdentifier
};
