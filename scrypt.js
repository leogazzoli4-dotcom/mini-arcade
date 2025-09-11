// js/games.js
d.addEventListener('click',()=>onClick(i));
grid.appendChild(d);
});
score.textContent = `Coups: ${moves}`;
}


function onClick(i){
if(revealed.includes(i) || matched[i]) return;
revealed.push(i); render();
if(revealed.length===2){
moves++;
const [a,b] = revealed;
if(deck[a]===deck[b]){ matched[a]=matched[b]=true; revealed=[]; }
else setTimeout(()=>{ revealed=[]; render(); },600);
checkEnd();
}
}
function checkEnd(){ if(matched.every(Boolean)) score.textContent += ' — Terminé !'; }
container.querySelector('#reset-mem').addEventListener('click',()=>{deck = [...symbols, ...symbols].sort(()=>Math.random()-0.5); matched = Array(deck.length).fill(false); revealed=[]; moves=0; render();});
render();
}


/* ---------------------- Whack-a-Mole ---------------------- */
function loadWhack(){
const container = document.createElement('div'); container.className='card whack';
container.innerHTML = `
<div class="controls"><strong>Whack‑a‑Mole</strong><button id="start-whack">Start</button><button id="stop-whack">Stop</button><span id="whack-score" style="margin-left:auto;color:var(--muted)">Score: 0</span></div>
<div class="grid" id="whack-grid"></div>
`;
gameArea.appendChild(container);


const grid = container.querySelector('#whack-grid');
const scoreEl = container.querySelector('#whack-score');
let score=0; let timer=null; let active=-1;


// build 6 holes
for(let i=0;i<6;i++){ const h=document.createElement('div'); h.className='hole'; h.dataset.i=i; grid.appendChild(h); }
function spawn(){
const holes = [...grid.children];
if(active>=0) holes[active].innerHTML='';
active = Math.floor(Math.random()*holes.length);
holes[active].innerHTML = '<div class="mole" data-i="'+active+'"></div>';
[...holes].forEach(h=>h.onclick = e=>{ if(e.target.classList.contains('mole')){ score++; scoreEl.textContent = `Score: ${score}`; e.target.remove(); } });
}
container.querySelector('#start-whack').addEventListener('click',()=>{ if(timer) return; score=0; scoreEl.textContent='Score: 0'; spawn(); timer = setInterval(spawn,800); });
container.querySelector('#stop-whack').addEventListener('click',()=>{ clearInterval(timer); timer=null; const holes=[...grid.children]; holes.forEach(h=>h.innerHTML=''); active=-1; });
}


/* ---------------------- Clicker ---------------------- */
function loadClicker(){
const container = document.createElement('div'); container.className='card clicker';
container.innerHTML = `
<div class="controls"><strong>Clicker</strong><button id="reset-click">Reset</button><span id="click-score" style="margin-left:auto;color:var(--muted)">0</span></div>
<div style="display:flex;justify-content:center;padding:20px"><button class="big-btn" id="big-click">Clique moi</button></div>
`;
gameArea.appendChild(container);
let score=0; const scoreEl = container.querySelector('#click-score');
container.querySelector('#big-click').addEventListener('click',()=>{ score++; scoreEl.textContent = score; });
container.querySelector('#reset-click').addEventListener('click',()=>{ score=0; scoreEl.textContent=0; });
}


// charge un jeu par défaut
loadGame('tictactoe');
