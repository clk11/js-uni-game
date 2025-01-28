class Animation {
    constructor() {
        this.currentFrame = 0;
        this.frameCount = 0;
        this.animationSpeed = 8;
        this.attackAnimationSpeed = 4;
        this.attackFrame = 0;
    }

    updateHeroAnimation(hero, keys) {
        if (hero.isClimbing) {
            if (keys['ArrowUp'] || keys['ArrowDown']) {
                this.frameCount++;
                if (this.frameCount >= this.animationSpeed) {
                    this.frameCount = 0;
                    this.currentFrame = (this.currentFrame + 1) % 8; // climbSprites length
                }
            } else {
                this.currentFrame = 0;
                this.frameCount = 0;
            }
        } else {
            if (keys['ArrowLeft'] || keys['ArrowRight']) {
                this.frameCount++;
                if (this.frameCount >= this.animationSpeed) {
                    this.frameCount = 0;
                    this.currentFrame = (this.currentFrame + 1) % 8; // runSprites length
                }
            } else {
                this.frameCount++;
                if (this.frameCount >= this.animationSpeed) {
                    this.frameCount = 0;
                    this.currentFrame = (this.currentFrame + 1) % 6; // idleSprites length
                }
            }
        }
    }

    updateAttackAnimation(hero) {
        if (hero.isAttacking) {
            this.frameCount++;
            if (this.frameCount >= this.attackAnimationSpeed) {
                this.frameCount = 0;
                this.attackFrame++;
                hero.attackFrame = this.attackFrame;  // Update hero's attack frame
                
                if (this.attackFrame >= 12) { // attackSprites length
                    hero.isAttacking = false;
                    this.attackFrame = 0;
                    hero.attackFrame = 0;  // Reset hero's attack frame
                }
            }
        }
    }

    getCurrentFrame() {
        return this.currentFrame;
    }

    getAttackFrame() {
        return this.attackFrame;
    }

    startAttack(hero) {
        if (!hero.isAttacking) {
            hero.isAttacking = true;
            this.attackFrame = 0;
            hero.attackFrame = 0;  // Reset hero's attack frame
            this.frameCount = 0;
        }
    }
}

export default Animation; 