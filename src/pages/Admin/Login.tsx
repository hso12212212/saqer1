import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate, type Location } from 'react-router-dom'
import { Loader2, Lock, LogIn, Mail } from 'lucide-react'
import FalconLogo from '../../components/FalconLogo'
import { useAuth } from '../../context/AuthContext'
import { ApiError } from '../../lib/api'

function loginErrorMessage(err: unknown): string {
  const status = err instanceof ApiError ? err.status : undefined
  const code =
    err instanceof ApiError
      ? err.message
      : err instanceof Error
        ? err.message
        : ''
  const lower = code.toLowerCase()

  if (
    status === 401 ||
    code === 'invalid_credentials' ||
    lower.includes('invalid_credentials') ||
    lower === 'unauthorized' ||
    /^api\s*401$/.test(lower)
  ) {
    return 'البريد أو كلمة المرور غير صحيحة'
  }
  if (status === 400 || code === 'invalid_body') {
    return 'يرجى إدخال البريد الإلكتروني وكلمة المرور بشكل صحيح'
  }
  if (code && code !== `API ${status}`) return code
  return 'تعذّر تسجيل الدخول. تحقّق من الاتصال وحاول مرة أخرى.'
}

interface LocationState {
  from?: Location
}

export default function AdminLogin() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null
  const redirectTo = state?.from?.pathname ?? '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (isAuthenticated) {
    navigate(redirectTo, { replace: true })
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(loginErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="section flex min-h-[80vh] items-center justify-center py-14">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <FalconLogo size={72} />
          <h1 className="heading text-2xl">دخول المشرف</h1>
          <p className="text-sm text-reno-600 dark:text-reno-300">
            لوحة تحكّم متجر الصقر
          </p>
        </div>

        <form onSubmit={onSubmit} className="panel space-y-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-900/30 dark:text-red-200">
              {error}
            </div>
          )}

          <label className="block space-y-1.5">
            <span className="text-sm font-bold">البريد الإلكتروني</span>
            <div className="relative">
              <Mail className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-reno-400" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-reno-200 bg-white py-2.5 pl-4 pr-10 text-base outline-none transition-colors focus:border-reno-500 focus:ring-2 focus:ring-reno-500/30 dark:border-reno-700 dark:bg-reno-900 sm:text-sm"
                placeholder="admin@example.com"
                dir="ltr"
              />
            </div>
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-bold">كلمة المرور</span>
            <div className="relative">
              <Lock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-reno-400" />
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-reno-200 bg-white py-2.5 pl-4 pr-10 text-base outline-none transition-colors focus:border-reno-500 focus:ring-2 focus:ring-reno-500/30 dark:border-reno-700 dark:bg-reno-900 sm:text-sm"
                dir="ltr"
              />
            </div>
          </label>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            دخول
          </button>
        </form>
      </div>
    </section>
  )
}
