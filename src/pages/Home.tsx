import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { api, type HeroSetting } from '../lib/api'
import { useAsync } from '../hooks/useAsync'
import ProductCard from '../components/ProductCard'
import {
  CategoryCircleSkeleton,
  HeroSkeleton,
  ProductGridSkeleton,
} from '../components/Skeletons'

// صورة محايدة داكنة — خيمة في الصحراء ليلاً (بدون لون أخضر)
const FALLBACK_HERO =
  'https://images.unsplash.com/photo-1533873984035-25970ab07461?auto=format&fit=crop&w=1920&q=80'

const PREVIEW_COUNT = 4

export default function Home() {
  const categories = useAsync(() => api.getCategories(), [])
  const products = useAsync(() => api.getProducts({ active: true }), [])
  const settings = useAsync(() => api.getSettings(), [])
  const [showAll, setShowAll] = useState(false)

  const hero: HeroSetting = settings.data?.hero ?? {}
  const heroImage = hero.image_url || FALLBACK_HERO
  const heroTitle = hero.title || 'متجر الصقر'
  const heroSubtitle = hero.subtitle || 'مستلزمات التخييم والرحلات'

  const visibleProducts = showAll
    ? products.data ?? []
    : (products.data ?? []).slice(0, PREVIEW_COUNT)

  return (
    <>
      {/* Hero */}
      {settings.loading ? (
        <HeroSkeleton />
      ) : (
        <section className="relative w-full">
          <div className="relative h-[42vh] min-h-[260px] w-full overflow-hidden bg-black sm:h-[52vh] md:h-[60vh] md:min-h-[360px]">
            <img
              src={heroImage}
              alt={heroTitle}
              className="h-full w-full object-cover opacity-70 grayscale"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/40" />
            <div className="absolute inset-0 flex items-end sm:items-center">
              <div className="section pb-8 sm:pb-0">
                <div className="max-w-xl animate-fade-in-up">
                  <h1 className="font-display text-3xl font-black tracking-tight text-white drop-shadow md:text-5xl">
                    {heroTitle}
                  </h1>
                  {heroSubtitle && (
                    <p className="mt-2 text-sm text-white/90 md:text-base">
                      {heroSubtitle}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link to="/products" className="btn-primary text-xs">
                      تصفّح المنتجات
                      <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <Link
                      to="/categories"
                      className="btn inline-flex items-center gap-2 rounded-lg border border-white/60 bg-white/10 px-4 py-2 text-xs font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                    >
                      الفئات
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* تسوّق حسب الفئة */}
      <section className="section py-8 md:py-10">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="heading text-lg md:text-xl">تسوّق حسب الفئة</h2>
          <Link
            to="/categories"
            className="text-xs font-bold text-reno-600 hover:text-reno-900 dark:text-reno-300 dark:hover:text-white"
          >
            عرض الكل
          </Link>
        </div>

        {categories.loading ? (
          <CategoryCircleSkeleton />
        ) : categories.data && categories.data.length > 0 ? (
          <div className="flex gap-5 overflow-x-auto pb-2 sm:gap-7">
            {categories.data.map((c) => (
              <Link
                key={c.id}
                to={`/categories/${encodeURIComponent(c.slug)}`}
                className="group flex shrink-0 flex-col items-center gap-2 text-center"
              >
                {c.image_url ? (
                  <img
                    src={c.image_url}
                    alt={c.name_ar}
                    className="h-24 w-24 rounded-full border border-reno-200 object-cover transition-transform group-hover:-translate-y-0.5 sm:h-32 sm:w-32 dark:border-reno-700"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border border-reno-200 bg-reno-100 text-2xl font-black text-reno-600 transition-transform group-hover:-translate-y-0.5 sm:h-32 sm:w-32 dark:border-reno-700 dark:bg-reno-800 dark:text-reno-200">
                    {c.name_ar.slice(0, 1)}
                  </div>
                )}
                <span className="line-clamp-1 w-24 text-xs font-bold text-reno-800 sm:w-32 sm:text-sm dark:text-reno-100">
                  {c.name_ar}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-xs text-reno-500">لم تُضف فئات بعد.</p>
        )}
      </section>

      {/* Products grid */}
      <section className="section py-6 md:py-8">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="heading text-lg md:text-xl">المنتجات</h2>
          <Link
            to="/products"
            className="text-xs font-bold text-reno-600 hover:text-reno-900 dark:text-reno-300 dark:hover:text-white"
          >
            عرض الكل
          </Link>
        </div>

        {products.loading ? (
          <ProductGridSkeleton count={PREVIEW_COUNT} />
        ) : visibleProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {visibleProducts.map((p) => (
                <Link key={p.id} to={`/products/${encodeURIComponent(p.slug)}`}>
                  <ProductCard product={p} />
                </Link>
              ))}
            </div>

            {(products.data?.length ?? 0) > PREVIEW_COUNT && (
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowAll((v) => !v)}
                  className="btn-outline text-xs"
                >
                  {showAll ? 'إخفاء' : `عرض الكل (${products.data?.length ?? 0})`}
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-xs text-reno-500">لم تُضف منتجات بعد.</p>
        )}
      </section>
    </>
  )
}
