class Enemy {
    constructor(platform, index, canvasWidth) {
        const levelHealth = 1 + Math.floor(index * 0.5);
        this.x = canvasWidth * (0.3 + Math.random() * 0.4);
        this.y = platform.y - 60;
        this.width = 40;
        this.height = 60;
        this.health = levelHealth;
        this.maxHealth = levelHealth;
        this.platform = index;
        this.isHit = false;
        this.hitTime = 0;
        this.speed = 0.8 + (index * 0.3);
        this.direction = 1;
        this.id = Math.random();
    }

    update(hero, canvas) {
        const heroOnSameLevel = Math.abs((hero.y + hero.height) - (this.y + this.height)) < 10;
        
        if (heroOnSameLevel) {
            const heroCenter = hero.x + (hero.width / 2);
            const enemyCenter = this.x + (this.width / 2);
            
            if (heroCenter < enemyCenter) {
                this.x -= this.speed;
                this.direction = -1;
            } else {
                this.x += this.speed;
                this.direction = 1;
            }
            
            this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
        }
    }

    takeDamage() {
        if (!this.isHit) {
            this.health--;
            this.isHit = true;
            this.hitTime = Date.now();
            
            setTimeout(() => {
                if (this.health > 0) {
                    this.isHit = false;
                }
            }, 500);
            
            return this.health <= 0;
        }
        return false;
    }

    checkCollisionWithHero(hero) {
        const heroOnSameLevel = Math.abs((hero.y + hero.height) - (this.y + this.height)) < 10;
        if (heroOnSameLevel) {
            const distance = Math.abs((hero.x + hero.width/2) - (this.x + this.width/2));
            return distance < 50;
        }
        return false;
    }
}

export default Enemy; 