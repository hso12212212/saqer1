import { Link, useParams } from 'react-router-dom'
import { ArrowRight, PackageOpen } from 'lucide-react'
import { api } from '../lib/api'
import { useAsync } from '../hooks/useAsync'
import EmptyState from '../components/EmptyState'
import ProductCard from '../components/ProductCard'
import { ProductGridSkeleton } from '../components/Skeletons'

/** نفس عرض غلاف الصورة: يملأ لحد الـ section على الجوال، ويستوي مع الشبكة من sm */
function SectionDivider() {
  return (
    <div
      className={[
        '-mx-4 w-[calc(100%+2rem)] sm:mx-0 sm:w-full',
      ].join(' ')}
    >
      <hr
        className="mt-1 mb-8 border-0 border-t border-reno-200 dark:border-reno-800 sm:mt-2"
        aria-hidden
      />
    </div>
  )
}

/** غلاف الفئة: بعرض شبكة المنتجات، صورة تملأ الحواف */
function CategoryHero({
  imageUrl,
  nameAr,
  description,
}: {
  imageUrl: string | null
  nameAr: string
  description: string | null
}) {
  return (
    <div
      className={[
        'relative -mx-4 w-[calc(100%+2rem)] overflow-hidden bg-reno-200 dark:bg-reno-900',
        'sm:mx-0 sm:w-full sm:rounded-2xl sm:border sm:border-reno-200 dark:sm:border-reno-800',
      ].join(' ')}
    >
      <div className="relative h-[320px] w-full sm:h-[380px] md:h-[440px]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        ) : (
          <div
            className="absolute inset-0 bg-gradient-to-b from-reno-300 via-reno-200 to-reno-400 dark:from-reno-700 dark:via-reno-800 dark:to-reno-900"
            aria-hidden
          />
        )}

        {!imageUrl && (
          <span className="absolute left-1/2 top-1/3 -translate-x-1/2 text-7xl font-black text-white/25 dark:text-white/20 sm:text-8xl">
            {nameAr.slice(0, 1)}
          </span>
        )}

        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/5"
          aria-hidden
        />

        <Link
          to="/categories"
          className="absolute end-4 top-4 z-10 inline-flex items-center gap-1 rounded-full bg-black/45 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur-sm transition-colors hover:bg-black/60"
        >
          <ArrowRight className="h-3.5 w-3.5" />
          كل الفئات
        </Link>

        <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-4 pt-10 text-center sm:px-6 sm:pb-5 sm:pt-12">
          <h1 className="font-display text-xl font-black leading-tight tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)] sm:text-2xl md:text-3xl">
            {nameAr}
          </h1>
          {description ? (
            <p className="mx-auto mt-2 line-clamp-2 max-w-xl text-xs leading-6 text-white/95 drop-shadow-md sm:mt-2 sm:text-sm sm:leading-7">
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default function CategoryDetail() {
  const { slug = '' } = useParams()
  const cat = useAsync(() => api.getCategory(slug), [slug])
  const prods = useAsync(
    () => api.getProducts({ category: slug, active: true }),
    [slug],
  )

  if (cat.loading || prods.loading) {
    return (
      <>
        <section className="section pt-2 pb-0 sm:pt-3">
          <div
            className={[
              'relative -mx-4 w-[calc(100%+2rem)] overflow-hidden',
              'sm:mx-0 sm:w-full sm:rounded-2xl',
            ].join(' ')}
          >
            <div className="shimmer-fill h-[320px] w-full sm:h-[380px] md:h-[440px]" />
          </div>
        </section>
        <div className="section">
          <SectionDivider />
        </div>
        <section className="section pb-12">
          <ProductGridSkeleton count={8} />
        </section>
      </>
    )
  }

  if (cat.error || !cat.data) {
    return (
      <section className="section py-8">
        <EmptyState
          title="الفئة غير موجودة"
          description={cat.error ?? 'لم نعثر على هذه الفئة.'}
          action={
            <Link to="/categories" className="btn-outline text-xs">
              كل الفئات
            </Link>
          }
        />
      </section>
    )
  }

  const c = cat.data
  const list = prods.data ?? []

  return (
    <>
      <section className="section pt-2 pb-0 sm:pt-3">
        <CategoryHero
          imageUrl={c.image_url}
          nameAr={c.name_ar}
          description={c.description}
        />
      </section>

      <div className="section">
        <SectionDivider />
      </div>

      <section className="section pb-12">
        <h2 className="mb-5 text-center text-sm font-black text-reno-900 dark:text-white md:text-base">
          منتجات {c.name_ar}
        </h2>
        {list.length === 0 ? (
          <EmptyState
            icon={<PackageOpen className="h-6 w-6" />}
            title="لا توجد منتجات في هذه الفئة"
            action={
              <Link to="/products" className="btn-primary text-xs">
                كل المنتجات
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {list.map((p) => (
              <Link key={p.id} to={`/products/${encodeURIComponent(p.slug)}`}>
                <ProductCard product={p} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
