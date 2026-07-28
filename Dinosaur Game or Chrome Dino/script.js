const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const bestElement = document.getElementById('bestScore');
const statusText = document.getElementById('statusText');
const overlayText = document.getElementById('overlayText');
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const restartButton = document.getElementById('restartButton');

const width = canvas.width;
const height = canvas.height;
const groundY = height - 44;

const dino = {
  x: 72,
  y: groundY - 42,
  width: 42,
  height: 42,
  baseHeight: 42,
  duckHeight: 24,
  vy: 0,
  gravity: 0.95,
  jumpForce: -16,
  onGround: true,
  ducking: false,
};

let obstacles = [];
let clouds = [];
let trees = [];
let frame = 0;
let score = 0;
let level = 1;
let bestScore = 0;
let speed = 6;
let spawnRate = 95;
let gameState = 'start';
let paused = false;

function loadBestScore() {
  bestScore = Number(localStorage.getItem('dinoBestScore') || '0');
  bestElement.textContent = bestScore;
}

function saveBestScore() {
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('dinoBestScore', bestScore);
    bestElement.textContent = bestScore;
  }
}

function updateHud() {
  scoreElement.textContent = score;
  levelElement.textContent = level;
}

function resetGame() {
  obstacles = [];
  clouds = [];
  frame = 0;
  score = 0;
  level = 1;
  speed = 6;
  spawnRate = 95;
  paused = false;
  dino.y = groundY - dino.height;
  dino.vy = 0;
  dino.onGround = true;
  dino.ducking = false;
  overlayText.textContent = 'Press Space or Tap to start';
  overlayText.style.opacity = '1';
  updateHud();
  statusText.textContent = 'Use Space / Up to jump, Down to duck.';
}

function startGame() {
  if (gameState === 'playing') return;
  gameState = 'playing';
  paused = false;
  overlayText.style.opacity = '0';
  startButton.disabled = true;
  pauseButton.disabled = false;
  pauseButton.textContent = 'Pause';
  statusText.textContent = 'Running...';
  requestAnimationFrame(loop);
}

function endGame() {
  gameState = 'gameover';
  paused = true;
  saveBestScore();
  overlayText.textContent = 'Game Over\nPress Start or Restart to try again';
  overlayText.style.opacity = '1';
  startButton.disabled = false;
  pauseButton.disabled = true;
  statusText.textContent = 'Game over. Your score has been saved.';
}

function togglePause() {
  if (gameState !== 'playing') return;
  paused = !paused;
  pauseButton.textContent = paused ? 'Resume' : 'Pause';
  statusText.textContent = paused ? 'Paused' : 'Running...';
  if (!paused) {
    requestAnimationFrame(loop);
  }
}

function spawnObstacle() {
  const isBird = Math.random() < 0.2;
  if (isBird) {
    obstacles.push({
      x: width + 30,
      y: groundY - 120 - Math.random() * 20,
      width: 34,
      height: 22,
      type: 'bird',
    });
  } else {
    const size = 22 + Math.random() * 26;
    obstacles.push({
      x: width + 24,
      y: groundY - size,
      width: size,
      height: size,
      type: 'fruit',
    });
  }
}

function spawnCloud() {
  clouds.push({
    x: width + 40,
    y: 32 + Math.random() * 50,
    width: 70 + Math.random() * 40,
    height: 18 + Math.random() * 10,
    speed: 1 + Math.random() * 0.6,
  });
}

