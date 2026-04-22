import { useEffect, useState, type FormEvent } from 'react'
import { Loader2, Save } from 'lucide-react'
import { api, type HeroSetting } from '../../lib/api'
import ImageUploader from '../../components/ImageUploader'

export default function SettingsAdmin() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const [heroImage, setHeroImage] = useState('')
  const [heroTitle, setHeroTitle] = useState('')
  const [heroSubtitle, setHeroSubtitle] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const s = await api.getSettings()
        const h: HeroSetting = s.hero ?? {}
        setHeroImage(h.image_url ?? '')
        setHeroTitle(h.title ?? 'متجر الصقر')
        setHeroSubtitle(h.subtitle ?? '')
      } catch (e) {
        setMsg(e instanceof Error ? e.message : 'فشل تحميل الإعدادات')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setMsg(null)
    try {
      await api.updateSetting('hero', {
        image_url: heroImage,
        title: heroTitle,
        subtitle: heroSubtitle,
      })
      setMsg('تم الحفظ بنجاح.')
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'فشل الحفظ')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-10 text-reno-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-xs">جارٍ التحميل…</span>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="panel max-w-2xl space-y-5">
      <h3 className="text-base font-bold text-reno-900 dark:text-white">
        صورة الواجهة الرئيسية
      </h3>

      {heroImage && (
        <div className="relative aspect-[21/9] w-full overflow-hidden rounded-xl border border-reno-200 dark:border-reno-700">
          <img src={heroImage} alt="" className="h-full w-full object-cover" />
        </div>
      )}

      <p className="text-[11px] text-reno-500">
        اختر صورة من جهازك — تُرفع إلى الخادم وتُعرض في الواجهة الرئيسية.
      </p>

      <ImageUploader
        value={heroImage ? [heroImage] : []}
        onChange={(arr) => setHeroImage(arr[0] ?? '')}
        single
        label="رفع صورة من الجهاز"
      />

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-1 text-xs">
          <span className="font-bold text-reno-700 dark:text-reno-200">
            عنوان المتجر (يظهر فوق الصورة)
          </span>
          <input
            value={heroTitle}
            onChange={(e) => setHeroTitle(e.target.value)}
            className="input"
          />
        </label>
        <label className="block space-y-1 text-xs">
          <span className="font-bold text-reno-700 dark:text-reno-200">
            نص تحت العنوان
          </span>
          <input
            value={heroSubtitle}
            onChange={(e) => setHeroSubtitle(e.target.value)}
            className="input"
          />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          حفظ الإعدادات
        </button>
        {msg && <span className="text-xs text-reno-500">{msg}</span>}
      </div>
    </form>
  )
}
