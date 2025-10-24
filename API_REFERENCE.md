# API Reference Documentation

Complete reference for all functions, objects, and systems in the 3D Action Game codebase.

## Table of Contents

1. [Scene Setup](#scene-setup)
2. [Entity Creation](#entity-creation)
3. [Player Management](#player-management)
4. [Enemy System](#enemy-system)
5. [Particle System](#particle-system)
6. [Input Handling](#input-handling)
7. [Collision Detection](#collision-detection)
8. [Update Functions](#update-functions)
9. [Rendering](#rendering)
10. [Constants](#constants)

---

## Scene Setup

### Three.js Initialization

The game initializes a complete Three.js scene with lights, camera, and renderer.

#### Scene Creation

**File**: `game.js:1-10`

```javascript
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);  // Sky blue
scene.fog = new THREE.Fog(0x87CEEB, 0, 100);  // Fog for depth
```

**Properties**:
- Background color: RGB(135, 206, 235) - Sky blue
- Fog start: 0 units
- Fog end: 100 units
- Fog type: Linear fog

#### Camera Setup

**File**: `game.js:11-20`

```javascript
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);
camera.lookAt(0, 1, 0);
```

**Properties**:
- Type: Perspective camera (realistic FOV)
- FOV: 75 degrees
- Aspect ratio: Window width / height
- Near plane: 0.1 units
- Far plane: 1000 units
- Initial position: (0, 5, 10)
- Look target: (0, 1, 0) - Center of player

#### Renderer Setup

**File**: `game.js:21-35`

```javascript
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);
```

**Properties**:
- Type: WebGL renderer
- Antialiasing: Enabled (smoother edges)
- Size: Full window
- Shadow mapping: Enabled
- Shadow type: PCF soft shadows (realistic shadows)

#### Lighting

**File**: `game.js:36-51`

```javascript
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight.position.set(50, 50, 50);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);
```

**Ambient Light**:
- Color: White (0xffffff)
- Intensity: 0.6 (60% brightness)
- Effect: Overall scene brightness

**Directional Light**:
- Color: White (0xffffff)
- Intensity: 1.0 (full brightness)
- Position: (50, 50, 50) - Upper right
- Shadow mapping: 2048×2048 resolution
- Effect: Main light source with shadows

#### Ground Creation

**File**: `game.js:52-65`

```javascript
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x00aa00 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);
```

**Properties**:
- Type: Plane geometry
- Dimensions: 100 × 100 units
- Color: Green (0x00aa00)
- Rotation: Rotated 90° to be horizontal
- Shadow receiving: Enabled
- Position: Center (0, 0, 0)

---

## Entity Creation

### Create Player

**File**: `game.js:72-106`

```javascript
function createPlayer() {
    const geometry = new THREE.BoxGeometry(1, 2, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const player = new THREE.Mesh(geometry, material);

    player.position.set(0, 1, 0);
    player.castShadow = true;
    player.receiveShadow = true;

    // Player state variables
    player.velocity_y = 0;
    player.isJumping = false;
    player.jumpsRemaining = 2;
    player.health = 100;
    player.damageRecoveryTime = 0;

    scene.add(player);
    return player;
}
```

**Returns**: Three.js Mesh object with player properties

**Properties Added**:
- `velocity_y` (number): Current vertical velocity
- `isJumping` (boolean): Whether player is airborne
- `jumpsRemaining` (number): Double-jump counter (0-2)
- `health` (number): Current health (0-100)
- `damageRecoveryTime` (number): Frames until next damage

**Visual Properties**:
- Geometry: 1×2×1 box
- Color: Red (0xff0000)
- Shadow: Casts and receives
- Position: (0, 1, 0)

### Create Enemy

**File**: `game.js:109-147`

```javascript
function createEnemy() {
    const geometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    const material = new THREE.MeshStandardMaterial({ color: 0x0000ff });
    const enemy = new THREE.Mesh(geometry, material);

    // Random spawn position
    const angle = Math.random() * Math.PI * 2;
    const distance = 15 + Math.random() * 10;

    enemy.position.set(
        player.position.x + Math.cos(angle) * distance,
        1,
        player.position.z + Math.sin(angle) * distance
    );

    enemy.castShadow = true;
    enemy.receiveShadow = true;

    // Enemy state
    enemy.health = 30;

    scene.add(enemy);
    return enemy;
}
```

**Returns**: Three.js Mesh object with enemy properties

**Properties Added**:
- `health` (number): Enemy health (30 HP)

**Spawn Location**:
- Distance from player: 15-25 units
- Direction: Random angle (0-360°)
- Height: Ground level (y = 1)

**Visual Properties**:
- Geometry: 0.6×0.6×0.6 box
- Color: Blue (0x0000ff)
- Shadow: Casts and receives

---

## Player Management

### Player Input Handling

**File**: `game.js:183-198`

```javascript
const keysPressed = {};

window.addEventListener('keydown', (event) => {
    keysPressed[event.key.toLowerCase()] = true;

    if (event.code === 'Space') {
        event.preventDefault();
        handlePlayerJump();
    }
});

window.addEventListener('keyup', (event) => {
    keysPressed[event.key.toLowerCase()] = false;
});
```

**Tracked Keys**:
- Movement: `w`, `a`, `s`, `d`
- Jump: `space`
- Camera: `arrowup`, `arrowdown`, `arrowleft`, `arrowright`

**Events**:
- `keydown`: Key pressed
- `keyup`: Key released
- Space: Calls jump handler

### Handle Player Jump

**File**: `game.js:200-209`

```javascript
function handlePlayerJump() {
    if (player.position.y <= 1.0) {
        // On ground - can always jump
        player.velocity_y = 0.3;
        player.jumpsRemaining = 1;  // One jump remaining
    } else if (player.jumpsRemaining > 0) {
        // In air - use remaining jump
        player.velocity_y = 0.3;
        player.jumpsRemaining--;
    }
}
```

**Logic**:
1. Check if player on ground (y ≤ 1.0)
2. If on ground: Jump with full power, set remaining jumps to 1
3. If in air: Use double-jump if available, decrement counter
4. Set velocity to 0.3 units/frame upward

**Conditions**:
- Ground check: `player.position.y <= 1.0`
- Jump available: `player.jumpsRemaining > 0`
- Velocity: 0.3 units/frame (about 3 units height)

---

## Enemy System

### Update Enemies

**File**: `game.js:250-300`

```javascript
function updateEnemies() {
    // Spawn new enemies
    spawnTimer++;
    if (spawnTimer >= 180 && enemies.length < 10) {
        enemies.push(createEnemy());
        spawnTimer = 0;
    }

    // Update each enemy
    enemies.forEach((enemy, index) => {
        // Chase player
        const directionToPlayer = new Vector3();
        directionToPlayer.subVectors(player.position, enemy.position);
        directionToPlayer.normalize();

        enemy.position.addScaledVector(directionToPlayer, 0.05);

        // Combat with player
        const playerHitbox = new Box3().setFromObject(player);
        playerHitbox.expandByScalar(0.6);
        const enemyBox = new Box3().setFromObject(enemy);

        if (playerHitbox.intersectsBox(enemyBox)) {
            // Player hits enemy
            enemy.health -= 2;

            if (enemy.health <= 0) {
                createDeathEffects(enemy.position);
                scene.remove(enemy);
                enemies.splice(index, 1);
            }
        }
    });
}
```

**Parameters**:
- None (uses global `enemies` array)

**Functionality**:
1. Increment spawn timer
2. Spawn enemy if timer >= 180 and count < 10
3. For each enemy:
   - Calculate direction to player
   - Move enemy toward player (0.05 units/frame)
   - Check collision with player
   - Deal damage (2 HP/frame) if colliding
   - Remove enemy if health <= 0

**Spawn Conditions**:
- Interval: 180 frames (3 seconds)
- Max enemies: 10
- Cost: One create operation

---

## Particle System

### Create Death Effects

**File**: `game.js:417-449`

```javascript
function createDeathEffects(position) {
    for (let i = 0; i < 12; i++) {
        // Create particle geometry
        const geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
        const material = new THREE.MeshStandardMaterial({
            color: 0x00ff00,
            emissive: 0x00ff00
        });
        const particle = new THREE.Mesh(geometry, material);

        // Set position
        particle.position.copy(position);

        // Random direction
        const angle = Math.random() * Math.PI * 2;
        const elevation = Math.random() * Math.PI - Math.PI / 2;

        // Particle properties
        particle.velocity = new Vector3(
            Math.cos(angle) * Math.cos(elevation) * 0.2,
            Math.abs(Math.sin(elevation)) * 0.2,
            Math.sin(angle) * Math.cos(elevation) * 0.2
        );

        particle.age = 0;
        particle.lifetime = 40;

        scene.add(particle);
        particles.push(particle);
    }
}
```

**Parameters**:
- `position` (THREE.Vector3): Spawn position

**Functionality**:
1. Create 12 particle meshes
2. Position at death location
3. Assign random velocity direction
4. Add to scene and particles array

**Particle Properties**:
- Geometry: 0.3×0.3×0.3 box
- Color: Green (0x00ff00)
- Emissive: Green (glowing)
- Velocity: Random direction, 0.2 units/frame
- Lifetime: 40 frames

### Update Particles

**File**: `game.js:418-449`

```javascript
function updateParticles() {
    particles.forEach((particle, index) => {
        // Apply velocity
        particle.position.add(particle.velocity);

        // Apply gravity
        particle.velocity.y -= 0.015;

        // Rotate particle
        particle.rotation.x += 0.1;
        particle.rotation.y += 0.15;
        particle.rotation.z += 0.08;

        // Age particle
        particle.age++;

        // Scale down
        const progress = particle.age / particle.lifetime;
        const scale = 0.3 * (1 - progress * 0.67);
        particle.scale.set(scale, scale, scale);

        // Fade out
        particle.material.opacity = 1 - progress;

        // Remove when done
        if (particle.age >= particle.lifetime) {
            scene.remove(particle);
            particles.splice(index, 1);
        }
    });
}
```

**Functionality**:
1. Apply velocity to position
2. Apply gravity (0.015 units/frame²)
3. Rotate on all axes
4. Increment age
5. Scale from 0.3 to 0.1 over lifetime
6. Fade opacity from 1 to 0
7. Remove when age >= lifetime (40 frames)

**Rotation Rates**:
- X-axis: 0.1 rad/frame
- Y-axis: 0.15 rad/frame
- Z-axis: 0.08 rad/frame

---

## Input Handling

### Update Player Movement

**File**: `game.js:300-350`

```javascript
function updatePlayer() {
    // Apply gravity
    player.velocity_y -= 0.015;  // GRAVITY constant
    player.position.y += player.velocity_y;

    // Ground collision
    if (player.position.y <= 1.0) {
        player.position.y = 1.0;
        player.velocity_y = 0;
        player.jumpsRemaining = 2;  // Reset double-jump
    }

    // Movement input (camera-relative)
    const forward = new Vector3(0, 0, -1);
    forward.applyAxisAngle(new Vector3(0, 1, 0), cameraRotation.y);

    const right = new Vector3();
    right.crossVectors(camera.up, forward).normalize();

    const movementVec = new Vector3();
    if (keysPressed['w']) movementVec.add(forward);
    if (keysPressed['s']) movementVec.sub(forward);
    if (keysPressed['d']) movementVec.add(right);
    if (keysPressed['a']) movementVec.sub(right);

    movementVec.normalize();
    player.position.addScaledVector(movementVec, 0.15);  // PLAYER_SPEED

    // Damage cooldown
    player.damageRecoveryTime--;

    // Update UI
    updateHealthDisplay();
}
```

**Gravity Application**:
- Deceleration: 0.015 units/frame²
- Applied every frame

**Movement Calculation**:
1. Get camera forward direction
2. Calculate right vector (perpendicular)
3. Check key inputs
4. Normalize direction
5. Apply speed (0.15 units/frame)

**Ground Detection**:
- Threshold: y ≤ 1.0
- Action: Clamp to 1.0, reset velocity, reset jump counter

---

## Collision Detection

### Check Collision AABB

**File**: `game.js:233-247`

```javascript
function checkCollisions() {
    // Player hitbox
    const playerHitbox = new Box3().setFromObject(player);
    playerHitbox.expandByScalar(0.6);  // Slightly larger for detection

    enemies.forEach(enemy => {
        // Enemy collision
        const enemyBox = new Box3().setFromObject(enemy);

        if (playerHitbox.intersectsBox(enemyBox)) {
            // Handle collision
            handlePlayerEnemyCollision(enemy);
        }
    });
}
```

**Method**: AABB (Axis-Aligned Bounding Box)

**Box3 Methods**:
- `setFromObject()`: Create box from mesh bounds
- `expandByScalar()`: Expand box by value in all directions
- `intersectsBox()`: Check overlap with another box

**Parameters**:
- Player expansion: 0.6 units (larger hitbox for combat)

### Handle Player Enemy Collision

**File**: `game.js:250-270`

```javascript
function handlePlayerEnemyCollision(enemy) {
    // Check enemy attacking player
    if (player.damageRecoveryTime <= 0) {
        player.health -= 10;
        player.damageRecoveryTime = 60;  // 1 second cooldown

        // Visual feedback: white flash
        const originalColor = player.material.color.getHex();
        player.material.color.setHex(0xffffff);  // White
        setTimeout(() => {
            player.material.color.setHex(originalColor);
        }, 100);
    }

    // Check player attacking enemy
    const playerHitbox = new Box3().setFromObject(player);
    const enemyBox = new Box3().setFromObject(enemy);

    if (playerHitbox.intersectsBox(enemyBox)) {
        enemy.health -= 2;  // 2 HP per frame

        if (enemy.health <= 0) {
            // Enemy defeated
            createDeathEffects(enemy.position);
        }
    }
}
```

**Collision Handling**:
1. Check if player can take damage (recovery time <= 0)
2. If yes: Deal 10 damage, set cooldown to 60 frames
3. Flash player white for visual feedback
4. Check if player hits enemy
5. Deal 2 damage per frame if in contact
6. Create particle effect if enemy dies

---

## Update Functions

### Update Camera

**File**: `game.js:452-479`

```javascript
function updateCamera() {
    // Camera rotation input
    const CAMERA_SPEED = 0.05;
    const MAX_VERTICAL_ANGLE = Math.PI / 3;  // 60 degrees

    if (keysPressed['arrowup']) {
        cameraRotation.x = Math.min(
            cameraRotation.x + CAMERA_SPEED,
            MAX_VERTICAL_ANGLE
        );
    }
    if (keysPressed['arrowdown']) {
        cameraRotation.x = Math.max(
            cameraRotation.x - CAMERA_SPEED,
            -MAX_VERTICAL_ANGLE
        );
    }
    if (keysPressed['arrowleft']) {
        cameraRotation.y += CAMERA_SPEED;
    }
    if (keysPressed['arrowright']) {
        cameraRotation.y -= CAMERA_SPEED;
    }

    // Update camera position
    const distance = 10;
    const height = 5;

    const cameraX = player.position.x - Math.cos(cameraRotation.y) * distance;
    const cameraY = player.position.y + height;
    const cameraZ = player.position.z - Math.sin(cameraRotation.y) * distance;

    camera.position.set(cameraX, cameraY, cameraZ);
    camera.lookAt(
        player.position.x,
        player.position.y + 1,
        player.position.z
    );
}
```

**Parameters**:
- Camera speed: 0.05 radians/frame
- Vertical angle limit: ±π/3 (±60°)
- Distance: 10 units back
- Height: 5 units above ground

**Functionality**:
1. Check arrow key inputs
2. Update rotation angles within bounds
3. Calculate camera position based on rotation
4. Set camera position
5. Make camera look at player (+1 unit height adjustment)

### Update Health Display

**File**: `game.js:212-231`

```javascript
function updateHealthDisplay() {
    const healthBar = document.getElementById('healthBar');
    const healthText = document.getElementById('healthText');

    // Calculate percentage
    const percentage = (player.health / 100) * 100;
    healthBar.style.width = percentage + '%';

    // Color coding
    if (player.health > 70) {
        healthBar.style.backgroundColor = '#00ff00';  // Green
    } else if (player.health > 35) {
        healthBar.style.backgroundColor = '#ffff00';  // Yellow
    } else {
        healthBar.style.backgroundColor = '#ff0000';  // Red
    }

    // Update text
    healthText.textContent = `${Math.ceil(player.health)} / 100`;
}
```

**DOM Elements**:
- `healthBar`: Width bar element
- `healthText`: Text display element

**Color States**:
- Green: 70-100 HP (healthy)
- Yellow: 35-69 HP (caution)
- Red: 0-34 HP (critical)

---

## Rendering

### Main Game Loop

**File**: `game.js:482-495`

```javascript
function gameLoop(timestamp) {
    // Update game state
    updatePlayer();
    updateEnemies();
    updateParticles();
    updateCamera();
    checkCollisions();

    // Render scene
    renderer.render(scene, camera);

    // Request next frame
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();
```

**Execution Order**:
1. Player update (movement, gravity, health)
2. Enemy update (spawning, chasing, combat)
3. Particle update (physics, fade-out, removal)
4. Camera update (position and look-at)
5. Collision detection
6. Scene render
7. Request next frame

**Frame Rate**: ~60 FPS (depends on browser and hardware)

### Window Resize Handler

**File**: `game.js:600-610`

```javascript
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
});
```

**Functionality**:
1. Get new window dimensions
2. Update camera aspect ratio
3. Update camera projection matrix
4. Update renderer size

**Trigger**: Window resize event

---

## Constants

### Physics Constants

```javascript
const GRAVITY = 0.015;              // units/frame²
const JUMP_POWER = 0.3;             // units/frame velocity
const GROUND_LEVEL = 1.0;           // units (y-position)
```

### Movement Constants

```javascript
const PLAYER_SPEED = 0.15;          // units/frame
const ENEMY_SPEED = 0.05;           // units/frame
const CAMERA_SPEED = 0.05;          // radians/frame
```

### Combat Constants

```javascript
const PLAYER_DAMAGE = 2;            // HP/frame to enemy
const ENEMY_DAMAGE = 10;            // HP/hit to player
const DAMAGE_COOLDOWN = 60;         // frames between hits
const ENEMY_HEALTH = 30;            // HP per enemy
const PLAYER_MAX_HEALTH = 100;      // Player max HP
```

### Particle Constants

```javascript
const PARTICLES_PER_DEATH = 12;     // Number of particles
const PARTICLE_LIFETIME = 40;       // frames
const PARTICLE_SPREAD = 0.2;        // units/frame velocity
```

### Enemy Spawn Constants

```javascript
const SPAWN_INTERVAL = 180;         // frames between spawns
const MAX_ENEMIES = 10;             // Maximum on screen
const SPAWN_DISTANCE_MIN = 15;      // units from player
const SPAWN_DISTANCE_MAX = 25;      // units from player
```

### Camera Constants

```javascript
const CAMERA_DISTANCE = 10;         // units from player
const CAMERA_HEIGHT = 5;            // units above ground
const MAX_VERTICAL_ANGLE = Math.PI / 3;  // ±60 degrees
```

### Dimensions

```javascript
const PLAYER_WIDTH = 1.0;
const PLAYER_HEIGHT = 2.0;
const PLAYER_DEPTH = 1.0;

const ENEMY_WIDTH = 0.6;
const ENEMY_HEIGHT = 0.6;
const ENEMY_DEPTH = 0.6;

const GROUND_WIDTH = 100;
const GROUND_DEPTH = 100;
```

---

## Global Variables

### Scene Objects

```javascript
const scene;        // Three.js scene
const camera;       // Perspective camera
const renderer;     // WebGL renderer
const ground;       // Ground mesh
const player;       // Player mesh
```

### Game State

```javascript
const enemies = [];         // Array of enemy meshes
const particles = [];       // Array of particle meshes
let spawnTimer = 0;         // Counter for enemy spawning
let keysPressed = {};       // Current key states
let cameraRotation = {      // Camera rotation angles
    x: 0,                   // Vertical (pitch)
    y: 0                    // Horizontal (yaw)
};
```

---

## Summary

This API reference covers:

- **Scene Setup**: Initialization of Three.js environment
- **Entity Creation**: Functions for creating player and enemies
- **Player System**: Movement, jumping, and health management
- **Enemy System**: Spawning, AI, and combat
- **Particle System**: Death effects and visual feedback
- **Input Handling**: Keyboard input processing
- **Collision Detection**: AABB-based hit detection
- **Update Functions**: Game loop logic
- **Rendering**: Canvas and scene rendering
- **Constants**: Game balance values

All functions are designed to be called from the main game loop and work together to create a complete game experience.
