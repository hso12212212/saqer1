import { Link } from 'react-router-dom'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-10 border-t border-reno-200 bg-reno-50/80 dark:border-reno-800 dark:bg-reno-900/80">
      <div className="section flex flex-col items-center gap-3 py-5 text-center">
        <div className="flex flex-col gap-1 text-[10px] text-reno-500 dark:text-reno-400">
          <div>© {year} متجر الصقر — جميع الحقوق محفوظة.</div>
          <div className="text-reno-400 dark:text-reno-500">
            تم التطوير بواسطة حسين سعد
          </div>
        </div>

        <div className="h-px w-12 bg-reno-200 dark:bg-reno-700" aria-hidden />

        <div className="flex flex-col gap-0.5">
          <div className="text-xs font-bold text-reno-900 dark:text-white">متجر الصقر</div>
          <div className="text-[10px] font-medium uppercase tracking-wider text-reno-500">
            Saqer Camping
          </div>
        </div>

        <nav aria-label="روابط سريعة">
          <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px]">
            <li>
              <Link to="/products" className="link-muted font-medium">
                المنتجات
              </Link>
            </li>
            <li>
              <Link to="/categories" className="link-muted font-medium">
                الفئات
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  )
}
