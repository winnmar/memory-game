<template>
  <div class="memory-game">
    <div class="card game-controls">
      <div class="difficulty-selector">
        <label for="difficulty">Difficulty:</label>
        <select
          id="difficulty"
          v-model="selectedDifficulty"
          @change="onDifficultyChange"
        >
          <option value="easy">
            Easy (2x3)
          </option>
          <option value="medium">
            Medium (4x4)
          </option>
          <option value="hard">
            Hard (4x5)
          </option>
        </select>
      </div>
      <div class="seed-controls">
        <input
          v-model="seedInput"
          type="text"
          placeholder="Enter seed ID"
          class="input-field seed-input"
          @keyup.enter="handleLoadSeed"
        >
        <button
          class="btn btn-primary"
          @click="handleLoadSeed"
        >
          Load Seed
        </button>
      </div>
      <button
        class="btn btn-success"
        @click="restartGame()"
      >
        Restart Game
      </button>
    </div>

    <div class="card game-stats">
      <div class="stat">
        Moves: {{ moves }}
      </div>
      <div class="stat">
        Pairs Found: {{ pairsFound }}/{{ totalPairs }}
      </div>
      <div class="stat">
        Time: {{ formattedTime }}
      </div>
    </div>
    <canvas
      ref="canvas"
      :width="canvasWidth"
      :height="canvasHeight"
      :class="{ 'game-over': isGameOver }"
      @click="handleClick"
      @touchstart.prevent="handleClick"
      @mousemove="handleMouseMove"
    />

    <button
      class="btn btn-secondary"
      @click="showHistory = !showHistory"
    >
      {{ showHistory ? 'Hide History' : 'Show History' }}
    </button>

    <Transition name="history-transition">
      <div
        v-if="showHistory"
        class="history-container"
      >
        <GameHistory @replay-game="handleReplayGame" />
      </div>
    </Transition>

    <WinnerPopup
      v-if="isGameOver"
      :difficulty="selectedDifficulty"
      :time="timer"
      :moves="moves"
      :pairs-found="pairsFound"
      :total-pairs="totalPairs"
      :seed-id="currentSeed?.id || ''"
      @close="handleWinnerPopupClose"
    />

    <Notification
      v-if="showRestoredNotification"
      message="✅ Saved game restored! You can continue from where you left off."
      type="success"
      @close="showRestoredNotification = false"
    />

    <Notification
      v-if="showErrorNotification"
      :message="errorMessage"
      type="error"
      @close="showErrorNotification = false"
    />
  </div>
</template>

<script setup lang="ts">
import type { CurrentGameState, Difficulty } from '@/types/GameState'
import type { GameSeed } from '@/types/Seed'
import type { Tile } from '@/types/Tile'
import { gsap } from 'gsap'

const { skins } = useCsSkins()
const { loadSeed } = useSeeds()
const { playSound } = useGameSounds()
const { timer, timerRunning, formattedTime, startTimer, stopTimer, resetTimer } = useGameTimer()

const selectedDifficulty = ref<Difficulty>('medium')

const difficultySettings = {
  easy: { rows: 2, cols: 3, pairs: 3 },
  medium: { rows: 4, cols: 4, pairs: 8 },
  hard: { rows: 4, cols: 5, pairs: 10 },
}

const currentSettings = computed(() => difficultySettings[selectedDifficulty.value])
const rows = computed(() => currentSettings.value.rows)
const cols = computed(() => currentSettings.value.cols)
const totalPairs = computed(() => currentSettings.value.pairs)

const canvas = ref<HTMLCanvasElement | null>(null)
const moves = ref(0)
const pairsFound = ref(0)
const isGameOver = ref(false)
const seedInput = ref('')
const currentSeed = ref<GameSeed | null>(null)
const flippedTiles = ref<Tile[]>([])
const showHistory = ref(false)
const isAnimating = ref(false)
const showErrorNotification = ref(false)
const errorMessage = ref('')

