import { getAdminTournaments } from '@/app/actions/tournaments'
import { Card, CardHeader, CardTitle, CardDescription, CardAction } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button-variants'
import Link from 'next/link'
import { cn } from '@/lib/utils'

function formatDateRange(start: Date, end: Date): string {
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
  return `${start.toLocaleDateString('en-GB', opts)} – ${end.toLocaleDateString('en-GB', opts)}`
}

export default async function AdminPage() {
  const tournaments = await getAdminTournaments()

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold">Admin Panel</h1>
      <p className="text-muted-foreground mt-1 mb-6">Manage tournaments and matches.</p>

      <div className="flex flex-col gap-3">
        {tournaments.map((t) => (
          <Link key={t.id} href={`/admin/tournaments/${t.slug}`} className="block">
            <Card className="hover:ring-foreground/20 transition-shadow">
              <CardHeader>
                <CardTitle>{t.name}</CardTitle>
                <CardDescription>
                  {t.slug} · {t.season}
                  <br />
                  {formatDateRange(t.startDate, t.endDate)} · {t._count.matches} match
                  {t._count.matches !== 1 ? 'es' : ''}
                </CardDescription>
                <CardAction>
                  <span
                    className={cn(
                      buttonVariants({ variant: 'ghost', size: 'icon' }),
                      'text-muted-foreground',
                    )}
                    aria-hidden
                  >
                    →
                  </span>
                </CardAction>
              </CardHeader>
            </Card>
          </Link>
        ))}

        {tournaments.length === 0 && (
          <p className="text-muted-foreground text-sm">No tournaments found.</p>
        )}
      </div>
    </main>
  )
}
