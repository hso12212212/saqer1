export function formatPrice(amount: number | string, _currency?: string): string {
  const n = Number(amount)
  if (!Number.isFinite(n)) return `${amount} د.ع`
  return `${Math.round(n).toLocaleString('en-US')} د.ع`
}
