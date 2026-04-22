import multer from 'multer'
import { mkdirSync, existsSync, unlinkSync, writeFileSync } from 'node:fs'
import { extname, resolve, basename, join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? 'uploads'
const MAX_MB = Number(process.env.UPLOAD_MAX_MB ?? '6')

const uploadRoot = resolve(process.cwd(), UPLOAD_DIR)
mkdirSync(uploadRoot, { recursive: true })

export const uploadsDir = uploadRoot

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
])

// ─── Cloudflare R2 (S3-compatible) ─────────────────────────────────────
const r2Configured = Boolean(
  process.env.R2_ENDPOINT &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME &&
    process.env.R2_PUBLIC_URL,
)

let r2Client: S3Client | null = null
if (r2Configured) {
  r2Client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT!,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  })
  // eslint-disable-next-line no-console
  console.log('[storage] Cloudflare R2 مُفعّل — الصور ستُحفظ في السحابة.')
} else {
  // eslint-disable-next-line no-console
  console.log('[storage] R2 غير مُفعّل — الصور تُحفظ محلياً في', uploadRoot)
}

// عند استخدام R2 نخزن في الذاكرة ثم نرفع، وإلا نكتب للقرص مباشرة.
const storage: multer.StorageEngine = r2Configured
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, uploadRoot),
      filename: (_req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase() || '.bin'
        cb(null, `${Date.now()}-${randomUUID()}${ext}`)
      },
    })

export const upload = multer({
  storage,
  limits: { fileSize: MAX_MB * 1024 * 1024, files: 8 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) cb(null, true)
    else cb(new Error('نوع الملف غير مدعوم — الصور فقط (jpg/png/webp/gif/avif).'))
  },
})

function normalizedPublicBase(): string {
  const u = (process.env.R2_PUBLIC_URL ?? '').trim()
  return u.endsWith('/') ? u.slice(0, -1) : u
}

function buildObjectKey(originalName: string): string {
  const ext = extname(originalName).toLowerCase() || '.bin'
  return `products/${Date.now()}-${randomUUID()}${ext}`
}

/**
 * يحفظ ملف multer — إلى R2 إن كان مُفعّلاً، وإلاّ يُرجع الرابط المحلي.
 * يعيد رابطاً عامّاً كاملاً (R2) أو مسارًا نسبيًا مثل `/uploads/xxx`.
 */
export async function persistUpload(file: Express.Multer.File): Promise<string> {
  if (r2Configured && r2Client && file.buffer) {
    const key = buildObjectKey(file.originalname)
    await r2Client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype || 'application/octet-stream',
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    )
    return `${normalizedPublicBase()}/${key}`
  }
  // محلي: multer.diskStorage كتب الملف، نُرجع فقط المسار العام.
  return `/uploads/${file.filename}`
}

/** يستخرج مفتاح R2 من رابط عام إن كان ينتمي لدلوك. */
function r2KeyFromPublicUrl(url: string): string | null {
  if (!r2Configured) return null
  const base = normalizedPublicBase()
  if (!base) return null
  if (!url.startsWith(base)) return null
  const key = url.slice(base.length).replace(/^\/+/, '')
  if (!key || key.includes('..')) return null
  return key
}

/** حذف صورة من R2 أو من مجلد uploads المحلي — يتجاهل الأخطاء. */
export async function deleteStoredUrl(imageUrl: string | null | undefined): Promise<void> {
  const url = (imageUrl ?? '').trim()
  if (!url) return

  const key = r2KeyFromPublicUrl(url)
  if (key && r2Client) {
    try {
      await r2Client.send(
        new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME!,
          Key: key,
        }),
      )
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[storage] R2 delete failed', url, e)
    }
    return
  }

  if (url.startsWith('/uploads/')) {
    const name = basename(url)
    if (!name || name.includes('..')) return
    const filePath = join(uploadRoot, name)
    try {
      if (existsSync(filePath)) unlinkSync(filePath)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[storage] local delete failed', filePath, e)
    }
  }
}

/** مطابقة للتوقيع القديم حتى لا ينكسر أي كود قديم. */
export function fileToUrl(filename: string): string {
  return `/uploads/${filename}`
}

/** نسخة متزامنة احتياطية لكتابة Buffer محلياً (لا تُستخدم حالياً). */
export function writeLocalFile(name: string, data: Buffer): string {
  writeFileSync(join(uploadRoot, name), data)
  return `/uploads/${name}`
}
