import { auth, clerkClient } from '@clerk/nextjs/server'
import { db } from './db'

export async function isAppAdmin(): Promise<boolean> {
  const { sessionClaims } = await auth()
  return sessionClaims?.metadata?.role === 'admin'
}

export async function getCurrentUser() {
  const { userId: clerkId } = await auth()
  if (!clerkId) throw new Error('Not authenticated')

  const client = await clerkClient()
  const clerkUser = await client.users.getUser(clerkId)

  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
    clerkUser.emailAddresses[0]?.emailAddress?.split('@')[0] ||
    'User'
  const email =
    clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ??
    ''

  return db.user.upsert({
    where: { clerkId },
    update: { name, avatarUrl: clerkUser.imageUrl },
    create: { clerkId, name, email, avatarUrl: clerkUser.imageUrl },
  })
}
