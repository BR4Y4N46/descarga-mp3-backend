import { Router } from 'express'
import { execYtDlp } from '../utils/ytdlp.js'
import { isValidYouTubeUrl, formatDuration } from '../utils/validate.js'

const router = Router()

// 🔁 Reintenta hasta 3 veces con pausa
async function extractWithRetry(url, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const raw = await execYtDlp([
        url,
        '-J',
        '--no-warnings',
        '--no-playlist',
        '--no-check-certificate',
        '--cookies', './cookies.txt',
        '--extractor-args', 'youtube:player_client=default,mweb'
      ])
      return JSON.parse(raw)
    } catch (err) {
      const msg = err.message || ''
      const isTransient = msg.includes('page needs to be reloaded') || 
                         msg.includes('Sign in to confirm')
      
      if (isTransient && i < maxRetries - 1) {
        console.log(`⏳ Reintento ${i + 1}/${maxRetries} en 3s...`)
        await new Promise(r => setTimeout(r, 3000)) // Espera 3 segundos
        continue
      }
      throw err
    }
  }
}

router.get('/info', async (req, res) => {
  const { url } = req.query
  if (!isValidYouTubeUrl(url)) {
    return res.status(400).json({ error: 'Enlace de YouTube inválido' })
  }

  try {
    const data = await extractWithRetry(url)
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
