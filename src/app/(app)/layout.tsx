import { isAppAdmin } from '@/lib/auth'
import { Providers } from '@/components/providers'
import { AppNav } from '@/components/app-nav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const admin = await isAppAdmin()

  return (
    <div className="bg-background min-h-screen">
      <AppNav isAdmin={admin} />
      {/* Offset for sidebar on desktop, bottom nav on mobile */}
      <div className="pb-14 md:pb-0 md:pl-56">
        <Providers>{children}</Providers>
      </div>
    </div>
  )
}
