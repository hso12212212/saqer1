import { Minus, Plus } from 'lucide-react'

interface Props {
  value: number
  onChange: (n: number) => void
  min?: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
}

export default function QuantityInput({
  value,
  onChange,
  min = 1,
  max,
  size = 'md',
}: Props) {
  const dec = () => onChange(Math.max(min, value - 1))
  const inc = () => onChange(max ? Math.min(max, value + 1) : value + 1)

  const sizes =
    size === 'sm'
      ? 'h-8 text-xs'
      : size === 'lg'
        ? 'h-12 text-base'
        : 'h-10 text-sm'
  const btn =
    size === 'sm' ? 'w-8' : size === 'lg' ? 'w-12' : 'w-10'
  const field =
    size === 'sm' ? 'w-10' : size === 'lg' ? 'w-16' : 'w-12'
  const icon = size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5'

  return (
    <div
      className={[
        'inline-flex items-stretch overflow-hidden rounded-lg border border-reno-200 dark:border-reno-700',
        sizes,
      ].join(' ')}
    >
      <button
        type="button"
        onClick={dec}
        aria-label="تقليل"
        disabled={value <= min}
        className={[
          'flex items-center justify-center text-reno-700 transition-colors hover:bg-reno-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-reno-100 dark:hover:bg-reno-800',
          btn,
        ].join(' ')}
      >
        <Minus className={icon} />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value)
          if (Number.isFinite(n)) {
            const capped = max ? Math.min(max, n) : n
            onChange(Math.max(min, capped))
          }
        }}
        className={[
          'appearance-none border-x border-reno-200 bg-transparent text-center text-base font-bold text-reno-900 outline-none [appearance:textfield] dark:border-reno-700 dark:text-white sm:text-sm',
          '[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
          field,
        ].join(' ')}
      />
      <button
        type="button"
        onClick={inc}
        aria-label="زيادة"
        disabled={max !== undefined && value >= max}
        className={[
          'flex items-center justify-center text-reno-700 transition-colors hover:bg-reno-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-reno-100 dark:hover:bg-reno-800',
          btn,
        ].join(' ')}
      >
        <Plus className={icon} />
      </button>
    </div>
  )
}
