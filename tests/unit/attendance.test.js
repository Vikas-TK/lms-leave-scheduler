import { describe, it, expect } from 'vitest';
import { seedAttendance } from '../../src/utils/attendance';

describe('seedAttendance Function', () => {
  it('should generate attendance between 78 and 97', () => {
    const attendance = seedAttendance('200', 'CS');
    expect(attendance).toBeGreaterThanOrEqual(78);
    expect(attendance).toBeLessThanOrEqual(97);
  });

  it('should generate consistent attendance for the same student', () => {
    const attempt1 = seedAttendance('154', 'MECH');
    const attempt2 = seedAttendance('154', 'MECH');
    expect(attempt1).toBe(attempt2);
  });

  it('should generate different attendance for different students', () => {
    const att1 = seedAttendance('201', 'CS');
    const att2 = seedAttendance('202', 'CS');
    expect(att1).not.toBe(att2);
  });

  it('should handle edge cases (missing data gracefully)', () => {
    const fallback = seedAttendance('', '');
    expect(fallback).toBe(78);
  });
});
