import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { LayoutGrid } from 'lucide-react'
import { CategoryCircleSkeleton } from './Skeletons'
import { api, type Category } from '../lib/api'
import { useAsync } from '../hooks/useAsync'

const circle =
  'h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 rounded-full border-2 transition-all duration-300 ease-out'
const labelWrap = 'mt-2 w-24 text-center sm:w-28 md:w-32'

function CategoryPill({
  to,
  active,
  children,
  ariaLabel,
}: {
  to: string
  active: boolean
  children: ReactNode
  ariaLabel: string
}) {
  return (
    <Link
      to={to}
      aria-label={ariaLabel}
      aria-current={active ? 'page' : undefined}
      className={[
        'group flex shrink-0 snap-start flex-col items-center outline-none',
        'focus-visible:ring-2 focus-visible:ring-reno-900 max-sm:focus-visible:ring-offset-1 focus-visible:ring-offset-2 dark:focus-visible:ring-white dark:focus-visible:ring-offset-black',
      ].join(' ')}
    >
      {children}
    </Link>
  )
}

interface Props {
  /** على صفحة «كل المنتجات» يكون null؛ على صفحة فئة يكون slug الفئة */
  activeSlug: string | null
}

export default function CategoryCirclesNav({ activeSlug }: Props) {
  const categories = useAsync(() => api.getCategories(), [])

  if (categories.loading) {
    return <CategoryCircleSkeleton count={7} large />
  }

  if (!categories.data || categories.data.length === 0) {
    return <p className="text-xs text-reno-500">لم تُضف فئات بعد.</p>
  }

  return (
    <div
      className={[
        '-mx-1 overflow-x-auto scroll-smooth',
        'max-sm:pt-2 max-sm:pb-2 sm:py-1',
        '[scrollbar-width:thin]',
        'snap-x snap-mandatory',
      ].join(' ')}
    >
      <div className="flex min-w-min gap-3 px-1 sm:gap-4 md:gap-5">
        <CategoryPill
          to="/products"
          active={activeSlug === null}
          ariaLabel="عرض كل المنتجات"
        >
          <div
            className={[
              circle,
              'flex items-center justify-center border-dashed bg-reno-50 dark:bg-reno-900',
              activeSlug === null
                ? 'border-reno-900 shadow-[0_0_0_1px] shadow-reno-900 sm:scale-[1.02] dark:border-white dark:shadow-white'
                : 'border-reno-300 group-hover:border-reno-500 group-hover:bg-reno-100 dark:border-reno-600 dark:group-hover:border-reno-400 dark:group-hover:bg-reno-800/80',
            ].join(' ')}
          >
            <LayoutGrid
              className={[
                'h-8 w-8 transition-transform duration-300 sm:h-9 sm:w-9 md:h-10 md:w-10',
                activeSlug === null
                  ? 'text-reno-900 dark:text-white'
                  : 'text-reno-500 sm:group-hover:scale-105 group-hover:text-reno-800 dark:text-reno-400 dark:group-hover:text-white',
              ].join(' ')}
            />
          </div>
          <span
            className={[
              'line-clamp-2 text-xs font-black leading-tight sm:text-sm',
              labelWrap,
              activeSlug === null
                ? 'text-reno-900 dark:text-white'
                : 'text-reno-600 group-hover:text-reno-900 dark:text-reno-300 dark:group-hover:text-white',
            ].join(' ')}
          >
            كل المنتجات
          </span>
        </CategoryPill>

        {categories.data.map((c: Category) => {
          const active = activeSlug === c.slug
          return (
            <CategoryPill
              key={c.id}
              to={`/categories/${encodeURIComponent(c.slug)}`}
              active={active}
              ariaLabel={`صفحة فئة ${c.name_ar}`}
            >
              {c.image_url ? (
                <img
                  src={c.image_url}
                  alt=""
                  className={[
                    circle,
                    'border-reno-200 object-cover dark:border-reno-700',
                    active
                      ? 'border-reno-900 shadow-[0_0_0_2px] shadow-reno-900 max-sm:ring-1 sm:ring-2 ring-reno-900/20 sm:scale-[1.02] dark:border-white dark:shadow-white dark:ring-white/20'
                      : 'opacity-95 sm:group-hover:-translate-y-1 sm:group-hover:scale-[1.03] group-hover:border-reno-400 group-hover:opacity-100 dark:group-hover:border-reno-500',
                  ].join(' ')}
                />
              ) : (
                <div
                  className={[
                    circle,
                    'flex items-center justify-center bg-reno-100 text-xl font-black text-reno-600 dark:bg-reno-800 dark:text-reno-200 sm:text-2xl',
                    active
                      ? 'border-reno-900 shadow-[0_0_0_2px] shadow-reno-900 sm:scale-[1.02] dark:border-white dark:shadow-white'
                      : 'border-reno-200 sm:group-hover:-translate-y-1 sm:group-hover:scale-[1.03] dark:border-reno-700',
                  ].join(' ')}
                >
                  {c.name_ar.slice(0, 1)}
                </div>
              )}
              <span
                className={[
                  'line-clamp-2 text-xs font-bold leading-tight sm:text-sm',
                  labelWrap,
                  active
                    ? 'text-reno-900 dark:text-white'
                    : 'text-reno-700 group-hover:text-reno-900 dark:text-reno-200 dark:group-hover:text-white',
                ].join(' ')}
              >
                {c.name_ar}
              </span>
            </CategoryPill>
          )
        })}
      </div>
    </div>
  )
}
