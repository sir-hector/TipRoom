import { getUserRooms } from '@/app/actions/rooms'
import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/utils'
import { UsersIcon, ChevronRightIcon, TrophyIcon } from 'lucide-react'
import Link from 'next/link'

type Room = {
  id: string
  name: string
  slug: string
  inviteCode: string
  scoringMode: 'FIXED' | 'ODDS_BASED' | 'HYBRID'
  tournament: { name: string; slug: string }
  _count: { members: number }
  members: { role: 'ADMIN' | 'MEMBER' }[]
}

function formatScoringMode(mode: 'FIXED' | 'ODDS_BASED' | 'HYBRID') {
  const map = { FIXED: 'Fixed', ODDS_BASED: 'Odds-based', HYBRID: 'Hybrid' } as const
  return map[mode]
}

export default async function DashboardPage() {
  const rooms = await getUserRooms()

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Your Rooms</h1>

      {rooms.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <TrophyIcon className="text-muted-foreground h-12 w-12" />
          <p className="text-muted-foreground text-lg font-medium">No rooms yet</p>
          <p className="text-muted-foreground text-sm">
            Create a room and invite your friends to start predicting.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Link href="/rooms/new" className={cn(buttonVariants())}>
              + Create your first room
            </Link>
            <Link href="/rooms/join" className={cn(buttonVariants({ variant: 'outline' }))}>
              Join with an invite code
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {rooms.map((room: Room) => {
            const role = room.members[0]?.role ?? 'MEMBER'
            const isAdmin = role === 'ADMIN'
            return (
              <Link
                key={room.id}
                href={`/rooms/${room.slug}`}
                className="group bg-card border-border hover:border-primary/30 hover:bg-muted/30 relative flex items-center gap-4 overflow-hidden rounded-xl border p-4 transition-all duration-200"
              >
                {/* Left accent bar */}
                <div className="bg-primary absolute top-0 left-0 h-full w-1 rounded-l-xl" />

                {/* Icon */}
                <div className="bg-primary/10 text-primary ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg">
                  <TrophyIcon className="h-5 w-5" />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-center gap-2">
                    <span className="text-muted-foreground truncate text-xs font-medium tracking-wide uppercase">
                      {room.tournament.name}
                    </span>
                    {isAdmin && (
                      <span className="bg-primary/10 text-primary shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="truncate text-base font-semibold">{room.name}</p>
                  <div className="text-muted-foreground mt-1 flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1">
                      <UsersIcon className="h-3 w-3" />
                      {room._count.members} {room._count.members === 1 ? 'member' : 'members'}
                    </span>
                    <span>·</span>
                    <span>{formatScoringMode(room.scoringMode)}</span>
                    <span>·</span>
                    <span className="font-mono">{room.inviteCode}</span>
                  </div>
                </div>

                {/* Arrow */}
                <ChevronRightIcon className="text-muted-foreground h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}
