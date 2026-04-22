'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'

export function TopBar() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
      <span className="font-serif text-xl text-stone-900 dark:text-stone-100">
        Les Tsabloz
      </span>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
        >
          Logout
        </Button>
      </div>
    </header>
  )
}
