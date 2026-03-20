'use client'

import { enterMatchScore } from '@/app/actions/matches'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Confirming…' : 'Confirm Score'}
    </Button>
  )
}

interface EnterScoreFormProps {
  matchId: string
}

export function EnterScoreForm({ matchId }: EnterScoreFormProps) {
  const [state, formAction] = useActionState(enterMatchScore, null)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="matchId" value={matchId} />

      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="homeScore">Home score</Label>
          <Input
            id="homeScore"
            name="homeScore"
            type="number"
            min="0"
            required
            placeholder="0"
            className="h-14 text-center text-2xl font-bold"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="awayScore">Away score</Label>
          <Input
            id="awayScore"
            name="awayScore"
            type="number"
            min="0"
            required
            placeholder="0"
            className="h-14 text-center text-2xl font-bold"
          />
        </div>
      </div>

      <p className="text-muted-foreground text-xs">
        Confirming the score will calculate points for all bets on this match. This action cannot be
        undone.
      </p>

      <div>
        <SubmitButton />
      </div>
    </form>
  )
}
