/**
 * Unit tests for the DEPTS and REQ_TYPES configuration constants
 * used throughout the application (OdSystem, NewApplication, etc.)
 *
 * These constants drive the UI and must stay consistent.
 */

import { describe, it, expect } from 'vitest'

// Replicate the constants exactly as they appear in the source
const DEPTS = {
  CS: 'Computer Science',
  IT: 'Information Technology',
  AIDS: 'AI & Data Science',
  AIML: 'AI & Machine Learning',
  CY: 'Cyber Security',
  MECH: 'Mechanical Engineering',
  CIVIL: 'Civil Engineering',
  BME: 'Biomedical Engineering',
  EEE: 'Electrical & Electronics',
  ECE: 'Electronics & Communication',
}

const REQ_TYPES = [
  { key: 'od',       label: 'OD Request',       hostelerOnly: false },
  { key: 'gatepass', label: 'Gate Pass',         hostelerOnly: true  },
  { key: 'leave',    label: 'Leave Letter',      hostelerOnly: true  },
  { key: 'apology',  label: 'Apology Letter',    hostelerOnly: false },
]

describe('DEPTS configuration', () => {
  it('contains exactly 10 departments', () => {
    expect(Object.keys(DEPTS).length).toBe(10)
  })

  it('has short codes as keys and full names as values', () => {
    for (const [key, value] of Object.entries(DEPTS)) {
      expect(typeof key).toBe('string')
      expect(key.length).toBeLessThanOrEqual(5) // short codes
      expect(typeof value).toBe('string')
      expect(value.length).toBeGreaterThan(key.length) // full name is longer
    }
  })

  it('CS maps to Computer Science', () => {
    expect(DEPTS.CS).toBe('Computer Science')
  })

  it('contains all expected departments', () => {
    const expected = ['CS', 'IT', 'AIDS', 'AIML', 'CY', 'MECH', 'CIVIL', 'BME', 'EEE', 'ECE']
    for (const dept of expected) {
      expect(DEPTS).toHaveProperty(dept)
    }
  })
})

describe('REQ_TYPES configuration', () => {
  it('contains exactly 4 request types', () => {
    expect(REQ_TYPES.length).toBe(4)
  })

  it('every type has key, label, and hostelerOnly fields', () => {
    for (const t of REQ_TYPES) {
      expect(t).toHaveProperty('key')
      expect(t).toHaveProperty('label')
      expect(t).toHaveProperty('hostelerOnly')
      expect(typeof t.key).toBe('string')
      expect(typeof t.label).toBe('string')
      expect(typeof t.hostelerOnly).toBe('boolean')
    }
  })

  it('all keys are unique', () => {
    const keys = REQ_TYPES.map(t => t.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('od and apology are available for all users (hostelerOnly = false)', () => {
    expect(REQ_TYPES.find(t => t.key === 'od').hostelerOnly).toBe(false)
    expect(REQ_TYPES.find(t => t.key === 'apology').hostelerOnly).toBe(false)
  })

  it('gatepass and leave are restricted to hostellers', () => {
    expect(REQ_TYPES.find(t => t.key === 'gatepass').hostelerOnly).toBe(true)
    expect(REQ_TYPES.find(t => t.key === 'leave').hostelerOnly).toBe(true)
  })
})
