const player = document.querySelector('.player');
const obstacle = document.querySelector('.obstacle');

const gameOver = document.querySelector('.game-over');
const restartButton = document.querySelector('.restart');

let gameRunning = true;
let isJumping = false;


// ==========================================
// PULO
// ==========================================

const jump = () => {

    if (!gameRunning || isJumping) {
        return;
    }

    isJumping = true;

    player.classList.add('jump');

    setTimeout(() => {

        player.classList.remove('jump');

        isJumping = false;

    }, 500);
};


// ==========================================
// ANIMAÇÃO DE CAMINHADA
// ==========================================

let walkFrame = 0;

const walkAnimation = setInterval(() => {

    if (!gameRunning || isJumping) {
        return;
    }

    walkFrame++;

    if (walkFrame > 3) {
        walkFrame = 0;
    }

    player.style.backgroundPosition =
        `-${walkFrame * 128}px 0px`;

}, 150);


// ==========================================
// COLISÃO
// ==========================================

const collisionLoop = setInterval(() => {

    if (!gameRunning) {
        return;
    }

    const playerRect = player.getBoundingClientRect();
    const obstacleRect = obstacle.getBoundingClientRect();

    const collision =
        playerRect.right > obstacleRect.left &&
        playerRect.left < obstacleRect.right &&
        playerRect.bottom > obstacleRect.top &&
        playerRect.top < obstacleRect.bottom;

    if (collision) {

        gameOverFunction();

    }

}, 10);


// ==========================================
// GAME OVER
// ==========================================

const gameOverFunction = () => {

    gameRunning = false;

    // Frame 12 = derrotado
    player.style.backgroundPosition =
        `-${3 * 128}px -${2 * 128}px`;

    player.classList.remove('jump');

    obstacle.style.animation = 'none';

    gameOver.style.visibility = 'visible';

};


// ==========================================
// REINICIAR
// ==========================================

const restart = () => {

    gameRunning = true;
    isJumping = false;

    gameOver.style.visibility = 'hidden';

    player.classList.remove('jump');

    // Volta para o frame 1
    player.style.backgroundPosition = '0px 0px';

    obstacle.style.animation =
        'obstacle-animation 1.5s infinite linear';

};


// ==========================================
// CONTROLES
// ==========================================

document.addEventListener('keydown', (event) => {

    if (
        event.code === 'Space' ||
        event.code === 'ArrowUp' ||
        event.code === 'KeyW'
    ) {

        event.preventDefault();

        jump();

    }

});


// Controle por toque/celular
document.addEventListener('touchstart', (event) => {

    event.preventDefault();

    jump();

}, { passive: false });


// Botão de reiniciar
restartButton.addEventListener('click', restart);
