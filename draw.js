
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
let ctx;

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
  // ctx = canv.getContext('2d');

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
        col: 'gray',
        hovered: false,
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

// function doubleClicked() {
//
// }


// function draw() {
//   if (mouseIsPressed) {
//     const clickedCell = getCellFromPixels(mouseX, mouseY);
//
//     // if (mouseButton === LEFT) {
//     //   console.log('left');
//     //   clickedCell.col = 'blue';
//     // } else {
//     //
//     // }
//     // drawGrid();
//   }
// }


function mousePressed() {
  const clickedCell = getCellFromPixels(mouseX, mouseY);
  cells.forEach(cell => {
    cell.hovered = false;
  });
  clickedCell.hovered = true;
  drawGrid();
  displayReality(opened_cells);
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
  displayReality(opened_cells);
}

// ===============================================================================================

function mouseReleased() {
  const clickedCell = getCellFromPixels(mouseX, mouseY);
  clickedCell.hovered = false;
  //clickedCell.clicked = true; // does this matter? No -- it happens in the recursive call

  if (mouseButton === LEFT) {
    if (clickedCell.bomb) {
      console.log('you lose, sucker!');
      clearInterval(gameTimer);
    } else {
      console.log(clickedCell);
      turnNeighborsRed(clickedCell);
      // displayReality(opened_cells);
    }
  } else {
    console.log('right');

    if (!containsCell(flags, clickedCell) && !containsCell(questions, clickedCell)) {
      // will this make the next condition trigger? One would hope not.
      // clickedCell.flagged = true;
      flags.push(clickedCell);
    } else if (containsCell(flags, clickedCell)) {
      // clickedCell.flagged = false;
      // clickedCell.questioned = true;
      findAndRemoveCell(flags, clickedCell);
      questions.push(clickedCell);
    } else if (containsCell(questions, clickedCell)) {
      // clickedCell.questioned = false;
      findAndRemoveCell(questions, clickedCell);
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
    el.col = 'pink';
    opened_cells.push(el);
    if (!el.clicked) {
      let neighbors = getNeighbors(el.x, el.y);
      neighbors.forEach(neighbor => {
        if (!neighbor.bomb && el.numAdjBombs == 0) {
          neighbor.col = 'pink';
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
    fill(cell.col);
    if (cell.hovered) fill('blue');
    rect(cell.x * cell.width, cell.y * cell.height, cell.width, cell.height);

    // Adding this makes it intolerably slow. So the problem must be that drawGrid is being called too much:
    // let p;
    // if (cell.flagged) {
    //   p = createP('f');
    // }
    // else if (cell.questioned) {
    //   p = createP('?');
    // }
    // else {
    //   // p.remove();
    //   p = createP(' ');
    // }
    // // } p = createP('');
    //
    // p.position(cell.x * cell.width + marginLeft + cell.width/2 - 2, cell.y * cell.height + marginTop - cell.height/2);
  });
}

// ===============================================================================================

function drawNumBombs(cell) {
  // what??? the math is so weird.
  const posX = (cell.x - 2) * cell.width + marginLeft ;
  const posY = (cell.y - 4) * cell.height + marginTop ;

  fill('black');
  if (cell.bomb) {
    // p = createP('b');
    // p.style('color', 'green');
    text('b', posX, posY);
  }
  else {
    if (cell.numAdjBombs == 0) {
      // p = createP(' ');
      text(' ', posX, posY);
    } else {
      // p = createP(cell.numAdjBombs);
      text(cell.numAdjBombs, posX, posY);
    }
    // p.style('color', 'black');
  }

  // Yeah, weird and finicky way to get it centered:
  // p.position(cell.x * cell.width + marginLeft + cell.width / 2 - 2, cell.y * cell.height + marginTop - cell.height / 2);
}

// ===============================================================================================

function displayReality(cells, flags=[], questions=[]) {
  console.log(ctx);
  cells.forEach(cell => {
    drawNumBombs(cell);
  });
  // flags.forEach(flag => {
  //   p = createP('f');
  //   p.position(flag.x * flag.width + marginLeft + flag.width/2 - 2, flag.y * flag.height + marginTop - flag.height / 2);
  // });
  // questions.forEach(question => {
  //   p = createP('?');
  //   p.position(question.x * question.width + marginLeft + question.width/2 - 2, question.y * question.height + marginTop - question.height / 2);
  // });
}

// ===============================================================================================
