class GameRenderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.loadSprites();
    }

    loadSprites() {
        this.runSprites = [];
        this.idleSprites = [];
        this.climbSprites = [];
        this.attackSprites = [];

        for (let i = 1; i <= 8; i++) {
            const sprite = new Image();
            sprite.src = `/assets/Run/Warrior_Run_${i}.png`;
            sprite.onload = () => console.log(`Loaded running sprite ${i}`);
            this.runSprites.push(sprite);
        }

        for (let i = 1; i <= 6; i++) {
            const sprite = new Image();
            sprite.src = `/assets/idle/Warrior_Idle_${i}.png`;
            sprite.onload = () => console.log(`Loaded idle sprite ${i}`);
            this.idleSprites.push(sprite);
        }

        for (let i = 1; i <= 8; i++) {
            const sprite = new Image();
            sprite.src = `/assets/Ladder-Grab/Warrior-Ladder-Grab_${i}.png`;
            sprite.onload = () => console.log(`Loaded climbing sprite ${i}`);
            this.climbSprites.push(sprite);
        }

        for (let i = 1; i <= 12; i++) {
            const sprite = new Image();
            sprite.src = `/assets/Attack/Warrior_Attack_${i}.png`;
            sprite.onload = () => console.log(`Loaded attack sprite ${i}`);
            this.attackSprites.push(sprite);
        }
    }

    drawBackground() {
        this.ctx.fillStyle = '#202020';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawPlatforms(platforms) {
        this.ctx.fillStyle = '#000000';
        for (let platform of platforms) {
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        }
    }

    drawLadders(ladders) {
        this.ctx.fillStyle = '#8B4513';
        for (let ladder of ladders) {
            this.ctx.fillRect(ladder.x, ladder.y, 5, ladder.height);
            this.ctx.fillRect(ladder.x + ladder.width - 5, ladder.y, 5, ladder.height);
            
            for (let i = 0; i < ladder.height; i += 20) {
                this.ctx.fillRect(ladder.x, ladder.y + i, ladder.width, 5);
            }
        }
    }

    drawHero(hero, keys, currentFrame) {
        if (hero.isHit && Date.now() - hero.hitTime < 200) {
            this.ctx.globalAlpha = 0.5;
        }

        let currentSprite;
        if (hero.isAttacking) {
            currentSprite = this.attackSprites[hero.attackFrame];
        } else if (hero.isClimbing) {
            currentSprite = this.climbSprites[currentFrame];
        } else if (keys['ArrowLeft'] || keys['ArrowRight']) {
            currentSprite = this.runSprites[currentFrame];
        } else {
            currentSprite = this.idleSprites[currentFrame];
        }

        this.ctx.save();
        if (hero.facingLeft) {
            this.ctx.translate(hero.x + hero.width, hero.y - hero.height * 0.65);
            this.ctx.scale(-1, 1);
        } else {
            this.ctx.translate(hero.x - hero.width * 0.375, hero.y - hero.height * 0.65);
        }

        if (currentSprite && currentSprite.complete) {
            this.ctx.drawImage(currentSprite, 
                0, 0, 
                hero.width * 1.75, hero.height * 1.75);
        }
        this.ctx.restore();
        this.ctx.globalAlpha = 1.0;
    }

    drawEnemies(enemies) {
        enemies.forEach(enemy => {
            if (enemy.isHit && Date.now() - enemy.hitTime < 200) {
                this.ctx.fillStyle = '#FF0000';
            } else {
                this.ctx.fillStyle = '#330000';
            }
            
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // Draw horns
            this.ctx.fillStyle = '#1a0000';
            this.ctx.beginPath();
            this.ctx.moveTo(enemy.x + 5, enemy.y);
            this.ctx.lineTo(enemy.x + 15, enemy.y - 15);
            this.ctx.lineTo(enemy.x + 20, enemy.y);
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
            this.ctx.beginPath();
            this.ctx.arc(enemy.x + 12, enemy.y + 15, 4, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.arc(enemy.x + enemy.width - 12, enemy.y + 15, 4, 0, Math.PI * 2);
            this.ctx.fill();

            // Draw health bar
            this.drawEnemyHealthBar(enemy);
        });
    }

    drawEnemyHealthBar(enemy) {
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(enemy.x - 5, enemy.y - 15, enemy.width + 10, 8);
        
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
    }

    drawHealthBar(hero) {
        const barWidth = 200;
        const barHeight = 20;
        const barX = 20;
        const barY = 20;
        
        // Draw background
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Draw health
        const healthPercentage = hero.health / hero.maxHealth;
        const healthGradient = this.ctx.createLinearGradient(barX, barY, barX + barWidth * healthPercentage, barY + barHeight);
        healthGradient.addColorStop(0, '#00FF00');
        healthGradient.addColorStop(1, '#008800');
        
        this.ctx.fillStyle = healthGradient;
        this.ctx.fillRect(barX, barY, barWidth * healthPercentage, barHeight);
        
        // Draw border
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // Draw health text
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${Math.ceil(hero.health)}/${hero.maxHealth}`, barX + barWidth/2, barY + 15);
    }

    drawTorches(torches) {
        torches.forEach(torch => {
            // Draw base
            this.ctx.fillStyle = '#8B4513';
            this.ctx.fillRect(torch.x - torch.baseWidth/2, torch.y, 
                            torch.baseWidth, torch.baseHeight);

            // Draw flame
            this.ctx.beginPath();
            this.ctx.moveTo(torch.x - torch.baseWidth/2, torch.y);
            this.ctx.lineTo(torch.x + torch.baseWidth/2, torch.y);
            this.ctx.lineTo(torch.x + torch.flameOffset, torch.y - 20);
            this.ctx.closePath();
            
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
    }

    drawVictoryScreen(victory) {
        if (!victory.active) return;

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw particles
        for (const particle of victory.particles) {
            this.ctx.save();
            this.ctx.translate(particle.x, particle.y);
            this.ctx.rotate(particle.rotation * Math.PI / 180);
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(-particle.size/2, -particle.size/2, particle.size, particle.size);
            this.ctx.restore();
        }

        // Draw victory text
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = `hsl(${Date.now() % 360}, 100%, 50%)`;
        this.ctx.fillText('VICTORY!', this.canvas.width/2, this.canvas.height/2);
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Congratulations!', this.canvas.width/2, this.canvas.height/2 + 50);
    }

    drawGameOverScreen(gameOver) {
        if (!gameOver.active) return;

        // Dark overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw blood particles
        gameOver.bloodParticles.forEach(particle => {
            this.ctx.fillStyle = `rgba(180, 0, 0, ${particle.alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Game Over text
        this.ctx.font = 'bold 72px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillText('GAME OVER', this.canvas.width/2, this.canvas.height/2);

        // Countdown text
        this.ctx.font = 'bold 36px Arial';
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillText(`Restarting in ${gameOver.restartCountdown}...`, 
            this.canvas.width/2, this.canvas.height/2 + 60);
    }
}

export default GameRenderer; 