const player = document.querySelector('.player');
const obstacle = document.querySelector('.obstacle');

const gameOverScreen = document.querySelector('.game-over');
const restartButton = document.querySelector('.restart');

// ========================================
// ESTADO DO JOGO
// ========================================

let gameRunning = true;

let isGrounded = true;
let isCrouching = false;

let velocityX = 0;
let velocityY = 0;

let playerX = 100;
let playerY = 0;

// ========================================
// CONFIGURAÇÕES DA FÍSICA
// ========================================

const gravity = 0.8;

const jumpForce = 16;

const maxSpeed = 7;
const acceleration = 0.7;
const friction = 0.82;

const airControl = 0.45;

// ========================================
// CONTROLES
// ========================================

const keys = {
    left: false,
    right: false,
    down: false
};

// ========================================
// CONFIGURAÇÃO INICIAL
// ========================================

player.style.left = `${playerX}px`;
player.style.bottom = `${playerY}px`;


// ========================================
// SPRITE SHEET
// ========================================

let currentFrame = 0;

const setFrame = (column, row) => {
    player.style.backgroundPosition =
        `-${column * 128}px -${row * 128}px`;
};


// ========================================
// ANIMAÇÃO DE CAMINHADA
// ========================================

let walkTimer = 0;

const updateWalkAnimation = () => {

    if (!gameRunning) return;

    if (isCrouching) {
        // Frame de interação/agachamento provisório
        setFrame(1, 2);
        return;
    }

    if (!isGrounded) {
        // Linha 2 = animações de salto
        if (velocityY > 5) {
            setFrame(0, 1);
        } else if (velocityY > -5) {
            setFrame(1, 1);
        } else {
            setFrame(2, 1);
        }

        return;
    }

    if (Math.abs(velocityX) > 0.5) {

        walkTimer++;

        if (walkTimer >= 8) {
            walkTimer = 0;

            currentFrame++;

            if (currentFrame > 3) {
                currentFrame = 0;
            }

            setFrame(currentFrame, 0);
        }

    } else {
        currentFrame = 0;
        setFrame(0, 0);
    }
};


// ========================================
// PULO
// ========================================

const jump = () => {

    if (!gameRunning) return;

    if (!isGrounded) return;

    if (isCrouching) return;

    velocityY = jumpForce;

    isGrounded = false;
};


// ========================================
// MOVIMENTO HORIZONTAL
// ========================================

const updateHorizontalMovement = () => {

    if (!gameRunning) return;

    const control = isGrounded
        ? acceleration
        : acceleration * airControl;

    if (keys.left) {
        velocityX -= control;
    }

    if (keys.right) {
        velocityX += control;
    }

    // Limite de velocidade
    if (velocityX > maxSpeed) {
        velocityX = maxSpeed;
    }

    if (velocityX < -maxSpeed) {
        velocityX = -maxSpeed;
    }

    // Atrito quando nenhuma direção está sendo pressionada
    if (!keys.left && !keys.right) {

        if (isGrounded) {
            velocityX *= friction;
        } else {
            velocityX *= 0.97;
        }
    }

    playerX += velocityX;

    // Limites da tela
    const boardWidth = document.querySelector('.game-board').clientWidth;

    const playerWidth = isCrouching ? 128 : 128;

    if (playerX < 0) {
        playerX = 0;
        velocityX = 0;
    }

    if (playerX + playerWidth > boardWidth) {
        playerX = boardWidth - playerWidth;
        velocityX = 0;
    }
};


// ========================================
// GRAVIDADE
// ========================================

const updateVerticalMovement = () => {

    if (!gameRunning) return;

    velocityY -= gravity;

    playerY += velocityY;

    // Chão
    if (playerY <= 0) {

        playerY = 0;

        velocityY = 0;

        isGrounded = true;
    } else {
        isGrounded = false;
    }
};


// ========================================
// AGACHAMENTO
// ========================================

