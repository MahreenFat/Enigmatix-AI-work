const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayMessage = document.getElementById('overlayMessage');
const scoreValue = document.getElementById('scoreValue');
const bestValue = document.getElementById('bestValue');
const levelValue = document.getElementById('levelValue');
const startBtn = document.getElementById('startBtn');

const gridSize = 20;
const tileSize = canvas.width / gridSize;

let tickTimer = null;

let state = {
  snake: [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ],
  direction: { x: 1, y: 0 },
  nextDirection: { x: 1, y: 0 },
  food: { x: 14, y: 10 },
  score: 0,
  best: Number(localStorage.getItem('neonSnakeBest') || 0),
  running: false,
  gameOver: false,
};

function getLevel() {
  return Math.min(5, 1 + Math.floor(state.score / 4));
}

function getTickInterval() {
  const level = getLevel();
  return Math.max(95, 190 - (level - 1) * 12);
}

function updateHud() {
  const level = getLevel();
  scoreValue.textContent = state.score;
  bestValue.textContent = state.best;
  levelValue.textContent = `${level}/5`;
}

function showOverlay(title, message) {
  overlayTitle.textContent = title;
  overlayMessage.textContent = message;
  overlay.classList.add('visible');
}

function scheduleNextTick() {
  clearTimeout(tickTimer);
  if (!state.running) return;

  tickTimer = setTimeout(() => {
    tick();
    scheduleNextTick();
  }, getTickInterval());
}

function hideOverlay() {
  overlay.classList.remove('visible');
}

function resetGame() {
  clearTimeout(tickTimer);
  state.snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  state.direction = { x: 1, y: 0 };
  state.nextDirection = { x: 1, y: 0 };
  state.food = spawnFood();
  state.score = 0;
  state.running = false;
  state.gameOver = false;
  updateHud();
  showOverlay('Ready to play?', 'Use arrow keys or WASD to guide the snake. Eat apples and grow stronger with every bite.');
}

function spawnFood() {
  let food;
  while (!food) {
    const candidate = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };

    const isOnSnake = state.snake.some((segment) => segment.x === candidate.x && segment.y === candidate.y);
    if (!isOnSnake) {
      food = candidate;
    }
  }
  return food;
}

function startGame() {
  if (!state.running) {
    state.running = true;
    state.gameOver = false;
    hideOverlay();
    updateHud();
    scheduleNextTick();
  }
}

function endGame() {
  clearTimeout(tickTimer);
  state.running = false;
  state.gameOver = true;
  if (state.score > state.best) {
    state.best = state.score;
    localStorage.setItem('neonSnakeBest', String(state.best));
  }
  updateHud();
  showOverlay('Game over', `You reached level ${getLevel()} with ${state.score} points. Press Start Game to try again.`);
}

function tick() {
  if (!state.running) return;

  state.direction = state.nextDirection;
  const head = { ...state.snake[0] };
  head.x += state.direction.x;
  head.y += state.direction.y;

  if (
    head.x < 0 ||
    head.y < 0 ||
    head.x >= gridSize ||
    head.y >= gridSize ||
    state.snake.some((segment) => segment.x === head.x && segment.y === head.y)
  ) {
    endGame();
    return;
  }

  state.snake.unshift(head);

  if (head.x === state.food.x && head.y === state.food.y) {
    state.score += 1;
    state.food = spawnFood();
    if (state.score > state.best) {
      state.best = state.score;
      localStorage.setItem('neonSnakeBest', String(state.best));
    }
  } else {
    state.snake.pop();
  }

  updateHud();
  draw();
}

