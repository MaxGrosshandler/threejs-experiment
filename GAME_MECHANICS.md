# Game Mechanics Documentation

Comprehensive guide to all game mechanics, systems, and interactions in the 3D Action Game.

## Table of Contents

1. [Player System](#player-system)
2. [Movement and Controls](#movement-and-controls)
3. [Combat System](#combat-system)
4. [Enemy System](#enemy-system)
5. [Physics Engine](#physics-engine)
6. [Camera System](#camera-system)
7. [Particle Effects](#particle-effects)
8. [Health System](#health-system)
9. [Collision Detection](#collision-detection)
10. [Game State and Timing](#game-state-and-timing)

## Player System

### Overview
The player is the main controllable character in the game. It consists of a red cube with health, movement, and combat capabilities.

### Player Properties

| Property | Value | Unit | Description |
|----------|-------|------|-------------|
| Size (W × H × D) | 1.0 × 2.0 × 1.0 | units | Player model dimensions |
| Starting Position | (0, 1, 0) | coordinates | Center of map, slightly above ground |
| Maximum Health | 100 | HP | Starting and max health |
| Color | RGB(255, 0, 0) | color | Red appearance |
| Movement Speed | 0.15 | units/frame | How fast player moves |
| Jump Height | ~6.0 | units | Approximate max jump height |
| Double Jump | Yes | feature | Can jump twice in air |

### Player State Variables

```javascript
// Core movement
velocity_y          // Vertical velocity (gravity affected)
isJumping           // Whether player is in air
jumpsRemaining      // Double jump counter (0-2)

// Input tracking
keysPressed         // Object tracking which keys are currently held
inputMovement       // Vector3 for movement direction

// Health and damage
health              // Current player health (0-100)
damageRecoveryTime  // Frames until next enemy damage can be taken

// Visual feedback
lastDamageTime      // Track when damage occurred for white flash
```

### Player Hitbox
```
Position: Slightly in front of player (depends on camera direction)
Size: 1.2 × 1.8 × 1.2 (slightly larger than model)
Purpose: Used to detect hits on enemies
```

## Movement and Controls

### Input System

The game uses keyboard input for all player actions. Inputs are tracked in real-time using `keydown` and `keyup` events.

### Movement Keys (Camera-Relative)

```
        W
        |
    A - + - D
        |
        S

Forward (W): Move in camera's forward direction
Left (A):    Move perpendicular to camera (leftward)
Right (D):   Move perpendicular to camera (rightward)
Back (S):    Move opposite to camera's forward direction
```

### Movement Calculation

```javascript
// Get camera direction vectors
const forward = camera.getWorldDirection(new Vector3());
const right = new Vector3();
right.crossVectors(camera.up, forward).normalize();

// Build movement vector
const movementVec = new Vector3();
if (keysPressed['w']) movementVec.add(forward);
if (keysPressed['s']) movementVec.sub(forward);
if (keysPressed['d']) movementVec.add(right);
if (keysPressed['a']) movementVec.sub(right);

// Apply speed
movementVec.normalize().multiplyScalar(PLAYER_SPEED);
player.position.addScaledVector(movementVec, 1);
```

### Jump Mechanics

#### Single Jump
- **Trigger**: Space key when on ground (y ≤ 1.0)
- **Effect**: Sets vertical velocity to 0.3 units/frame upward
- **Result**: Player can reach ~6 units above ground

#### Double Jump
- **Trigger**: Space key while airborne with jumps remaining
- **Effect**: Resets vertical velocity to 0.3 (mid-air boost)
- **Limit**: Maximum 2 total jumps per airtime
- **Reset**: Jumps reset to 2 when player touches ground

#### Jump Physics
```javascript
// Gravity simulation
velocity_y -= GRAVITY;  // -0.015 units/frame

// Position update with gravity
player.position.y += velocity_y;

// Ground collision and reset
if (player.position.y <= 1.0) {
    player.position.y = 1.0;
    velocity_y = 0;
    jumpsRemaining = 2;  // Reset double jump
    isJumping = false;
}
```

### Movement Speed

- **Walk Speed**: 0.15 units per frame
- **Frame Rate**: 60 FPS (typical)
- **Speed in units/sec**: 9.0 units/second
- **Ground Dimensions**: 100 × 100 units
- **Traversal Time**: ~11 seconds corner to corner

## Combat System

### Overview
The combat system is proximity-based and automatic. Damage occurs whenever the player hitbox overlaps with an enemy.

### Player Attack

| Property | Value | Description |
|----------|-------|-------------|
| Damage Type | Melee (contact) | Must touch enemy |
| Damage Per Frame | 2 HP | When in continuous contact |
| Damage Per Second | 120 HP | At 60 FPS (overkill) |
| Hit Detection | AABB Overlap | Box collision test |
| Range | ~1.5 units | Hitbox radius |
| Cooldown | None | Continuous while touching |

### Enemy Attack

| Property | Value | Description |
|----------|-------|-------------|
| Damage Type | Melee (contact) | Must touch player |
| Damage Amount | 10 HP | Per hit |
| Damage Cooldown | 60 frames | 1 second between hits |
| Hit Detection | AABB Overlap | Box collision test |
| Range | ~0.6 units | Enemy size |

### Combat Example

```javascript
// Player hitting enemy
if (playerHitbox.intersectsBox(enemy.geometry.boundingBox)) {
    enemy.health -= 2;  // 2 HP damage per frame

    if (enemy.health <= 0) {
        // Create explosion particles
        createDeathEffects(enemy.position);
        scene.remove(enemy);
        enemies.splice(enemies.indexOf(enemy), 1);
    }
}

// Enemy hitting player
if (enemy.intersectsBox(playerHitbox)) {
    if (damageRecoveryTime <= 0) {
        player.health -= 10;
        damageRecoveryTime = 60;  // 1 second cooldown

        // Visual feedback: white flash
        originalPlayerColor = player.material.color.copy();
        player.material.color.setHex(0xFFFFFF);
    }
}
```

### Combat Strategy

#### Offensive
- Walk into enemies to damage them continuously
- Each enemy takes 30 hits to defeat (at 2 HP per frame)
- Focus one enemy at a time for efficiency

#### Defensive
- Avoid standing near multiple enemies
- Use movement to dodge incoming damage
- Retreat when health is low (red bar)
- Take advantage of double-jump for mobility

## Enemy System

### Enemy Properties

| Property | Value | Description |
|----------|-------|-------------|
| Size (W × H × D) | 0.6 × 0.6 × 0.6 | units |
| Health | 30 | HP per enemy |
| Color | RGB(0, 0, 255) | Blue appearance |
| Movement Speed | 0.05 | units/frame |
| Speed in units/sec | 3.0 | units/second |
| AI Type | Chase | Follows player |

### Enemy Spawning

#### Spawn Rate
- **Interval**: 180 frames (3 seconds at 60 FPS)
- **Check Condition**: Only spawn if current count < 10
- **Maximum Enemies**: 10 on screen simultaneously

#### Spawn Location
```javascript
// Random angle around player (360 degrees)
const angle = Math.random() * Math.PI * 2;

// Distance from player: 15-25 units
const distance = 15 + Math.random() * 10;

// Spawn position calculation
const spawnX = player.position.x + Math.cos(angle) * distance;
const spawnZ = player.position.z + Math.sin(angle) * distance;
const spawnY = 1;  // Ground level

const enemyPosition = new Vector3(spawnX, spawnY, spawnZ);
```

### Enemy AI Behavior

#### Chase Algorithm
Enemies use simple pathfinding to move toward the player:

```javascript
// Calculate direction to player
const directionToPlayer = new Vector3();
directionToPlayer.subVectors(player.position, enemy.position);
directionToPlayer.normalize();

// Move toward player
enemy.position.addScaledVector(directionToPlayer, ENEMY_SPEED);
```

#### Decision Making
1. **Awareness**: Enemies always aware of player (no detection limit)
2. **Aggression**: Enemies always chase when spawned
3. **No Patrolling**: Enemies only chase, never idle or patrol
4. **No Obstacles**: Enemies path directly through everything

### Enemy Lifecycle

```
Spawn (random location 15-25 units away)
    ↓
Chase Player (move toward at 0.05 units/frame)
    ↓
Contact Player (deal 10 damage every 60 frames)
    ↓
Player Attack (take 2 damage per frame while hit)
    ↓
Death (30 HP total) → Particle Explosion → Despawn
```

### Enemy Mechanics

| Event | Effect | Duration |
|-------|--------|----------|
| Spawn | Appear at random location | Instant |
| Chase | Move toward player continuously | Until death |
| Hit Player | Deal 10 damage | 10 damage per 60 frames |
| Take Damage | Lose 2 HP per frame in contact | Continuous |
| Death | Explosion particles, removed from scene | Instant |

## Physics Engine

### Gravity System

| Parameter | Value | Unit |
|-----------|-------|------|
| Gravity Magnitude | 0.015 | units/frame² |
| Gravity at 60 FPS | 0.9 | units/second² |
| Reference (Earth) | 9.81 | units/second² |
| Scale Factor | ~0.092 | Relative to Earth |

### Gravity Implementation

```javascript
const GRAVITY = 0.015;  // units per frame

// Each frame
velocity_y -= GRAVITY;

// Apply to position
player.position.y += velocity_y;

// Clamp to ground
if (player.position.y <= 1.0) {
    player.position.y = 1.0;
    velocity_y = 0;
    isJumping = false;
}
```

### Jump Calculation

Given:
- Jump velocity: 0.3 units/frame
- Gravity: 0.015 units/frame²

Time to peak: 0.3 / 0.015 = 20 frames (~0.33 seconds)

Maximum height:
```
h = v² / (2g)
h = 0.3² / (2 × 0.015)
h = 0.09 / 0.03
h = 3.0 units above ground = 4.0 units absolute
```

### Velocity and Momentum

- **Horizontal**: Movement speed is constant 0.15 units/frame (no acceleration)
- **Vertical**: Subject to gravity with jump impulse
- **Air Control**: Player can change direction while jumping
- **No Drag**: No air resistance or friction applied

### Collision-Based Physics

Movement is purely positional (no rigid body simulation):
```javascript
// Horizontal movement (no physics)
player.position.x += movementVec.x;
player.position.z += movementVec.z;

// Vertical movement (gravity)
velocity_y -= GRAVITY;
player.position.y += velocity_y;

// Ground collision
if (player.position.y <= 1.0) {
    player.position.y = 1.0;
    velocity_y = 0;
}
```

## Camera System

### Camera Type
Third-person perspective with player-centric orbiting.

### Camera Position

```javascript
// Camera orbits player at fixed distance
const cameraDistance = 10;      // units back
const cameraHeight = 5;         // units above ground

const cameraX = player.x - Math.cos(cameraRotation.y) * cameraDistance;
const cameraY = player.y + cameraHeight;
const cameraZ = player.z - Math.sin(cameraRotation.y) * cameraDistance;

camera.position.set(cameraX, cameraY, cameraZ);
camera.lookAt(player.position.x, player.position.y + 1, player.position.z);
```

### Camera Controls

| Key | Effect | Limit |
|-----|--------|-------|
| ← Left Arrow | Rotate left around player | -∞ (wraps) |
| → Right Arrow | Rotate right around player | +∞ (wraps) |
| ↑ Up Arrow | Rotate up (look down at player) | ±π/3 radians (±60°) |
| ↓ Down Arrow | Rotate down (look up at player) | ±π/3 radians (±60°) |

### Camera Angles

```javascript
// Rotation tracking
let cameraRotation = {
    x: 0,           // Vertical rotation (-π/3 to +π/3)
    y: 0            // Horizontal rotation (full range)
};

// Rotation increments
const CAMERA_SPEED = 0.05;  // radians per frame

// Vertical rotation bounds
const MAX_VERTICAL_ANGLE = Math.PI / 3;  // 60 degrees

// Update vertical angle
if (keysPressed['ArrowUp']) {
    cameraRotation.x = Math.min(
        cameraRotation.x + CAMERA_SPEED,
        MAX_VERTICAL_ANGLE
    );
}
if (keysPressed['ArrowDown']) {
    cameraRotation.x = Math.max(
        cameraRotation.x - CAMERA_SPEED,
        -MAX_VERTICAL_ANGLE
    );
}

// Update horizontal angle (no bounds)
if (keysPressed['ArrowLeft']) {
    cameraRotation.y += CAMERA_SPEED;
}
if (keysPressed['ArrowRight']) {
    cameraRotation.y -= CAMERA_SPEED;
}
```

### Camera-Relative Movement

Movement input is interpreted relative to camera direction:

```javascript
// Get camera's forward and right vectors
const forward = new Vector3(0, 0, -1);
forward.applyAxisAngle(new Vector3(0, 1, 0), cameraRotation.y);

const right = new Vector3();
right.crossVectors(camera.up, forward).normalize();

// Build movement from inputs
const movementVec = new Vector3();
if (keysPressed['w']) movementVec.add(forward);      // Forward
if (keysPressed['s']) movementVec.sub(forward);      // Backward
if (keysPressed['d']) movementVec.add(right);        // Right
if (keysPressed['a']) movementVec.sub(right);        // Left
```

## Particle Effects

### Death Explosion System

When an enemy dies, a particle explosion is created at its position.

### Particle Properties

| Property | Value | Description |
|----------|-------|-------------|
| Particles Per Death | 12 | Number spawned |
| Lifetime | 40 frames | Time until fade-out complete |
| Size Start | 0.3 | Initial scale |
| Size End | 0.1 | Final scale |
| Spread Radius | 1.5 | Initial position range |
| Spread Speed | 0.2 | units/frame |
| Color | RGB(0, 255, 0) | Green particles |

### Particle Physics

```javascript
function createDeathEffects(position) {
    for (let i = 0; i < 12; i++) {
        // Random direction
        const angle = Math.random() * Math.PI * 2;
        const elevation = Math.random() * Math.PI - Math.PI / 2;

        const particle = {
            position: position.clone(),
            velocity: new Vector3(
                Math.cos(angle) * Math.cos(elevation) * 0.2,
                Math.abs(Math.sin(elevation)) * 0.2,
                Math.sin(angle) * Math.cos(elevation) * 0.2
            ),
            age: 0,
            lifetime: 40,
            rotation: new Euler(
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2
            ),
            rotationSpeed: new Euler(
                (Math.random() - 0.5) * 0.2,
                (Math.random() - 0.5) * 0.2,
                (Math.random() - 0.5) * 0.2
            )
        };

        particles.push(particle);
    }
}
```

### Particle Update

```javascript
// Each frame for each particle
particle.position.add(particle.velocity);              // Apply velocity
particle.velocity.y -= GRAVITY;                        // Apply gravity
particle.rotation.x += particle.rotationSpeed.x;       // Rotate
particle.rotation.y += particle.rotationSpeed.y;
particle.rotation.z += particle.rotationSpeed.z;
particle.age++;                                         // Age particle

// Scale and fade
const progress = particle.age / particle.lifetime;     // 0 to 1
const scale = 0.3 * (1 - progress * 0.67);            // 0.3 to 0.1
particle.scale.set(scale, scale, scale);

// Fade out opacity
particle.material.opacity = 1 - progress;

// Remove when expired
if (particle.age >= particle.lifetime) {
    scene.remove(particle);
    particles.splice(index, 1);
}
```

## Health System

### Player Health

| State | Health | Color | Condition |
|-------|--------|-------|-----------|
| Healthy | 100-70 | Green | Good health |
| Caution | 69-35 | Yellow | Medium danger |
| Critical | 34-1 | Red | Severe danger |
| Dead | 0 | Black (game over) | Game ends |

### Health Bar Display

```javascript
// Health bar in top-center of screen
const healthBarElement = document.getElementById('healthBar');

function updateHealthDisplay() {
    const percentage = (player.health / 100) * 100;
    healthBarElement.style.width = percentage + '%';

    // Color coding
    if (player.health > 70) {
        healthBarElement.style.backgroundColor = '#00ff00';  // Green
    } else if (player.health > 35) {
        healthBarElement.style.backgroundColor = '#ffff00';  // Yellow
    } else {
        healthBarElement.style.backgroundColor = '#ff0000';  // Red
    }

    // Health text
    document.getElementById('healthText').textContent =
        `${player.health} / 100`;
}
```

### Damage Mechanics

#### Taking Damage (Player)

```javascript
// Enemy deals damage with cooldown
if (enemyHitbox.intersects(playerHitbox)) {
    if (damageRecoveryTime <= 0) {
        player.health -= 10;
        damageRecoveryTime = 60;  // 1 second cooldown

        // Visual feedback
        player.material.color.setHex(0xFFFFFF);  // Flash white
        setTimeout(() => {
            player.material.color.setHex(0xFF0000);  // Back to red
        }, 100);
    }
}
```

#### Dealing Damage (Player)

```javascript
// Player hits enemy continuously
if (playerHitbox.intersects(enemy.geometry.boundingBox)) {
    enemy.health -= 2;  // 2 HP per frame

    // Enemy dies
    if (enemy.health <= 0) {
        createDeathEffects(enemy.position);
        scene.remove(enemy);
        enemies.splice(enemies.indexOf(enemy), 1);
    }
}
```

### Health Recovery
- **Auto-recovery**: No (health doesn't regenerate)
- **Healing items**: None
- **Permanent**: Damage is permanent until death

## Collision Detection

### Method: Axis-Aligned Bounding Box (AABB)

Uses Three.js `Box3` for efficient collision detection.

### Collision Types

#### 1. Player-Ground Collision
```javascript
// Check if player is below ground level
if (player.position.y < 1.0) {
    player.position.y = 1.0;
    velocity_y = 0;
    jumpsRemaining = 2;
}
```

#### 2. Player-Enemy Collision
```javascript
// Create player hitbox
const playerHitbox = new Box3().setFromObject(player);
playerHitbox.expandByScalar(0.6);  // Slightly larger for detection

// Check each enemy
enemies.forEach(enemy => {
    const enemyBox = new Box3().setFromObject(enemy);

    if (playerHitbox.intersectsBox(enemyBox)) {
        // Handle collision
        takeDamage(10);
    }
});
```

#### 3. Enemy-Enemy Collision
- **Implemented**: No
- **Effect**: Enemies can overlap
- **Behavior**: Enemies don't collide with each other

#### 4. Player-Environment Collision
- **Walls/Obstacles**: None (open arena)
- **Boundaries**: Soft boundaries (can go beyond 100×100 area)

### Collision Detection Performance

- **Method**: AABB (faster than sphere or mesh collision)
- **Frequency**: Every frame
- **Complexity**: O(n) for n enemies
- **Optimization**: Could use spatial partitioning for many enemies

## Game State and Timing

### Frame-Based Timing

The game uses a frame-based update system rather than delta-time:

```javascript
// 60 FPS target (most monitors)
function gameLoop(timestamp) {
    // Update all game logic assuming 60 FPS
    updatePlayer();
    updateEnemies();
    updateParticles();
    updateCamera();

    renderer.render(scene, camera);
    requestAnimationFrame(gameLoop);
}
```

### Frame Rates and Calculations

| System | Unit | Value | Notes |
|--------|------|-------|-------|
| Target FPS | frames/sec | 60 | Typical monitor refresh rate |
| Frame Duration | milliseconds | 16.67 | 1000 / 60 |
| Gravity | units/frame | 0.015 | Per frame value |
| Player Speed | units/frame | 0.15 | Per frame value |
| Enemy Speed | units/frame | 0.05 | Per frame value |

### Timing-Dependent Values

#### Damage Cooldown
```javascript
// 60 frames = 1 second cooldown
damageRecoveryTime--;
if (damageRecoveryTime <= 0) {
    // Can take damage again
}
```

#### Enemy Spawn Rate
```javascript
// Spawn every 180 frames = 3 seconds
spawnTimer++;
if (spawnTimer >= 180 && enemies.length < 10) {
    spawnEnemy();
    spawnTimer = 0;
}
```

#### Particle Lifetime
```javascript
// Particles last 40 frames = 0.67 seconds
particle.lifetime = 40;
particle.age++;
if (particle.age >= particle.lifetime) {
    removeParticle(particle);
}
```

### Game Over Condition

```javascript
// Game doesn't explicitly end
if (player.health <= 0) {
    // In current implementation: player stays dead but visible
    // Future: could add game over screen and restart
}
```

---

## Summary

This document provides a complete reference for all game mechanics:

- **Player**: 100 HP, 0.15 units/frame movement, double jump
- **Enemies**: 30 HP each, 0.05 units/frame speed, spawn every 3 seconds
- **Combat**: Proximity-based, 2 HP/frame damage from player, 10 HP/hit from enemies
- **Physics**: Gravity-based with AABB collision detection
- **Camera**: Third-person, player-centered, +/- 60° vertical range
- **Timing**: Frame-based at 60 FPS

All values are tuned for a balanced gameplay experience suitable for action-combat scenarios.
