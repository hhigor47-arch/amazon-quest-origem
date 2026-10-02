const player = document.querySelector('.player');
const gameBoard = document.querySelector('.game-board');

const gameOverScreen = document.querySelector('.game-over');
const restartButton = document.querySelector('.restart');


// ======================================================
// ESTADO DO JOGO
// ======================================================

let gameRunning = true;

let isGrounded = true;
let isCrouching = false;

let velocityX = 0;
let velocityY = 0;

let playerX = 100;
let playerY = 0;


// ======================================================
// FÍSICA
// ======================================================

const GRAVITY = 0.82;

const JUMP_FORCE = 16;

const MAX_SPEED = 7;

const ACCELERATION = 0.7;

const AIR_CONTROL = 0.45;

const GROUND_FRICTION = 0.78;

const AIR_FRICTION = 0.97;


// ======================================================
// CONTROLES
// ======================================================

const keys = {
    left: false,
    right: false,
    down: false
};


// ======================================================
// SPRITE
// ======================================================

let currentFrame = 0;

const setFrame = (column, row) => {

    player.style.backgroundPosition =
        `-${column * 128}px -${row * 128}px`;
};


// ======================================================
// CONFIGURAÇÃO DO JOGADOR
// ======================================================

const PLAYER_WIDTH = 128;
const PLAYER_HEIGHT = 128;


// ======================================================
// HITBOX PERSONALIZADA
// ======================================================

/*
    A imagem tem 128x128, mas não vamos considerar
    toda a imagem como corpo.

    Isso evita morrer quando uma parte transparente
    da sprite encosta no obstáculo.
*/

const getPlayerHitbox = () => {

    if (isCrouching) {

        return {
            x: playerX + 24,
            y: playerY + 4,
            width: 80,
            height: 62
        };

    }

    return {
        x: playerX + 27,
        y: playerY + 8,
        width: 74,
        height: 108
    };
};


// ======================================================
// PULO
// ======================================================

const jump = () => {

    if (!gameRunning) return;

    if (!isGrounded) return;

    if (isCrouching) return;

    velocityY = JUMP_FORCE;

    isGrounded = false;
};


// ======================================================
// MOVIMENTO HORIZONTAL
// ======================================================

const updateHorizontalMovement = () => {

    if (!gameRunning) return;


    const control =
        isGrounded
            ? ACCELERATION
            : ACCELERATION * AIR_CONTROL;


    if (keys.left) {
        velocityX -= control;
    }


    if (keys.right) {
        velocityX += control;
    }


    // Limite de velocidade

    if (velocityX > MAX_SPEED) {
        velocityX = MAX_SPEED;
    }

    if (velocityX < -MAX_SPEED) {
        velocityX = -MAX_SPEED;
    }


    // Fricção

    if (!keys.left && !keys.right) {

        if (isGrounded) {

            velocityX *= GROUND_FRICTION;

        } else {

            velocityX *= AIR_FRICTION;
        }
    }


    playerX += velocityX;


    // Limites da fase

    const boardWidth =
        gameBoard.clientWidth;


    if (playerX < 0) {

        playerX = 0;
        velocityX = 0;
    }


    if (playerX + PLAYER_WIDTH > boardWidth) {

        playerX =
            boardWidth - PLAYER_WIDTH;

        velocityX = 0;
    }
};


// ======================================================
// GRAVIDADE
// ======================================================

const updateVerticalMovement = () => {

    if (!gameRunning) return;


    velocityY -= GRAVITY;

    playerY += velocityY;


    // chão

    if (playerY <= 0) {

        playerY = 0;

        velocityY = 0;

        isGrounded = true;

    } else {

        isGrounded = false;
    }
};


// ======================================================
// AGACHAMENTO
// ======================================================

const updateCrouch = () => {

    if (!gameRunning) return;


    if (keys.down && isGrounded) {

        if (!isCrouching) {

            isCrouching = true;

            player.classList.add(
                'crouching'
            );

            /*
                Frame 10:
                coluna 2 / linha 3

                É o frame de interação
                da sua sprite atual.

                Depois substituímos por um
                frame realmente agachado.
            */

            setFrame(1, 2);
        }

    } else {

        if (isCrouching) {

            isCrouching = false;

            player.classList.remove(
                'crouching'
            );

            setFrame(0, 0);
        }
    }
};


// ======================================================
// POSIÇÃO VISUAL
// ======================================================

const updatePlayerPosition = () => {

    player.style.left =
        `${playerX}px`;

    player.style.bottom =
        `${playerY}px`;
};


// ======================================================
// OBSTÁCULOS
// ======================================================

