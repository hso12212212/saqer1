import { PackageOpen } from 'lucide-react'
import type { Product } from '../lib/api'
import { formatPrice } from '../lib/format'

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  return (
    <div className="group flex flex-col">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-reno-100 dark:bg-reno-800">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name_ar}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-reno-400">
            <PackageOpen className="h-8 w-8" />
          </div>
        )}
        {product.stock === 0 && (
          <span className="absolute right-2 top-2 rounded bg-red-600/90 px-2 py-0.5 text-[10px] font-bold text-white">
            نفد
          </span>
        )}
      </div>
      <div className="mt-2 px-0.5">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-reno-900 dark:text-white sm:text-base">
          {product.name_ar}
        </h3>
        <div className="mt-1 text-base font-black tabular-nums leading-none text-reno-900 dark:text-white sm:mt-1.5 sm:text-lg md:text-xl">
          {formatPrice(product.price)}
        </div>
      </div>
    </div>
  )
}
