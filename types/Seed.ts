import type { Difficulty } from './GameState'

export interface GameSeed {
  id: string
  difficulty: Difficulty
  skinPositions: {
    skinId: number
    position: number
  }[]
}
