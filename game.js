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
            isClimbing: false,
            color: '#0000FF'
        };
        
        this.princess = {
            x: 700,
            y: 15,
            width: 40,
            height: 60,
            color: '#FF0000'
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
        
        // Start game loop last
        this.gameLoop();
    }
    
    update() {
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
                
                const standingOnPlatform = this.platforms.some(platform => 
                    Math.abs((this.hero.y + this.hero.height) - platform.y) <= 5 &&
                    this.hero.x + this.hero.width > platform.x &&
                    this.hero.x < platform.x + platform.width
                );
                
                // Check if ladder extends below current position
                const ladderExtendsDown = this.hero.y + this.hero.height < ladder.y + ladder.height;
                
                if (this.keys['ArrowUp']) {
                    // Stop when character's feet reach the top of the ladder
                    const characterFeet = this.hero.y + this.hero.height;
                    const wouldExceedTop = characterFeet - this.hero.speed <= ladder.y;
                    if (!wouldExceedTop) {
                        this.hero.y -= this.hero.speed;
                        this.hero.isClimbing = true;
                    }
                }
                
                if (this.keys['ArrowDown']) {
                    if (standingOnPlatform) {
                        // Only allow dropping down if the ladder extends below
                        if (ladderExtendsDown) {
                            this.hero.y += 10;
                            canDropDown = true;
                        }
                    } else {
                        // Stop at the bottom of the ladder
                        const wouldExceedBottom = this.hero.y + this.hero.height + this.hero.speed > ladder.y + ladder.height;
                        if (!wouldExceedBottom) {
                            this.hero.y += this.hero.speed;
                            this.hero.isClimbing = true;
                        }
                    }
                }
                break;
            }
        }
        
        // Only apply gravity if we're not on a ladder and not dropping down
        if (!onLadder && !canDropDown) {
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
        
        // Check win condition
        if (this.checkCollision(this.hero, this.princess) && !this.victory.active) {
            this.victory.active = true;
            this.victory.startTime = Date.now();
            // Create initial burst of particles
            for (let i = 0; i < 100; i++) {
                this.createParticle();
            }
        }
    }
    
    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
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
        
        // Draw hero (blue rectangle)
        this.ctx.fillStyle = this.hero.color;
        this.ctx.fillRect(this.hero.x, this.hero.y, this.hero.width, this.hero.height);
        
        // Draw goal (red rectangle)
        this.ctx.fillStyle = this.princess.color;
        this.ctx.fillRect(this.princess.x, this.princess.y, this.princess.width, this.princess.height);
        
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
            this.ctx.fillText('You saved the princess!', this.canvas.width/2, this.canvas.height/2 + 50);
        }
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
                             player.y + player.height <= platform.y + platform.height + 5;
        const onPlatformHorizontally = player.x + player.width > platform.x &&
                                      player.x < platform.x + platform.width;
        
        return abovePlatform && onPlatformHorizontally;
    }
    
    createParticle() {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 5;
        const size = 5 + Math.random() * 10;
        
        this.victory.particles.push({
            x: this.princess.x + this.princess.width / 2,
            y: this.princess.y + this.princess.height / 2,
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
        
        // Update princess position
        if (this.princess) {
            this.princess.x = this.canvas.width * 0.95; // Position further right
            this.princess.y = this.canvas.height - 785;
        }
    }
}

// Start the game when the page loads
window.onload = () => {
    new Game();
}; 