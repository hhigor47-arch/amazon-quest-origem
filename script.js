const $ = (selector) => document.querySelector(selector);
const screens = ['#main-menu', '#how-to-play', '#settings', '#credits', '#map-screen', '#gate-transition', '#reward-screen', '#game-screen'];
const world = $('#world');
const player = $('#player');

const cards = [
  { name: 'Pulo da Onça', text: 'Pule bem mais alto.', icon: '↟', tier: 'common', type: 'buff', jump: 4 },
  { name: 'Sementes Extras', text: 'Comece com 50 sementes.', icon: '✦', tier: 'common', type: 'buff', seeds: 50 },
  { name: 'Passo Ágil', text: 'Corra mais rápido.', icon: '➜', tier: 'common', type: 'buff', speed: .25 },
  { name: 'Coração Verde', text: 'Ignore um obstáculo.', icon: '♥', tier: 'common', type: 'buff', shield: 1 },
  { name: 'Mira de Arara', text: 'Tiros mais velozes.', icon: '➹', tier: 'common', type: 'buff', shotSpeed: 3 },
  { name: 'Raiz Pesada', text: 'Seus passos ficam lentos.', icon: '⌇', tier: 'common', type: 'debuff', speed: -.28 },
  { name: 'Névoa do Rio', text: 'Visão reduzida na trilha.', icon: '≈', tier: 'common', type: 'debuff', fog: true },
  { name: 'Vento Contrário', text: 'Pulo menos potente.', icon: '≋', tier: 'common', type: 'debuff', jump: -3 },
  { name: 'Bolsa Furada', text: 'Perde 20 sementes.', icon: '◌', tier: 'common', type: 'debuff', seeds: -20 },
  { name: 'Eco da Mata', text: 'Cada tiro custa 5 sementes.', icon: '◒', tier: 'common', type: 'debuff', shotCost: 5 },
  { name: 'Canto do Uirapuru', text: 'Tiro musical atravessa troncos.', icon: '♫', tier: 'rare', type: 'rare', pierce: true },
  { name: 'Bênção do Rio', text: 'Escudo e 30 sementes.', icon: '☼', tier: 'rare', type: 'rare', shield: 1, seeds: 30 },
  { name: 'Olhos da Coruja', text: 'Revela sementes escondidas.', icon: '◉', tier: 'rare', type: 'rare', seeds: 80 },
  { name: 'Salto do Boto', text: 'Pulo alto e corrida ágil.', icon: '⌁', tier: 'rare', type: 'rare', jump: 3, speed: .15 },
  { name: 'Flecha Envenenada', text: 'Tiro elimina dois obstáculos.', icon: '➳', tier: 'rare', type: 'rare', pierce: true, shotSpeed: 2 },
  { name: 'Chuva Pesada', text: 'Desafio: corrida bem mais lenta.', icon: '☂', tier: 'rare', type: 'debuff', speed: -.45 },
  { name: 'Espinhos do Cipó', text: 'Desafio: pulo bem menor.', icon: '✕', tier: 'rare', type: 'debuff', jump: -5 },
  { name: 'Guardião da Floresta', text: 'Escudo total e 100 sementes.', icon: '♛', tier: 'legendary', type: 'legendary', shield: 2, seeds: 100 },
  { name: 'Trovão de Tupã', text: 'Tiros eletrizados destroem tudo.', icon: 'ϟ', tier: 'legendary', type: 'legendary', pierce: true, shotSpeed: 6 },
  { name: 'Coroa da Vitória', text: 'Super salto, corrida e tesouro.', icon: '♕', tier: 'legendary', type: 'legendary', jump: 6, speed: .35, seeds: 150 }
];
let gameRunning = false, animationId, playerX = 110, playerY = 0, velocityX = 0, velocityY = 0, score = 0, shots = 0, objects = [], projectiles = [], keys = { left: false, right: false };
let activeCard = null, rerolls = 1, jumpForce = 16, speedFactor = 1, shield = 0, shotCost = 0, shotSpeed = 10, pierce = false;
const GRAVITY = .78, PLAYER_W = 75, GROUND = 11.5;
function show(id) { screens.forEach((screen) => $(screen).classList.remove('is-active')); $(id).classList.add('is-active'); }
function showMenu() { stopGame(); show('#main-menu'); }
document.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', showMenu));
$('#play-button').addEventListener('click', () => show('#map-screen')); $('#how-to-play-button').addEventListener('click', () => show('#how-to-play')); $('#settings-button').addEventListener('click', () => show('#settings')); $('#credits-button').addEventListener('click', () => show('#credits')); $('#map-back').addEventListener('click', showMenu);
$('#motion-toggle').addEventListener('change', (event) => document.body.classList.toggle('motion-reduced', event.target.checked));
$('#school-location').addEventListener('click', startTransition);
function startTransition() { show('#gate-transition'); requestAnimationFrame(() => $('#gate-transition').classList.add('open')); setTimeout(() => { $('#gate-transition').classList.remove('open'); openCardDraft(); }, 2400); }
function drawCards() { return [...cards].sort(() => Math.random() - .5).slice(0, 3); }
function renderDraft() { const holder = $('#reward-cards'); holder.innerHTML = ''; drawCards().forEach((card, index) => { const button = document.createElement('button'); button.className = `reward-card ${card.tier} ${card.type}`; button.style.animationDelay = `${index * 90}ms`; button.innerHTML = `<span>${card.icon}</span><em>${card.tier === 'legendary' ? 'LENDÁRIA' : card.tier === 'rare' ? 'RARA' : card.type === 'debuff' ? 'DESAFIO' : 'BENÇÃO'}</em><b>${card.name}</b><small>${card.text}</small>`; button.addEventListener('click', () => chooseCard(card, button)); holder.append(button); }); $('#reroll-count').textContent = rerolls; $('#reroll-button').disabled = rerolls === 0; }
function openCardDraft() { rerolls = 1; renderDraft(); show('#reward-screen'); }
function chooseCard(card, button) { document.querySelectorAll('.reward-card').forEach((item) => item.disabled = true); button.classList.add('is-picked'); activeCard = card; $('#activation-symbol').textContent = card.icon; $('#activation-name').textContent = card.name.toUpperCase(); $('#activation-description').textContent = card.text; setTimeout(startGame, 650); }
function createObject(kind, x, y = 0) { const el = document.createElement('div'); el.className = kind; el.style.left = `${x}px`; el.style.bottom = `calc(${GROUND}% + ${y}px)`; world.append(el); return { el, x, y, kind, collected: false }; }
function buildLevel() { [...objects, ...projectiles].forEach((object) => object.el.remove()); objects = []; projectiles = []; [[500,70,86],[860,90,110],[1260,65,95],[1640,105,75],[2020,72,115],[2380,112,90]].forEach(([x,w,h]) => { const item = createObject('obstacle', x); item.w=w; item.h=h; item.el.style.width=`${w}px`; item.el.style.height=`${h}px`; objects.push(item); }); [350,680,780,1100,1420,1510,1840,2200].forEach((x,i) => { const item=createObject('seed',x,i%3===0?62:20); item.w=22; item.h=22; objects.push(item); }); }
function applyCard() { jumpForce = 16 + (activeCard.jump || 0); speedFactor = 1 + (activeCard.speed || 0); shield = activeCard.shield || 0; shotCost = activeCard.shotCost || 0; shotSpeed = 10 + (activeCard.shotSpeed || 0); pierce = Boolean(activeCard.pierce); score = Math.max(0, activeCard.seeds || 0); document.body.classList.toggle('foggy', Boolean(activeCard.fog)); }
$('#reroll-button').addEventListener('click', () => { if (!rerolls) return; rerolls--; renderDraft(); });
function startGame() { show('#game-screen'); $('#power-activation').classList.add('show'); $('#game-over').classList.remove('show'); $('#level-complete').classList.remove('show'); playerX=110; playerY=0; velocityX=velocityY=0; shots=0; keys.left=keys.right=false; applyCard(); buildLevel(); $('#hud-power').textContent=activeCard.name.toUpperCase(); $('#hud-score').textContent=`✦ ${String(score).padStart(3,'0')}`; $('#hud-shots').textContent='➹ 0'; gameRunning=true; cancelAnimationFrame(animationId); loop(); setTimeout(() => $('#power-activation').classList.remove('show'), 1350); }
function stopGame() { gameRunning=false; cancelAnimationFrame(animationId); document.body.classList.remove('foggy'); }
function jump() { if (gameRunning && playerY < 1) velocityY = jumpForce; }
function shoot() { if (!gameRunning || (shotCost && score < shotCost)) return; if (shotCost) score -= shotCost; const item=createObject('projectile',playerX+80,playerY+43); item.w=25; item.h=10; item.v=shotSpeed; projectiles.push(item); shots++; $('#hud-shots').textContent=`➹ ${shots}`; $('#hud-score').textContent=`✦ ${String(score).padStart(3,'0')}`; }
function collide(a,b) { return a.x < b.x+b.w && a.x+PLAYER_W > b.x && a.y < b.y+b.h && a.y+92 > b.y; }
function loop() { if (!gameRunning) return; const dir=(keys.right?1:0)-(keys.left?1:0); velocityX += dir*.55*speedFactor; velocityX *= .8; velocityX=Math.max(-5,Math.min(5,velocityX)); playerX=Math.max(20,playerX+velocityX); velocityY-=GRAVITY; playerY+=velocityY; if(playerY<=0){playerY=0;velocityY=0;} const camera=Math.max(0,playerX-230); player.style.left=`${Math.max(50,playerX-camera)}px`; player.style.bottom=`calc(${GROUND}% + ${playerY}px)`; player.style.backgroundPosition=`-${Math.abs(velocityX)>.7?128:0}px ${playerY>2?'-128px':'0px'}`;
  objects.forEach((item) => { item.el.style.left=`${item.x-camera}px`; if(item.kind==='seed'&&!item.collected&&collide({x:playerX,y:playerY},{x:item.x,y:item.y,w:item.w,h:item.h})){item.collected=true;item.el.style.display='none';score+=10;$('#hud-score').textContent=`✦ ${String(score).padStart(3,'0')}`;} if(item.kind==='obstacle'&&collide({x:playerX,y:playerY},{x:item.x,y:0,w:item.w,h:item.h})){ if(shield){shield--;item.el.remove();item.collected=true;} else gameOver(); }});
  projectiles.forEach((shot) => { shot.x += shot.v; shot.el.style.left=`${shot.x-camera}px`; objects.forEach((item)=>{if(item.kind==='obstacle'&&!item.collected&&shot.x<item.x+item.w&&shot.x+shot.w>item.x){item.collected=true;item.el.remove();score+=15;$('#hud-score').textContent=`✦ ${String(score).padStart(3,'0')}`;if(!pierce)shot.x=99999;}}); if(shot.x>playerX+700)shot.el.remove();});
  const finish=$('#finish'); finish.style.right=`${Math.max(-100,70-(camera/2600)*100)}%`; if(playerX>2700)completeLevel(); animationId=requestAnimationFrame(loop); }
