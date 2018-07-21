
const marginLeft = 60;
const marginTop = 110;
const numCells = 25; // Makes a 25x25 grid.
const width = 600;
const height = 600;
const numBombs = 80;

let cells = [];
let opened_cells = [];
let flags_left = numBombs;
let time = 0;
let gameTimer;
let flags = [];
let questions = [];

// ===============================================================================================
// STARTERS:
// ===============================================================================================

function setup() {
  document.addEventListener('contextmenu', event => event.preventDefault());

  let timer = createP(`Time: ${time}`);
  timer.position(400, marginTop - 50);

  gameTimer = setInterval(() => {
    time++;
    timer.remove();
    timer = createP(`Time: ${time}`);
    timer.position(400, marginTop - 50);
  }, 1000);

  const canv = createCanvas(width, height);
  canv.position(marginLeft, marginTop);

  initializeGrid();
  drawGrid();
  prepareBombs(numBombs);

  const flags = createP(`Flags left: ${flags_left}`);
  flags.position(100, marginTop - 50);

  const reset = createButton('reset');
  reset.mouseClicked(function() {
    console.log(this);
  });
  reset.position(250, marginTop - 50);

  // Initialize each cell's number:
  cells.forEach(cell => {
    cell.numAdjBombs = getNumBombs(cell);
  });

}

// ===============================================================================================

function initializeGrid() {
  for (let i=0; i < numCells; i++) {
    for (let j=0; j < numCells; j++) {
      const cell = {
        x: i,
        y: j,
        col: 'darkgray',
        hovered: false,
        height: height / numCells,
        width: width / numCells,
        bomb: false,
        clicked: false,
        opened: false,
        flagged: false,
        questioned: false,
        numAdjBombs: 0
      };

      cells.push(cell);
    }
  }
}

// ===============================================================================================

// n is the number of bombs to be added to the global array CELLS:
function prepareBombs(n) {
  let count = n;
  let randomIndices = [];

  // Generate random indices (ensuring no duplicates):
  while (count > 0) {
    const index = Math.floor(Math.random() * numCells * numCells);
    if (!randomIndices.includes(index)) {
      randomIndices.push(index);
      count --;
    }
  }

  addBombs(randomIndices);
}

// ===============================================================================================

function addBombs(arr) {
  // For each index, find where it lives in the cells array:
  arr.forEach(ind => {
    const x = Math.floor(ind / numCells);
    const y = ind % numCells;

    // Loop through cells array to add bombs to proper cells:
    cells.forEach(cell => {
      if (cell.x == x && cell.y == y) {
        cell.bomb = true;
      }
    });
  });

}



// ===============================================================================================
// UI FUNCTIONS:
// ===============================================================================================

function mousePressed() {
  const clickedCell = getCellFromPixels(mouseX, mouseY);
  cells.forEach(cell => {
    cell.hovered = false;
  });
  clickedCell.hovered = true;
  drawGrid();
  displayReality(opened_cells, flags, questions);
  // Make sure when clicked, we add the shadow bottom class, to emulate a real button.
}

// ===============================================================================================

function mouseDragged() {
  const clickedCell = getCellFromPixels(mouseX, mouseY);
  cells.forEach(cell => {
    cell.hovered = false;
  });
  clickedCell.hovered = true;
  drawGrid();
  displayReality(opened_cells, flags, questions);
}

// ===============================================================================================

function mouseReleased() {
  const clickedCell = getCellFromPixels(mouseX, mouseY);
  clickedCell.hovered = false;

  if (mouseButton === LEFT) {
    if (clickedCell.bomb) {
      console.log('you lose, sucker!');
      clearInterval(gameTimer);
    } else {
      turnNeighborsRed(clickedCell);
    }
  } else {

    if (!containsCell(opened_cells, clickedCell)) {
      if (!containsCell(flags, clickedCell) && !containsCell(questions, clickedCell)) {
        flags.push(clickedCell);
      } else if (containsCell(flags, clickedCell)) {
        findAndRemoveCell(flags, clickedCell);
        questions.push(clickedCell);
      } else if (containsCell(questions, clickedCell)) {
        findAndRemoveCell(questions, clickedCell);
      }
    }
  }
  drawGrid();
  displayReality(opened_cells, flags, questions);
}



// ===============================================================================================
// HELPERS:
// ===============================================================================================

function findAndRemoveCell(arr, cell) {
  for (let i=0; i < arr.length; i++) {
    if (arr[i].x == cell.x && arr[i].y == cell.y) arr.splice(i, 1);
  }
}

// ===============================================================================================

function getCellFromPixels(x, y) {
  const i = Math.floor(x / cells[0].width);
  const j = Math.floor(y / cells[0].height);
  return getCellAt(i, j);
}

// ===============================================================================================

function containsCell(arr, cell) {
  for (let i=0; i < arr.length; i++) {
    if (arr[i].x == cell.x && arr[i].y == cell.y) return true;
  }
  return false;
}

