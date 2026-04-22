import { Link } from 'react-router-dom'
import { AlertCircle, LayoutGrid } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import { CategoryGridSkeleton } from '../components/Skeletons'
import { api } from '../lib/api'
import { useAsync } from '../hooks/useAsync'

export default function Categories() {
  const { data, loading, error } = useAsync(() => api.getCategories())

  return (
    <section className="section py-8">
      <h1 className="heading text-xl md:text-2xl">الفئات</h1>
      <p className="mt-1 text-xs text-reno-500 md:text-sm">
        اختر الفئة لاستكشاف منتجاتها.
      </p>

      <div className="mt-6">
        {loading && <CategoryGridSkeleton />}

        {!loading && error && (
          <EmptyState
            icon={<AlertCircle className="h-6 w-6" />}
            title="تعذّر تحميل الفئات"
            description={error}
          />
        )}

        {!loading && !error && data && data.length === 0 && (
          <EmptyState
            icon={<LayoutGrid className="h-6 w-6" />}
            title="لم تُضف فئات بعد"
          />
        )}

        {!loading && !error && data && data.length > 0 && (
          <div className="grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {data.map((c) => (
              <Link
                key={c.id}
                to={`/categories/${encodeURIComponent(c.slug)}`}
                className="group flex flex-col items-center gap-2 text-center"
              >
                {c.image_url ? (
                  <img
                    src={c.image_url}
                    alt={c.name_ar}
                    className="h-28 w-28 rounded-full border border-reno-200 object-cover transition-transform group-hover:-translate-y-1 sm:h-32 sm:w-32 md:h-36 md:w-36 dark:border-reno-700"
                  />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-full border border-reno-200 bg-reno-100 text-2xl font-black text-reno-600 transition-transform group-hover:-translate-y-1 sm:h-32 sm:w-32 md:h-36 md:w-36 dark:border-reno-700 dark:bg-reno-800 dark:text-reno-200">
                    {c.name_ar.slice(0, 1)}
                  </div>
                )}
                <div className="line-clamp-1 text-xs font-bold text-reno-800 sm:text-sm dark:text-reno-100">
                  {c.name_ar}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
