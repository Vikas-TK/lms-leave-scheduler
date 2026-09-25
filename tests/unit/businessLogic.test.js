/**
 * Unit tests for business logic helper functions extracted from OdSystem and NewApplication.
 *
 * Tests pure functions: getStatus, calcDuration, daysCount, cleanLetterText, clsLabel.
 * These functions don't touch the DOM or Supabase, so they can be tested in pure isolation.
 */

import { describe, it, expect } from 'vitest'

// ── Re-implement the pure helpers here so we test their exact logic.
// (They are defined inline inside OdSystem.jsx / NewApplication.jsx
//  and are not exported. We replicate & test the logic contracts.)

// getStatus — determines application workflow state from a raw record
function getStatus(r) {
  if (r.status === 'completed') return 'approved'
  if (r.status === 'cancelled') return 'rejected'
  if (r.status === 'draft') return 'draft'
  return 'pending'
}

// calcDuration — computes inclusive day count between two ISO date strings
function calcDuration(fromDate, toDate) {
  if (!fromDate || !toDate) return null
  const start = new Date(fromDate)
  const end = new Date(toDate)
  const diffMs = end - start
  if (diffMs < 0) return { error: true, text: 'End must be on or after start' }
  const days = Math.floor(diffMs / 86400000) + 1 // inclusive
  return { days, text: days + ' Day' + (days !== 1 ? 's' : '') }
}

// daysCount — simpler variant used in OdSystem
function daysCount(a, b) {
  return Math.max(1, Math.round((new Date(b) - new Date(a)) / 86400000) + 1)
}

// clsLabel — generates a class identifier string
function clsLabel(r) {
  return `${r.dept}${r.year}${r.section}`
}

// cleanLetterText — strips markdown and asterisks from AI-generated letters
function cleanLetterText(text) {
  if (!text) return ''
  let t = text
  t = t.replace(/^#+\s*/gm, '')
  t = t.replace(/^\s*[-_]{3,}\s*$/gm, '')
  t = t.replace(/\*/g, '')
  const toIdx = t.search(/\bTo\b/i)
  if (toIdx > 0 && toIdx < 160) {
    t = t.slice(toIdx)
  }
  return t.trim()
}

// ────────────────────────────────────────────────────────────────────────
// TESTS
// ────────────────────────────────────────────────────────────────────────

describe('getStatus', () => {
  it('maps "completed" → "approved"', () => {
    expect(getStatus({ status: 'completed' })).toBe('approved')
  })

  it('maps "cancelled" → "rejected"', () => {
    expect(getStatus({ status: 'cancelled' })).toBe('rejected')
  })

  it('maps "draft" → "draft"', () => {
    expect(getStatus({ status: 'draft' })).toBe('draft')
  })

  it('maps "in_progress" → "pending"', () => {
    expect(getStatus({ status: 'in_progress' })).toBe('pending')
  })

  it('maps any unknown status → "pending"', () => {
    expect(getStatus({ status: 'something_else' })).toBe('pending')
    expect(getStatus({ status: '' })).toBe('pending')
    expect(getStatus({})).toBe('pending')
  })
})

describe('calcDuration', () => {
  it('returns null when either date is missing', () => {
    expect(calcDuration(null, '2026-09-26')).toBeNull()
    expect(calcDuration('2026-09-26', null)).toBeNull()
    expect(calcDuration(null, null)).toBeNull()
  })

  it('returns 1 Day for same-day range', () => {
    const result = calcDuration('2026-09-26', '2026-09-26')
    expect(result.days).toBe(1)
    expect(result.text).toBe('1 Day')
    expect(result.error).toBeUndefined()
  })

  it('returns correct inclusive count for multi-day ranges', () => {
    const result = calcDuration('2026-09-20', '2026-09-26')
    expect(result.days).toBe(7)
    expect(result.text).toBe('7 Days')
  })

  it('returns error when end is before start', () => {
    const result = calcDuration('2026-09-26', '2026-09-20')
    expect(result.error).toBe(true)
    expect(result.text).toBe('End must be on or after start')
  })

  it('handles month boundary correctly', () => {
    const result = calcDuration('2026-01-30', '2026-02-02')
    expect(result.days).toBe(4) // 30, 31, 1, 2
  })

  it('handles year boundary correctly', () => {
    const result = calcDuration('2026-12-31', '2027-01-02')
    expect(result.days).toBe(3) // 31, 1, 2
  })
})

describe('daysCount', () => {
  it('returns 1 for same-day', () => {
    expect(daysCount('2026-09-26', '2026-09-26')).toBe(1)
  })

  it('returns correct inclusive count', () => {
    expect(daysCount('2026-09-01', '2026-09-05')).toBe(5)
  })

  it('never returns less than 1', () => {
    // Even with reversed dates, max(1, ...) ensures at least 1
    expect(daysCount('2026-09-26', '2026-09-20')).toBeGreaterThanOrEqual(1)
  })
})

describe('clsLabel', () => {
  it('concatenates dept, year, and section', () => {
    expect(clsLabel({ dept: 'CS', year: 3, section: 'D' })).toBe('CS3D')
  })

  it('works with other departments', () => {
    expect(clsLabel({ dept: 'ECE', year: 2, section: 'A' })).toBe('ECE2A')
    expect(clsLabel({ dept: 'MECH', year: 4, section: 'B' })).toBe('MECH4B')
  })
})

describe('cleanLetterText', () => {
  it('returns empty string for null or undefined', () => {
    expect(cleanLetterText(null)).toBe('')
    expect(cleanLetterText(undefined)).toBe('')
    expect(cleanLetterText('')).toBe('')
  })

  it('strips markdown bold asterisks', () => {
    const input = '**Dear** *Sir/Madam*,'
    expect(cleanLetterText(input)).not.toContain('*')
  })

  it('strips markdown headers', () => {
    const input = '## Subject\nBody paragraph here'
    const result = cleanLetterText(input)
    expect(result).not.toContain('##')
    expect(result).toContain('Body paragraph here')
  })

  it('strips horizontal rules', () => {
    const input = 'Paragraph one\n---\nParagraph two'
    const result = cleanLetterText(input)
    expect(result).not.toMatch(/^---$/m)
  })

  it('trims leading content before "To" if it appears within the first 160 chars', () => {
    const input = 'Institution Header Stuff\n\nTo\nThe Class Advisor,'
    const result = cleanLetterText(input)
    expect(result).toMatch(/^To/)
  })

  it('does NOT trim "To" if it appears after 160 chars', () => {
    const padding = 'x'.repeat(200)
    const input = `${padding}\nTo\nThe Class Advisor,`
    const result = cleanLetterText(input)
    expect(result.startsWith('x')).toBe(true)
  })

  it('handles a realistic AI-generated letter', () => {
    const input = `## OD Application Letter
---
Institution of Engineering & Technology

To
Dr. Lakshmi Priya,
Class Advisor, Department of **Computer Science**

Subject: Requisition for On-Duty (OD) for *2 Days*

Respected Sir/Madam,

I wish to bring to your notice that I need OD for attending **Smart India Hackathon 2026**.

Thank you.

Yours faithfully,
714024104189`

    const result = cleanLetterText(input)
    expect(result).not.toContain('*')
    expect(result).not.toContain('##')
    expect(result).toMatch(/^To/)
    expect(result).toContain('Computer Science')
    expect(result).toContain('Smart India Hackathon 2026')
    expect(result).toContain('Yours faithfully')
  })
})
