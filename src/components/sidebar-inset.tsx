'use client'

import { useSidebar } from './sidebar-context'
import { cn } from '@/lib/utils'

export function SidebarInset({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar()
  return (
    <div
      className={cn(
        'transition-[padding] duration-300 ease-in-out',
        'pb-14 md:pb-0',
        collapsed ? 'md:pl-14' : 'md:pl-56',
      )}
    >
      {children}
    </div>
  )
}