function spawnTree() {
  const depth = 0.35 + Math.random() * 0.65; // 0.35 = far, 1 = near
  const scale = 0.8 + Math.random() * 1.3;
  const baseH = 48;
  const treeHeight = Math.round((baseH + Math.random() * 72) * scale * depth);
  const treeWidth = Math.round((20 + Math.random() * 24) * scale * depth);
  // pick a green palette for the trees
  const greens = [ ['#2e7d32','#1b5e20','#66bb6a'], ['#3b7a3b','#2f6f2f','#7bc67a'], ['#2f6e3a','#1f5a2a','#5fb86b'] ];
  const palette = greens[Math.floor(Math.random() * greens.length)];
  trees.push({
    x: width + 30 + Math.random() * 120,
    y: groundY - treeHeight,
    width: treeWidth,
    height: treeHeight,
    depth,
    palette,
    swayPhase: Math.random() * Math.PI * 2,
    speed: 0.6 + depth * (speed * 0.28) + Math.random() * 0.6,
  });
}

function update() {
  if (paused || gameState !== 'playing') return;

  frame += 1;
  if (frame % 5 === 0) {
    score += 1;
  }

  level = Math.max(1, Math.floor(score / 250) + 1);
  speed = 6 + level * 0.75;
  spawnRate = Math.max(55, 95 - level * 4);
  updateHud();

  if (frame % 130 === 0) {
    spawnCloud();
  }
  if (frame % spawnRate === 0) {
    spawnObstacle();
  }
  if (frame % 300 === 0) {
    spawnTree();
  }

  if (!dino.onGround) {
    dino.vy += dino.gravity;
  }
  dino.y += dino.vy;

  if (dino.y >= groundY - dino.height) {
    dino.y = groundY - dino.height;
    dino.vy = 0;
    dino.onGround = true;
  }

  if (dino.ducking && dino.onGround) {
    dino.height = dino.duckHeight;
  } else {
    dino.height = dino.baseHeight;
  }

  obstacles = obstacles.filter((obstacle) => {
    obstacle.x -= speed;
    return obstacle.x + obstacle.width > -50;
  });

  clouds = clouds.filter((cloud) => {
    cloud.x -= cloud.speed;
    return cloud.x + cloud.width > -20;
  });

  trees = trees.filter((tree) => {
    tree.x -= tree.speed;
    return tree.x + tree.width > -40;
  });

  obstacles.forEach((obstacle) => {
    if (
      dino.x < obstacle.x + obstacle.width &&
      dino.x + dino.width > obstacle.x &&
      dino.y < obstacle.y + obstacle.height &&
      dino.y + dino.height > obstacle.y
    ) {
      endGame();
    }
  });
}

