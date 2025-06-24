import type { Ref } from 'vue'
import type { Tile } from '@/types/Tile'
import { onMounted, ref } from 'vue'
import { useCsSkins } from '@/composables/useCsSkins'

interface CanvasDrawerOptions {
  canvas: Ref<HTMLCanvasElement | null>
  tiles: Ref<Tile[]>
}

export function useCanvasDrawer({ canvas, tiles }: CanvasDrawerOptions) {
  const { skins, getColorByRarity } = useCsSkins()
  const ctx = ref<CanvasRenderingContext2D | null>(null)
  const cs2Logo = ref<HTMLImageElement | null>(null)
  const skinImages = ref(new Map<number, HTMLImageElement>())

  const drawTile = (tile: Tile) => {
    if (!ctx.value || !tile)
      return

    try {
      ctx.value.save()

      const centerX = tile.x + tile.width / 2
      const centerY = tile.y + tile.height / 2

      ctx.value.translate(centerX, centerY)
      ctx.value.scale(tile.scale, tile.scale)

      const flipScale = Math.cos((tile.flipRotation * Math.PI) / 180)
      ctx.value.scale(flipScale, 1)

      const shadowOffset = Math.abs(tile.rotateX) + Math.abs(tile.rotateY)
      if (shadowOffset > 0) {
        ctx.value.shadowColor = 'rgba(0, 0, 0, 0.3)'
        ctx.value.shadowBlur = shadowOffset / 2
        ctx.value.shadowOffsetX = tile.rotateY / 4
        ctx.value.shadowOffsetY = tile.rotateX / 4
      }

      ctx.value.translate(-tile.width / 2, -tile.height / 2)

      if (tile.isFlipped || tile.isMatched) {
        const grad = ctx.value.createLinearGradient(0, 0, tile.width, tile.height)
        const colors = getColorByRarity(tile.skin.rarity)
        grad.addColorStop(0, colors.from)
        grad.addColorStop(1, colors.to)
        ctx.value.fillStyle = grad
        ctx.value.fillRect(0, 0, tile.width, tile.height)

        const skinImage = skinImages.value.get(tile.skin.id)
        if (skinImage && skinImage.complete) {
          const imgRatio = skinImage.width / skinImage.height
          let imgWidth = tile.width - 20
          let imgHeight = imgWidth / imgRatio

          if (imgHeight > tile.height - 40) {
            imgHeight = tile.height - 40
            imgWidth = imgHeight * imgRatio
          }

          const imgX = (tile.width - imgWidth) / 2
          const imgY = (tile.height - imgHeight) / 2 - 10

          ctx.value.drawImage(skinImage as HTMLImageElement, imgX, imgY, imgWidth, imgHeight)
        }

        ctx.value.fillStyle = '#fff'
        ctx.value.font = 'bold 12px Roboto'
        ctx.value.textAlign = 'center'

        ctx.value.strokeStyle = 'rgba(0, 0, 0, 0.7)'
        ctx.value.lineWidth = 3

        ctx.value.strokeText(tile.skin.weaponName, tile.width / 2, tile.height - 25)
        ctx.value.fillText(tile.skin.weaponName, tile.width / 2, tile.height - 25)

        ctx.value.strokeText(tile.skin.skinName, tile.width / 2, tile.height - 10)
        ctx.value.fillText(tile.skin.skinName, tile.width / 2, tile.height - 10)
      }
      else {
        ctx.value.fillStyle = '#ffff'
        ctx.value.fillRect(0, 0, tile.width, tile.height)
        ctx.value.strokeStyle = '#555'
        ctx.value.lineWidth = 4
        ctx.value.strokeRect(8, 8, tile.width - 16, tile.height - 16)

        if (cs2Logo.value && cs2Logo.value.complete) {
          ctx.value.drawImage(cs2Logo.value as HTMLImageElement, tile.width / 2 - 20, tile.height / 2 - 20, 40, 40)
        }
      }

      ctx.value.restore()
    }
    catch (error) {
      console.error('Error drawing tile:', error)
      if (ctx.value) {
        ctx.value.restore()
      }
    }
  }

  const draw = () => {
    if (!ctx.value || !canvas.value)
      return
    ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height)

    for (const tile of tiles.value) {
      drawTile(tile)
    }
  }

  const loadImages = () => {
    const logo = new Image()
    logo.src = '/img/cs2logo.png'
    logo.onload = () => {
      cs2Logo.value = logo
      draw()
    }

    skins.forEach((skin) => {
      const img = new Image()
      img.src = `/img/skins/${skin.id}.png`
      img.onload = () => {
        draw()
      }
      skinImages.value.set(skin.id, img as any)
    })
  }

  onMounted(() => {
    if (canvas.value) {
      ctx.value = canvas.value.getContext('2d')
      loadImages()
    }
  })

  return {
    draw,
  }
}
