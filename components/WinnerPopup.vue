<template>
  <div class="winner-container">
    <div class="winner-popup">
      <div class="winner-header">
        <h1>🎉 You Win! 🎉</h1>
      </div>

      <div class="game-stats">
        <div class="stat-item">
          <span>Difficulty:</span>
          <span
            class="difficulty-badge"
            :class="difficulty"
          >
            {{ difficulty }}
          </span>
        </div>
        <div class="stat-item">
          <span>Time:</span>
          <span>{{ formattedTime }}</span>
        </div>
        <div class="stat-item">
          <span>Moves:</span>
          <span>{{ moves }}</span>
        </div>
        <div class="stat-item">
          <span>Efficiency:</span>
          <span
            class="stat-value"
            :class="efficiencyClass"
          >
            {{ efficiency }}
          </span>
        </div>
      </div>

      <div class="seed-section">
        <div class="seed-header">
          <span class="seed-label">Game Seed:</span>
          <button
            class="btn btn-small btn-success"
            :disabled="showCopiedMessage"
            @click="copySeed"
          >
            {{ showCopiedMessage ? 'Seed Copied!' : 'Copy Seed' }}
          </button>
        </div>
        <div class="seed-display">
          <code class="seed-id">{{ seedId }}</code>
        </div>
      </div>

      <div class="actions">
        <button
          class="btn btn-danger"
          @click="closePopup"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Difficulty } from '@/types/GameState'

interface Props {
  difficulty: Difficulty
  time: number
  moves: number
  pairsFound: number
  totalPairs: number
  seedId: string
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { createConfetti, cleanupConfetti } = useConfetti()
const { copySeedId } = useSeeds()

const showCopiedMessage = ref(false)

const formattedTime = computed(() => formatTime(props.time))

const efficiency = computed(() => calculateEfficiency(props.moves, props.time))

const efficiencyClass = computed(() => {
  return getEfficiencyClass(efficiency.value)
})

async function copySeed() {
  try {
    await copySeedId(props.seedId)
    showCopiedMessage.value = true
    setTimeout(() => {
      showCopiedMessage.value = false
    }, 2000)
  }
  catch (error) {
    console.error('Failed to copy seed:', error)
  }
}

function closePopup() {
  cleanupConfetti()
  emit('close')
}

onMounted(async () => {
  await nextTick()
  setTimeout(() => {
    createConfetti()
  }, 100)
})
</script>

<style scoped>
.winner-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--background-unfocused);
}

.winner-popup {
    background: var(--card-gradient);
    padding: 2rem;
    border-radius: var(--border-radius);
    text-align: center;
    z-index: 1001;
    box-shadow: 0 20px 40px var(--shadow-color);
    animation: slideIn 0.5s ease-out;
}

.game-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
    padding: 1rem;
    background: var(--background-dark-transparent);
    border-radius: var(--border-radius);
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

.seed-section {
    margin-bottom: 2rem;
    padding: 1rem;
    background: var(--background-dark-transparent);
    border-radius: var(--border-radius);
}

.seed-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
    .winner-popup {
        padding: 1.5rem;
        margin: 1rem;
        width: calc(100% - 2rem);
    }

    .winner-header h1 {
        font-size: 2rem;
    }

    .game-stats {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;
    }

    .seed-header {
        flex-direction: column;
        align-items: stretch;
    }

    .copy-btn {
        width: 100%;
    }

    .actions {
        flex-direction: column;
    }

    .btn {
        width: 100%;
    }
}

@media (max-width: 480px) {
    .game-stats {
        grid-template-columns: 1fr;
    }
}
</style>
