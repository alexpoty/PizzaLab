import type { DoughMethod, FormState, PresetMetadata } from '../types/dough'

export type FermentationTimelineEntry = {
  key: string
  title: string
  timestamp: string
  durationLabel?: string
  timeRangeLabel?: string
}

type ResolvedFermentationTimeline = {
  roomHours: number
  roomTemperatureCelsius: number
  coldHours: number
  coldTemperatureCelsius: number
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function buildFermentationTimeline(
  form: FormState,
  selectedPreset: PresetMetadata | undefined,
  startedAt: Date = new Date(),
): FermentationTimelineEntry[] {
  const schedule = resolveFermentationTimeline(form, selectedPreset)
  const timeline: FermentationTimelineEntry[] = []
  let cursor = new Date(startedAt)

  if (form.doughMethod === 'DIRECT') {
    timeline.push(buildInstantEntry('mix', 'Mix dough', cursor))
    cursor = appendFermentationStages(timeline, schedule, cursor)
    timeline.push(buildInstantEntry('ready', 'Ready to bake', cursor))
    return timeline
  }

  const prefermentLabel = form.doughMethod === 'POOLISH' ? 'poolish' : 'biga'

  timeline.push(buildInstantEntry('mix-preferment', `Mix ${prefermentLabel}`, cursor))

  if (schedule.roomHours > 0) {
    const endAt = addHours(cursor, schedule.roomHours)
    timeline.push(
      buildDurationEntry(
        'preferment-ferment',
        `Ferment ${prefermentLabel}`,
        cursor,
        endAt,
        schedule.roomHours,
        schedule.roomTemperatureCelsius,
      ),
    )
    cursor = endAt
  }

  timeline.push(buildInstantEntry('final-mix', 'Final mix', cursor))

  if (schedule.coldHours > 0) {
    const endAt = addHours(cursor, schedule.coldHours)
    timeline.push(
      buildDurationEntry(
        'cold-ferment',
        'Cold ferment',
        cursor,
        endAt,
        schedule.coldHours,
        schedule.coldTemperatureCelsius,
      ),
    )
    cursor = endAt
  }

  timeline.push(buildInstantEntry('ready', 'Ready to bake', cursor))
  return timeline
}

function appendFermentationStages(
  timeline: FermentationTimelineEntry[],
  schedule: ResolvedFermentationTimeline,
  startedAt: Date,
): Date {
  let cursor = startedAt

  if (schedule.roomHours > 0) {
    const endAt = addHours(cursor, schedule.roomHours)
    timeline.push(
      buildDurationEntry(
        'room-ferment',
        'Room ferment',
        cursor,
        endAt,
        schedule.roomHours,
        schedule.roomTemperatureCelsius,
      ),
    )
    cursor = endAt
  }

  if (schedule.coldHours > 0) {
    const endAt = addHours(cursor, schedule.coldHours)
    timeline.push(
      buildDurationEntry(
        'cold-ferment',
        'Cold ferment',
        cursor,
        endAt,
        schedule.coldHours,
        schedule.coldTemperatureCelsius,
      ),
    )
    cursor = endAt
  }

  return cursor
}

function resolveFermentationTimeline(
  form: FormState,
  selectedPreset: PresetMetadata | undefined,
): ResolvedFermentationTimeline {
  if (form.fermentationSchedule) {
    return form.fermentationSchedule
  }

  const roomHours = selectedPreset?.roomHours ?? 0
  const coldHours = selectedPreset?.coldHours ?? 0

  return {
    roomHours,
    roomTemperatureCelsius: form.roomTemperatureCelsius,
    coldHours,
    coldTemperatureCelsius: form.coldTemperatureCelsius,
  }
}

function buildInstantEntry(
  key: string,
  title: string,
  date: Date,
): FermentationTimelineEntry {
  return {
    key,
    title,
    timestamp: formatTimelineTimestamp(date),
  }
}

function buildDurationEntry(
  key: string,
  title: string,
  startedAt: Date,
  endedAt: Date,
  durationHours: number,
  temperatureCelsius: number,
): FermentationTimelineEntry {
  return {
    key,
    title,
    timestamp: formatTimelineTimestamp(endedAt),
    durationLabel: `${formatHours(durationHours)} at ${formatTemperature(temperatureCelsius)}C`,
    timeRangeLabel: `${formatTimelineTimestamp(startedAt)} to ${formatTimelineTimestamp(endedAt)}`,
  }
}

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000)
}

function formatTimelineTimestamp(date: Date): string {
  return `${date.getDate()} ${MONTH_LABELS[date.getMonth()]} · ${formatClock(date)}`
}

function formatClock(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function formatHours(hours: number): string {
  return `${trimTrailingZero(hours)}h`
}

function formatTemperature(value: number): string {
  return trimTrailingZero(value)
}

function trimTrailingZero(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, '')
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

export function getTimelineSummaryLabel(form: FormState): string {
  return methodTimelineLabel(form.doughMethod)
}

function methodTimelineLabel(method: DoughMethod): string {
  switch (method) {
    case 'DIRECT':
      return 'Direct dough flow'
    case 'POOLISH':
      return 'Poolish workflow'
    case 'BIGA':
      return 'Biga workflow'
  }
}
