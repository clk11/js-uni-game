class GameState {
    constructor(canvas) {
        this.canvas = canvas;
        this.initializeState();
    }

    initializeState() {
        this.victory = {
            active: false,
            particles: [],
            startTime: 0,
            confettiColors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF']
        };

        this.gameOver = {
            active: false,
            startTime: 0,
            bloodParticles: [],
            restartCountdown: 3
        };

        this.platforms = this.createPlatforms();
        this.ladders = this.createLadders();
        this.torches = this.createTorches();
    }

    createPlatforms() {
        return [
            { x: 0, y: this.canvas.height - 100, width: this.canvas.width, height: 5 },
            { x: 0, y: this.canvas.height - 225, width: this.canvas.width, height: 5 },
            { x: 0, y: this.canvas.height - 350, width: this.canvas.width, height: 5 },
            { x: 0, y: this.canvas.height - 475, width: this.canvas.width, height: 5 },
            { x: 0, y: this.canvas.height - 600, width: this.canvas.width, height: 5 },
            { x: 0, y: this.canvas.height - 725, width: this.canvas.width, height: 5 },
        ];
    }

    createLadders() {
        return [
            { x: this.canvas.width * 0.2, y: this.canvas.height - 225, width: 40, height: 125 },
            { x: this.canvas.width * 0.8, y: this.canvas.height - 350, width: 40, height: 125 },
            { x: this.canvas.width * 0.3, y: this.canvas.height - 475, width: 40, height: 125 },
            { x: this.canvas.width * 0.7, y: this.canvas.height - 600, width: 40, height: 125 },
            { x: this.canvas.width * 0.4, y: this.canvas.height - 725, width: 40, height: 125 },
        ];
    }

    createTorches() {
        const torches = [];
        this.platforms.forEach((platform, index) => {
            const nearbyLadder = this.ladders.find(ladder => 
                Math.abs(ladder.y - platform.y) < 20
            );
            
            if (nearbyLadder) {
                const torchY = platform.y + 35;
                
                torches.push({
                    x: nearbyLadder.x - 40,
                    y: torchY,
                    baseWidth: 10,
                    baseHeight: 20,
                    flameOffset: 0,
                    flameTime: Math.random() * Math.PI * 2
                });

                torches.push({
                    x: nearbyLadder.x + nearbyLadder.width + 40,
                    y: torchY,
                    baseWidth: 10,
                    baseHeight: 20,
                    flameOffset: 0,
                    flameTime: Math.random() * Math.PI * 2
                });
            }
        });
        return torches;
    }

    updateTorches() {
        this.torches.forEach(torch => {
            torch.flameTime += 0.1;
            torch.flameOffset = Math.sin(torch.flameTime) * 3;
        });
    }

    createVictoryParticle() {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 5;
        const size = 5 + Math.random() * 10;
        
        this.victory.particles.push({
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: size,
            color: this.victory.confettiColors[Math.floor(Math.random() * this.victory.confettiColors.length)],
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10
        });
    }

    updateVictoryParticles() {
        if (!this.victory.active) return;

        if (Date.now() - this.victory.startTime < 3000 && Math.random() < 0.3) {
            this.createVictoryParticle();
        }

        for (let i = this.victory.particles.length - 1; i >= 0; i--) {
            const particle = this.victory.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.1;
            particle.rotation += particle.rotationSpeed;

            if (particle.y > this.canvas.height) {
                this.victory.particles.splice(i, 1);
            }
        }
    }

    createBloodParticles(hero) {
        for (let i = 0; i < 100; i++) {
            this.gameOver.bloodParticles.push({
                x: hero.x + hero.width / 2,
                y: hero.y + hero.height / 2,
                vx: (Math.random() - 0.5) * 15,
                vy: (Math.random() - 0.5) * 15,
                size: 3 + Math.random() * 5,
                alpha: 1
            });
        }
    }

    updateGameOver() {
        if (!this.gameOver.active) return;

        // Update blood particles
        this.gameOver.bloodParticles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.2; // Gravity
            particle.alpha = Math.max(0, particle.alpha - 0.01);
        });

        // Update countdown
        const elapsedTime = Date.now() - this.gameOver.startTime;
        this.gameOver.restartCountdown = Math.max(0, 3 - Math.floor(elapsedTime / 1000));
    }

    startGameOver(hero) {
        this.gameOver.active = true;
        this.gameOver.startTime = Date.now();
        this.gameOver.restartCountdown = 3;
        this.createBloodParticles(hero);
    }

    startVictory() {
        if (!this.victory.active) {
            this.victory.active = true;
            this.victory.startTime = Date.now();
            for (let i = 0; i < 100; i++) {
                this.createVictoryParticle();
            }
        }
    }
}

export default GameState; 