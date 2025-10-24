# 3D Action Game

A browser-based real-time 3D action game built with Three.js. Battle enemies, master platforming mechanics, and survive in a dynamic 3D environment.

## Features

- **3D Graphics**: Real-time rendering with shadows, lighting, and fog effects
- **Player Control**: Smooth camera-relative movement with double-jump mechanics
- **Enemy AI**: Dynamic enemy spawning and chase behavior
- **Combat System**: Proximity-based combat with health management
- **Particle Effects**: Visual feedback with death particle explosions
- **Physics Simulation**: Gravity, collision detection, and momentum-based movement
- **UI Feedback**: Real-time health display with color-coded status

## Quick Start

### Requirements

- Modern web browser with WebGL support (Chrome, Firefox, Safari, Edge)
- No installation or build process required

### Running the Game

1. Open `index.html` in your web browser
2. Grant camera movement and keyboard input permissions if prompted
3. Start playing immediately

## Controls

| Action | Key(s) |
|--------|--------|
| Move Forward | `W` |
| Move Left | `A` |
| Move Backward | `S` |
| Move Right | `D` |
| Jump | `Space` |
| Rotate Camera Left | `←` (Left Arrow) |
| Rotate Camera Right | `→` (Right Arrow) |
| Rotate Camera Up | `↑` (Up Arrow) |
| Rotate Camera Down | `↓` (Down Arrow) |

## Gameplay Guide

### Objective

Survive as long as possible while defeating enemies. Your health is displayed in the top-center of the screen.

### Player Mechanics

- **Movement**: Use WASD keys to move relative to the camera direction
- **Jumping**: Press Space to jump. Jump again while airborne for a double-jump
- **Combat**: Walk into enemies to damage them. Stay away to avoid taking damage
- **Health**: You start with 100 HP. Each enemy hit deals 10 damage with a 60-frame cooldown

### Enemy Mechanics

- **Spawning**: New enemies spawn every 3 seconds, up to a maximum of 10
- **Behavior**: Enemies chase you and deal damage on contact
- **Health**: Each enemy has 30 HP. Continuous contact damages them
- **Death**: Enemies explode into particles when defeated

### Strategy Tips

- Use double-jump for mobility and dodging
- Keep moving to avoid damage
- Focus on one enemy at a time
- Use the terrain and camera angles to your advantage
- Watch your health bar - yellow and red mean danger!

## Technical Overview

### Technology Stack

- **Three.js v0.160.0**: 3D graphics and rendering engine
- **HTML5**: Document structure and UI
- **CSS3**: Styling and layout
- **JavaScript ES6+**: Game logic and mechanics

### Architecture

The game consists of two main components:

1. **index.html** - User interface and Three.js setup
   - HTML5 canvas container
   - UI panels (health bar, controls)
   - Three.js scene initialization
   - CSS styling

2. **game.js** - Core game logic
   - Scene management and rendering
   - Player character and controls
   - Enemy system and AI
   - Collision detection
   - Particle effects
   - Game loop and state management

### Performance

- **Rendering**: 60 FPS target (60 frames per second)
- **Shadows**: PCF soft shadows with shadow mapping
- **Antialiasing**: Enabled for smooth graphics
- **Fog**: Atmospheric fog for depth perception
- **Optimization**: Material reuse and efficient collision detection

## File Structure

```
3d/
├── index.html          # Main HTML file and UI
├── game.js             # Complete game logic
└── README.md           # This file
```

## Physics Constants

| Property | Value | Unit |
|----------|-------|------|
| Gravity | -0.015 | units/frame |
| Jump Power | 0.3 | velocity |
| Player Speed | 0.15 | units/frame |
| Enemy Speed | 0.05 | units/frame |
| Damage Cooldown | 60 | frames |
| Enemy Spawn Rate | 180 | frames |

## Dimensions

| Entity | Dimensions | Notes |
|--------|------------|-------|
| Player | 1.0 × 2.0 × 1.0 | Width × Height × Depth |
| Enemy | 0.6 × 0.6 × 0.6 | Standard cube |
| Ground | 100 × 100 | Large plane |
| Camera Distance | 10 units | From player |
| Camera Height | 5 units | Above ground |

## Browser Support

| Browser | Status | Notes |
|---------|--------|-------|
| Chrome | ✅ Full Support | Recommended |
| Firefox | ✅ Full Support | Recommended |
| Safari | ✅ Full Support | macOS/iOS |
| Edge | ✅ Full Support | Chromium-based |
| Chrome Mobile | ⚠️ Limited | Small screen, no touch controls |
| Safari iOS | ⚠️ Limited | Small screen, no touch controls |

## Known Limitations

- No mobile/touch controls (keyboard-only input)
- Fixed camera distance from player
- No save/load functionality
- No difficulty settings or game modes
- Single-threaded rendering

## Future Enhancements

Potential improvements for future versions:

- [ ] Touch/mobile controls
- [ ] Difficulty levels (Easy, Normal, Hard)
- [ ] Power-ups and special weapons
- [ ] Multiple game modes
- [ ] Sound effects and music
- [ ] Leaderboard/high scores
- [ ] Enemy variety and types
- [ ] Boss encounters
- [ ] Map variety and procedural generation
- [ ] Multiplayer support

## Performance Tips

For the best experience:

1. **Close unnecessary browser tabs** to free up system resources
2. **Update your graphics drivers** for optimal WebGL performance
3. **Use a dedicated GPU** for faster rendering (if available)
4. **Run in full screen** for immersive gameplay
5. **Use Chrome or Firefox** for best performance

## Troubleshooting

### Game won't load
- Ensure you're using a modern browser with WebGL support
- Try clearing your browser cache
- Check browser console for error messages (F12)

### Poor performance / Lag
- Close other applications and browser tabs
- Lower your monitor refresh rate if very high
- Update your graphics drivers
- Try a different browser

### Controls not responding
- Click in the game window to ensure it has focus
- Check that Num Lock is not interfering with arrow keys
- Try refreshing the page

## Development

### Running Locally

Simply open `index.html` in your browser. No build process or dependencies needed.

### Code Structure

The game logic is organized into clear sections:

- **Setup**: Scene, camera, renderer initialization
- **Entity Creation**: Functions for creating player, enemies, particles
- **Input Handling**: Keyboard event listeners
- **Game Loop**: Main animation frame with updates and rendering
- **Physics**: Collision detection and movement calculations

### Extending the Game

See [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) for detailed information on:

- Adding new features
- Modifying game mechanics
- Creating new enemy types
- Changing visual styles
- Optimizing performance

## License

This project is free to use and modify for personal and educational purposes.

## Credits

Built with:
- **Three.js** - 3D graphics library by Ricardo Cabello and contributors

## Support

For questions, bug reports, or feature requests, review the documentation files:

- [ARCHITECTURE.md](ARCHITECTURE.md) - Technical architecture and system design
- [API_REFERENCE.md](API_REFERENCE.md) - Detailed code reference
- [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) - Development and extension guide
- [GAME_MECHANICS.md](GAME_MECHANICS.md) - Detailed game rules and systems

---

**Version**: 1.0
**Last Updated**: 2025-10-23
**Browser Support**: Chrome, Firefox, Safari, Edge (modern versions)
