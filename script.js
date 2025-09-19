// === Récupération des éléments DOM ===
const snailImg = document.getElementById('snail-img');
const overlay = document.getElementById('overlay');
const miniSnail = document.getElementById('mini-snail');
const closeBtn = document.getElementById('close-btn');
const karaoke = document.getElementById('karaoke');
const rigoloBtn = document.getElementById('rigolotron-btn');
const rigoloPlayer = document.getElementById('rigolo-player');
const rigoloPlayPause = document.getElementById('rigolo-playpause');
const rigoloClose = document.getElementById('rigolo-close');
const rigoloSeek = document.getElementById('rigolo-seek');
const rigoloVol = document.getElementById('rigolo-vol');
const rigoloTime = document.getElementById('rigolo-time');
const miniRigoloBtn = document.getElementById('mini-rigolo-btn');

// === Sons ===
const engine = new Audio('engine.mp3');
const turbo = new Audio('turbo.m4a');
const horn = new Audio('horn.wav');
horn.volume = 0.5;
const rigoloAudio = new Audio('son_rigolo.mp3');
rigoloAudio.preload = 'metadata';
rigoloAudio.volume = parseFloat(rigoloVol?.value || 0.9);

// === Déblocage audio mobile ===
let audioPrimed = false;
document.addEventListener('pointerdown', () => {
  if (!audioPrimed) {
    [engine, turbo, horn, rigoloAudio].forEach(a => {
      a.play().then(() => { a.pause(); a.currentTime = 0; }).catch(()=>{});
    });
    audioPrimed = true;
  }
}, { once: true });

// === Effets visuels ===
let shellRainInterval = null;

function spawnShell() {
  const node = document.createElement('div');
  node.className = 'shell-fall';
  node.textContent = Math.random() < 0.5 ? '🐚' : '🌀';
  node.style.left = Math.random() * 100 + 'vw';
  node.style.fontSize = (Math.random() * 28 + 22) + 'px';
  document.body.appendChild(node);
  setTimeout(() => node.remove(), 5200);
}

function spawnLettuce() {
  const c = document.createElement('div');
  c.className = 'lettuce';
  c.style.left = Math.random() * 100 + 'vw';
  c.style.transform = `translateY(-20px) rotate(${Math.random()*360}deg)`;
  const h = 110 + Math.random() * 40;
  const l = 45 + Math.random() * 20;
  c.style.background = `hsl(${h}, 85%, ${l}%)`;
  document.body.appendChild(c);
  setTimeout(() => c.remove(), 3100);
}

function popRigoloEmojis(n = 4) {
  const icons = ['😂','🐌','🎺','🤪','🌿','🧨','🎉'];
  for (let i = 0; i < n; i++) {
    setTimeout(() => {
      const span = document.createElement('span');
      span.className = 'rigolo-pop';
      span.textContent = icons[Math.floor(Math.random() * icons.length)];
      span.style.left = Math.random() * 80 + 10 + 'vw';
      span.style.top = Math.random() * 35 + 55 + 'vh';
      document.body.appendChild(span);
      setTimeout(() => span.remove(), 1000);
    }, i * 80);
  }
}

// === Escargot principal ===
snailImg?.addEventListener('click', () => {
  engine.currentTime = 0;
  engine.play().catch(()=>{});
  turbo.currentTime = 0;
  turbo.play().catch(()=>{});
  document.body.classList.add('race');
  snailImg.classList.add('turbo-wiggle');
  turbo.onended = () => {
    document.body.classList.remove('race');
    snailImg.classList.remove('turbo-wiggle');
  };
});

// === Overlay NITRO ===
miniSnail?.addEventListener('click', () => {
  overlay.style.display = 'flex';
  karaoke.style.display = 'block';
  if (!shellRainInterval) shellRainInterval = setInterval(spawnShell, 350);
  horn.currentTime = 0;
  horn.play().catch(()=>{});
  turbo.currentTime = 0;
  turbo.play().catch(()=>{});
});

closeBtn?.addEventListener('click', closeOverlay);
overlay?.addEventListener('click', e => {
  if (e.target === overlay) closeOverlay();
});

function closeOverlay() {
  overlay.style.display = 'none';
  karaoke.style.display = 'none';
  clearInterval(shellRainInterval);
  shellRainInterval = null;
  for (let i = 0; i < 36; i++) setTimeout(spawnLettuce, i * 45);
}

// === Raccourcis clavier ===
document.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (k === 'h') { horn.currentTime = 0; horn.play().catch(()=>{}); }
  if (k === 't') {
    turbo.currentTime = 0;
    turbo.play().catch(()=>{});
    document.body.classList.add('race');
    snailImg?.classList.add('turbo-wiggle');
    setTimeout(() => {
      document.body.classList.remove('race');
      snailImg?.classList.remove('turbo-wiggle');
    }, 1500);
  }
});

// === Bouton rigolo 🎵 ===
miniRigoloBtn?.addEventListener('click', () => {
  rigoloAudio.currentTime = 0;
  rigoloAudio.play().catch(()=>{});
  popRigoloEmojis(5);
  document.body.classList.add('race');
  setTimeout(() => document.body.classList.remove('race'), 700);
});

// === Rigolotron player ===
rigoloBtn?.addEventListener('click', () => {
  const hidden = rigoloPlayer?.hasAttribute('hidden');
  if (hidden) {
    rigoloPlayer.removeAttribute('hidden');
    rigoloBtn.setAttribute('aria-expanded', 'true');
    startRigolo();
  } else {
    rigoloAudio.paused ? startRigolo() : pauseRigolo();
  }
});

rigoloPlayPause?.addEventListener('click', () => {
  rigoloAudio.paused ? startRigolo() : pauseRigolo();
});

rigoloClose?.addEventListener('click', () => {
  pauseRigolo();
  rigoloPlayer?.setAttribute('hidden', '');
  rigoloBtn?.setAttribute('aria-expanded', 'false');
});

rigoloVol?.addEventListener('input', () => {
  rigoloAudio.volume = parseFloat(rigoloVol.value);
});

rigoloSeek?.addEventListener('input', () => {
  if (rigoloAudio.duration) {
    const pct = parseInt(rigoloSeek.value, 10) / 100;
    rigoloAudio.currentTime = rigoloAudio.duration * pct;
  }
});

rigoloAudio.addEventListener('timeupdate', () => {
  if (!rigoloAudio.duration) return;
  const pct = (rigoloAudio.currentTime / rigoloAudio.duration) * 100;
  rigoloSeek.value = String(Math.round(pct));
  rigoloTime.textContent = formatTime(rigoloAudio.currentTime);
});

rigoloAudio.addEventListener('loadedmetadata', () => {
  rigoloTime.textContent = '0:00';
});

rigoloAudio.addEventListener('ended', () => {
  popRigoloEmojis(6);
  rigoloPlayPause.textContent = '▶️';
});

function startRigolo() {
  rigoloAudio.play().catch(()=>{});
  rigoloPlayPause.textContent = '⏸️';
  document.body.classList.add('race');
  popRigoloEmojis(5);
  setTimeout(() => document.body.classList.remove('race'), 1000);
}

function pauseRigolo() {
  rigoloAudio.pause();
  rigoloPlayPause.textContent = '▶️';
}

function formatTime(sec) {
  sec = Math.floor(sec || 0);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
