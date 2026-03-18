import { describe, it, expect } from 'vitest'
import { generateInviteCode } from '@/lib/invite'

describe('generateInviteCode', () => {
  it('generates 8-character code', () => {
    expect(generateInviteCode()).toHaveLength(8)
  })

  it('only contains allowed characters', () => {
    const code = generateInviteCode()
    expect(code).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$/)
  })

  it('generates unique codes', () => {
    const codes = new Set(Array.from({ length: 200 }, generateInviteCode))
    expect(codes.size).toBe(200)
  })
})
