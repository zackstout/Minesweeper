
let width, height;
const marginLeft = 30;
const marginTop = 30;
let numberButtons;
let buttons = [];


function setup() {
  width = 600;
  height = 600;
  numberButtons = 25;

  createCanvas(width, height);
  drawGrid();
  prepareBombs(20);
  displayReality();
}


function handleButton() {
  let neighbors = getNeighbors(this.x, this.y);
  console.log(neighbors);
}


function drawGrid() {
  for (let i=0; i < numberButtons; i++) {
    for (let j=0; j < numberButtons; j++) {
      let button = createButton(' ');
      button.position(marginLeft + i * numberButtons * 3/4, marginTop + j * numberButtons * 3/4);
      button.x = i;
      button.y = j;

      // Alternative notation:
      button.location = {
        x: i,
        y: j
      };

      button.bomb = false;

      button.mousePressed(handleButton);
      buttons.push(button); // methinks we need a global array
    }
  }
}


// i is the x-coordinate, j the y-coordinate of the button:
function getNeighbors(i, j) {
  let neighbors = [];
  // This won't work: we need the BUTTON at the point, which is where the data is stored.

  const top = getButtonAt(i - 1, j);
  const bottom = getButtonAt(i + 1, j);
  const left = getButtonAt(i, j - 1);
  const right = getButtonAt(i, j + 1);
  // if (i > 0) neighbors.push({x: i - 1, y: j}); // top
  // if (j > 0) neighbors.push({x: i, y: j - 1}); // left
  // if (i < numberButtons - 1) neighbors.push({x: i + 1, y: j}); // bottom
  // if (j < numberButtons - 1) neighbors.push({x: i , y: j + 1}); // right

  if (i > 0) neighbors.push(top);
  if (j > 0) neighbors.push(left);
  if (i < numberButtons - 1) neighbors.push(bottom);
  if (j < numberButtons - 1) neighbors.push(right);

  return neighbors;
}

// throw caution to the winds:
function getButtonAt(i, j) {
  // buttons.forEach(btn => {
  //   if (btn.x == i && btn.y == j) return btn;
  //   else return 'what';
  // });

  // Yeah, foreach just can't handle returns....Weird:
  for (let k=0; k < buttons.length; k++) {
    const btn = buttons[k];
    if (btn.x == i && btn.y == j) {
      return btn;
    }
  }
}


// n is the number of bombs to be added to the global array BUTTONS:
function prepareBombs(n) {
  let count = n;
  let randomIndices = [];

  // Generate random indices (ensuring no duplicates):
  while (count > 0) {
    let index = Math.floor(Math.random() * numberButtons * numberButtons);
    if (!randomIndices.includes(index)) {
      randomIndices.push(index);
      count --;
    }
  }

  addBombs(randomIndices);
}


// For each index, find where it lives in the buttons array:
function addBombs(arr) {
  arr.forEach(ind => {
    let x = Math.floor(ind / numberButtons);
    let y = ind % numberButtons;

    // Loop through buttons array to add bombs to proper cells:
    buttons.forEach(button => {
      if (button.x == x && button.y == y) {
        button.bomb = true;
      }
    });
  });

  console.log(buttons.filter(function(x) {
     return x.bomb;
  }));
}



function displayReality() {
  buttons.forEach(btn => {
    let res = 0;
    getNeighbors(btn.x, btn.y).forEach(neighbor => {
      if (neighbor.bomb) {
        res ++;
      }
    });

    let p = createP(res);
    p.position(marginLeft + btn.x * numberButtons * 3/4, marginTop + btn.y * numberButtons * 3/4);
  });
}
