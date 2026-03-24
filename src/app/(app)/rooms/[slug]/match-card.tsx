'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { placeBet } from '@/app/actions/bets'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CountdownTimer } from './countdown-timer'

type Bet = {
  matchId: string
  predictedHome: number
  predictedAway: number
  pointsEarned: number | null
  oddsUsed: number | null
}

type Match = {
  id: string
  homeTeam: string
  awayTeam: string
  kickoffAt: Date
  betsLockedAt: Date
  homeScore: number | null
  awayScore: number | null
  status: 'SCHEDULED' | 'LOCKED' | 'LIVE' | 'FINISHED' | 'CANCELLED' | 'POSTPONED'
  homeOdds: number | null
  awayOdds: number | null
  drawOdds: number | null
  bet: Bet | null
}

type MatchCardProps = {
  match: Match
  roomId: string
  roomSlug: string
}

const STATUS_STYLES: Record<Match['status'], string> = {
  SCHEDULED: 'bg-blue-100 text-blue-700',
  LOCKED: 'bg-amber-100 text-amber-700',
  LIVE: 'bg-green-100 text-green-700',
  FINISHED: 'bg-slate-100 text-slate-600',
  CANCELLED: 'bg-red-100 text-red-600',
  POSTPONED: 'bg-orange-100 text-orange-600',
}

function formatKickoff(date: Date): string {
  const d = new Date(date)
  const day = d.getDate()
  const month = d.toLocaleString('en-GB', { month: 'short' })
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  return `${day} ${month}, ${hours}:${minutes}`
}

function SubmitButton({ hasExistingBet }: { hasExistingBet: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? 'Saving…' : hasExistingBet ? 'Update Bet' : 'Place Bet →'}
    </Button>
  )
}

function ScoreInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        className="border-input bg-background hover:bg-muted flex h-9 w-9 items-center justify-center rounded-md border text-base font-medium"
        aria-label="Decrease"
      >
        −
      </button>
      <span className="w-8 text-center font-mono text-lg tabular-nums">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(20, value + 1))}
        className="border-input bg-background hover:bg-muted flex h-9 w-9 items-center justify-center rounded-md border text-base font-medium"
        aria-label="Increase"
      >
        +
      </button>
    </div>
  )
}

export function MatchCard({ match, roomId, roomSlug }: MatchCardProps) {
  const [home, setHome] = useState<number>(match.bet?.predictedHome ?? 0)
  const [away, setAway] = useState<number>(match.bet?.predictedAway ?? 0)
  const [state, formAction] = useActionState(placeBet, null)
  const [isExpired, setIsExpired] = useState(() => new Date(match.betsLockedAt) <= new Date())

  const isActive = match.status === 'SCHEDULED'
  const isFinished = match.status === 'FINISHED'
  const hasExistingBet = match.bet !== null
  const cardMuted = isFinished

  const odds =
    match.homeOdds !== null && match.drawOdds !== null && match.awayOdds !== null
      ? `${match.homeOdds.toFixed(2)} / ${match.drawOdds.toFixed(2)} / ${match.awayOdds.toFixed(2)}`
      : null

  return (
    <Card className={cardMuted ? 'opacity-70' : undefined}>
      <CardContent className="flex flex-col gap-3 pt-4">
        {/* Header row: status badge + kickoff time */}
        <div className="flex items-start justify-between gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[match.status]}`}
          >
            {match.status}
          </span>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-muted-foreground text-xs">{formatKickoff(match.kickoffAt)}</span>
            {isActive && (
              <CountdownTimer
                betsLockedAt={match.betsLockedAt}
                onExpire={() => setIsExpired(true)}
              />
            )}
          </div>
        </div>

        {/* Teams row */}
        <div className="flex items-center justify-center gap-3 py-1">
          <span className="flex-1 text-right text-lg font-semibold">{match.homeTeam}</span>
          {isFinished && match.homeScore !== null && match.awayScore !== null ? (
            <span className="font-mono text-2xl font-bold tabular-nums">
              {match.homeScore} – {match.awayScore}
            </span>
          ) : (
            <span className="text-muted-foreground text-sm font-medium">vs</span>
          )}
          <span className="flex-1 text-left text-lg font-semibold">{match.awayTeam}</span>
        </div>

        {/* Odds row (when available and not finished/cancelled/postponed) */}
        {odds && !isFinished && match.status !== 'CANCELLED' && match.status !== 'POSTPONED' && (
          <p className="text-muted-foreground text-center text-xs">Odds: {odds}</p>
        )}

        {/* Finished: show bet result */}
        {isFinished && match.bet && (
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-muted-foreground">Your bet:</span>
            <span className="font-mono font-medium">
              {match.bet.predictedHome} – {match.bet.predictedAway}
            </span>
            {match.bet.pointsEarned !== null && match.bet.pointsEarned > 0 ? (
              <>
                <span className="text-green-600">✓</span>
                <span className="font-medium text-green-600">+{match.bet.pointsEarned} pts</span>
              </>
            ) : (
              <>
                <span className="text-muted-foreground">✗</span>
                <span className="text-muted-foreground">0 pts</span>
              </>
            )}
          </div>
        )}

        {/* Locked / Cancelled / Postponed with existing bet */}
        {!isActive && !isFinished && match.bet && (
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-muted-foreground">Your bet:</span>
            <span className="font-mono font-medium">
              {match.bet.predictedHome} – {match.bet.predictedAway}
            </span>
          </div>
        )}

        {/* Active but expired client-side: betting closed */}
        {isActive && isExpired && (
          <p className="text-muted-foreground text-center text-sm">Betting closed</p>
        )}

        {/* Active: bet form */}
        {isActive && !isExpired && (
          <form action={formAction} className="flex flex-col gap-3">
            <input type="hidden" name="roomId" value={roomId} />
            <input type="hidden" name="roomSlug" value={roomSlug} />
            <input type="hidden" name="matchId" value={match.id} />
            <input type="hidden" name="predictedHome" value={home} />
            <input type="hidden" name="predictedAway" value={away} />

            <div className="flex items-center justify-center gap-3">
              <ScoreInput value={home} onChange={setHome} />
              <span className="text-muted-foreground text-sm font-medium">—</span>
              <ScoreInput value={away} onChange={setAway} />
            </div>

            {state && 'error' in state && (
              <Alert variant="destructive">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            <div className="flex items-center justify-end gap-2">
              {state && 'success' in state && state.success && (
                <span className="text-sm font-medium text-green-600">✓ Saved</span>
              )}
              <SubmitButton hasExistingBet={hasExistingBet} />
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
