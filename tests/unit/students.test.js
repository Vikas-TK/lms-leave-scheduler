/**
 * Unit tests for the students dataset.
 *
 * Verifies that the hardcoded student roster is well-formed:
 *   - every record has the required fields (dept, year, section, rollNo, regNo, pass)
 *   - registration numbers are within the declared range
 *   - no duplicate entries
 */

import { describe, it, expect } from 'vitest'
import { STUDENTS } from '../../src/data/students'

// Get student entries (exclude the _range helper key)
const studentKeys = Object.keys(STUDENTS).filter(k => k !== '_range')
const entries = studentKeys.map(k => ({ key: k, ...STUDENTS[k] }))

describe('STUDENTS dataset', () => {
  it('contains at least 60 student records', () => {
    expect(entries.length).toBeGreaterThanOrEqual(60)
  })

  it('every entry has required fields: dept, year, section, rollNo, regNo, pass', () => {
    for (const s of entries) {
      expect(s.dept).toBeDefined()
      expect(s.year).toBeDefined()
      expect(s.section).toBeDefined()
      expect(s.rollNo).toBeDefined()
      expect(s.regNo).toBeDefined()
      expect(s.pass).toBeDefined()
    }
  })

  it('all students belong to CS department, year 3, section D', () => {
    for (const s of entries) {
      expect(s.dept).toBe('CS')
      expect(s.year).toBe(3)
      expect(s.section).toBe('D')
    }
  })

  it('object keys match regNo in each entry', () => {
    for (const s of entries) {
      expect(s.key).toBe(s.regNo)
    }
  })

  it('no duplicate registration numbers', () => {
    const regNos = entries.map(s => s.regNo)
    const unique = new Set(regNos)
    expect(unique.size).toBe(regNos.length)
  })

  it('no duplicate roll numbers', () => {
    const rollNos = entries.map(s => s.rollNo)
    const unique = new Set(rollNos)
    expect(unique.size).toBe(rollNos.length)
  })

  it('_range declares the correct start and end', () => {
    expect(STUDENTS._range).toBeDefined()
    expect(STUDENTS._range.start).toBe('714024104189')
    expect(STUDENTS._range.end).toBe('714024104252')
  })

  it('all regNos fall within the declared _range', () => {
    const start = parseInt(STUDENTS._range.start, 10)
    const end = parseInt(STUDENTS._range.end, 10)
    for (const s of entries) {
      const num = parseInt(s.regNo, 10)
      expect(num).toBeGreaterThanOrEqual(start)
      expect(num).toBeLessThanOrEqual(end)
    }
  })

  it('student 714024104198 has null photo (known edge case)', () => {
    expect(STUDENTS['714024104198'].photo).toBeNull()
  })

  it('all other students have a photo path starting with /students/', () => {
    for (const s of entries) {
      if (s.regNo === '714024104198') continue
      expect(s.photo).toMatch(/^\/students\//)
    }
  })
})