// ===============================================================================================

// Yes, the recursion works!
function turnNeighborsRed(el) {
  if (!el.bomb) {
    // el.col = 'pink';
    el.opened = true;
    opened_cells.push(el);
    if (!el.clicked) {
      let neighbors = getNeighbors(el.x, el.y);
      neighbors.forEach(neighbor => {
        if (!neighbor.bomb && el.numAdjBombs == 0) {
          // neighbor.col = 'pink';
          neighbor.opened = true;
          if (!containsCell(opened_cells, neighbor)) {
            opened_cells.push(neighbor);
          }
        }

        if (neighbor.numAdjBombs == 0) {
          el.clicked = true; // Yes this has to happen before the recursive call
          turnNeighborsRed(neighbor);
        }
      });
    }
  }
}

// ===============================================================================================

function getCellAt(i, j) {
  // Yeah, foreach just can't handle returns....Weird:
  for (let k=0; k < cells.length; k++) {
    if (cells[k].x == i && cells[k].y == j) return cells[k];
  }

  return null; // I bet if we do this, wouldn't need if statements in getNeighbors...
}

// ===============================================================================================

// i is the x-coordinate, j the y-coordinate of the cell:
function getNeighbors(i, j) {
  let neighbors = [];

  const top = getCellAt(i - 1, j);
  const bottom = getCellAt(i + 1, j);
  const left = getCellAt(i, j - 1);
  const right = getCellAt(i, j + 1);
  const top_right = getCellAt(i - 1, j + 1);
  const top_left = getCellAt(i - 1, j - 1);
  const bottom_right = getCellAt(i + 1, j + 1);
  const bottom_left = getCellAt(i + 1, j - 1);

  if (i > 0)                                neighbors.push(top);
  if (j > 0)                                neighbors.push(left);
  if (i < numCells - 1)                     neighbors.push(bottom);
  if (j < numCells - 1)                     neighbors.push(right);
  if (i > 0 && j > 0)                       neighbors.push(top_left);
  if (i > 0 && j < numCells - 1)            neighbors.push(top_right);
  if (i < numCells - 1 && j > 0)            neighbors.push(bottom_left);
  if (i < numCells - 1 && j < numCells - 1) neighbors.push(bottom_right);

  return neighbors;
}

// ===============================================================================================

function getNumBombs(cell) {
  let res = 0;
  getNeighbors(cell.x, cell.y).forEach(neighbor => {
    if (neighbor.bomb) {
      res ++;
    }
  });
  return res;
}



// ===============================================================================================
// DRAWING:
// ===============================================================================================

function drawGrid() {
  cells.forEach(cell => {
    const BORDER = 1/10;
    fill(cell.col);
    stroke(100);

    const xPos = cell.x * cell.width;
    const yPos = cell.y * cell.height;
    rect(xPos, yPos, cell.width, cell.height);

    if (!cell.opened) {
      noStroke();
      // Bottom border:
      fill('gray'); // strangely, darker than dark gray.
      rect(xPos + (1 - BORDER) * cell.width, yPos, cell.width * BORDER, cell.height);
      rect(xPos, yPos + (1 - BORDER) * cell.height, cell.width, cell.height * BORDER);

      // Top border:
      if (cell.hovered) {
        fill('dimgray');
      } else {
        fill('lightgray');
      }
      rect(xPos, yPos, cell.width * BORDER, cell.height);
      rect(xPos, yPos, cell.width, cell.height * BORDER);
    }

  });
}

// ===============================================================================================

function drawFlag(cell) {

}

// ===============================================================================================

function drawNumBombs(cell) {
  // what??? the math is so weird.
  const posX = (cell.x - 2) * cell.width + marginLeft ;
  const posY = (cell.y - 4) * cell.height + marginTop ;

  fill('black');
  if (cell.bomb) {
    text('b', posX, posY);
  }
  else {
    if (cell.numAdjBombs == 0) {
      text(' ', posX, posY);
    } else {
      let col;
      switch(cell.numAdjBombs) {
        case 1: fill('blue'); break;
        case 2: fill('green'); break;
        case 3: fill('red'); break;
        case 4: fill('purple'); break;
        case 5: fill('darkblue'); break;
      }
      text(cell.numAdjBombs, posX, posY);
    }
  }
}

// ===============================================================================================

function displayReality(cells, flags=[], questions=[]) {
  cells.forEach(cell => {
    drawNumBombs(cell);
  });
  flags.forEach(flag => {
    const posX = (flag.x - 2) * flag.width + marginLeft ;
    const posY = (flag.y - 4) * flag.height + marginTop ;
    text('f', posX, posY);
  });
  questions.forEach(question => {
    const posX = (question.x - 2) * question.width + marginLeft ;
    const posY = (question.y - 4) * question.height + marginTop ;
    text('?', posX, posY);
  });
}

// ===============================================================================================
