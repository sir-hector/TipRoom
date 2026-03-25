import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { Providers } from '@/components/providers'
import { Logo } from '@/components/logo'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background min-h-screen">
      <nav className="border-b bg-white">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Logo />
            <span>TipRoom</span>
          </Link>
          <UserButton />
        </div>
      </nav>
      <Providers>{children}</Providers>
    </div>
  )
}
