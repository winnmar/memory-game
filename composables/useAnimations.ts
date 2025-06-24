import type { gsap as gsapType } from 'gsap'
import type { Ref } from 'vue'
import type { Tile } from '@/types/Tile'
import gsap from 'gsap'

export function useAnimations(
  canvas: Ref<HTMLCanvasElement | null>,
  tiles: Ref<Tile[]>,
  draw: () => void,
  gsapInstance: typeof gsapType,
  isAnimating?: Ref<boolean>,
) {
  let lastParallaxUpdate = 0
  const PARALLAX_THROTTLE = 16 // ~60fps
  let mouseX = 0
  let mouseY = 0

  const animateFlipTile = (tile: Tile, isFlipping: boolean, duration = 0.22, ease = 'expo.inOut', playSound: () => void, draw: () => void) => {
    if (tile.animating) {
      gsapInstance.killTweensOf(tile)
    }
    tile.animating = true
    playSound()
    const timeline = gsapInstance.timeline()
    timeline.to(tile, {
      flipRotation: 90,
      duration: duration / 2,
      ease,
      onUpdate: draw,
    })
      .call(() => {
        tile.isFlipped = isFlipping
      })
      .to(tile, {
        flipRotation: 0,
        duration: duration / 2,
        ease,
        onUpdate: draw,
        onComplete: () => {
          tile.animating = false
        },
      })
    return timeline
  }

  const updateParallax = (canvas: Ref<HTMLCanvasElement | null>, tiles: Ref<Tile[]>, draw: () => void) => {
    if (!canvas.value || isAnimating?.value)
      return

    const now = performance.now()
    if (now - lastParallaxUpdate < PARALLAX_THROTTLE)
      return
    lastParallaxUpdate = now

    const canvasRect = canvas.value.getBoundingClientRect()

    let needsRedraw = false
    tiles.value.forEach((tile) => {
      const tileCenterX = canvasRect.left + tile.x + tile.width / 2
      const tileCenterY = canvasRect.top + tile.y + tile.height / 2

      const deltaX = (mouseX - tileCenterX) / canvasRect.width
      const deltaY = (mouseY - tileCenterY) / canvasRect.height

      const maxRotation = 15
      const newRotateX = -deltaY * maxRotation
      const newRotateY = deltaX * maxRotation

      if (Math.abs(newRotateX - tile.rotateX) > 0.1 || Math.abs(newRotateY - tile.rotateY) > 0.1) {
        tile.rotateX = newRotateX
        tile.rotateY = newRotateY
        needsRedraw = true
      }

      const distanceFromCenter = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const newScale = 1 + (0.05 * Math.max(0, 0.5 - distanceFromCenter))
      if (Math.abs(newScale - tile.scale) > 0.001) {
        tile.scale = newScale
        needsRedraw = true
      }
    })

    if (needsRedraw) {
      draw()
    }
  }

  function handleMouseMove(event: MouseEvent) {
    if (!canvas.value || isAnimating?.value)
      return

    mouseX = event.clientX
    mouseY = event.clientY
    updateParallax(canvas, tiles, draw)
  }

  return {
    animateFlipTile,
    handleMouseMove,
  }
}

export function useConfetti() {
  const confettiElements: HTMLElement[] = []

  const createConfetti = () => {
    const total = 120
    const w = window.innerWidth
    const h = window.innerHeight

    for (let i = 0; i < total; i++) {
      const confettiPiece = document.createElement('div')

      const colors = [
        '#FF6B6B',
        '#4ECDC4',
        '#45B7D1',
        '#96CEB4',
        '#FFEAA7',
        '#DDA0DD',
        '#98D8C8',
        '#F7DC6F',
        '#BB8FCE',
        '#85C1E9',
        '#F8C471',
        '#82E0AA',
        '#FFB6C1',
        '#87CEEB',
        '#F0E68C',
        '#DDA0DD',
      ]
      const color = colors[Math.floor(Math.random() * colors.length)]

      const size = Math.random() * 8 + 4
      const xPos = Math.random() * w
      const yPos = -Math.random() * 300 - 50

      document.body.appendChild(confettiPiece)

      confettiElements.push(confettiPiece)

      confettiPiece.style.position = 'fixed'
      confettiPiece.style.left = `${xPos}px`
      confettiPiece.style.top = `${yPos}px`
      confettiPiece.style.backgroundColor = color
      confettiPiece.style.zIndex = '9999'
      confettiPiece.style.pointerEvents = 'none'

      confettiPiece.style.width = `${size * 1.5}px`
      confettiPiece.style.height = `${size * 0.6}px`
      confettiPiece.style.borderRadius = '2px'

      animateConfettiPiece(confettiPiece, h)
    }

    function animateConfettiPiece(element: HTMLElement, containerHeight: number) {
      const duration = Math.random() * 3 + 2
      const delay = Math.random() * 3

      gsap.to(element, {
        y: containerHeight + 100,
        duration,
        delay,
        ease: 'none',
        repeat: -1,
      })

      gsap.to(element, {
        x: `+=${Math.random() * 150 - 75}`,
        duration: Math.random() * 3 + 1.5,
        delay,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      gsap.to(element, {
        rotation: Math.random() * 720 - 360,
        duration: Math.random() * 4 + 2,
        delay,
        repeat: -1,
        ease: 'none',
      })

      gsap.to(element, {
        opacity: 0.3 + Math.random() * 0.4,
        duration: Math.random() * 2 + 1,
        delay,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      if (Math.random() > 0.7) {
        gsap.to(element, {
          scale: 0.5 + Math.random() * 0.5,
          duration: Math.random() * 2 + 1,
          delay,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      }
    }
  }

  const cleanupConfetti = () => {
    confettiElements.forEach((element) => {
      gsap.killTweensOf(element)
    })

    confettiElements.forEach((element) => {
      if (element.parentNode) {
        element.parentNode.removeChild(element)
      }
    })

    confettiElements.length = 0
  }

  return {
    createConfetti,
    cleanupConfetti,
  }
}
