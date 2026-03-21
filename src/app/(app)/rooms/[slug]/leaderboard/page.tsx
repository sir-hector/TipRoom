import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getRoomData } from '@/app/actions/rooms'
import { getCurrentUser } from '@/lib/auth'
import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/utils'
import { LeaderboardTable } from './leaderboard-table'

export default async function LeaderboardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [data, currentUser] = await Promise.all([getRoomData(slug), getCurrentUser()])

  if (!data) {
    redirect('/dashboard')
  }

  const { room } = data

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      {/* Room header */}
      <div className="mb-6 flex flex-col gap-4">
        <Link
          href={`/rooms/${slug}`}
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'self-start')}
        >
          ← Back to Matches
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{room.name} — Leaderboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">{room.tournament.name}</p>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="mb-4 flex gap-1 border-b">
        <Link
          href={`/rooms/${slug}`}
          className="text-muted-foreground hover:text-foreground px-4 py-2 text-sm font-medium"
        >
          Matches
        </Link>
        <Link
          href={`/rooms/${slug}/leaderboard`}
          className="border-primary text-primary border-b-2 px-4 py-2 text-sm font-medium"
        >
          Leaderboard
        </Link>
      </div>

      {/* Leaderboard */}
      <LeaderboardTable roomId={room.id} currentUserId={currentUser.id} />
    </main>
  )
}