const { tiles, createTiles, generateSeedFromCurrentLayout, canvasWidth, canvasHeight } = useTileManager({
  skins,
  totalPairs,
  cols,
  rows,
  selectedDifficulty,
})

const { draw } = useCanvasDrawer({ canvas: canvas as Ref<HTMLCanvasElement | null>, tiles })

const {
  showRestoredNotification,
  saveCurrentGameState,
  loadCurrentGameState,
  clearCurrentGameState,
  setupAutoSave,
  saveHistoryEntry,
} = useGameState({
  isGameOver,
  currentSeed,
  tiles,
  flippedTiles,
  timer,
  moves,
  pairsFound,
  timerRunning,
  seedInput,
})

const { animateFlipTile, handleMouseMove } = useAnimations(canvas as Ref<HTMLCanvasElement | null>, tiles, draw, gsap, isAnimating)

function handleReplayGame(seedId: string) {
  loadSeed(seedId, (seed) => {
    restartGame(seed)
    showHistory.value = false
  }, () => {
    errorMessage.value = '❌ Seed not found! Please check the seed ID and try again.'
    showErrorNotification.value = true
    setTimeout(() => {
      showErrorNotification.value = false
    }, 5000)
  })
};

function handleLoadSeed() {
  if (!seedInput.value.trim()) {
    errorMessage.value = '❌ Please enter a seed ID to load.'
    showErrorNotification.value = true
    setTimeout(() => {
      showErrorNotification.value = false
    }, 5000)
    return
  }

  loadSeed(seedInput.value, (seed) => {
    restartGame(seed)
  }, () => {
    errorMessage.value = '❌ Seed not found! Please check the seed ID and try again.'
    showErrorNotification.value = true
    setTimeout(() => {
      showErrorNotification.value = false
    }, 5000)
  })
}

function handleClick(event: MouseEvent | TouchEvent) {
  if (!canvas.value || isGameOver.value)
    return

  const rect = canvas.value.getBoundingClientRect()

  const scaleX = canvas.value.width / rect.width
  const scaleY = canvas.value.height / rect.height

  let clientX: number, clientY: number

  if (event instanceof TouchEvent) {
    if (event.touches.length === 0)
      return
    event.preventDefault()
    clientX = event.touches[0].clientX
    clientY = event.touches[0].clientY
  }
  else {
    clientX = event.clientX
    clientY = event.clientY
  }

  const x = (clientX - rect.left) * scaleX
  const y = (clientY - rect.top) * scaleY

  handleTileClick(x, y)
}

function handleTileClick(x: number, y: number) {
  if (!timerRunning.value && moves.value === 0 && flippedTiles.value.length === 0) {
    startTimer()
  }

  const clickedTile = tiles.value.find(
    tile =>
      x >= tile.x
      && x <= tile.x + tile.width
      && y >= tile.y
      && y <= tile.y + tile.height
      && !tile.isMatched
      && !tile.isFlipped
      && !tile.animating,
  )

  if (!clickedTile || flippedTiles.value.length >= 2) {
    return
  }

  animateFlipTile(clickedTile, true, 0.22, 'expo.inOut', () => playSound('flip'), draw)
  flippedTiles.value.push(clickedTile)

  if (flippedTiles.value.length === 2) {
    moves.value++
    setTimeout(() => saveCurrentGameState(), 100)

    setTimeout(() => {
      const [t1, t2] = flippedTiles.value
      if (t1.skin.id === t2.skin.id) {
        t1.isMatched = true
        t2.isMatched = true
        pairsFound.value++
        playSound('match')
        const masterTimeline = gsap.timeline()
        masterTimeline.to([t1, t2], {
          scale: 1.1,
          duration: 0.2,
          ease: 'back.out(1.7)',
          onUpdate: draw,
        })
          .to([t1, t2], {
            scale: 1,
            duration: 0.2,
            ease: 'power2.out',
            onUpdate: draw,
          })
        if (pairsFound.value === totalPairs.value) {
          isGameOver.value = true
          playSound('win')
          stopTimer()
          clearCurrentGameState()
          if (currentSeed.value) {
            saveHistoryEntry({
              seed: currentSeed.value,
              time: timer.value,
              moves: moves.value,
              completedAt: new Date().toISOString(),
            })
          }
        }
        else {
          setTimeout(() => saveCurrentGameState(), 100)
        }
        flippedTiles.value = []
      }
      else {
        setTimeout(() => {
          animateFlipTile(t1, false, 0.13, 'expo.inOut', () => playSound('flip'), draw)
          animateFlipTile(t2, false, 0.13, 'expo.inOut', () => playSound('flip'), draw)
          setTimeout(() => {
            flippedTiles.value = []
            setTimeout(() => saveCurrentGameState(), 100)
          }, 140)
        }, 250)
      }
    }, 800)
  }
  else {
    setTimeout(() => saveCurrentGameState(), 100)
  }
}

