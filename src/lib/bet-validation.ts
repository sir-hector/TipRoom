export function isBetAllowed(betsLockedAt: Date): boolean {
  return betsLockedAt > new Date()
}

export function getMinutesUntilLock(betsLockedAt: Date): number {
  return Math.floor((betsLockedAt.getTime() - Date.now()) / 1000 / 60)
}