function drawGrid() {
  ctx.save();
  ctx.fillStyle = '#050914';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= gridSize; i += 1) {
    ctx.beginPath();
    ctx.moveTo(i * tileSize, 0);
    ctx.lineTo(i * tileSize, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i * tileSize);
    ctx.lineTo(canvas.width, i * tileSize);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSnakeSegment(segment, index) {
  const x = segment.x * tileSize + tileSize / 2;
  const y = segment.y * tileSize + tileSize / 2;
  const radiusX = tileSize * 0.44;
  const radiusY = tileSize * 0.3;
  const nextSegment = state.snake[index - 1];
  const angle = nextSegment ? Math.atan2(nextSegment.y - segment.y, nextSegment.x - segment.x) : 0;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  const bodyGradient = ctx.createLinearGradient(-radiusX, -radiusY, radiusX, radiusY);
  bodyGradient.addColorStop(0, '#8da24a');
  bodyGradient.addColorStop(1, '#45622a');
  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.stroke();

  if (index !== 0) {
    const stripeCount = 2;
    ctx.strokeStyle = 'rgba(75, 95, 35, 0.9)';
    ctx.lineWidth = 3;
    for (let i = 1; i <= stripeCount; i += 1) {
      const offset = (i / (stripeCount + 1)) * radiusY * 1.2 - radiusY * 0.6;
      ctx.beginPath();
      ctx.moveTo(-radiusX * 0.65, offset);
      ctx.lineTo(radiusX * 0.65, offset);
      ctx.stroke();
    }
  }

  ctx.restore();
}

function drawSnake() {
  for (let i = state.snake.length - 1; i >= 0; i -= 1) {
    drawSnakeSegment(state.snake[i], i);
  }

  drawSnakeHead();
}

function drawSnakeHead() {
  const head = state.snake[0];
  const x = head.x * tileSize + tileSize / 2;
  const y = head.y * tileSize + tileSize / 2;
  const radiusX = tileSize * 0.5;
  const radiusY = tileSize * 0.35;
  const angle = Math.atan2(state.direction.y, state.direction.x);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  const headGradient = ctx.createLinearGradient(-radiusX, -radiusY, radiusX, radiusY);
  headGradient.addColorStop(0, '#acc94e');
  headGradient.addColorStop(1, '#4d6928');
  ctx.fillStyle = headGradient;
  ctx.beginPath();
  ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.beginPath();
  ctx.ellipse(-radiusX * 0.2, -radiusY * 0.2, radiusX * 0.28, radiusY * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1a1b10';
  const eyeY = radiusY * 0.4;
  const eyeX = radiusX * 0.15;
  const eyeRadiusX = tileSize * 0.07;
  const eyeRadiusY = tileSize * 0.095;
  ctx.beginPath();
  ctx.ellipse(eyeX, -eyeY, eyeRadiusX, eyeRadiusY, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(eyeX, eyeY, eyeRadiusX, eyeRadiusY, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fff';
  const pupilRadius = tileSize * 0.03;
  ctx.beginPath();
  ctx.arc(eyeX + pupilRadius * 0.8, -eyeY, pupilRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(eyeX + pupilRadius * 0.8, eyeY, pupilRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#c33b3b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(radiusX * 0.5, 0);
  ctx.lineTo(radiusX * 0.9, 0);
  ctx.stroke();

  ctx.restore();
}

function drawFood() {
  const x = state.food.x * tileSize + tileSize / 2;
  const y = state.food.y * tileSize + tileSize / 2;
  const radius = tileSize * 0.36;

  const gradient = ctx.createLinearGradient(x - radius, y - radius, x + radius, y + radius);
  gradient.addColorStop(0, '#ffdb4d');
  gradient.addColorStop(0.5, '#fb8d24');
  gradient.addColorStop(1, '#c83a32');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#5b3f1b';
  ctx.beginPath();
  ctx.ellipse(x - radius * 0.18, y - radius * 0.8, radius * 0.15, radius * 0.22, -0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.beginPath();
  ctx.ellipse(x - radius * 0.16, y - radius * 0.08, radius * 0.18, radius * 0.12, 0.35, 0, Math.PI * 2);
  ctx.fill();
}

function draw() {
  drawGrid();
  drawFood();
  drawSnake();
}

function handleDirection(next) {
  const isOpposite = state.direction.x + next.x === 0 && state.direction.y + next.y === 0;
  if (!isOpposite) {
    state.nextDirection = next;
  }
}

function handleKeydown(event) {
  const key = event.key.toLowerCase();
  if (['arrowup', 'w'].includes(key)) {
    event.preventDefault();
    handleDirection({ x: 0, y: -1 });
  } else if (['arrowdown', 's'].includes(key)) {
    event.preventDefault();
    handleDirection({ x: 0, y: 1 });
  } else if (['arrowleft', 'a'].includes(key)) {
    event.preventDefault();
    handleDirection({ x: -1, y: 0 });
  } else if (['arrowright', 'd'].includes(key)) {
    event.preventDefault();
    handleDirection({ x: 1, y: 0 });
  } else if (key === ' ') {
    event.preventDefault();
    if (state.gameOver) {
      resetGame();
      startGame();
    } else if (!state.running) {
      startGame();
    }
  }
}

startBtn.addEventListener('click', () => {
  if (state.gameOver) {
    resetGame();
  }
  startGame();
});

window.addEventListener('keydown', handleKeydown);
updateHud();
draw();
resetGame();
