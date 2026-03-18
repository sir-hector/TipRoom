import { describe, it, expect } from 'vitest'
import { isBetAllowed, getMinutesUntilLock } from '@/lib/bet-validation'

describe('isBetAllowed', () => {
  it('allows bet when lock is in the future', () => {
    const future = new Date(Date.now() + 60_000)
    expect(isBetAllowed(future)).toBe(true)
  })

  it('blocks bet when lock time has passed', () => {
    const past = new Date(Date.now() - 1_000)
    expect(isBetAllowed(past)).toBe(false)
  })

  it('blocks bet when lock time is exactly now', () => {
    const now = new Date()
    expect(isBetAllowed(now)).toBe(false)
  })
})

describe('getMinutesUntilLock', () => {
  it('returns positive minutes when lock is in future', () => {
    const future = new Date(Date.now() + 90 * 60 * 1000)
    expect(getMinutesUntilLock(future)).toBe(90)
  })

  it('returns negative when lock has passed', () => {
    const past = new Date(Date.now() - 10 * 60 * 1000)
    expect(getMinutesUntilLock(past)).toBe(-10)
  })
})
