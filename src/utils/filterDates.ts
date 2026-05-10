type RelativeUnit = 'day' | 'week' | 'month' | 'year'
type DateFilterInput = string
type RelativeToken = string
type RelativePattern = { amountToken: RelativeToken; future: boolean; unitToken: RelativeToken }

const NUMBER_WORDS = new Map<RelativeToken, number>([
  ['a', 1],
  ['an', 1],
  ['one', 1],
  ['two', 2],
  ['three', 3],
  ['four', 4],
  ['five', 5],
  ['six', 6],
  ['seven', 7],
  ['eight', 8],
  ['nine', 9],
  ['ten', 10],
  ['eleven', 11],
  ['twelve', 12],
])

const RELATIVE_UNITS = new Set<RelativeUnit>(['day', 'week', 'month', 'year'])
const NAMED_RELATIVE_DAY_OFFSETS = new Map<DateFilterInput, number>([
  ['today', 0],
  ['yesterday', -1],
  ['tomorrow', 1],
])

function cloneDate(value: Date): Date {
  return new Date(value.getTime())
}

function startOfLocalDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate())
}

function addCalendarDays(value: Date, amount: number): Date {
  const next = cloneDate(value)
  next.setDate(next.getDate() + amount)
  return next
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function addCalendarMonths(value: Date, amount: number): Date {
  const targetMonthStart = new Date(value.getFullYear(), value.getMonth() + amount, 1)
  const targetYear = targetMonthStart.getFullYear()
  const targetMonth = targetMonthStart.getMonth()
  const next = cloneDate(value)
  next.setDate(1)
  next.setFullYear(targetYear, targetMonth, Math.min(value.getDate(), daysInMonth(targetYear, targetMonth)))
  return next
}

function addCalendarYears(value: Date, amount: number): Date {
  return addCalendarMonths(value, amount * 12)
}

function isValidDate(value: Date): boolean {
  return !Number.isNaN(value.getTime())
}

function parseIsoDateOnly(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const parsed = new Date(year, month - 1, day)

  return parsed.getFullYear() === year
    && parsed.getMonth() === month - 1
    && parsed.getDate() === day
    ? parsed
    : null
}

function parseRelativeAmount(token: RelativeToken): number | null {
  if (/^\d+$/.test(token)) return Number(token)
  return NUMBER_WORDS.get(token) ?? null
}

function normalizeRelativeUnit(token: RelativeToken): RelativeUnit | null {
  const unit = token.toLowerCase().replace(/s$/, '')
  return RELATIVE_UNITS.has(unit as RelativeUnit) ? unit as RelativeUnit : null
}

function shiftRelativeDate(reference: Date, unit: RelativeUnit, amount: number, future: boolean): Date {
  const signedAmount = future ? amount : -amount
  switch (unit) {
    case 'day':
      return addCalendarDays(reference, signedAmount)
    case 'week':
      return addCalendarDays(reference, signedAmount * 7)
    case 'month':
      return addCalendarMonths(reference, signedAmount)
    case 'year':
      return addCalendarYears(reference, signedAmount)
  }
}

function parseNamedRelativeDate(normalized: DateFilterInput, base: Date): Date | null {
  const offsetDays = NAMED_RELATIVE_DAY_OFFSETS.get(normalized)
  return offsetDays === undefined ? null : addCalendarDays(base, offsetDays)
}

function futureRelativePattern(tokens: RelativeToken[]): RelativePattern | null {
  if (tokens.length !== 3 || tokens.at(0) !== 'in') return null
  return { amountToken: tokens.at(1) ?? '', future: true, unitToken: tokens.at(2) ?? '' }
}

function pastRelativePattern(tokens: RelativeToken[]): RelativePattern | null {
  if (tokens.length !== 3 || tokens.at(2) !== 'ago') return null
  return { amountToken: tokens.at(0) ?? '', future: false, unitToken: tokens.at(1) ?? '' }
}

function parseRelativeTokenPattern(tokens: RelativeToken[]): RelativePattern | null {
  if (tokens.length !== 3) return null
  return futureRelativePattern(tokens) ?? pastRelativePattern(tokens)
}

function parseRelativeDateInput(value: DateFilterInput, reference: Date): Date | null {
  const normalized = value.trim().toLowerCase()
  if (!normalized) return null

  const base = startOfLocalDay(reference)
  const namedDate = parseNamedRelativeDate(normalized, base)
  if (namedDate) return namedDate

  const tokenPattern = parseRelativeTokenPattern(normalized.split(/\s+/))
  if (!tokenPattern) return null

  const amount = parseRelativeAmount(tokenPattern.amountToken)
  const unit = normalizeRelativeUnit(tokenPattern.unitToken)
  if (amount == null || unit == null) return null

  return shiftRelativeDate(base, unit, amount, tokenPattern.future)
}

export function parseDateFilterInput(value: DateFilterInput, reference = new Date()): Date | null {
  const trimmed = value.trim()
  if (!trimmed) return null

  const relative = parseRelativeDateInput(trimmed, reference)
  if (relative) return relative

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return parseIsoDateOnly(trimmed)
  }

  const timestamp = Date.parse(trimmed)
  if (Number.isNaN(timestamp)) return null
  const parsed = new Date(timestamp)
  return isValidDate(parsed) ? parsed : null
}

export function toDateFilterTimestamp(value: DateFilterInput, reference = new Date()): number | null {
  const parsed = parseDateFilterInput(value, reference)
  return parsed ? parsed.getTime() : null
}
