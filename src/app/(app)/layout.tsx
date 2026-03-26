import { isAppAdmin } from '@/lib/auth'
import { Providers } from '@/components/providers'
import { AppNav } from '@/components/app-nav'
import { SidebarProvider } from '@/components/sidebar-context'
import { SidebarInset } from '@/components/sidebar-inset'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const admin = await isAppAdmin()

  return (
    <div className="bg-background min-h-screen">
      <SidebarProvider>
        <AppNav isAdmin={admin} />
        <SidebarInset>
          <Providers>{children}</Providers>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
