const $ = (selector) => document.querySelector(selector);

const screens = [
    '#main-menu',
    '#how-to-play',
    '#settings',
    '#credits',
    '#map-screen',
    '#gate-transition',
    '#reward-screen',
    '#game-screen'
];

const world = $('#world');
const player = $('#player');


// =====================================================
// CARTAS — SISTEMA ROGUELIKE
// =====================================================

const cards = [

    // COMUNS
    {
        name: 'Carteirinha de Estudante',
        text: '+15% de velocidade.',
        icon: '➜',
        tier: 'common',
        type: 'buff',
        speed: 0.15
    },

    {
        name: 'Tênis de Educação Física',
        text: '+20% de força no pulo.',
        icon: '↟',
        tier: 'common',
        type: 'buff',
        jump: 3
    },

    {
        name: 'Lanche Reforçado',
        text: '+1 coração.',
        icon: '♥',
        tier: 'common',
        type: 'buff',
        shield: 1
    },

    {
        name: 'Mesada',
        text: '+30% de sementes coletadas.',
        icon: '✦',
        tier: 'common',
        type: 'buff',
        seedMultiplier: 1.3
    },

    {
        name: 'Caderno Completo',
        text: '+25% de experiência.',
        icon: '▤',
        tier: 'common',
        type: 'buff',
        xpMultiplier: 1.25
    },

    {
        name: 'Mochila Resistente',
        text: 'Reduz o dano recebido.',
        icon: '▣',
        tier: 'common',
        type: 'buff',
        shield: 1
    },

    {
        name: 'Dia de Sorte',
        text: 'Maior chance de encontrar bônus.',
        icon: '★',
        tier: 'common',
        type: 'buff',
        luck: 0.2
    },

    {
        name: 'Caneta Azul',
        text: '+15% de precisão nos disparos.',
        icon: '➹',
        tier: 'common',
        type: 'buff',
        shotSpeed: 1.5
    },

    {
        name: 'Recreio',
        text: 'Recupera energia em checkpoints.',
        icon: '☀',
        tier: 'common',
        type: 'buff',
        heal: 1
    },

    {
        name: 'Estojo Completo',
        text: '+2 espaços de inventário.',
        icon: '▭',
        tier: 'common',
        type: 'buff',
        inventory: 2
    },


    // DEBUFFS
    {
        name: 'Atraso na Entrada',
        text: '-15% de velocidade.',
        icon: '◌',
        tier: 'common',
        type: 'debuff',
        speed: -0.15
    },

    {
        name: 'Sono na Aula',
        text: '-20% de força no pulo.',
        icon: 'Z',
        tier: 'common',
        type: 'debuff',
        jump: -3
    },

    {
        name: 'Prova Surpresa',
        text: 'Menor chance de encontrar bônus.',
        icon: '!',
        tier: 'common',
        type: 'debuff',
        luck: -0.25
    },

    {
        name: 'Mochila Pesada',
        text: 'Você recebe mais dano.',
        icon: '⬇',
        tier: 'common',
        type: 'debuff',
        damage: 0.2
    },

    {
        name: 'Esqueci o Trabalho',
        text: 'Menos sementes e inimigos mais rápidos.',
        icon: '✕',
        tier: 'common',
        type: 'debuff',
        speed: -0.1,
        seedMultiplier: 0.5,
        enemySpeed: 0.2
    },


    // SUPER RAROS
    {
        name: 'Aluno Destaque',
        text: '+30% velocidade, +20% pulo e +1 coração.',
        icon: '🏆',
        tier: 'rare',
        type: 'rare',
        speed: 0.3,
        jump: 3,
        shield: 1
    },

    {
        name: 'Dia dos Prêmios',
        text: 'Recupere energia após derrotar inimigos.',
        icon: '🎁',
        tier: 'rare',
        type: 'rare',
        healOnEnemy: true
    },

    {
        name: 'Passe Livre da Escola',
        text: 'Revela segredos e caminhos especiais.',
        icon: '🔑',
        tier: 'rare',
        type: 'rare',
        reveal: true
    },


    // LENDÁRIAS
    {
        name: 'Aluno Nota 10',
        text: '+50% velocidade, +50% pulo, +2 corações e resistência.',
        icon: '♛',
        tier: 'legendary',
        type: 'legendary',
        speed: 0.5,
        jump: 7,
        shield: 2,
        damageReduction: 0.3
    },

    {
        name: 'Formatura',
        text: 'Dobra sementes e XP e sobrevive a um dano fatal.',
        icon: '♕',
        tier: 'legendary',
        type: 'legendary',
        speed: 0.1,
        shield: 3,
        seedMultiplier: 2,
        xpMultiplier: 2,
        revive: true
    }

];


