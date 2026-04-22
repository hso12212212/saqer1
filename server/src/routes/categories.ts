import { Router, type Request, type Response, type NextFunction } from 'express'
import { query } from '../db.js'

export const categoriesRouter: Router = Router()

interface CategoryRow {
  id: string
  slug: string
  name_ar: string
  name_en: string | null
  description: string | null
  icon: string | null
  image_url: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

const SELECT = `SELECT id, slug, name_ar, name_en, description, icon, image_url,
                       sort_order, created_at, updated_at
                  FROM saqer_categories`

categoriesRouter.get(
  '/',
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const { rows } = await query<CategoryRow>(
        `${SELECT} ORDER BY sort_order ASC, name_ar ASC`,
      )
      res.json({ data: rows })
    } catch (err) {
      next(err)
    }
  },
)

categoriesRouter.get(
  '/:slug',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { slug } = req.params
      const { rows } = await query<CategoryRow>(
        `${SELECT} WHERE slug = $1 LIMIT 1`,
        [slug],
      )
      const row = rows[0]
      if (!row) {
        res.status(404).json({ error: 'category_not_found' })
        return
      }
      res.json({ data: row })
    } catch (err) {
      next(err)
    }
  },
)
