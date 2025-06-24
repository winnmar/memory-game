import type { GameSeed } from './Seed'

export interface GameHistoryEntry {
  seed: GameSeed
  time: number
  moves: number
  completedAt: string
}

export interface TileState {
  position: number
  skinId: number
  isFlipped: boolean
  isMatched: boolean
}

export interface CurrentGameState extends GameHistoryEntry {
  pairsFound: number
  isGameOver: boolean
  timerRunning: boolean
  seedInput: string
  tileStates: TileState[]
  flippedTiles: number[]
  savedAt: string
}

export type Efficiency = 'Excellent' | 'Good' | 'Average' | 'Poor'

export type Difficulty = 'easy' | 'medium' | 'hard'
