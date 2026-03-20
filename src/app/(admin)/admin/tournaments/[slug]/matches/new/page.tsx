import { getTournamentWithMatches } from '@/app/actions/tournaments'
import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AddMatchForm } from './add-match-form'

export default async function NewMatchPage({ params }: { params: Promise<{ slug: string }> }) {
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
        <Link
          href={`/admin/tournaments/${slug}`}
          className="hover:text-foreground transition-colors"
        >
          {tournament.name}
        </Link>
        <span>→</span>
        <span className="text-foreground font-medium">Add Match</span>
      </nav>

      <h1 className="mb-6 text-2xl font-bold">Add Match</h1>

      <AddMatchForm
        tournamentId={tournament.id}
        tournamentSlug={slug}
        tournamentName={tournament.name}
      />

      <div className="mt-4">
        <Link
          href={`/admin/tournaments/${slug}`}
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
        >
          ← Back to {tournament.name}
        </Link>
      </div>
    </main>
  )
}
