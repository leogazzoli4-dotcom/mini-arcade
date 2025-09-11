// script.js - navigation + jeux (sans onclick inline)
// --------------------------------------------------
// Variables globales pour contrôler intervalles / états
let snakeInterval = null;
let pongInterval = null;
let snakeState = null;
let pongState = null;

// Wait DOM ready
document.addEventListener("DOMContentLoaded", () => {
  setupMenu();
  setupMorpion();
  setupClicker();
  // show lobby by default (already active in HTML)
});

// ---------------- Menu / navigation ----------------
function setupMenu() {
  const menu = document.getElementById("menu");
  menu.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      const gameId = btn.dataset.game;
      showGame(gameId);
      // active styling
      menu.querySelectorAll("button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
  // set initial active
  menu.querySelector('button[data-game="lobby"]').classList.add("active");
}

function showGame(id) {
  // hide all games
  document.querySelectorAll(".game").forEach(s => {
    s.classList.remove("active");
    s.setAttribute("aria-hidden", "true");
  });
  // stop background intervals for games not active
  stopSnake();
  stopPong();

  // show selected
  const sel = document.getElementById(id);
  if (!sel) return;
  sel.classList.add("active");
  sel.setAttribute("aria-hidden", "false");

  // start if necessary
  if (id === "snake") startSnake();
  if (id === "pong") startPong();
}

// ---------------- SNAKE ----------------
function startSnake() {
  // clear previous if any
  stopSnake();

  const canvas = document.getElementById("snakeCanvas");
  const ctx = canvas.getContext("2d");
  const box = 20;
  const cols = canvas.width / box;
  const rows = canvas.height / box;

  let snake = [{ x: Math.floor(cols/2)*box, y: Math.floor(rows/2)*box }];
  let dir = { x: 1, y: 0 };
  let food = spawnFood();

  // Key handling (use addEventListener and keep a ref so we can remove)
  function keyHandler(e) {
    if (e.key === "ArrowLeft" && dir.x !== 1) { dir = {x:-1,y:0}; }
    if (e.key === "ArrowRight" && dir.x !== -1) { dir = {x:1,y:0}; }
    if (e.key === "ArrowUp" && dir.y !== 1) { dir = {x:0,y:-1}; }
    if (e.key === "ArrowDown" && dir.y !== -1) { dir = {x:0,y:1}; }
  }
  document.addEventListener("keydown", keyHandler);
  snakeState = { keyHandler };

  function spawnFood() {
    // ensure not on snake
    while (true) {
      const f = { x: Math.floor(Math.random()*cols)*box, y: Math.floor(Math.random()*rows)*box };
      if (!snake.some(s => s.x === f.x && s.y === f.y)) return f;
    }
  }

  function draw() {
    // background
    ctx.fillStyle = "#000";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // food
    ctx.fillStyle = "crimson";
    ctx.fillRect(food.x, food.y, box, box);

    // snake
    snake.forEach((s,i) => {
      ctx.fillStyle = i===0 ? "#4ade80" : "#e5e7eb";
      ctx.fillRect(s.x,s.y,box,box);
    });

    // move
    const head = { x: snake[0].x + dir.x*box, y: snake[0].y + dir.y*box };

    // collision with walls
    if (head.x < 0 || head.y < 0 || head.x >= canvas.width || head.y >= canvas.height || snake.some(c => c.x===head.x && c.y===head.y)) {
      // game over
      stopSnake();
      alert("Snake - Game Over !");
      return;
    }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      food = spawnFood();
    } else {
      snake.pop();
    }
  }

  // start interval
  snakeInterval = setInterval(draw, 100);
  // restart button
  document.getElementById("restartSnake").onclick = () => {
    stopSnake();
    startSnake();
  };
}
function stopSnake() {
  if (snakeInterval) { clearInterval(snakeInterval); snakeInterval = null; }
  if (snakeState && snakeState.keyHandler) {
    document.removeEventListener("keydown", snakeState.keyHandler);
  }
  snakeState = null;
}

// ---------------- MORPION ----------------
function setupMorpion() {
  const boardEl = document.getElementById("morpionBoard");
  boardEl.innerHTML = ""; // clear
  for (let i=0;i<9;i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.index = i;
    boardEl.appendChild(cell);
  }

  // game state
  resetMorpion();
  // add listeners
  boardEl.addEventListener("click", (e) => {
    const cell = e.target.closest(".cell");
    if(!cell) return;
    const idx = Number(cell.dataset.index);
    handleMorpionPlay(idx);
  });

  document.getElementById("restartMorpion").addEventListener("click", resetMorpion);
}

