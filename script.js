// Game Elements
const gameScreen = document.querySelector('.game-screen');
const playerCar = document.getElementById('player-car');
const scoreElement = document.getElementById('score');
const bestElement = document.getElementById('best');
const levelElement = document.getElementById('level');
const startScreen = document.getElementById('start-screen');
const pauseScreen = document.getElementById('pause-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreElement = document.getElementById('final-score');
const enemyContainer = document.getElementById('enemy-container');
const bonusPopup = document.getElementById('bonus-popup');
const pauseBtn = document.getElementById('pause-btn');
const carTypeSelect = document.getElementById('car-type');
const treesLeft = document.getElementById('trees-left');
const treesRight = document.getElementById('trees-right');

// Game Variables
let playerLane = 1; // 0=left, 1=center, 2=right
let score = 0;
let bestScore = localStorage.getItem('highwayBest') || 0;
let level = 1;
let gameRunning = false;
let isPaused = false;
let enemySpeed = 6;
let enemyInterval = null;

// Car Emojis
const carEmojis = {
    'red': '🚗',
    'blue': '🚙',
    'black': '🚘',
    'yellow': '🚌',
    'green': '🚐'
};

const enemyCars = ['🚙', '🚕', '🚓', '🚑', '🚒', '🛻', '🚐', '🏎️'];

// Initialize
bestElement.innerText = bestScore;

// Lane Positions (3 lanes)
const lanePositions = [62, 152, 242];

// Keyboard Controls
document.addEventListener('keydown', (e) => {
    if (e.key === 'p' || e.key === 'P') {
        togglePause();
        return;
    }
    if (!gameRunning || isPaused) return;
    
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        moveLeft();
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        moveRight();
    }
});

function moveLeft() {
    if (playerLane > 0) {
        playerLane--;
        playerCar.style.left = lanePositions[playerLane] + 'px';
    }
}

function moveRight() {
    if (playerLane < 2) {
        playerLane++;
        playerCar.style.left = lanePositions[playerLane] + 'px';
    }
}

// Change Player Car
function changePlayerCar() {
    const selected = carTypeSelect.value;
    playerCar.querySelector('.car-body').innerText = carEmojis[selected];
}

// Toggle Pause
function togglePause() {
    if (!gameRunning && !isPaused) return;
    
    isPaused = !isPaused;
    
    if (isPaused) {
        pauseScreen.style.display = 'flex';
        pauseBtn.innerText = '▶';
    } else {
        pauseScreen.style.display = 'none';
        pauseBtn.innerText = '⏸';
        gameLoop();
    }
}

// Start Game
function startGame() {
    startScreen.style.display = 'none';
    pauseScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    
    gameRunning = true;
    isPaused = false;
    score = 0;
    level = 1;
    enemySpeed = 6;
    playerLane = 1;
    
    playerCar.style.left = lanePositions[1] + 'px';
    scoreElement.innerText = '0';
    levelElement.innerText = '1';
    pauseBtn.innerText = '⏸';
    
    enemyContainer.innerHTML = '';
    
    gameLoop();
    enemyInterval = setInterval(createEnemy, 1000);
}

// Main Game Loop
function gameLoop() {
    if (!gameRunning || isPaused) return;
    requestAnimationFrame(gameLoop);
}

// Create Enemy (Oncoming)
function createEnemy() {
    if (!gameRunning || isPaused) return;
    
    const enemy = document.createElement('div');
    enemy.classList.add('enemy-car');
    enemy.innerText = enemyCars[Math.floor(Math.random() * enemyCars.length)];
    
    // Random lane
    const lane = Math.floor(Math.random() * 3);
    enemy.style.left = lanePositions[lane] + 'px';
    enemy.style.top = '-90px';
    
    enemyContainer.appendChild(enemy);
    
    moveEnemy(enemy);
}

// Move Enemy
function moveEnemy(enemy) {
    let enemyY = -90;
    
    const moveId = setInterval(() => {
        if (!gameRunning) {
            clearInterval(moveId);
            return;
        }
        
        if (isPaused) return;
        
        enemyY += enemySpeed;
        enemy.style.top = enemyY + 'px';
        
        // Collision Check
        if (checkCollision(playerCar, enemy)) {
            clearInterval(moveId);
            gameOver();
            return;
        }
        
        // Enemy Passed - Player Passed Successfully!
        if (enemyY > 580) {
            clearInterval(moveId);
            enemy.remove();
            passSuccess();
        }
    }, 25);
}

// Check Collision
function checkCollision(a, b) {
    const aRect = a.getBoundingClientRect();
    const bRect = b.getBoundingClientRect();
    
    // Reduce hitbox slightly for fair gameplay
    const padding = 15;
    
    return !(
        aRect.right < bRect.left + padding ||
        aRect.left > bRect.right - padding ||
        aRect.bottom < bRect.top + padding ||
        aRect.top > bRect.bottom - padding
    );
}

// Pass Success - Score Points!
function passSuccess() {
    score += 10;
    scoreElement.innerText = score;
    
    // Show bonus popup
    bonusPopup.innerText = '+10';
    bonusPopup.classList.remove('show-bonus');
    void bonusPopup.offsetWidth; // Trigger reflow
    bonusPopup.classList.add('show-bonus');
    
    // Level up every 100 points
    if (score % 100 === 0) {
        level++;
        levelElement.innerText = level;
        enemySpeed += 1;
    }
}

// Game Over
function gameOver() {
    gameRunning = false;
    clearInterval(enemyInterval);
    
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('highwayBest', bestScore);
        bestElement.innerText = bestScore;
    }
    
    finalScoreElement.innerText = score;
    gameOverScreen.style.display = 'flex';
}

// Restart Game
function restartGame() {
    startGame();
}

// Create Trees (Scenery)
function createTree(container, side) {
    const tree = document.createElement('div');
    tree.classList.add('side-tree');
    tree.innerText = Math.random() > 0.5 ? '🌲' : '🌳';
    tree.style.left = side === 'left' ? Math.random() * 20 + 'px' : '';
    tree.style.right = side === 'right' ? Math.random() * 20 + 'px' : '';
    container.appendChild(tree);
    
    // Remove after animation
    setTimeout(() => tree.remove(), 1500);
}

setInterval(() => {
    if (gameRunning && !isPaused) {
        createTree(treesLeft, 'left');
        createTree(treesRight, 'right');
    }
}, 800);