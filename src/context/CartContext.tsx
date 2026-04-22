import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Product } from '../lib/api'
import { DELIVERY_FEE_IQD } from '../lib/shipping'

export interface CartItem {
  product_id: string
  slug: string
  name_ar: string
  price: number
  image_url: string | null
  stock: number
  quantity: number
}

interface CartContextValue {
  items: CartItem[]
  totalItems: number
  subtotal: number
  /** أجور التوصيل الثابتة (د.ع) */
  deliveryFeeIqd: number
  /** المجموع الفرعي + التوصيل */
  totalWithDelivery: number
  addItem: (p: Product, qty?: number) => void
  setQuantity: (productId: string, qty: number) => void
  incrementItem: (productId: string) => void
  decrementItem: (productId: string) => void
  removeItem: (productId: string) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)
const STORAGE_KEY = 'saqer-cart-v1'

function readInitial(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (it): it is CartItem =>
        !!it &&
        typeof (it as CartItem).product_id === 'string' &&
        typeof (it as CartItem).quantity === 'number',
    )
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readInitial)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      /* ignore quota errors */
    }
  }, [items])

  const addItem = useCallback((p: Product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((it) => it.product_id === p.id)
      const maxStock = p.stock > 0 ? p.stock : 0
      if (existing) {
        const next = Math.min(existing.quantity + qty, maxStock || existing.quantity + qty)
        return prev.map((it) =>
          it.product_id === p.id ? { ...it, quantity: Math.max(1, next) } : it,
        )
      }
      const newItem: CartItem = {
        product_id: p.id,
        slug: p.slug,
        name_ar: p.name_ar,
        price: Number(p.price),
        image_url: p.image_url,
        stock: p.stock,
        quantity: Math.max(1, Math.min(qty, maxStock || qty)),
      }
      return [...prev, newItem]
    })
  }, [])

  const setQuantity = useCallback((productId: string, qty: number) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.product_id !== productId) return it
        const cap = it.stock > 0 ? it.stock : qty
        const clamped = Math.max(1, Math.min(qty, cap))
        return { ...it, quantity: clamped }
      }),
    )
  }, [])

  const incrementItem = useCallback((productId: string) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.product_id !== productId) return it
        const cap = it.stock > 0 ? it.stock : it.quantity + 1
        return { ...it, quantity: Math.min(it.quantity + 1, cap) }
      }),
    )
  }, [])

  const decrementItem = useCallback((productId: string) => {
    setItems((prev) =>
      prev.map((it) =>
        it.product_id === productId
          ? { ...it, quantity: Math.max(1, it.quantity - 1) }
          : it,
      ),
    )
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((it) => it.product_id !== productId))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const totalItems = useMemo(
    () => items.reduce((acc, it) => acc + it.quantity, 0),
    [items],
  )
  const subtotal = useMemo(
    () => items.reduce((acc, it) => acc + it.price * it.quantity, 0),
    [items],
  )

  const deliveryFeeIqd = DELIVERY_FEE_IQD
  const totalWithDelivery = useMemo(
    () => subtotal + deliveryFeeIqd,
    [subtotal, deliveryFeeIqd],
  )

  const value = useMemo(
    () => ({
      items,
      totalItems,
      subtotal,
      deliveryFeeIqd,
      totalWithDelivery,
      addItem,
      setQuantity,
      incrementItem,
      decrementItem,
      removeItem,
      clear,
    }),
    [
      items,
      totalItems,
      subtotal,
      deliveryFeeIqd,
      totalWithDelivery,
      addItem,
      setQuantity,
      incrementItem,
      decrementItem,
      removeItem,
      clear,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
