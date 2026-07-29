const boardSize = 8;
const COLORS = ["strawberry", "orange", "lemon", "grape", "apple", "cherry"];
const FRUIT_ICONS = {
  strawberry: "🍓",
  orange: "🍊",
  lemon: "🍋",
  grape: "🍇",
  apple: "🍏",
  cherry: "🍒",
};

const boardElement = document.getElementById("board");
const levelValue = document.getElementById("levelValue");
const scoreValue = document.getElementById("scoreValue");
const movesValue = document.getElementById("movesValue");
const messageText = document.getElementById("messageText");
const targetValue = document.getElementById("targetValue");
const progressFill = document.getElementById("progressFill");
const newGameBtn = document.getElementById("newGameBtn");
const shuffleBtn = document.getElementById("shuffleBtn");

let board = [];
let score = 0;
let moves = 20;
let level = 1;
let targetScore = 300;
let selectedCell = null;
let resolving = false;

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function createBoard() {
  let attempts = 0;

  while (attempts < 300) {
    board = Array.from({ length: boardSize }, () => Array(boardSize).fill(null));

    for (let row = 0; row < boardSize; row += 1) {
      for (let col = 0; col < boardSize; col += 1) {
        let color = randomColor();
        while (
          (row >= 2 && board[row - 1][col] === color && board[row - 2][col] === color) ||
          (col >= 2 && board[row][col - 1] === color && board[row][col - 2] === color)
        ) {
          color = randomColor();
        }
        board[row][col] = color;
      }
    }

    if (hasValidMoves()) {
      return;
    }

    attempts += 1;
  }
}

function updateHud() {
  levelValue.textContent = level;
  scoreValue.textContent = score;
  movesValue.textContent = moves;
  targetValue.textContent = targetScore;
  const progress = Math.min(100, (score / targetScore) * 100);
  progressFill.style.width = `${progress}%`;
}

function setMessage(message) {
  messageText.textContent = message;
}

function renderBoard() {
  boardElement.innerHTML = "";
  boardElement.style.gridTemplateColumns = `repeat(${boardSize}, minmax(0, 1fr))`;

  board.forEach((row, rowIndex) => {
    row.forEach((color, colIndex) => {
      const cell = document.createElement("button");
      cell.className = "cell";
      cell.setAttribute("type", "button");
      cell.dataset.row = rowIndex;
      cell.dataset.col = colIndex;

      if (selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex) {
        cell.classList.add("selected");
      }

      cell.addEventListener("click", () => handleCellClick(rowIndex, colIndex));

      if (color) {
        const candy = document.createElement("span");
        candy.className = `candy ${color}`;
        candy.textContent = FRUIT_ICONS[color] || "🍒";
        cell.appendChild(candy);
      }

      boardElement.appendChild(cell);
    });
  });
}

function isAdjacent(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1;
}

function getMatches() {
  const matches = new Set();

  for (let row = 0; row < boardSize; row += 1) {
    for (let col = 0; col < boardSize; col += 1) {
      const color = board[row][col];
      if (!color) continue;

      let width = 1;
      while (col + width < boardSize && board[row][col + width] === color) {
        width += 1;
      }
      if (width >= 3) {
        for (let i = 0; i < width; i += 1) {
          matches.add(`${row},${col + i}`);
        }
      }

      let height = 1;
      while (row + height < boardSize && board[row + height][col] === color) {
        height += 1;
      }
      if (height >= 3) {
        for (let i = 0; i < height; i += 1) {
          matches.add(`${row + i},${col}`);
        }
      }
    }
  }

  return Array.from(matches).map((entry) => entry.split(",").map(Number));
}

function swapCells(first, second) {
  const temp = board[first.row][first.col];
  board[first.row][first.col] = board[second.row][second.col];
  board[second.row][second.col] = temp;
}

function clearMatches(matches) {
  matches.forEach(([row, col]) => {
    board[row][col] = null;
  });
}

