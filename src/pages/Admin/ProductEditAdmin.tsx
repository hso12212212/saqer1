import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Loader2, Save } from 'lucide-react'
import { api, type Category } from '../../lib/api'
import ImageUploader from '../../components/ImageUploader'

export default function ProductEditAdmin() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState(0)
  const [categoryId, setCategoryId] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSaved, setShowSaved] = useState(false)

  useEffect(() => {
    if (!showSaved) return
    const t = window.setTimeout(() => setShowSaved(false), 5000)
    return () => window.clearTimeout(t)
  }, [showSaved])

  useEffect(() => {
    if (!id) {
      setLoadError('معرّف المنتج غير صالح')
      setLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setLoadError(null)
      try {
        const [product, cats] = await Promise.all([
          api.getAdminProduct(id),
          api.getCategories(),
        ])
        if (cancelled) return
        setCategories(cats)
        setName(product.name_ar)
        setSlug(product.slug)
        setDescription(product.description ?? '')
        setPrice(String(product.price))
        setStock(product.stock)
        setCategoryId(product.category_id ?? '')
        setImages(Array.isArray(product.images) ? [...product.images] : [])
        setIsActive(product.is_active)
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'تعذّر تحميل المنتج')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!id) return
    if (images.length === 0) {
      if (!confirm('لم تبقَ أي صورة — هل تريد المتابعة بدون صور؟')) return
    }
    setSaving(true)
    setShowSaved(false)
    try {
      await api.updateProduct(id, {
        name_ar: name,
        description: description.trim() || null,
        price: Number(price),
        currency: 'IQD',
        stock,
        image_url: images[0] ?? null,
        images,
        category_id: categoryId || null,
        is_active: isActive,
        ...(slug.trim() ? { slug: slug.trim() } : {}),
      })
      setShowSaved(true)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'فشل الحفظ')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="section flex items-center gap-2 py-16 text-sm text-reno-600 dark:text-reno-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        جارٍ تحميل بيانات المنتج…
      </div>
    )
  }

  if (loadError || !id) {
    return (
      <div className="section py-12">
        <div className="panel mx-auto max-w-lg space-y-4 text-center">
          <p className="text-sm text-red-600 dark:text-red-400">{loadError ?? 'غير موجود'}</p>
          <Link to="/admin?tab=products" className="btn-primary inline-flex text-xs">
            العودة إلى المنتجات
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="section py-6 sm:py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <Link
            to="/admin?tab=products"
            className="inline-flex items-center gap-1 text-xs font-bold text-reno-600 hover:text-reno-900 dark:text-reno-400 dark:hover:text-white"
          >
            <ArrowRight className="h-4 w-4" />
            المنتجات
          </Link>
        </div>

        <div>
          <h1 className="heading text-xl sm:text-2xl">تعديل منتج</h1>
          <p className="mt-1 text-sm text-reno-600 dark:text-reno-400">
            حدّث الصور والبيانات ثم احفظ التغييرات.
          </p>
        </div>

        <form onSubmit={onSubmit} className="panel space-y-6">
          {showSaved && (
            <div
              className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-bold text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-100"
              role="status"
            >
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              تم حفظ التعديلات
            </div>
          )}

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-reno-900 dark:text-white">صور المنتج</h2>
            <ImageUploader value={images} onChange={setImages} multiple label="صور" />
            <p className="text-xs text-reno-500">الأولى هي الصورة الرئيسية في المتجر.</p>
          </section>

          <section className="space-y-4 border-t border-reno-200 pt-6 dark:border-reno-700">
            <h2 className="text-sm font-bold text-reno-900 dark:text-white">الاسم والوصف</h2>
            <Field label="اسم المنتج" value={name} onChange={setName} required />
            <div className="space-y-1.5">
              <label className="block text-sm font-bold">المعرّف في الرابط (slug)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                dir="ltr"
                className="w-full rounded-xl border border-reno-200 bg-white px-4 py-2.5 font-mono text-base outline-none focus:border-reno-500 focus:ring-2 focus:ring-reno-500/30 dark:border-reno-700 dark:bg-reno-900 sm:text-sm"
              />
              <p className="text-xs text-reno-500">
                يُستخدم في عنوان الصفحة. احذف الحروف الخاصة؛ يُنظَّف تلقائياً عند الحفظ.
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-bold">الوصف</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-reno-200 bg-white px-4 py-2.5 text-base outline-none focus:border-reno-500 focus:ring-2 focus:ring-reno-500/30 dark:border-reno-700 dark:bg-reno-900 sm:text-sm"
              />
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3 border-t border-reno-200 pt-6 dark:border-reno-700">
            <Field
              label="السعر (د.ع)"
              value={price}
              onChange={setPrice}
              type="number"
              required
            />
            <Field
              label="المخزون"
              value={String(stock)}
              onChange={(v) => setStock(Number(v) || 0)}
              type="number"
            />
          </section>

          <section className="space-y-1.5 border-t border-reno-200 pt-6 dark:border-reno-700">
            <label className="block text-sm font-bold">الفئة</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-xl border border-reno-200 bg-white px-4 py-2.5 text-base outline-none focus:border-reno-500 focus:ring-2 focus:ring-reno-500/30 dark:border-reno-700 dark:bg-reno-900 sm:text-sm"
            >
              <option value="">— بدون فئة —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name_ar}
                </option>
              ))}
            </select>
          </section>

          <section className="border-t border-reno-200 pt-6 dark:border-reno-700">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 accent-reno-600"
              />
              ظاهر في المتجر
            </label>
          </section>

          <div className="flex flex-col gap-2 border-t border-reno-200 pt-6 dark:border-reno-700 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate('/admin?tab=products')}
              className="btn-outline order-2 w-full sm:order-1 sm:w-auto"
            >
              إلغاء
            </button>
            <button type="submit" className="btn-primary order-1 w-full sm:order-2 sm:w-auto" disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              حفظ التعديلات
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  required?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-bold">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-reno-200 bg-white px-4 py-2.5 text-base outline-none focus:border-reno-500 focus:ring-2 focus:ring-reno-500/30 dark:border-reno-700 dark:bg-reno-900 sm:text-sm"
      />
    </div>
  )
}