// =====================================================
// ESTADO DO JOGO
// =====================================================

let gameRunning = false;
let animationId;

let playerX = 110;
let playerY = 0;

let velocityX = 0;
let velocityY = 0;

let score = 0;
let shots = 0;

let objects = [];
let projectiles = [];

let keys = {
    left: false,
    right: false
};


// =====================================================
// PODER ATIVO
// =====================================================

let activeCard = null;

let rerolls = 1;

let jumpForce = 16;
let speedFactor = 1;

let shield = 0;

let shotCost = 0;
let shotSpeed = 10;

let pierce = false;

let seedMultiplier = 1;
let xpMultiplier = 1;

let enemySpeed = 0;
let canReveal = false;
let canRevive = false;


// =====================================================
// FÍSICA
// =====================================================

const GRAVITY = 0.78;

const PLAYER_W = 75;

const GROUND = 11.5;


// =====================================================
// SISTEMA DE TELAS
// =====================================================

function show(id) {

    screens.forEach((screen) => {

        const element = $(screen);

        if (element) {
            element.classList.remove('is-active');
        }

    });

    const target = $(id);

    if (target) {
        target.classList.add('is-active');
    }

}


// =====================================================
// MENU
// =====================================================

function showMenu() {

    stopGame();

    show('#main-menu');

}


// =====================================================
// BOTÕES QUE FECHAM JANELAS
// =====================================================

document
    .querySelectorAll('[data-close]')
    .forEach((button) => {

        button.addEventListener('click', () => {

            showMenu();

        });

    });


// =====================================================
// BOTÕES DO MENU
// =====================================================

$('#play-button').addEventListener(
    'click',
    () => show('#map-screen')
);

$('#how-to-play-button').addEventListener(
    'click',
    () => show('#how-to-play')
);

$('#settings-button').addEventListener(
    'click',
    () => show('#settings')
);

$('#credits-button').addEventListener(
    'click',
    () => show('#credits')
);

$('#map-back').addEventListener(
    'click',
    showMenu
);


// =====================================================
// CONFIGURAÇÕES
// =====================================================

$('#motion-toggle').addEventListener(
    'change',
    (event) => {

        document.body.classList.toggle(
            'motion-reduced',
            event.target.checked
        );

    }
);


// =====================================================
// ENTRAR NA SECRETARIA
// =====================================================

$('#school-location').addEventListener(
    'click',
    startTransition
);


// =====================================================
// TRANSIÇÃO DO PORTÃO
// =====================================================

function startTransition() {

    show('#gate-transition');

    requestAnimationFrame(() => {

        $('#gate-transition').classList.add('open');

    });

    setTimeout(() => {

        $('#gate-transition').classList.remove('open');

        openCardDraft();

    }, 2400);

}


// =====================================================
// SORTEIO DAS CARTAS
// =====================================================

function drawCards() {

    return [...cards]
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

}


// =====================================================
// MOSTRAR CARTAS
// =====================================================

function renderDraft() {

    const holder = $('#reward-cards');

    holder.innerHTML = '';


    drawCards().forEach((card, index) => {

        const button =
            document.createElement('button');

        button.className =
            `reward-card ${card.tier} ${card.type}`;

        button.style.animationDelay =
            `${index * 90}ms`;


        let rarityLabel = 'BENÇÃO';

        if (card.tier === 'legendary') {
            rarityLabel = 'LENDÁRIA';
        }

        else if (card.tier === 'rare') {
            rarityLabel = 'RARA';
        }

        else if (card.type === 'debuff') {
            rarityLabel = 'DESAFIO';
        }


        button.innerHTML = `

            <span>
                ${card.icon}
            </span>

            <em>
                ${rarityLabel}
            </em>

            <b>
                ${card.name}
            </b>

            <small>
                ${card.text}
            </small>

        `;


        button.addEventListener(
            'click',
            () => chooseCard(card, button)
        );


        holder.append(button);

    });


    $('#reroll-count').textContent =
        rerolls;


    $('#reroll-button').disabled =
        rerolls === 0;

}


