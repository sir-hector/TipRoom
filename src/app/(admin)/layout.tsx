import { isAppAdmin } from '@/lib/auth'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Logo } from '@/components/logo'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAppAdmin())) redirect('/dashboard')

  return (
    <div className="bg-background min-h-screen">
      <nav className="border-b bg-white">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <Logo />
              <span>TipRoom</span>
            </Link>
            <Link
              href="/admin"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Admin
            </Link>
          </div>
          <UserButton />
        </div>
      </nav>
      {children}
    </div>
  )
}
