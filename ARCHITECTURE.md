# System Architecture Documentation

Technical architecture and design of the 3D Action Game.

## Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [System Components](#system-components)
3. [Data Flow](#data-flow)
4. [Rendering Pipeline](#rendering-pipeline)
5. [Update Loop](#update-loop)
6. [Module Organization](#module-organization)
7. [Design Patterns](#design-patterns)
8. [Performance Considerations](#performance-considerations)
9. [Browser Integration](#browser-integration)
10. [Scalability Analysis](#scalability-analysis)

---

## High-Level Architecture

### System Overview

```
┌─────────────────────────────────────────────────────┐
│              3D Action Game                         │
│  Browser-Based Real-Time 3D Graphics Engine       │
└─────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
    ┌────────┐       ┌────────┐       ┌─────────┐
    │Rendering│      │ Update │      │  Input  │
    │System   │      │ System │      │Handling │
    └────────┘      └────────┘      └─────────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                ┌─────────┼─────────┐
                │         │         │
                ▼         ▼         ▼
            ┌──────┐ ┌──────┐ ┌──────┐
            │Player│ │Enemy │ │Effect│
            │ Sys  │ │ Sys  │ │ Sys  │
            └──────┘ └──────┘ └──────┘
```

### Architectural Tiers

**Tier 1: Graphics Engine**
- Three.js library (rendering)
- WebGL context (GPU commands)
- Canvas element (display)

**Tier 2: Game Engine**
- Scene management
- Entity management
- Physics simulation
- Collision detection

**Tier 3: Game Systems**
- Player system (movement, health, combat)
- Enemy system (spawning, AI, combat)
- Particle system (visual effects)

**Tier 4: I/O Layer**
- Input handling (keyboard)
- Display output (health bar, UI)
- Browser events (resize, load)

---

## System Components

### 1. Rendering System

#### Responsibility
Manage all visual output to the screen.

#### Components

**Scene Graph**
```
Scene
├── Lighting
│   ├── AmbientLight (0.6 intensity)
│   └── DirectionalLight (1.0 intensity, shadows)
├── Environment
│   ├── Ground (100×100 plane)
│   └── Fog (0-100 units depth)
├── Entities
│   ├── Player (red box)
│   ├── Enemies[] (blue boxes)
│   └── Particles[] (green boxes)
└── Camera
    └── PerspectiveCamera (75° FOV)
```

**Renderer Configuration**
```javascript
renderer {
    size: full window (responsive)
    antialias: true (smooth edges)
    shadowMap {
        enabled: true
        type: PCFSoftShadowMap
        size: 2048×2048
    }
}
```

**Material System**
- Standard Material: Used for all objects
- Properties: Color, shadow casting/receiving
- No texture mapping (performance optimization)

#### Rendering Flow

```
1. Clear canvas (sky blue background)
2. Apply fog effect (0-100 units)
3. Render all meshes
4. Apply shadows
5. Display to canvas
```

### 2. Update System

#### Responsibility
Update game state every frame.

#### Update Order
```
1. updatePlayer()
   ├── Apply gravity
   ├── Update position
   ├── Ground collision
   ├── Health management
   └── Damage cooldown

2. updateEnemies()
   ├── Spawn new enemies (timer-based)
   ├── For each enemy:
   │   ├── Chase player (AI)
   │   └── Combat interaction

3. updateParticles()
   ├── Apply velocity
   ├── Apply gravity
   ├── Update rotation
   ├── Scale and fade
   └── Cleanup expired

4. updateCamera()
   ├── Process rotation input
   ├── Calculate position
   └── Update look target

5. checkCollisions()
   └── Player-enemy interaction
```

#### Frame Timing
```
Target: 60 FPS
Frame duration: 16.67 ms
Frame budget: All updates must complete < 16.67 ms
```

### 3. Input System

#### Responsibility
Translate user input to game actions.

#### Input Types

**Keyboard Input**
- Event-based with key state tracking
- `keydown`: Key pressed, set flag
- `keyup`: Key released, clear flag
- Main loop checks flags for continuous input

**Tracked Keys**
```javascript
{
    'w': boolean,           // Forward
    'a': boolean,           // Left
    's': boolean,           // Backward
    'd': boolean,           // Right
    ' ': boolean,           // Jump (space)
    'arrowup': boolean,     // Camera up
    'arrowdown': boolean,   // Camera down
    'arrowleft': boolean,   // Camera left
    'arrowright': boolean   // Camera right
}
```

**Event Handlers**
- `keydown`: Sets flag + special handling for space (jump)
- `keyup`: Clears flag
- `resize`: Updates camera aspect ratio

### 4. Physics System

#### Responsibility
Simulate gravity and collision response.

#### Physics Model

**Gravity System**
```
Acceleration: -0.015 units/frame²
Applied to: Vertical velocity only
Effect: Player falls at ~0.9 units/second²

Implementation:
velocity_y -= GRAVITY
position_y += velocity_y
```

**Jump System**
```
Single Jump:    Sets velocity to 0.3 units/frame
Double Jump:    Sets velocity to 0.3 units/frame (in air)
Max jumps:      2 total (reset on ground contact)
Jump height:    ~3-4 units
```

**Collision Response**
```
Ground collision:
    if (position_y < GROUND_LEVEL) {
        position_y = GROUND_LEVEL
        velocity_y = 0
        jumpsRemaining = 2
    }
```

**No Friction/Drag**
- Movement is purely kinematic
- No acceleration/deceleration
- No air resistance

#### Collision Detection

**Method: AABB (Axis-Aligned Bounding Box)**
- Simple and fast (O(n) per enemy)
- Using Three.js `Box3` class
- Checks per frame between all entities

**Collision Checks**
```javascript
Player-Enemy: Yes (combat interaction)
Enemy-Enemy: No (can overlap)
Player-Ground: Yes (simple y-position check)
Player-Walls: No (open arena)
Enemy-Ground: No (no collision, can go below)
```

### 5. Entity System

#### Entity Types

**Player Entity**
```javascript
{
    mesh: THREE.Mesh (red box)
    position: Vector3
    velocity: number (vertical only)
    health: number (0-100)
    state: {
        isJumping: boolean
        jumpsRemaining: number (0-2)
        damageRecoveryTime: number
    }
}
```

**Enemy Entity**
```javascript
{
    mesh: THREE.Mesh (blue box)
    position: Vector3
    health: number (0-30)
    behavior: "chase"
}
```

**Particle Entity**
```javascript
{
    mesh: THREE.Mesh (green box)
    position: Vector3
    velocity: Vector3
    rotation: Euler
    rotationSpeed: Euler
    age: number (0 to lifetime)
    lifetime: number (40 frames)
    scale: Vector3
}
```

#### Entity Management

**Player**: Single global instance
```javascript
const player = createPlayer();  // Created once at startup
```

**Enemies**: Dynamic array
```javascript
const enemies = [];             // Spawned/removed during game

enemies.push(createEnemy());    // Add new enemy
enemies.splice(index, 1);       // Remove dead enemy
```

**Particles**: Dynamic array
```javascript
const particles = [];           // Spawned on death

particles.push(particle);       // Add on death effect
particles.splice(index, 1);     // Remove when expired
```

---

## Data Flow

### Game State Data Flow

```
Input Events
    │
    └──> Key State Tracking
         │
         ├──> Player Movement Vector
         │    │
         │    └──> Position Update
         │
         ├──> Camera Rotation
         │    │
         │    └──> Camera Position
         │
         └──> Jump Trigger
              │
              └──> Velocity Update

Game Logic (Per Frame)
    │
    ├──> Player State
    │    ├── Position
    │    ├── Velocity
    │    ├── Health
    │    └── Damage Cooldown
    │
    ├──> Enemy State
    │    ├── Positions
    │    ├── Health
    │    └── Spawn Timer
    │
    └──> Particle State
         ├── Positions
         ├── Velocities
         └── Lifetimes

Collision Detection
    │
    └──> State Modifications
         ├── Health changes
         ├── Entity removal
         ├── Particle spawning
         └── Visual feedback

Rendering
    │
    └──> Canvas Output
```

### Entity Relationship Flow

```
Player
    ├── Affects Camera
    │   └── Affects View
    │
    ├── Collides with Enemies
    │   ├── Takes damage (on hit)
    │   └── Deals damage (on collision)
    │
    └── Spawns from Enemy Death
        └── Particle effects

Enemies
    ├── Chase Player
    │
    ├── Collide with Player
    │   └── Combat interaction
    │
    └── On Death
        ├── Particle effects
        └── Removed from scene

Particles
    ├── Fall with gravity
    │
    ├── Rotate and fade
    │
    └── Remove when expired
```

---

## Rendering Pipeline

### Rendering Sequence

```
1. RequestAnimationFrame Trigger
         │
         ▼
2. Game Logic Updates
   ├── updatePlayer()
   ├── updateEnemies()
   ├── updateParticles()
   ├── updateCamera()
   └── checkCollisions()
         │
         ▼
3. Scene State Locked
   (No more state changes)
         │
         ▼
4. Render Call
   renderer.render(scene, camera)
         │
         ├── Clear canvas (Sky blue)
         ├── Set camera view matrix
         ├── Calculate shadows
         ├── Render opaque objects
         ├── Apply fog
         └── Display to canvas
         │
         ▼
5. Canvas Display Update
         │
         ▼
6. Next RequestAnimationFrame
```

### Rendering Optimization

**Material Reuse**
- Single red material for player
- Single blue material for all enemies
- Single green material for all particles
- Single ground material

**Shadow Optimization**
- Shadow map: 2048×2048 resolution
- PCF soft shadows (smoother than hard shadows)
- Single directional light with shadows

**No Advanced Rendering**
- No post-processing
- No normal mapping
- No specular maps
- No texture atlasing
- Minimal shader complexity

**Performance Target**
- 60 FPS on modern hardware
- ~16.67 ms per frame budget
- Antialiasing enabled for smooth appearance

---

## Update Loop

### Main Game Loop

```javascript
function gameLoop(timestamp) {
    // 1. Update Logic (variable time)
    updatePlayer();      // ~0.1 ms
    updateEnemies();     // ~0.1 ms per enemy
    updateParticles();   // ~0.05 ms per particle
    updateCamera();      // ~0.05 ms
    checkCollisions();   // ~0.05 ms

    // 2. Render (variable time)
    renderer.render(scene, camera);  // ~5-10 ms

    // 3. Request next frame
    requestAnimationFrame(gameLoop);
}

// Start
gameLoop();
```

### Timing Model

**Frame-Based (Not Delta-Time)**
- Assumes 60 FPS constant
- All movement and physics scaled to 60 FPS
- No delta-time calculations

**Advantages**
- Simpler code
- Predictable behavior
- Easier to balance

**Disadvantages**
- Can run slow on low-end devices
- No graceful degradation to lower FPS

**FPS Dependency**
```
At 60 FPS:  Movement speed = 0.15 units/frame
At 30 FPS:  Movement speed = 0.15 units/frame (too fast!)
At 120 FPS: Movement speed = 0.15 units/frame (too slow!)
```

---

## Module Organization

### File Structure

```
3d/
├── index.html          # Entry point, UI, initialization
├── game.js             # All game logic in single file
└── (External)
    └── three.js        # Three.js library (CDN)
```

### Code Organization in game.js

```javascript
// 1. Imports (1-5 lines)
import * as THREE from 'three';

// 2. Scene Setup (10-50 lines)
- Scene creation
- Camera setup
- Renderer setup
- Lighting setup
- Ground creation

// 3. Player Creation (20 lines)
function createPlayer()

// 4. Enemy Creation (30 lines)
function createEnemy()

// 5. Particle System (50 lines)
function createDeathEffects()
function updateParticles()

// 6. Input Handling (20 lines)
window.addEventListener('keydown', ...)
window.addEventListener('keyup', ...)

// 7. Player Update (50 lines)
function updatePlayer()
function handlePlayerJump()

// 8. Enemy Update (40 lines)
function updateEnemies()

// 9. Combat (30 lines)
function checkCollisions()
function handlePlayerEnemyCollision()

// 10. Camera (30 lines)
function updateCamera()

// 11. UI (20 lines)
function updateHealthDisplay()

// 12. Game Loop (15 lines)
function gameLoop()

// 13. Initialization (5 lines)
gameLoop()
```

### Single-File Design

**Advantages**
- Simple, self-contained
- No module loading complexity
- Fast loading (one HTTP request)
- Easy to understand end-to-end flow

**Disadvantages**
- Global scope pollution
- Hard to reuse components
- Difficult to test individual systems
- Limited code organization

---

## Design Patterns

### Patterns Used

#### 1. Object Pool Pattern (Enemies)

**Intent**: Reuse enemy objects to reduce garbage collection

**Implementation**:
```javascript
const enemies = [];

// Create
enemies.push(createEnemy());

// Update
updateEnemies();  // Modifies properties

// Reuse
// (Could be extended to despawn/respawn instead of removing)

// Current: Remove and recreate (no pooling)
enemies.splice(index, 1);  // Could use pool instead
```

#### 2. Observer Pattern (Input Handling)

**Intent**: React to user input events

**Implementation**:
```javascript
const keysPressed = {};

window.addEventListener('keydown', (event) => {
    keysPressed[event.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (event) => {
    keysPressed[event.key.toLowerCase()] = false;
});

// Main loop observes key state
if (keysPressed['w']) { /* move */ }
```

#### 3. Model-View Pattern (Health Display)

**Intent**: Separate game state from UI representation

**Implementation**:
```javascript
// Model
player.health = 100;

// View Update
function updateHealthDisplay() {
    const percentage = (player.health / 100) * 100;
    document.getElementById('healthBar').style.width = percentage + '%';
}

// Called from game loop
updatePlayer();
updateHealthDisplay();
```

#### 4. Game Loop Pattern

**Intent**: Fixed update and render cycle

**Implementation**:
```javascript
function gameLoop() {
    // Update
    updatePlayer();
    updateEnemies();

    // Render
    renderer.render(scene, camera);

    // Schedule next frame
    requestAnimationFrame(gameLoop);
}
```

---

## Performance Considerations

### Performance Metrics

**Target Performance**
```
FPS: 60 frames per second
Frame time: ~16.67 ms
Latency: <100 ms input-to-display
```

**Current Bottlenecks**
```
1. Rendering (largest time consumer)
   - Shadow map updates
   - Scene complexity
   - Antialiasing overhead

2. Update Logic (minor impact)
   - Collision detection grows with enemy count
   - Particle updates grow with particle count

3. Garbage Collection (unpredictable)
   - Entity creation/removal
   - Vector allocations
```

### Optimization Opportunities

#### Completed Optimizations

✅ **Material Reuse**
- Single material per color
- Reduces WebGL state changes

✅ **No Textures**
- Solid colors only
- Fast rendering

✅ **Simple Geometry**
- Boxes only (no complex meshes)
- Fast to render

#### Potential Optimizations

🔄 **Object Pooling**
- Reuse enemy meshes instead of removing/creating
- Avoid garbage collection pauses
- Estimated gain: 1-2 FPS (minor)

🔄 **Spatial Partitioning**
- Divide arena into grid
- Only check collisions for nearby enemies
- Estimated gain: Significant at 50+ enemies
- Current max: 10 enemies (not needed)

🔄 **InstancedMesh**
- Render all enemies with single draw call
- Only useful for 100+ identical objects
- Current max: 10 enemies (not beneficial)

🔄 **Physics Optimization**
- Use Box3 caching instead of recreating
- Skip physics for off-screen entities
- Estimated gain: <1 FPS (minimal)

🔄 **Shadow Resolution**
- Reduce from 2048×2048 to 1024×1024
- Trade quality for performance
- Estimated gain: 2-3 FPS

🔄 **Fog Distance**
- Increase fog start (cull more objects)
- Estimated gain: <1 FPS

### Scaling Limits

**Current Setup: 10 Enemies + ~12 Particles**
- Supports 60 FPS on modern hardware
- Smooth gameplay

**Scaling Scenarios**:

| Enemies | Status | Recommendation |
|---------|--------|-----------------|
| 1-10 | ✅ Excellent | Current design |
| 10-50 | ✅ Good | Use spatial grid |
| 50-100 | ⚠️ Acceptable | Instancing + pooling |
| 100+ | ❌ Poor | Need major refactor |

---

## Browser Integration

### HTML Structure

**index.html**
```html
<style>
    /* Responsive canvas */
    canvas { width: 100%; height: 100%; }

    /* Health bar UI */
    #healthBar { fixed, top-center }
    #controls { fixed, top-left }
</style>

<body>
    <!-- Canvas container (Three.js appends to body) -->

    <!-- Health display overlay -->
    <div id="healthBar"></div>
    <div id="healthText"></div>

    <!-- Controls overlay -->
    <div id="controls"></div>

    <!-- Game script -->
    <script type="module" src="game.js"></script>
</body>
```

### DOM API Usage

**Canvas Management**
```javascript
renderer.domElement  // Canvas created by Three.js
document.body.appendChild(renderer.domElement)  // Add to DOM
renderer.setSize(window.innerWidth, window.innerHeight)  // Responsive
```

**Event Listeners**
```javascript
window.addEventListener('keydown', ...)    // Keyboard input
window.addEventListener('keyup', ...)      // Keyboard input
window.addEventListener('resize', ...)     // Responsive resize
```

**DOM Updates**
```javascript
document.getElementById('healthBar').style.width = ...
document.getElementById('healthText').textContent = ...
document.getElementById('controls').innerHTML = ...
```

### Responsive Design

**Full-Screen Canvas**
```javascript
renderer.setSize(window.innerWidth, window.innerHeight);
camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();

// On resize
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
```

### WebGL Context

**Requirements**
- WebGL 1.0 or higher (Three.js abstraction)
- GPU with shader support
- Modern browser (IE not supported)

**Capabilities Used**
- Basic vertex/fragment shaders
- Shadow mapping
- Antialiasing (MSAA if available)
- Blending for particles

---

## Scalability Analysis

### Horizontal Scalability (More Enemies)

**Current Limit**: 10 enemies maximum

**Bottleneck**: Collision detection O(n) per frame
```
10 enemies: 10 box checks per frame ✅
100 enemies: 100 box checks per frame ⚠️
1000 enemies: 1000 box checks per frame ❌
```

**Solution**: Spatial Partitioning
```
Divide arena into 10×10 grid
Only check enemies in same grid cell
Reduces checks to ~O(1) average case
```

### Vertical Scalability (More Features)

**Current Size**: 495 lines of code

**Adding Features**:
- Sound system: +100 lines
- Particle variations: +50 lines
- Enemy types: +100 lines
- Power-ups: +150 lines
- Levels/maps: +200 lines

**Recommendation**: Refactor to modules
```
game.js → game/
  ├── core/
  │   ├── engine.js
  │   ├── physics.js
  │   └── renderer.js
  ├── systems/
  │   ├── player.js
  │   ├── enemies.js
  │   └── particles.js
  └── ui/
      └── hud.js
```

### Memory Usage

**Current Memory Footprint**:
```
Three.js: ~1.2 MB
Scene Objects: ~100 KB (player, ground, lighting)
Enemy Meshes: ~10 KB × 10 = 100 KB
Particle Meshes: ~5 KB × 144 max = 720 KB
Total: ~2.2 MB
```

**Scaling with Enemies**:
```
10 enemies: +100 KB
100 enemies: +1 MB (total ~3.2 MB)
1000 enemies: +10 MB (total ~12 MB) - problematic
```

**Memory Optimization**:
- Instancing: Reduce mesh memory from linear to constant
- Texture atlasing: Would add memory but reduce draw calls
- Object pooling: Reduce GC pressure (no memory reduction)

---

## Summary

The architecture is:

- **Simple**: Single-file codebase, 495 lines
- **Monolithic**: No module separation
- **Focused**: Game mechanics over advanced features
- **Scalable to ~50 enemies**: Beyond that needs optimization
- **Browser-first**: Full WebGL integration

Suitable for small-scale educational projects and simple games. For production or significant expansion, would benefit from:
- Module refactoring
- Spatial acceleration structures
- Physics engine integration
- Asset pipeline
- Build system
