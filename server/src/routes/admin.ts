import { Router, type Request, type Response, type NextFunction } from 'express'
import { query } from '../db.js'
import {
  requireAdmin,
  signAdminToken,
  verifyCredentials,
} from '../auth.js'
import { fileToUrl, upload } from '../upload.js'

export const adminRouter: Router = Router()

// ---------- Auth ----------

adminRouter.post('/login', (req: Request, res: Response) => {
  const { email, password } = (req.body ?? {}) as {
    email?: unknown
    password?: unknown
  }
  if (typeof email !== 'string' || typeof password !== 'string') {
    res.status(400).json({ error: 'invalid_body' })
    return
  }
  if (!verifyCredentials(email, password)) {
    res.status(401).json({ error: 'invalid_credentials' })
    return
  }
  const token = signAdminToken(email)
  res.json({ token, email: email.toLowerCase() })
})

adminRouter.get('/me', requireAdmin, (req: Request, res: Response) => {
  const admin = (req as Request & { admin?: { sub: string } }).admin
  res.json({ email: admin?.sub ?? null })
})

// ---------- Uploads ----------

adminRouter.post(
  '/upload',
  requireAdmin,
  upload.array('files', 8),
  (req: Request, res: Response) => {
    const files = (req.files as Express.Multer.File[] | undefined) ?? []
    const urls = files.map((f) => fileToUrl(f.filename))
    res.json({ urls })
  },
)

// ---------- Helpers ----------

function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    || `item-${Date.now()}`
}

// ---------- Categories CRUD ----------

adminRouter.post(
  '/categories',
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        name_ar,
        name_en = null,
        description = null,
        icon = null,
        image_url = null,
        sort_order = 0,
        slug,
      } = (req.body ?? {}) as Record<string, unknown>

      if (typeof name_ar !== 'string' || !name_ar.trim()) {
        res.status(400).json({ error: 'name_ar_required' })
        return
      }
      const finalSlug =
        typeof slug === 'string' && slug.trim() ? slugify(slug) : slugify(name_ar)

      const { rows } = await query(
        `INSERT INTO saqer_categories
          (slug, name_ar, name_en, description, icon, image_url, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, slug, name_ar, name_en, description, icon, image_url,
                   sort_order, created_at, updated_at`,
        [
          finalSlug,
          name_ar.trim(),
          name_en,
          description,
          icon,
          image_url,
          Number.isFinite(Number(sort_order)) ? Number(sort_order) : 0,
        ],
      )
      res.status(201).json({ data: rows[0] })
    } catch (err) {
      next(err)
    }
  },
)

adminRouter.put(
  '/categories/:id',
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const body = (req.body ?? {}) as Record<string, unknown>
      const fields = [
        'slug',
        'name_ar',
        'name_en',
        'description',
        'icon',
        'image_url',
        'sort_order',
      ] as const

      const sets: string[] = []
      const values: unknown[] = []
      for (const f of fields) {
        if (f in body) {
          values.push(f === 'slug' && typeof body[f] === 'string' ? slugify(body[f] as string) : body[f])
          sets.push(`${f} = $${values.length}`)
        }
      }
      if (sets.length === 0) {
        res.status(400).json({ error: 'nothing_to_update' })
        return
      }
      values.push(id)
      const { rows } = await query(
        `UPDATE saqer_categories SET ${sets.join(', ')} WHERE id = $${values.length}
         RETURNING id, slug, name_ar, name_en, description, icon, image_url,
                   sort_order, created_at, updated_at`,
        values,
      )
      if (!rows[0]) {
        res.status(404).json({ error: 'category_not_found' })
        return
      }
      res.json({ data: rows[0] })
    } catch (err) {
      next(err)
    }
  },
)

adminRouter.delete(
  '/categories/:id',
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const result = await query(`DELETE FROM saqer_categories WHERE id = $1`, [id])
      if (result.rowCount === 0) {
        res.status(404).json({ error: 'category_not_found' })
        return
      }
      res.status(204).end()
    } catch (err) {
      next(err)
    }
  },
)

// ---------- Products CRUD ----------

const SELECT_ADMIN_PRODUCT = `
  SELECT p.id, p.slug, p.name_ar, p.name_en, p.description, p.price, p.currency,
         p.stock, p.image_url, p.images, p.category_id, p.is_active,
         p.created_at, p.updated_at,
         c.slug    AS category_slug,
         c.name_ar AS category_name_ar
    FROM saqer_products p
    LEFT JOIN saqer_categories c ON c.id = p.category_id
`

adminRouter.get(
  '/products/:id',
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const { rows } = await query(`${SELECT_ADMIN_PRODUCT} WHERE p.id = $1 LIMIT 1`, [
        id,
      ])
      const row = rows[0] as Record<string, unknown> | undefined
      if (!row) {
        res.status(404).json({ error: 'product_not_found' })
        return
      }
      let imgs: unknown = row.images
      if (!Array.isArray(imgs)) {
        if (typeof imgs === 'string') {
          try {
            imgs = JSON.parse(imgs)
          } catch {
            imgs = []
          }
        } else {
          imgs = []
        }
      }
      row.images = imgs
      res.json({ data: row })
    } catch (err) {
      next(err)
    }
  },
)