const updateCrouch = () => {

    if (!gameRunning) return;

    if (keys.down && isGrounded) {

        if (!isCrouching) {
            isCrouching = true;
            player.classList.add('crouching');
        }

    } else {

        if (isCrouching) {
            isCrouching = false;
            player.classList.remove('crouching');
        }
    }
};


// ========================================
// POSIÇÃO DO PERSONAGEM
// ========================================

const updatePlayerPosition = () => {

    player.style.left = `${playerX}px`;
    player.style.bottom = `${playerY}px`;
};


// ========================================
// COLISÃO
// ========================================

const checkCollision = () => {

    if (!gameRunning) return;

    const playerRect = player.getBoundingClientRect();
    const obstacleRect = obstacle.getBoundingClientRect();

    // Pequena margem para deixar a colisão mais justa
    const marginX = 18;
    const marginTop = 10;
    const marginBottom = 5;

    const playerLeft = playerRect.left + marginX;
    const playerRight = playerRect.right - marginX;

    const playerTop = playerRect.top + marginTop;
    const playerBottom = playerRect.bottom - marginBottom;

    const obstacleLeft = obstacleRect.left;
    const obstacleRight = obstacleRect.right;
    const obstacleTop = obstacleRect.top;
    const obstacleBottom = obstacleRect.bottom;

    const collision =
        playerRight > obstacleLeft &&
        playerLeft < obstacleRight &&
        playerBottom > obstacleTop &&
        playerTop < obstacleBottom;

    if (collision) {
        gameOver();
    }
};


// ========================================
// GAME OVER
// ========================================

const gameOver = () => {

    gameRunning = false;

    velocityX = 0;
    velocityY = 0;

    // Frame 12 = personagem derrotado
    setFrame(3, 2);

    obstacle.style.animation = 'none';

    gameOverScreen.style.visibility = 'visible';
};


// ========================================
// REINICIAR
// ========================================

const restart = () => {

    gameRunning = true;

    isGrounded = true;
    isCrouching = false;

    velocityX = 0;
    velocityY = 0;

    playerX = 100;
    playerY = 0;

    currentFrame = 0;
    walkTimer = 0;

    keys.left = false;
    keys.right = false;
    keys.down = false;

    player.classList.remove('crouching');

    player.style.left = `${playerX}px`;
    player.style.bottom = `${playerY}px`;

    setFrame(0, 0);

    obstacle.style.animation =
        'obstacle-animation 1.8s infinite linear';

    gameOverScreen.style.visibility = 'hidden';
};


// ========================================
// TECLAS PRESSIONADAS
// ========================================

document.addEventListener('keydown', (event) => {

    if (!gameRunning) {

        if (event.code === 'Enter') {
            restart();
        }

        return;
    }

    switch (event.code) {

        case 'ArrowLeft':
        case 'KeyA':
            keys.left = true;
            event.preventDefault();
            break;

        case 'ArrowRight':
        case 'KeyD':
            keys.right = true;
            event.preventDefault();
            break;

        case 'ArrowDown':
        case 'KeyS':
            keys.down = true;
            event.preventDefault();
            break;

        case 'ArrowUp':
        case 'KeyW':
        case 'Space':
            event.preventDefault();
            jump();
            break;
    }
});


// ========================================
// TECLAS SOLTAS
// ========================================

document.addEventListener('keyup', (event) => {

    switch (event.code) {

        case 'ArrowLeft':
        case 'KeyA':
            keys.left = false;
            break;

        case 'ArrowRight':
        case 'KeyD':
            keys.right = false;
            break;

        case 'ArrowDown':
        case 'KeyS':
            keys.down = false;
            break;
    }
});


// ========================================
// BOTÃO REINICIAR
// ========================================

restartButton.addEventListener('click', restart);


// ========================================
// LOOP PRINCIPAL
// ========================================

const gameLoop = () => {

    if (gameRunning) {

        updateCrouch();

        updateHorizontalMovement();

        updateVerticalMovement();

        updatePlayerPosition();

        updateWalkAnimation();

        checkCollision();
    }

    requestAnimationFrame(gameLoop);
};


// ========================================
// INICIAR JOGO
// ========================================

setFrame(0, 0);

gameLoop();
