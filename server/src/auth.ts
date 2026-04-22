import { timingSafeEqual } from 'node:crypto'
import jwt, { type JwtPayload } from 'jsonwebtoken'
import type { Request, Response, NextFunction, RequestHandler } from 'express'

const JWT_SECRET = process.env.JWT_SECRET ?? ''
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? ''
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? ''
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7 // 7 أيام

if (!JWT_SECRET) {
  // eslint-disable-next-line no-console
  console.warn('[auth] JWT_SECRET غير معرّف — لن تعمل المصادقة.')
}

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a)
  const bBuf = Buffer.from(b)
  if (aBuf.length !== bBuf.length) return false
  return timingSafeEqual(aBuf, bBuf)
}

export interface AdminTokenPayload extends JwtPayload {
  sub: string
  role: 'admin'
}

export function verifyCredentials(email: string, password: string): boolean {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return false
  return safeEqual(email.trim().toLowerCase(), ADMIN_EMAIL.trim().toLowerCase())
    && safeEqual(password, ADMIN_PASSWORD)
}

export function signAdminToken(email: string): string {
  const payload: AdminTokenPayload = { sub: email, role: 'admin' }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_TTL_SECONDS })
}

export const requireAdmin: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const header = req.headers.authorization ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) {
    res.status(401).json({ error: 'unauthorized' })
    return
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminTokenPayload
    if (decoded.role !== 'admin') {
      res.status(403).json({ error: 'forbidden' })
      return
    }
    ;(req as Request & { admin?: AdminTokenPayload }).admin = decoded
    next()
  } catch {
    res.status(401).json({ error: 'invalid_token' })
  }
}
