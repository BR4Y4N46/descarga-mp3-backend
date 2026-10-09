import { spawn } from 'child_process'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const isWin = process.platform === 'win32'
export const YTDLP_PATH = join(
  __dirname, '..', '..', 'bin',
  isWin ? 'yt-dlp.exe' : 'yt-dlp'
)

export function execYtDlp(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(YTDLP_PATH, args)
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (d) => (stdout += d.toString()))
    child.stderr.on('data', (d) => (stderr += d.toString()))
    child.on('close', (code) => {
      if (code === 0) resolve(stdout)
      else reject(new Error(stderr || `yt-dlp salió con código ${code}`))
    })
    child.on('error', reject)
  })
}

export function streamYtDlp(args) {
  return spawn(YTDLP_PATH, args)
}