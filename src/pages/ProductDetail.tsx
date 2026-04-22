import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowRight,
  Check,
  CheckCircle2,
  PackageOpen,
  ShieldCheck,
  ShoppingBag,
  Truck,
  X,
  ZoomIn,
} from 'lucide-react'
import { api } from '../lib/api'
import { useAsync } from '../hooks/useAsync'
import { formatPrice } from '../lib/format'
import EmptyState from '../components/EmptyState'
import ProductCard from '../components/ProductCard'
import ProductDetailSkeleton from '../components/ProductDetailSkeleton'
import QuantityInput from '../components/QuantityInput'
import { useCart } from '../context/CartContext'

const ROTATE_MS = 5000

export default function ProductDetail() {
  const { slug = '' } = useParams()
  const { data, loading, error } = useAsync(() => api.getProduct(slug), [slug])
  const related = useAsync(
    () =>
      data?.category_slug
        ? api.getProducts({ category: data.category_slug, active: true, limit: 8 })
        : Promise.resolve([]),
    [data?.category_slug],
  )
  const gallery = useMemo(() => {
    if (!data) return []
    const imgs = [...(data.images ?? [])]
    if (data.image_url && !imgs.includes(data.image_url)) imgs.push(data.image_url)
    return imgs
  }, [data])
  const [activeImg, setActiveImg] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    setActiveImg(0)
  }, [slug])

  useEffect(() => {
    if (gallery.length === 0) return
    setActiveImg((i) => Math.min(i, gallery.length - 1))
  }, [gallery.length])

  useEffect(() => {
    if (gallery.length <= 1 || lightboxOpen) return
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const id = window.setInterval(() => {
      setActiveImg((i) => (i + 1) % gallery.length)
    }, ROTATE_MS)
    return () => clearInterval(id)
  }, [gallery.length, lightboxOpen, slug])

  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false)
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [lightboxOpen])

  if (loading) {
    return <ProductDetailSkeleton />
  }

  if (error || !data) {
    return (
      <section className="section py-12">
        <EmptyState
          icon={<PackageOpen className="h-6 w-6" />}
          title="المنتج غير موجود"
          description={error ?? 'ربما حُذف أو تمّ تغيير الرابط.'}
          action={
            <Link to="/products" className="btn-outline text-xs">
              عودة للمنتجات
            </Link>
          }
        />
      </section>
    )
  }

  const mainImg = gallery[activeImg] ?? gallery[0] ?? null
  const inStock = data.stock > 0
  const relatedList = (related.data ?? []).filter((p) => p.id !== data.id)

  return (
    <>
      {/* Breadcrumbs */}
      <section className="section pt-5">
        <nav className="flex flex-wrap items-center gap-1 text-[11px] text-reno-500">
          <Link to="/" className="hover:text-reno-900 dark:hover:text-white">
            الرئيسية
          </Link>
          <span>/</span>
          <Link to="/products" className="hover:text-reno-900 dark:hover:text-white">
            المنتجات
          </Link>
          {data.category_slug && (
            <>
              <span>/</span>
              <Link
                to={`/categories/${encodeURIComponent(data.category_slug)}`}
                className="hover:text-reno-900 dark:hover:text-white"
              >
                {data.category_name_ar}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-reno-700 dark:text-reno-200">{data.name_ar}</span>
        </nav>
      </section>

      <section className="section py-6">
        <div className="grid gap-6 md:grid-cols-2 md:gap-10">
          {/* Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-reno-100 dark:bg-reno-800">
              {mainImg ? (
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="group relative h-full w-full cursor-zoom-in border-0 bg-transparent p-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-reno-900 focus-visible:ring-offset-2 dark:focus-visible:ring-white dark:focus-visible:ring-offset-reno-900"
                  aria-label="تكبير الصورة"
                >
                  <img
                    key={activeImg}
                    src={mainImg}
                    alt={data.name_ar}
                    className="motion-safe:animate-gallery-fade h-full w-full object-cover"
                  />
                  <span className="pointer-events-none absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-lg bg-black/55 px-2 py-1 text-[10px] font-bold text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    <ZoomIn className="h-3 w-3" />
                    تكبير
                  </span>
                </button>
              ) : (
                <div className="flex h-full w-full items-center justify-center text-reno-400">
                  <PackageOpen className="h-10 w-10" />
                </div>
              )}
            </div>

            {gallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {gallery.map((url, i) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setActiveImg(i)}
                    className={[
                      'h-16 w-16 shrink-0 overflow-hidden rounded-lg border transition-colors',
                      i === activeImg
                        ? 'border-reno-900 dark:border-white'
                        : 'border-reno-200 hover:border-reno-400 dark:border-reno-700',
                    ].join(' ')}
                  >
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-5">
            {data.category_name_ar && (
              <Link
                to={`/categories/${encodeURIComponent(data.category_slug ?? '')}`}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-reno-500 hover:text-reno-900 dark:hover:text-white"
              >
                <ArrowRight className="h-3 w-3" />
                {data.category_name_ar}
              </Link>
            )}

            <h1 className="heading text-xl md:text-3xl">{data.name_ar}</h1>

            {/* السعر — كبير وبارز */}
            <div className="rounded-2xl border border-reno-200 bg-reno-50 p-4 dark:border-reno-800 dark:bg-reno-900/50 sm:p-5">
              <div className="text-[11px] font-bold tracking-normal text-reno-500">
                السعر
              </div>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="text-3xl font-black leading-none text-reno-900 dark:text-white sm:text-4xl md:text-5xl">
                  {formatPrice(data.price)}
                </span>
              </div>
            </div>

            {data.description && (
              <p className="text-sm leading-7 text-reno-600 dark:text-reno-300">
                {data.description}
              </p>
            )}

            {/* الكمية + المتوفّر في المخزون — صف مرتب تحت السعر */}
            {inStock ? (
              <div className="grid gap-3 rounded-2xl border border-reno-200 p-4 dark:border-reno-800 sm:grid-cols-2 sm:gap-4 sm:p-5">
                <div>
                  <div className="text-[11px] font-bold tracking-normal text-reno-500">
                    الكمية
                  </div>
                  <div className="mt-2">
                    <QuantityInput
                      value={qty}
                      onChange={setQty}
                      min={1}
                      max={data.stock}
                      size="lg"
                    />
                  </div>
                </div>
                <div className="sm:text-end">
                  <div className="text-[11px] font-bold tracking-normal text-reno-500">
                    المتوفّر في المخزون
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 text-sm font-black text-reno-900 dark:text-white sm:text-base">
                    <CheckCircle2 className="h-4 w-4 text-reno-700 dark:text-reno-300" />
                    {data.stock} قطعة
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
                نفد المخزون حالياً
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
              <button
                type="button"
                disabled={!inStock}
                onClick={() => {
                  addItem(data, qty)
                  navigate('/cart')
                }}
                className="btn-primary h-12 w-full rounded-xl px-6 text-sm sm:h-14 sm:text-base"
              >
                <ShoppingBag className="h-5 w-5" />
                اشترِ الآن
              </button>
              <button
                type="button"
                disabled={!inStock}
                onClick={() => {
                  addItem(data, qty)
                  setAdded(true)
                  window.setTimeout(() => setAdded(false), 1500)
                }}
                className="btn-outline h-12 w-full rounded-xl px-6 text-sm sm:h-14 sm:text-base"
              >
                {added ? (
                  <>
                    <Check className="h-5 w-5" />
                    تمّت الإضافة
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-5 w-5" />
                    أضف للسلة
                  </>
                )}
              </button>
            </div>

            {/* Trust badges */}
            <ul className="mt-4 grid grid-cols-1 gap-2 border-t border-reno-200 pt-4 text-xs text-reno-600 sm:grid-cols-3 dark:border-reno-800 dark:text-reno-300">
              <li className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-reno-400" />
                شحن لكل المحافظات
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-reno-400" />
                دفع عند الاستلام
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-reno-400" />
                ضمان الجودة
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Related */}
      {relatedList.length > 0 && (
        <section className="section pb-12">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="heading text-base md:text-lg">منتجات مشابهة</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {relatedList.slice(0, 8).map((p) => (
              <Link key={p.id} to={`/products/${encodeURIComponent(p.slug)}`}>
                <ProductCard product={p} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {lightboxOpen && mainImg && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="معاينة الصورة"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute end-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="إغلاق"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={mainImg}
            alt={data.name_ar}
            className="max-h-[min(92vh,1200px)] max-w-full cursor-default object-contain motion-safe:animate-gallery-fade"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
