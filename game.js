const CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 450,
    GROUND_Y: 380,
    GRAVITY: 0.6,
    FRICTION: 0.85,
    PIXEL_SIZE: 2
};

const MECH_CONFIG = {
    WIDTH: 48,
    HEIGHT: 64,
    SPEED: 4,
    JUMP_FORCE: -14,
    MAX_HEALTH: 100,
    ATTACK_DAMAGE: 10,
    ATTACK_RANGE: 55,
    ATTACK_COOLDOWN: 400,
    DEFENSE_REDUCTION: 0.5
};

class InputManager {
    constructor() {
        this.keys = {};
        this.keyMap = {
            P1_LEFT: 'KeyA',
            P1_RIGHT: 'KeyD',
            P1_JUMP: 'KeyW',
            P1_ATTACK: 'KeyF',
            P1_DEFEND: 'KeyG',
            P2_LEFT: 'ArrowLeft',
            P2_RIGHT: 'ArrowRight',
            P2_JUMP: 'ArrowUp',
            P2_ATTACK: 'KeyL',
            P2_DEFEND: 'KeyK'
        };
        
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
    }
    
    onKeyDown(e) {
        this.keys[e.code] = true;
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
            e.preventDefault();
        }
    }
    
    onKeyUp(e) {
        this.keys[e.code] = false;
    }
    
    isPressed(keyCode) {
        return this.keys[keyCode] === true;
    }
    
    isP1Left() { return this.isPressed(this.keyMap.P1_LEFT); }
    isP1Right() { return this.isPressed(this.keyMap.P1_RIGHT); }
    isP1Jump() { return this.isPressed(this.keyMap.P1_JUMP); }
    isP1Attack() { return this.isPressed(this.keyMap.P1_ATTACK); }
    isP1Defend() { return this.isPressed(this.keyMap.P1_DEFEND); }
    isP2Left() { return this.isPressed(this.keyMap.P2_LEFT); }
    isP2Right() { return this.isPressed(this.keyMap.P2_RIGHT); }
    isP2Jump() { return this.isPressed(this.keyMap.P2_JUMP); }
    isP2Attack() { return this.isPressed(this.keyMap.P2_ATTACK); }
    isP2Defend() { return this.isPressed(this.keyMap.P2_DEFEND); }
}

class Particle {
    constructor(x, y, vx, vy, color, size, life) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.life = life;
        this.maxLife = life;
    }
    
    update(dt) {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.2;
        this.life -= dt;
    }
    
    render(ctx) {
        const alpha = Math.max(0, this.life / this.maxLife);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = alpha;
        ctx.fillRect(
            Math.floor(this.x - this.size / 2),
            Math.floor(this.y - this.size / 2),
            this.size,
            this.size
        );
        ctx.globalAlpha = 1;
    }
    
    isDead() {
        return this.life <= 0;
    }
}

class Effect {
    constructor(type, x, y, duration) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.duration = duration;
        this.timer = 0;
        this.particles = [];
    }
    
    update(dt) {
        this.timer += dt;
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(dt);
            if (this.particles[i].isDead()) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    render(ctx) {
        this.particles.forEach(p => p.render(ctx));
    }
    
    isDead() {
        return this.timer >= this.duration && this.particles.length === 0;
    }
}

class HitEffect extends Effect {
    constructor(x, y) {
        super('hit', x, y, 200);
        const colors = ['#ffcc00', '#ff6600', '#ff3366', '#ffffff'];
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 / 12) * i + Math.random() * 0.5;
            const speed = 3 + Math.random() * 4;
            this.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                colors[Math.floor(Math.random() * colors.length)],
                4 + Math.floor(Math.random() * 4),
                300 + Math.random() * 200
            ));
        }
    }
    
    render(ctx) {
        super.render(ctx);
        
        if (this.timer < 100) {
            const alpha = 1 - this.timer / 100;
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fillRect(this.x - 20, this.y - 20, 40, 40);
        }
    }
}

class AttackEffect extends Effect {
    constructor(x, y, facingRight, color) {
        super('attack', x, y, 150);
        const dir = facingRight ? 1 : -1;
        for (let i = 0; i < 6; i++) {
            this.particles.push(new Particle(
                x + dir * i * 5,
                y + (Math.random() - 0.5) * 10,
                dir * (2 + Math.random() * 3),
                (Math.random() - 0.5) * 2,
                color,
                3 + Math.floor(Math.random() * 3),
                150 + Math.random() * 100
            ));
        }
    }
}

