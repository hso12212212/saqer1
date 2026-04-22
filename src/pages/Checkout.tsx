import { useId, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  Loader2,
  MapPin,
  PackageOpen,
  Phone,
  ShoppingBag,
  User,
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { api } from '../lib/api'
import { formatPrice } from '../lib/format'
import {
  IRAQ_GOVERNORATES,
  isValidIraqPhone,
  normalizeIraqPhone,
} from '../lib/iraq'

export default function Checkout() {
  const { items, subtotal, deliveryFeeIqd, totalWithDelivery, clear } = useCart()

  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [governorate, setGovernorate] = useState('')
  const [district, setDistrict] = useState('')
  const [landmark, setLandmark] = useState('')
  const [notes, setNotes] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [successNo, setSuccessNo] = useState<number | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState<string | null>(null)

  const phoneOk = useMemo(() => isValidIraqPhone(phone), [phone])

  if (items.length === 0 && successNo === null) {
    return (
      <section className="section py-10 text-center">
        <ShoppingBag className="mx-auto h-8 w-8 text-reno-400" />
        <h1 className="heading mt-3 text-xl">لا توجد منتجات في السلّة</h1>
        <p className="mt-1 text-xs text-reno-500">أضف منتجات قبل إتمام الطلب.</p>
        <Link
          to="/products"
          className="btn-primary mt-4 rounded-xl py-3 text-sm font-bold sm:text-base"
        >
          اكتشف المنتجات
        </Link>
      </section>
    )
  }

  if (successNo !== null) {
    return (
      <section className="section flex min-h-[60vh] flex-col items-center justify-center py-10 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-reno-900 text-white dark:bg-white dark:text-reno-900">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="heading mt-4 text-2xl">تمّ استلام طلبك</h1>
        <p className="mt-1 text-sm text-reno-600 dark:text-reno-300">
          رقم الطلب{' '}
          <span className="font-black text-reno-900 dark:text-white">
            #{successNo}
          </span>
          . سنتواصل معك قريباً لتأكيد التوصيل.
        </p>
        <div className="mt-6 flex w-full max-w-md flex-col gap-3 sm:mx-auto sm:flex-row sm:justify-center">
          <Link
            to="/"
            className="btn-primary justify-center rounded-xl py-3.5 text-sm font-bold sm:flex-1 sm:py-4 sm:text-base"
          >
            العودة للرئيسية
          </Link>
          <Link
            to="/products"
            className="btn-outline justify-center rounded-xl py-3.5 text-sm font-bold sm:flex-1 sm:py-4 sm:text-base"
          >
            متابعة التسوّق
          </Link>
        </div>
      </section>
    )
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (customerName.trim().length < 2) e.customerName = 'الاسم قصير جداً'
    if (!phoneOk) e.phone = 'رقم الهاتف يجب أن يكون 11 رقماً ويبدأ بـ 07'
    if (!governorate) e.governorate = 'اختر المحافظة'
    if (district.trim().length < 2) e.district = 'أدخل المنطقة / القضاء'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onSubmit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault()
    setApiError(null)
    if (!validate()) return
    setSubmitting(true)
    try {
      const order = await api.createOrder({
        customer_name: customerName.trim(),
        phone: normalizeIraqPhone(phone),
        governorate,
        district: district.trim(),
        landmark: landmark.trim() || null,
        notes: notes.trim() || null,
        items: items.map((it) => ({
          product_id: it.product_id,
          slug: it.slug,
          name_ar: it.name_ar,
          price: it.price,
          quantity: it.quantity,
          image_url: it.image_url,
        })),
      })
      clear()
      setSuccessNo(order.order_number)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'تعذّر إرسال الطلب'
      if (msg === 'invalid_phone') setErrors((p) => ({ ...p, phone: 'رقم هاتف غير صالح' }))
      else if (msg === 'invalid_governorate')
        setErrors((p) => ({ ...p, governorate: 'محافظة غير صالحة' }))
      else if (msg === 'invalid_name') setErrors((p) => ({ ...p, customerName: 'الاسم غير صالح' }))
      else if (msg === 'invalid_district') setErrors((p) => ({ ...p, district: 'منطقة غير صالحة' }))
      else if (msg === 'empty_cart') setApiError('السلّة فارغة.')
      else setApiError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="section py-6 sm:py-10">
      <header className="mx-auto max-w-6xl">
        <h1 className="heading text-xl md:text-2xl">إتمام الطلب</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-reno-600 dark:text-reno-400">
          املأ الحقول أدناه بترتيب واضح. أجور التوصيل الثابتة:{' '}
          <span className="font-black text-reno-900 dark:text-white">
            {formatPrice(deliveryFeeIqd)}
          </span>
          — الدفع عند الاستلام.
        </p>
      </header>

      <form
        onSubmit={onSubmit}
        className="mx-auto mt-8 grid max-w-6xl gap-8 lg:grid-cols-3 lg:items-start"
        noValidate
      >
        <div className="space-y-6 lg:col-span-2">
          <FormSection
            icon={<User className="h-5 w-5" />}
            title="بيانات العميل"
            subtitle="الاسم ورقم الهاتف لتوصيل الطلب والتواصل معك."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <OutlinedInput
                id="checkout-name"
                label="الاسم الكامل"
                value={customerName}
                onChange={setCustomerName}
                error={errors.customerName}
                placeholder="مثال: حسين سعد"
                autoComplete="name"
                className="sm:col-span-2"
              />
              <OutlinedInput
                id="checkout-phone"
                label="رقم الهاتف"
                value={phone}
                onChange={(v) => setPhone(normalizeIraqPhone(v))}
                error={errors.phone}
                hint="١١ رقماً، يبدأ بـ 07"
                placeholder="07XXXXXXXXX"
                dir="ltr"
                type="tel"
                inputMode="numeric"
                maxLength={11}
                autoComplete="tel"
                icon={<Phone className="h-4 w-4" />}
                className="sm:col-span-2"
              />
            </div>
          </FormSection>

          <FormSection
            icon={<MapPin className="h-5 w-5" />}
            title="عنوان التوصيل"
            subtitle="المحافظة ثم المنطقة بدقة ليصل المندوب بسهولة."
          >
            <div className="grid gap-4">
              <OutlinedSelect
                id="checkout-governorate"
                label="المحافظة"
                value={governorate}
                onChange={setGovernorate}
                error={errors.governorate}
                placeholderOption="— اختر المحافظة —"
                options={IRAQ_GOVERNORATES.map((g) => ({ value: g, label: g }))}
              />
              <OutlinedInput
                id="checkout-district"
                label="المنطقة / القضاء / الناحية"
                value={district}
                onChange={setDistrict}
                error={errors.district}
                placeholder="مثال: الكرادة، المنصور، الحمزة…"
                autoComplete="address-level2"
              />
              <OutlinedInput
                id="checkout-landmark"
                label="أقرب نقطة دالّة (اختياري)"
                value={landmark}
                onChange={setLandmark}
                placeholder="بجانب مول، مقابل مسجد…"
              />
              <OutlinedTextarea
                id="checkout-notes"
                label="ملاحظات التوصيل (اختياري)"
                value={notes}
                onChange={setNotes}
                placeholder="أي تفاصيل إضافية للمندوب"
                rows={3}
              />
            </div>
          </FormSection>

          {apiError && (
            <p
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-950/40 dark:text-red-200"
              role="alert"
            >
              {apiError}
            </p>
          )}
        </div>

        <aside className="h-fit rounded-2xl border border-reno-200 bg-reno-50/50 p-5 dark:border-reno-800 dark:bg-reno-900/40 lg:sticky lg:top-24">
          <h2 className="text-base font-black text-reno-900 dark:text-white">ملخّص الطلب</h2>
          <ul className="mt-4 max-h-72 space-y-3 overflow-y-auto text-sm">
            {items.map((it) => (
              <li
                key={it.product_id}
                className="flex gap-3 border-b border-reno-200 pb-3 last:border-0 last:pb-0 dark:border-reno-700"
              >
                <Link
                  to={`/products/${encodeURIComponent(it.slug)}`}
                  className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-reno-200 bg-reno-100 dark:border-reno-700 dark:bg-reno-800"
                  aria-label={`عرض ${it.name_ar}`}
                >
                  {it.image_url ? (
                    <img
                      src={it.image_url}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-reno-400">
                      <PackageOpen className="h-5 w-5" />
                    </span>
                  )}
                </Link>
                <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
                  <div className="min-w-0 leading-snug text-reno-700 dark:text-reno-200">
                    <Link
                      to={`/products/${encodeURIComponent(it.slug)}`}
                      className="line-clamp-2 font-bold text-reno-900 hover:underline dark:text-white"
                    >
                      {it.name_ar}
                    </Link>
                    <span className="mt-0.5 block text-xs text-reno-500">الكمية ×{it.quantity}</span>
                  </div>
                  <span className="shrink-0 font-black tabular-nums text-reno-900 dark:text-white">
                    {formatPrice(it.price * it.quantity)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-reno-200 pt-4 text-sm dark:border-reno-700">
            <div className="flex justify-between gap-2">
              <dt className="text-reno-600 dark:text-reno-400">المجموع الفرعي</dt>
              <dd className="font-bold tabular-nums text-reno-900 dark:text-white">
                {formatPrice(subtotal)}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-reno-600 dark:text-reno-400">التوصيل</dt>
              <dd className="font-bold tabular-nums text-reno-900 dark:text-white">
                {formatPrice(deliveryFeeIqd)}
              </dd>
            </div>
          </dl>
          <div className="mt-4 flex items-center justify-between gap-2 border-t border-reno-200 pt-4 dark:border-reno-700">
            <span className="text-sm font-bold text-reno-600 dark:text-reno-400">الإجمالي</span>
            <span className="text-lg font-black tabular-nums text-reno-900 dark:text-white sm:text-xl">
              {formatPrice(totalWithDelivery)}
            </span>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary mt-5 w-full justify-center rounded-xl py-3.5 text-sm font-bold disabled:opacity-60 sm:py-4 sm:text-base"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جارٍ الإرسال…
              </>
            ) : (
              'تأكيد الطلب'
            )}
          </button>
          <p className="mt-3 text-center text-xs text-reno-500 dark:text-reno-400">
            الدفع عند الاستلام — لا نطلب بطاقة بنكية.
          </p>
        </aside>
      </form>
    </section>
  )
}

function FormSection({
  icon,
  title,
  subtitle,
  children,
}: {
  icon?: ReactNode
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-reno-200 bg-white p-5 shadow-sm dark:border-reno-800 dark:bg-reno-900/60 sm:p-6">
      <div className="mb-5 flex gap-3 border-b border-reno-100 pb-4 dark:border-reno-800">
        {icon && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-reno-100 text-reno-600 dark:bg-reno-800 dark:text-reno-300">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h2 className="text-base font-black text-reno-900 dark:text-white">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-xs leading-relaxed text-reno-500 dark:text-reno-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {children}
    </section>
  )
}

function OutlinedInput({
  id: propId,
  label,
  value,
  onChange,
  error,
  hint,
  icon,
  className = '',
  ...rest
}: {
  id?: string
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
  hint?: string
  icon?: ReactNode
  className?: string
} & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'id'
>) {
  const uid = useId()
  const id = propId ?? uid
  const err = !!error

  return (
    <div className={['min-w-0', className].filter(Boolean).join(' ')}>
      <div
        className={[
          'relative rounded-xl border-2 bg-white px-3 transition-colors dark:bg-reno-950/80',
          err
            ? 'border-red-400 dark:border-red-500'
            : 'border-reno-200 focus-within:border-reno-500 dark:border-reno-600 dark:focus-within:border-reno-400',
        ].join(' ')}
      >
        <label
          htmlFor={id}
          className="absolute -top-2.5 right-3 z-10 max-w-[calc(100%-1.5rem)] truncate bg-white px-1 text-xs font-bold text-reno-800 dark:bg-reno-950/95 dark:text-reno-100"
        >
          {label}
        </label>
        <div className="relative flex items-center">
          {icon && (
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-reno-400">
              {icon}
            </span>
          )}
          <input
            id={id}
            {...rest}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={[
              'min-h-[2.75rem] w-full border-0 bg-transparent py-2 text-base outline-none',
              icon ? 'pl-2 pr-9' : 'px-0',
              'placeholder:text-reno-400 dark:placeholder:text-reno-500',
            ].join(' ')}
          />
        </div>
      </div>
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-reno-500 dark:text-reno-400">{hint}</p>
      ) : null}
    </div>
  )
}

function OutlinedSelect({
  id: propId,
  label,
  value,
  onChange,
  error,
  options,
  placeholderOption,
}: {
  id?: string
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
  options: { value: string; label: string }[]
  placeholderOption: string
}) {
  const uid = useId()
  const id = propId ?? uid
  const err = !!error

  return (
    <div className="min-w-0">
      <div
        className={[
          'relative rounded-xl border-2 bg-white px-3 pt-1 pb-0.5 transition-colors dark:bg-reno-950/80',
          err
            ? 'border-red-400 dark:border-red-500'
            : 'border-reno-200 focus-within:border-reno-500 dark:border-reno-600 dark:focus-within:border-reno-400',
        ].join(' ')}
      >
        <label
          htmlFor={id}
          className="absolute -top-2.5 right-3 z-10 bg-white px-1 text-xs font-bold text-reno-800 dark:bg-reno-950/95 dark:text-reno-100"
        >
          {label}
        </label>
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[2.75rem] w-full cursor-pointer border-0 bg-transparent py-2 text-base outline-none dark:text-white"
        >
          <option value="">{placeholderOption}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}

function OutlinedTextarea({
  id: propId,
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  id?: string
  label: string
  value: string
  onChange: (v: string) => void
  rows?: number
  placeholder?: string
}) {
  const uid = useId()
  const id = propId ?? uid

  return (
    <div className="min-w-0">
      <div className="relative rounded-xl border-2 border-reno-200 bg-white px-3 pt-2 pb-2 transition-colors focus-within:border-reno-500 dark:border-reno-600 dark:bg-reno-950/80 dark:focus-within:border-reno-400">
        <label
          htmlFor={id}
          className="absolute -top-2.5 right-3 z-10 bg-white px-1 text-xs font-bold text-reno-800 dark:bg-reno-950/95 dark:text-reno-100"
        >
          {label}
        </label>
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="mt-1 w-full resize-y border-0 bg-transparent text-base outline-none placeholder:text-reno-400 dark:placeholder:text-reno-500"
        />
      </div>
    </div>
  )
}
