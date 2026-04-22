import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ClipboardList,
  LogOut,
  PackagePlus,
  LayoutGrid,
  Settings,
} from 'lucide-react'
import FalconLogo from '../../components/FalconLogo'
import { useAuth } from '../../context/AuthContext'
import CategoriesAdmin from './CategoriesAdmin'
import OrdersAdmin from './OrdersAdmin'
import ProductsAdmin from './ProductsAdmin'
import SettingsAdmin from './SettingsAdmin'

type Tab = 'orders' | 'products' | 'categories' | 'settings'

function tabFromParams(sp: URLSearchParams): Tab {
  const t = sp.get('tab')
  if (t === 'products' || t === 'categories' || t === 'settings') return t
  return 'orders'
}

export default function AdminDashboard() {
  const { email, logout } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const tab = useMemo(() => tabFromParams(searchParams), [searchParams])

  const setTab = useCallback(
    (next: Tab) => {
      setSearchParams(
        (prev) => {
          const p = new URLSearchParams(prev)
          if (next === 'orders') {
            p.delete('tab')
            p.delete('cat')
          } else {
            p.set('tab', next)
            if (next !== 'products') p.delete('cat')
            if (next === 'products') p.delete('cat')
          }
          return p
        },
        { replace: false },
      )
    },
    [setSearchParams],
  )

  return (
    <section className="section py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FalconLogo size={40} />
          <div>
            <h1 className="heading text-lg md:text-xl">لوحة الإدارة</h1>
            <p className="text-xs text-reno-500" dir="ltr">
              {email}
            </p>
          </div>
        </div>
        <button onClick={logout} className="btn-outline text-xs">
          <LogOut className="h-4 w-4" />
          تسجيل خروج
        </button>
      </div>

      <div className="mb-5 inline-flex flex-wrap gap-1 rounded-xl border border-reno-200 bg-white p-1 dark:border-reno-700 dark:bg-reno-900">
        <TabBtn active={tab === 'orders'} onClick={() => setTab('orders')}>
          <ClipboardList className="h-4 w-4" />
          الطلبات
        </TabBtn>
        <TabBtn active={tab === 'products'} onClick={() => setTab('products')}>
          <PackagePlus className="h-4 w-4" />
          المنتجات
        </TabBtn>
        <TabBtn active={tab === 'categories'} onClick={() => setTab('categories')}>
          <LayoutGrid className="h-4 w-4" />
          الفئات
        </TabBtn>
        <TabBtn active={tab === 'settings'} onClick={() => setTab('settings')}>
          <Settings className="h-4 w-4" />
          إعدادات الموقع
        </TabBtn>
      </div>

      {tab === 'orders' && <OrdersAdmin />}
      {tab === 'products' && <ProductsAdmin />}
      {tab === 'categories' && <CategoriesAdmin />}
      {tab === 'settings' && <SettingsAdmin />}
    </section>
  )
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors',
        active
          ? 'bg-reno-100 text-reno-900 dark:bg-reno-100'
          : 'text-reno-700 hover:bg-reno-50 dark:text-reno-100 dark:hover:bg-reno-800/60',
      ].join(' ')}
    >
      {children}
    </button>
  )
}
