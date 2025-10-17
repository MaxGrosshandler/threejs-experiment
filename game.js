import * as THREE from 'three';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue
scene.fog = new THREE.Fog(0x87CEEB, 0, 100);

// Camera setup
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 5, 10);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(50, 50, 50);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 500;
directionalLight.shadow.camera.left = -50;
directionalLight.shadow.camera.right = 50;
directionalLight.shadow.camera.top = 50;
directionalLight.shadow.camera.bottom = -50;
scene.add(directionalLight);

// Ground
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a9d23,
    roughness: 0.8,
    metalness: 0.2
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Add some obstacles/environment objects
const createBox = (x, y, z, width, height, depth, color) => {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({ color });
    const box = new THREE.Mesh(geometry, material);
    box.position.set(x, y, z);
    box.castShadow = true;
    box.receiveShadow = true;
    scene.add(box);
    return box;
};

// Create some platforms and obstacles - store them for collision detection
const obstacles = [];
obstacles.push(createBox(-10, 1, -10, 4, 2, 4, 0x8B4513));
obstacles.push(createBox(10, 1.5, -15, 5, 3, 5, 0x8B4513));
obstacles.push(createBox(-15, 1, 10, 3, 2, 3, 0x8B4513));
obstacles.push(createBox(15, 2, 15, 6, 4, 6, 0x8B4513));

// Create player character
const playerGeometry = new THREE.BoxGeometry(1, 2, 1);
const playerMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.position.set(0, 1, 0);
player.castShadow = true;
scene.add(player);

// Create sword slash hitbox - simple box in front of player
const hitboxGeometry = new THREE.BoxGeometry(1.2, 1.8, 1.2);
const hitboxMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    transparent: true,
    opacity: 0.3
});

const playerHitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial);
playerHitbox.castShadow = false;
scene.add(playerHitbox);

// Player state
const playerState = {
    velocity: new THREE.Vector3(0, 0, 0),
    speed: 0.15,
    jumpPower: 0.3,
    isJumping: false,
    jumpsRemaining: 2,
    maxJumps: 2,
    gravity: -0.015,
    height: 2,
    health: 100,
    maxHealth: 100,
    damageTimer: 0,
    damageCooldown: 60 // frames between damage
};

// Enemy system
const enemies = [];
const enemyState = {
    spawnTimer: 0,
    spawnInterval: 180, // frames between spawns
    maxEnemies: 10
};

// Particle system
const deathParticles = [];

// Create enemy
function createEnemy(x, z) {
    const enemyGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    const enemyMaterial = new THREE.MeshStandardMaterial({ color: 0x0066ff });
    const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
    enemy.position.set(x, 0.3, z);
    enemy.castShadow = true;
    scene.add(enemy);

    return {
        mesh: enemy,
        health: 30,
        maxHealth: 30,
        speed: 0.05,
        alive: true
    };
}

// Spawn enemy at random position around player
function spawnEnemy() {
    if (enemies.length >= enemyState.maxEnemies) return;

    const angle = Math.random() * Math.PI * 2;
    const distance = 15 + Math.random() * 10;
    const x = player.position.x + Math.cos(angle) * distance;
    const z = player.position.z + Math.sin(angle) * distance;

    enemies.push(createEnemy(x, z));
}

// Create death effect particles
function createDeathEffect(position) {
    const particleCount = 12;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
        const particleGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        const particleMaterial = new THREE.MeshBasicMaterial({
            color: 0x0066ff,
            transparent: true,
            opacity: 1.0
        });
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);

        // Clone position to avoid reference issues
        particle.position.set(position.x, position.y, position.z);

        // Random velocity for each particle
        const angle = (i / particleCount) * Math.PI * 2;
        const speed = 0.08 + Math.random() * 0.08;
        particle.userData.velocity = new THREE.Vector3(
            Math.cos(angle) * speed,
            0.2 + Math.random() * 0.15,
            Math.sin(angle) * speed
        );
        particle.userData.lifetime = 40; // frames

        scene.add(particle);
        particles.push(particle);
    }

    return particles;
}

