class Physics {
    static checkLadderCollision(player, ladder) {
        const playerCenter = player.x + player.width / 2;
        const onLadderHorizontally = playerCenter >= ladder.x && 
                                    playerCenter <= ladder.x + ladder.width;
        
        const onLadderVertically = (player.y + player.height >= ladder.y && 
                                   player.y <= ladder.y + ladder.height) ||
                                  (Math.abs((player.y + player.height) - ladder.y) <= 10);
        
        return onLadderHorizontally && onLadderVertically;
    }
    
    static checkPlatformCollision(player, platform) {
        const abovePlatform = player.y + player.height >= platform.y &&
                             player.y + player.height <= platform.y + platform.height + 1;
        const onPlatformHorizontally = player.x + player.width > platform.x &&
                                      player.x < platform.x + platform.width;
        
        return abovePlatform && onPlatformHorizontally;
    }

    static handleLadderMovement(hero, ladders, keys) {
        let onLadder = false;
        let canDropDown = false;
        
        for (let ladder of ladders) {
            if (this.checkLadderCollision(hero, ladder)) {
                onLadder = true;
                
                if (keys['ArrowUp']) {
                    const characterFeet = hero.y + hero.height;
                    const wouldExceedTop = characterFeet - hero.speed <= ladder.y;
                    if (!wouldExceedTop) {
                        hero.y -= hero.speed;
                        hero.isClimbing = true;
                    } else {
                        hero.isClimbing = false;
                        onLadder = false;
                    }
                }
                
                if (keys['ArrowDown']) {
                    const onPlatform = this.checkPlatformCollision(hero, ladder);
                    if (onPlatform) {
                        hero.y += 10;
                        canDropDown = true;
                        hero.isClimbing = false;
                    }
                }
            }
        }

        if (!onLadder || !keys['ArrowUp']) {
            hero.isClimbing = false;
        }

        return { onLadder, canDropDown };
    }

    static applyGravity(hero, platforms, canDropDown) {
        if (!hero.isClimbing && !canDropDown) {
            hero.y += 5;
        }

        if (!canDropDown) {
            for (let platform of platforms) {
                if (this.checkPlatformCollision(hero, platform)) {
                    hero.y = platform.y - hero.height;
                }
            }
        }
    }

    static checkAttackCollision(hero, enemy) {
        const heroOnSameLevel = Math.abs((hero.y + hero.height) - (enemy.y + enemy.height)) < 10;
        
        if (heroOnSameLevel) {
            const distance = Math.abs((hero.x + hero.width/2) - (enemy.x + enemy.width/2));
            const facingCorrectly = (hero.facingLeft && hero.x > enemy.x) || 
                                  (!hero.facingLeft && hero.x < enemy.x);
            
            return distance < 100 && facingCorrectly;
        }
        return false;
    }
}

export default Physics; 