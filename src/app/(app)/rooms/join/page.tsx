'use client'

import { joinRoom } from '@/app/actions/rooms'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Joining…' : 'Join Room'}
    </Button>
  )
}

type ActionState = { error: string } | null

export default function JoinRoomPage() {
  const [state, formAction] = useActionState<ActionState, FormData>(joinRoom, null)

  return (
    <main className="container mx-auto max-w-lg px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">Join a Room</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Enter the 8-character invite code shared with you
      </p>

      <form action={formAction} className="flex flex-col gap-5">
        {state?.error && (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="inviteCode">Invite code</Label>
          <Input
            id="inviteCode"
            name="inviteCode"
            placeholder="ABCD1234"
            className="font-mono uppercase"
            maxLength={8}
            onChange={(e) => {
              e.target.value = e.target.value.toUpperCase()
            }}
            required
          />
        </div>

        <SubmitButton />

        <Link
          href="/dashboard"
          className="text-muted-foreground hover:text-foreground text-center text-sm transition-colors"
        >
          ← Back to dashboard
        </Link>
      </form>
    </main>
  )
}