function collapseBoard() {
  for (let col = 0; col < boardSize; col += 1) {
    const values = [];
    for (let row = boardSize - 1; row >= 0; row -= 1) {
      if (board[row][col]) {
        values.push(board[row][col]);
      }
    }

    for (let row = boardSize - 1; row >= 0; row -= 1) {
      board[row][col] = values.length ? values.shift() : null;
    }
  }

  for (let row = 0; row < boardSize; row += 1) {
    for (let col = 0; col < boardSize; col += 1) {
      if (!board[row][col]) {
        board[row][col] = randomColor();
      }
    }
  }
}

function hasValidMoves() {
  for (let row = 0; row < boardSize; row += 1) {
    for (let col = 0; col < boardSize; col += 1) {
      const current = { row, col };
      if (col + 1 < boardSize) {
        const neighbor = { row, col: col + 1 };
        swapCells(current, neighbor);
        const matches = getMatches();
        swapCells(current, neighbor);
        if (matches.length) return true;
      }
      if (row + 1 < boardSize) {
        const neighbor = { row: row + 1, col };
        swapCells(current, neighbor);
        const matches = getMatches();
        swapCells(current, neighbor);
        if (matches.length) return true;
      }
    }
  }
  return false;
}

function resolveBoard() {
  const matches = getMatches();
  if (!matches.length) {
    resolving = false;
    renderBoard();
    if (score >= targetScore) {
      setMessage(`Level ${level} cleared! Start the next challenge.`);
    } else if (!hasValidMoves()) {
      setMessage("No more valid swaps. Start a new game!");
    }
    return;
  }

  const matchCount = matches.length;
  score += Math.max(40, matchCount * 18);
  clearMatches(matches);
  updateHud();
  if (score >= targetScore) {
    setMessage(`Goal reached! Level ${level + 1} is ready.`);
  } else {
    setMessage(`Boom! ${matchCount} fruits cleared.`);
  }
  renderBoard();

  window.setTimeout(() => {
    collapseBoard();
    renderBoard();
    window.setTimeout(() => {
      resolveBoard();
    }, 220);
  }, 220);
}

function handleCellClick(row, col) {
  if (resolving) return;

  if (score >= targetScore && moves > 0) {
    level += 1;
    targetScore += 250;
    moves = 20;
    score = 0;
    selectedCell = null;
    createBoard();
    updateHud();
    setMessage(`Welcome to Level ${level}! Reach ${targetScore} points.`);
    renderBoard();
    return;
  }

  const clickedCell = { row, col };

  if (!selectedCell) {
    selectedCell = clickedCell;
    renderBoard();
    return;
  }

  if (selectedCell.row === row && selectedCell.col === col) {
    selectedCell = null;
    renderBoard();
    return;
  }

  if (!isAdjacent(selectedCell, clickedCell)) {
    selectedCell = clickedCell;
    renderBoard();
    return;
  }

  resolving = true;
  swapCells(selectedCell, clickedCell);
  renderBoard();

  const match = getMatches();
  if (match.length) {
    moves -= 1;
    updateHud();
    resolveBoard();
  } else {
    swapCells(selectedCell, clickedCell);
    renderBoard();
    setMessage("No match this time — try a new swap.");
    resolving = false;
  }

  selectedCell = null;

  if (moves <= 0) {
    setMessage("You’re out of moves! Start a fresh run.");
    resolving = false;
  }
}

function startGame() {
  score = 0;
  moves = 20;
  selectedCell = null;
  resolving = false;
  createBoard();
  updateHud();
  setMessage(`Level ${level}: swap fruits to reach ${targetScore} points.`);
  renderBoard();
}

newGameBtn.addEventListener("click", startGame);
shuffleBtn.addEventListener("click", () => {
  createBoard();
  renderBoard();
  setMessage("Board shuffled — find a new match.");
});

startGame();
