import 'dotenv/config'
import express, {
  type Request,
  type Response,
  type NextFunction,
  type ErrorRequestHandler,
} from 'express'
import cors from 'cors'
import { pool } from './db.js'
import { categoriesRouter } from './routes/categories.js'
import { productsRouter } from './routes/products.js'
import { adminRouter } from './routes/admin.js'
import { ordersRouter } from './routes/orders.js'
import { settingsRouter } from './routes/settings.js'
import { uploadsDir } from './upload.js'

const app = express()
const port = Number(process.env.PORT ?? 3001)

// CORS — على نمط classi.store:
//  - في الإنتاج: Netlify يُوكّل الطلبات → المتصفح يراها same-origin، لا حاجة لـ CORS.
//    نقبل أي أصل افتراضيًا (يمكن تقييده بوضع CORS_ORIGIN صراحة إن احتجت).
//  - في التطوير: نقبل localhost:5173 (Vite) + أي أصل في LAN.
const corsOrigins = (process.env.CORS_ORIGIN ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true)
      if (corsOrigins.length === 0) return cb(null, true)

      const ok = corsOrigins.some((allowed) => {
        if (allowed === origin) return true
        if (allowed.includes('*')) {
          const pattern = new RegExp(
            '^' + allowed.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$',
          )
          return pattern.test(origin)
        }
        return false
      })

      if (ok) return cb(null, true)
      // eslint-disable-next-line no-console
      console.warn(`[cors] أصل مرفوض: ${origin} — المسموح: ${corsOrigins.join(', ')}`)
      return cb(new Error(`CORS: origin ${origin} غير مسموح`))
    },
    credentials: true,
  }),
)
app.use(express.json({ limit: '2mb' }))

// الصور المرفوعة
app.use(
  '/uploads',
  express.static(uploadsDir, {
    fallthrough: true,
    maxAge: '30d',
  }),
)

app.get('/api/health', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await pool.query<{ ok: number }>('SELECT 1 AS ok')
    res.json({ status: 'ok', db: rows[0]?.ok === 1 ? 'connected' : 'unknown' })
  } catch (err) {
    next(err)
  }
})

app.use('/api/categories', categoriesRouter)
app.use('/api/products', productsRouter)
app.use('/api/settings', settingsRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/admin', adminRouter)

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'not_found' })
})

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error('[api] error:', err)
  const message = err instanceof Error ? err.message : 'internal_server_error'
  res.status(500).json({ error: message })
}
app.use(errorHandler)

app.listen(port, '0.0.0.0', () => {
  // eslint-disable-next-line no-console
  console.log(
    `[api] يعمل على المنفذ ${port} (localhost + شبكة LAN — للهاتف استخدم IP الجهاز إن لزم)`,
  )
})
