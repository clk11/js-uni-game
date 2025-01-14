class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size to window size
        this.resizeCanvas();
        // Handle window resizing
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Initialize victory object first
        this.victory = {
            active: false,
            particles: [],
            startTime: 0,
            confettiColors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF']
        };
        
        // Game objects
        this.hero = {
            x: 50,
            y: 640,
            width: 40,
            height: 60,
            speed: 5,
            isClimbing: false
        };
        
        this.platforms = [
            { x: 0, y: this.canvas.height - 100, width: this.canvas.width, height: 5 },      // Ground level
            { x: 0, y: this.canvas.height - 225, width: this.canvas.width, height: 5 },      // Level 1
            { x: 0, y: this.canvas.height - 350, width: this.canvas.width, height: 5 },      // Level 2
            { x: 0, y: this.canvas.height - 475, width: this.canvas.width, height: 5 },      // Level 3
            { x: 0, y: this.canvas.height - 600, width: this.canvas.width, height: 5 },      // Level 4
            { x: 0, y: this.canvas.height - 725, width: this.canvas.width, height: 5 },      // Top level
        ];
        
        this.ladders = [
            { x: this.canvas.width * 0.2, y: this.canvas.height - 225, width: 40, height: 125 },   // Ground to Level 1
            { x: this.canvas.width * 0.8, y: this.canvas.height - 350, width: 40, height: 125 },   // Level 1 to 2
            { x: this.canvas.width * 0.3, y: this.canvas.height - 475, width: 40, height: 125 },   // Level 2 to 3
            { x: this.canvas.width * 0.7, y: this.canvas.height - 600, width: 40, height: 125 },   // Level 3 to 4
            { x: this.canvas.width * 0.4, y: this.canvas.height - 725, width: 40, height: 125 },   // Level 4 to Top
        ];
        
        // Input handling
        this.keys = {};
        window.addEventListener('keydown', (e) => this.keys[e.key] = true);
        window.addEventListener('keyup', (e) => this.keys[e.key] = false);
        
        // Add running animation properties
        this.runSprites = [];
        this.idleSprites = [];
        this.climbSprites = [];  // New array for climbing sprites
        this.currentFrame = 0;
        this.frameCount = 0;
        this.animationSpeed = 8;
        this.facingLeft = false;

        // Load all running sprites
        for (let i = 1; i <= 8; i++) {
            const sprite = new Image();
            sprite.src = `./assets/Run/Warrior_Run_${i}.png`;
            sprite.onload = () => console.log(`Loaded running sprite ${i}`);
            this.runSprites.push(sprite);
        }

        // Load all idle sprites
        for (let i = 1; i <= 6; i++) {
            const sprite = new Image();
            sprite.src = `./assets/idle/Warrior_Idle_${i}.png`;
            sprite.onload = () => console.log(`Loaded idle sprite ${i}`);
            this.idleSprites.push(sprite);
        }

        // Load all climbing sprites
        for (let i = 1; i <= 8; i++) {
            const sprite = new Image();
            sprite.src = `./assets/Ladder-Grab/Warrior-Ladder-Grab_${i}.png`;
            sprite.onload = () => console.log(`Loaded climbing sprite ${i}`);
            this.climbSprites.push(sprite);
        }
        
        // Initialize torches
        this.torches = [];
        this.platforms.forEach((platform, index) => {
            const nearbyLadder = this.ladders.find(ladder => 
                Math.abs(ladder.y - platform.y) < 20
            );
            
            if (nearbyLadder) {
                const torchY = platform.y + 35;  // Fixed 35px down from platform
                
                this.torches.push({
                    x: nearbyLadder.x - 40,  // Left of ladder
                    y: torchY,
                    baseWidth: 10,
                    baseHeight: 20,
                    flameOffset: 0,
                    flameTime: Math.random() * Math.PI * 2
                });

                this.torches.push({
                    x: nearbyLadder.x + nearbyLadder.width + 40,  // Right of ladder
                    y: torchY,
                    baseWidth: 10,
                    baseHeight: 20,
                    flameOffset: 0,
                    flameTime: Math.random() * Math.PI * 2
                });
            }
        });
        
        // Add attack animation properties
        this.attackSprites = [];
        this.isAttacking = false;
        this.attackFrame = 0;
        this.attackAnimationSpeed = 4;  // Faster speed for attack animation
        
        // Load all attack sprites
        for (let i = 1; i <= 12; i++) {
            const sprite = new Image();
            sprite.src = `./assets/Attack/Warrior_Attack_${i}.png`;
            sprite.onload = () => console.log(`Loaded attack sprite ${i}`);
            this.attackSprites.push(sprite);
        }
        
        // Add enemy properties
        this.enemies = [];
        this.platforms.forEach((platform, index) => {
            if (index > 0) {  // Skip ground level
                const levelHealth = 1 + Math.floor(index * 0.5);  // Reduced health scaling (1-3 hits instead of 2-5)
                this.enemies.push({
                    x: platform.width * (0.3 + Math.random() * 0.4),
                    y: platform.y - 60,
                    width: 40,
                    height: 60,
                    health: levelHealth,
                    maxHealth: levelHealth,
                    platform: index,
                    isHit: false,
                    hitTime: 0,
                    speed: 0.8 + (index * 0.3),  // Slightly faster base speed and scaling
                    direction: 1,
                    id: Math.random()
                });
            }
        });
        
        // Start game loop last
        this.gameLoop();
    }
    
    update() {
        if (this.hero.isClimbing) {
            // Climbing animation
            if (this.keys['ArrowUp'] || this.keys['ArrowDown']) {
                this.frameCount++;
                if (this.frameCount >= this.animationSpeed) {
                    this.frameCount = 0;
                    this.currentFrame = (this.currentFrame + 1) % this.climbSprites.length;
                }
            } else {
                // Reset to first climbing frame when not moving on ladder
                this.currentFrame = 0;
                this.frameCount = 0;
            }
        } else {
            // Reset climbing animation when not on ladder
            if (this.keys['ArrowLeft'] || this.keys['ArrowRight']) {
                // Running animation
                this.frameCount++;
                if (this.frameCount >= this.animationSpeed) {
                    this.frameCount = 0;
                    this.currentFrame = (this.currentFrame + 1) % this.runSprites.length;
                }
            } else {
                // Idle animation
                this.frameCount++;
                if (this.frameCount >= this.animationSpeed) {
                    this.frameCount = 0;
                    this.currentFrame = (this.currentFrame + 1) % this.idleSprites.length;
                }
            }
        }

        // Update facing direction
        if (this.keys['ArrowLeft']) {
            this.facingLeft = true;
        }
        if (this.keys['ArrowRight']) {
            this.facingLeft = false;
        }

        // Horizontal movement
        if (this.keys['ArrowLeft']) {
            this.hero.x -= this.hero.speed;
        }
        if (this.keys['ArrowRight']) {
            this.hero.x += this.hero.speed;
        }
        
        // Ladder interaction
        let onLadder = false;
        let canDropDown = false;
        
        for (let ladder of this.ladders) {
            if (this.checkLadderCollision(this.hero, ladder)) {
                onLadder = true;
                
                // Handle climbing up
                if (this.keys['ArrowUp']) {
                    const characterFeet = this.hero.y + this.hero.height;
                    const wouldExceedTop = characterFeet - this.hero.speed <= ladder.y;
                    if (!wouldExceedTop) {
                        this.hero.y -= this.hero.speed;
                        this.hero.isClimbing = true;
                    } else {
                        this.hero.isClimbing = false;
                        onLadder = false;
                    }
                }
                
                // Simple drop-through when pressing down
                if (this.keys['ArrowDown']) {
                    // Check if we're on a platform
                    const onPlatform = this.platforms.some(platform => 
                        Math.abs((this.hero.y + this.hero.height) - platform.y) <= 5
                    );
                    
                    if (onPlatform) {
                        // Drop through the platform
                        this.hero.y += 10;
                        canDropDown = true;
                        this.hero.isClimbing = false;  // No climbing animation when dropping
                    }
                }
            }
        }
        
        // After the ladder loop
        if (!onLadder || !this.keys['ArrowUp']) {  // Only check ArrowUp since we don't climb down anymore
            this.hero.isClimbing = false;
        }

        // Apply gravity if we're not climbing up or intentionally dropping
        if (!this.hero.isClimbing && !canDropDown) {
            this.hero.y += 5; // Gravity
        }
        
        // Platform collision (skip if we're intentionally dropping down)
        if (!canDropDown) {
            for (let platform of this.platforms) {
                if (this.checkPlatformCollision(this.hero, platform)) {
                    this.hero.y = platform.y - this.hero.height;
                }
            }
        }
        
        // Keep player within canvas bounds
        this.hero.x = Math.max(0, Math.min(this.canvas.width - this.hero.width, this.hero.x));
        this.hero.y = Math.max(0, Math.min(this.canvas.height - this.hero.height, this.hero.y));
        
        // Check win condition - all enemies defeated
        if (this.enemies.length === 0 && !this.victory.active) {
            this.victory.active = true;
            this.victory.startTime = Date.now();
            // Create initial burst of particles
            for (let i = 0; i < 100; i++) {
                this.createParticle();
            }
        }

        // Handle attack animation
        if (this.keys[' '] && !this.isAttacking) {
            this.isAttacking = true;
            this.attackFrame = 0;
            this.frameCount = 0;
        }

        // Update animation frames
        if (this.isAttacking) {
            this.frameCount++;
            if (this.frameCount >= this.attackAnimationSpeed) {  // Use faster speed for attack
                this.frameCount = 0;
                this.attackFrame++;
                
                // Reset attack state when animation completes
                if (this.attackFrame >= 12) {  // Explicitly check for 12 frames
                    this.isAttacking = false;
                    this.attackFrame = 0;
                }
            }
        } else {
            // Normal animation updates for running/idle/climbing
            this.frameCount++;
            if (this.frameCount >= this.animationSpeed) {
                this.frameCount = 0;
                if (this.hero.isClimbing) {
                    this.currentFrame = (this.currentFrame + 1) % this.climbSprites.length;
                } else if (this.keys['ArrowLeft'] || this.keys['ArrowRight']) {
                    this.currentFrame = (this.currentFrame + 1) % this.runSprites.length;
                } else {
                    this.currentFrame = (this.currentFrame + 1) % this.idleSprites.length;
                }
            }
        }

        // Check for enemy hits during attack
        if (this.isAttacking && this.attackFrame === 6) {  // Middle of attack animation
            this.enemies.forEach(enemy => {
                // Check if hero is on the same platform level
                const enemyPlatform = this.platforms[enemy.platform];
                const heroOnSameLevel = Math.abs((this.hero.y + this.hero.height) - enemyPlatform.y) < 10;
                
                // Only allow hits if on same level
                if (heroOnSameLevel) {
                    const distance = Math.abs((this.hero.x + this.hero.width/2) - (enemy.x + enemy.width/2));
                    const facingCorrectly = (this.facingLeft && this.hero.x > enemy.x) || 
                                          (!this.facingLeft && this.hero.x < enemy.x);
                    
                    if (distance < 100 && facingCorrectly && !enemy.isHit) {
                        enemy.health--;
                        enemy.isHit = true;
                        enemy.hitTime = Date.now();
                        
                        if (enemy.health <= 0) {
                            this.enemies = this.enemies.filter(e => e.id !== enemy.id);
                        } else {
                            setTimeout(() => {
                                const existingEnemy = this.enemies.find(e => e.id === enemy.id);
                                if (existingEnemy && existingEnemy.health > 0) {
                                    existingEnemy.isHit = false;
                                }
                            }, 500);
                        }
                    }
                }
            });
        }

        // Update enemy movement
        this.enemies.forEach(enemy => {
            // Check if hero is on the same platform level
            const enemyPlatform = this.platforms[enemy.platform];
            const heroOnSameLevel = Math.abs((this.hero.y + this.hero.height) - enemyPlatform.y) < 10;
            
            if (heroOnSameLevel) {
                // Move towards hero
                const heroCenter = this.hero.x + (this.hero.width / 2);
                const enemyCenter = enemy.x + (enemy.width / 2);
                
                if (heroCenter < enemyCenter) {
                    enemy.x -= enemy.speed;
                    enemy.direction = -1;
                } else {
                    enemy.x += enemy.speed;
                    enemy.direction = 1;
                }
                
                // Keep enemy on platform
                enemy.x = Math.max(0, Math.min(this.canvas.width - enemy.width, enemy.x));
            }
        });
    }
    
    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    draw() {
        // Clear canvas with a slightly dark background
        this.ctx.fillStyle = '#202020';  // Dark grey background
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw platforms (black lines)
        this.ctx.fillStyle = '#000000';
        for (let platform of this.platforms) {
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        }
        
        // Draw ladders with rungs
        this.ctx.fillStyle = '#8B4513';
        for (let ladder of this.ladders) {
            // Draw vertical sides
            this.ctx.fillRect(ladder.x, ladder.y, 5, ladder.height);
            this.ctx.fillRect(ladder.x + ladder.width - 5, ladder.y, 5, ladder.height);
            
            // Draw rungs
            for (let i = 0; i < ladder.height; i += 20) {
                this.ctx.fillRect(ladder.x, ladder.y + i, ladder.width, 5);
            }
        }
        
        // Draw hero with animation
        let currentSprite;
        if (this.isAttacking) {
            currentSprite = this.attackSprites[this.attackFrame];
        } else if (this.hero.isClimbing) {
            currentSprite = this.climbSprites[this.currentFrame];
        } else if (this.keys['ArrowLeft'] || this.keys['ArrowRight']) {
            currentSprite = this.runSprites[this.currentFrame];
        } else {
            currentSprite = this.idleSprites[this.currentFrame];
        }
        
        this.ctx.save();
        if (this.facingLeft) {
            this.ctx.translate(this.hero.x + this.hero.width, this.hero.y - this.hero.height * 0.65);
            this.ctx.scale(-1, 1);
        } else {
            this.ctx.translate(this.hero.x - this.hero.width * 0.375, this.hero.y - this.hero.height * 0.65);
        }

        if (currentSprite && currentSprite.complete) {
            this.ctx.drawImage(currentSprite, 
                0, 0, 
                this.hero.width * 1.75, this.hero.height * 1.75);
        } else {
            // Fallback to dark grey rectangle instead of blue
            this.ctx.fillStyle = '#202020';  // Match the background color
            this.ctx.fillRect(0, 0, this.hero.width, this.hero.height);
        }
        this.ctx.restore();
        
        // Draw victory animation
        if (this.victory.active) {
            // Draw sparkly background
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Draw particles
            for (const particle of this.victory.particles) {
                this.ctx.save();
                this.ctx.translate(particle.x, particle.y);
                this.ctx.rotate(particle.rotation * Math.PI / 180);
                this.ctx.fillStyle = particle.color;
                this.ctx.fillRect(-particle.size/2, -particle.size/2, particle.size, particle.size);
                this.ctx.restore();
            }

            // Draw celebratory text
            this.ctx.font = 'bold 48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillStyle = `hsl(${Date.now() % 360}, 100%, 50%)`; // Rainbow effect
            this.ctx.fillText('VICTORY!', this.canvas.width/2, this.canvas.height/2);
            this.ctx.font = '24px Arial';
            this.ctx.fillText('Congratulations!', this.canvas.width/2, this.canvas.height/2 + 50);
        }

        // Draw torches
        this.torches.forEach(torch => {
            // Update flame animation
            torch.flameTime += 0.1;
            torch.flameOffset = Math.sin(torch.flameTime) * 3;

            // Draw torch base (brown rectangle)
            this.ctx.fillStyle = '#8B4513';
            this.ctx.fillRect(torch.x - torch.baseWidth/2, torch.y, 
                            torch.baseWidth, torch.baseHeight);

            // Draw flame (animated triangle)
            this.ctx.beginPath();
            this.ctx.moveTo(torch.x - torch.baseWidth/2, torch.y);
            this.ctx.lineTo(torch.x + torch.baseWidth/2, torch.y);
            this.ctx.lineTo(torch.x + torch.flameOffset, torch.y - 20);
            this.ctx.closePath();
            
            // Create gradient for flame
            const gradient = this.ctx.createLinearGradient(
                torch.x, torch.y,
                torch.x + torch.flameOffset, torch.y - 20
            );
            gradient.addColorStop(0, '#FF4500');
            gradient.addColorStop(0.6, '#FFA500');
            gradient.addColorStop(1, '#FFD700');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
        });

        // Draw enemies with demonic appearance
        this.enemies.forEach(enemy => {
            // Base demon body
            if (enemy.isHit && Date.now() - enemy.hitTime < 200) {
                this.ctx.fillStyle = '#FF0000';  // Bright red when hit
            } else {
                this.ctx.fillStyle = '#330000';  // Dark blood red for normal state
            }
            
            // Draw main body
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // Draw horns
            this.ctx.fillStyle = '#1a0000';  // Darker red for horns
            this.ctx.beginPath();
            // Left horn
            this.ctx.moveTo(enemy.x + 5, enemy.y);
            this.ctx.lineTo(enemy.x + 15, enemy.y - 15);
            this.ctx.lineTo(enemy.x + 20, enemy.y);
            // Right horn
            this.ctx.moveTo(enemy.x + enemy.width - 5, enemy.y);
            this.ctx.lineTo(enemy.x + enemy.width - 15, enemy.y - 15);
            this.ctx.lineTo(enemy.x + enemy.width - 20, enemy.y);
            this.ctx.fill();

            // Draw glowing eyes
            const eyeGlow = this.ctx.createRadialGradient(
                enemy.x + 12, enemy.y + 15, 0,
                enemy.x + 12, enemy.y + 15, 5
            );
            eyeGlow.addColorStop(0, '#FF0000');
            eyeGlow.addColorStop(1, '#660000');
            
            this.ctx.fillStyle = eyeGlow;
            // Left eye
            this.ctx.beginPath();
            this.ctx.arc(enemy.x + 12, enemy.y + 15, 4, 0, Math.PI * 2);
            this.ctx.fill();
            // Right eye
            this.ctx.beginPath();
            this.ctx.arc(enemy.x + enemy.width - 12, enemy.y + 15, 4, 0, Math.PI * 2);
            this.ctx.fill();

            // Draw health bar background
            this.ctx.fillStyle = '#333333';
            this.ctx.fillRect(enemy.x - 5, enemy.y - 15, enemy.width + 10, 8);
            
            // Draw health bar with demonic glow
            const healthPercentage = enemy.health / enemy.maxHealth;
            const healthGradient = this.ctx.createLinearGradient(
                enemy.x - 5, enemy.y - 15,
                enemy.x - 5 + (enemy.width + 10) * healthPercentage, enemy.y - 7
            );
            healthGradient.addColorStop(0, '#FF0000');
            healthGradient.addColorStop(0.5, '#FF3300');
            healthGradient.addColorStop(1, '#FF6600');
            
            this.ctx.fillStyle = healthGradient;
            this.ctx.fillRect(
                enemy.x - 5, 
                enemy.y - 15, 
                (enemy.width + 10) * healthPercentage, 
                8
            );
        });
    }
    
    gameLoop() {
        this.update();
        if (this.victory.active) {
            this.updateVictoryAnimation();
        }
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    checkLadderCollision(player, ladder) {
        const playerCenter = player.x + player.width / 2;
        const onLadderHorizontally = playerCenter >= ladder.x && 
                                    playerCenter <= ladder.x + ladder.width;
        
        // More precise vertical check
        const onLadderVertically = (player.y + player.height >= ladder.y && 
                                   player.y <= ladder.y + ladder.height) ||
                                  // Only allow mounting from above when very close to the top
                                  (Math.abs((player.y + player.height) - ladder.y) <= 10);
        
        return onLadderHorizontally && onLadderVertically;
    }
    
    checkPlatformCollision(player, platform) {
        const abovePlatform = player.y + player.height >= platform.y &&
                             player.y + player.height <= platform.y + platform.height + 1;
        const onPlatformHorizontally = player.x + player.width > platform.x &&
                                      player.x < platform.x + platform.width;
        
        return abovePlatform && onPlatformHorizontally;
    }
    
    createParticle() {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 5;
        const size = 5 + Math.random() * 10;
        
        this.victory.particles.push({
            x: this.canvas.width / 2,  // Center horizontally
            y: this.canvas.height / 2, // Center vertically
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: size,
            color: this.victory.confettiColors[Math.floor(Math.random() * this.victory.confettiColors.length)],
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10
        });
    }
    
    updateVictoryAnimation() {
        if (!this.victory.active) return;

        // Add new particles
        if (Date.now() - this.victory.startTime < 3000 && Math.random() < 0.3) {
            this.createParticle();
        }

        // Update existing particles
        for (let i = this.victory.particles.length - 1; i >= 0; i--) {
            const particle = this.victory.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.1; // Gravity
            particle.rotation += particle.rotationSpeed;

            // Remove particles that are off screen
            if (particle.y > this.canvas.height) {
                this.victory.particles.splice(i, 1);
            }
        }
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Update platforms (keeping the same platform setup)
        this.platforms = [
            { x: 0, y: this.canvas.height - 100, width: this.canvas.width, height: 5 },  // Ground
            { x: 0, y: this.canvas.height - 225, width: this.canvas.width, height: 5 },  // Level 1
            { x: 0, y: this.canvas.height - 350, width: this.canvas.width, height: 5 },  // Level 2
            { x: 0, y: this.canvas.height - 475, width: this.canvas.width, height: 5 },  // Level 3
            { x: 0, y: this.canvas.height - 600, width: this.canvas.width, height: 5 },  // Level 4
            { x: 0, y: this.canvas.height - 725, width: this.canvas.width, height: 5 },  // Top level
        ];
        
        // Better spread ladder positions
        this.ladders = [
            { x: this.canvas.width * 0.2, y: this.canvas.height - 225, width: 40, height: 125 },   // Ground to Level 1
            { x: this.canvas.width * 0.8, y: this.canvas.height - 350, width: 40, height: 125 },   // Level 1 to 2
            { x: this.canvas.width * 0.3, y: this.canvas.height - 475, width: 40, height: 125 },   // Level 2 to 3
            { x: this.canvas.width * 0.7, y: this.canvas.height - 600, width: 40, height: 125 },   // Level 3 to 4
            { x: this.canvas.width * 0.4, y: this.canvas.height - 725, width: 40, height: 125 },   // Level 4 to Top
        ];
        
        // Update hero position
        if (this.hero) {
            this.hero.y = this.canvas.height - 160;
            this.hero.x = this.canvas.width * 0.05; // Start further left
        }
        
        // Update torch positions
        this.torches = [];
        this.platforms.forEach((platform, index) => {
            const nearbyLadder = this.ladders.find(ladder => 
                Math.abs(ladder.y - platform.y) < 20
            );
            
            if (nearbyLadder) {
                const torchY = platform.y + 35;  // Fixed 35px down from platform
                
                this.torches.push({
                    x: nearbyLadder.x - 40,  // Left of ladder
                    y: torchY,
                    baseWidth: 10,
                    baseHeight: 20,
                    flameOffset: 0,
                    flameTime: Math.random() * Math.PI * 2
                });

                this.torches.push({
                    x: nearbyLadder.x + nearbyLadder.width + 40,  // Right of ladder
                    y: torchY,
                    baseWidth: 10,
                    baseHeight: 20,
                    flameOffset: 0,
                    flameTime: Math.random() * Math.PI * 2
                });
            }
        });

        // Update enemy positions
        this.enemies = [];
        this.platforms.forEach((platform, index) => {
            if (index > 0) {  // Skip ground level
                const levelHealth = 1 + Math.floor(index * 0.5);  // Reduced health scaling (1-3 hits instead of 2-5)
                this.enemies.push({
                    x: platform.width * (0.3 + Math.random() * 0.4),
                    y: platform.y - 60,
                    width: 40,
                    height: 60,
                    health: levelHealth,
                    maxHealth: levelHealth,
                    platform: index,
                    isHit: false,
                    hitTime: 0,
                    speed: 0.8 + (index * 0.3),  // Slightly faster base speed and scaling
                    direction: 1,
                    id: Math.random()
                });
            }
        });
    }
}

// Start the game when the page loads
window.onload = () => {
    new Game();
}; 