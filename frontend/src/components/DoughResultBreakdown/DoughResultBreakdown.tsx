import './DoughResultBreakdown.scss'
import type { DoughCalculationResponse, IngredientGroup } from '../../types/dough'
import { formatGram } from '../../utils/format'

type DoughResultBreakdownProps = {
  result: DoughCalculationResponse
  layout?: 'panel' | 'modal'
}

export function DoughResultBreakdown({
  result,
  layout = 'panel',
}: DoughResultBreakdownProps) {
  const isModal = layout === 'modal'
  const mixGridClassName = [
    'mix-grid',
    isModal ? 'mix-grid-modal' : '',
    !result.preferment ? 'mix-grid-single' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <div className={`ingredient-list${isModal ? ' ingredient-list-modal' : ''}`}>
        <IngredientRow label="Flour" value={result.flourGrams} />
        <IngredientRow label="Water" value={result.waterGrams} />
        <IngredientRow label="Salt" value={result.saltGrams} />
        <IngredientRow label="Yeast" value={result.yeastGrams} />
      </div>

      <div className={mixGridClassName}>
        {result.preferment && <MixBlock title="Preferment" group={result.preferment} headingTag="h4" />}
        <MixBlock title="Final mix" group={result.finalMix} headingTag="h4" />
      </div>
    </>
  )
}

function MixBlock({
  title,
  group,
  headingTag,
}: {
  title: string
  group: IngredientGroup
  headingTag: 'h3' | 'h4'
}) {
  const Heading = headingTag

  return (
    <div className="mix-block">
      <Heading>{title}</Heading>
      <IngredientRow label="Flour" value={group.flourGrams} compact />
      <IngredientRow label="Water" value={group.waterGrams} compact />
      {typeof group.saltGrams === 'number' && <IngredientRow label="Salt" value={group.saltGrams} compact />}
      <IngredientRow label="Yeast" value={group.yeastGrams} compact />
    </div>
  )
}

function IngredientRow({
  label,
  value,
  compact = false,
}: {
  label: string
  value: number
  compact?: boolean
}) {
  return (
    <div className={compact ? 'ingredient-row compact' : 'ingredient-row'}>
      <span>{label}</span>
      <strong>{formatGram(value)}</strong>
    </div>
  )
}
