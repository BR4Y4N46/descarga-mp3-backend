// backend/server.js
import express from 'express'
import { exec } from 'child_process'
const app = express()

app.get('/api/info', async (req, res) => {
  exec(`yt-dlp -J ${req.query.url}`, (err, stdout) => {
    if (err) return res.status(500).json({ error: 'Fallo' })
    const d = JSON.parse(stdout)
    res.json({
      title: d.title,
      thumbnail: d.thumbnail,
      author: d.uploader,
      duration: d.duration,
      formats: ['mp3', 'mp4'],
      url: req.query.url,
    })
  })
})

app.get('/api/download', (req, res) => {
  const { url, format } = req.query
  const args = format === 'mp3'
    ? `-x --audio-format mp3 -o - "${url}"`
    : `-f mp4 -o - "${url}"`
  res.setHeader('Content-Type', format === 'mp3' ? 'audio/mpeg' : 'video/mp4')
  exec(`yt-dlp ${args}`).stdout.pipe(res)
})

app.listen(3001, () => console.log('Backend en :3001'))