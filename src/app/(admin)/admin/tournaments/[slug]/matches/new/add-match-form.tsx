'use client'

import { createMatch } from '@/app/actions/matches'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState, useActionState } from 'react'
import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Adding…' : 'Add Match'}
    </Button>
  )
}

interface Team {
  id: string
  name: string
}

interface AddMatchFormProps {
  tournamentId: string
  tournamentSlug: string
  tournamentName: string
  teams: Team[]
}

export function AddMatchForm({ tournamentId, tournamentSlug, teams }: AddMatchFormProps) {
  const [state, formAction] = useActionState(createMatch, null)
  const [homeTeamId, setHomeTeamId] = useState('')
  const [awayTeamId, setAwayTeamId] = useState('')

  const selectClass =
    'border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="tournamentId" value={tournamentId} />
      <input type="hidden" name="tournamentSlug" value={tournamentSlug} />

      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-1.5">
        <Label htmlFor="homeTeamId">Home team</Label>
        <select
          id="homeTeamId"
          name="homeTeamId"
          required
          value={homeTeamId}
          onChange={(e) => setHomeTeamId(e.target.value)}
          className={selectClass}
        >
          <option value="">Select home team…</option>
          {teams
            .filter((t) => t.id !== awayTeamId)
            .map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
        </select>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="awayTeamId">Away team</Label>
        <select
          id="awayTeamId"
          name="awayTeamId"
          required
          value={awayTeamId}
          onChange={(e) => setAwayTeamId(e.target.value)}
          className={selectClass}
        >
          <option value="">Select away team…</option>
          {teams
            .filter((t) => t.id !== homeTeamId)
            .map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
        </select>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="kickoffAt">Kickoff date &amp; time</Label>
        <Input id="kickoffAt" name="kickoffAt" type="datetime-local" required />
      </div>

      <fieldset className="grid gap-1.5">
        <legend className="mb-1.5 text-sm leading-none font-medium">Odds (optional)</legend>
        <div className="grid grid-cols-3 gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="homeOdds">Home</Label>
            <Input
              id="homeOdds"
              name="homeOdds"
              type="number"
              step="0.01"
              min="1"
              placeholder="2.00"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="drawOdds">Draw</Label>
            <Input
              id="drawOdds"
              name="drawOdds"
              type="number"
              step="0.01"
              min="1"
              placeholder="3.00"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="awayOdds">Away</Label>
            <Input
              id="awayOdds"
              name="awayOdds"
              type="number"
              step="0.01"
              min="1"
              placeholder="3.50"
            />
          </div>
        </div>
      </fieldset>

      <div className="flex justify-start pt-1">
        <SubmitButton />
      </div>
    </form>
  )
}
