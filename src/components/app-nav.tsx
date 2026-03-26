'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  PlusCircleIcon,
  LogInIcon,
  ShieldIcon,
  SunIcon,
  MoonIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
} from 'lucide-react'
import { UserButton } from '@clerk/nextjs'
import { Logo } from '@/components/logo'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import { useSidebar } from './sidebar-context'

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
      className="text-muted-foreground hover:bg-muted hover:text-foreground flex h-8 w-8 items-center justify-center rounded-md transition-colors"
      aria-label="Toggle theme"
    >
      <SunIcon className="h-4 w-4 dark:hidden" />
      <MoonIcon className="hidden h-4 w-4 dark:block" />
    </button>
  )
}

export function AppNav({ isAdmin }: AppNavProps) {
  const pathname = usePathname()
  const { collapsed, toggle } = useSidebar()

  const items = [
    ...BASE_ITEMS,
    ...(isAdmin ? [{ href: '/admin', icon: ShieldIcon, label: 'Admin' }] : []),
  ]

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'bg-background border-border fixed inset-y-0 left-0 z-30 hidden flex-col border-r transition-[width] duration-300 ease-in-out md:flex',
          collapsed ? 'w-14' : 'w-56',
        )}
      >
        {/* Logo header */}
        <div
          className={cn(
            'border-border flex h-14 shrink-0 items-center border-b transition-all duration-300',
            collapsed ? 'justify-center px-0' : 'gap-2.5 px-4',
          )}
        >
          <Logo />
          {!collapsed && <span className="text-foreground font-semibold">TipRoom</span>}
        </div>

        {/* Nav items */}
        <nav className="flex flex-1 flex-col gap-0.5 overflow-hidden p-2 pt-3">
          {items.map(({ href, icon: Icon, label }) => {
            const active = href === '/admin' ? pathname.startsWith('/admin') : pathname === href
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  collapsed ? 'justify-center' : '',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div
          className={cn(
            'border-border flex shrink-0 items-center border-t p-3',
            collapsed ? 'flex-col gap-2' : 'justify-between',
          )}
        >
          <UserButton />
          <ThemeToggle />
          <button
            onClick={toggle}
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex h-8 w-8 items-center justify-center rounded-md transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <PanelLeftOpenIcon className="h-4 w-4" />
            ) : (
              <PanelLeftCloseIcon className="h-4 w-4" />
            )}
          </button>
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
