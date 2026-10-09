import { Router } from 'express'
import { streamYtDlp } from '../utils/ytdlp.js'
import { isValidYouTubeUrl } from '../utils/validate.js'

const router = Router()

/**
 * Limpia un nombre de archivo para que sea seguro en todas las OS.
 */
function sanitizeFilename(name) {
  return name
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '') // caracteres prohibidos
    .replace(/\s+/g, ' ')                    // espacios múltiples
    .trim()
    .slice(0, 120)                           // límite razonable
    || 'descarga'                            // fallback
}

router.get('/download', (req, res) => {
  const { url, format = 'mp3', title = '' } = req.query

  if (!isValidYouTubeUrl(url)) {
    return res.status(400).json({ error: 'Enlace inválido' })
  }

  const isAudio = format === 'mp3'
  const ext = isAudio ? 'mp3' : 'mp4'

  // Nombre final del archivo
  const baseName = sanitizeFilename(title || 'descarga')
  const filename = `${baseName}.${ext}`

  const args = isAudio
  ? [
      url, '-x', '--audio-format', 'mp3', '--audio-quality', '0',
      '-o', '-', '--no-warnings', '--no-playlist', '--no-check-certificate',
      '--cookies', './cookies.txt',
      '--extractor-args', 'youtube:player_client=tv_embedded'
    ]
  : [
      url, '-f', 'best[ext=mp4][height<=720]/best[ext=mp4]/best',
      '-o', '-', '--no-warnings', '--no-playlist', '--no-check-certificate',
      '--cookies', './cookies.txt',
      '--extractor-args', 'youtube:player_client=tv_embedded'
    ]
  let child
  try {
    child = streamYtDlp(args)
  } catch (err) {
    console.error('❌ spawn error:', err)
    return res.status(500).json({ error: 'Error al iniciar descarga' })
  }

  // 🎯 Aquí va el nombre real, con soporte UTF-8 (RFC 5987)
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${filename.replace(/[^\x20-\x7E]/g, '_')}"; filename*=UTF-8''${encodeURIComponent(filename)}`
  )
  res.setHeader('Content-Type', isAudio ? 'audio/mpeg' : 'video/mp4')
  res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition')

  child.stdout.pipe(res)
  child.stderr.on('data', (d) => console.error('yt-dlp:', d.toString().trim()))
  child.on('error', (err) => {
    console.error('❌ child error:', err)
    if (!res.headersSent) res.status(500).end()
  })
  child.on('close', (code) => {
    if (code !== 0 && !res.headersSent) res.status(500).end()
    else res.end()
  })
  req.on('close', () => {
    if (!child.killed) child.kill('SIGKILL')
  })
})

export default router