let obstacles = [];

let obstacleTimer = 0;

let difficulty = 1;


// ======================================================
// PADRÕES DE OBSTÁCULOS
// ======================================================

const patterns = [

    // ------------------------------------
    // PADRÃO 1
    // simples
    // ------------------------------------

    [
        {
            type: 'high',
            delay: 0
        }
    ],


    // ------------------------------------
    // PADRÃO 2
    // baixo
    // ------------------------------------

    [
        {
            type: 'low',
            delay: 0
        }
    ],


    // ------------------------------------
    // PADRÃO 3
    // salto + salto
    // ------------------------------------

    [
        {
            type: 'high',
            delay: 0
        },
        {
            type: 'high',
            delay: 420
        }
    ],


    // ------------------------------------
    // PADRÃO 4
    // baixo + alto
    // ------------------------------------

    [
        {
            type: 'low',
            delay: 0
        },
        {
            type: 'high',
            delay: 600
        }
    ],


    // ------------------------------------
    // PADRÃO 5
    // alto + baixo
    // ------------------------------------

    [
        {
            type: 'high',
            delay: 0
        },
        {
            type: 'low',
            delay: 650
        }
    ],


    // ------------------------------------
    // PADRÃO 6
    // sequência
    // ------------------------------------

    [
        {
            type: 'high',
            delay: 0
        },
        {
            type: 'low',
            delay: 500
        },
        {
            type: 'high',
            delay: 1050
        }
    ],


    // ------------------------------------
    // PADRÃO 7
    // longo
    // ------------------------------------

    [
        {
            type: 'long',
            delay: 0
        }
    ]
];


// ======================================================
// CRIAR OBSTÁCULO
// ======================================================

const createObstacle = (type) => {

    const obstacle =
        document.createElement('div');

    obstacle.classList.add(
        'obstacle',
        type
    );


    const boardWidth =
        gameBoard.clientWidth;


    const data = {

        x: boardWidth + 80,

        type: type,

        width:
            type === 'low'
                ? 110
                : type === 'high'
                    ? 65
                    : type === 'long'
                        ? 150
                        : 60,

        height:
            type === 'low'
                ? 58
                : type === 'high'
                    ? 105
                    : type === 'long'
                        ? 48
                        : 80
    };


    obstacle.style.left =
        `${data.x}px`;

    obstacle.style.right =
        'auto';


    gameBoard.appendChild(
        obstacle
    );


    obstacles.push({

        element: obstacle,

        x: data.x,

        width: data.width,

        height: data.height,

        type: data.type
    });
};


// ======================================================
// SPAWN DE PADRÃO
// ======================================================

const spawnPattern = () => {

    if (!gameRunning) return;


    /*
        Conforme o jogador sobrevive,
        a dificuldade aumenta.
    */

    difficulty =
        Math.min(
            3,
            1 +
            Math.floor(
                survivalTime / 15000
            )
        );


    let availablePatterns;


    if (difficulty === 1) {

        availablePatterns =
            patterns.slice(0, 2);

    } else if (difficulty === 2) {

        availablePatterns =
            patterns.slice(0, 5);

    } else {

        availablePatterns =
            patterns;
    }


    const pattern =
        availablePatterns[
            Math.floor(
                Math.random() *
                availablePatterns.length
            )
        ];


    pattern.forEach((item) => {

        setTimeout(() => {

            if (!gameRunning) return;

            createObstacle(
                item.type
            );

        }, item.delay);
    });


    /*
        Espaço entre padrões.
    */

    obstacleTimer =
        Math.max(
            1500,
            2600 -
            difficulty * 250
        );
};


// ======================================================
// MOVIMENTO DOS OBSTÁCULOS
// ======================================================

const updateObstacles = (deltaTime) => {

    if (!gameRunning) return;


    /*
        A velocidade aumenta lentamente
        conforme a dificuldade.
    */

    const obstacleSpeed =
        5.5 +
        difficulty * 0.8;


    obstacles.forEach((obstacle) => {

        obstacle.x -=
            obstacleSpeed *
            deltaTime;


        obstacle.element.style.left =
            `${obstacle.x}px`;
    });


    /*
        Remove obstáculos que saíram
        da tela.
    */

    obstacles =
        obstacles.filter((obstacle) => {

            if (
                obstacle.x +
                obstacle.width <
                -100
            ) {

                obstacle.element.remove();

                return false;
            }

            return true;
        });
};


// ======================================================
// COLISÃO AABB
// ======================================================

const rectanglesCollide = (
    a,
    b
) => {

    return (

        a.x <
        b.x + b.width &&

        a.x + a.width >
        b.x &&

        a.y <
        b.y + b.height &&

        a.y + a.height >
        b.y
    );
};


