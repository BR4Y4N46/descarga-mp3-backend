const YT_REGEX =
  /^(https?:\/\/)?(www\.|m\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/)|youtu\.be\/)[\w-]{6,}/

export function isValidYouTubeUrl(url) {
  return typeof url === 'string' && YT_REGEX.test(url.trim())
}

export function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '—'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}