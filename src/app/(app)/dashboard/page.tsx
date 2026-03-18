import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Your Rooms</h1>
      <p className="text-muted-foreground mt-2">No rooms yet. Create one to get started.</p>
    </main>
  )
}