// ======================================================
// DETECTAR COLISÃO
// ======================================================

const checkObstacleCollisions = () => {

    if (!gameRunning) return;


    const playerBox =
        getPlayerHitbox();


    for (
        const obstacle
        of obstacles
    ) {

        const obstacleBox = {

            x: obstacle.x,

            y: 0,

            width:
                obstacle.width,

            height:
                obstacle.height
        };


        if (
            rectanglesCollide(
                playerBox,
                obstacleBox
            )
        ) {

            gameOver();

            return;
        }
    }
};


// ======================================================
// TEMPO DE SOBREVIVÊNCIA
// ======================================================

let survivalTime = 0;


// ======================================================
// ANIMAÇÃO DO PERSONAGEM
// ======================================================

let walkTimer = 0;

const updatePlayerAnimation = () => {

    if (!gameRunning) return;


    // agachado

    if (isCrouching) {

        setFrame(1, 2);

        return;
    }


    // no ar

    if (!isGrounded) {

        if (velocityY > 5) {

            // início do salto

            setFrame(0, 1);

        } else if (
            velocityY > -5
        ) {

            // topo

            setFrame(1, 1);

        } else {

            // queda

            setFrame(2, 1);
        }

        return;
    }


    // andando

    if (
        Math.abs(velocityX)
        > 0.5
    ) {

        walkTimer++;


        if (walkTimer >= 8) {

            walkTimer = 0;

            currentFrame++;


            if (
                currentFrame > 3
            ) {

                currentFrame = 0;
            }


            setFrame(
                currentFrame,
                0
            );
        }

    } else {

        currentFrame = 0;

        setFrame(0, 0);
    }
};


// ======================================================
// GAME OVER
// ======================================================

const gameOver = () => {

    if (!gameRunning) return;


    gameRunning = false;


    velocityX = 0;
    velocityY = 0;


    /*
        Frame 12 =
        coluna 4 / linha 3
    */

    setFrame(3, 2);


    gameOverScreen.style.visibility =
        'visible';
};


// ======================================================
// REINICIAR
// ======================================================

const restart = () => {

    gameRunning = true;


    isGrounded = true;

    isCrouching = false;


    velocityX = 0;
    velocityY = 0;


    playerX = 100;
    playerY = 0;


    survivalTime = 0;

    difficulty = 1;


    obstacleTimer = 1000;


    keys.left = false;
    keys.right = false;
    keys.down = false;


    player.classList.remove(
        'crouching'
    );


    player.style.transform =
        '';


    player.style.left =
        `${playerX}px`;


    player.style.bottom =
        `${playerY}px`;


    setFrame(0, 0);


    /*
        Limpa todos os obstáculos.
    */

    obstacles.forEach(
        (obstacle) => {
            obstacle.element.remove();
        }
    );


    obstacles = [];


    gameOverScreen.style.visibility =
        'hidden';
};


// ======================================================
// TECLAS PRESSIONADAS
// ======================================================

document.addEventListener(
    'keydown',
    (event) => {

        if (!gameRunning) {

            if (
                event.code ===
                'Enter'
            ) {

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
    }
);


// ======================================================
// TECLAS SOLTAS
// ======================================================

document.addEventListener(
    'keyup',
    (event) => {

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
    }
);


// ======================================================
// BOTÃO REINICIAR
// ======================================================

restartButton.addEventListener(
    'click',
    restart
);


// ======================================================
// LOOP PRINCIPAL
// ======================================================

let lastTime =
    performance.now();


const gameLoop = (
    currentTime
) => {

    const delta =
        Math.min(
            32,
            currentTime -
            lastTime
        );


    lastTime =
        currentTime;


    const deltaTime =
        delta / 16.67;


    if (gameRunning) {

        survivalTime += delta;


        /*
            Controle do jogador
        */

        updateCrouch();

        updateHorizontalMovement();

        updateVerticalMovement();

        updatePlayerPosition();


        /*
            Obstáculos
        */

        obstacleTimer -= delta;


        if (
            obstacleTimer <= 0
        ) {

            spawnPattern();
        }


        updateObstacles(
            deltaTime
        );


        /*
            Animação
        */

        updatePlayerAnimation();


        /*
            Colisão
        */

        checkObstacleCollisions();
    }


    requestAnimationFrame(
        gameLoop
    );
};


// ======================================================
// INICIALIZAÇÃO
// ======================================================

setFrame(0, 0);

obstacleTimer = 1000;

requestAnimationFrame(
    gameLoop
);
