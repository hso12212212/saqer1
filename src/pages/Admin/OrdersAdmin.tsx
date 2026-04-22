import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, Loader2, PackageOpen, RefreshCw } from 'lucide-react'
import { api, type Order, type OrderStatus } from '../../lib/api'
import { formatPrice } from '../../lib/format'
import { STATUS_COLORS, STATUS_LABELS } from './orderShared'

export default function OrdersAdmin() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | OrderStatus>('all')

  const load = async () => {
    setLoading(true)
    try {
      const data = await api.getOrders(filter === 'all' ? undefined : filter)
      setOrders(data)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل التحميل')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [filter])

  const counts = useMemo(() => {
    const c: Record<OrderStatus, number> = {
      pending: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    }
    for (const o of orders) c[o.status]++
    return c
  }, [orders])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          <FilterPill
            active={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            الكل ({orders.length})
          </FilterPill>
          {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((s) => (
            <FilterPill
              key={s}
              active={filter === s}
              onClick={() => setFilter(s)}
            >
              {STATUS_LABELS[s]} ({counts[s] ?? 0})
            </FilterPill>
          ))}
        </div>
        <button
          onClick={load}
          className="btn-outline text-xs"
          disabled={loading}
        >
          <RefreshCw className={['h-4 w-4', loading ? 'animate-spin' : ''].join(' ')} />
          تحديث
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-12 text-reno-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-xs">جارٍ التحميل…</span>
        </div>
      )}

      {!loading && error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </p>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-12 text-center text-reno-500">
          <PackageOpen className="h-6 w-6" />
          <p className="text-xs">لا توجد طلبات بهذه الحالة.</p>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <ul className="space-y-2">
          {orders.map((o) => (
            <li key={o.id}>
              <Link
                to={`/admin/orders/${o.id}`}
                className="flex w-full items-center gap-3 rounded-xl border border-reno-200 bg-white p-3 text-right transition-colors hover:bg-reno-50 dark:border-reno-800 dark:bg-reno-900 dark:hover:bg-reno-800/60"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black text-reno-900 dark:text-white">
                      #{o.order_number}
                    </span>
                    <span className="text-xs font-bold text-reno-700 dark:text-reno-200">
                      {o.customer_name}
                    </span>
                    <span
                      className={[
                        'rounded-full px-2 py-0.5 text-[10px] font-bold',
                        STATUS_COLORS[o.status],
                      ].join(' ')}
                    >
                      {STATUS_LABELS[o.status]}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-reno-500">
                    <span dir="ltr">{o.phone}</span>
                    <span>•</span>
                    <span>
                      {o.governorate} — {o.district}
                    </span>
                    <span>•</span>
                    <span>{new Date(o.created_at).toLocaleString('ar-IQ')}</span>
                  </div>
                </div>
                <div className="shrink-0 text-sm font-black text-reno-900 dark:text-white">
                  {formatPrice(o.total)}
                </div>
                <ChevronLeft className="h-4 w-4 shrink-0 text-reno-400" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-full border px-3 py-1 text-[11px] font-bold transition-colors',
        active
          ? 'border-reno-900 bg-reno-900 text-white dark:border-white dark:bg-white dark:text-reno-900'
          : 'border-reno-200 text-reno-700 hover:bg-reno-100 dark:border-reno-700 dark:text-reno-200 dark:hover:bg-reno-800',
      ].join(' ')}
    >
      {children}
    </button>
  )
}