// =====================================================
// ABRIR BARALHO
// =====================================================

function openCardDraft() {

    rerolls = 1;

    renderDraft();

    show('#reward-screen');

}


// =====================================================
// ESCOLHER CARTA
// =====================================================

function chooseCard(card, button) {

    document
        .querySelectorAll('.reward-card')
        .forEach((item) => {

            item.disabled = true;

        });


    button.classList.add('is-picked');

    activeCard = card;


    $('#activation-symbol').textContent =
        card.icon;

    $('#activation-name').textContent =
        card.name.toUpperCase();

    $('#activation-description').textContent =
        card.text;


    setTimeout(
        startGame,
        650
    );

}


// =====================================================
// NOVAS CARTAS
// =====================================================

$('#reroll-button').addEventListener(
    'click',
    () => {

        if (!rerolls) {
            return;
        }

        rerolls--;

        renderDraft();

    }
);


// =====================================================
// CRIAR OBJETOS
// =====================================================

function createObject(
    kind,
    x,
    y = 0
) {

    const element =
        document.createElement('div');


    element.className =
        kind;


    element.style.left =
        `${x}px`;


    element.style.bottom =
        `calc(${GROUND}% + ${y}px)`;


    world.append(element);


    return {

        el: element,

        x,

        y,

        kind,

        collected: false,

        w: 30,

        h: 30

    };

}


// =====================================================
// CONSTRUIR FASE
// =====================================================

function buildLevel() {

    [
        ...objects,
        ...projectiles
    ]
        .forEach((object) => {

            if (object.el) {
                object.el.remove();
            }

        });


    objects = [];

    projectiles = [];


    // OBSTÁCULOS

    [

        [500, 70, 86],

        [860, 90, 110],

        [1260, 65, 95],

        [1640, 105, 75],

        [2020, 72, 115],

        [2380, 112, 90]

    ]
        .forEach(
            ([x, width, height]) => {

                const item =
                    createObject(
                        'obstacle',
                        x
                    );


                item.w = width;

                item.h = height;


                item.el.style.width =
                    `${width}px`;

                item.el.style.height =
                    `${height}px`;


                objects.push(item);

            }
        );


    // SEMENTES

    [

        350,

        680,

        780,

        1100,

        1420,

        1510,

        1840,

        2200

    ]
        .forEach(
            (x, index) => {

                const item =
                    createObject(
                        'seed',
                        x,
                        index % 3 === 0
                            ? 62
                            : 20
                    );


                item.w = 22;

                item.h = 22;


                objects.push(item);

            }
        );

}


// =====================================================
// APLICAR CARTA
// =====================================================

function applyCard() {

    jumpForce =
        16 + (activeCard.jump || 0);


    speedFactor =
        1 + (activeCard.speed || 0);


    shield =
        activeCard.shield || 0;


    shotCost =
        activeCard.shotCost || 0;


    shotSpeed =
        10 + (activeCard.shotSpeed || 0);


    pierce =
        Boolean(activeCard.pierce);


    seedMultiplier =
        activeCard.seedMultiplier || 1;


    xpMultiplier =
        activeCard.xpMultiplier || 1;


    enemySpeed =
        activeCard.enemySpeed || 0;


    canReveal =
        Boolean(activeCard.reveal);


    canRevive =
        Boolean(activeCard.revive);


    score =
        Math.max(
            0,
            activeCard.seeds || 0
        );


    document.body.classList.toggle(
        'foggy',
        Boolean(activeCard.fog)
    );

}


// =====================================================
// INICIAR JOGO
// =====================================================

