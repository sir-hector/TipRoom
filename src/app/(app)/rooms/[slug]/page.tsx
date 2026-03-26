import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getRoomData } from '@/app/actions/rooms'
import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/utils'
import { MatchCard } from './match-card'

const SCORING_MODE_LABELS: Record<'FIXED' | 'ODDS_BASED' | 'HYBRID', string> = {
  FIXED: 'Fixed',
  ODDS_BASED: 'Odds-based',
  HYBRID: 'Hybrid',
}

const FINISHED_STATUSES = new Set(['FINISHED', 'CANCELLED', 'POSTPONED'])
const PER_PAGE = 10

export default async function RoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ tab?: string; page?: string }>
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams])

  const tab = sp.tab === 'results' ? 'results' : 'upcoming'
  const page = Math.max(1, parseInt(sp.page ?? '1', 10))

  const data = await getRoomData(slug)
  if (!data) redirect('/dashboard')

  const { room, matches } = data

  const upcomingMatches = matches.filter((m) => !FINISHED_STATUSES.has(m.status))
  // Most recent finished first
  const finishedMatches = matches.filter((m) => FINISHED_STATUSES.has(m.status)).reverse()

  const totalPages = Math.max(1, Math.ceil(finishedMatches.length / PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const paginatedFinished = finishedMatches.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)

  const displayMatches = tab === 'results' ? paginatedFinished : upcomingMatches

  const tabBase = `/rooms/${room.slug}`

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      {/* Room header */}
      <div className="mb-6 flex flex-col gap-4">
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'self-start')}
        >
          ← Dashboard
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{room.name}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {room.tournament.name} · {SCORING_MODE_LABELS[room.scoringMode]}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            Invite: <span className="text-foreground font-mono font-medium">{room.inviteCode}</span>
          </p>
        </div>
      </div>

      {/* Page-level tabs: Matches | Leaderboard */}
      <div className="mb-6 flex gap-1 border-b">
        <Link
          href={tabBase}
          className="border-primary text-primary border-b-2 px-4 py-2 text-sm font-medium"
        >
          Matches
        </Link>
        <Link
          href={`/rooms/${room.slug}/leaderboard`}
          className="text-muted-foreground hover:text-foreground px-4 py-2 text-sm font-medium"
        >
          Leaderboard
        </Link>
      </div>

      {matches.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center">
          No matches yet for this tournament.
        </p>
      ) : (
        <>
          {/* Filter tabs: Upcoming | Results */}
          <div className="bg-muted mb-4 flex gap-1 rounded-lg p-1">
            <Link
              href={`${tabBase}?tab=upcoming`}
              className={cn(
                'flex-1 rounded-md px-3 py-1.5 text-center text-sm font-medium transition-colors',
                tab === 'upcoming'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Upcoming{upcomingMatches.length > 0 && ` (${upcomingMatches.length})`}
            </Link>
            <Link
              href={`${tabBase}?tab=results`}
              className={cn(
                'flex-1 rounded-md px-3 py-1.5 text-center text-sm font-medium transition-colors',
                tab === 'results'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Results{finishedMatches.length > 0 && ` (${finishedMatches.length})`}
            </Link>
          </div>

          {/* Match list */}
          {displayMatches.length === 0 ? (
            <p className="text-muted-foreground py-12 text-center text-sm">
              {tab === 'upcoming' ? 'No upcoming matches.' : 'No results yet.'}
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {displayMatches.map((match) => (
                <MatchCard key={match.id} match={match} roomId={room.id} roomSlug={room.slug} />
              ))}
            </div>
          )}

          {/* Pagination (results tab only) */}
          {tab === 'results' && totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between text-sm">
              {safePage > 1 ? (
                <Link
                  href={`${tabBase}?tab=results&page=${safePage - 1}`}
                  className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                >
                  ← Previous
                </Link>
              ) : (
                <span />
              )}
              <span className="text-muted-foreground">
                Page {safePage} of {totalPages}
              </span>
              {safePage < totalPages ? (
                <Link
                  href={`${tabBase}?tab=results&page=${safePage + 1}`}
                  className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                >
                  Next →
                </Link>
              ) : (
                <span />
              )}
            </div>
          )}
        </>
      )}
    </main>
  )
}
