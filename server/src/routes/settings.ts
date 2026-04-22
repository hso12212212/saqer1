import { Router, type Request, type Response, type NextFunction } from 'express'
import { query } from '../db.js'

export const settingsRouter: Router = Router()

interface SettingRow {
  key: string
  value: Record<string, unknown>
}

settingsRouter.get(
  '/',
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const { rows } = await query<SettingRow>(
        `SELECT key, value FROM saqer_settings`,
      )
      const obj: Record<string, Record<string, unknown>> = {}
      for (const r of rows) obj[r.key] = r.value
      res.json({ data: obj })
    } catch (err) {
      next(err)
    }
  },
)
