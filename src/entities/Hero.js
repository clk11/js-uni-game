class Hero {
    constructor(canvas) {
        this.x = 50;
        this.y = canvas.height - 160;
        this.width = 40;
        this.height = 60;
        this.speed = 5;
        this.isClimbing = false;
        this.health = 100;
        this.maxHealth = 100;
        this.isHit = false;
        this.hitTime = 0;
        this.invulnerableTime = 1000;
        this.knockback = {
            active: false,
            direction: 1,
            speed: 15,
            duration: 200,
            startTime: 0
        };
        this.facingLeft = false;
        this.isAttacking = false;
        this.attackFrame = 0;
    }

    move(keys, canvas) {
        if (keys['ArrowLeft']) {
            this.x -= this.speed;
            this.facingLeft = true;
        }
        if (keys['ArrowRight']) {
            this.x += this.speed;
            this.facingLeft = false;
        }

        // Keep hero within canvas bounds
        this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
        this.y = Math.max(0, Math.min(canvas.height - this.height, this.y));
    }

    updateKnockback() {
        if (this.knockback.active) {
            const knockbackTime = Date.now() - this.knockback.startTime;
            if (knockbackTime < this.knockback.duration) {
                this.x += this.knockback.speed * this.knockback.direction;
            } else {
                this.knockback.active = false;
            }
        }
    }

    takeDamage(amount, enemyX) {
        if (!this.isHit) {
            this.health -= amount;
            this.isHit = true;
            this.hitTime = Date.now();
            
            this.knockback.active = true;
            this.knockback.startTime = Date.now();
            this.knockback.direction = this.x < enemyX ? -1 : 1;
            
            setTimeout(() => {
                this.isHit = false;
            }, this.invulnerableTime);
            
            return this.health <= 0;
        }
        return false;
    }
}

export default Hero; 