// Keyboard input
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.code] = true;

    // Jump with double jump
    if (e.code === 'Space' && playerState.jumpsRemaining > 0) {
        playerState.velocity.y = playerState.jumpPower;
        playerState.jumpsRemaining--;
        playerState.isJumping = true;
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// Arrow key controls for camera
const cameraRotation = { horizontal: 0, vertical: 0.3 };
const cameraRotationSpeed = 0.05;

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Health bar UI update function
function updateHealthBar() {
    const healthBarFill = document.getElementById('healthBarFill');
    const healthText = document.getElementById('healthText');

    const healthPercentage = (playerState.health / playerState.maxHealth) * 100;
    healthBarFill.style.width = healthPercentage + '%';
    healthText.textContent = Math.round(playerState.health) + ' / ' + playerState.maxHealth;

    // Change color based on health
    if (healthPercentage > 60) {
        healthBarFill.style.background = 'linear-gradient(to right, #00ff00, #44ff44)';
        healthBarFill.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.5)';
    } else if (healthPercentage > 30) {
        healthBarFill.style.background = 'linear-gradient(to right, #ffaa00, #ffcc44)';
        healthBarFill.style.boxShadow = '0 0 10px rgba(255, 170, 0, 0.5)';
    } else {
        healthBarFill.style.background = 'linear-gradient(to right, #ff0000, #ff4444)';
        healthBarFill.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.5)';
    }
}

// Collision detection helper
function checkCollision(newX, newY, newZ) {
    const playerBox = new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(newX, newY, newZ),
        new THREE.Vector3(1, 2, 1)
    );

    for (const obstacle of obstacles) {
        const obstacleBox = new THREE.Box3().setFromObject(obstacle);
        if (playerBox.intersectsBox(obstacleBox)) {
            return true;
        }
    }
    return false;
}

// Update player movement
function updatePlayer() {
    // Apply gravity
    playerState.velocity.y += playerState.gravity;

    // Get camera forward direction (projected on horizontal plane)
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();

    // Get camera right direction
    const cameraRight = new THREE.Vector3();
    cameraRight.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0));
    cameraRight.normalize();

    // Calculate movement based on input and camera orientation
    const moveDirection = new THREE.Vector3();

    if (keys['KeyW']) {
        moveDirection.add(cameraDirection);
    }
    if (keys['KeyS']) {
        moveDirection.sub(cameraDirection);
    }
    if (keys['KeyD']) {
        moveDirection.add(cameraRight);
    }
    if (keys['KeyA']) {
        moveDirection.sub(cameraRight);
    }

    // Normalize movement direction
    if (moveDirection.length() > 0) {
        moveDirection.normalize();
    }

    // Calculate new position with horizontal movement
    const newX = player.position.x + moveDirection.x * playerState.speed;
    const newZ = player.position.z + moveDirection.z * playerState.speed;

    // Check collision for X axis movement
    if (!checkCollision(newX, player.position.y, player.position.z)) {
        player.position.x = newX;
    }

    // Check collision for Z axis movement
    if (!checkCollision(player.position.x, player.position.y, newZ)) {
        player.position.z = newZ;
    }

    // Apply vertical velocity
    const newY = player.position.y + playerState.velocity.y;

    // Check vertical collision
    if (!checkCollision(player.position.x, newY, player.position.z)) {
        player.position.y = newY;
    } else {
        // Hit something vertically
        if (playerState.velocity.y < 0) {
            // Hit ground or top of obstacle
            playerState.isJumping = false;
        }
        playerState.velocity.y = 0;
    }

    // Ground collision
    if (player.position.y <= playerState.height / 2) {
        player.position.y = playerState.height / 2;
        playerState.velocity.y = 0;
        playerState.isJumping = false;
        playerState.jumpsRemaining = playerState.maxJumps; // Reset jumps when landing
    }

    // Reset jumps when landing on obstacle
    if (playerState.velocity.y === 0 && !playerState.isJumping) {
        playerState.jumpsRemaining = playerState.maxJumps;
    }

    // Update hitbox position in front of player
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();

    playerHitbox.position.set(
        player.position.x + cameraDirection.x * 1.5,
        player.position.y,
        player.position.z + cameraDirection.z * 1.5
    );

    // Decrease damage timer
    if (playerState.damageTimer > 0) {
        playerState.damageTimer--;
    }
}

