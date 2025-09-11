// === Navigation entre jeux ===
function showGame(id) {
  document.querySelectorAll(".game").forEach(g => g.style.display = "none");
  document.getElementById(id).style.display = "block";

  if (id === "snake") startSnake();
  if (id === "pong") startPong();
}

// === SNAKE ===
let snakeInterval;
function startSnake() {
  const canvas = document.getElementById("snake");
  const ctx = canvas.getContext("2d");
  let box = 20;
  let snake = [{x: 9*box, y: 10*box}];
  let direction = "RIGHT";
  let food = {
    x: Math.floor(Math.random()*19+1)*box,
    y: Math.floor(Math.random()*19+1)*box
  };

  document.onkeydown = (e) => {
    if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
    if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
    if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
    if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
  };

  clearInterval(snakeInterval);
  snakeInterval = setInterval(draw, 100);

  function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,400,400);

    for (let i=0;i<snake.length;i++) {
      ctx.fillStyle = (i===0) ? "lime" : "white";
      ctx.fillRect(snake[i].x, snake[i].y, box, box);
    }

    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, box, box);

    let headX = snake[0].x;
    let headY = snake[0].y;

    if (direction === "LEFT") headX -= box;
    if (direction === "UP") headY -= box;
    if (direction === "RIGHT") headX += box;
    if (direction === "DOWN") headY += box;

    if (headX === food.x && headY === food.y) {
      food = {
        x: Math.floor(Math.random()*19+1)*box,
        y: Math.floor(Math.random()*19+1)*box
      };
    } else {
      snake.pop();
    }

    let newHead = {x: headX, y: headY};
    if (headX<0 || headY<0 || headX>=400 || headY>=400 || collision(newHead,snake)) {
      clearInterval(snakeInterval);
      alert("Game Over !");
    }

    snake.unshift(newHead);
  }

  function collision(head, array) {
    for (let i=0;i<array.length;i++) {
      if (head.x===array[i].x && head.y===array[i].y) return true;
    }
    return false;
  }
}

// === MORPION ===
let board = ["","","","","","","","",""];
let turn = "X";
function play(i) {
  if (board[i] !== "") return;
  board[i] = turn;
  document.querySelectorAll("#morpion td")[i].textContent = turn;
  if (checkWin()) {
    document.getElementById("morpionMsg").textContent = turn + " a gagné !";
    return;
  }
  turn = (turn === "X") ? "O" : "X";
}
function checkWin() {
  const winCombos = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return winCombos.some(c => board[c[0]]!=="" && board[c[0]]===board[c[1]] && board[c[1]]===board[c[2]]);
}

// === PONG ===
let pongInterval;
function startPong() {
  const canvas = document.getElementById("pong");
  const ctx = canvas.getContext("2d");

  let paddleHeight = 60, paddleWidth = 10;
  let leftY = canvas.height/2 - paddleHeight/2;
  let rightY = leftY;
  let ballX = canvas.width/2, ballY = canvas.height/2;
  let ballDX = 3, ballDY = 3;

  document.onmousemove = (e) => {
    let rect = canvas.getBoundingClientRect();
    leftY = e.clientY - rect.top - paddleHeight/2;
  };

  clearInterval(pongInterval);
  pongInterval = setInterval(draw, 20);

  function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle = "white";
    ctx.fillRect(0,leftY,paddleWidth,paddleHeight);
    ctx.fillRect(canvas.width-paddleWidth,rightY,paddleWidth,paddleHeight);

    ctx.beginPath();
    ctx.arc(ballX,ballY,8,0,Math.PI*2);
    ctx.fill();

    ballX += ballDX;
    ballY += ballDY;

    if (ballY<0 || ballY>canvas.height) ballDY = -ballDY;

    if (ballX<10 && ballY>leftY && ballY<leftY+paddleHeight) ballDX = -ballDX;
    if (ballX>canvas.width-10 && ballY>rightY && ballY<rightY+paddleHeight) ballDX = -ballDX;

    rightY += (ballY - (rightY+paddleHeight/2))*0.1;
  }
}

// === CLICKER ===
let clicks = 0, timer;
function startClicker() {
  clicks = 0;
  document.getElementById("clickerScore").textContent = "Clique vite !";
  document.getElementById("clicker").onclick = () => clicks++;

  clearTimeout(timer);
  timer = setTimeout(() => {
    document.getElementById("clickerScore").textContent = "Score : " + clicks;
    document.getElementById("clicker").onclick = null;
  }, 5000);
}
