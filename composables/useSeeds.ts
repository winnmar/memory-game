import type { GameHistoryEntry } from '@/types/GameState'
import type { GameSeed } from '@/types/Seed'

export function useSeeds() {
  const sampleSeeds: GameSeed[] = [
    {
      id: 'seed1',
      difficulty: 'easy',
      skinPositions: [
        { skinId: 1, position: 0 },
        { skinId: 1, position: 1 },
        { skinId: 2, position: 2 },
        { skinId: 2, position: 3 },
        { skinId: 3, position: 4 },
        { skinId: 3, position: 5 },
      ],
    },
    {
      id: 'seed2',
      difficulty: 'medium',
      skinPositions: [
        { skinId: 4, position: 0 },
        { skinId: 4, position: 1 },
        { skinId: 5, position: 2 },
        { skinId: 5, position: 3 },
        { skinId: 6, position: 4 },
        { skinId: 6, position: 5 },
        { skinId: 7, position: 6 },
        { skinId: 7, position: 7 },
        { skinId: 8, position: 8 },
        { skinId: 8, position: 9 },
        { skinId: 9, position: 10 },
        { skinId: 9, position: 11 },
        { skinId: 10, position: 12 },
        { skinId: 10, position: 13 },
        { skinId: 11, position: 14 },
        { skinId: 11, position: 15 },
      ],
    },
    {
      id: 'seed3',
      difficulty: 'hard',
      skinPositions: [
        { skinId: 12, position: 0 },
        { skinId: 12, position: 1 },
        { skinId: 13, position: 2 },
        { skinId: 13, position: 3 },
        { skinId: 14, position: 4 },
        { skinId: 14, position: 5 },
        { skinId: 15, position: 6 },
        { skinId: 15, position: 7 },
        { skinId: 16, position: 8 },
        { skinId: 16, position: 9 },
        { skinId: 17, position: 10 },
        { skinId: 17, position: 11 },
        { skinId: 18, position: 12 },
        { skinId: 18, position: 13 },
        { skinId: 19, position: 14 },
        { skinId: 19, position: 15 },
        { skinId: 20, position: 16 },
        { skinId: 20, position: 17 },
        { skinId: 1, position: 18 },
        { skinId: 1, position: 19 },
      ],
    },
  ]

  function getHistorySeeds(): GameSeed[] {
    try {
      const raw = localStorage.getItem('memoryGameHistory')
      if (!raw)
        return []

      const history: GameHistoryEntry[] = JSON.parse(raw)
      return history.map(entry => entry.seed)
    }
    catch (error) {
      console.warn('Failed to load history seeds:', error)
      return []
    }
  }

  function loadSeed(seedId: string, onLoad: (seed: GameSeed) => void) {
    const sampleSeed = sampleSeeds.find(s => s.id === seedId)
    if (sampleSeed) {
      onLoad(sampleSeed)
      return
    }

    const historySeeds = getHistorySeeds()
    const historySeed = historySeeds.find(s => s.id === seedId)
    if (historySeed) {
      onLoad(historySeed)
      return
    }

    console.warn('Seed not found:', seedId)
  }

  const copySeedId = async (seedId: string) => {
    try {
      await navigator.clipboard.writeText(seedId)
    }
    catch (err) {
      console.error('Failed to copy seed ID:', err)
    }
  }

  return {
    sampleSeeds,
    loadSeed,
    copySeedId,
  }
}
