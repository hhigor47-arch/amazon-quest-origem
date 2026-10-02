// ======================================================
// AMAZON QUEST: ORIGEM
// SCRIPT.JS
// ======================================================


// ======================================================
// TELAS DO JOGO
// ======================================================

const mainMenu = document.querySelector('#main-menu');
const howToPlayScreen = document.querySelector('#how-to-play');
const creditsScreen = document.querySelector('#credits');
const mapScreen = document.querySelector('#map-screen');
const gameScreen = document.querySelector('#game-screen');


// ======================================================
// BOTÕES DO MENU
// ======================================================

const playButton =
    document.querySelector('#play-button');

const howToPlayButton =
    document.querySelector('#how-to-play-button');

const creditsButton =
    document.querySelector('#credits-button');

const backFromHow =
    document.querySelector('#back-from-how');

const backFromCredits =
    document.querySelector('#back-from-credits');

const mapBack =
    document.querySelector('#map-back');

const secretariaButton =
    document.querySelector('#secretaria-button');

const gameMenuButton =
    document.querySelector('#game-menu-button');


// ======================================================
// ELEMENTOS DO GAMEPLAY
// ======================================================

const player =
    document.querySelector('.player');

const gameBoard =
    document.querySelector('.game-board');

const gameOverScreen =
    document.querySelector('.game-over');

const restartButton =
    document.querySelector('.restart');


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

let gameRunning = false;

let isGrounded = true;
let isCrouching = false;

let velocityX = 0;
let velocityY = 0;


// ======================================================
// POSIÇÃO DO JOGADOR NO MUNDO
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


const setFrame = (
    column,
    row
) => {

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
// OBJETOS DA FASE
// ======================================================

const levelObjects = [

    {
        x: 700,
        width: 70,
        height: 100,
        type: 'high'
    },

    {
        x: 1100,
        width: 120,
        height: 55,
        type: 'low'
    },

    {
        x: 1550,
        width: 70,
        height: 110,
        type: 'high'
    },

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

    {
        x: 2700,
        width: 160,
        height: 48,
        type: 'long'
    },

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
// ELEMENTOS DOS OBSTÁCULOS
// ======================================================

const obstacleElements = [];


// ======================================================
// CRIAR OBJETOS DA FASE
// ======================================================

const createLevelObjects = () => {

    levelObjects.forEach(
        (object) => {

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

        }
    );
};


// ======================================================
// ABRIR TELAS
// ======================================================

const hideAllScreens = () => {

    mainMenu.style.display = 'none';

    howToPlayScreen.style.display = 'none';

    creditsScreen.style.display = 'none';

    mapScreen.style.display = 'none';

    gameScreen.style.display = 'none';

};


// ======================================================
// MENU PRINCIPAL
// ======================================================

const showMainMenu = () => {

    gameRunning = false;

    hideAllScreens();

    mainMenu.style.display = 'flex';

    gameOverScreen.style.visibility =
        'hidden';

};


// ======================================================
// COMO JOGAR
// ======================================================

const showHowToPlay = () => {

    gameRunning = false;

    hideAllScreens();

    howToPlayScreen.style.display =
        'flex';
};


// ======================================================
// CRÉDITOS
// ======================================================

const showCredits = () => {

    gameRunning = false;

    hideAllScreens();

    creditsScreen.style.display =
        'flex';
};


// ======================================================
// MAPA
// ======================================================

const showMap = () => {

    gameRunning = false;

    hideAllScreens();

    mapScreen.style.display =
        'block';
};


// ======================================================
// INICIAR FASE
// ======================================================

const startGame = () => {

    hideAllScreens();

    gameScreen.style.display =
        'block';

    resetGame();

    gameRunning = true;

    updateCamera();

};


// ======================================================
// PULO
// ======================================================

const jump = () => {

    if (!gameRunning) return;

    if (!isGrounded) return;

    if (isCrouching) return;


    velocityY =
        JUMP_FORCE;


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


    if (velocityX > MAX_SPEED) {

        velocityX =
            MAX_SPEED;

    }


    if (velocityX < -MAX_SPEED) {

        velocityX =
            -MAX_SPEED;

    }


    if (
        !keys.left &&
        !keys.right
    ) {

        if (isGrounded) {

            velocityX *=
                GROUND_FRICTION;

        } else {

            velocityX *=
                AIR_FRICTION;

        }

    }


    playerX += velocityX;


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


    const targetCameraX =
        playerX -
        CAMERA_OFFSET;


    cameraX +=
        (
            targetCameraX -
            cameraX
        ) *
        CAMERA_SMOOTHING;


    if (cameraX < 0) {

        cameraX = 0;

    }


    const visibleWidth =
        gameBoard.clientWidth;


    const maxCameraX =
        Math.max(
            0,
            WORLD_WIDTH -
            visibleWidth
        );


    if (
        cameraX >
        maxCameraX
    ) {

        cameraX =
            maxCameraX;

    }


    const screenX =
        playerX -
        cameraX;


    player.style.left =
        `${screenX}px`;


    player.style.bottom =
        `${playerY}px`;


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


    if (isCrouching) {

        setFrame(1, 2);

        return;

    }


    if (!isGrounded) {

        if (velocityY > 5) {

            setFrame(0, 1);

        }

        else if (
            velocityY > -5
        ) {

            setFrame(1, 1);

        }

        else {

            setFrame(2, 1);

        }

        return;

    }


    if (
        Math.abs(velocityX) >
        0.5
    ) {

        walkTimer++;


        if (
            walkTimer >= 8
        ) {

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


    setFrame(3, 2);


    gameOverScreen.style.visibility =
        'visible';

};


// ======================================================
// RESETAR JOGO
// ======================================================

const resetGame = () => {

    gameRunning = false;


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
// REINICIAR
// ======================================================

const restart = () => {

    resetGame();

    gameRunning = true;

    updateCamera();

};


// ======================================================
// CONTROLES DE TECLADO
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
// BOTÕES DO MENU
// ======================================================

playButton.addEventListener(
    'click',
    showMap
);


howToPlayButton.addEventListener(
    'click',
    showHowToPlay
);


creditsButton.addEventListener(
    'click',
    showCredits
);


// ======================================================
// VOLTAR
// ======================================================

backFromHow.addEventListener(
    'click',
    showMainMenu
);


backFromCredits.addEventListener(
    'click',
    showMainMenu
);


mapBack.addEventListener(
    'click',
    showMainMenu
);


// ======================================================
// ENTRAR NA SECRETARIA
// ======================================================

secretariaButton.addEventListener(
    'click',
    startGame
);


// ======================================================
// MENU DURANTE GAME OVER
// ======================================================

gameMenuButton.addEventListener(
    'click',
    showMainMenu
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

const gameLoop = () => {

    if (gameRunning) {

        updateCrouch();

        updateHorizontalMovement();

        updateVerticalMovement();

        updateCamera();

        checkCollisions();

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

showMainMenu();

requestAnimationFrame(
    gameLoop
);
