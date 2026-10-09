import { Router } from 'express'
import { execYtDlp } from '../utils/ytdlp.js'
import { isValidYouTubeUrl, formatDuration } from '../utils/validate.js'

const router = Router()

router.get('/info', async (req, res) => {
  const { url } = req.query
  if (!isValidYouTubeUrl(url)) {
    return res.status(400).json({ error: 'Enlace de YouTube inválido' })
  }
  try {
    const raw = await execYtDlp([
      url, '-J', '--no-warnings', '--no-playlist', '--no-check-certificate'
    ])
    const data = JSON.parse(raw)
    res.json({
      title: data.title,
      thumbnail: data.thumbnail,
      author: data.uploader || data.channel || 'Desconocido',
      duration: formatDuration(data.duration),
      url,
      formats: ['mp3', 'mp4']
    })
  } catch (err) {
    console.error('❌ /info error:', err.message)
    res.status(500).json({ error: 'No se pudo obtener la info del video.' })
  }
})

export default router