
const marginLeft = 60;
const marginTop = 60;
const numCells = 25; // Makes a 25x25 grid.
const width = 600;
const height = 600;
const numBombs = 80;

let cells = [];

let opened_cells = [];

// ===============================================================================================

function setup() {
  const canv = createCanvas(width, height);
  canv.position(marginLeft, marginTop);
  initializeGrid();
  drawGrid();
  prepareBombs(numBombs);

  // Initialize each cell's number:
  cells.forEach(cell => {
    cell.numAdjBombs = getNumBombs(cell);
  });

  // Draw each cell's number:
  // displayReality(cells);
}

// ===============================================================================================

// Yes, the recursion works!
function turnNeighborsRed(el) {
  if (!el.bomb) {
    el.col = 'pink';
    opened_cells.push(el);
    if (!el.clicked) {
      let neighbors = getNeighbors(el.x, el.y);
      neighbors.forEach(neighbor => {
        if (!neighbor.bomb && el.numAdjBombs == 0) {
          neighbor.col = 'pink';
          opened_cells.push(neighbor);
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

function mousePressed() {
  const clickedCell = getCellFromPixels(mouseX, mouseY);
  clickedCell.col = 'blue';
  drawGrid();


  // Get where we are in relation to the Canvas. (can hopefully use marginTop and marginLeft)
  // Find which cell was clicked. getCellFromPixels.
  // If a bomb, lose game.
  // If not, turnNeighborsRed.
  // Make sure when clicked, we add the shadow bottom class, to emulate a real button.
}

function mouseDragged() {
  const clickedCell = getCellFromPixels(mouseX, mouseY);
  cells.forEach(cell => cell.col = 'gray');

  clickedCell.col = 'blue';
  drawGrid();
}

// ===============================================================================================

function mouseReleased() {
  // cells.forEach(cell => cell.col = 'gray');
  const clickedCell = getCellFromPixels(mouseX, mouseY);
  // clickedCell.col = 'blue';
  // drawGrid();

  if (clickedCell.bomb) {
    console.log('you lose, sucker!');
  } else {
    console.log(clickedCell);
    turnNeighborsRed(clickedCell);
    drawGrid();
    displayReality(opened_cells);
  }
}

// ===============================================================================================

function getCellFromPixels(x, y) {
  const i = Math.floor(x / cells[0].width);
  const j = Math.floor(y / cells[0].height);
  // console.log(i, j);
  return getCellAt(i, j);
}

// ===============================================================================================

function initializeGrid() {
  for (let i=0; i < numCells; i++) {
    for (let j=0; j < numCells; j++) {
      let cell = {
        x: i,
        y: j,
        col: 'gray',
        height: height / numCells,
        width: width / numCells,
        bomb: false,
        clicked: false,
        flagged: false,
        questioned: false,
        numAdjBombs: 0
      };

      cells.push(cell);
    }
  }
}

// ===============================================================================================

function drawGrid() {
  cells.forEach(cell => {
    fill(cell.col);
    rect(cell.x * cell.width, cell.y * cell.height, cell.width, cell.height);
  });
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

function getCellAt(i, j) {
  // Yeah, foreach just can't handle returns....Weird:
  for (let k=0; k < cells.length; k++) {
    if (cells[k].x == i && cells[k].y == j) return cells[k];
  }

  return null; // I bet if we do this, wouldn't need if statements in getNeighbors...
}

// ===============================================================================================

// n is the number of bombs to be added to the global array BUTTONS:
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

function drawNumBombs(cell) {
  // const p = cell.bomb ? createP('b') : createP(cell.numAdjBombs);
  let p;
  if (cell.bomb) {
    p = createP('b');
  }
  else {
    if (cell.numAdjBombs == 0) p = createP(' ');
    else p = createP(cell.numAdjBombs);
  }

  if (cell.bomb) {
    p.style('color', 'green');
  } else {
    p.style('color', 'black');
  }
  // Yeah, weird and finicky way to get it centered:
  p.position(cell.x * cell.width + marginLeft + cell.width / 2 - 2, cell.y * cell.height + marginTop - cell.height / 2);
}

// ===============================================================================================

function displayReality(cells) {
  cells.forEach(cell => {
    drawNumBombs(cell);
  });
}
