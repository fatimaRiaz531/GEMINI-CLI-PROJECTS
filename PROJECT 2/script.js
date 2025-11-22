document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const gameOverContainer = document.getElementById('game-over-container');
    const restartButton = document.getElementById('restart-button');

    // --- Game Constants ---
    const BUBBLE_RADIUS = 20;
    const ROWS = 12;
    const COLS = 15;
    const BUBBLE_COLORS = ['#3498db', '#e74c3c', '#2ecc71', '#f1c40f', '#9b59b6', '#1abc9c'];
    const SHOOTER_Y = 550;
    const SHOOT_SPEED = 15;
    const SHOTS_BEFORE_NEW_ROW = 5;
    const GAME_OVER_LINE_Y = 480;

    // --- Game State ---
    let score = 0;
    let gameOver = false;
    let bubbles = [];
    let playerBubble;
    let nextBubble;
    let isShooting = false;
    let mouse = { x: 0, y: 0 };
    let shotsSincePop = 0;
    let particles = [];

    // --- Audio ---
    const shootSound = new Audio('https://www.soundjay.com/button/sounds/button-16.mp3');
    const popSound = new Audio('https://www.soundjay.com/button/sounds/button-09.mp3');
    shootSound.volume = 0.5;
    popSound.volume = 0.5;


    // Set canvas size
    canvas.width = COLS * BUBBLE_RADIUS * 2;
    canvas.height = 600;

    // --- Classes ---
    class Bubble {
        constructor(x, y, color, isStatic = true) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.radius = BUBBLE_RADIUS;
            this.isStatic = isStatic;
            this.vx = 0;
            this.vy = 0;
        }

        draw() {
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            ctx.shadowBlur = 5;
            ctx.fill();
            ctx.restore();
        }

        update() {
            if (!this.isStatic) {
                this.x += this.vx;
                this.y += this.vy;
            }
        }
    }

    class Particle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.radius = Math.random() * 5 + 2;
            this.vx = (Math.random() - 0.5) * 4;
            this.vy = (Math.random() - 0.5) * 4;
            this.life = 30; // 30 frames
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.life / 30;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.restore();
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.life--;
        }
    }


    // --- Game Flow ---
    function init() {
        score = 0;
        shotsSincePop = 0;
        gameOver = false;
        isShooting = false;
        scoreElement.textContent = score;
        gameOverContainer.style.display = 'none';
        createBubbleGrid();
        createPlayerBubbles();
        gameLoop();
    }

    function gameLoop() {
        if (gameOver) return;
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }

    function update() {
        if (isShooting) {
            playerBubble.update();
            handleWallCollisions();
            checkBubbleCollisions();
        }
        particles.forEach((p, i) => {
            p.update();
            if (p.life <= 0) {
                particles.splice(i, 1);
            }
        });
    }

    function draw() {
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        bubbles.forEach(bubble => bubble.draw());
        playerBubble.draw();
        drawNextBubble();
        particles.forEach(p => p.draw());

        if (!isShooting && !gameOver) {
            drawAimer();
        }
    }

    function endGame() {
        gameOver = true;
        gameOverContainer.style.display = 'block';
    }

    // --- Bubble & Grid Logic ---
    function createBubbleGrid() {
        bubbles = [];
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < COLS; col++) {
                const x = col * BUBBLE_RADIUS * 2 + (row % 2 === 1 ? BUBBLE_RADIUS : 0) + BUBBLE_RADIUS;
                const y = row * BUBBLE_RADIUS * 1.75 + BUBBLE_RADIUS;
                const color = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];
                bubbles.push(new Bubble(x, y, color));
            }
        }
    }

    function addNewRow() {
        bubbles.forEach(bubble => {
            bubble.y += BUBBLE_RADIUS * 1.75;
        });

        for (let col = 0; col < COLS; col++) {
            const x = col * BUBBLE_RADIUS * 2 + (0 % 2 === 1 ? BUBBLE_RADIUS : 0) + BUBBLE_RADIUS;
            const y = BUBBLE_RADIUS;
            const color = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];
            bubbles.push(new Bubble(x, y, color));
        }
        checkGameOver();
    }

    function createPlayerBubbles() {
        playerBubble = new Bubble(canvas.width / 2, SHOOTER_Y, getRandomColor(), true);
        nextBubble = new Bubble(canvas.width / 2 + BUBBLE_RADIUS * 4, SHOOTER_Y, getRandomColor(), true);
    }

    function prepareNextShot() {
        if (shotsSincePop >= SHOTS_BEFORE_NEW_ROW) {
            addNewRow();
            shotsSincePop = 0;
        }

        playerBubble = nextBubble;
        playerBubble.x = canvas.width / 2;
        playerBubble.y = SHOOTER_Y;
        nextBubble = new Bubble(canvas.width / 2 + BUBBLE_RADIUS * 4, SHOOTER_Y, getRandomColor(), true);
    }

    function getRandomColor() {
        const existingColors = [...new Set(bubbles.map(b => b.color).filter(Boolean))];
        const availableColors = existingColors.length > 0 ? existingColors : BUBBLE_COLORS;
        return availableColors[Math.floor(Math.random() * availableColors.length)];
    }

    // --- Collision & Matching ---
    function handleWallCollisions() {
        if (playerBubble.x - playerBubble.radius < 0 || playerBubble.x + playerBubble.radius > canvas.width) {
            playerBubble.vx *= -1;
        }
        if (playerBubble.y - playerBubble.radius < 0) {
            playerBubble.y = playerBubble.radius;
            snapBubble();
        }
    }

    function checkBubbleCollisions() {
        for (const bubble of bubbles) {
            const dx = playerBubble.x - bubble.x;
            const dy = playerBubble.y - bubble.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < BUBBLE_RADIUS * 2) {
                snapBubble();
                break;
            }
        }
    }

    function snapBubble() {
        isShooting = false;
        playerBubble.isStatic = true;

        let minDistance = Infinity;
        let closestCell = { x: playerBubble.x, y: playerBubble.y };

        for (let row = 0; row < ROWS + 5; row++) {
            for (let col = 0; col < COLS; col++) {
                const cellX = col * BUBBLE_RADIUS * 2 + (row % 2 === 1 ? BUBBLE_RADIUS : 0) + BUBBLE_RADIUS;
                const cellY = row * BUBBLE_RADIUS * 1.75 + BUBBLE_RADIUS;

                const isOccupied = bubbles.some(b => Math.hypot(b.x - cellX, b.y - cellY) < 1);

                if (!isOccupied) {
                    const distance = Math.hypot(playerBubble.x - cellX, playerBubble.y - cellY);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestCell = { x: cellX, y: cellY };
                    }
                }
            }
        }

        playerBubble.x = closestCell.x;
        playerBubble.y = closestCell.y;
        bubbles.push(playerBubble);
        
        const matches = getMatches(playerBubble);
        if (matches.length >= 3) {
            popBubbles(matches);
            handleFloatingBubbles();
            shotsSincePop = 0;
        } else {
            shotsSincePop++;
        }

        checkGameOver();
        if (!gameOver) {
            prepareNextShot();
        }
    }

    function getMatches(startBubble) {
        const toVisit = [startBubble];
        const visited = new Set([startBubble]);
        const matches = [startBubble];

        while (toVisit.length > 0) {
            const current = toVisit.shift();
            const neighbors = getNeighbors(current);

            for (const neighbor of neighbors) {
                if (!visited.has(neighbor) && neighbor.color === startBubble.color) {
                    visited.add(neighbor);
                    toVisit.push(neighbor);
                    matches.push(neighbor);
                }
            }
        }
        return matches;
    }

    function getNeighbors(bubble) {
        return bubbles.filter(other => {
            if (bubble === other) return false;
            const dist = Math.hypot(bubble.x - other.x, bubble.y - other.y);
            return dist < BUBBLE_RADIUS * 2.5;
        });
    }

    function popBubbles(matchedBubbles) {
        popSound.play();
        matchedBubbles.forEach(bubble => {
            for (let i = 0; i < 5; i++) {
                particles.push(new Particle(bubble.x, bubble.y, bubble.color));
            }
            bubbles = bubbles.filter(b => b !== bubble);
            score += 10;
        });
        scoreElement.textContent = score;
    }

    function handleFloatingBubbles() {
        const supported = new Set();
        const toVisit = bubbles.filter(b => b.y - b.radius < BUBBLE_RADIUS);
        toVisit.forEach(b => supported.add(b));

        let i = 0;
        while(i < toVisit.length) {
            const current = toVisit[i++];
            const neighbors = getNeighbors(current);
            for(const neighbor of neighbors) {
                if(!supported.has(neighbor)) {
                    supported.add(neighbor);
                    toVisit.push(neighbor);
                }
            }
        }

        const floating = bubbles.filter(b => !supported.has(b));
        if (floating.length > 0) {
            setTimeout(() => popBubbles(floating), 200);
        }
    }

    function checkGameOver() {
        if (bubbles.some(b => b.y + BUBBLE_RADIUS > GAME_OVER_LINE_Y)) {
            endGame();
        }
    }

    // --- Drawing & UI ---
    function drawAimer() {
        const angle = Math.atan2(mouse.y - playerBubble.y, mouse.x - playerBubble.x);
        if (mouse.y > SHOOTER_Y - BUBBLE_RADIUS) return;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(playerBubble.x, playerBubble.y);
        ctx.lineTo(playerBubble.x + Math.cos(angle) * 1000, playerBubble.y + Math.sin(angle) * 1000);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 10]);
        ctx.stroke();
        ctx.restore();
    }

    function drawNextBubble() {
        nextBubble.draw();
        ctx.save();
        ctx.beginPath();
        ctx.arc(nextBubble.x, nextBubble.y, BUBBLE_RADIUS + 4, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
        ctx.fillStyle = 'white';
        ctx.font = '12px Poppins';
        ctx.textAlign = 'center';
        ctx.fillText('Next', nextBubble.x, nextBubble.y + BUBBLE_RADIUS + 18);
    }

    // --- Input Handling ---
    canvas.addEventListener('mousemove', (e) => {
        if (isShooting || gameOver) return;
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    canvas.addEventListener('click', () => {
        if (isShooting || gameOver || mouse.y > SHOOTER_Y - BUBBLE_RADIUS) return;
        
        shootSound.play();
        isShooting = true;
        playerBubble.isStatic = false;

        const angle = Math.atan2(mouse.y - playerBubble.y, mouse.x - playerBubble.x);
        playerBubble.vx = Math.cos(angle) * SHOOT_SPEED;
        playerBubble.vy = Math.sin(angle) * SHOOT_SPEED;
    });

    restartButton.addEventListener('click', () => {
        init();
    });

    // --- Start Game ---
    init();
});
