import { useEffect, useState, type FormEvent } from 'react'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { api, type Category } from '../../lib/api'
import ImageUploader from '../../components/ImageUploader'

export default function CategoriesAdmin() {
  const [items, setItems] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [name_ar, setNameAr] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState<string[]>([])
  const [sortOrder, setSortOrder] = useState(0)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await api.getCategories()
      setItems(data)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.createCategory({
        name_ar,
        description: description || null,
        image_url: imageUrl[0] ?? null,
        sort_order: sortOrder,
      })
      setNameAr('')
      setDescription('')
      setImageUrl([])
      setSortOrder(0)
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'فشل الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (id: string) => {
    if (!confirm('حذف هذا القسم؟')) return
    try {
      await api.deleteCategory(id)
      setItems((prev) => prev.filter((c) => c.id !== id))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'فشل الحذف')
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
      <form onSubmit={onSubmit} className="panel space-y-4">
        <h2 className="heading text-lg">إضافة فئة جديدة</h2>

        <div className="space-y-1.5">
          <label className="block text-sm font-bold">صورة الفئة (دائرية)</label>
          <ImageUploader
            value={imageUrl}
            onChange={setImageUrl}
            single
            circular
            label="صورة"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-bold">اسم الفئة</label>
          <input
            required
            value={name_ar}
            onChange={(e) => setNameAr(e.target.value)}
            className="w-full rounded-xl border border-reno-200 bg-white px-4 py-2.5 text-base outline-none focus:border-reno-500 focus:ring-2 focus:ring-reno-500/30 dark:border-reno-700 dark:bg-reno-900 sm:text-sm"
            placeholder="مثال: الخيام"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-bold">الوصف (اختياري)</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-reno-200 bg-white px-4 py-2.5 text-base outline-none focus:border-reno-500 focus:ring-2 focus:ring-reno-500/30 dark:border-reno-700 dark:bg-reno-900 sm:text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-bold">ترتيب العرض</label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
            className="w-full rounded-xl border border-reno-200 bg-white px-4 py-2.5 text-base outline-none focus:border-reno-500 focus:ring-2 focus:ring-reno-500/30 dark:border-reno-700 dark:bg-reno-900 sm:text-sm"
          />
        </div>

        <button type="submit" className="btn-primary w-full" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          نشر الفئة
        </button>
      </form>

      <div className="panel space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="heading text-lg">الفئات المنشورة</h2>
          <span className="chip">{items.length}</span>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-reno-600">
            <Loader2 className="h-4 w-4 animate-spin" /> جارٍ التحميل…
          </div>
        )}
        {error && <div className="text-sm text-red-600">{error}</div>}

        {!loading && items.length === 0 && (
          <p className="text-sm text-reno-600 dark:text-reno-300">
            لم تُضف أي فئة بعد.
          </p>
        )}

        <ul className="divide-y divide-reno-100 dark:divide-reno-800">
          {items.map((c) => (
            <li key={c.id} className="flex items-center gap-3 py-3">
              {c.image_url ? (
                <img
                  src={c.image_url}
                  alt=""
                  className="h-12 w-12 rounded-full border border-reno-200 object-cover dark:border-reno-700"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-reno-100 text-reno-500 dark:bg-reno-800">
                  —
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold">{c.name_ar}</div>
                <div className="truncate text-xs text-reno-500" dir="ltr">
                  /{c.slug}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onDelete(c.id)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                aria-label="حذف"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