function restartGame(seed?: GameSeed) {
  clearCurrentGameState()

  if (seed) {
    selectedDifficulty.value = seed.difficulty
  }

  moves.value = 0
  pairsFound.value = 0
  isGameOver.value = false
  flippedTiles.value = []
  if (!seed) {
    seedInput.value = ''
  }
  resetTimer()

  gsap.killTweensOf(tiles.value)
  gsap.killTweensOf(canvas.value)

  createTiles(seed)
  draw()

  isAnimating.value = true

  const timeline = gsap.timeline({
    onComplete: () => {
      isAnimating.value = false
    },
  })

  timeline.fromTo(tiles.value, {
    scale: 0,
    flipRotation: 180,
  }, {
    scale: 1,
    flipRotation: 0,
    duration: 0.6,
    ease: 'back.out(1.7)',
    stagger: 0.1,
    onUpdate: draw,
  })

  if (seed) {
    currentSeed.value = seed
  }
  else {
    currentSeed.value = null
    setTimeout(() => {
      currentSeed.value = generateSeedFromCurrentLayout()
    }, 0)
  }
}

function onDifficultyChange() {
  clearCurrentGameState()
  restartGame()
}

function handleWinnerPopupClose() {
  isGameOver.value = false
  restartGame()
}

function restoreCurrentGameState(gameState: CurrentGameState) {
  selectedDifficulty.value = gameState.seed.difficulty
  moves.value = gameState.moves
  pairsFound.value = gameState.pairsFound
  timer.value = gameState.time
  isGameOver.value = gameState.isGameOver
  seedInput.value = gameState.seedInput
  currentSeed.value = gameState.seed

  createTiles(gameState.seed)

  gameState.tileStates.forEach((tileState) => {
    const tile = tiles.value[tileState.position]
    if (tile) {
      tile.isFlipped = tileState.isFlipped
      tile.isMatched = tileState.isMatched
    }
  })

  flippedTiles.value = gameState.flippedTiles
    .map(index => tiles.value[index])
    .filter(tile => tile && tile.isFlipped && !tile.isMatched)

  if (gameState.timerRunning && !isGameOver.value) {
    startTimer()
  }

  draw()

  isAnimating.value = true

  const matchedTiles = tiles.value.filter(tile => tile.isMatched)
  const flippedTilesForAnimation = tiles.value.filter(tile => tile.isFlipped && !tile.isMatched)
  const hiddenTiles = tiles.value.filter(tile => !tile.isFlipped && !tile.isMatched)

  const timeline = gsap.timeline({
    onComplete: () => {
      isAnimating.value = false
    },
  })

  if (matchedTiles.length > 0) {
    timeline.to(matchedTiles, {
      scale: 1.05,
      duration: 0.3,
      ease: 'back.out(1.7)',
      onUpdate: draw,
    }, 0)
      .to(matchedTiles, {
        scale: 1,
        duration: 0.2,
        ease: 'power2.out',
        onUpdate: draw,
      }, 0.3)
  }

  if (flippedTilesForAnimation.length > 0) {
    timeline.to(flippedTilesForAnimation, {
      scale: 1.02,
      duration: 0.2,
      ease: 'back.out(1.5)',
      onUpdate: draw,
    }, 0.1)
      .to(flippedTilesForAnimation, {
        scale: 1,
        duration: 0.15,
        ease: 'power2.out',
        onUpdate: draw,
      }, 0.3)
  }

  if (hiddenTiles.length > 0) {
    timeline.fromTo(hiddenTiles, {
      scale: 0.95,
      opacity: 0.8,
    }, {
      scale: 1,
      opacity: 1,
      duration: 0.4,
      ease: 'power2.out',
      onUpdate: draw,
    }, 0.2)
  }

  const gameStats = document.querySelector('.game-stats')
  if (gameStats) {
    timeline.to(gameStats, {
      scale: 1.02,
      duration: 0.2,
      ease: 'power2.out',
    }, 0.5)
      .to(gameStats, {
        scale: 1,
        duration: 0.2,
        ease: 'power2.out',
      }, 0.7)
  }
}