function startGame() {

    show('#game-screen');


    $('#power-activation')
        .classList.add('show');


    $('#game-over')
        .classList.remove('show');


    $('#level-complete')
        .classList.remove('show');


    playerX = 110;

    playerY = 0;


    velocityX = 0;

    velocityY = 0;


    shots = 0;


    keys.left = false;

    keys.right = false;


    applyCard();

    buildLevel();


    $('#hud-power').textContent =
        activeCard.name.toUpperCase();


    $('#hud-score').textContent =
        `✦ ${String(score).padStart(3, '0')}`;


    $('#hud-shots').textContent =
        '➹ 0';


    gameRunning = true;


    cancelAnimationFrame(
        animationId
    );


    loop();


    setTimeout(() => {

        $('#power-activation')
            .classList.remove('show');

    }, 1350);

}


// =====================================================
// PARAR JOGO
// =====================================================

function stopGame() {

    gameRunning = false;


    cancelAnimationFrame(
        animationId
    );


    document.body.classList.remove(
        'foggy'
    );

}


// =====================================================
// PULO
// =====================================================

function jump() {

    if (!gameRunning) {
        return;
    }


    if (playerY >= 1) {
        return;
    }


    velocityY =
        jumpForce;

}


// =====================================================
// DISPARO
// =====================================================

function shoot() {

    if (!gameRunning) {
        return;
    }


    if (
        shotCost &&
        score < shotCost
    ) {
        return;
    }


    if (shotCost) {
        score -= shotCost;
    }


    const projectile =
        createObject(
            'projectile',
            playerX + 80,
            playerY + 43
        );


    projectile.w = 25;

    projectile.h = 10;

    projectile.v = shotSpeed;


    projectiles.push(
        projectile
    );


    shots++;


    $('#hud-shots').textContent =
        `➹ ${shots}`;


    $('#hud-score').textContent =
        `✦ ${String(score).padStart(3, '0')}`;

}


// =====================================================
// COLISÃO
// =====================================================

function collide(a, b) {

    return (

        a.x <
            b.x + b.w &&

        a.x + PLAYER_W >
            b.x &&

        a.y <
            b.y + b.h &&

        a.y + 92 >
            b.y

    );

}


// =====================================================
// LOOP PRINCIPAL
// =====================================================

function loop() {

    if (!gameRunning) {
        return;
    }


    // MOVIMENTO

    const direction =
        (keys.right ? 1 : 0) -
        (keys.left ? 1 : 0);


    velocityX +=
        direction *
        0.55 *
        speedFactor;


    velocityX *= 0.8;


    velocityX =
        Math.max(
            -5,
            Math.min(
                5,
                velocityX
            )
        );


    playerX =
        Math.max(
            20,
            playerX + velocityX
        );


    // GRAVIDADE

    velocityY -=
        GRAVITY;


    playerY +=
        velocityY;


    if (playerY <= 0) {

        playerY = 0;

        velocityY = 0;

    }


    // CÂMERA

    const camera =
        Math.max(
            0,
            playerX - 230
        );


    player.style.left =
        `${Math.max(
            50,
            playerX - camera
        )}px`;


    player.style.bottom =
        `calc(
            ${GROUND}% +
            ${playerY}px
        )`;


    // ANIMAÇÃO BÁSICA

    player.style.backgroundPosition =
        `-${
            Math.abs(velocityX) > 0.7
                ? 128
                : 0
        }px ${
            playerY > 2
                ? -128
                : 0
        }px`;


    // OBJETOS

    objects.forEach(
        (item) => {

            item.el.style.left =
                `${item.x - camera}px`;


            // SEMENTES

            if (

                item.kind === 'seed' &&

                !item.collected &&

                collide(

                    {
                        x: playerX,
                        y: playerY
                    },

                    {
                        x: item.x,
                        y: item.y,
                        w: item.w,
                        h: item.h
                    }

                )

            ) {

                item.collected = true;

                item.el.style.display =
                    'none';


                score +=
                    Math.round(
                        10 *
                        seedMultiplier
                    );


                $('#hud-score').textContent =
                    `✦ ${String(
                        score
                    ).padStart(3, '0')}`;

            }


            // OBSTÁCULOS

            if (

                item.kind === 'obstacle' &&

                collide(

                    {
                        x: playerX,
                        y: playerY
                    },

                    {
                        x: item.x,
                        y: 0,
                        w: item.w,
                        h: item.h
                    }

                )

            ) {

                if (shield > 0) {

                    shield--;

                    item.el.remove();

                    item.collected = true;

                }

                else {

                    gameOver();

                }

            }

        }
    );


    // PROJÉTEIS

    projectiles.forEach(
        (shot) => {

            shot.x +=
                shot.v;


            shot.el.style.left =
                `${shot.x - camera}px`;


            objects.forEach(
                (item) => {

                    if (

                        item.kind === 'obstacle' &&

                        !item.collected &&

                        shot.x <
                            item.x + item.w &&

                        shot.x + shot.w >
                            item.x

                    ) {

                        item.collected = true;

                        item.el.remove();


                        score +=
                            Math.round(
                                15 *
                                xpMultiplier
                            );


                        $('#hud-score').textContent =
                            `✦ ${String(
                                score
                            ).padStart(3, '0')}`;


                        if (!pierce) {

                            shot.x = 99999;

                        }

                    }

                }
            );


            if (
                shot.x >
                playerX + 700
            ) {

                shot.el.remove();

            }

        }
    );


    // CHEGADA

    if (playerX > 2700) {

        completeLevel();

    }


    animationId =
        requestAnimationFrame(
            loop
        );

}


