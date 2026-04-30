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

type TimelineStageDefinition = {
  key: string
  title: string
  durationHours: number
  temperatureCelsius: number
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
    cursor = appendStages(timeline, buildDirectStages(schedule), cursor)
    timeline.push(buildInstantEntry('ready', 'Ready to bake', cursor))
    return timeline
  }

  const prefermentLabel = getPrefermentLabel(form.doughMethod)

  timeline.push(buildInstantEntry('mix-preferment', `Mix ${prefermentLabel}`, cursor))
  cursor = appendStages(timeline, buildPrefermentStages(schedule, prefermentLabel), cursor)

  timeline.push(buildInstantEntry('final-mix', 'Final mix', cursor))
  cursor = appendStages(timeline, buildColdStages(schedule), cursor)

  timeline.push(buildInstantEntry('ready', 'Ready to bake', cursor))
  return timeline
}

function appendStages(
  timeline: FermentationTimelineEntry[],
  stages: TimelineStageDefinition[],
  startedAt: Date,
): Date {
  let cursor = startedAt

  for (const stage of stages) {
    const endAt = addHours(cursor, stage.durationHours)
    timeline.push(
      buildDurationEntry(stage.key, stage.title, cursor, endAt, stage.durationHours, stage.temperatureCelsius),
    )
    cursor = endAt
  }

  return cursor
}

function buildDirectStages(schedule: ResolvedFermentationTimeline): TimelineStageDefinition[] {
  return [
    buildStage('room-ferment', 'Room ferment', schedule.roomHours, schedule.roomTemperatureCelsius),
    buildStage('cold-ferment', 'Cold ferment', schedule.coldHours, schedule.coldTemperatureCelsius),
  ].filter(isDefined)
}

function buildPrefermentStages(
  schedule: ResolvedFermentationTimeline,
  prefermentLabel: string,
): TimelineStageDefinition[] {
  return [
    buildStage(
      'preferment-ferment',
      `Ferment ${prefermentLabel}`,
      schedule.roomHours,
      schedule.roomTemperatureCelsius,
    ),
  ].filter(isDefined)
}

function buildColdStages(schedule: ResolvedFermentationTimeline): TimelineStageDefinition[] {
  return [buildStage('cold-ferment', 'Cold ferment', schedule.coldHours, schedule.coldTemperatureCelsius)].filter(
    isDefined,
  )
}

function buildStage(
  key: string,
  title: string,
  durationHours: number,
  temperatureCelsius: number,
): TimelineStageDefinition | null {
  if (durationHours <= 0) {
    return null
  }

  return { key, title, durationHours, temperatureCelsius }
}

function resolveFermentationTimeline(
  form: FormState,
  selectedPreset: PresetMetadata | undefined,
): ResolvedFermentationTimeline {
  if (form.fermentationMode === 'MANUAL' && form.fermentationSchedule) {
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

function getPrefermentLabel(method: DoughMethod): 'poolish' | 'biga' {
  return method === 'POOLISH' ? 'poolish' : 'biga'
}

function isDefined<T>(value: T | null): value is T {
  return value !== null
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
