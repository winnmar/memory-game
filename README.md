# CS2 Memory Game

Memory card game featuring Counter-Strike 2 weapon skins. Match pairs of cards to test your memory and beat your best times!

## Features

- **Three difficulty levels**: Easy (2x3), Medium (4x4), and Hard (4x5)
- **CS2 weapon skins**: Cards designs featuring CS2 skins
- **Game persistence**: Your progress is automatically saved and restored
- **Game history**: Track your completed games and performance
- **Seed system**: Share and replay specific game layouts using seed IDs

## Getting Started

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

### Development

Start the development server:
```bash
npm run dev
```

The game will be available at `http://localhost:3000`

## Testing Seed Loading

The game includes several default seed IDs you can use to test the seed loading feature:

- **seed1** - Easy difficulty (2x3 grid)
- **seed2** - Medium difficulty (4x4 grid)
- **seed3** - Hard difficulty (4x5 grid)

Simply enter any of these seed IDs in the "Enter seed ID" field and click "Load Seed" to start a game with that specific layout.

Enjoy the game! 🎮
