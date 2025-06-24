<template>
  <div class="game-history">
    <div class="history-header">
      <h2>Game History</h2>
      <button
        v-if="gameHistory.length > 0"
        class="btn btn-danger"
        @click="clearHistory"
      >
        Clear History
      </button>
    </div>

    <div
      v-if="gameHistory.length === 0"
      class="empty-state"
    >
      <p>No completed games yet. Start playing to see your history!</p>
    </div>

    <div
      v-else
      class="history-list"
    >
      <div
        v-for="entry in gameHistory"
        :key="entry.seed.id"
        class="history-item"
      >
        <div class="history-item-header">
          <div class="seed-info seed-display">
            <span class="seed-id">{{ entry.seed.id }}</span>
            <span
              class="difficulty-badge"
              :class="entry.seed.difficulty"
            >
              {{ entry.seed.difficulty }}
            </span>
            <button
              class="btn btn-small btn-success"
              @click="copySeedId(entry.seed.id)"
            >
              Copy Seed
            </button>
          </div>
          <div class="completion-date">
            {{ formatDate(entry.completedAt) }}
          </div>
        </div>

        <div class="history-item-stats">
          <div class="stat">
            <span class="stat-label">Moves:</span>
            <span class="stat-value">{{ entry.moves }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Time:</span>
            <span class="stat-value">{{ formatTime(entry.time) }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Efficiency:</span>
            <span
              class="stat-value"
              :class="getEfficiencyClassForEntry(entry)"
            >
              {{ calculateEfficiency(entry.moves, entry.time) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GameHistoryEntry } from '@/types/GameState'

const { copySeedId } = useSeeds()

const gameHistory = ref<GameHistoryEntry[]>([])

function loadHistory(): GameHistoryEntry[] {
  const raw = localStorage.getItem('memoryGameHistory')
  if (!raw)
    return []
  try {
    return JSON.parse(raw)
  }
  catch {
    return []
  }
};

function clearHistory() {
  if (confirm('Are you sure you want to clear all game history? This action cannot be undone.')) {
    localStorage.removeItem('memoryGameHistory')
    gameHistory.value = []
  }
};

function getEfficiencyClassForEntry(entry: GameHistoryEntry): string {
  const efficiency = calculateEfficiency(entry.moves, entry.time)
  return getEfficiencyClass(efficiency)
}

onMounted(() => {
  gameHistory.value = loadHistory()
})
</script>

<style scoped>
.game-history {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  overflow-x: hidden;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid var(--secondary-color);
  flex-wrap: wrap;
  gap: 10px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--secondary-color);
  font-size: 1.1em;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.history-item {
  border: 1px solid var(--secondary-color);
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s ease;
  background: var(--card-gradient);
}

.history-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px var(--background-color-shadow);
}

.history-item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
}

.seed-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.completion-date {
  font-size: 0.9em;
  text-align: right;
  flex-shrink: 0;
}

.history-item-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-label {
  font-size: 0.8em;
  margin-bottom: 4px;
}

.history-item-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .game-history {
    padding: 15px;
  }

  .history-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .clear-btn {
    align-self: flex-end;
  }

  .history-item-header {
    flex-direction: column;
    gap: 10px;
  }

  .seed-info {
    justify-content: space-between;
    width: 100%;
  }

  .completion-date {
    text-align: left;
  }

  .history-item-stats {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .history-item-actions {
    justify-content: stretch;
  }

  .replay-btn, .copy-btn {
    flex: 1;
  }
}
</style>
