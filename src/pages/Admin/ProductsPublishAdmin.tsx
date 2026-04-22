import { useEffect, useState, type FormEvent } from 'react'
import { CheckCircle2, Loader2, Plus } from 'lucide-react'
import { api, type Category } from '../../lib/api'
import ImageUploader from '../../components/ImageUploader'

interface Props {
  onPublished?: () => void
}

export default function ProductsPublishAdmin({ onPublished }: Props) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCats, setLoadingCats] = useState(true)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState(0)
  const [categoryId, setCategoryId] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPublishedOk, setShowPublishedOk] = useState(false)

  useEffect(() => {
    if (!showPublishedOk) return
    const t = window.setTimeout(() => setShowPublishedOk(false), 6000)
    return () => window.clearTimeout(t)
  }, [showPublishedOk])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoadingCats(true)
      try {
        const cats = await api.getCategories()
        if (!cancelled) setCategories(cats)
      } catch {
        if (!cancelled) setCategories([])
      } finally {
        if (!cancelled) setLoadingCats(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (images.length === 0) {
      if (!confirm('لم ترفع أي صورة — هل تريد النشر بدون صور؟')) return
    }
    setSaving(true)
    setShowPublishedOk(false)
    try {
      await api.createProduct({
        name_ar: name,
        description: description || null,
        price: Number(price),
        currency: 'IQD',
        stock,
        image_url: images[0] ?? null,
        images,
        category_id: categoryId || null,
        is_active: isActive,
      })
      setName('')
      setDescription('')
      setPrice('')
      setStock(0)
      setCategoryId('')
      setImages([])
      setIsActive(true)
      setShowPublishedOk(true)
      onPublished?.()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'فشل الحفظ')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4">
        <h2 className="heading text-lg">نشر منتج جديد</h2>
        <p className="mt-1 text-sm text-reno-600 dark:text-reno-400">
          أدخل بيانات المنتج وارفع الصور ثم انشره في المتجر.
        </p>
      </div>

      <form onSubmit={onSubmit} className="panel space-y-4">
        {showPublishedOk && (
          <div
            className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-bold text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-100"
            role="status"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            تم نشر المنتج
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-sm font-bold">صور المنتج</label>
          <ImageUploader value={images} onChange={setImages} multiple label="صور" />
          <p className="text-xs text-reno-500">
            يمكنك رفع عدّة صور. الأولى هي الصورة الرئيسية.
          </p>
        </div>

        <Field label="اسم المنتج" value={name} onChange={setName} required />

        <div className="space-y-1.5">
          <label className="block text-sm font-bold">الوصف</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-reno-200 bg-white px-4 py-2.5 text-base outline-none focus:border-reno-500 focus:ring-2 focus:ring-reno-500/30 dark:border-reno-700 dark:bg-reno-900 sm:text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
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
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-bold">الفئة</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={loadingCats}
            className="w-full rounded-xl border border-reno-200 bg-white px-4 py-2.5 text-base outline-none focus:border-reno-500 focus:ring-2 focus:ring-reno-500/30 disabled:opacity-60 dark:border-reno-700 dark:bg-reno-900 sm:text-sm"
          >
            <option value="">— اختر فئة —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name_ar}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 accent-reno-600"
          />
          نشر المنتج (ظاهر في المتجر)
        </label>

        <button type="submit" className="btn-primary w-full" disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          نشر المنتج
        </button>
      </form>
    </div>
  )
}

interface FieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  required?: boolean
}

function Field({ label, value, onChange, type = 'text', required }: FieldProps) {
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