class BlockEffect extends Effect {
    constructor(x, y) {
        super('block', x, y, 100);
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            this.particles.push(new Particle(
                x + Math.cos(angle) * 20,
                y + Math.sin(angle) * 20,
                Math.cos(angle) * 2,
                Math.sin(angle) * 2,
                '#33ffcc',
                4,
                200
            ));
        }
    }
}

class Mech {
    constructor(x, y, color, isPlayer1) {
        this.x = x;
        this.y = y;
        this.width = MECH_CONFIG.WIDTH;
        this.height = MECH_CONFIG.HEIGHT;
        this.velocityX = 0;
        this.velocityY = 0;
        this.health = MECH_CONFIG.MAX_HEALTH;
        this.maxHealth = MECH_CONFIG.MAX_HEALTH;
        this.isAttacking = false;
        this.isDefending = false;
        this.isJumping = false;
        this.facingRight = isPlayer1;
        this.color = color;
        this.isPlayer1 = isPlayer1;
        this.attackCooldown = 0;
        this.animFrame = 0;
        this.animTimer = 0;
        this.hitFlash = 0;
        this.attackFrame = 0;
        this.isVictory = false;
    }
    
    move(direction) {
        this.velocityX = direction * MECH_CONFIG.SPEED;
        if (direction !== 0) {
            this.facingRight = direction > 0;
        }
    }
    
    jump() {
        if (!this.isJumping) {
            this.velocityY = MECH_CONFIG.JUMP_FORCE;
            this.isJumping = true;
        }
    }
    
    attack() {
        if (this.attackCooldown <= 0 && !this.isAttacking) {
            this.isAttacking = true;
            this.attackFrame = 0;
            this.attackCooldown = MECH_CONFIG.ATTACK_COOLDOWN;
        }
    }
    
    defend(isDefending) {
        this.isDefending = isDefending;
    }
    
    takeDamage(amount) {
        if (this.isDefending) {
            amount *= MECH_CONFIG.DEFENSE_REDUCTION;
        }
        this.health = Math.max(0, this.health - amount);
        this.hitFlash = 150;
    }
    
    getAttackBox() {
        if (!this.isAttacking || this.attackFrame < 2) return null;
        
        return {
            x: this.facingRight ? this.x + this.width : this.x - MECH_CONFIG.ATTACK_RANGE,
            y: this.y + 10,
            width: MECH_CONFIG.ATTACK_RANGE,
            height: this.height - 20
        };
    }
    