// =====================================================
// GAME OVER
// =====================================================

function gameOver() {

    if (!gameRunning) {
        return;
    }


    if (canRevive) {

        canRevive = false;

        shield = 1;

        return;

    }


    stopGame();


    $('#game-over')
        .classList.add('show');

}


// =====================================================
// FASE CONCLUÍDA
// =====================================================

function completeLevel() {

    if (!gameRunning) {
        return;
    }


    stopGame();


    $('#level-complete')
        .classList.add('show');

}


// =====================================================
// REINICIAR
// =====================================================

$('#restart-button').addEventListener(
    'click',
    startGame
);


// =====================================================
// VOLTAR AO MAPA
// =====================================================

$('#game-menu-button').addEventListener(
    'click',
    () => {

        stopGame();

        show('#map-screen');

    }
);


// =====================================================
// VOLTAR AO MAPA APÓS COMPLETAR
// =====================================================

$('#complete-map-button').addEventListener(
    'click',
    () => {

        show('#map-screen');

    }
);


// =====================================================
// TECLADO
// =====================================================

document.addEventListener(
    'keydown',
    (event) => {

        // ESQUERDA

        if (
            event.code === 'ArrowLeft' ||
            event.code === 'KeyA'
        ) {

            keys.left = true;

            event.preventDefault();

        }


        // DIREITA

        if (
            event.code === 'ArrowRight' ||
            event.code === 'KeyD'
        ) {

            keys.right = true;

            event.preventDefault();

        }


        // PULO

        if (
            event.code === 'ArrowUp' ||
            event.code === 'KeyW' ||
            event.code === 'Space'
        ) {

            jump();

            event.preventDefault();

        }


        // ATAQUE

        if (
            event.code === 'KeyF'
        ) {

            shoot();

            event.preventDefault();

        }

    }
);


// =====================================================
// TECLAS SOLTAS
// =====================================================

document.addEventListener(
    'keyup',
    (event) => {

        if (
            event.code === 'ArrowLeft' ||
            event.code === 'KeyA'
        ) {

            keys.left = false;

        }


        if (
            event.code === 'ArrowRight' ||
            event.code === 'KeyD'
        ) {

            keys.right = false;

        }

    }
);


// =====================================================
// CONTROLES MOBILE
// =====================================================

document
    .querySelectorAll('[data-control]')
    .forEach((button) => {

        const control =
            button.dataset.control;


        button.addEventListener(
            'pointerdown',
            (event) => {

                event.preventDefault();


                if (control === 'jump') {

                    jump();

                }

                else if (
                    control === 'shoot'
                ) {

                    shoot();

                }

                else {

                    keys[control] = true;

                }

            }
        );


        button.addEventListener(
            'pointerup',
            () => {

                if (
                    control === 'left' ||
                    control === 'right'
                ) {

                    keys[control] = false;

                }

            }
        );


        button.addEventListener(
            'pointerleave',
            () => {

                if (
                    control === 'left' ||
                    control === 'right'
                ) {

                    keys[control] = false;

                }

            }
        );

    });