function draw() {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#f6f0c9');
  gradient.addColorStop(0.5, '#ffe8a3');
  gradient.addColorStop(1, '#ffd166');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  clouds.forEach((cloud) => {
    ctx.fillStyle = 'rgba(245, 248, 255, 0.75)';
    ctx.beginPath();
    ctx.ellipse(cloud.x, cloud.y, cloud.width * 0.5, cloud.height * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // draw trees (parallax, behind dino but above ground)
  trees.forEach((tree) => {
    const depthFactor = tree.depth;
    const sway = Math.sin(frame * 0.015 * (1 + depthFactor)) * (4 * (1 - depthFactor)) + Math.sin(frame * 0.02 + tree.swayPhase) * (2 * depthFactor);
    const tx = tree.x + sway;

    // ground shadow
    ctx.fillStyle = 'rgba(8,10,12,0.22)';
    ctx.beginPath();
    const shadowW = tree.width * 0.95;
    ctx.ellipse(tx + tree.width * 0.5, groundY + 4, shadowW * 0.6, Math.max(5, 6 * depthFactor), 0, 0, Math.PI * 2);
    ctx.fill();

    // trunk
    const trunkW = Math.max(6, Math.round(tree.width * 0.22));
    const trunkH = Math.max(12, Math.round(tree.height * 0.28));
    const trunkX = tx + (tree.width - trunkW) / 2;
    const trunkY = tree.y + tree.height - trunkH;
    const trunkGradient = ctx.createLinearGradient(trunkX, trunkY, trunkX + trunkW, trunkY + trunkH);
    trunkGradient.addColorStop(0, '#7b4a2d');
    trunkGradient.addColorStop(1, '#4b2b1d');
    ctx.fillStyle = trunkGradient;
    ctx.fillRect(trunkX, trunkY, trunkW, trunkH);

    // canopy with layered circles
    const [shade1, shade2, shade3] = tree.palette;
    const cx = tx + tree.width * 0.5;
    const cy = tree.y + Math.max(8, tree.height * 0.22);
    const baseR = Math.max(16, tree.width * 0.8);

    ctx.fillStyle = shade2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, baseR * 1.08, baseR * 0.72, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = shade1;
    ctx.beginPath();
    ctx.ellipse(cx - baseR * 0.32, cy - baseR * 0.06, baseR * 0.72, baseR * 0.56, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + baseR * 0.32, cy - baseR * 0.06, baseR * 0.72, baseR * 0.56, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = shade3;
    ctx.beginPath();
    ctx.ellipse(cx, cy - baseR * 0.18, baseR * 0.44, baseR * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    for (let i = 0; i < 5; i++) {
      const rx = cx + (Math.random() - 0.5) * baseR * 0.8;
      const ry = cy + (Math.random() - 0.6) * baseR * 0.55;
      ctx.fillRect(rx, ry, 2, 1);
    }
  });

  ctx.fillStyle = '#5a76a9';
  ctx.fillRect(0, groundY, width, 6);
  for (let i = 0; i < width; i += 48) {
    ctx.fillStyle = i % 96 === 0 ? '#7ca0d8' : '#6a89c4';
    ctx.fillRect(i, groundY + 6, 32, 3);
  }

  const bodyWidth = dino.width;
  const bodyHeight = dino.height;
  const bodyX = dino.x;
  const bodyY = dino.y;

  // body
  ctx.fillStyle = '#2f6f3e';
  ctx.beginPath();
  ctx.roundRect(bodyX + 6, bodyY + 8, bodyWidth - 8, bodyHeight - 10, 10);
  ctx.fill();

  // tail
  ctx.fillStyle = '#2f6f3e';
  ctx.beginPath();
  ctx.moveTo(bodyX + 6, bodyY + 18);
  ctx.quadraticCurveTo(bodyX - 4, bodyY + 12, bodyX - 2, bodyY + 22);
  ctx.quadraticCurveTo(bodyX - 2, bodyY + 30, bodyX + 6, bodyY + 26);
  ctx.fill();

  // neck and head
  ctx.fillStyle = '#3d8c4f';
  ctx.beginPath();
  ctx.roundRect(bodyX + 24, bodyY + 8, 12, 12, 6);
  ctx.fill();

  ctx.fillStyle = '#3d8c4f';
  ctx.beginPath();
  ctx.roundRect(bodyX + 34, bodyY + 6, 14, 14, 8);
  ctx.fill();

  // snout
  ctx.fillStyle = '#8ccf6b';
  ctx.beginPath();
  ctx.roundRect(bodyX + 42, bodyY + 10, 10, 8, 4);
  ctx.fill();

  // legs
  ctx.fillStyle = '#2b5c35';
  ctx.fillRect(bodyX + 10, bodyY + bodyHeight - 10, 6, 10);
  ctx.fillRect(bodyX + 22, bodyY + bodyHeight - 10, 6, 10);
  ctx.fillRect(bodyX + 32, bodyY + bodyHeight - 10, 6, 10);

  // feet
  ctx.fillStyle = '#1d2e4d';
  ctx.fillRect(bodyX + 8, bodyY + bodyHeight - 4, 10, 4);
  ctx.fillRect(bodyX + 20, bodyY + bodyHeight - 4, 10, 4);
  ctx.fillRect(bodyX + 30, bodyY + bodyHeight - 4, 10, 4);

  // eyes
  ctx.fillStyle = '#1d2e4d';
  ctx.beginPath();
  ctx.arc(bodyX + 42, bodyY + 12, 2.2, 0, Math.PI * 2);
  ctx.fill();

  // spikes along back
  ctx.fillStyle = '#5fb361';
  for (let i = 0; i < 4; i++) {
    const spikeX = bodyX + 12 + i * 7;
    ctx.fillRect(spikeX, bodyY + 4, 3, 8);
  }

  if (dino.ducking) {
    ctx.fillStyle = '#3d8c4f';
    ctx.beginPath();
    ctx.roundRect(bodyX + 6, bodyY + 16, bodyWidth - 8, bodyHeight - 20, 8);
    ctx.fill();
  }

  obstacles.forEach((obstacle) => {
    if (obstacle.type === 'bird') {
      ctx.fillStyle = '#ead3a0';
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      ctx.fillStyle = '#c9aa70';
      ctx.fillRect(obstacle.x + 4, obstacle.y + 2, obstacle.width - 8, 5);
    } else if (obstacle.type === 'fruit') {
      const fruitX = obstacle.x + 2;
      const fruitY = obstacle.y + 2;
      const fruitW = obstacle.width - 4;
      const fruitH = obstacle.height - 4;

      ctx.fillStyle = '#ff4d6d';
      ctx.beginPath();
      ctx.ellipse(fruitX + fruitW / 2, fruitY + fruitH / 2, fruitW / 2, fruitH / 2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ff7f50';
      ctx.beginPath();
      ctx.arc(fruitX + fruitW * 0.35, fruitY + fruitH * 0.3, fruitW * 0.16, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#2e7d32';
      ctx.fillRect(fruitX + fruitW * 0.32, fruitY + fruitH * 0.9, fruitW * 0.36, 4);
    } else {
      ctx.fillStyle = '#cde1ff';
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      ctx.fillStyle = '#7a98c4';
      ctx.fillRect(obstacle.x, obstacle.y + obstacle.height - 8, obstacle.width, 6);
    }
  });

  if (gameState !== 'playing' || paused) {
    const text = gameState === 'start'
      ? 'Press Space or Tap to start'
      : gameState === 'gameover'
        ? 'Game Over\nPress Start to restart'
        : 'Paused';
    ctx.fillStyle = 'rgba(8, 16, 32, 0.72)';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#f8fbff';
    ctx.font = '24px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    text.split('\n').forEach((line, index) => {
      ctx.fillText(line, width / 2, height / 2 + index * 30 - 10);
    });
  }
}

function loop() {
  if (gameState === 'playing' && !paused) {
    update();
  }
  draw();
  if (gameState === 'playing' && !paused) {
    requestAnimationFrame(loop);
  }
}

function jump() {
  if (gameState !== 'playing') return;
  if (dino.onGround) {
    dino.vy = dino.jumpForce;
    dino.onGround = false;
    dino.ducking = false;
  }
}

function setDuck(active) {
  if (gameState !== 'playing') return;
  if (active && dino.onGround) {
    dino.ducking = true;
  } else {
    dino.ducking = false;
  }
}

window.addEventListener('keydown', (event) => {
  if (event.code === 'Space' || event.code === 'ArrowUp') {
    event.preventDefault();
    if (gameState !== 'playing') {
      startGame();
    } else {
      jump();
    }
  }

  if (event.code === 'ArrowDown') {
    event.preventDefault();
    setDuck(true);
  }

  if (event.code === 'KeyP') {
    togglePause();
  }
});

window.addEventListener('keyup', (event) => {
  if (event.code === 'ArrowDown') {
    setDuck(false);
  }
});

window.addEventListener('touchstart', (event) => {
  event.preventDefault();
  if (gameState !== 'playing') {
    startGame();
  } else {
    jump();
  }
}, { passive: false });

startButton.addEventListener('click', startGame);
pauseButton.addEventListener('click', togglePause);
restartButton.addEventListener('click', () => {
  resetGame();
  startGame();
});

loadBestScore();
resetGame();
