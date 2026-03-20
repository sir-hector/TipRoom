import { getTournamentWithMatches } from '@/app/actions/tournaments'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button-variants'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { notFound } from 'next/navigation'

type MatchStatus = 'SCHEDULED' | 'LOCKED' | 'LIVE' | 'FINISHED' | 'CANCELLED' | 'POSTPONED'

const statusStyles: Record<MatchStatus, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-700',
  LOCKED: 'bg-amber-100 text-amber-700',
  LIVE: 'bg-green-100 text-green-700',
  FINISHED: 'bg-slate-100 text-slate-600',
  CANCELLED: 'bg-red-100 text-red-600',
  POSTPONED: 'bg-orange-100 text-orange-600',
}

function formatKickoff(date: Date): string {
  const day = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  return `${day}, ${time}`
}

function formatOdds(home: number | null, draw: number | null, away: number | null): string {
  if (home == null && draw == null && away == null) return '—'
  const fmt = (n: number | null) => (n != null ? n.toFixed(2) : '—')
  return `${fmt(home)} / ${fmt(draw)} / ${fmt(away)}`
}

export default async function TournamentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tournament = await getTournamentWithMatches(slug)

  if (!tournament) notFound()

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8">
      <nav className="text-muted-foreground mb-4 flex items-center gap-1.5 text-sm">
        <Link href="/admin" className="hover:text-foreground transition-colors">
          Admin
        </Link>
        <span>→</span>
        <span className="text-foreground font-medium">{tournament.name}</span>
      </nav>

      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{tournament.name}</h1>
        <Link
          href={`/admin/tournaments/${slug}/matches/new`}
          className={cn(buttonVariants({ variant: 'default' }))}
        >
          Add Match
        </Link>
      </div>

      {tournament.matches.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center text-sm">
          No matches yet. Add the first one.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Home</TableHead>
                <TableHead>Away</TableHead>
                <TableHead>Kickoff</TableHead>
                <TableHead>Odds (H/D/A)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tournament.matches.map((match) => (
                <TableRow key={match.id}>
                  <TableCell className="font-medium">{match.homeTeam}</TableCell>
                  <TableCell className="font-medium">{match.awayTeam}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatKickoff(match.kickoffAt)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatOdds(match.homeOdds, match.drawOdds, match.awayOdds)}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn('border-0', statusStyles[match.status as MatchStatus])}>
                      {match.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {match.status === 'FINISHED' &&
                    match.homeScore != null &&
                    match.awayScore != null
                      ? `${match.homeScore} – ${match.awayScore}`
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/matches/${match.id}/edit`}
                      className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                    >
                      Edit
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </main>
  )
}
