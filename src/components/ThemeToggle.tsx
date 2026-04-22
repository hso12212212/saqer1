import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-reno-700 transition-colors hover:bg-reno-100 dark:text-reno-100 dark:hover:bg-reno-800"
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  )
}