adminRouter.post(
  '/products',
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        name_ar,
        name_en = null,
        description = null,
        price,
        currency = 'SAR',
        stock = 0,
        image_url = null,
        images = [],
        category_id = null,
        is_active = true,
        slug,
      } = (req.body ?? {}) as Record<string, unknown>

      if (typeof name_ar !== 'string' || !name_ar.trim()) {
        res.status(400).json({ error: 'name_ar_required' })
        return
      }
      const priceNum = Number(price)
      if (!Number.isFinite(priceNum) || priceNum < 0) {
        res.status(400).json({ error: 'invalid_price' })
        return
      }
      const finalSlug =
        typeof slug === 'string' && slug.trim() ? slugify(slug) : slugify(name_ar)
      const imagesArr = Array.isArray(images)
        ? images.filter((u): u is string => typeof u === 'string')
        : []

      const { rows } = await query(
        `INSERT INTO saqer_products
           (slug, name_ar, name_en, description, price, currency, stock,
            image_url, images, category_id, is_active)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,$11)
         RETURNING id, slug, name_ar, name_en, description, price, currency, stock,
                   image_url, images, category_id, is_active, created_at, updated_at`,
        [
          finalSlug,
          name_ar.trim(),
          name_en,
          description,
          priceNum,
          typeof currency === 'string' ? currency : 'SAR',
          Number.isFinite(Number(stock)) ? Number(stock) : 0,
          image_url,
          JSON.stringify(imagesArr),
          category_id || null,
          Boolean(is_active),
        ],
      )
      res.status(201).json({ data: rows[0] })
    } catch (err) {
      next(err)
    }
  },
)

adminRouter.put(
  '/products/:id',
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const body = (req.body ?? {}) as Record<string, unknown>
      const fields = [
        'slug',
        'name_ar',
        'name_en',
        'description',
        'price',
        'currency',
        'stock',
        'image_url',
        'images',
        'category_id',
        'is_active',
      ] as const

      const sets: string[] = []
      const values: unknown[] = []
      for (const f of fields) {
        if (!(f in body)) continue
        let value: unknown = body[f]
        if (f === 'slug' && typeof value === 'string') value = slugify(value)
        if (f === 'images') {
          const arr = Array.isArray(value)
            ? value.filter((u): u is string => typeof u === 'string')
            : []
          values.push(JSON.stringify(arr))
          sets.push(`images = $${values.length}::jsonb`)
          continue
        }
        values.push(value)
        sets.push(`${f} = $${values.length}`)
      }
      if (sets.length === 0) {
        res.status(400).json({ error: 'nothing_to_update' })
        return
      }
      values.push(id)
      const { rows } = await query(
        `UPDATE saqer_products SET ${sets.join(', ')} WHERE id = $${values.length}
         RETURNING id, slug, name_ar, name_en, description, price, currency, stock,
                   image_url, images, category_id, is_active, created_at, updated_at`,
        values,
      )
      if (!rows[0]) {
        res.status(404).json({ error: 'product_not_found' })
        return
      }
      res.json({ data: rows[0] })
    } catch (err) {
      next(err)
    }
  },
)

adminRouter.delete(
  '/products/:id',
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const result = await query(`DELETE FROM saqer_products WHERE id = $1`, [id])
      if (result.rowCount === 0) {
        res.status(404).json({ error: 'product_not_found' })
        return
      }
      res.status(204).end()
    } catch (err) {
      next(err)
    }
  },
)

// ---------- Settings ----------

adminRouter.put(
  '/settings/:key',
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { key } = req.params
      const value = (req.body ?? {}) as Record<string, unknown>
      const { rows } = await query(
        `INSERT INTO saqer_settings (key, value) VALUES ($1, $2::jsonb)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
         RETURNING key, value`,
        [key, JSON.stringify(value)],
      )
      res.json({ data: rows[0] })
    } catch (err) {
      next(err)
    }
  },
)

// ---------- Orders (Admin) ----------

const ORDER_STATUSES = new Set([
  'pending',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
])

adminRouter.get(
  '/orders',
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const status = typeof req.query.status === 'string' ? req.query.status : ''
      const params: unknown[] = []
      let where = ''
      if (status && ORDER_STATUSES.has(status)) {
        params.push(status)
        where = `WHERE status = $${params.length}`
      }
      const { rows } = await query(
        `SELECT id, order_number, customer_name, phone, governorate, district,
                landmark, notes, items, total, currency, status,
                created_at, updated_at
           FROM saqer_orders
           ${where}
           ORDER BY created_at DESC
           LIMIT 500`,
        params,
      )
      res.json({ data: rows })
    } catch (err) {
      next(err)
    }
  },
)

adminRouter.get(
  '/orders/:id',
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const { rows } = await query(
        `SELECT id, order_number, customer_name, phone, governorate, district,
                landmark, notes, items, total, currency, status,
                created_at, updated_at
           FROM saqer_orders
          WHERE id = $1`,
        [id],
      )
      if (!rows[0]) {
        res.status(404).json({ error: 'order_not_found' })
        return
      }
      res.json({ data: rows[0] })
    } catch (err) {
      next(err)
    }
  },
)

adminRouter.patch(
  '/orders/:id/status',
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const status =
        typeof req.body?.status === 'string' ? String(req.body.status) : ''
      if (!ORDER_STATUSES.has(status)) {
        res.status(400).json({ error: 'invalid_status' })
        return
      }
      const { rows } = await query(
        `UPDATE saqer_orders SET status = $1 WHERE id = $2
         RETURNING id, order_number, customer_name, phone, governorate, district,
                   landmark, notes, items, total, currency, status,
                   created_at, updated_at`,
        [status, id],
      )
      if (!rows[0]) {
        res.status(404).json({ error: 'order_not_found' })
        return
      }
      res.json({ data: rows[0] })
    } catch (err) {
      next(err)
    }
  },
)

adminRouter.delete(
  '/orders/:id',
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const result = await query(`DELETE FROM saqer_orders WHERE id = $1`, [id])
      if (result.rowCount === 0) {
        res.status(404).json({ error: 'order_not_found' })
        return
      }
      res.status(204).end()
    } catch (err) {
      next(err)
    }
  },
)
