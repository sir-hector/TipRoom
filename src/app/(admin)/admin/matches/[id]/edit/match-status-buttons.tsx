'use client'

import { updateMatchStatus } from '@/app/actions/matches'
import { Button } from '@/components/ui/button'
import { useTransition } from 'react'

interface MatchStatusButtonsProps {
  matchId: string
}

export function MatchStatusButtons({ matchId }: MatchStatusButtonsProps) {
  const [isPendingCancelled, startCancelledTransition] = useTransition()
  const [isPendingPostponed, startPostponedTransition] = useTransition()

  function handleCancel() {
    startCancelledTransition(async () => {
      await updateMatchStatus(matchId, 'CANCELLED')
    })
  }

  function handlePostpone() {
    startPostponedTransition(async () => {
      await updateMatchStatus(matchId, 'POSTPONED')
    })
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        onClick={handlePostpone}
        disabled={isPendingPostponed || isPendingCancelled}
      >
        {isPendingPostponed ? 'Updating…' : 'Mark Postponed'}
      </Button>
      <Button
        variant="outline"
        onClick={handleCancel}
        disabled={isPendingCancelled || isPendingPostponed}
        className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
      >
        {isPendingCancelled ? 'Updating…' : 'Mark Cancelled'}
      </Button>
    </div>
  )
}