    update(dt, input) {
        if (this.isPlayer1) {
            if (input.isP1Left()) this.move(-1);
            else if (input.isP1Right()) this.move(1);
            else this.velocityX *= CONFIG.FRICTION;
            
            if (input.isP1Jump()) this.jump();
            if (input.isP1Attack()) this.attack();
            this.defend(input.isP1Defend());
        } else {
            if (input.isP2Left()) this.move(-1);
            else if (input.isP2Right()) this.move(1);
            else this.velocityX *= CONFIG.FRICTION;
            
            if (input.isP2Jump()) this.jump();
            if (input.isP2Attack()) this.attack();
            this.defend(input.isP2Defend());
        }
        
        this.velocityY += CONFIG.GRAVITY;
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        if (this.y >= CONFIG.GROUND_Y - this.height) {
            this.y = CONFIG.GROUND_Y - this.height;
            this.velocityY = 0;
            this.isJumping = false;
        }
        
        if (this.x < 10) this.x = 10;
        if (this.x > CONFIG.CANVAS_WIDTH - this.width - 10) {
            this.x = CONFIG.CANVAS_WIDTH - this.width - 10;
        }
        
        if (this.attackCooldown > 0) {
            this.attackCooldown -= dt;
        }
        
        if (this.isAttacking) {
            this.attackFrame++;
            if (this.attackFrame > 12) {
                this.isAttacking = false;
                this.attackFrame = 0;
            }
        }
        
        if (this.hitFlash > 0) {
            this.hitFlash -= dt;
        }
        
        this.animTimer += dt;
        if (this.animTimer > 100) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 4;
        }
    }
    
    render(ctx) {
        ctx.save();
        
        if (this.hitFlash > 0 && Math.floor(this.hitFlash / 30) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        
        const px = CONFIG.PIXEL_SIZE;
        
        // Move to the mech's position on the canvas
        ctx.translate(Math.floor(this.x), Math.floor(this.y));
        
        // If facing left, flip horizontally around the mech's width
        if (!this.facingRight) {
            ctx.translate(this.width, 0);
            ctx.scale(-1, 1);
        }
        
        const mainColor = this.color;
        const darkColor = this.isPlayer1 ? '#8822aa' : '#22aa88';
        const lightColor = this.isPlayer1 ? '#ee66ff' : '#66ffee';
        const accentColor = '#ffcc00';
        
        const legOffset = Math.abs(this.velocityX) > 0.5 ? Math.sin(this.animFrame * Math.PI / 2) * 4 : 0;
        
        // All coordinates are now relative to the mech's top-left corner (0, 0)
        ctx.fillStyle = darkColor;
        this.drawPixelRect(ctx, 8, 44 + legOffset, 8, 20, px);
        this.drawPixelRect(ctx, 32, 44 - legOffset, 8, 20, px);
        
        ctx.fillStyle = mainColor;
        this.drawPixelRect(ctx, 6, 20, 36, 28, px);
        
        ctx.fillStyle = lightColor;
        this.drawPixelRect(ctx, 10, 24, 28, 8, px);
        
        ctx.fillStyle = darkColor;
        this.drawPixelRect(ctx, 12, 34, 24, 10, px);
        
        ctx.fillStyle = accentColor;
        this.drawPixelRect(ctx, 20, 36, 8, 6, px);
        
        ctx.fillStyle = mainColor;
        this.drawPixelRect(ctx, 8, 0, 32, 22, px);
        
        ctx.fillStyle = lightColor;
        this.drawPixelRect(ctx, 12, 4, 24, 14, px);
        
        ctx.fillStyle = '#ffffff';
        this.drawPixelRect(ctx, 14, 8, 8, 6, px);
        this.drawPixelRect(ctx, 26, 8, 8, 6, px);
        
        ctx.fillStyle = '#000000';
        this.drawPixelRect(ctx, 18, 10, 4, 4, px);
        this.drawPixelRect(ctx, 30, 10, 4, 4, px);
        
        ctx.fillStyle = accentColor;
        this.drawPixelRect(ctx, 20, 0, 8, 4, px);
        
        let armY = 24;
        let armAngle = 0;
        
        if (this.isAttacking) {
            if (this.attackFrame < 4) {
                armAngle = -20;
            } else if (this.attackFrame < 8) {
                armAngle = 30;
                armY -= 4;
            } else {
                armAngle = 10;
            }
        }
        
        ctx.fillStyle = mainColor;
        if (!this.isDefending) {
            this.drawPixelRect(ctx, 40, armY + armAngle, 12, 8, px);
            this.drawPixelRect(ctx, 48, armY + 4 + armAngle, 8, 8, px);
        } else {
            ctx.fillStyle = lightColor;
            this.drawPixelRect(ctx, 38, 20, 14, 24, px);
            
            ctx.fillStyle = '#33ccff';
            this.drawPixelRect(ctx, 42, 24, 6, 16, px);
        }
        
        if (!this.isDefending) {
            ctx.fillStyle = darkColor;
            this.drawPixelRect(ctx, -4, 28, 10, 8, px);
        }
        
        if (this.isVictory) {
            ctx.fillStyle = accentColor;
            this.drawPixelRect(ctx, 10, -8, 4, 8, px);
            this.drawPixelRect(ctx, 32, -8, 4, 8, px);
        }
        
        ctx.restore();
    }
    
    drawPixelRect(ctx, x, y, width, height, pixelSize) {
        for (let py = 0; py < height; py += pixelSize) {
            for (let px = 0; px < width; px += pixelSize) {
                ctx.fillRect(x + px, y + py, pixelSize, pixelSize);
            }
        }
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Store base dimensions
        this.baseWidth = CONFIG.CANVAS_WIDTH;
        this.baseHeight = CONFIG.CANVAS_HEIGHT;
        
        // Setup canvas with proper scaling for zoom and device pixel ratio
        this.setupCanvas();
        
        this.state = 'menu';
        this.input = new InputManager();
        this.player1 = null;
        this.player2 = null;
        this.effects = [];
        this.lastTime = 0;
        this.winner = null;
        this.shakeAmount = 0;
        this.clouds = [];
        this.buildings = [];
        this.scale = 1;
        
        this.initBackground();
        this.bindEvents();
        this.setupResizeHandler();
        this.gameLoop(0);
    }
    
    setupCanvas() {
        // Get device pixel ratio (accounts for zoom and high-DPI displays)
        const dpr = window.devicePixelRatio || 1;
        
        // Set the actual canvas dimensions in memory
        this.canvas.width = this.baseWidth * dpr;
        this.canvas.height = this.baseHeight * dpr;
        
        // Set the display size (CSS pixels)
        this.canvas.style.width = this.baseWidth + 'px';
        this.canvas.style.height = this.baseHeight + 'px';
        
        // Scale the context to account for the difference
        this.ctx.scale(dpr, dpr);
        
        // Store the scale for later use
        this.dpr = dpr;
        
        // Ensure crisp pixel rendering
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;
    }
    
    setupResizeHandler() {
        // Handle window resize and zoom changes
        const resizeHandler = () => {
            this.handleResize();
        };
        
        // Debounce resize events
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(resizeHandler, 100);
        });
        
        // Handle zoom changes (device pixel ratio changes)
        if (window.matchMedia) {
            const mediaQueryList = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
            // Use modern addEventListener instead of deprecated addListener
            if (mediaQueryList.addEventListener) {
                mediaQueryList.addEventListener('change', resizeHandler);
            } else if (mediaQueryList.addListener) {
                // Fallback for older browsers
                mediaQueryList.addListener(resizeHandler);
            }
        }
        
        // Initial setup
        this.handleResize();
    }
    
    handleResize() {
        const newDpr = window.devicePixelRatio || 1;
        
        // Only update if DPR changed (zoom changed)
        if (newDpr !== this.dpr) {
            this.dpr = newDpr;
            this.setupCanvas();
            
            // Re-render if game is active
            if (this.state === 'playing') {
                this.render();
            }
        }
        
        // Calculate scale based on container size
        const container = document.getElementById('game-screen');
        if (container) {
            const containerWidth = container.clientWidth - 40; // Account for padding
            const containerHeight = container.clientHeight - 80; // Account for health bars
            
            const scaleX = containerWidth / this.baseWidth;
            const scaleY = containerHeight / this.baseHeight;
            
            this.scale = Math.min(scaleX, scaleY, 1);
            
            // Apply scale to canvas display size
            this.canvas.style.width = (this.baseWidth * this.scale) + 'px';
            this.canvas.style.height = (this.baseHeight * this.scale) + 'px';
        }
    }
    
    initBackground() {
        for (let i = 0; i < 5; i++) {
            this.clouds.push({
                x: Math.random() * CONFIG.CANVAS_WIDTH,
                y: 30 + Math.random() * 80,
                width: 60 + Math.random() * 80,
                speed: 0.2 + Math.random() * 0.3
            });
        }
        
        for (let i = 0; i < 8; i++) {
            this.buildings.push({
                x: i * 120 - 40,
                width: 80 + Math.random() * 60,
                height: 100 + Math.random() * 150
            });
        }
    }
    
    bindEvents() {
        const startBtn = document.getElementById('start-btn');
        const restartBtn = document.getElementById('restart-btn');
        const menuBtn = document.getElementById('menu-btn');
        
        // Button click events
        startBtn.addEventListener('click', () => {
            this.startGame();
            startBtn.blur();
        });
        
        restartBtn.addEventListener('click', () => {
            this.startGame();
            restartBtn.blur();
        });
        
        menuBtn.addEventListener('click', () => {
            this.showMenu();
            menuBtn.blur();
        });
        
        // Keyboard navigation for buttons
        [startBtn, restartBtn, menuBtn].forEach(btn => {
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    btn.click();
                }
            });
        });
        
        // Add visual feedback for key presses in menu
        document.querySelectorAll('.key').forEach(key => {
            key.addEventListener('click', () => {
                key.classList.add('pressed');
                setTimeout(() => key.classList.remove('pressed'), 150);
            });
            
            key.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    key.click();
                }
            });
        });
    }
    
    startGame() {
        this.state = 'playing';
        this.player1 = new Mech(150, CONFIG.GROUND_Y - MECH_CONFIG.HEIGHT, '#cc33ff', true);
        this.player2 = new Mech(CONFIG.CANVAS_WIDTH - 150 - MECH_CONFIG.WIDTH, CONFIG.GROUND_Y - MECH_CONFIG.HEIGHT, '#33ffcc', false);
        this.effects = [];
        this.winner = null;
        this.shakeAmount = 0;
        
        this.showScreen('game-screen');
        this.updateHealthBars();
    }
    
    showMenu() {
        this.state = 'menu';
        this.showScreen('menu-screen');
    }
    
    showGameOver(winner) {
        this.state = 'gameover';
        this.winner = winner;
        
        const winnerText = document.getElementById('winner-text');
        winnerText.textContent = winner === 1 ? '玩家1 获胜!' : '玩家2 获胜!';
        winnerText.style.color = winner === 1 ? '#cc33ff' : '#33ffcc';
        
        this.showScreen('gameover-screen');
    }
    
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    }
    
    updateHealthBars() {
        const p1Health = document.getElementById('p1-health');
        const p2Health = document.getElementById('p2-health');
        const p1HealthBar = p1Health.parentElement;
        const p2HealthBar = p2Health.parentElement;
        
        const p1Percent = (this.player1.health / this.player1.maxHealth) * 100;
        const p2Percent = (this.player2.health / this.player2.maxHealth) * 100;
        
        p1Health.style.width = p1Percent + '%';
        p2Health.style.width = p2Percent + '%';
        
        // Update health states
        p1Health.classList.remove('low', 'medium');
        p2Health.classList.remove('low', 'medium');
        
        if (p1Percent < 30) {
            p1Health.classList.add('low');
        } else if (p1Percent < 60) {
            p1Health.classList.add('medium');
        }
        
        if (p2Percent < 30) {
            p2Health.classList.add('low');
        } else if (p2Percent < 60) {
            p2Health.classList.add('medium');
        }
        
        // Update ARIA attributes for accessibility
        p1HealthBar.setAttribute('aria-valuenow', Math.round(p1Percent));
        p2HealthBar.setAttribute('aria-valuenow', Math.round(p2Percent));
    }
    
    checkAttackHit(attacker, defender) {
        const attackBox = attacker.getAttackBox();
        if (!attackBox) return false;
        
        const defenderBox = {
            x: defender.x,
            y: defender.y,
            width: defender.width,
            height: defender.height
        };
        
        return attackBox.x < defenderBox.x + defenderBox.width &&
               attackBox.x + attackBox.width > defenderBox.x &&
               attackBox.y < defenderBox.y + defenderBox.height &&
               attackBox.y + attackBox.height > defenderBox.y;
    }
    
    update(dt) {
        if (this.state !== 'playing') return;
        
        this.player1.update(dt, this.input);
        this.player2.update(dt, this.input);
        
        if (this.player1.isAttacking && this.player1.attackFrame === 6) {
            if (this.checkAttackHit(this.player1, this.player2)) {
                if (this.player2.isDefending) {
                    this.effects.push(new BlockEffect(
                        this.player2.x + this.player2.width / 2,
                        this.player2.y + this.player2.height / 2
                    ));
                } else {
                    this.player2.takeDamage(MECH_CONFIG.ATTACK_DAMAGE);
                    this.effects.push(new HitEffect(
                        this.player2.x + this.player2.width / 2,
                        this.player2.y + this.player2.height / 2
                    ));
                    this.shakeAmount = 5;
                }
            }
        }
        
        if (this.player2.isAttacking && this.player2.attackFrame === 6) {
            if (this.checkAttackHit(this.player2, this.player1)) {
                if (this.player1.isDefending) {
                    this.effects.push(new BlockEffect(
                        this.player1.x + this.player1.width / 2,
                        this.player1.y + this.player1.height / 2
                    ));
                } else {
                    this.player1.takeDamage(MECH_CONFIG.ATTACK_DAMAGE);
                    this.effects.push(new HitEffect(
                        this.player1.x + this.player1.width / 2,
                        this.player1.y + this.player1.height / 2
                    ));
                    this.shakeAmount = 5;
                }
            }
        }
        
        if (this.player1.isAttacking && this.player1.attackFrame === 3) {
            this.effects.push(new AttackEffect(
                this.player1.x + (this.player1.facingRight ? this.player1.width + 10 : -10),
                this.player1.y + this.player1.height / 2,
                this.player1.facingRight,
                '#ff3366'
            ));
        }
        
        if (this.player2.isAttacking && this.player2.attackFrame === 3) {
            this.effects.push(new AttackEffect(
                this.player2.x + (this.player2.facingRight ? this.player2.width + 10 : -10),
                this.player2.y + this.player2.height / 2,
                this.player2.facingRight,
                '#33ffcc'
            ));
        }
        
        for (let i = this.effects.length - 1; i >= 0; i--) {
            this.effects[i].update(dt);
            if (this.effects[i].isDead()) {
                this.effects.splice(i, 1);
            }
        }
        
        if (this.shakeAmount > 0) {
            this.shakeAmount *= 0.9;
            if (this.shakeAmount < 0.5) this.shakeAmount = 0;
        }
        
        this.clouds.forEach(cloud => {
            cloud.x -= cloud.speed;
            if (cloud.x + cloud.width < 0) {
                cloud.x = CONFIG.CANVAS_WIDTH;
            }
        });
        
        this.updateHealthBars();
        
        if (this.player1.health <= 0) {
            this.player2.isVictory = true;
            this.showGameOver(2);
        } else if (this.player2.health <= 0) {
            this.player1.isVictory = true;
            this.showGameOver(1);
        }
    }
    
    render() {
        const ctx = this.ctx;
        
        ctx.save();
        
        if (this.shakeAmount > 0) {
            ctx.translate(
                (Math.random() - 0.5) * this.shakeAmount * 2,
                (Math.random() - 0.5) * this.shakeAmount * 2
            );
        }
        
        const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS_HEIGHT);
        gradient.addColorStop(0, '#1a1a3a');
        gradient.addColorStop(0.5, '#0a0a2a');
        gradient.addColorStop(1, '#050515');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        this.renderStars(ctx);
        
        this.renderClouds(ctx);
        
        this.renderBuildings(ctx);
        
        ctx.fillStyle = '#1a1a2a';
        ctx.fillRect(0, CONFIG.GROUND_Y, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_Y);
        
        ctx.fillStyle = '#2a2a4a';
        for (let x = 0; x < CONFIG.CANVAS_WIDTH; x += 20) {
            ctx.fillRect(x, CONFIG.GROUND_Y, 10, 4);
        }
        
        ctx.fillStyle = '#3a3a5a';
        ctx.fillRect(0, CONFIG.GROUND_Y, CONFIG.CANVAS_WIDTH, 2);
        
        if (this.state === 'playing' || this.state === 'gameover') {
            if (this.player1) this.player1.render(ctx);
            if (this.player2) this.player2.render(ctx);
            
            this.effects.forEach(effect => effect.render(ctx));
        }
        
        ctx.restore();
    }
    
    renderStars(ctx) {
        ctx.fillStyle = '#ffffff';
        const starPositions = [
            [50, 30], [120, 50], [200, 25], [280, 60], [350, 35],
            [420, 55], [500, 30], [580, 45], [650, 25], [720, 50],
            [780, 40], [100, 80], [300, 70], [450, 85], [600, 75]
        ];
        
        starPositions.forEach(([x, y]) => {
            ctx.fillRect(x, y, 2, 2);
        });
    }
    
    renderClouds(ctx) {
        ctx.fillStyle = 'rgba(40, 40, 80, 0.5)';
        this.clouds.forEach(cloud => {
            ctx.fillRect(cloud.x, cloud.y, cloud.width, 20);
            ctx.fillRect(cloud.x + 10, cloud.y - 10, cloud.width - 20, 15);
            ctx.fillRect(cloud.x + 20, cloud.y + 10, cloud.width - 40, 10);
        });
    }
    
    renderBuildings(ctx) {
        this.buildings.forEach((building, i) => {
            const height = building.height;
            const y = CONFIG.GROUND_Y - height;
            
            ctx.fillStyle = i % 2 === 0 ? '#15152a' : '#1a1a35';
            ctx.fillRect(building.x, y, building.width, height);
            
            ctx.fillStyle = '#ffcc00';
            const windowSize = 6;
            const windowGap = 12;
            for (let wy = y + 10; wy < CONFIG.GROUND_Y - 20; wy += windowGap) {
                for (let wx = building.x + 8; wx < building.x + building.width - 8; wx += windowGap) {
                    if (Math.random() > 0.3) {
                        ctx.fillRect(wx, wy, windowSize, windowSize);
                    }
                }
            }
        });
    }
    
    gameLoop(timestamp) {
        const dt = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        this.update(Math.min(dt, 32));
        this.render();
        
        requestAnimationFrame((t) => this.gameLoop(t));
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
