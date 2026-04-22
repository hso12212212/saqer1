import { Router, type Request, type Response, type NextFunction } from 'express'
import { query } from '../db.js'

export const ordersRouter: Router = Router()

/** يطابق `DELIVERY_FEE_IQD` في الواجهة (`src/lib/shipping.ts`) */
const DELIVERY_FEE_IQD = 5000

// المحافظات العراقية الـ18 — نتحقق منها في الخادم أيضاً.
const IQ_GOVERNORATES = new Set<string>([
  'بغداد', 'البصرة', 'نينوى', 'أربيل', 'السليمانية', 'دهوك', 'كركوك',
  'صلاح الدين', 'ديالى', 'الأنبار', 'بابل', 'كربلاء', 'النجف', 'القادسية',
  'المثنى', 'ذي قار', 'ميسان', 'واسط',
])

interface OrderItemInput {
  product_id: string
  slug: string
  name_ar: string
  price: number
  quantity: number
  image_url?: string | null
}

ordersRouter.post(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = (req.body ?? {}) as Record<string, unknown>
      const customer_name = typeof body.customer_name === 'string' ? body.customer_name.trim() : ''
      const phoneRaw = typeof body.phone === 'string' ? body.phone.replace(/\D/g, '') : ''
      const governorate = typeof body.governorate === 'string' ? body.governorate.trim() : ''
      const district = typeof body.district === 'string' ? body.district.trim() : ''
      const landmark = typeof body.landmark === 'string' ? body.landmark.trim() : null
      const notes = typeof body.notes === 'string' ? body.notes.trim() : null
      const itemsRaw = Array.isArray(body.items) ? body.items : []

      if (customer_name.length < 2) {
        res.status(400).json({ error: 'invalid_name' })
        return
      }
      if (!/^07\d{9}$/.test(phoneRaw)) {
        res.status(400).json({ error: 'invalid_phone' })
        return
      }
      if (!IQ_GOVERNORATES.has(governorate)) {
        res.status(400).json({ error: 'invalid_governorate' })
        return
      }
      if (district.length < 2) {
        res.status(400).json({ error: 'invalid_district' })
        return
      }

      const items: OrderItemInput[] = []
      for (const raw of itemsRaw) {
        if (!raw || typeof raw !== 'object') continue
        const r = raw as Record<string, unknown>
        const product_id = typeof r.product_id === 'string' ? r.product_id : ''
        const slug = typeof r.slug === 'string' ? r.slug : ''
        const name_ar = typeof r.name_ar === 'string' ? r.name_ar : ''
        const price = Number(r.price)
        const quantity = Number(r.quantity)
        if (!product_id || !slug || !name_ar) continue
        if (!Number.isFinite(price) || price < 0) continue
        if (!Number.isFinite(quantity) || quantity < 1) continue
        items.push({
          product_id,
          slug,
          name_ar,
          price,
          quantity: Math.floor(quantity),
          image_url: typeof r.image_url === 'string' ? r.image_url : null,
        })
      }

      if (items.length === 0) {
        res.status(400).json({ error: 'empty_cart' })
        return
      }

      const itemsSum = items.reduce((acc, it) => acc + it.price * it.quantity, 0)
      const total = itemsSum + DELIVERY_FEE_IQD

      const { rows } = await query(
        `INSERT INTO saqer_orders
           (customer_name, phone, governorate, district, landmark, notes,
            items, total, currency, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,'IQD','pending')
         RETURNING id, order_number, customer_name, phone, governorate,
                   district, landmark, notes, items, total, currency, status,
                   created_at, updated_at`,
        [
          customer_name,
          phoneRaw,
          governorate,
          district,
          landmark,
          notes,
          JSON.stringify(items),
          total,
        ],
      )
      res.status(201).json({ data: rows[0] })
    } catch (err) {
      next(err)
    }
  },
)
