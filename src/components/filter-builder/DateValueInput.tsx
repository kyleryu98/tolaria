import { useEffect, useState } from 'react'
import { CalendarBlank } from '@phosphor-icons/react/CalendarBlank'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { parseDateFilterInput } from '@/utils/filterDates'

const DATE_PREVIEW_DEBOUNCE_MS = 250
const LONG_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
const SHORT_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' })

function padDatePart(value: number): string {
  return String(value).padStart(2, '0')
}

function formatDateInputValue(value: Date): string {
  return `${value.getFullYear()}-${padDatePart(value.getMonth() + 1)}-${padDatePart(value.getDate())}`
}

export function DateValueInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const selected = value ? parseDateFilterInput(value) ?? undefined : undefined
  const [showPreview, setShowPreview] = useState(false)
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedValue(value), DATE_PREVIEW_DEBOUNCE_MS)
    return () => window.clearTimeout(timeoutId)
  }, [value])

  const previewValue = showPreview ? debouncedValue.trim() : ''
  const resolvedPreview = previewValue ? parseDateFilterInput(previewValue) : null
  const previewLabel = resolvedPreview
    ? LONG_DATE_FORMATTER.format(resolvedPreview)
    : previewValue
      ? 'Not recognized'
      : null
  const selectedLabel = selected ? SHORT_DATE_FORMATTER.format(selected) : null

  return (
    <div className="flex flex-1 min-w-0 flex-col gap-1">
      <div className="flex min-w-0 items-center gap-1">
        <Input
          className="h-8 flex-1 min-w-0 text-sm"
          placeholder='YYYY-MM-DD or "10 days ago"'
          value={value}
          onChange={(e) => {
            setShowPreview(true)
            onChange(e.target.value)
          }}
          onFocus={() => setShowPreview(true)}
          onBlur={() => setShowPreview(false)}
          data-testid="date-value-input"
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-testid="date-picker-trigger"
              className="h-8 w-8 shrink-0 px-0"
              title={selectedLabel ?? 'Pick a date'}
              aria-label={selectedLabel ? `Open date picker (${selectedLabel})` : 'Open date picker'}
            >
              <CalendarBlank size={14} className="shrink-0 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <Input
              className="h-8 min-w-[8.75rem] font-mono text-[13px] tabular-nums"
              type="date"
              value={selected ? formatDateInputValue(selected) : ''}
              onChange={(event) => onChange(event.target.value)}
              data-testid="date-picker-input"
            />
          </PopoverContent>
        </Popover>
      </div>
      {previewLabel && (
        <div
          className="pl-1 text-[11px] text-muted-foreground"
          data-testid={resolvedPreview ? 'date-value-preview' : 'date-value-preview-unrecognized'}
        >
          {resolvedPreview ? `Resolves to ${previewLabel}` : previewLabel}
        </div>
      )}
    </div>
  )
}
