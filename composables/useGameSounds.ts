import { onMounted } from 'vue'

type SoundType = 'flip' | 'match' | 'win'

export function useGameSounds() {
  const sounds: Record<SoundType, HTMLAudioElement | null> = {
    flip: null,
    match: null,
    win: null,
  }

  onMounted(() => {
    sounds.flip = new Audio('/sounds/flip.mp3')
    sounds.match = new Audio('/sounds/match.mp3')
    sounds.win = new Audio('/sounds/win.mp3')
    Object.values(sounds).forEach((sound) => {
      if (sound) {
        sound.preload = 'auto'
      }
    })
  })

  const playSound = (soundType: SoundType) => {
    const sound = sounds[soundType]
    if (sound) {
      sound.currentTime = 0
      sound.play().catch((error) => {
        console.warn(`Failed to play ${soundType} sound:`, error)
      })
    }
  }

  return {
    playSound,
  }
}