function gameOver() { if(!gameRunning)return; stopGame(); $('#game-over').classList.add('show'); } function completeLevel() { if(!gameRunning)return; stopGame(); $('#level-complete').classList.add('show'); }
$('#restart-button').addEventListener('click',startGame); $('#game-menu-button').addEventListener('click',()=>{stopGame();show('#map-screen');}); $('#complete-map-button').addEventListener('click',()=>show('#map-screen'));
document.addEventListener('keydown',(event)=>{if(event.code==='ArrowLeft'){keys.left=true;event.preventDefault();} if(['ArrowRight','KeyD'].includes(event.code)){keys.right=true;event.preventDefault();} if(['ArrowUp','KeyW','Space'].includes(event.code)){jump();event.preventDefault();} if(['KeyA','KeyF'].includes(event.code)){shoot();event.preventDefault();}}); document.addEventListener('keyup',(event)=>{if(event.code==='ArrowLeft')keys.left=false;if(['ArrowRight','KeyD'].includes(event.code))keys.right=false;});
document.querySelectorAll('[data-control]').forEach((button)=>{const control=button.dataset.control;button.addEventListener('pointerdown',(event)=>{event.preventDefault();if(control==='jump')jump();else if(control==='shoot')shoot();else keys[control]=true;});button.addEventListener('pointerup',()=>{if(control==='left'||control==='right')keys[control]=false;});button.addEventListener('pointerleave',()=>{if(control==='left'||control==='right')keys[control]=false;});});
