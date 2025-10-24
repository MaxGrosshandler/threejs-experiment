# Developer Guide and Extension Documentation

Complete guide for developers who want to understand, modify, extend, or contribute to the 3D Action Game.

## Table of Contents

1. [Development Environment Setup](#development-environment-setup)
2. [Project Structure](#project-structure)
3. [Code Overview](#code-overview)
4. [Common Modifications](#common-modifications)
5. [Adding Features](#adding-features)
6. [Game Mechanics Tweaking](#game-mechanics-tweaking)
7. [Performance Optimization](#performance-optimization)
8. [Debugging Guide](#debugging-guide)
9. [Version Control](#version-control)
10. [Future Roadmap](#future-roadmap)

---

## Development Environment Setup

### Prerequisites

- **Text Editor**: Any text editor (VS Code, Sublime, Notepad++, even Notepad)
- **Browser**: Modern browser with developer tools (Chrome, Firefox recommended)
- **Local Server** (Optional but recommended)
- **Git** (Optional, for version control)

### Recommended Setup

#### 1. Visual Studio Code (Free, Recommended)

```bash
# Download from https://code.visualstudio.com
# Install and open project folder

# Install useful extensions:
# - Live Server (for local testing)
# - Three.js IntelliSense (for code hints)
# - Prettier (for code formatting)
```

**Using Live Server**:
```
1. Right-click on index.html
2. Select "Open with Live Server"
3. Automatically opens http://localhost:5500
4. Auto-refreshes on file save
```

#### 2. Simple Python Server

```bash
# Python 3.x (comes with Windows 10+)
python -m http.server 8000

# Then open: http://localhost:8000
# Ctrl+S to reload after edits
```

#### 3. Node.js HTTP Server

```bash
# Install if needed: https://nodejs.org
npm install -g http-server

# Run server
http-server

# Open: http://localhost:8080
```

### Browser Developer Tools

**Access**: Press F12 in any browser

**Key Tabs**:

1. **Console**: View errors and debug output
   ```javascript
   console.log('Debug message');
   console.error('Error message');
   ```

2. **Sources**: Debug code with breakpoints
   - Set breakpoints by clicking line numbers
   - Step through code execution
   - Watch variable values

3. **Network**: View resource loading
   - Check if Three.js loads correctly from CDN
   - Verify files are loading

### Offline Development (No Internet)

To work without internet access:

```bash
# 1. Download Three.js
curl https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js > three.module.js

# 2. Modify index.html importmap
<script type="importmap">
{
    "imports": {
        "three": "./three.module.js"  // Changed from CDN URL
    }
}
</script>

# 3. Now works offline!
```

---

## Project Structure

### Current Structure

```
3d/
├── index.html              # Entry point, HTML markup, CSS, game initialization
├── game.js                 # All game logic (495 lines)
├── three.module.js         # (Optional) Three.js library local copy
├── README.md               # User documentation
├── GAME_MECHANICS.md       # Game mechanics reference
├── API_REFERENCE.md        # Function and API documentation
├── ARCHITECTURE.md         # System architecture
├── USER_GUIDE.md           # Gameplay guide
├── DEVELOPER_GUIDE.md      # This file
└── .git/                   # (Optional) Git repository
```

### Recommended Structure for Large Projects

```
3d/
├── src/
│   ├── index.html
│   ├── js/
│   │   ├── main.js         # Entry point
│   │   ├── core/
│   │   │   ├── engine.js   # Three.js setup
│   │   │   ├── input.js    # Input handling
│   │   │   └── physics.js  # Physics simulation
│   │   ├── systems/
│   │   │   ├── player.js   # Player system
│   │   │   ├── enemies.js  # Enemy system
│   │   │   └── particles.js # Particle system
│   │   └── ui/
│   │       └── hud.js      # HUD elements
│   ├── css/
│   │   └── style.css       # Separated CSS
│   └── assets/
│       ├── sounds/         # (Future)
│       └── models/         # (Future)
├── docs/
│   ├── README.md
│   ├── ARCHITECTURE.md
│   └── API_REFERENCE.md
├── dist/                   # Compiled/bundled (if using build tools)
├── package.json            # (If using npm)
└── webpack.config.js       # (If using build tools)
```

---

## Code Overview

### File: index.html

**Purpose**: HTML structure, CSS styling, game initialization

**Key Sections**:

```html
<!-- 1. Meta and styling -->
<head>
    <style>
        body { ... }          /* Full-screen canvas */
        #healthBar { ... }    /* Health bar positioning */
        #controls { ... }     /* Controls overlay */
    </style>
</head>

<!-- 2. Canvas container (filled by Three.js) -->
<body>
    <div id="gameContainer"></div>
    <div id="healthBar"></div>
    <div id="healthText"></div>
    <div id="controls"></div>
</body>

<!-- 3. Three.js import configuration -->
<script type="importmap">
{
    "imports": {
        "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"
    }
}
</script>

<!-- 4. Game entry point -->
<script type="module" src="game.js"></script>
```

**Modifiable Elements**:
- Colors: `background-color`, `backgroundColor`
- Styles: CSS properties in `<style>` tag
- UI text: Content in divs
- Fonts: Font families in CSS

### File: game.js

**Purpose**: Complete game logic (495 lines)

**Structure**:

```javascript
// 1. Imports (1-5)
import * as THREE from 'three';

// 2. Constants (10-20)
const GRAVITY = 0.015;
const PLAYER_SPEED = 0.15;
// ... more constants

// 3. Scene setup (30-50)
const scene = new THREE.Scene();
const camera = ...
const renderer = ...
// ... lighting, ground

// 4. Entity creation (50-100)
function createPlayer() { ... }
function createEnemy() { ... }
function createDeathEffects() { ... }

// 5. Game state (100-150)
const player = createPlayer();
const enemies = [];
const particles = [];
// ... more state

// 6. Input system (150-200)
window.addEventListener('keydown', ...);
window.addEventListener('keyup', ...);
function handlePlayerJump() { ... }

// 7. Update systems (200-400)
function updatePlayer() { ... }
function updateEnemies() { ... }
function updateParticles() { ... }
function updateCamera() { ... }
function checkCollisions() { ... }

// 8. UI system (400-420)
function updateHealthDisplay() { ... }

// 9. Main loop (420-440)
function gameLoop(timestamp) { ... }

// 10. Initialization (440-495)
gameLoop();
window.addEventListener('resize', ...);
```

**Key Variables**:

```javascript
// Scene objects (global)
scene, camera, renderer, ground, player

// Game state (global)
enemies = []              // Array of enemy meshes
particles = []            // Array of particle meshes
keysPressed = {}          // Current key states
spawnTimer = 0            // Enemy spawn counter
cameraRotation = {x, y}   // Camera angles

// Per-entity properties
player.health             // Player HP (0-100)
player.velocity_y         // Vertical velocity
enemy.health              // Enemy HP (30)
particle.lifetime         // Particle age
```

---

## Common Modifications

### Changing Colors

**Player Color** (game.js:75)
```javascript
// Current: Red (0xff0000)
const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });

// Change to: Green
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });

// Common colors:
0xff0000  // Red
0x00ff00  // Green
0x0000ff  // Blue
0xffff00  // Yellow
0xff00ff  // Magenta
0x00ffff  // Cyan
0xffffff  // White
```

**Enemy Color** (game.js:111)
```javascript
// Current: Blue
color: 0x0000ff

// Change to: Purple
color: 0x8000ff
```

**Ground Color** (game.js:53)
```javascript
// Current: Green
color: 0x00aa00

// Change to: Brown
color: 0x8b4513
```

**Particle Color** (game.js:422)
```javascript
// Current: Green
color: 0x00ff00

// Change to: Yellow
color: 0xffff00
```

**Sky Color** (game.js:6)
```javascript
// Current: Light blue
scene.background = new THREE.Color(0x87CEEB);

// Change to: Dark blue
scene.background = new THREE.Color(0x1a1a2e);
```

### Adjusting Sizes

**Player Size** (game.js:73)
```javascript
// Current: 1 × 2 × 1 (width × height × depth)
const geometry = new THREE.BoxGeometry(1, 2, 1);

// Larger: 1.5 × 2.5 × 1.5
const geometry = new THREE.BoxGeometry(1.5, 2.5, 1.5);

// Smaller: 0.5 × 1 × 0.5
const geometry = new THREE.BoxGeometry(0.5, 1, 0.5);
```

**Enemy Size** (game.js:110)
```javascript
// Current: 0.6 × 0.6 × 0.6
const geometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);

// Larger: 1.0 × 1.0 × 1.0
const geometry = new THREE.BoxGeometry(1.0, 1.0, 1.0);
```

**Ground Size** (game.js:52)
```javascript
// Current: 100 × 100
const groundGeometry = new THREE.PlaneGeometry(100, 100);

// Larger: 200 × 200
const groundGeometry = new THREE.PlaneGeometry(200, 200);
```

### Changing Camera Distance

**Camera Positioning** (game.js:470)
```javascript
// Current: 10 units back, 5 units up
const cameraDistance = 10;
const cameraHeight = 5;

// Closer view (more action-focused)
const cameraDistance = 5;
const cameraHeight = 3;

// Far view (more strategic)
const cameraDistance = 20;
const cameraHeight = 10;
```

### Changing Player Speed

**Movement Speed** (game.js:356)
```javascript
// Current: 0.15 units/frame
movementVec.normalize().multiplyScalar(0.15);

// Faster: 0.25 units/frame
movementVec.normalize().multiplyScalar(0.25);

// Slower: 0.10 units/frame
movementVec.normalize().multiplyScalar(0.10);
```

**Jump Power** (game.js:337)
```javascript
// Current: 0.3 velocity
player.velocity_y = 0.3;

// Higher jump: 0.4 velocity
player.velocity_y = 0.4;

// Lower jump: 0.2 velocity
player.velocity_y = 0.2;
```

### Changing Gravity

**Gravity Value** (game.js:315)
```javascript
// Current: 0.015 units/frame²
player.velocity_y -= 0.015;

// Stronger gravity (fall faster): 0.025
player.velocity_y -= 0.025;

// Lighter gravity (float longer): 0.010
player.velocity_y -= 0.010;
```

### Changing Enemy Speed

**Enemy Chase Speed** (game.js:283)
```javascript
// Current: 0.05 units/frame
enemy.position.addScaledVector(directionToPlayer, 0.05);

// Faster: 0.10 units/frame
enemy.position.addScaledVector(directionToPlayer, 0.10);

// Slower: 0.03 units/frame
enemy.position.addScaledVector(directionToPlayer, 0.03);
```

### Changing Enemy Spawn Rate

**Spawn Interval** (game.js:273)
```javascript
// Current: 180 frames = 3 seconds
if (spawnTimer >= 180 && enemies.length < 10) {

// Faster spawn (more enemies): 120 frames = 2 seconds
if (spawnTimer >= 120 && enemies.length < 10) {

// Slower spawn (fewer enemies): 240 frames = 4 seconds
if (spawnTimer >= 240 && enemies.length < 10) {
```

**Maximum Enemies** (game.js:273)
```javascript
// Current: 10 enemies max
if (spawnTimer >= 180 && enemies.length < 10) {

// More enemies: 20
if (spawnTimer >= 180 && enemies.length < 20) {

// Fewer enemies: 5
if (spawnTimer >= 180 && enemies.length < 5) {
```

---

## Adding Features

### Feature: Enemy Health Display

Add a health bar above each enemy.

**Step 1**: Import CanvasTexture (game.js, at top)
```javascript
import * as THREE from 'three';
```

**Step 2**: Create function to update enemy health display
```javascript
function updateEnemyHealthBars() {
    enemies.forEach(enemy => {
        if (!enemy.healthBar) {
            // Create health bar mesh
            const geometry = new THREE.PlaneGeometry(0.6, 0.1);
            const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            enemy.healthBar = new THREE.Mesh(geometry, material);
            scene.add(enemy.healthBar);
        }

        // Update position above enemy
        enemy.healthBar.position.copy(enemy.position);
        enemy.healthBar.position.y += 0.5;

        // Update color based on health
        const healthPercent = enemy.health / 30;
        if (healthPercent > 0.5) {
            enemy.healthBar.material.color.setHex(0x00ff00);  // Green
        } else if (healthPercent > 0.25) {
            enemy.healthBar.material.color.setHex(0xffff00);  // Yellow
        } else {
            enemy.healthBar.material.color.setHex(0xff0000);  // Red
        }

        // Update scale based on health
        enemy.healthBar.scale.x = healthPercent;
    });
}
```

**Step 3**: Call in game loop (game.js:483)
```javascript
function gameLoop(timestamp) {
    updatePlayer();
    updateEnemies();
    updateParticles();
    updateCamera();
    checkCollisions();
    updateEnemyHealthBars();  // Add this line
    renderer.render(scene, camera);
    requestAnimationFrame(gameLoop);
}
```

### Feature: Score Display

Add a score based on enemies defeated.

**Step 1**: Add score variable (game.js, with other globals)
```javascript
let score = 0;
let enemiesDefeated = 0;
```

**Step 2**: Increment on enemy death (game.js:~290)
```javascript
if (enemy.health <= 0) {
    createDeathEffects(enemy.position);
    score += 100;  // Add points
    enemiesDefeated += 1;  // Track count
    scene.remove(enemy);
    enemies.splice(enemies.indexOf(enemy), 1);
}
```

**Step 3**: Display score in UI (game.js, in updateHealthDisplay)
```javascript
function updateHealthDisplay() {
    // ... existing code ...
    document.getElementById('scoreText').textContent =
        `Score: ${score}`;
}
```

**Step 4**: Add HTML element (index.html)
```html
<div id="scoreText" style="top: 50px;">Score: 0</div>
```

**Step 5**: Style it (index.html, in CSS)
```css
#scoreText {
    position: absolute;
    top: 50px;
    left: 10px;
    color: white;
    font-family: Arial;
    font-size: 20px;
}
```

### Feature: Power-Up Items

Add health power-ups that appear on the ground.

**Step 1**: Create power-up object
```javascript
const powerUps = [];

function createPowerUp() {
    const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const material = new THREE.MeshStandardMaterial({ color: 0xffff00 });  // Yellow
    const powerUp = new THREE.Mesh(geometry, material);

    // Random position on ground
    powerUp.position.set(
        (Math.random() - 0.5) * 100,
        0.25,
        (Math.random() - 0.5) * 100
    );

    powerUp.health = 25;  // Restore 25 HP
    scene.add(powerUp);
    powerUps.push(powerUp);
    return powerUp;
}
```

**Step 2**: Spawn power-ups periodically (in gameLoop or updateEnemies)
```javascript
// Add timer
let powerUpSpawnTimer = 0;

// In update loop
powerUpSpawnTimer++;
if (powerUpSpawnTimer >= 300 && powerUps.length < 3) {  // Spawn every 5 seconds, max 3
    createPowerUp();
    powerUpSpawnTimer = 0;
}
```

**Step 3**: Collision detection with player
```javascript
function checkPowerUpCollisions() {
    powerUps.forEach((powerUp, index) => {
        const powerUpBox = new THREE.Box3().setFromObject(powerUp);
        const playerBox = new THREE.Box3().setFromObject(player);

        if (powerUpBox.intersectsBox(playerBox)) {
            player.health = Math.min(player.health + powerUp.health, 100);
            scene.remove(powerUp);
            powerUps.splice(index, 1);
        }
    });
}
```

**Step 4**: Call in game loop
```javascript
function gameLoop(timestamp) {
    // ... other updates ...
    checkPowerUpCollisions();  // Add this
    // ... rendering ...
}
```

### Feature: Sound Effects

Add audio feedback for events (requires sound files).

**Step 1**: Add audio elements (index.html)
```html
<audio id="hitSound" src="hit.wav" preload="auto"></audio>
<audio id="deathSound" src="death.wav" preload="auto"></audio>
<audio id="powerUpSound" src="powerup.wav" preload="auto"></audio>
```

**Step 2**: Play sounds on events
```javascript
// On player taking damage
function handlePlayerEnemyCollision(enemy) {
    if (player.damageRecoveryTime <= 0) {
        player.health -= 10;
        document.getElementById('hitSound').play();  // Add this
        // ... rest of code ...
    }
}

// On enemy death
if (enemy.health <= 0) {
    document.getElementById('deathSound').play();  // Add this
    createDeathEffects(enemy.position);
    // ... rest of code ...
}

// On power-up collected
if (powerUpBox.intersectsBox(playerBox)) {
    document.getElementById('powerUpSound').play();  // Add this
    player.health = Math.min(player.health + powerUp.health, 100);
    // ... rest of code ...
}
```

### Feature: Enemy Types

Add different types of enemies with different properties.

**Step 1**: Modify createEnemy to accept type
```javascript
function createEnemy(type = 'basic') {
    const geometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    let material, health, speed, damage;

    if (type === 'basic') {
        material = new THREE.MeshStandardMaterial({ color: 0x0000ff });
        health = 30;
        speed = 0.05;
        damage = 10;
    } else if (type === 'fast') {
        material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        health = 15;
        speed = 0.10;  // Faster
        damage = 5;    // Less damage
    } else if (type === 'tank') {
        material = new THREE.MeshStandardMaterial({ color: 0x00aa00 });
        geometry = new THREE.BoxGeometry(1.0, 1.0, 1.0);  // Larger
        health = 60;   // More health
        speed = 0.02;  // Slower
        damage = 15;   // More damage
    }

    const enemy = new THREE.Mesh(geometry, material);
    // ... rest of spawn code ...
    enemy.health = health;
    enemy.speed = speed;
    enemy.damage = damage;
    enemy.type = type;
    return enemy;
}
```

**Step 2**: Use different types in spawning
```javascript
// Spawn different types randomly
if (spawnTimer >= 180 && enemies.length < 10) {
    const rand = Math.random();
    let type = 'basic';
    if (rand < 0.3) type = 'fast';       // 30% fast
    if (rand < 0.1) type = 'tank';       // 10% tank
    enemies.push(createEnemy(type));
    spawnTimer = 0;
}
```

**Step 3**: Update combat to use enemy properties
```javascript
// In updateEnemies enemy chasing
enemy.position.addScaledVector(directionToPlayer, enemy.speed);

// In collision damage
if (damageRecoveryTime <= 0) {
    player.health -= enemy.damage;  // Use enemy.damage
    damageRecoveryTime = 60;
    // ... visual feedback ...
}
```

---

## Game Mechanics Tweaking

### Difficulty Balancing

#### Parameter Chart

| Param | Value | Impact | Current |
|-------|-------|--------|---------|
| Player speed | 0.15 | Movement | Balanced |
| Enemy speed | 0.05 | Chase difficulty | Balanced |
| Spawn rate | 180 | Difficulty ramp | Moderate |
| Max enemies | 10 | Chaos level | Moderate |
| Player damage | 2/frame | Kill speed | Very fast |
| Enemy damage | 10/hit | Threat level | Moderate |
| Damage cooldown | 60 | Survival chance | Moderate |

#### Easy Mode

```javascript
const PLAYER_SPEED = 0.20;          // Faster
const ENEMY_SPEED = 0.03;           // Slower
const SPAWN_INTERVAL = 240;         // Slower spawn
const MAX_ENEMIES = 5;              // Fewer enemies
const ENEMY_DAMAGE = 5;             // Less damage
const DAMAGE_COOLDOWN = 90;         // Longer cooldown
```

#### Hard Mode

```javascript
const PLAYER_SPEED = 0.10;          // Slower
const ENEMY_SPEED = 0.08;           // Faster
const SPAWN_INTERVAL = 120;         // Faster spawn
const MAX_ENEMIES = 15;             // More enemies
const ENEMY_DAMAGE = 15;            // More damage
const DAMAGE_COOLDOWN = 45;         // Shorter cooldown
```

### Gameplay Tuning

#### Combat Balance

**Current**: Player deals 2 HP/frame, enemies have 30 HP (0.25 sec to kill)

**Adjust kill time**:
```javascript
// Kill faster (0.1 sec)
player.health -= 20;  // Up from 2

// Kill slower (0.5 sec)
player.health -= 1;   // Down from 2

// Enemy has more health (0.5 sec)
enemy.health = 60;    // Up from 30
```

#### Spawn Pattern

**Current**: Linear spawn (1 per 3 seconds)

**Wave spawn** (groups appear together):
```javascript
// Spawn waves of 3 enemies at once
if (spawnTimer >= 180 && enemies.length < 10) {
    for (let i = 0; i < 3; i++) {
        enemies.push(createEnemy());
    }
    spawnTimer = 0;
}
```

**Exponential difficulty** (spawn faster as time goes on):
```javascript
let difficultyMultiplier = 1 + (gameTime * 0.0001);
if (spawnTimer >= Math.floor(180 / difficultyMultiplier) && enemies.length < 10) {
    enemies.push(createEnemy());
    spawnTimer = 0;
}
```

---

## Performance Optimization

### Profiling

**Using Chrome DevTools**:

1. Open DevTools (F12)
2. Performance tab
3. Click record button
4. Play game for 10 seconds
5. Stop recording
6. Analyze results

**Key Metrics**:
- FPS: Should be 60 (1000ms / 60 = 16.67ms per frame)
- Frame time: Should be < 16.67ms
- GPU time: Usually largest component
- CPU time: Physics, collision, logic

### Optimization Techniques

#### 1. Frustum Culling

Only render objects in camera view:

```javascript
// Add to Three.js camera/renderer (advanced feature)
// Automatically done by Three.js for most cases
```

#### 2. Object Pooling

Reuse enemy meshes instead of destroying:

```javascript
const enemyPool = [];
const POOL_SIZE = 10;

// Initialize pool
function initEnemyPool() {
    for (let i = 0; i < POOL_SIZE; i++) {
        const enemy = createEnemyMesh();
        enemy.active = false;
        scene.add(enemy);
        enemyPool.push(enemy);
    }
}

// Get from pool
function spawnEnemy() {
    let enemy = enemyPool.find(e => !e.active);
    if (!enemy) enemy = createEnemyMesh();

    enemy.active = true;
    enemy.health = 30;
    enemy.position.set(...);
    return enemy;
}

// Return to pool
function killEnemy(enemy) {
    enemy.active = false;
    scene.remove(enemy);
}
```

#### 3. Spatial Partitioning

For 50+ enemies, divide arena into grid:

```javascript
const GRID_SIZE = 50;  // 50×50 units per cell
const GRID_CELLS = 2;  // 2×2 = 4 cells for 100×100 arena

function getGridCell(position) {
    const x = Math.floor((position.x + 50) / GRID_SIZE);
    const z = Math.floor((position.z + 50) / GRID_SIZE);
    return x + z * GRID_CELLS;
}

function updateEnemies() {
    // Only check collisions with nearby enemies
    const playerCell = getGridCell(player.position);
    const nearbyEnemies = enemies.filter(e =>
        getGridCell(e.position) === playerCell ||
        Math.abs(getGridCell(e.position) - playerCell) <= GRID_CELLS
    );

    // Check collisions only with nearby
    nearbyEnemies.forEach(enemy => {
        // ... collision check ...
    });
}
```

#### 4. Level of Detail (LOD)

Reduce quality for distant enemies:

```javascript
function updateEnemyDetail() {
    enemies.forEach(enemy => {
        const distance = player.position.distanceTo(enemy.position);

        if (distance > 50) {
            // Very far: no shadows
            enemy.castShadow = false;
            enemy.receiveShadow = false;
        } else if (distance > 30) {
            // Far: receive shadows only
            enemy.castShadow = false;
            enemy.receiveShadow = true;
        } else {
            // Close: full shadows
            enemy.castShadow = true;
            enemy.receiveShadow = true;
        }
    });
}
```

---

## Debugging Guide

### Common Issues and Solutions

#### Issue: Game runs slow

**Diagnosis**:
```javascript
// Add FPS counter
let lastTime = Date.now();
let frameCount = 0;

function gameLoop() {
    frameCount++;
    const now = Date.now();
    if (now - lastTime >= 1000) {
        console.log('FPS:', frameCount);
        frameCount = 0;
        lastTime = now;
    }
    // ... rest of loop ...
}
```

**Solutions**:
- Close other browser tabs
- Update graphics drivers
- Reduce shadow resolution
- Reduce particle count
- Use object pooling

#### Issue: Controls not responding

**Diagnosis**:
```javascript
// Log key events
window.addEventListener('keydown', (e) => {
    console.log('Key pressed:', e.key);
    keysPressed[e.key.toLowerCase()] = true;
});

// Check in game loop
if (keysPressed['w']) {
    console.log('W is pressed');
}
```

**Solutions**:
- Ensure element has focus (click window)
- Check key names are correct
- Check browser isn't intercepting keys
- Try different keys

#### Issue: Enemies don't spawn

**Diagnosis**:
```javascript
// Log spawn timer
console.log('Spawn timer:', spawnTimer, 'Enemies:', enemies.length);

// Log spawn attempt
if (spawnTimer >= 180) {
    console.log('Spawning enemy...');
    enemies.push(createEnemy());
}
```

**Solutions**:
- Check spawn interval value
- Check max enemy count
- Check createEnemy() function works
- Verify enemies array exists

#### Issue: Physics feel wrong

**Diagnosis**:
```javascript
// Log physics values
console.log('Gravity:', GRAVITY);
console.log('Jump power:', JUMP_POWER);
console.log('Velocity Y:', player.velocity_y);
console.log('Position Y:', player.position.y);
```

**Solutions**:
- Adjust GRAVITY constant
- Adjust jump power
- Check ground level (1.0)
- Test with simpler values first

### Browser Console Tricks

**Real-time variable inspection**:
```javascript
// In code, expose global variables
window.DEBUG = {
    player,
    enemies,
    particles,
    scene,
    keysPressed
};

// In console:
DEBUG.player.health          // Check player health
DEBUG.enemies.length         // Check enemy count
DEBUG.keysPressed            // Check key states
```

**Conditional logging**:
```javascript
// Only log when specific condition true
if (player.health < 50) {
    console.warn('Low health:', player.health);
}

// Log with color and style
console.log('%c Critical health!', 'color: red; font-size: 20px;');
```

**Performance monitoring**:
```javascript
// Measure function execution time
console.time('updateEnemies');
updateEnemies();
console.timeEnd('updateEnemies');

// Result: updateEnemies: 0.5ms
```

---

## Version Control

### Git Setup

```bash
# Initialize repository
git init

# Add all files
git add .

# Initial commit
git commit -m "Initial project structure"

# View history
git log --oneline
```

### Branching Strategy

```
master (stable)
  ├── develop (experimental)
  │   ├── feature/easy-mode
  │   ├── feature/sound-effects
  │   └── feature/enemy-types
  └── hotfix/performance-bug
```

**Create feature branch**:
```bash
git checkout -b feature/new-feature
# Make changes
git commit -m "Add new feature"
git checkout develop
git merge feature/new-feature
```

### Commit Message Convention

```
<type>: <description>

<body>
<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Tests

**Example**:
```
feat: add enemy health bars

Adds visible health bars above enemies to show their remaining health.
Health bar color changes from green to yellow to red as health decreases.

Closes #12
```

---

## Future Roadmap

### Short Term (1-2 weeks)

- [ ] Sound effects (hit, death, power-up)
- [ ] Score tracking
- [ ] Enemy health bars
- [ ] Difficulty levels (Easy, Normal, Hard)
- [ ] Main menu screen

### Medium Term (1 month)

- [ ] Multiple enemy types (fast, tank, ranged)
- [ ] Power-ups (health, speed, damage)
- [ ] Multiple maps/levels
- [ ] Leaderboard system
- [ ] Game over screen with stats

### Long Term (2+ months)

- [ ] Boss enemies
- [ ] Abilities/special moves
- [ ] Weapon system
- [ ] Multiplayer (local split-screen)
- [ ] Mobile touch controls
- [ ] Custom game modes
- [ ] Cosmetics/player skins
- [ ] Procedural generation
- [ ] Advanced AI (formations, tactics)

### Architecture Improvements

- [ ] Refactor to module system
- [ ] Add TypeScript support
- [ ] Implement physics engine (Cannon.js)
- [ ] Add asset loader
- [ ] Implement save/load system
- [ ] Add configuration system

### Technology Updates

- [ ] Update to Three.js latest
- [ ] Add WebGL 2 support
- [ ] Optimize with WebWorkers
- [ ] Add networking for multiplayer
- [ ] Mobile app wrapper (Electron)
- [ ] Progressive Web App (PWA)

---

## Summary

As a developer, you can:

1. **Understand the code**: Read this guide and the API reference
2. **Make changes**: Modify colors, sizes, speeds, mechanics
3. **Add features**: See examples for common additions
4. **Optimize performance**: Use profiling and optimization techniques
5. **Debug issues**: Use browser console and debugging techniques
6. **Contribute**: Use version control and commit conventions

The codebase is designed to be simple enough for beginners while allowing for significant expansion. Start with small modifications, test thoroughly, and gradually add more features.

Happy coding!
