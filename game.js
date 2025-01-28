import Hero from '/src/entities/Hero.js';
import Enemy from '/src/entities/Enemy.js';
import GameRenderer from '/src/modules/GameRenderer.js';
import Physics from '/src/modules/Physics.js';
import Animation from '/src/modules/Animation.js';
import GameState from '/src/modules/GameState.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        this.gameState = new GameState(this.canvas);
        this.renderer = new GameRenderer(this.canvas, this.ctx);
        this.animation = new Animation();
        
        this.hero = new Hero(this.canvas);
        this.enemies = this.initializeEnemies();
        
        this.keys = {};
        window.addEventListener('keydown', (e) => this.keys[e.key] = true);
        window.addEventListener('keyup', (e) => this.keys[e.key] = false);
        
        this.gameLoop();
    }
    
    initializeEnemies() {
        const enemies = [];
        this.gameState.platforms.forEach((platform, index) => {
            if (index > 0) {
                enemies.push(new Enemy(platform, index, this.canvas.width));
            }
        });
        return enemies;
    }
    
    update() {
        if (!this.gameState.gameOver.active) {
            this.hero.move(this.keys, this.canvas);
            this.hero.updateKnockback();

            const { onLadder, canDropDown } = Physics.handleLadderMovement(
                this.hero, 
                this.gameState.ladders, 
                this.keys
            );

            Physics.applyGravity(this.hero, this.gameState.platforms, canDropDown);

            // Update animations
            this.animation.updateHeroAnimation(this.hero, this.keys);
            this.animation.updateAttackAnimation(this.hero);

            // Handle attack
            if (this.keys[' ']) {
                this.animation.startAttack(this.hero);
            }

            // Check attack hits
            if (this.hero.isAttacking && this.animation.getAttackFrame() === 6) {
                this.enemies.forEach(enemy => {
                    if (Physics.checkAttackCollision(this.hero, enemy)) {
                        if (enemy.takeDamage()) {
                            this.enemies = this.enemies.filter(e => e.id !== enemy.id);
                        }
                    }
                });
            }

            // Update enemies
            this.enemies.forEach(enemy => {
                enemy.update(this.hero, this.canvas);
                if (enemy.checkCollisionWithHero(this.hero)) {
                    if (this.hero.takeDamage(20, enemy.x)) {
                        this.gameState.startGameOver(this.hero);
                        setTimeout(() => this.resetGame(), 3000);
                    }
                }
            });

            // Check victory condition
            if (this.enemies.length === 0) {
                this.gameState.startVictory();
            }
        }

        // Update effects
        this.gameState.updateTorches();
        this.gameState.updateVictoryParticles();
        this.gameState.updateGameOver();
    }
    
    draw() {
        this.renderer.drawBackground();
        this.renderer.drawPlatforms(this.gameState.platforms);
        this.renderer.drawLadders(this.gameState.ladders);
        this.renderer.drawTorches(this.gameState.torches);
        
        if (!this.gameState.gameOver.active) {
            this.renderer.drawHero(
                this.hero, 
                this.keys, 
                this.animation.getCurrentFrame()
            );
        }
        
        this.renderer.drawEnemies(this.enemies);
        this.renderer.drawHealthBar(this.hero);
        this.renderer.drawVictoryScreen(this.gameState.victory);
        this.renderer.drawGameOverScreen(this.gameState.gameOver);
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        if (this.gameState) {
            this.gameState = new GameState(this.canvas);
            this.enemies = this.initializeEnemies();
            
            if (this.hero) {
                this.hero.y = this.canvas.height - 160;
                this.hero.x = Math.min(50, this.canvas.width * 0.05);
            }
        }
    }

    resetGame() {
        this.gameState.gameOver.active = false;
        this.hero = new Hero(this.canvas);
        this.enemies = this.initializeEnemies();
    }
}

window.onload = () => {
    new Game();
}; 