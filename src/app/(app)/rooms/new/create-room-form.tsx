'use client'

import { createRoom } from '@/app/actions/rooms'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Creating…' : 'Create Room'}
    </Button>
  )
}

interface Tournament {
  id: string
  name: string
}

interface Props {
  tournaments: Tournament[]
}

type ActionState = { error: string } | null

export function CreateRoomForm({ tournaments }: Props) {
  const [state, formAction] = useActionState<ActionState, FormData>(createRoom, null)

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Room name</Label>
        <Input id="name" name="name" placeholder="e.g. The Prediction Den" required />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="tournamentId">Tournament</Label>
        <Select name="tournamentId" required>
          <SelectTrigger id="tournamentId">
            <SelectValue placeholder="Select a tournament" />
          </SelectTrigger>
          <SelectContent>
            {tournaments.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="scoringMode">Scoring mode</Label>
        <Select name="scoringMode" defaultValue="ODDS_BASED" required>
          <SelectTrigger id="scoringMode">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ODDS_BASED">Odds-based (default)</SelectItem>
            <SelectItem value="FIXED">Fixed points</SelectItem>
            <SelectItem value="HYBRID">Hybrid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <SubmitButton />

      <Link
        href="/dashboard"
        className="text-muted-foreground hover:text-foreground text-center text-sm transition-colors"
      >
        ← Back to dashboard
      </Link>
    </form>
  )
}
