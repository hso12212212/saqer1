import { Link } from 'react-router-dom'
import { PackageOpen, ShoppingBag, Trash2 } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import QuantityInput from '../components/QuantityInput'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../lib/format'

export default function Cart() {
  const {
    items,
    subtotal,
    deliveryFeeIqd,
    totalWithDelivery,
    setQuantity,
    removeItem,
    clear,
    totalItems,
  } = useCart()

  const confirmClear = () => {
    if (confirm('إفراغ السلّة بالكامل؟')) clear()
  }

  if (items.length === 0) {
    return (
      <section className="section py-8">
        <h1 className="heading text-xl md:text-2xl">السلة</h1>
        <div className="mt-6">
          <EmptyState
            icon={<ShoppingBag className="h-6 w-6" />}
            title="سلّتك فارغة"
            description="ابدأ بإضافة منتجاتك المفضّلة."
            action={
              <Link to="/products" className="btn-primary text-xs">
                اكتشف المنتجات
              </Link>
            }
          />
        </div>
      </section>
    )
  }

  return (
    <section className="section py-8">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="heading text-xl md:text-2xl">السلة</h1>
        <span className="text-xs text-reno-500">
          {totalItems} {totalItems === 1 ? 'قطعة' : 'قطعة'}
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <ul className="space-y-3 md:col-span-2">
          {items.map((it) => (
            <li
              key={it.product_id}
              className="flex gap-3 rounded-xl border border-reno-200 p-3 dark:border-reno-800"
            >
              <Link
                to={`/products/${encodeURIComponent(it.slug)}`}
                className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-reno-100 dark:bg-reno-800"
              >
                {it.image_url ? (
                  <img
                    src={it.image_url}
                    alt={it.name_ar}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-reno-400">
                    <PackageOpen className="h-5 w-5" />
                  </div>
                )}
              </Link>

              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    to={`/products/${encodeURIComponent(it.slug)}`}
                    className="line-clamp-2 text-sm font-bold text-reno-900 hover:text-reno-700 dark:text-white dark:hover:text-reno-200"
                  >
                    {it.name_ar}
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeItem(it.product_id)}
                    aria-label="حذف من السلة"
                    className="shrink-0 rounded p-1 text-reno-500 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <QuantityInput
                    value={it.quantity}
                    onChange={(n) => setQuantity(it.product_id, n)}
                    min={1}
                    max={it.stock > 0 ? it.stock : undefined}
                    size="sm"
                  />
                  <div className="text-sm font-black text-reno-900 dark:text-white">
                    {formatPrice(it.price * it.quantity)}
                  </div>
                </div>
              </div>
            </li>
          ))}

          <div className="pt-1">
            <button
              type="button"
              onClick={confirmClear}
              className="btn-outline w-full rounded-xl border-red-200 py-3.5 text-sm font-bold text-red-600 hover:border-red-300 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30 sm:py-4 sm:text-base"
            >
              إفراغ السلّة
            </button>
          </div>
        </ul>

        {/* Summary */}
        <aside className="h-fit rounded-xl border border-reno-200 p-4 dark:border-reno-800">
          <h2 className="text-sm font-bold text-reno-900 dark:text-white">
            ملخّص الطلب
          </h2>
          <dl className="mt-3 space-y-2 text-xs">
            <div className="flex justify-between">
              <dt className="text-reno-500">المجموع الفرعي</dt>
              <dd className="font-bold text-reno-900 dark:text-white">
                {formatPrice(subtotal)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-reno-500">التوصيل</dt>
              <dd className="font-bold text-reno-900 dark:text-white">
                {formatPrice(deliveryFeeIqd)}
              </dd>
            </div>
          </dl>
          <div className="mt-3 flex items-baseline justify-between border-t border-reno-200 pt-3 dark:border-reno-700">
            <span className="text-xs text-reno-500">الإجمالي</span>
            <span className="text-base font-black text-reno-900 dark:text-white">
              {formatPrice(totalWithDelivery)}
            </span>
          </div>
          <Link
            to="/checkout"
            className="btn-primary mt-4 w-full justify-center rounded-xl py-3.5 text-sm font-bold sm:py-4 sm:text-base"
          >
            إتمام الطلب
          </Link>
          <Link
            to="/products"
            className="btn-outline mt-3 w-full justify-center rounded-xl py-3.5 text-sm font-bold sm:py-4 sm:text-base"
          >
            متابعة التسوّق
          </Link>
        </aside>
      </div>
    </section>
  )
}