let morpionBoard = [];
let morpionTurn = "X";
function resetMorpion() {
  morpionBoard = Array(9).fill("");
  morpionTurn = "X";
  document.getElementById("morpionMsg").textContent = "Tour de X";
  document.querySelectorAll("#morpionBoard .cell").forEach(c => c.textContent = "");
}
function handleMorpionPlay(i) {
  if (morpionBoard[i] !== "") return;
  morpionBoard[i] = morpionTurn;
  const cell = document.querySelector(`#morpionBoard .cell[data-index="${i}"]`);
  cell.textContent = morpionTurn;
  if (checkMorpionWin()) {
    document.getElementById("morpionMsg").textContent = `${morpionTurn} a gagné !`;
    // disable further clicks by clearing board state (simple)
    morpionBoard = morpionBoard.map(() => "*");
    return;
  }
  if (!morpionBoard.includes("")) {
    document.getElementById("morpionMsg").textContent = "Égalité !";
    return;
  }
  morpionTurn = morpionTurn === "X" ? "O" : "X";
  document.getElementById("morpionMsg").textContent = `Tour de ${morpionTurn}`;
}
function checkMorpionWin() {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return wins.some(([a,b,c]) => morpionBoard[a] && morpionBoard[a] === morpionBoard[b] && morpionBoard[b] === morpionBoard[c]);
}

// ---------------- PONG ----------------
function startPong() {
  stopPong();

  const canvas = document.getElementById("pongCanvas");
  const ctx = canvas.getContext("2d");
  const paddleW = 10, paddleH = 80;
  const speed = 4;

  const state = {
    leftY: canvas.height/2 - paddleH/2,
    rightY: canvas.height/2 - paddleH/2,
    ballX: canvas.width/2,
    ballY: canvas.height/2,
    ballDX: 3,
    ballDY: 2,
    leftScore: 0,
    rightScore: 0
  };
  pongState = state;

  // mouse control left paddle
  function mouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    state.leftY = e.clientY - rect.top - paddleH/2;
    if (state.leftY < 0) state.leftY = 0;
    if (state.leftY > canvas.height - paddleH) state.leftY = canvas.height - paddleH;
  }
  canvas.addEventListener("mousemove", mouseMove);
  state.mouseMove = mouseMove;

  function draw() {
    // background
    ctx.fillStyle = "#000";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // paddles
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, state.leftY, paddleW, paddleH);
    ctx.fillRect(canvas.width - paddleW, state.rightY, paddleW, paddleH);

    // ball
    ctx.beginPath();
    ctx.arc(state.ballX, state.ballY, 8, 0, Math.PI*2);
    ctx.fill();

    // move ball
    state.ballX += state.ballDX;
    state.ballY += state.ballDY;

    if (state.ballY < 0 || state.ballY > canvas.height) state.ballDY = -state.ballDY;

    // left paddle collision
    if (state.ballX - 8 < paddleW && state.ballY > state.leftY && state.ballY < state.leftY + paddleH) {
      state.ballDX = Math.abs(state.ballDX);
    }
    // right paddle collision
    if (state.ballX + 8 > canvas.width - paddleW && state.ballY > state.rightY && state.ballY < state.rightY + paddleH) {
      state.ballDX = -Math.abs(state.ballDX);
    }

    // simple AI for right paddle
    state.rightY += (state.ballY - (state.rightY + paddleH/2)) * 0.08;

    // score
    if (state.ballX < 0) {
      state.rightScore++;
      resetBall();
    } else if (state.ballX > canvas.width) {
      state.leftScore++;
      resetBall();
    }
  }

  function resetBall() {
    state.ballX = canvas.width/2;
    state.ballY = canvas.height/2;
    state.ballDX = (Math.random() > 0.5) ? 3 : -3;
    state.ballDY = (Math.random() > 0.5) ? 2 : -2;
  }

  pongInterval = setInterval(draw, 16);

  document.getElementById("restartPong").onclick = () => {
    stopPong();
    startPong();
  };
}
function stopPong() {
  if (pongInterval) { clearInterval(pongInterval); pongInterval = null; }
  // remove mouse listener if present
  const canvas = document.getElementById("pongCanvas");
  if (pongState && pongState.mouseMove) {
    canvas.removeEventListener("mousemove", pongState.mouseMove);
  }
  pongState = null;
}

// ---------------- CLICKER ----------------
function setupClicker() {
  const startBtn = document.getElementById("startClicker");
  const targetBtn = document.getElementById("clickTarget");
  const scoreEl = document.getElementById("clickerScore");

  let clicks = 0;
  let running = false;
  let timerId = null;

  startBtn.addEventListener("click", () => {
    if (running) return;
    clicks = 0;
    running = true;
    scoreEl.textContent = "Prêt... GO !";
    targetBtn.disabled = false;
    targetBtn.focus();

    targetBtn.onclick = () => { if (running) clicks++; };

    timerId = setTimeout(() => {
      running = false;
      targetBtn.disabled = true;
      targetBtn.onclick = null;
      scoreEl.textContent = `Score : ${clicks} clics en 5s`;
    }, 5000);
  });
}

// --------------------------------------------------
// Safety: stop intervals when leaving page
window.addEventListener("beforeunload", () => {
  stopSnake();
  stopPong();
});
