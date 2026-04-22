export interface Category {
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

export interface Product {
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

interface ApiResponse<T> {
  data: T
  error?: string
}

// نمط classi.store: نداءات نسبية (`/api/...`) و Netlify يُوكّلها لـ Railway.
// إن ضُبط VITE_API_URL صراحةً فهو يتغلّب (مفيد للتطوير أو اختبار نطاق آخر).
const BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

const TOKEN_KEY = 'saqer-admin-token'

export const token = {
  get: () => (typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null),
  set: (v: string) => localStorage.setItem(TOKEN_KEY, v),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

type BodyInit_ = Record<string, unknown> | FormData | undefined

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(
  path: string,
  opts: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    body?: BodyInit_
    auth?: boolean
    raw?: boolean
  } = {},
): Promise<T> {
  const { method = 'GET', body, auth = false, raw = false } = opts
  const headers: Record<string, string> = { Accept: 'application/json' }
  let payload: BodyInit | undefined

  if (body instanceof FormData) {
    payload = body
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  if (auth) {
    const t = token.get()
    if (t) headers.Authorization = `Bearer ${t}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: payload,
  })
  if (res.status === 204) return undefined as T
  if (!res.ok) {
    let message = `API ${res.status}`
    const text = await res.text()
    if (text) {
      try {
        const j = JSON.parse(text) as { error?: string; message?: string }
        if (typeof j.error === 'string' && j.error) message = j.error
        else if (typeof j.message === 'string' && j.message) message = j.message
      } catch {
        const t = text.trim()
        if (t && !t.startsWith('<') && t.length < 500) message = t
      }
    }
    throw new ApiError(res.status, message)
  }
  if (raw) return (await res.json()) as T
  const json = (await res.json()) as ApiResponse<T>
  return json.data
}

export interface LoginResponse {
  token: string
  email: string
}

export interface HeroSetting {
  image_url?: string
  title?: string
  subtitle?: string
}

export type SettingsMap = {
  hero?: HeroSetting
} & Record<string, Record<string, unknown> | undefined>

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export interface OrderItem {
  product_id: string
  slug: string
  name_ar: string
  price: number
  quantity: number
  image_url: string | null
}

export interface Order {
  id: string
  order_number: number
  customer_name: string
  phone: string
  governorate: string
  district: string
  landmark: string | null
  notes: string | null
  items: OrderItem[]
  total: string
  currency: string
  status: OrderStatus
  created_at: string
  updated_at: string
}

export interface CreateOrderPayload {
  customer_name: string
  phone: string
  governorate: string
  district: string
  landmark?: string | null
  notes?: string | null
  items: Array<{
    product_id: string
    slug: string
    name_ar: string
    price: number
    quantity: number
    image_url?: string | null
  }>
}

export const api = {
  // public
  getCategories: () => request<Category[]>('/api/categories'),
  getCategory: (slug: string) =>
    request<Category>(`/api/categories/${encodeURIComponent(slug)}`),
  getProducts: (opts?: { category?: string; active?: boolean; limit?: number }) => {
    const q = new URLSearchParams()
    if (opts?.category) q.set('category', opts.category)
    if (opts?.active !== undefined) q.set('active', String(opts.active))
    if (opts?.limit !== undefined) q.set('limit', String(opts.limit))
    const s = q.toString()
    return request<Product[]>(`/api/products${s ? `?${s}` : ''}`)
  },
  getProduct: (slug: string) =>
    request<Product>(`/api/products/${encodeURIComponent(slug)}`),
  getSettings: () => request<SettingsMap>('/api/settings'),
  updateSetting: (key: string, value: Record<string, unknown>) =>
    request<{ key: string; value: Record<string, unknown> }>(
      `/api/admin/settings/${encodeURIComponent(key)}`,
      { method: 'PUT', body: value, auth: true },
    ),

  // orders
  createOrder: (payload: CreateOrderPayload) =>
    request<Order>('/api/orders', {
      method: 'POST',
      body: payload as unknown as Record<string, unknown>,
    }),
  getOrders: (status?: OrderStatus) => {
    const q = status ? `?status=${encodeURIComponent(status)}` : ''
    return request<Order[]>(`/api/admin/orders${q}`, { auth: true })
  },
  getOrder: (id: string) =>
    request<Order>(`/api/admin/orders/${encodeURIComponent(id)}`, { auth: true }),
  updateOrderStatus: (id: string, status: OrderStatus) =>
    request<Order>(`/api/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: { status },
      auth: true,
    }),
  deleteOrder: (id: string) =>
    request<void>(`/api/admin/orders/${id}`, { method: 'DELETE', auth: true }),

  // auth
  login: (email: string, password: string) =>
    request<LoginResponse>('/api/admin/login', {
      method: 'POST',
      body: { email, password },
      raw: true,
    }),
  me: () => request<{ email: string }>('/api/admin/me', { auth: true, raw: true }),

  // admin — uploads
  upload: async (files: File[]): Promise<string[]> => {
    const fd = new FormData()
    for (const f of files) fd.append('files', f)
    const res = await request<{ urls: string[] }>('/api/admin/upload', {
      method: 'POST',
      body: fd,
      auth: true,
      raw: true,
    })
    return res.urls
  },

  // admin — categories
  createCategory: (payload: Partial<Category>) =>
    request<Category>('/api/admin/categories', {
      method: 'POST',
      body: payload as unknown as Record<string, unknown>,
      auth: true,
    }),
  updateCategory: (id: string, payload: Partial<Category>) =>
    request<Category>(`/api/admin/categories/${id}`, {
      method: 'PUT',
      body: payload as unknown as Record<string, unknown>,
      auth: true,
    }),
  deleteCategory: (id: string) =>
    request<void>(`/api/admin/categories/${id}`, {
      method: 'DELETE',
      auth: true,
    }),

  // admin — products
  createProduct: (
    payload: Omit<Partial<Product>, 'price' | 'images'> & {
      price: number | string
      images?: string[]
    },
  ) =>
    request<Product>('/api/admin/products', {
      method: 'POST',
      body: payload as unknown as Record<string, unknown>,
      auth: true,
    }),
  getAdminProduct: (id: string) =>
    request<Product>(`/api/admin/products/${encodeURIComponent(id)}`, {
      auth: true,
    }),
  updateProduct: (
    id: string,
    payload: Omit<Partial<Product>, 'price' | 'images'> & {
      price?: number | string
      images?: string[]
    },
  ) =>
    request<Product>(`/api/admin/products/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: payload as unknown as Record<string, unknown>,
      auth: true,
    }),
  deleteProduct: (id: string) =>
    request<void>(`/api/admin/products/${id}`, {
      method: 'DELETE',
      auth: true,
    }),
}