// Update enemies
function updateEnemies() {
    // Spawn enemies
    enemyState.spawnTimer++;
    if (enemyState.spawnTimer >= enemyState.spawnInterval) {
        spawnEnemy();
        enemyState.spawnTimer = 0;
    }

    // Update each enemy
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];

        if (!enemy.alive) {
            // Create death effect at enemy position
            const particles = createDeathEffect(enemy.mesh.position);
            deathParticles.push(...particles);

            // Remove dead enemy
            scene.remove(enemy.mesh);
            enemies.splice(i, 1);
            continue;
        }

        // Move enemy towards player
        const direction = new THREE.Vector3();
        direction.subVectors(player.position, enemy.mesh.position);
        direction.y = 0;
        direction.normalize();

        enemy.mesh.position.x += direction.x * enemy.speed;
        enemy.mesh.position.z += direction.z * enemy.speed;

        // Check collision with player hitbox (player damages enemy)
        const enemyBox = new THREE.Box3().setFromObject(enemy.mesh);
        const hitboxBox = new THREE.Box3().setFromObject(playerHitbox);

        if (enemyBox.intersectsBox(hitboxBox)) {
            enemy.health -= 2;

            // Flash enemy white when hit
            enemy.mesh.material.color.setHex(0xffffff);
            setTimeout(() => {
                if (enemy.alive) {
                    enemy.mesh.material.color.setHex(0x0066ff);
                }
            }, 50);

            if (enemy.health <= 0) {
                enemy.alive = false;
            }
        }

        // Check collision with player (enemy damages player)
        const playerBox = new THREE.Box3().setFromObject(player);
        if (enemyBox.intersectsBox(playerBox) && playerState.damageTimer === 0) {
            playerState.health -= 10;
            playerState.damageTimer = playerState.damageCooldown;

            // Flash player white when hit
            player.material.color.setHex(0xffffff);
            setTimeout(() => {
                player.material.color.setHex(0xff0000);
            }, 100);

            if (playerState.health < 0) {
                playerState.health = 0;
            }
        }
    }
}

// Update death particles
function updateParticles() {
    for (let i = deathParticles.length - 1; i >= 0; i--) {
        const particle = deathParticles[i];

        // Update position based on velocity
        particle.position.x += particle.userData.velocity.x;
        particle.position.y += particle.userData.velocity.y;
        particle.position.z += particle.userData.velocity.z;

        // Apply gravity to particles
        particle.userData.velocity.y -= 0.008;

        // Rotate particles for effect
        particle.rotation.x += 0.08;
        particle.rotation.y += 0.08;

        // Fade out particles
        particle.userData.lifetime--;
        const lifePercent = particle.userData.lifetime / 40;
        particle.material.opacity = lifePercent;

        // Shrink particles
        const scale = lifePercent;
        particle.scale.set(scale, scale, scale);

        // Remove dead particles
        if (particle.userData.lifetime <= 0) {
            scene.remove(particle);
            deathParticles.splice(i, 1);
        }
    }
}

// Update camera position
function updateCamera() {
    // Update camera rotation based on arrow keys
    if (keys['ArrowLeft']) {
        cameraRotation.horizontal += cameraRotationSpeed;
    }
    if (keys['ArrowRight']) {
        cameraRotation.horizontal -= cameraRotationSpeed;
    }
    if (keys['ArrowUp']) {
        cameraRotation.vertical = Math.min(Math.PI / 3, cameraRotation.vertical + cameraRotationSpeed);
    }
    if (keys['ArrowDown']) {
        cameraRotation.vertical = Math.max(-Math.PI / 3, cameraRotation.vertical - cameraRotationSpeed);
    }

    const distance = 10;
    const height = 5;

    // Calculate camera position based on rotation angles
    const horizontalAngle = cameraRotation.horizontal;
    const verticalAngle = cameraRotation.vertical;

    camera.position.x = player.position.x + Math.sin(horizontalAngle) * distance * Math.cos(verticalAngle);
    camera.position.z = player.position.z + Math.cos(horizontalAngle) * distance * Math.cos(verticalAngle);
    camera.position.y = player.position.y + height + Math.sin(verticalAngle) * distance;

    camera.lookAt(player.position.x, player.position.y + 1, player.position.z);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    updatePlayer();
    updateEnemies();
    updateParticles();
    updateCamera();
    updateHealthBar();

    renderer.render(scene, camera);
}

// Start the animation loop
animate();
