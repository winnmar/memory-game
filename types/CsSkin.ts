export type Rarity = 'consumer' | 'industrial' | 'mil-spec' | 'restricted' | 'classified' | 'covert' | 'contraband'

export interface CS2Skin {
  id: number
  weaponName: string
  skinName: string
  rarity: Rarity
  image: string
}
