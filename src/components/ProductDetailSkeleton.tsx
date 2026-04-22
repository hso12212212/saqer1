/** هيكل تحميل متقدّم (shimmer) يطابق تخطيط صفحة تفاصيل المنتج */

function Bar({ className }: { className: string }) {
  return (
    <div
      className={['shimmer-fill rounded-md', className].join(' ')}
      aria-hidden
    />
  )
}

export default function ProductDetailSkeleton() {
  return (
    <>
      <section className="section pt-5">
        <div className="flex flex-wrap items-center gap-2">
          <Bar className="h-3 w-14" />
          <Bar className="h-3 w-2 rounded-full" />
          <Bar className="h-3 w-16" />
          <Bar className="h-3 w-2 rounded-full" />
          <Bar className="h-3 w-24" />
          <Bar className="h-3 w-2 rounded-full" />
          <Bar className="h-3 w-32" />
        </div>
      </section>

      <section className="section py-6">
        <div className="grid gap-6 md:grid-cols-2 md:gap-10">
          <div className="space-y-3">
            <div className="shimmer-fill aspect-square w-full rounded-2xl" aria-hidden />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="shimmer-fill h-16 w-16 shrink-0 rounded-lg"
                  aria-hidden
                />
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <Bar className="h-3 w-24" />
            <Bar className="h-8 w-full max-w-md md:h-10" />
            <Bar className="h-8 w-4/5 max-w-sm md:h-9" />

            <div className="flex items-center gap-3 pt-1">
              <Bar className="h-9 w-36 rounded-lg md:h-11 md:w-44" />
              <Bar className="h-4 w-16 rounded-full" />
            </div>

            <div className="space-y-2.5 pt-1">
              <Bar className="h-3 w-full" />
              <Bar className="h-3 w-full" />
              <Bar className="h-3 w-11/12" />
              <Bar className="h-3 w-4/5" />
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <Bar className="h-10 w-32 rounded-lg" />
              <Bar className="h-10 w-28 rounded-lg" />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 border-t border-reno-200 pt-4 sm:grid-cols-3 dark:border-reno-800">
              <Bar className="h-4 w-full" />
              <Bar className="h-4 w-full" />
              <Bar className="h-4 w-full" />
            </div>
          </div>
        </div>
      </section>

      <section className="section pb-12">
        <Bar className="mb-4 h-6 w-40 rounded-lg md:h-7 md:w-48" />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="shimmer-fill aspect-square w-full rounded-xl" aria-hidden />
              <Bar className="h-3 w-4/5" />
              <Bar className="h-3 w-1/3" />
            </div>
          ))}
        </div>
      </section>

      <span className="sr-only">جارٍ تحميل تفاصيل المنتج…</span>
    </>
  )
}
