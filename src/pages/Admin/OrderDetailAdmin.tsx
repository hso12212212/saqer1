import { useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowRight,
  Calendar,
  Loader2,
  MapPin,
  Package,
  Phone,
  Trash2,
  User,
} from 'lucide-react'
import { api, type Order, type OrderStatus } from '../../lib/api'
import { formatPrice } from '../../lib/format'
import { STATUS_COLORS, STATUS_LABELS } from './orderShared'

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 border-b border-reno-100 py-2.5 text-sm last:border-0 dark:border-reno-800">
      <dt className="w-28 shrink-0 text-xs font-bold text-reno-500">{label}</dt>
      <dd className="min-w-0 flex-1 break-words text-reno-900 dark:text-reno-100">
        {children}
      </dd>
    </div>
  )
}

export default function OrderDetailAdmin() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) {
      setError('معرّف الطلب غير صالح')
      setLoading(false)
      return
    }
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await api.getOrder(id)
        setOrder(data)
      } catch (e) {
        setOrder(null)
        setError(e instanceof Error ? e.message : 'فشل التحميل')
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  const setStatus = async (status: OrderStatus) => {
    if (!order || !id) return
    setSaving(true)
    try {
      const updated = await api.updateOrderStatus(id, status)
      setOrder(updated)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'فشل تحديث الحالة')
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async () => {
    if (!id || !order) return
    if (!confirm('حذف هذا الطلب نهائياً؟')) return
    try {
      await api.deleteOrder(id)
      navigate('/admin')
    } catch (e) {
      alert(e instanceof Error ? e.message : 'فشل الحذف')
    }
  }

  if (loading) {
    return (
      <section className="section flex min-h-[50vh] items-center justify-center gap-2 text-reno-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">جارٍ تحميل الطلب…</span>
      </section>
    )
  }

  if (error || !order) {
    return (
      <section className="section py-10">
        <Link
          to="/admin"
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-reno-700 hover:text-reno-900 dark:text-reno-200 dark:hover:text-white"
        >
          <ArrowRight className="h-4 w-4" />
          العودة إلى الطلبات
        </Link>
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error ?? 'الطلب غير موجود'}
        </p>
      </section>
    )
  }

  const created = new Date(order.created_at)
  const updated = new Date(order.updated_at)

  return (
    <section className="section py-6 md:py-8">
      <Link
        to="/admin"
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-reno-700 hover:text-reno-900 dark:text-reno-200 dark:hover:text-white"
      >
        <ArrowRight className="h-4 w-4" />
        العودة إلى الطلبات
      </Link>

      <header className="mb-8 flex flex-col gap-4 border-b border-reno-200 pb-6 dark:border-reno-800 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-black text-reno-900 dark:text-white md:text-2xl">
              طلب #{order.order_number}
            </h1>
            <span
              className={[
                'rounded-full px-3 py-1 text-xs font-bold',
                STATUS_COLORS[order.status],
              ].join(' ')}
            >
              {STATUS_LABELS[order.status]}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-reno-500">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              أُنشئ {created.toLocaleString('ar-IQ', { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              آخر تحديث{' '}
              {updated.toLocaleString('ar-IQ', { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs font-bold text-reno-600 dark:text-reno-300">
            حالة الطلب
            <select
              value={order.status}
              disabled={saving}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className="input min-w-[11rem] py-2"
            >
              {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={onDelete}
            className="btn-outline inline-flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/40 dark:hover:bg-red-950/30"
          >
            <Trash2 className="h-4 w-4" />
            حذف الطلب
          </button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-reno-200 bg-white p-4 dark:border-reno-800 dark:bg-reno-900/40 md:p-5">
          <h2 className="mb-1 flex items-center gap-2 text-sm font-black text-reno-900 dark:text-white">
            <User className="h-4 w-4" />
            بيانات العميل
          </h2>
          <dl>
            <InfoRow label="الاسم الكامل">{order.customer_name}</InfoRow>
            <InfoRow label="الهاتف">
              <a
                dir="ltr"
                href={`tel:${order.phone}`}
                className="inline-flex items-center gap-2 font-bold hover:underline"
              >
                <Phone className="h-4 w-4 shrink-0" />
                {order.phone}
              </a>
            </InfoRow>
          </dl>
        </div>

        <div className="rounded-xl border border-reno-200 bg-white p-4 dark:border-reno-800 dark:bg-reno-900/40 md:p-5">
          <h2 className="mb-1 flex items-center gap-2 text-sm font-black text-reno-900 dark:text-white">
            <MapPin className="h-4 w-4" />
            عنوان التوصيل
          </h2>
          <dl>
            <InfoRow label="المحافظة">{order.governorate}</InfoRow>
            <InfoRow label="المنطقة / القضاء">{order.district}</InfoRow>
            {order.landmark ? (
              <InfoRow label="أقرب نقطة دالّة">{order.landmark}</InfoRow>
            ) : (
              <InfoRow label="أقرب نقطة دالّة">
                <span className="text-reno-500">—</span>
              </InfoRow>
            )}
            {order.notes ? (
              <InfoRow label="ملاحظات العميل">{order.notes}</InfoRow>
            ) : null}
          </dl>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-reno-200 bg-white dark:border-reno-800 dark:bg-reno-900/40">
        <h2 className="flex items-center gap-2 border-b border-reno-100 px-4 py-3 text-sm font-black text-reno-900 dark:border-reno-800 dark:text-white md:px-5">
          <Package className="h-4 w-4" />
          المنتجات ({order.items.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-right text-sm">
            <thead>
              <tr className="border-b border-reno-100 text-xs font-bold text-reno-500 dark:border-reno-800">
                <th className="px-4 py-2 md:px-5">الصنف</th>
                <th className="px-2 py-2">السعر</th>
                <th className="px-2 py-2">الكمية</th>
                <th className="px-4 py-2 md:px-5">المجموع</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it, i) => (
                <tr
                  key={`${it.product_id}-${i}`}
                  className="border-b border-reno-100 last:border-0 dark:border-reno-800"
                >
                  <td className="px-4 py-3 md:px-5">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-reno-200 bg-reno-50 dark:border-reno-700 dark:bg-reno-800">
                        {it.image_url ? (
                          <img
                            src={it.image_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-reno-400">
                            <Package className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-reno-900 dark:text-white">
                          {it.name_ar}
                        </div>
                        <div className="mt-0.5 text-[11px] text-reno-500" dir="ltr">
                          {it.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-2 py-3 font-medium text-reno-700 dark:text-reno-200">
                    {formatPrice(it.price)}
                  </td>
                  <td className="px-2 py-3 font-bold">{it.quantity}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-black text-reno-900 dark:text-white md:px-5">
                    {formatPrice(Number(it.price) * it.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-end gap-1 border-t border-reno-100 px-4 py-4 dark:border-reno-800 md:px-5">
          <div className="text-xs text-reno-500">الإجمالي ({order.currency})</div>
          <div className="text-lg font-black text-reno-900 dark:text-white md:text-xl">
            {formatPrice(order.total)}
          </div>
        </div>
      </div>
    </section>
  )
}
