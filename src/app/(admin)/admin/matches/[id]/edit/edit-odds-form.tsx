'use client'

import { updateMatchOdds } from '@/app/actions/matches'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving…' : 'Save Odds'}
    </Button>
  )
}

interface EditOddsFormProps {
  matchId: string
  tournamentSlug: string
  homeOdds: number | null
  drawOdds: number | null
  awayOdds: number | null
}

export function EditOddsForm({
  matchId,
  tournamentSlug,
  homeOdds,
  drawOdds,
  awayOdds,
}: EditOddsFormProps) {
  const [state, formAction] = useActionState(updateMatchOdds, null)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="matchId" value={matchId} />
      <input type="hidden" name="tournamentSlug" value={tournamentSlug} />

      <div className="grid grid-cols-3 gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="homeOdds">Home odds</Label>
          <Input
            id="homeOdds"
            name="homeOdds"
            type="number"
            step="0.01"
            min="1"
            placeholder="2.00"
            defaultValue={homeOdds ?? ''}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="drawOdds">Draw odds</Label>
          <Input
            id="drawOdds"
            name="drawOdds"
            type="number"
            step="0.01"
            min="1"
            placeholder="3.00"
            defaultValue={drawOdds ?? ''}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="awayOdds">Away odds</Label>
          <Input
            id="awayOdds"
            name="awayOdds"
            type="number"
            step="0.01"
            min="1"
            placeholder="3.50"
            defaultValue={awayOdds ?? ''}
          />
        </div>
      </div>

      {state && 'success' in state && state.success && (
        <p className="text-sm font-medium text-green-600">Saved!</p>
      )}

      <div>
        <SubmitButton />
      </div>
    </form>
  )
}
