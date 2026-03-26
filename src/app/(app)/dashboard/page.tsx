import { getUserRooms } from '@/app/actions/rooms'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button-variants'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
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
  const map = {
    FIXED: 'Fixed',
    ODDS_BASED: 'Odds-based',
    HYBRID: 'Hybrid',
  } as const
  return map[mode]
}

export default async function DashboardPage() {
  const rooms = await getUserRooms()

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Your Rooms</h1>

      {rooms.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <p className="text-muted-foreground text-lg">No rooms yet.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/rooms/new" className={cn(buttonVariants())}>
              + Create your first room
            </Link>
            <Link href="/rooms/join" className={cn(buttonVariants({ variant: 'outline' }))}>
              Join with an invite code
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {rooms.map((room: Room) => {
            const role = room.members[0]?.role ?? 'MEMBER'
            return (
              <Link key={room.id} href={`/rooms/${room.slug}`} className="block">
                <Card className="hover:bg-muted/40 cursor-pointer transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-muted-foreground text-sm font-medium">
                        {room.tournament.name}
                      </span>
                      {role === 'ADMIN' ? (
                        <Badge className="bg-primary text-primary-foreground shrink-0">ADMIN</Badge>
                      ) : (
                        <Badge variant="secondary" className="shrink-0">
                          MEMBER
                        </Badge>
                      )}
                    </div>
                    <p className="text-lg leading-tight font-semibold">{room.name}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      {room._count.members} {room._count.members === 1 ? 'member' : 'members'} ·{' '}
                      {formatScoringMode(room.scoringMode)}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Invite:{' '}
                      <span className="text-foreground font-mono font-medium">
                        {room.inviteCode}
                      </span>
                    </p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}
