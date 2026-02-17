const SIZE = 3;
const TOTAL_TILES = SIZE * SIZE;

const uploadInput = document.getElementById("imageUpload");
const shuffleButton = document.getElementById("shuffleButton");
const resetButton = document.getElementById("resetButton");
const statusText = document.getElementById("status");
const puzzle = document.getElementById("puzzle");

let board = [];
let solvedBoard = [];
let imageDataUrl = "";

function createSolvedBoard() {
  const numbers = Array.from({ length: TOTAL_TILES }, (_, i) => i);
  numbers[numbers.length - 1] = -1;
  return numbers;
}

function renderBoard() {
  puzzle.innerHTML = "";

  board.forEach((value, index) => {
    const tile = document.createElement("button");
    tile.className = "tile";
    tile.type = "button";

    tile.style.gridColumn = (index % SIZE) + 1;
    tile.style.gridRow = Math.floor(index / SIZE) + 1;

    if (value === -1) {
      tile.classList.add("empty");
      tile.setAttribute("aria-label", "空きマス");
      tile.disabled = true;
    } else {
      const row = Math.floor(value / SIZE);
      const col = value % SIZE;

      if (imageDataUrl) {
        tile.style.backgroundImage = `url(${imageDataUrl})`;
        tile.style.backgroundSize = `${SIZE * 100}% ${SIZE * 100}%`;
        tile.style.backgroundPosition = `${(col / (SIZE - 1)) * 100}% ${(row / (SIZE - 1)) * 100}%`;
      } else {
        tile.classList.add("placeholder");
        tile.textContent = String(value + 1);
      }

      tile.setAttribute("aria-label", `タイル ${value + 1}`);
      tile.addEventListener("click", () => moveTile(index));
    }

    puzzle.appendChild(tile);
  });
}

function getMovableIndexes() {
  const emptyIndex = board.indexOf(-1);
  const row = Math.floor(emptyIndex / SIZE);
  const col = emptyIndex % SIZE;
  const movable = [];

  if (row > 0) movable.push(emptyIndex - SIZE);
  if (row < SIZE - 1) movable.push(emptyIndex + SIZE);
  if (col > 0) movable.push(emptyIndex - 1);
  if (col < SIZE - 1) movable.push(emptyIndex + 1);

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

function shuffleBoard(steps = TOTAL_TILES * 30) {
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


solvedBoard = createSolvedBoard();
board = [...solvedBoard];
renderBoard();
