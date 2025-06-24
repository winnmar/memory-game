import type { CS2Skin, Rarity } from '@/types/CsSkin'

export function useCsSkins() {
  const skins: CS2Skin[] = [
    { id: 1, weaponName: 'AK-47', skinName: 'Redline', rarity: 'classified', image: '/img/skins/1.png' },
    { id: 2, weaponName: 'AWP', skinName: 'Dragon Lore', rarity: 'covert', image: '/img/skins/2.png' },
    { id: 3, weaponName: 'M4A4', skinName: 'Howl', rarity: 'contraband', image: '/img/skins/3.png' },
    { id: 4, weaponName: 'Glock-18', skinName: 'Fade', rarity: 'restricted', image: '/img/skins/4.png' },
    { id: 5, weaponName: 'USP-S', skinName: 'Kill Confirmed', rarity: 'covert', image: '/img/skins/5.png' },
    { id: 6, weaponName: 'AK-47', skinName: 'Fire Serpent', rarity: 'covert', image: '/img/skins/6.png' },
    { id: 7, weaponName: 'M4A1-S', skinName: 'Hyper Beast', rarity: 'covert', image: '/img/skins/7.png' },
    { id: 8, weaponName: 'AWP', skinName: 'Asiimov', rarity: 'covert', image: '/img/skins/8.png' },
    { id: 9, weaponName: 'Desert Eagle', skinName: 'Blaze', rarity: 'restricted', image: '/img/skins/9.png' },
    { id: 10, weaponName: 'P90', skinName: 'Asiimov', rarity: 'classified', image: '/img/skins/10.png' },
    { id: 11, weaponName: 'MAC-10', skinName: 'Neon Rider', rarity: 'restricted', image: '/img/skins/11.png' },
    { id: 12, weaponName: 'Galil AR', skinName: 'Eco', rarity: 'mil-spec', image: '/img/skins/12.png' },
    { id: 13, weaponName: 'FAMAS', skinName: 'Djinn', rarity: 'restricted', image: '/img/skins/13.png' },
    { id: 14, weaponName: 'UMP-45', skinName: 'Primal Saber', rarity: 'classified', image: '/img/skins/14.png' },
    { id: 15, weaponName: 'P250', skinName: 'Asiimov', rarity: 'industrial', image: '/img/skins/15.png' },
    { id: 16, weaponName: 'Tec-9', skinName: 'Fuel Injector', rarity: 'classified', image: '/img/skins/16.png' },
    { id: 17, weaponName: 'Five-SeveN', skinName: 'Monkey Business', rarity: 'restricted', image: '/img/skins/17.png' },
    { id: 18, weaponName: 'CZ75-Auto', skinName: 'Victoria', rarity: 'classified', image: '/img/skins/18.png' },
    { id: 19, weaponName: 'Negev', skinName: 'Loudmouth', rarity: 'mil-spec', image: '/img/skins/19.png' },
    { id: 20, weaponName: 'Nova', skinName: 'Antique', rarity: 'consumer', image: '/img/skins/20.png' },
  ]

  const getColorByRarity = (rarity: Rarity) => {
    const map = {
      'consumer': { from: '#b0c3d9', to: '#8da5c2' },
      'industrial': { from: '#5e98d9', to: '#4b7bba' },
      'mil-spec': { from: '#4b69ff', to: '#8847ff' },
      'restricted': { from: '#8847ff', to: '#d32ce6' },
      'classified': { from: '#d32ce6', to: '#eb4b4b' },
      'covert': { from: '#eb4b4b', to: '#e4ae39' },
      'contraband': { from: '#e4ae39', to: '#ffd700' },
    }
    return map[rarity]
  }

  return {
    skins,
    getColorByRarity,
  }
}
