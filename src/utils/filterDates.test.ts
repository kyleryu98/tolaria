import { afterEach, describe, expect, it, vi } from 'vitest'
import { parseDateFilterInput, toDateFilterTimestamp } from './filterDates'

function formatDateOnly(value: Date): string {
  return [
    value.getFullYear(),
    String(value.getMonth() + 1).padStart(2, '0'),
    String(value.getDate()).padStart(2, '0'),
  ].join('-')
}

describe('filterDates', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('parses absolute ISO dates', () => {
    const parsed = parseDateFilterInput('2026-04-01')
    expect(parsed && formatDateOnly(parsed)).toBe('2026-04-01')
  })

  it('parses numeric relative day phrases', () => {
    const reference = new Date('2026-04-07T12:00:00Z')
    const parsed = parseDateFilterInput('10 days ago', reference)
    expect(parsed && formatDateOnly(parsed)).toBe('2026-03-28')
  })

  it('parses numeric relative year phrases', () => {
    const reference = new Date('2026-04-08T12:00:00Z')
    const parsed = parseDateFilterInput('10 years ago', reference)
    expect(parsed && formatDateOnly(parsed)).toBe('2016-04-08')
  })

  it('clamps relative month phrases to the target month end', () => {
    const reference = new Date(2026, 2, 31, 12)
    const parsed = parseDateFilterInput('1 month ago', reference)
    expect(parsed && formatDateOnly(parsed)).toBe('2026-02-28')
  })

  it('clamps leap-day relative year phrases to February 28', () => {
    const reference = new Date(2024, 1, 29, 12)
    const parsed = parseDateFilterInput('in 1 year', reference)
    expect(parsed && formatDateOnly(parsed)).toBe('2025-02-28')
  })

  it('parses word-based relative week phrases', () => {
    const reference = new Date('2026-04-07T12:00:00Z')
    const parsed = parseDateFilterInput('one week ago', reference)
    expect(parsed && formatDateOnly(parsed)).toBe('2026-03-31')
  })

  it('returns null for unsupported date phrases', () => {
    expect(parseDateFilterInput('eventually')).toBeNull()
  })

  it('converts parsed filter values into timestamps', () => {
    const reference = new Date('2026-04-07T12:00:00Z')
    const timestamp = toDateFilterTimestamp('yesterday', reference)
    expect(timestamp).not.toBeNull()
    expect(formatDateOnly(new Date(timestamp!))).toBe('2026-04-06')
  })
})
