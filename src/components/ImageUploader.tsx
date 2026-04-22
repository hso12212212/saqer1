import { useRef, useState } from 'react'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { api } from '../lib/api'

interface ImageUploaderProps {
  value: string[]
  onChange: (urls: string[]) => void
  multiple?: boolean
  label?: string
  /** صورة دائرية للمعاينة. */
  circular?: boolean
  /** عند true: تُستبدل الصورة بدل إضافتها. */
  single?: boolean
}

export default function ImageUploader({
  value,
  onChange,
  multiple = false,
  label = 'إضافة صور',
  circular = false,
  single = false,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setError(null)
    setUploading(true)
    try {
      const urls = await api.upload(Array.from(files))
      onChange(single ? [urls[0]!] : [...value, ...urls])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل الرفع')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const remove = (url: string) => {
    onChange(value.filter((u) => u !== url))
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        {value.map((url) => (
          <div key={url} className="group relative">
            <img
              src={url}
              alt=""
              className={[
                'border border-reno-200 object-cover dark:border-reno-700',
                circular ? 'h-20 w-20 rounded-full' : 'h-20 w-20 rounded-xl',
              ].join(' ')}
            />
            <button
              type="button"
              onClick={() => remove(url)}
              className="absolute -left-2 -top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white opacity-0 shadow transition-opacity group-hover:opacity-100"
              aria-label="حذف الصورة"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={[
            'flex h-20 w-20 flex-col items-center justify-center gap-1 border-2 border-dashed border-reno-300 text-xs font-bold text-reno-600 transition-colors hover:border-reno-500 hover:bg-reno-50 dark:border-reno-700 dark:text-reno-200 dark:hover:bg-reno-800/50',
            circular ? 'rounded-full' : 'rounded-xl',
          ].join(' ')}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <ImagePlus className="h-5 w-5" />
              <span className="max-w-[4.5rem] text-center leading-tight">
                {single && value.length > 0 ? 'استبدال الصورة' : label}
              </span>
            </>
          )}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={multiple && !single}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}
