import type { Efficiency } from '@/types/GameState'

export function calculateEfficiency(moves: number, time: number): Efficiency {
  const efficiency = moves + (time / 10)
  if (efficiency < 20)
    return 'Excellent'
  if (efficiency < 30)
    return 'Good'
  if (efficiency < 40)
    return 'Average'
  return 'Poor'
}

export function getEfficiencyClass(efficiency: Efficiency): string {
  return efficiency.toLowerCase()
}

export function calculateEfficiencyScore(moves: number, time: number): number {
  return moves + (time / 10)
}
