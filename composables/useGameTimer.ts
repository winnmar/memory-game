import { computed, ref } from 'vue'
import { formatTime } from '@/utils/timeUtils'

export function useGameTimer() {
  const timer = ref(0)
  let timerInterval: number | null = null
  const timerRunning = ref(false)

  const startTimer = () => {
    if (!timerRunning.value) {
      timerRunning.value = true
      timerInterval = window.setInterval(() => {
        timer.value++
      }, 1000)
    }
  }

  const stopTimer = () => {
    timerRunning.value = false
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }

  const resetTimer = () => {
    stopTimer()
    timer.value = 0
  }

  const formattedTime = computed(() => {
    return formatTime(timer.value)
  })

  return {
    timer,
    timerRunning,
    formattedTime,
    startTimer,
    stopTimer,
    resetTimer,
  }
}
