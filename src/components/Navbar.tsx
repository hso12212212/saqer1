import { useEffect, useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Moon,
  ShoppingBag,
  Sun,
} from 'lucide-react'
import SideMenu from './SideMenu'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const links = [
  { to: '/', label: 'الرئيسية', end: true },
  { to: '/products', label: 'المنتجات' },
  { to: '/categories', label: 'الفئات' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { totalItems } = useCart()
  const { theme, toggleTheme } = useTheme()
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const closeIfDesktop = () => {
      if (mq.matches) setMenuOpen(false)
    }
    mq.addEventListener('change', closeIfDesktop)
    closeIfDesktop()
    return () => mq.removeEventListener('change', closeIfDesktop)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const iconBtn =
    'inline-flex h-9 w-9 items-center justify-center rounded-lg text-reno-700 transition-colors hover:bg-reno-100 dark:text-reno-100 dark:hover:bg-reno-800'

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b border-reno-200 bg-white dark:border-reno-800 dark:bg-black">
        <div className="section relative flex h-14 items-center justify-between gap-3">
          <Link
            to="/"
            className="relative z-10 flex items-center"
            aria-label="متجر الصقر — الرئيسية"
          >
            <div className="text-sm font-black tracking-tight text-reno-900 dark:text-white sm:text-base">
              متجر الصقر
            </div>
          </Link>

          <nav className="pointer-events-none absolute inset-0 hidden items-center justify-center gap-1 md:flex">
            <div className="pointer-events-auto flex items-center gap-1">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) =>
                    [
                      'rounded-lg px-3 py-1.5 text-xs font-bold transition-colors',
                      isActive
                        ? 'bg-reno-100 text-reno-900 dark:bg-reno-800 dark:text-white'
                        : 'text-reno-600 hover:bg-reno-100 dark:text-reno-300 dark:hover:bg-reno-800',
                    ].join(' ')
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </div>
          </nav>

          <div className="relative z-10 flex items-center gap-1 md:gap-1.5">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
              className={[iconBtn, 'hidden md:inline-flex'].join(' ')}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            {!isAuthenticated ? (
              <Link
                to="/admin/login"
                aria-label="دخول المشرف"
                className={[iconBtn, 'hidden md:inline-flex'].join(' ')}
              >
                <LogIn className="h-5 w-5" />
              </Link>
            ) : (
              <>
                <NavLink
                  to="/admin"
                  aria-label="لوحة الإدارة"
                  className={({ isActive }) =>
                    [
                      iconBtn,
                      'hidden md:inline-flex',
                      isActive ? 'bg-reno-100 dark:bg-reno-800' : '',
                    ].join(' ')
                  }
                >
                  <LayoutDashboard className="h-5 w-5" />
                </NavLink>
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="تسجيل خروج"
                  className={[iconBtn, 'hidden text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 md:inline-flex'].join(' ')}
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            )}

            <Link
              to="/cart"
              aria-label="السلة"
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-reno-700 transition-colors hover:bg-reno-100 dark:text-reno-100 dark:hover:bg-reno-800"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -left-1 -top-1 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-reno-900 px-1 text-[10px] font-black text-white dark:bg-white dark:text-reno-900">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="فتح القائمة"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-reno-700 transition-colors hover:bg-reno-100 dark:text-reno-100 dark:hover:bg-reno-800 md:hidden"
            >
              <Menu className="h-5 w-5" strokeWidth={2.25} />
            </button>
          </div>
        </div>
      </header>

      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
