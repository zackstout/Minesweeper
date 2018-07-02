
let width, height;
const marginLeft = 30;
const marginTop = 60;
let numberButtons;
let buttons = [];
const numBombs = 80;
let clicked = [];

function setup() {
  width = 600;
  height = 600;
  numberButtons = 25;

  createCanvas(width, height);
  drawGrid();
  prepareBombs(numBombs);
  displayReality();
}

// We could probably just store "clicked" as a boolean on each button....
// function includesObj(arr, obj) {
//   for (let i=0; i < arr.length; i++) {
//     let el = arr[i];
//     if (el.x == obj.x && el.y == obj.y) return true;
//   }
//   return false;
// }


// Yes, the recursion works!
function turnNeighborsRed(el) {
  el.style('background-color', 'red');

  if (!el.clicked) {
    let neighbors = getNeighbors(el.x, el.y);
    neighbors.forEach(neighbor => {
      neighbor.style('background-color', 'red');

      if (neighbor.res == 0) {
        el.clicked = true; // Yes this had to happen before the recursive call:
        turnNeighborsRed(neighbor);
      }
    });
  }


}


function handleButton() {
  // let neighbors = getNeighbors(this.x, this.y);
  console.log(this);
  // // remove(this);
  // turnRed(this);
  // neighbors.forEach(neighbor => {
  //   console.log('hi');
  // });
  turnNeighborsRed(this);
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

  const top = getButtonAt(i - 1, j);
  const bottom = getButtonAt(i + 1, j);
  const left = getButtonAt(i, j - 1);
  const right = getButtonAt(i, j + 1);
  const top_right = getButtonAt(i - 1, j + 1);
  const top_left = getButtonAt(i - 1, j - 1);
  const bottom_right = getButtonAt(i + 1, j + 1);
  const bottom_left = getButtonAt(i + 1, j - 1);

  if (i > 0) neighbors.push(top);
  if (j > 0) neighbors.push(left);
  if (i < numberButtons - 1) neighbors.push(bottom);
  if (j < numberButtons - 1) neighbors.push(right);
  if (i > 0 && j > 0) neighbors.push(top_left);
  if (i > 0 && j < numberButtons - 1) neighbors.push(top_right);
  if (i < numberButtons - 1 && j > 0) neighbors.push(bottom_left);
  if (i < numberButtons - 1 && j < numberButtons - 1) neighbors.push(bottom_right);

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

    // store value on button -- only needs to be done once though:
    btn.res = res;
    btn.clicked = false; // initialize this

    textAlign(CENTER, CENTER);
    let p = createP(res);
    if (btn.bomb) {
      p.style('color', 'green');
    } else {
      p.style('color', 'black');
    }

    p.position(marginLeft + btn.x * numberButtons * 3/4, marginTop + (btn.y - 1) * numberButtons * 3/4);
  });
}
