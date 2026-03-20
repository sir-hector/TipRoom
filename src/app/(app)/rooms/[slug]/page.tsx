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

export default async function RoomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getRoomData(slug)

  if (!data) {
    redirect('/dashboard')
  }

  const { room, matches } = data

  const activeMatches = matches.filter((m) => !FINISHED_STATUSES.has(m.status))
  const finishedMatches = matches.filter((m) => FINISHED_STATUSES.has(m.status))

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

      {/* Match list */}
      {matches.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center">
          No matches yet for this tournament.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {activeMatches.map((match) => (
            <MatchCard key={match.id} match={match} roomId={room.id} roomSlug={room.slug} />
          ))}

          {finishedMatches.length > 0 && activeMatches.length > 0 && (
            <div className="border-t pt-2">
              <p className="text-muted-foreground mb-3 text-xs font-medium tracking-wider uppercase">
                Finished
              </p>
            </div>
          )}

          {finishedMatches.map((match) => (
            <MatchCard key={match.id} match={match} roomId={room.id} roomSlug={room.slug} />
          ))}
        </div>
      )}
    </main>
  )
}
