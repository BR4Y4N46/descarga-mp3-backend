import { createWriteStream, existsSync, mkdirSync, chmodSync } from 'fs'
import { pipeline } from 'stream/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const binDir = join(__dirname, '..', 'bin')
const isWin = process.platform === 'win32'
const binPath = join(binDir, isWin ? 'yt-dlp.exe' : 'yt-dlp')

const URL = isWin
  ? 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe'
  : 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp'

async function main() {
  if (!existsSync(binDir)) mkdirSync(binDir, { recursive: true })
  if (existsSync(binPath)) {
    console.log('✅ yt-dlp ya existe, saltando descarga')
    return
  }

  console.log('⬇️  Descargando yt-dlp...')
  const res = await fetch(URL)
  if (!res.ok) throw new Error(`Fallo la descarga: ${res.status}`)

  await pipeline(res.body, createWriteStream(binPath))

  if (!isWin) chmodSync(binPath, 0o755)
  console.log('✅ yt-dlp listo en', binPath)
}

main().catch((err) => {
  console.error('❌ Error descargando yt-dlp:', err)
  process.exit(1)
})