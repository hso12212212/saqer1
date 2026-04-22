import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { AlertCircle, PackageOpen } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import ProductCard from '../components/ProductCard'
import CategoryCirclesNav from '../components/CategoryCirclesNav'
import { ProductGridSkeleton } from '../components/Skeletons'
import { api } from '../lib/api'
import { useAsync } from '../hooks/useAsync'

export default function Products() {
  const [params] = useSearchParams()
  const legacyCategory = params.get('category')
  if (legacyCategory && legacyCategory.length > 0) {
    return (
      <Navigate
        to={`/categories/${encodeURIComponent(legacyCategory)}`}
        replace
      />
    )
  }
  return <ProductsAll />
}

function ProductsAll() {
  const products = useAsync(() => api.getProducts({ active: true }), [])

  return (
    <section className="section py-8">
      <h1 className="heading text-xl md:text-2xl">كل المنتجات</h1>

      <div className="mt-6">
        <p className="mb-3 text-xs font-bold tracking-normal text-reno-500">
          تصفّح الفئات
        </p>
        <CategoryCirclesNav activeSlug={null} />
      </div>

      <div
        className="my-8 border-t border-reno-200 dark:border-reno-800"
        role="separator"
        aria-hidden
      />

      <div>
        <h2 className="mb-5 text-sm font-black text-reno-900 dark:text-white md:text-base">
          المنتجات
        </h2>
        {products.loading && <ProductGridSkeleton count={8} />}

        {!products.loading && products.error && (
          <EmptyState
            icon={<AlertCircle className="h-6 w-6" />}
            title="تعذّر تحميل المنتجات"
            description={products.error}
          />
        )}

        {!products.loading && !products.error && products.data && products.data.length === 0 && (
          <EmptyState
            icon={<PackageOpen className="h-6 w-6" />}
            title="لا توجد منتجات بعد"
            action={
              <Link to="/categories" className="btn-primary text-xs">
                تصفّح الفئات
              </Link>
            }
          />
        )}

        {!products.loading && !products.error && products.data && products.data.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.data.map((p) => (
              <Link key={p.id} to={`/products/${encodeURIComponent(p.slug)}`}>
                <ProductCard product={p} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
