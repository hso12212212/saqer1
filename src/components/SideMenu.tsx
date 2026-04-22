import { useEffect } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import {
  Home,
  LayoutDashboard,
  LayoutGrid,
  LogIn,
  LogOut,
  Moon,
  Package,
  ShoppingBag,
  Sun,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

interface SideMenuProps {
  open: boolean
  onClose: () => void
}

const navLinks = [
  { to: '/', label: 'الرئيسية', icon: Home, end: true },
  { to: '/products', label: 'المنتجات', icon: Package },
  { to: '/categories', label: 'الفئات', icon: LayoutGrid },
  { to: '/cart', label: 'السلة', icon: ShoppingBag },
]

export default function SideMenu({ open, onClose }: SideMenuProps) {
  const { isAuthenticated, email, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  const handleLogout = () => {
    logout()
    onClose()
    navigate('/')
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="القائمة"
      aria-hidden={!open}
      className={[
        'fixed inset-0 z-[60] flex min-h-[100dvh] flex-col bg-white transition-opacity duration-300 ease-out dark:bg-black md:hidden',
        open
          ? 'opacity-100'
          : 'pointer-events-none invisible opacity-0',
      ].join(' ')}
    >
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-reno-200 px-3 py-3 dark:border-reno-800 sm:gap-4 sm:px-6 sm:py-4">
        <Link
          to="/"
          onClick={onClose}
          className="flex min-w-0 items-center"
          aria-label="متجر الصقر — الرئيسية"
        >
          <div className="min-w-0 leading-tight">
            <div className="text-base font-black text-reno-900 dark:text-white sm:text-lg">
              متجر الصقر
            </div>
            <div className="text-[9px] font-medium uppercase tracking-[0.18em] text-reno-500 sm:text-[10px] sm:tracking-[0.2em]">
              Saqer
            </div>
          </div>
        </Link>
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق القائمة"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-reno-700 transition-colors hover:bg-reno-100 dark:text-reno-100 dark:hover:bg-reno-800 sm:h-11 sm:w-11 sm:rounded-xl"
        >
          <X className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.25} />
        </button>
      </div>

      <nav className="flex flex-1 flex-col justify-start overflow-y-auto px-3 pt-2 pb-4 sm:px-8 sm:pt-4 sm:pb-8">
        <ul className="mx-auto flex w-full max-w-lg flex-col gap-1.5 sm:gap-3">
          {navLinks.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.end}
                onClick={onClose}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-black transition-colors sm:gap-4 sm:rounded-2xl sm:px-4 sm:py-4 sm:text-lg md:text-xl',
                    isActive
                      ? 'bg-reno-100 text-reno-900 dark:bg-reno-900 dark:text-white'
                      : 'text-reno-800 hover:bg-reno-50 dark:text-reno-100 dark:hover:bg-reno-900',
                  ].join(' ')
                }
              >
                <l.icon className="h-5 w-5 shrink-0 text-reno-500 dark:text-reno-400 sm:h-7 sm:w-7" />
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="mx-auto mt-6 w-full max-w-lg border-t border-reno-200 pt-5 dark:border-reno-800 sm:mt-10 sm:pt-8">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-reno-800 transition-colors hover:bg-reno-50 dark:text-reno-100 dark:hover:bg-reno-900 sm:gap-4 sm:rounded-2xl sm:px-4 sm:py-4 sm:text-base md:text-lg"
          >
            <span className="flex items-center gap-3 sm:gap-4">
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 shrink-0 text-reno-500 sm:h-7 sm:w-7" />
              ) : (
                <Moon className="h-5 w-5 shrink-0 text-reno-500 sm:h-7 sm:w-7" />
              )}
              {theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}
            </span>
          </button>
        </div>

        <div className="mx-auto mt-4 w-full max-w-lg border-t border-reno-200 pt-5 dark:border-reno-800 sm:mt-6 sm:pt-8">
          <div className="mb-2 px-1 text-[9px] font-bold tracking-normal text-reno-500 sm:mb-3 sm:text-[10px]">
            المشرف
          </div>

          {!isAuthenticated ? (
            <Link
              to="/admin/login"
              onClick={onClose}
              className="flex items-center gap-3 rounded-xl bg-reno-100 px-3 py-2.5 text-sm font-black text-reno-900 transition-colors hover:bg-reno-200 dark:bg-reno-100 dark:hover:bg-white sm:gap-4 sm:rounded-2xl sm:px-4 sm:py-4 sm:text-base md:text-lg"
            >
              <LogIn className="h-5 w-5 shrink-0 sm:h-7 sm:w-7" />
              دخول المشرف
            </Link>
          ) : (
            <div className="space-y-1.5 sm:space-y-2">
              <NavLink
                to="/admin"
                onClick={onClose}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-black transition-colors sm:gap-4 sm:rounded-2xl sm:px-4 sm:py-4 sm:text-base md:text-lg',
                    isActive
                      ? 'bg-reno-100 text-reno-900 dark:bg-reno-900 dark:text-white'
                      : 'text-reno-800 hover:bg-reno-50 dark:text-reno-100 dark:hover:bg-reno-900',
                  ].join(' ')
                }
              >
                <LayoutDashboard className="h-5 w-5 shrink-0 text-reno-500 sm:h-7 sm:w-7" />
                لوحة الإدارة
              </NavLink>
              {email && (
                <div className="truncate px-3 py-0.5 text-[10px] text-reno-500 sm:px-4 sm:text-xs" dir="ltr">
                  {email}
                </div>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950/40 sm:gap-4 sm:rounded-2xl sm:px-4 sm:py-4 sm:text-base md:text-lg"
              >
                <LogOut className="h-5 w-5 shrink-0 sm:h-7 sm:w-7" />
                تسجيل خروج
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="shrink-0 border-t border-reno-200 py-2.5 text-center text-[10px] text-reno-500 dark:border-reno-800 sm:py-4 sm:text-[11px]">
        © متجر الصقر
      </div>
    </div>
  )
}