onMounted(() => {
  if (canvas.value) {
    const savedGameState = loadCurrentGameState()

    if (savedGameState) {
      restoreCurrentGameState(savedGameState)
      showRestoredNotification.value = true
      setTimeout(() => {
        showRestoredNotification.value = false
      }, 5000)
    }
    else {
      createTiles()

      isAnimating.value = true

      const timeline = gsap.timeline({
        onComplete: () => {
          isAnimating.value = false
        },
      })

      timeline.fromTo(tiles.value, {
        scale: 0,
        flipRotation: 180,
      }, {
        scale: 1,
        flipRotation: 0,
        duration: 0.6,
        ease: 'back.out(1.7)',
        stagger: 0.1,
        onUpdate: draw,
      })

      setTimeout(() => {
        currentSeed.value = generateSeedFromCurrentLayout()
      }, 0)
    }

    setupAutoSave()
  }
})

onUnmounted(() => {
  gsap.killTweensOf(tiles.value)
  gsap.killTweensOf(canvas.value)
  stopTimer()
})
</script>

<style scoped>
.memory-game {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  overflow-x: hidden;
}

.game-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
  justify-content: center;
}

.difficulty-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 15px;
  flex-wrap: wrap;
}

.game-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
  justify-content: center;
}

.stat {
  font-size: 1.1rem;
  padding: 8px 15px;
  min-width: 120px;
  text-align: center;
  flex-shrink: 0;
}

.seed-controls {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 8px 15px;
  border-radius: 8px;
  flex-wrap: wrap;
  max-width: 100%;
}

canvas {
  display: block;
  margin: 20px auto;
  transition: transform 0.3s;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: none;
  border-radius: 8px;
  box-shadow: 0 4px 8px var(--background-color-shadow);
  max-width: 100%;
  height: auto;
}

canvas.game-over {
  transform: scale(0.95);
}

.history-container {
  margin-top: 20px;
  width: 100%;
}

.history-transition-enter-active,
.history-transition-leave-active {
  transition: all 0.4s ease-in-out;
}

.history-transition-enter-from,
.history-transition-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

@media (max-width: 768px) {
  .memory-game {
    padding: 15px;
  }

  .game-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .difficulty-selector,
  .seed-controls,
  .restart-btn,
  .stat {
    width: 100%;
  }

  .difficulty-selector {
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .difficulty-selector select {
    flex: 1;
    max-width: 200px;
    min-width: 120px;
  }

  .seed-controls {
    width: 100%;
    flex-wrap: wrap;
    gap: 8px;
  }

  .seed-input {
    flex: 1;
    min-width: 150px;
    max-width: 100%;
  }

  .game-stats {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .stat {
    width: 100%;
    min-width: auto;
  }

  .restart-btn {
    width: 100%;
  }

  .restored-notification {
    position: fixed;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    flex-direction: column;
    gap: 10px;
    text-align: center;
    width: 90%;
    max-width: 400px;
  }

  .close-notification {
    margin-left: 0;
    align-self: flex-end;
  }
}
</style>
