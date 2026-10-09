import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import infoRoutes from './routes/info.js'
import downloadRoutes from './routes/download.js'
import { apiLimiter } from './middleware/rateLimit.js'
import './load-cookies.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

const allowedOrigins = (process.env.FRONTEND_URL || '*').split(',')
app.use(cors({
  origin: allowedOrigins.includes('*') ? true : allowedOrigins,
  methods: ['GET']
}))
app.use(express.json())

app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'descarga-mp3-api' })
})

app.use('/api', apiLimiter, infoRoutes)
app.use('/api', apiLimiter, downloadRoutes)
app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }))

app.listen(PORT, () => {
  console.log(`🎵 Backend corriendo en http://localhost:${PORT}`)
})
