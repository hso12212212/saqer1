import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-2 text-reno-600">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>جارٍ التحقّق من الجلسة…</span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
