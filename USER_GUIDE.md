# User Guide and Gameplay Instructions

Complete guide to playing the 3D Action Game, including controls, strategies, and tips.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Controls](#controls)
3. [User Interface](#user-interface)
4. [Gameplay Basics](#gameplay-basics)
5. [Combat System](#combat-system)
6. [Survival Strategies](#survival-strategies)
7. [Advanced Techniques](#advanced-techniques)
8. [Tips and Tricks](#tips-and-tricks)
9. [Troubleshooting](#troubleshooting)
10. [FAQ](#faq)

---

## Getting Started

### Installation

**No installation required!** This is a browser-based game.

### Running the Game

**Method 1: Local File**
1. Download `index.html` and `game.js`
2. Place both files in the same folder
3. Double-click `index.html` to open in your default browser
4. Start playing!

**Method 2: Web Server (Recommended)**
1. Place files in a web-accessible directory
2. Navigate to the URL (e.g., `http://localhost:8000/index.html`)
3. Start playing!

### Browser Requirements

✅ **Recommended Browsers**
- Google Chrome (latest version)
- Mozilla Firefox (latest version)
- Microsoft Edge (latest version)
- Apple Safari (latest version)

✅ **Required Features**
- WebGL support (3D graphics)
- ES6 JavaScript support
- Modern DOM API

❌ **Not Supported**
- Internet Explorer
- Very old browsers (pre-2015)

### First Time Setup

1. **Click in the game window** to give it keyboard focus
2. **Allow full screen** (optional, for better experience)
3. **Check controls panel** in top-left (they'll be displayed)
4. **Start moving** with WASD keys
5. **Find enemies** (blue boxes in the distance)
6. **Begin combat!**

---

## Controls

### Movement Controls

| Action | Key | Behavior |
|--------|-----|----------|
| Move Forward | `W` | Move toward camera direction |
| Move Left | `A` | Strafe left perpendicular to camera |
| Move Right | `D` | Strafe right perpendicular to camera |
| Move Backward | `S` | Move away from camera direction |

**Camera-Relative Movement**
Movement is relative to where the camera is pointing, not absolute directions. This means:
- Pressing `W` always moves toward the camera's forward direction
- Turning the camera with arrow keys changes what "forward" means
- This makes controlling easier and more intuitive

### Jump Controls

| Action | Key | Behavior |
|--------|-----|----------|
| Jump | `Space` | Jump once when on ground |
| Double Jump | `Space` (while airborne) | Jump again while in air |

**Jump Mechanics**
- First jump: Works only when touching the ground
- Second jump: Available once while airborne after jumping
- Reset: Jumping again resets your double-jump ability when you land
- Max jumps: 2 total per airtime (ground + air)

### Camera Controls

| Action | Key | Behavior |
|--------|-----|----------|
| Rotate Camera Up | `↑` (Up Arrow) | Look upward (max 60°) |
| Rotate Camera Down | `↓` (Down Arrow) | Look downward (max 60°) |
| Rotate Camera Left | `←` (Left Arrow) | Rotate camera counter-clockwise |
| Rotate Camera Right | `→` (Right Arrow) | Rotate camera clockwise |

**Camera Behavior**
- Orbits the player at a fixed distance
- Up/down rotation limited to ±60 degrees (prevents looking straight up/down)
- Left/right rotation unlimited (can spin 360°)
- Always looks at center of player body
- Distance from player is fixed (can't zoom)

### Control Summary

```
        W
        |
    A - + - D          ← → Up Down = Camera
        |
        S
      Space = Jump
```

---

## User Interface

### Health Bar

**Location**: Top-center of screen

**Display**:
```
┌─────────────────────────────┐
│  [████████████░░░░░░░░░░░░░]  75 / 100  │
└─────────────────────────────┘
```

**Color Coding**:
- 🟢 **Green** (70-100 HP): Healthy
- 🟡 **Yellow** (35-69 HP): Caution
- 🔴 **Red** (0-34 HP): Critical danger
- ⚫ **Dead** (0 HP): Game over (current implementation: you stay visible)

**Interpretation**:
- Full bar = Full health
- Half bar = 50 HP remaining
- Almost empty = Close to death

### Controls Panel

**Location**: Top-left of screen

**Content**:
- Displays all keyboard controls
- Updated based on current game state
- Appears when game loads

**Information Shown**:
- Movement keys (WASD)
- Jump key (Space)
- Camera controls (Arrow keys)

---

## Gameplay Basics

### The Game World

**Arena Description**
```
┌──────────────────────────────┐
│     100 × 100 unit arena     │
│                              │
│  [Green Ground]              │
│                              │
│  You spawn in center         │
│  Enemies spawn around edges  │
│                              │
│  Sky blue background         │
│  Fog for depth perception    │
│                              │
└──────────────────────────────┘
```

**Key Locations**
- Center (0, 0): Your starting position
- Edges (±50, ±50): Enemy spawn area
- Sky: Camera focus point

**Traversal Time**
```
Walking speed: 0.15 units/frame
At 60 FPS: 9 units/second
Corner to corner (0 to 100): ~11 seconds
```

### Your Character

**Appearance**: Red box

**Abilities**
- Walk in 8 directions (relative to camera)
- Jump twice (ground + air)
- Damage enemies by contact
- Receive damage from enemies (with cooldown)

**Starting State**
- Position: Center of arena
- Health: 100 HP
- Jumps available: 2 (ready to jump)
- Invincibility: None (can take damage immediately)

### Enemy Characters

**Appearance**: Blue boxes

**Behavior**
- Always chase you
- Deal 10 damage per hit (with 1-second cooldown)
- Have 30 HP each
- Explode in green particles when defeated
- No special abilities

**Spawning**
- Start appearing after a few seconds
- New enemy every 3 seconds
- Maximum 10 on screen at once
- Appear at random locations 15-25 units away

### Objective

**Primary Goal**: Survive as long as possible

**How to Play**
1. Move around using WASD
2. Locate enemies (blue boxes)
3. Walk into them to damage them
4. Avoid staying next to multiple enemies
5. Watch your health bar
6. Defeat enemies and survive

**Scoring**: Time survived (implicit - game doesn't track officially)

---

## Combat System

### Damage Model

#### Dealing Damage (You → Enemy)

**Damage Rate**: 2 HP per frame
**At 60 FPS**: 120 HP/second (very fast!)
**Enemy Health**: 30 HP
**Time to Defeat**: 15 frames = 0.25 seconds (if continuous contact)

**How It Works**
```
1. You touch enemy
2. Each frame you're touching: Enemy loses 2 HP
3. After 15 frames: Enemy defeated
4. Green particles appear
5. Enemy removed from game
```

#### Taking Damage (Enemy → You)

**Damage Amount**: 10 HP per hit
**Damage Cooldown**: 60 frames (1 second)
**Your Health**: 100 HP
**Max Damage Per Second**: 10 HP (once per second)

**How It Works**
```
1. Enemy touches you
2. You lose 10 HP
3. Damage cooldown starts (60 frames)
4. Wait 1 second before next damage possible
5. Enemy can damage you again
6. Repeats while in contact
```

**Visual Feedback**
- Your character flashes white when hit
- Health bar updates immediately
- Color changes (green → yellow → red)

### Combat Mechanics

#### One-on-One Combat

```
vs. Single Enemy:
Your DPS: 120 HP/second
Enemy health: 30 HP
Duration: 0.25 seconds
Outcome: You win quickly
```

**Strategy**: Face one enemy at a time
- Keep moving past the enemy
- Circle strafe (move around while hitting)
- Turn to see where they are
- Then engage again

#### One-on-Two Combat

```
vs. Two Enemies:
Your DPS: 120 HP/second (into one)
Damage taken: 20 HP/second (from both)
Health: 100 HP
Duration until death: 5 seconds
Outcome: You die quickly
```

**Strategy**: Avoid this situation!
- Move away from multiple enemies
- Focus on running to separate them
- Engage one at a time

#### One-on-Ten Combat

```
vs. Ten Enemies:
Your DPS: 120 HP/second (into one)
Damage taken: up to 100 HP/second
Health: 100 HP
Duration until death: <1 second
Outcome: You die instantly
```

**Strategy**: Prevent this situation
- Never let 10 enemies surround you
- Keep moving away from groups
- Spread out enemies

### Damage Cooldown Explanation

**Why enemies deal damage only once per second:**

```
Frame timeline:
  0: Enemy hits you → 10 damage, cooldown = 60
  1: Cooldown = 59 (decreases each frame)
  2: Cooldown = 58
  ...
 59: Cooldown = 1
 60: Cooldown = 0 → Can take damage again next frame
 61: Enemy hits you → 10 damage, cooldown = 60

Net effect: Max 1 hit per second per enemy
```

This prevents instant death when surrounded.

---

## Survival Strategies

### Early Game (First 30 seconds)

**Objectives**
- Familiarize yourself with controls
- Practice jumping and camera control
- Find and defeat first enemy
- Stay above 75 HP

**Tips**
1. Move around to get comfortable with camera-relative controls
2. Test your jump by double-jumping
3. Find an enemy (usually appearing around edges)
4. Approach cautiously (enemies are slow)
5. Keep moving while hitting (don't stand still)
6. One enemy is easy to defeat - stay calm

**Expected State**
- Enemies spawning slowly
- Only 1-3 enemies on screen
- You're learning combat
- Take a few hits but not dying

### Mid Game (30-180 seconds)

**Objectives**
- Manage multiple enemies
- Keep health above 50%
- Develop positioning skills
- Defeat enemies efficiently

**Tactics**
1. **Kiting**: Lead enemies away from others
2. **Positioning**: Stay in center away from groups
3. **Selective engagement**: Pick weak/isolated enemies
4. **Evasion**: Run away when health drops
5. **Double-jump usage**: Use for mobility and dodging

**Enemy Density**
- Spawning every 3 seconds
- Max 10 on screen
- Increasing density: 5-10 enemies typical
- Approaching chaos level

**Health Management**
- Avoid taking damage (1-2 hits per enemy encounter)
- Total damage taken: ~20-50 HP
- Remaining health: 50-80 HP
- Still comfortable

### Late Game (180+ seconds)

**Objectives**
- Maximum survival time
- 10 enemies on screen simultaneously
- Extreme positioning requirement
- Stay alive as long as possible

**Advanced Tactics**
1. **Luring**: Lead enemies to one location, then escape
2. **Bunching**: Force enemies together to use terrain
3. **Momentum**: Use movement speed and jump height advantage
4. **Precision**: Target isolated enemies
5. **Desperation**: Run in circles to avoid damage

**Enemy Density**
- Constant 10 enemies (max cap reached)
- Enemies defeated → immediately replaced
- Cannot reduce enemy count
- Approaching inevitable death

**Health Crisis**
- Likely to be at 20-50% health
- Multiple hits incoming per second
- One mistake = rapid death
- Every second counts

### Progression Flow

```
Time: 0-30s
Difficulty: Easy
Enemy count: 1-3
Health: 100-75 HP
Status: Learning phase

Time: 30-120s
Difficulty: Medium
Enemy count: 3-8
Health: 75-50 HP
Status: Combat phase

Time: 120-180s
Difficulty: Hard
Enemy count: 8-10
Health: 50-25 HP
Status: Survival phase

Time: 180s+
Difficulty: Extreme
Enemy count: 10 (constant)
Health: 25-0 HP
Status: Endgame/death imminent
```

---

## Advanced Techniques

### Movement Optimization

#### Efficient Movement

**Problem**: Moving slowly to damage one enemy while others approach

**Solution**: Efficient patterns

```
1. Approach enemy diagonally (not head-on)
2. Sidestep (strafe) while hitting
3. Disengage by moving backward
4. Create distance (30+ units)
5. Repeat on next isolated enemy
```

**This gives you**:
- Time to hit enemies (damage)
- Constant movement (avoid groups)
- Visual confirmation (know where others are)
- Control over engagement

#### Map Knowledge

**Mental Map**
- Center area (0, 0): Start location
- Safe zones: None (open arena)
- Danger zones: Near boundaries (enemies spawn there)
- Preferred location: Center, moving outward

**Traversal Routes**
```
Safe path: Center → Enemy → Back to center
Risky path: Chasing enemy to boundary
Dangerous path: Getting trapped at edge
```

### Jump Techniques

#### Double-Jump Mobility

**Basic Usage**
```
Ground → Jump (0.3 velocity)
    → Move upward for 20 frames
    → Apex (6 units high)
    → Fall back down
```

**Advanced Usage**
```
Ground → Jump → Move sideways → Double-jump → Dodge → Land elsewhere
```

**Applications**
1. **Height gain**: Reach 6 units high
2. **Horizontal distance**: Move while jumping
3. **Dodge enemy**: Jump sideways away from incoming enemy
4. **Chase enemy**: Jump to keep up during escape

#### Jump vs. Ground Movement

**Speed Comparison**
- Ground movement: 0.15 units/frame = 9 units/sec
- Jump horizontal: Same (can move while jumping)
- Jump vertical: 0.3-0 units/frame during jump

**Vertical Momentum**
```
Jump curve:
Height
  6 │       ╱╲
  4 │      ╱  ╲
  2 │     ╱    ╲
  0 └────╱──────╲───── Time
     Start Apex  Land
     0 frames   40 frames total
```

**Energy Cost**
- Jump: No energy cost (unlimited in air)
- Recovery time: Zero (can immediately double-jump)

### Positioning Strategy

#### High-Ground Advantage

**Note**: Arena is flat (no hills)

**Psychological Advantage**
- Height awareness still helps
- Think of camera position as "high ground"
- Being able to see enemies = advantage

#### Crowd Control

**Splitting Enemies**
```
Enemy placement:  ●●●●●
Your position:     ↑
Movement:        Run between them
Result:          ●  ●  ●  ●  ●
                    ↓
                   (scattered)
```

**Concentration Risk**
```
Multiple enemies: ●●●●●
Getting hit:      10+10+10 = 30 HP/second
Your health: 100 HP
Time to death: 3 seconds
Strategy: AVOID THIS
```

---

## Tips and Tricks

### Beginner Tips

1. **Focus on camera control first**
   - Get comfortable rotating around enemies
   - Practice left/right/up/down camera movement
   - Camera control = better positioning

2. **One enemy at a time**
   - Never fight multiple enemies simultaneously
   - Defeat one, move away, find next
   - This is the safest approach

3. **Use the double-jump**
   - Don't just jump straight up
   - Jump and move sideways
   - Jump to dodge incoming enemies
   - Jump when health is low (makes you harder to hit)

4. **Watch your health bar color**
   - Green = Relax (safe)
   - Yellow = Caution (be careful)
   - Red = Danger (must heal or die soon)

5. **Movement is defense**
   - Never stand still when enemies are nearby
   - Constantly moving = hard to hit
   - Standing still = taking damage

### Intermediate Tactics

1. **Area denial**
   - Keep enemies away from center
   - Fight at the boundaries of the arena
   - This keeps maximum distance from other enemies

2. **Vision management**
   - Keep enemies in view when possible
   - Use camera to rotate and see surroundings
   - Know where enemies are before running toward them

3. **Timing your engagement**
   - Wait for enemies to separate
   - Fight the most isolated enemy
   - Retreat before others arrive

4. **Efficient damage**
   - Walk into enemy to hit them
   - Walk through them (they can't block)
   - Sidestep while hitting (keeps you mobile)

5. **Health management**
   - Keep health above 50% when possible
   - Avoid getting hit (1-2 hits per enemy)
   - Never let multiple enemies hit you

### Expert Techniques

1. **Circular motion**
   - Move in circles around enemies
   - This maximizes damage while maintaining distance
   - Harder to get surrounded

2. **Jump momentum**
   - Combine jump with movement for faster getaway
   - Jump away while being chased
   - Harder to catch when airborne

3. **Predictive movement**
   - Anticipate where enemies will go
   - Move away before they reach you
   - Cut off their pursuit routes

4. **Enemy behavior exploitation**
   - Enemies always chase you
   - Use this to separate them
   - Lead them away from allies

5. **Maximum efficiency**
   - Minimize time without engaging enemies
   - Maximize time defeating enemies
   - Reduce travel time between enemies

### Performance Optimization

**For Low-End Devices**

1. Close other browser tabs
2. Close other applications
3. Use Chrome or Firefox (better performance)
4. Lower screen resolution if supported
5. Disable browser plugins/extensions

**Frame Rate**
- Target: 60 FPS
- Acceptable: 30+ FPS
- Poor: <30 FPS

**If lagging**:
1. Close other programs
2. Close browser tabs
3. Restart browser
4. Try different browser

---

## Troubleshooting

### Game Won't Load

**Problem**: Page appears blank or shows errors

**Solutions**:
1. Refresh the page (F5 or Ctrl+R)
2. Clear browser cache (Ctrl+Shift+Delete)
3. Try different browser
4. Check browser console for errors (F12 → Console)
5. Ensure both HTML and JS files are in same directory

### Controls Not Responding

**Problem**: Keys don't seem to work

**Solutions**:
1. **Click in the game window** to give it keyboard focus
2. Check Num Lock isn't interfering
3. Try different keys (ensure they work)
4. Check if browser has focus (click window)
5. Reload page

### Poor Performance / Lag

**Problem**: Game is slow or choppy

**Solutions**:
1. Close other browser tabs (frees memory)
2. Close other applications (frees CPU)
3. Update graphics drivers (enables GPU acceleration)
4. Try different browser (Chrome/Firefox recommended)
5. Try fullscreen mode (F11)
6. Lower monitor refresh rate if very high

### Camera Acting Weird

**Problem**: Camera rotates unexpectedly or inverted

**Solutions**:
1. Reset by reloading page
2. Check arrow keys aren't stuck
3. Try different keyboard
4. Check browser settings (some browsers intercept arrow keys)

### Health Bar Disappears

**Problem**: Health bar not visible

**Solutions**:
1. Scroll to top of page (ensure UI is visible)
2. Make browser window bigger (UI might be off-screen)
3. Try different zoom level (Ctrl+0 to reset)
4. Reload page

### Game Freezes

**Problem**: Game becomes unresponsive

**Solutions**:
1. Wait 10 seconds (may be temporary freeze)
2. Reload page (F5)
3. Close other applications
4. Restart browser
5. Try different browser
6. Check system resources (might be out of memory)

### Enemies Not Spawning

**Problem**: No enemies appear after waiting

**Solutions**:
1. Wait longer (first enemies appear after ~10 seconds)
2. Move around the arena (enemies spawn nearby)
3. Look for blue boxes in distance
4. Reload page if they never appear

---

## FAQ

### Gameplay Questions

**Q: How do I win?**
A: There's no winning condition. The goal is to survive as long as possible. Keep defeating enemies and avoid death for as long as you can.

**Q: Can I save my progress?**
A: No. Each game starts fresh. When you die, you restart. (Future: could add save feature)

**Q: Can I pause the game?**
A: No. Game continues while running. (Future: could add pause feature)

**Q: What's the highest score/time?**
A: Game doesn't officially track time. You can mentally count or use a timer. Longest reported: ~300+ seconds.

**Q: Can I change difficulty?**
A: No. Difficulty is fixed (increases as more enemies spawn). (Future: could add difficulty settings)

**Q: Are there power-ups?**
A: No. (Future: could add power-ups for health, speed, damage, etc.)

### Technical Questions

**Q: What browser do I need?**
A: Any modern browser with WebGL support (Chrome, Firefox, Safari, Edge). Internet Explorer is not supported.

**Q: Can I play on mobile?**
A: The game was designed for keyboard input. Most mobile devices don't have keyboards. You could use a bluetooth keyboard, but the screen might be too small for comfortable gameplay.

**Q: Can I modify the game?**
A: Yes! The code is provided. See DEVELOPER_GUIDE.md for extending and modifying.

**Q: Can I run this offline?**
A: Mostly yes. The game itself is offline, but Three.js is loaded from CDN. If you download the Three.js file locally, it will work 100% offline. See DEVELOPER_GUIDE.md for instructions.

**Q: Do I need an internet connection?**
A: Only if you load from CDN (default). If using local Three.js file, no internet needed.

**Q: Is there a server component?**
A: No. Everything runs in your browser locally.

### Gameplay Mechanics Questions

**Q: Why does damage have a cooldown?**
A: To prevent instant death when surrounded. With cooldown, you have time to escape even with multiple enemies.

**Q: Why do I move slower than enemies spawn?**
A: Movement speed (0.15 units/frame) is intentional. Enemies spawn at 15-25 units distance. This prevents being instantly surrounded.

**Q: Why does the camera have a vertical limit?**
A: Prevents looking straight up/down which breaks player visibility. ±60° allows seeing player while maintaining good field of view.

**Q: Can enemies damage each other?**
A: No. Enemies only interact with you. They pass through each other.

**Q: Do enemies ever stop chasing?**
A: No. They chase infinitely until they die or you die.

**Q: Can I go beyond the arena boundaries?**
A: Yes. The arena is 100×100 but you can move further. However, this is dangerous as enemies spawn near the edges.

### Strategy Questions

**Q: What's the best strategy?**
A: Keep moving, fight enemies one at a time, avoid groups. Use the arena space to separate enemies and retreat frequently.

**Q: How long can I survive?**
A: Depends on your skill. Beginners: 1-2 minutes. Intermediate: 5-10 minutes. Expert: 15+ minutes. (These are estimates)

**Q: What should I do when low on health?**
A: Move away from all enemies, take a break from combat, recover cooldown timer, then re-engage.

**Q: Should I fight multiple enemies?**
A: Generally no. One-on-one is safe. Two-on-one is risky. Three-on-one is usually death. Prioritize escaping groups.

### Account/Save Questions

**Q: Can I create an account?**
A: No account system exists. (Future: could add accounts for leaderboards)

**Q: Can I upload my score?**
A: No. No online integration currently.

**Q: Can I compare scores with friends?**
A: Not officially. You could screenshot your health bar or manually track time, but no built-in comparison.

---

## Summary

**Key Takeaways**:

1. **Survive**: Your only goal is to stay alive
2. **Fight smart**: One enemy at a time
3. **Move constantly**: Standing still = taking damage
4. **Use jumps**: Double-jump for mobility and dodging
5. **Watch health**: Green = safe, yellow = careful, red = danger
6. **Know the controls**: WASD + Space + Arrows
7. **Be patient**: Early game is easy, late game is hard
8. **Have fun**: This is a casual game meant to be enjoyed

**Progression Path**:
- Master controls (first 10 seconds)
- Master one-on-one combat (first 30 seconds)
- Handle 3-5 enemies (first 2 minutes)
- Survive chaos of 10 enemies (3+ minutes)
- Personal high score (your target)

Good luck, and happy gaming!
