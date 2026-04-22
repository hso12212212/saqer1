import type { OrderStatus } from '../../lib/api'

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'قيد المراجعة',
  confirmed: 'مؤكّد',
  shipped: 'قيد الشحن',
  delivered: 'تمّ التوصيل',
  cancelled: 'ملغى',
}

export const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-reno-100 text-reno-700 dark:bg-reno-800 dark:text-reno-200',
  confirmed: 'bg-reno-200 text-reno-800 dark:bg-reno-700 dark:text-reno-100',
  shipped: 'bg-reno-300 text-reno-900 dark:bg-reno-600 dark:text-white',
  delivered: 'bg-reno-900 text-white dark:bg-white dark:text-reno-900',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
}
