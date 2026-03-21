'use client'

import { useQuery } from '@tanstack/react-query'
import { getLeaderboard } from '@/app/actions/rooms'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'

type Props = {
  roomId: string
  currentUserId: string
}

const MEDALS = ['🥇', '🥈', '🥉']

export function LeaderboardTable({ roomId, currentUserId }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard', roomId],
    queryFn: () => getLeaderboard(roomId),
    refetchOnWindowFocus: true,
    staleTime: 30_000,
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-3">
            <Skeleton className="h-4 w-6 shrink-0" />
            <Skeleton className="size-8 shrink-0 rounded-full" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    )
  }

  const isEmpty = !data || data.length === 0 || data.every((row) => row.totalPoints === 0)

  if (isEmpty) {
    return (
      <p className="text-muted-foreground py-12 text-center text-sm">
        No predictions scored yet. Check back after the first match result.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      {data.map((row, index) => {
        const isCurrentUser = row.userId === currentUserId
        const medal = MEDALS[index] ?? ''
        const rank = index + 1

        return (
          <div
            key={row.userId}
            className={`flex items-center gap-3 rounded-lg px-3 py-3 ${isCurrentUser ? 'bg-primary/10' : ''}`}
          >
            {/* Rank + medal */}
            <div className="flex w-10 shrink-0 items-center gap-1">
              <span className="text-muted-foreground w-5 text-right text-sm font-medium">
                #{rank}
              </span>
              <span className="w-5 text-base">{medal}</span>
            </div>

            {/* Avatar */}
            <Avatar size="default">
              {row.avatarUrl && <AvatarImage src={row.avatarUrl} alt={row.name} />}
              <AvatarFallback>{row.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>

            {/* Name */}
            <span className="flex-1 truncate text-sm font-medium">{row.name}</span>

            {/* Stats */}
            <div className="flex shrink-0 flex-col items-end gap-0.5">
              <span
                className={`font-mono text-sm font-semibold tabular-nums ${row.totalPoints > 0 ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {row.totalPoints.toFixed(1)} pts
              </span>
              <span className="text-muted-foreground text-xs tabular-nums">
                {row.correctPredictions} correct
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
