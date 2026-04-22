import { Router, type Request, type Response, type NextFunction } from 'express'
import { query } from '../db.js'

export const productsRouter: Router = Router()

interface ProductRow {
  id: string
  slug: string
  name_ar: string
  name_en: string | null
  description: string | null
  price: string
  currency: string
  stock: number
  image_url: string | null
  images: string[]
  category_id: string | null
  category_slug: string | null
  category_name_ar: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

const SELECT_PRODUCT = `
  SELECT p.id, p.slug, p.name_ar, p.name_en, p.description, p.price, p.currency,
         p.stock, p.image_url, p.images, p.category_id, p.is_active,
         p.created_at, p.updated_at,
         c.slug    AS category_slug,
         c.name_ar AS category_name_ar
    FROM saqer_products p
    LEFT JOIN saqer_categories c ON c.id = p.category_id
`

productsRouter.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category, active, limit } = req.query
      const conditions: string[] = []
      const params: unknown[] = []

      if (typeof category === 'string' && category.length > 0) {
        params.push(category)
        conditions.push(`c.slug = $${params.length}`)
      }
      if (active === 'true') {
        conditions.push(`p.is_active = TRUE`)
      }

      const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
      let sql = `${SELECT_PRODUCT} ${where} ORDER BY p.created_at DESC`
      if (typeof limit === 'string' && /^\d+$/.test(limit)) {
        sql += ` LIMIT ${Math.min(Number(limit), 100)}`
      }
      const { rows } = await query<ProductRow>(sql, params)
      res.json({ data: rows })
    } catch (err) {
      next(err)
    }
  },
)

productsRouter.get(
  '/:slug',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { slug } = req.params
      const { rows } = await query<ProductRow>(
        `${SELECT_PRODUCT} WHERE p.slug = $1 LIMIT 1`,
        [slug],
      )
      const row = rows[0]
      if (!row) {
        res.status(404).json({ error: 'product_not_found' })
        return
      }
      res.json({ data: row })
    } catch (err) {
      next(err)
    }
  },
)
