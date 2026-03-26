import { isAppAdmin } from '@/lib/auth'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Logo } from '@/components/logo'
import { ArrowLeftIcon } from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAppAdmin())) redirect('/dashboard')

  return (
    <div className="bg-background min-h-screen">
      <nav className="border-b bg-white">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <Logo />
              <span>TipRoom</span>
            </Link>
            <span className="text-muted-foreground text-sm">·</span>
            <span className="text-sm font-medium">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm transition-colors"
            >
              <ArrowLeftIcon className="h-3.5 w-3.5" />
              Back to app
            </Link>
            <UserButton />
          </div>
        </div>
      </nav>
      {children}
    </div>
  )
}
