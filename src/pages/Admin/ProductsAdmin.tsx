import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LayoutList, PackagePlus } from 'lucide-react'
import ProductsListAdmin from './ProductsListAdmin'
import ProductsPublishAdmin from './ProductsPublishAdmin'

type ProductsSubTab = 'publish' | 'list'

export default function ProductsAdmin() {
  const [, setSearchParams] = useSearchParams()
  const [sub, setSub] = useState<ProductsSubTab>('list')
  const [listRefresh, setListRefresh] = useState(0)

  const onPublished = () => {
    setListRefresh((n) => n + 1)
    setSub('list')
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev)
        p.set('tab', 'products')
        p.delete('cat')
        return p
      },
      { replace: true },
    )
  }

  return (
    <div className="space-y-5">
      <div
        className="inline-flex flex-wrap gap-1 rounded-xl border border-reno-200 bg-white p-1 dark:border-reno-700 dark:bg-reno-900"
        role="tablist"
        aria-label="أقسام المنتجات"
      >
        <TabBtn
          active={sub === 'list'}
          onClick={() => setSub('list')}
          id="products-tab-list"
          ariaControls="products-panel-list"
        >
          <LayoutList className="h-4 w-4" />
          المنتجات
        </TabBtn>
        <TabBtn
          active={sub === 'publish'}
          onClick={() => setSub('publish')}
          id="products-tab-publish"
          ariaControls="products-panel-publish"
        >
          <PackagePlus className="h-4 w-4" />
          نشر منتج
        </TabBtn>
      </div>

      <div
        id="products-panel-list"
        role="tabpanel"
        hidden={sub !== 'list'}
        aria-labelledby="products-tab-list"
      >
        <ProductsListAdmin refreshToken={listRefresh} />
      </div>

      <div
        id="products-panel-publish"
        role="tabpanel"
        hidden={sub !== 'publish'}
        aria-labelledby="products-tab-publish"
      >
        <ProductsPublishAdmin onPublished={onPublished} />
      </div>
    </div>
  )
}

function TabBtn({
  active,
  onClick,
  children,
  id,
  ariaControls,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  id: string
  ariaControls: string
}) {
  return (
    <button
      type="button"
      id={id}
      role="tab"
      aria-selected={active}
      aria-controls={ariaControls}
      tabIndex={active ? 0 : -1}
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
