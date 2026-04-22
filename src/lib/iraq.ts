export const IRAQ_GOVERNORATES: readonly string[] = [
  'بغداد',
  'البصرة',
  'نينوى',
  'أربيل',
  'السليمانية',
  'دهوك',
  'كركوك',
  'صلاح الدين',
  'ديالى',
  'الأنبار',
  'بابل',
  'كربلاء',
  'النجف',
  'القادسية',
  'المثنى',
  'ذي قار',
  'ميسان',
  'واسط',
]

/** يتحقّق من رقم هاتف عراقي بصيغة 07XXXXXXXXX (11 رقم). */
export function isValidIraqPhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, '')
  return /^07\d{9}$/.test(digits)
}

export function normalizeIraqPhone(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 11)
}
