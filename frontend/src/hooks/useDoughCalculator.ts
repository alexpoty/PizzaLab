import { useEffect, useMemo, useState } from 'react'
import { buildCalculationRequest, calculateDough, fetchDoughMetadata } from '../api/doughApi'
import { defaultForm, defaultMetadata } from '../data/doughDefaults'
import type { DoughCalculationResponse, DoughMetadata, FormState } from '../types/dough'

export function useDoughCalculator() {
  const [metadata, setMetadata] = useState<DoughMetadata>(defaultMetadata)
  const [form, setForm] = useState<FormState>(defaultForm)
  const [result, setResult] = useState<DoughCalculationResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDoughMetadata()
      .then((data) => setMetadata(data))
      .catch(() => setMetadata(defaultMetadata))
  }, [])

  const compatiblePresets = useMemo(
    () =>
      metadata.fermentationPresets.filter((preset) =>
        preset.compatibleDoughMethods.includes(form.doughMethod),
      ),
    [form.doughMethod, metadata.fermentationPresets],
  )
  const selectedPreset = form.fermentationSchedule
    ? undefined
    : compatiblePresets.find((preset) => preset.code === form.fermentationPreset) ??
      compatiblePresets[0]

  const calculate = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const requestBody = buildCalculationRequest(form, selectedPreset)
      setResult(await calculateDough(requestBody))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Calculation failed')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    metadata,
    form,
    setForm,
    result,
    isLoading,
    error,
    compatiblePresets,
    selectedPreset,
    calculate,
  }
}
