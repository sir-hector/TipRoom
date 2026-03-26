'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HomeIcon, PlusCircleIcon, LogInIcon, ShieldIcon } from 'lucide-react'
import { UserButton } from '@clerk/nextjs'
import { Logo } from '@/components/logo'
import { cn } from '@/lib/utils'

const BASE_ITEMS = [
  { href: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
  { href: '/rooms/new', icon: PlusCircleIcon, label: 'Create Room' },
  { href: '/rooms/join', icon: LogInIcon, label: 'Join Room' },
]

interface AppNavProps {
  isAdmin: boolean
}

export function AppNav({ isAdmin }: AppNavProps) {
  const pathname = usePathname()

  const items = [
    ...BASE_ITEMS,
    ...(isAdmin ? [{ href: '/admin', icon: ShieldIcon, label: 'Admin' }] : []),
  ]

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r bg-white md:flex">
        <div className="flex h-14 items-center gap-2 border-b px-4 font-semibold">
          <Logo />
          <span>TipRoom</span>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3 pt-4">
          {items.map(({ href, icon: Icon, label }) => {
            const active = href === '/admin' ? pathname.startsWith('/admin') : pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t p-4">
          <UserButton />
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-white md:hidden">
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
