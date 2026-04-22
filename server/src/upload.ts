import multer from 'multer'
import { mkdirSync } from 'node:fs'
import { extname, resolve } from 'node:path'
import { randomUUID } from 'node:crypto'

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? 'uploads'
const MAX_MB = Number(process.env.UPLOAD_MAX_MB ?? '6')

const uploadRoot = resolve(process.cwd(), UPLOAD_DIR)
mkdirSync(uploadRoot, { recursive: true })

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
])

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadRoot),
  filename: (_req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase() || '.bin'
    cb(null, `${Date.now()}-${randomUUID()}${ext}`)
  },
})

export const uploadsDir = uploadRoot

export const upload = multer({
  storage,
  limits: { fileSize: MAX_MB * 1024 * 1024, files: 8 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) cb(null, true)
    else cb(new Error('نوع الملف غير مدعوم — الصور فقط (jpg/png/webp/gif/avif).'))
  },
})

export function fileToUrl(filename: string): string {
  return `/uploads/${filename}`
}
