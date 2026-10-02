const player = document.querySelector('.player');
const gameBoard = document.querySelector('.game-board');

const gameOverScreen = document.querySelector('.game-over');
const restartButton = document.querySelector('.restart');


// ======================================================
// CONFIGURAÇÕES DO MUNDO
// ======================================================

const WORLD_WIDTH = 6000;

const PLAYER_WIDTH = 128;
const PLAYER_HEIGHT = 128;


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
// ESTADO DO JOGO
// ======================================================

let gameRunning = true;

let isGrounded = true;
let isCrouching = false;

let velocityX = 0;
let velocityY = 0;


// ======================================================
// POSIÇÃO NO MUNDO
// ======================================================

let playerX = 200;
let playerY = 0;


// ======================================================
// CÂMERA
// ======================================================

let cameraX = 0;

const CAMERA_OFFSET = 300;

const CAMERA_SMOOTHING = 0.12;


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
let walkTimer = 0;

const setFrame = (column, row) => {

    player.style.backgroundPosition =
        `-${column * 128}px -${row * 128}px`;
};


// ======================================================
// HITBOX
// ======================================================

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
// FASE
// ======================================================

const levelObjects = [

    // ------------------------------------
    // PRIMEIRO OBSTÁCULO
    // ------------------------------------

    {
        x: 700,
        width: 70,
        height: 100,
        type: 'high'
    },


    // ------------------------------------
    // OBSTÁCULO BAIXO
    // ------------------------------------

    {
        x: 1100,
        width: 120,
        height: 55,
        type: 'low'
    },


    // ------------------------------------
    // OUTRO SALTO
    // ------------------------------------

    {
        x: 1550,
        width: 70,
        height: 110,
        type: 'high'
    },


    // ------------------------------------
    // COMBINAÇÃO
    // ------------------------------------

    {
        x: 1900,
        width: 70,
        height: 95,
        type: 'high'
    },

    {
        x: 2200,
        width: 120,
        height: 55,
        type: 'low'
    },


    // ------------------------------------
    // OBSTÁCULO LONGO
    // ------------------------------------

    {
        x: 2700,
        width: 160,
        height: 48,
        type: 'long'
    },


    // ------------------------------------
    // SEQUÊNCIA
    // ------------------------------------

    {
        x: 3150,
        width: 70,
        height: 105,
        type: 'high'
    },

    {
        x: 3450,
        width: 120,
        height: 55,
        type: 'low'
    },

    {
        x: 3800,
        width: 70,
        height: 115,
        type: 'high'
    },


    // ------------------------------------
    // TRECHO FINAL
    // ------------------------------------

    {
        x: 4300,
        width: 150,
        height: 50,
        type: 'long'
    },

    {
        x: 4700,
        width: 70,
        height: 115,
        type: 'high'
    }
];


// ======================================================
// RENDERIZAÇÃO DOS OBJETOS DA FASE
// ======================================================

const obstacleElements = [];

const createLevelObjects = () => {

    levelObjects.forEach((object) => {

        const element =
            document.createElement('div');

        element.classList.add(
            'obstacle',
            object.type
        );

        element.style.position =
            'absolute';

        element.style.left =
            `${object.x}px`;

        element.style.bottom =
            '0px';

        element.style.width =
            `${object.width}px`;

        element.style.height =
            `${object.height}px`;

        element.style.animation =
            'none';

        gameBoard.appendChild(
            element
        );

        obstacleElements.push({
            data: object,
            element: element
        });
    });
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


    // Atrito

    if (!keys.left && !keys.right) {

        if (isGrounded) {
            velocityX *= GROUND_FRICTION;
        } else {
            velocityX *= AIR_FRICTION;
        }
    }


    playerX += velocityX;


    // Limites do mundo

    if (playerX < 0) {

        playerX = 0;
        velocityX = 0;
    }


    if (
        playerX + PLAYER_WIDTH >
        WORLD_WIDTH
    ) {

        playerX =
            WORLD_WIDTH -
            PLAYER_WIDTH;

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


    if (
        keys.down &&
        isGrounded
    ) {

        if (!isCrouching) {

            isCrouching = true;

            player.classList.add(
                'crouching'
            );

            // Frame 10 da sprite atual
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
// CÂMERA
// ======================================================

const updateCamera = () => {

    if (!gameRunning) return;


    /*
        A câmera tenta manter o personagem
        aproximadamente 300px à esquerda
        do centro da tela.
    */

    const targetCameraX =
        playerX -
        CAMERA_OFFSET;


    cameraX +=
        (
            targetCameraX -
            cameraX
        ) *
        CAMERA_SMOOTHING;


    // Não mostrar fora do começo do mundo

    if (cameraX < 0) {
        cameraX = 0;
    }


    // Não mostrar além do final

    const visibleWidth =
        gameBoard.clientWidth;


    const maxCameraX =
        WORLD_WIDTH -
        visibleWidth;


    if (
        cameraX >
        maxCameraX
    ) {

        cameraX =
            maxCameraX;
    }


    /*
        O personagem é desenhado
        na posição relativa à câmera.
    */

    const screenX =
        playerX -
        cameraX;


    player.style.left =
        `${screenX}px`;


    player.style.bottom =
        `${playerY}px`;


    /*
        Os obstáculos também pertencem
        ao mundo, então precisam acompanhar
        a câmera.
    */

    obstacleElements.forEach(
        (object) => {

            const screenObjectX =
                object.data.x -
                cameraX;


            object.element.style.left =
                `${screenObjectX}px`;
        }
    );
};


// ======================================================
// ANIMAÇÃO DO PERSONAGEM
// ======================================================

const updatePlayerAnimation = () => {

    if (!gameRunning) return;


    // AGACHADO

    if (isCrouching) {

        setFrame(1, 2);

        return;
    }


    // NO AR

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


    // ANDANDO

    if (
        Math.abs(velocityX) >
        0.5
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
// COLISÃO
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


const checkCollisions = () => {

    if (!gameRunning) return;


    const playerBox =
        getPlayerHitbox();


    for (
        const object
        of obstacleElements
    ) {

        const obstacleBox = {

            x: object.data.x,

            y: 0,

            width:
                object.data.width,

            height:
                object.data.height
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
// GAME OVER
// ======================================================

const gameOver = () => {

    if (!gameRunning) return;


    gameRunning = false;


    velocityX = 0;
    velocityY = 0;


    // Frame 12 = derrotado

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


    playerX = 200;
    playerY = 0;


    cameraX = 0;


    keys.left = false;
    keys.right = false;
    keys.down = false;


    currentFrame = 0;
    walkTimer = 0;


    player.classList.remove(
        'crouching'
    );


    setFrame(0, 0);


    gameOverScreen.style.visibility =
        'hidden';


    updateCamera();
};


// ======================================================
// CONTROLES
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


    if (gameRunning) {

        /*
            Movimento do personagem
        */

        updateCrouch();

        updateHorizontalMovement();

        updateVerticalMovement();


        /*
            Câmera
        */

        updateCamera();


        /*
            Colisão
        */

        checkCollisions();


        /*
            Sprite
        */

        updatePlayerAnimation();
    }


    requestAnimationFrame(
        gameLoop
    );
};


// ======================================================
// INICIALIZAÇÃO
// ======================================================

createLevelObjects();

setFrame(0, 0);

updateCamera();

requestAnimationFrame(
    gameLoop
);
