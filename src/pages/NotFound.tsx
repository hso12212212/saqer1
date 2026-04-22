import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <section className="section flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <div className="heading text-5xl">404</div>
      <p className="mt-2 text-sm text-reno-500">الصفحة غير موجودة</p>
      <Link to="/" className="btn-primary mt-5 text-xs">
        <Home className="h-4 w-4" />
        الرئيسية
      </Link>
    </section>
  )
}
