let size = 5;

const uploadInput = document.getElementById("imageUpload");
const modeSelect = document.getElementById("modeSelect");
const shuffleButton = document.getElementById("shuffleButton");
const resetButton = document.getElementById("resetButton");
const statusText = document.getElementById("status");
const descriptionText = document.getElementById("description");
const puzzle = document.getElementById("puzzle");

let board = [];
let solvedBoard = [];
let imageDataUrl = "";

function totalTiles() {
  return size * size;
}

function updateModeDescription() {
  descriptionText.textContent = `画像をアップロードすると、${size}×${size}（${totalTiles()}マス）のスライドパズルを作成します。`;
}

function applySizeToGrid() {
  puzzle.style.setProperty("--size", String(size));
}

function createSolvedBoard() {
  const numbers = Array.from({ length: totalTiles() }, (_, i) => i);
  numbers[numbers.length - 1] = -1;
  return numbers;
}

function renderBoard() {
  puzzle.innerHTML = "";

  board.forEach((value, index) => {
    const tile = document.createElement("button");
    tile.className = "tile";
    tile.type = "button";

    tile.style.gridColumn = (index % size) + 1;
    tile.style.gridRow = Math.floor(index / size) + 1;

    if (value === -1) {
      tile.classList.add("empty");
      tile.setAttribute("aria-label", "空きマス");
      tile.disabled = true;
    } else {
      const row = Math.floor(value / size);
      const col = value % size;

      tile.style.backgroundImage = `url(${imageDataUrl})`;
      tile.style.backgroundSize = `${size * 100}% ${size * 100}%`;
      tile.style.backgroundPosition = `${(col / (size - 1)) * 100}% ${(row / (size - 1)) * 100}%`;
      tile.setAttribute("aria-label", `タイル ${value + 1}`);
      tile.addEventListener("click", () => moveTile(index));
    }

    puzzle.appendChild(tile);
  });
}

function getMovableIndexes() {
  const emptyIndex = board.indexOf(-1);
  const row = Math.floor(emptyIndex / size);
  const col = emptyIndex % size;
  const movable = [];

  if (row > 0) movable.push(emptyIndex - size);
  if (row < size - 1) movable.push(emptyIndex + size);
  if (col > 0) movable.push(emptyIndex - 1);
  if (col < size - 1) movable.push(emptyIndex + 1);

  return movable;
}

function moveTile(tileIndex) {
  const movable = getMovableIndexes();
  if (!movable.includes(tileIndex)) return;

  const emptyIndex = board.indexOf(-1);
  [board[emptyIndex], board[tileIndex]] = [board[tileIndex], board[emptyIndex]];
  renderBoard();

  if (isSolved()) {
    statusText.textContent = "クリア！おめでとうございます 🎉";
  }
}

function isSolved() {
  return board.every((value, index) => value === solvedBoard[index]);
}

function shuffleBoard(steps = totalTiles() * 30) {
  board = [...solvedBoard];

  for (let i = 0; i < steps; i += 1) {
    const movable = getMovableIndexes();
    const randomTile = movable[Math.floor(Math.random() * movable.length)];
    const emptyIndex = board.indexOf(-1);
    [board[emptyIndex], board[randomTile]] = [board[randomTile], board[emptyIndex]];
  }

  if (isSolved()) {
    shuffleBoard(steps);
    return;
  }

  renderBoard();
  statusText.textContent = "シャッフルしました。タイルを動かして完成させてください。";
}

function applyMode(newSize) {
  size = newSize;
  applySizeToGrid();
  updateModeDescription();

  if (!imageDataUrl) {
    board = [];
    solvedBoard = [];
    puzzle.innerHTML = "";
    return;
  }

  solvedBoard = createSolvedBoard();
  board = [...solvedBoard];
  renderBoard();
  statusText.textContent = `モードを ${size}×${size} に変更しました。`;
}

uploadInput.addEventListener("change", (event) => {
  const [file] = event.target.files;
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    imageDataUrl = String(reader.result);
    solvedBoard = createSolvedBoard();
    board = [...solvedBoard];
    renderBoard();

    shuffleButton.disabled = false;
    resetButton.disabled = false;
    statusText.textContent = "画像を読み込みました。シャッフルして開始できます。";
  };

  reader.readAsDataURL(file);
});

modeSelect.addEventListener("change", (event) => {
  const nextSize = Number(event.target.value);
  if (![3, 4, 5].includes(nextSize)) return;
  applyMode(nextSize);
});

shuffleButton.addEventListener("click", () => {
  if (!imageDataUrl) return;
  shuffleBoard();
});

resetButton.addEventListener("click", () => {
  if (!imageDataUrl) return;
  board = [...solvedBoard];
  renderBoard();
  statusText.textContent = "リセットしました。";
});

applyMode(size);
