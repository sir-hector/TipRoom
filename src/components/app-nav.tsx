'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HomeIcon, PlusCircleIcon, LogInIcon, ShieldIcon, SunIcon, MoonIcon } from 'lucide-react'
import { UserButton } from '@clerk/nextjs'
import { Logo } from '@/components/logo'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'

const BASE_ITEMS = [
  { href: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
  { href: '/rooms/new', icon: PlusCircleIcon, label: 'Create Room' },
  { href: '/rooms/join', icon: LogInIcon, label: 'Join Room' },
]

interface AppNavProps {
  isAdmin: boolean
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
      aria-label="Toggle theme"
    >
      <SunIcon className="h-4 w-4 dark:hidden" />
      <MoonIcon className="hidden h-4 w-4 dark:block" />
    </button>
  )
}

export function AppNav({ isAdmin }: AppNavProps) {
  const pathname = usePathname()

  const items = [
    ...BASE_ITEMS,
    ...(isAdmin ? [{ href: '/admin', icon: ShieldIcon, label: 'Admin' }] : []),
  ]

  return (
    <>
      {/* Desktop sidebar — always dark */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col bg-slate-950 md:flex">
        <div className="flex h-14 items-center gap-2.5 border-b border-white/10 px-4">
          <Logo />
          <span className="font-semibold text-white">TipRoom</span>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 p-3 pt-4">
          {items.map(({ href, icon: Icon, label }) => {
            const active = href === '/admin' ? pathname.startsWith('/admin') : pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary/20 text-primary'
                    : 'text-slate-400 hover:bg-white/8 hover:text-white',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center justify-between border-t border-white/10 p-4">
          <UserButton />
          <ThemeToggle />
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="bg-background fixed inset-x-0 bottom-0 z-30 border-t md:hidden">
        <div className="flex h-14 items-center justify-around">
          {items.map(({ href, icon: Icon, label }) => {
            const active = href === '/admin' ? pathname.startsWith('/admin') : pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-medium transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
