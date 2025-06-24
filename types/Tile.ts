import type { CS2Skin } from './CsSkin'

export interface Tile {
  x: number
  y: number
  width: number
  height: number
  skin: CS2Skin
  isFlipped: boolean
  isMatched: boolean
  flipProgress: number
  rotateX: number
  rotateY: number
  scale: number
  flipRotation: number
  animating: boolean
}
