import { getTournaments } from '@/app/actions/rooms'
import { CreateRoomForm } from './create-room-form'

export default async function NewRoomPage() {
  const tournaments = await getTournaments()
  return (
    <main className="container mx-auto max-w-lg px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Create a Room</h1>
      <CreateRoomForm tournaments={tournaments} />
    </main>
  )
}
