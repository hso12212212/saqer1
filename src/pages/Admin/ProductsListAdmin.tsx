import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronLeft, LayoutGrid, Loader2, Pencil, Trash2 } from 'lucide-react'
import { api, type Category, type Product } from '../../lib/api'
import { formatPrice } from '../../lib/format'
import { ADMIN_UNCATEGORIZED_SLUG } from './adminProductsConstants'

interface ListProps {
  /** يزداد بعد نشر منتج لإعادة تحميل القائمة */
  refreshToken?: number
}

function productMatchesCategory(p: Product, slug: string): boolean {
  if (slug === ADMIN_UNCATEGORIZED_SLUG) return !p.category_id
  return p.category_slug === slug
}

export default function ProductsListAdmin({ refreshToken = 0 }: ListProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const categorySlug = searchParams.get('cat')

  const [items, setItems] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const goHub = useCallback(() => {
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev)
        p.set('tab', 'products')
        p.delete('cat')
        return p
      },
      { replace: false },
    )
  }, [setSearchParams])

  const goCategory = useCallback(
    (slug: string) => {
      setSearchParams(
        (prev) => {
          const p = new URLSearchParams(prev)
          p.set('tab', 'products')
          p.set('cat', slug)
          return p
        },
        { replace: false },
      )
    },
    [setSearchParams],
  )

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [prods, cats] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
      ])
      setItems(prods)
      setCategories(cats)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load, refreshToken])

  const countsBySlug = useMemo(() => {
    const m = new Map<string, number>()
    for (const p of items) {
      if (!p.category_id) {
        m.set(ADMIN_UNCATEGORIZED_SLUG, (m.get(ADMIN_UNCATEGORIZED_SLUG) ?? 0) + 1)
      } else if (p.category_slug) {
        m.set(p.category_slug, (m.get(p.category_slug) ?? 0) + 1)
      }
    }
    return m
  }, [items])

  const uncategorizedCount = countsBySlug.get(ADMIN_UNCATEGORIZED_SLUG) ?? 0

  const categoryPageProducts = useMemo(() => {
    if (!categorySlug) return []
    return items.filter((p) => productMatchesCategory(p, categorySlug))
  }, [items, categorySlug])

  const categoryPageTitle = useMemo(() => {
    if (!categorySlug) return ''
    if (categorySlug === ADMIN_UNCATEGORIZED_SLUG) return 'بدون فئة'
    const c = categories.find((x) => x.slug === categorySlug)
    return c?.name_ar ?? categoryPageProducts[0]?.category_name_ar ?? categorySlug
  }, [categorySlug, categories, categoryPageProducts])

  const categorySlugValid = useMemo(() => {
    if (!categorySlug) return true
    if (categorySlug === ADMIN_UNCATEGORIZED_SLUG) return true
    return categories.some((c) => c.slug === categorySlug)
  }, [categorySlug, categories])

  const sortedCategories = useMemo(
    () =>
      [...categories].sort(
        (a, b) =>
          a.sort_order - b.sort_order ||
          a.name_ar.localeCompare(b.name_ar, 'ar', { sensitivity: 'base' }),
      ),
    [categories],
  )

  const onDelete = async (id: string) => {
    if (!confirm('حذف هذا المنتج؟')) return
    try {
      await api.deleteProduct(id)
      setItems((prev) => prev.filter((p) => p.id !== id))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'فشل الحذف')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-12 text-sm text-reno-600 dark:text-reno-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        جارٍ تحميل المنتجات…
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
        {error}
      </div>
    )
  }

  /* ——— صفحة فئة واحدة ——— */
  if (categorySlug) {
    if (!categorySlugValid && categorySlug !== ADMIN_UNCATEGORIZED_SLUG) {
      return (
        <div className="panel space-y-4 py-8 text-center">
          <p className="text-sm text-reno-700 dark:text-reno-300">الفئة غير موجودة.</p>
          <button type="button" onClick={goHub} className="btn-primary mx-auto text-xs">
            العودة إلى الفئات
          </button>
        </div>
      )
    }

    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={goHub}
            className="inline-flex items-center gap-1 rounded-lg border border-reno-200 bg-white px-3 py-2 text-xs font-bold text-reno-800 transition-colors hover:bg-reno-50 dark:border-reno-700 dark:bg-reno-900 dark:text-reno-100 dark:hover:bg-reno-800"
          >
            <ChevronLeft className="h-4 w-4" />
            كل الفئات
          </button>
          <div className="min-w-0 flex-1">
            <h2 className="heading text-lg">{categoryPageTitle}</h2>
            <p className="mt-0.5 text-sm text-reno-600 dark:text-reno-400">
              {categoryPageProducts.length} منتجاً
            </p>
          </div>
          <button type="button" onClick={() => void load()} className="btn-outline text-xs">
            تحديث
          </button>
        </div>

        {categoryPageProducts.length === 0 ? (
          <div className="panel py-12 text-center text-sm text-reno-600 dark:text-reno-400">
            لا توجد منتجات في هذه الفئة.
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categoryPageProducts.map((p) => (
              <li
                key={p.id}
                className="flex gap-3 rounded-xl border border-reno-200 bg-white p-3 dark:border-reno-700 dark:bg-reno-900/80"
              >
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt=""
                    className="h-20 w-20 shrink-0 rounded-lg border border-reno-200 object-cover dark:border-reno-700"
                  />
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-reno-100 text-reno-500 dark:bg-reno-800">
                    —
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-2 text-sm font-bold leading-snug text-reno-900 dark:text-white">
                      {p.name_ar}
                    </p>
                    <div className="flex shrink-0 items-center gap-0.5">
                      <Link
                        to={`/admin/products/edit/${p.id}`}
                        className="rounded-lg p-1.5 text-reno-600 transition-colors hover:bg-reno-100 dark:text-reno-300 dark:hover:bg-reno-800"
                        aria-label="تعديل"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => void onDelete(p.id)}
                        className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                        aria-label="حذف"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-1 text-xs font-medium text-reno-800 dark:text-reno-200">
                    {formatPrice(p.price)}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-reno-500 dark:text-reno-400">
                    <span>مخزون {p.stock}</span>
                    {!p.is_active && (
                      <span className="rounded bg-reno-200 px-1.5 py-0.5 font-medium text-reno-800 dark:bg-reno-700 dark:text-reno-200">
                        مخفي
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  /* ——— فهرس الفئات (صفحة رئيسية للمنتجات) ——— */
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="heading text-lg">المنتجات حسب الفئة</h2>
          <p className="mt-1 text-sm text-reno-600 dark:text-reno-400">
            اختر تصنيفاً لعرض منتجاته — {items.length} منتجاً إجمالاً
          </p>
        </div>
        <button type="button" onClick={() => void load()} className="btn-outline text-xs">
          تحديث القائمة
        </button>
      </div>

      {items.length === 0 ? (
        <div className="panel py-12 text-center text-sm text-reno-600 dark:text-reno-400">
          لا توجد منتجات بعد. استخدم تبويب «نشر منتج» لإضافة أول منتج.
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sortedCategories.map((c) => {
            const n = countsBySlug.get(c.slug) ?? 0
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => goCategory(c.slug)}
                  className="flex w-full items-center gap-4 rounded-xl border border-reno-200 bg-white p-4 text-right transition-colors hover:border-reno-400 hover:bg-reno-50/80 dark:border-reno-700 dark:bg-reno-900/80 dark:hover:border-reno-500 dark:hover:bg-reno-800/50"
                >
                  {c.image_url ? (
                    <img
                      src={c.image_url}
                      alt=""
                      className="h-14 w-14 shrink-0 rounded-full border border-reno-200 object-cover dark:border-reno-600"
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-reno-100 dark:bg-reno-800">
                      <LayoutGrid className="h-6 w-6 text-reno-500" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-reno-900 dark:text-white">{c.name_ar}</p>
                    <p className="mt-0.5 text-xs text-reno-500">{n} منتجاً</p>
                  </div>
                  <ChevronLeft className="h-5 w-5 shrink-0 text-reno-400 rtl:rotate-180" />
                </button>
              </li>
            )
          })}

          {uncategorizedCount > 0 && (
            <li>
              <button
                type="button"
                onClick={() => goCategory(ADMIN_UNCATEGORIZED_SLUG)}
                className="flex w-full items-center gap-4 rounded-xl border border-dashed border-reno-300 bg-reno-50/80 p-4 text-right transition-colors hover:border-reno-400 hover:bg-reno-100/80 dark:border-reno-600 dark:bg-reno-900/40 dark:hover:bg-reno-800/50"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-reno-200/80 dark:bg-reno-800">
                  <LayoutGrid className="h-6 w-6 text-reno-600 dark:text-reno-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-reno-900 dark:text-white">بدون فئة</p>
                  <p className="mt-0.5 text-xs text-reno-500">{uncategorizedCount} منتجاً</p>
                </div>
                <ChevronLeft className="h-5 w-5 shrink-0 text-reno-400 rtl:rotate-180" />
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
