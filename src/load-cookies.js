import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const cookiesPath = join(__dirname, '..', 'cookies.txt')

if (process.env.YTDLP_COOKIES_B64) {
  try {
    writeFileSync(cookiesPath, Buffer.from(process.env.YTDLP_COOKIES_B64, 'base64'))
    console.log('🍪 cookies.txt creadas desde env:', cookiesPath)
  } catch (err) {
    console.error('❌ Error escribiendo cookies.txt:', err)
  }
} else {
  console.log('⚠️  Sin cookies — YouTube puede bloquear con "Sign in to confirm"')
}
