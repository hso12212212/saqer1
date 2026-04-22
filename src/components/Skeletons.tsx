interface Props {
  count?: number
}

export function ProductGridSkeleton({ count = 8 }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="shimmer-fill aspect-square w-full rounded-xl" aria-hidden />
          <div className="shimmer-fill h-3 w-4/5 rounded" aria-hidden />
          <div className="shimmer-fill h-3 w-1/3 rounded" aria-hidden />
        </div>
      ))}
      <span className="sr-only">جارٍ التحميل…</span>
    </div>
  )
}

export function CategoryCircleSkeleton({
  count = 6,
  large = false,
}: Props & { large?: boolean }) {
  const size = large
    ? 'h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32'
    : 'h-24 w-24 sm:h-32 sm:w-32'
  const label = large
    ? 'h-3 w-16 sm:w-20'
    : 'h-2.5 w-16'
  const gap = large ? 'gap-3 sm:gap-4 md:gap-5' : 'gap-5 sm:gap-7'
  return (
    <div
      className={['flex overflow-x-auto', large ? 'max-sm:pt-2 max-sm:pb-2 sm:py-1' : 'pb-2', gap].join(
        ' ',
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2 text-center">
          <div className={['shimmer-fill mx-auto rounded-full', size].join(' ')} aria-hidden />
          <div
            className={['shimmer-fill mx-auto rounded', label].join(' ')}
            aria-hidden
          />
        </div>
      ))}
      <span className="sr-only">جارٍ تحميل الفئات…</span>
    </div>
  )
}

export function CategoryGridSkeleton({ count = 12 }: Props) {
  return (
    <div className="grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2 text-center">
          <div
            className="shimmer-fill mx-auto h-28 w-28 rounded-full sm:h-32 sm:w-32 md:h-36 md:w-36"
            aria-hidden
          />
          <div
            className="shimmer-fill mx-auto h-3 w-20 rounded"
            aria-hidden
          />
        </div>
      ))}
      <span className="sr-only">جارٍ التحميل…</span>
    </div>
  )
}

export function HeroSkeleton() {
  return (
    <div
      className="shimmer-fill h-[42vh] min-h-[260px] w-full sm:h-[52vh] md:h-[60vh] md:min-h-[360px]"
      aria-hidden
    />
  )
}
