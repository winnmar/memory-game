import type { Ref } from 'vue'
import type { CS2Skin } from '@/types/CsSkin'
import type { Difficulty } from '@/types/GameState'
import type { GameSeed } from '@/types/Seed'
import type { Tile } from '@/types/Tile'
import { computed, ref } from 'vue'
import { shuffleArray } from '@/utils/arrayUtils'

const TILE_SIZE = 150
const PADDING = 10

interface TileManagerOptions {
  skins: CS2Skin[]
  totalPairs: Ref<number>
  cols: Ref<number>
  rows: Ref<number>
  selectedDifficulty: Ref<Difficulty>
}

export function useTileManager({ skins, totalPairs, cols, rows, selectedDifficulty }: TileManagerOptions) {
  const tiles = ref<Tile[]>([])

  const canvasWidth = computed(() => cols.value * TILE_SIZE + (cols.value - 1) * PADDING)
  const canvasHeight = computed(() => rows.value * TILE_SIZE + (rows.value - 1) * PADDING)

  const createTiles = (seed?: GameSeed) => {
    const pairsNeeded = totalPairs.value
    let selectedSkins: CS2Skin[] = []

    if (seed) {
      const skinMap = new Map(skins.map(skin => [skin.id, skin]))
      selectedSkins = seed.skinPositions.map(pos => skinMap.get(pos.skinId)!).filter(Boolean)
    }
    else {
      selectedSkins = [...skins].sort(() => Math.random() - 0.5).slice(0, pairsNeeded)
    }

    const pairs = selectedSkins.concat(selectedSkins)
    if (!seed) {
      shuffleArray(pairs)
    }

    tiles.value = pairs.map((skin, i) => {
      const col = i % cols.value
      const row = Math.floor(i / cols.value)
      return {
        x: col * (TILE_SIZE + PADDING),
        y: row * (TILE_SIZE + PADDING),
        width: TILE_SIZE,
        height: TILE_SIZE,
        skin,
        isFlipped: false,
        isMatched: false,
        flipProgress: 0,
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        flipRotation: 0,
        animating: false,
      }
    })
  }

  const generateSeedFromCurrentLayout = (): GameSeed => {
    const id = `seed-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`
    const difficulty = selectedDifficulty.value

    const skinPositions = tiles.value.map((tile, i) => ({
      skinId: tile.skin.id,
      position: i,
    }))

    return { id, difficulty, skinPositions }
  }

  return {
    tiles,
    createTiles,
    generateSeedFromCurrentLayout,
    canvasWidth,
    canvasHeight,
  }
}
