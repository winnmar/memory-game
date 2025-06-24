import type { Ref } from 'vue'
import type { CurrentGameState, GameHistoryEntry, TileState } from '@/types/GameState'
import type { GameSeed } from '@/types/Seed'
import type { Tile } from '@/types/Tile'
import { onMounted, ref } from 'vue'

const CURRENT_GAME_KEY = 'memoryGameCurrentState'

interface UseGameStateParams {
  isGameOver: Ref<boolean>
  currentSeed: Ref<GameSeed | null>
  tiles: Ref<Tile[]>
  flippedTiles: Ref<Tile[]>
  timer: Ref<number>
  moves: Ref<number>
  pairsFound: Ref<number>
  timerRunning: Ref<boolean>
  seedInput: Ref<string>
}

export function useGameState(params: UseGameStateParams) {
  const { isGameOver, currentSeed, tiles, flippedTiles, timer, moves, pairsFound, timerRunning, seedInput } = params

  const hasSavedGame = ref(false)
  const showRestoredNotification = ref(false)
  const gameHistory = ref<GameHistoryEntry[]>([])

  const saveCurrentGameState = () => {
    if (isGameOver.value || !currentSeed.value) {
      localStorage.removeItem(CURRENT_GAME_KEY)
      hasSavedGame.value = false
      return
    }

    const tileStates: TileState[] = tiles.value.map((tile, index) => ({
      position: index,
      skinId: tile.skin.id,
      isFlipped: tile.isFlipped,
      isMatched: tile.isMatched,
    }))

    const flippedTileIndices = flippedTiles.value.map(tile => tiles.value.indexOf(tile))

    const currentGameState: CurrentGameState = {
      seed: currentSeed.value,
      time: timer.value,
      moves: moves.value,
      completedAt: new Date().toISOString(),
      pairsFound: pairsFound.value,
      isGameOver: isGameOver.value,
      timerRunning: timerRunning.value,
      seedInput: seedInput.value,
      tileStates,
      flippedTiles: flippedTileIndices,
      savedAt: new Date().toISOString(),
    }

    try {
      localStorage.setItem(CURRENT_GAME_KEY, JSON.stringify(currentGameState))
      hasSavedGame.value = true
    }
    catch (error) {
      console.warn('Failed to save current game state:', error)
    }
  }

  const loadCurrentGameState = (): CurrentGameState | null => {
    try {
      const saved = localStorage.getItem(CURRENT_GAME_KEY)
      if (!saved) {
        hasSavedGame.value = false
        return null
      }

      const gameState: CurrentGameState = JSON.parse(saved)

      const savedAt = new Date(gameState.savedAt)
      const now = new Date()
      const hoursDiff = (now.getTime() - savedAt.getTime()) / (1000 * 60 * 60)

      if (hoursDiff > 24) {
        localStorage.removeItem(CURRENT_GAME_KEY)
        hasSavedGame.value = false
        return null
      }

      hasSavedGame.value = true
      return gameState
    }
    catch (error) {
      console.warn('Failed to load current game state:', error)
      localStorage.removeItem(CURRENT_GAME_KEY)
      hasSavedGame.value = false
      return null
    }
  }

  const clearCurrentGameState = () => {
    localStorage.removeItem(CURRENT_GAME_KEY)
    hasSavedGame.value = false
  }

  const setupAutoSave = () => {
    setInterval(() => {
      if (!isGameOver.value && moves.value > 0 && currentSeed.value) {
        saveCurrentGameState()
      }
    }, 30000)

    window.addEventListener('beforeunload', () => {
      if (!isGameOver.value && moves.value > 0 && currentSeed.value) {
        saveCurrentGameState()
      }
    })
  }

  const loadHistory = (): GameHistoryEntry[] => {
    const raw = localStorage.getItem('memoryGameHistory')
    if (!raw)
      return []
    try {
      return JSON.parse(raw)
    }
    catch {
      return []
    }
  }

  const saveHistoryEntry = (entry: GameHistoryEntry) => {
    const history = loadHistory()
    history.unshift(entry)
    localStorage.setItem('memoryGameHistory', JSON.stringify(history))
    gameHistory.value = history
  }

  onMounted(() => {
    hasSavedGame.value = !!localStorage.getItem(CURRENT_GAME_KEY)
    gameHistory.value = loadHistory()
  })

  return {
    hasSavedGame,
    showRestoredNotification,
    gameHistory,
    saveCurrentGameState,
    loadCurrentGameState,
    clearCurrentGameState,
    setupAutoSave,
    saveHistoryEntry,
  }
}
