import { getMatchForEdit } from '@/app/actions/tournaments'
import { buttonVariants } from '@/components/ui/button-variants'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { EditOddsForm } from './edit-odds-form'
import { EnterScoreForm } from './enter-score-form'
import { MatchStatusButtons } from './match-status-buttons'

type MatchStatus = 'SCHEDULED' | 'LOCKED' | 'LIVE' | 'FINISHED' | 'CANCELLED' | 'POSTPONED'

const SCORE_EDITABLE_STATUSES: MatchStatus[] = ['SCHEDULED', 'LOCKED', 'LIVE']
const STATUS_BUTTON_STATUSES: MatchStatus[] = ['SCHEDULED', 'LOCKED', 'POSTPONED']

function formatKickoff(date: Date): string {
  const day = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  return `${day}, ${time}`
}

export default async function EditMatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const match = await getMatchForEdit(id)

  if (!match) notFound()

  const status = match.status as MatchStatus
  const showScoreForm = SCORE_EDITABLE_STATUSES.includes(status)
  const showStatusButtons = STATUS_BUTTON_STATUSES.includes(status)

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8">
      <nav className="text-muted-foreground mb-4 flex items-center gap-1.5 text-sm">
        <Link href="/admin" className="hover:text-foreground transition-colors">
          Admin
        </Link>
        <span>→</span>
        <Link
          href={`/admin/tournaments/${match.tournament.slug}`}
          className="hover:text-foreground transition-colors"
        >
          {match.tournament.name}
        </Link>
        <span>→</span>
        <span className="text-foreground font-medium">Edit Match</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {match.homeTeam} vs {match.awayTeam}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">{formatKickoff(match.kickoffAt)}</p>
      </div>

      <div className="flex flex-col gap-8">
        {/* Section 1 — Odds */}
        <section>
          <h2 className="mb-4 text-base font-semibold">Odds</h2>
          <EditOddsForm
            matchId={match.id}
            tournamentSlug={match.tournament.slug}
            homeOdds={match.homeOdds}
            drawOdds={match.drawOdds}
            awayOdds={match.awayOdds}
          />
        </section>

        {showScoreForm && (
          <>
            <Separator />
            <section>
              <h2 className="mb-4 text-base font-semibold">Enter Score</h2>
              <EnterScoreForm matchId={match.id} />
            </section>
          </>
        )}

        {showStatusButtons && (
          <>
            <Separator />
            <section>
              <h2 className="mb-4 text-base font-semibold">Update Status</h2>
              <MatchStatusButtons matchId={match.id} />
            </section>
          </>
        )}
      </div>

      <div className="mt-8">
        <Link
          href={`/admin/tournaments/${match.tournament.slug}`}
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
        >
          ← Back to {match.tournament.name}
        </Link>
      </div>
    </main>
  )
}
