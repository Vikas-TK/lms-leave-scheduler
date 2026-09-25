/**
 * Unit tests for checkValidity() — the core validity/expiry engine.
 *
 * This function determines whether an application is still active or expired
 * based on its toDate and toTime fields. These tests cover:
 *   - null/missing input edge cases
 *   - valid (future) dates
 *   - expired (past) dates
 *   - time boundary accuracy
 *   - output shape & colour codes
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { checkValidity } from '../../src/validityEngine'

describe('checkValidity', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  // ─── Edge cases ──────────────────────────────────────────────────────
  it('returns Active when req is null', () => {
    const result = checkValidity(null)
    expect(result.isValid).toBe(true)
    expect(result.isExpired).toBe(false)
    expect(result.label).toBe('Active')
  })

  it('returns Active when req is undefined', () => {
    const result = checkValidity(undefined)
    expect(result.isValid).toBe(true)
    expect(result.isExpired).toBe(false)
  })

  it('returns Active when req has no toDate', () => {
    const result = checkValidity({ reason: 'test' })
    expect(result.isValid).toBe(true)
    expect(result.isExpired).toBe(false)
    expect(result.shortLabel).toBe('Active')
  })

  // ─── Future date → valid ─────────────────────────────────────────────
  it('marks a future toDate as valid and not expired', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15T10:00:00'))

    const result = checkValidity({ toDate: '2026-12-31' })
    expect(result.isValid).toBe(true)
    expect(result.isExpired).toBe(false)
    expect(result.color).toBe('#16a34a') // green
  })

  // ─── Past date → expired ─────────────────────────────────────────────
  it('marks a past toDate as expired', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-26T12:00:00'))

    const result = checkValidity({ toDate: '2026-09-25', toTime: '23:59' })
    expect(result.isExpired).toBe(true)
    expect(result.isValid).toBe(false)
    expect(result.shortLabel).toBe('Expired')
    expect(result.color).toBe('#dc2626') // red
  })

  // ─── Boundary: exact moment before expiry ────────────────────────────
  it('is still valid one minute before toTime', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-26T16:59:00'))

    const result = checkValidity({ toDate: '2026-09-26', toTime: '17:00' })
    expect(result.isValid).toBe(true)
    expect(result.isExpired).toBe(false)
  })

  // ─── Boundary: one second after expiry ───────────────────────────────
  it('is expired one second after toTime', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-26T17:00:01'))

    const result = checkValidity({ toDate: '2026-09-26', toTime: '17:00' })
    expect(result.isExpired).toBe(true)
    expect(result.isValid).toBe(false)
  })

  // ─── Default time when toTime is missing ─────────────────────────────
  it('defaults to 23:59 when toTime is not provided', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-26T23:58:00'))

    const result = checkValidity({ toDate: '2026-09-26' })
    expect(result.isValid).toBe(true)
    expect(result.isExpired).toBe(false)
  })

  // ─── Output shape ────────────────────────────────────────────────────
  it('includes formattedDate in the output for a valid request', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00'))

    const result = checkValidity({ toDate: '2026-12-31' })
    expect(result).toHaveProperty('formattedDate')
    expect(result).toHaveProperty('formattedShort')
    expect(result).toHaveProperty('bg')
    expect(result).toHaveProperty('borderColor')
    expect(result).toHaveProperty('color')
  })

  it('expired output includes glow and icon properties', () => {
    // Set up fake timers and system time before calling checkValidity
    // to avoid race with lucide-react's stylesheet insertion
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(new Date('2026-10-01T00:00:00'))

    const result = checkValidity({ toDate: '2026-09-25', toTime: '17:00' })
    expect(result.isExpired).toBe(true)
    expect(result).toHaveProperty('glow')
    expect(result).toHaveProperty('icon')
    expect(result.detail).toContain('Expired on')
  })
})
