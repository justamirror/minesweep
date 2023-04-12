Math.sum = function (...args) {
  let i = 0;
  for (let number of args) {
    i += number;
  }
  return i;
} //bhj
function random(b,e) {
  if (b>e) {
    let ob = b;
    b = e;
    e = ob;
  }
  return Math.floor(Math.random()*(e-b+1)) + b
}
let mineField = [];
let clickAmount = 0;
function initField(height, width) {
  let field = document.getElementById('field');
  mineField = [];
  clickAmount = 0;
  mineField.height = height;
  mineField.width = width;
  
  mineField.status = [];
  mineField.needed = height * width;
  
  field.innerHTML = '';
  field.style.width = `${width * 36}px`;
  for (let y = 0; y < height; y++) {
    let line = document.createElement('line');
    line.style.width = `${width * 36}px`;
    let digLine = []
    for (let x = 0; x < width; x++) {
      let mine = document.createElement('mine');
      line.appendChild(mine);
      mine.setAttribute('onclick', `if (ended) return false; clickAmount++; if (clickAmount === 1) {firstClick(${x}, ${y})} floodFill(${x}, ${y})`);
      mine.setAttribute('oncontextmenu', `if (ended) return false; return toggleFlag(${x}, ${y})`)
      let mineObj = {
        isMine: false,
        dom: mine,
        value: 0,
        flag: 0,
        visible: false,
        x: x,
        y: y
      }
      digLine.push(mineObj)
      __refreshMine(mineObj)
    }
    field.appendChild(line)
    mineField.push(digLine)
  }
}
function edgeMine() {
  return {
    value: 0,
    isMine: false,
    dom: document.createElement('mine'),
    visible: true,
    flag: 0,
    isEdge: true,
    x: -1000,
    y: -1000
  }
}
function getMine(x, y) {
  let line = mineField[y];
  if (line === undefined) {
    return edgeMine()
  }
  let mine = line[x];
  if (mine === undefined) {
    return edgeMine()
  }
  mine.x = x;
  mine.y = y;
  return mine;
}
function toggleFlag(x, y) {
  let mine = getMine(x, y);
  mine.flag = Number(!mine.flag);
  refreshMine(x, y);
  return false;
}
function setMine(x, y, isMine) {
  let mine = getMine(x, y);
  if (mine.isMine === isMine) {
    return
  }
  mine.isMine = isMine;
  if (isMine) {
    mineField.status[mine.x + (mine.y * mineField.width)] = 1;
  }
  let change = -1;
  if (isMine) {
    change = 1;
  }
  
  for (let offsetX = -1; offsetX < 2; offsetX++) {
    for (let offsetY = -1; offsetY < 2; offsetY++) {
      let mine = getMine(x + offsetX, y + offsetY);
      mine.value += change
      refreshMine(x + offsetX, y + offsetY)
    }
  }
}
function showMine(x, y) {
  let mine = getMine(x, y);
  mine.visible = true;
  refreshMine(x, y)
}
function firstClick(x, y) {
  generateMines(Number(mineAmount.value), x, y)
}
function floodFill(x, y) {
  let arr = [];
  let alreadySeen = []
  function floodFill(...args) {
    let ind = `${args[0]}-${args[1]}`;
    if (alreadySeen.includes(ind)) {
      return
    }
    arr.push(args);
    alreadySeen.push(ind)
  }
  floodFill(x, y, true)
  while (arr.length > 0) {
    (function (){ 
      let [x, y, denoMine] = arr.pop();
      let mine = getMine(x, y);
      if (mine.isMine) {
        console.log('Mine')
        if (denoMine) {
          return showMine(x, y)
        }
        return
      }
      showMine(x, y);
      if (!isEmpty(x, y)) {
        return console.log('Not Empty')
      }
      if (mine.isEdge) {
        return console.log('Edge')
      }
      for (let offsetX = -1; offsetX < 2; offsetX++) {
        for (let offsetY = -1; offsetY < 2; offsetY++) {
          floodFill(x + offsetX, y + offsetY);
        }
      }
    })()
  }
}

function isEmpty(x, y) {
  return getMine(x, y).value === 0;
}
function refreshMine(x, y) {
  return __refreshMine(getMine(x, y))
}
function __refreshMine(mine) {
  if (mine.isEdge) {
    return
  }
  if (!mine.isMine) {
    mineField.status[mine.x + (mine.y * mineField.width)] = mine.visible;
    if (Math.sum(...mineField.status) === mineField.needed) {
      endGame('You win!', 'Play again.')
    }
  }
  if (!mine.visible) {
    mine.dom.innerText = '';
    mine.dom.className = 'hidden';
    if (mine.flag === 1) {
      mine.dom.classList.add('flag')
    }
    return;
  }
  mine.dom.className = '';
  if (mine.isMine) {
    mine.dom.innerText = '💣';
    endGame('You lose!', 'Try again');
  } else {  
    mine.dom.innerText = mine.value ? mine.value : '';
  }
}
function mineIsAround(x, y, x2, y2) {
  return (Math.abs(x-x2) < 2) && (Math.abs(y-y2) < 2)
}
function generateMines(amount, firstClickX, firstClickY) {  
  let minesLeft = amount;
  let squaresLeft = mineField.height * mineField.width;
  
  for (let x = 0; x < mineField.width; x++) {
    for (let y = 0; y < mineField.height; y++) {
      if (!mineIsAround(firstClickX, firstClickY, x, y) && (Math.random() <= (minesLeft / squaresLeft))) {
        setMine(x, y, true);
        minesLeft--;
        if (minesLeft === 0) {
          return
        }
      }
      squaresLeft--;
    }
  }
}
let ended = false;
function endGame(d, e) {
  ended = true;
  endgame.style.display = 'block';
  endgame.innerHTML = d;
  replayButton.innerText = e;
}
replayButton.onclick = function () {
  initField(Number(fieldHeight.value), Number(fieldWidth.value));
  endgame.style.display = '';
  replayButton.innerText = 'New Game';

  ended = false;
}
function addConfig(desc, type, displayValue, props, callback=()=>{}) {
  config.appendChild(document.createTextNode(desc+': '));
  
  if (displayValue === undefined) {
    displayValue = false;
    if (['range'].includes(type)) {
      displayValue = true;
    }
  }
  let input = document.createElement('input');
  input.setAttribute('type', type);
  let refreshValues = []
  Object.entries(props).forEach(([name, value])=>{
    if (!name.startsWith('on') && typeof value === 'function') {
      refreshValues.push([name, value]);
      value = value()
    }
    input.setAttribute(name, value)
  });
  function refresh() {
    refreshValues.forEach(([name, value])=>{
      input.setAttribute(name, value())
    })
    if (displayValue) {
      valueDisplay.textContent = ' = ' + input.value
    }
  }
  input.onchange = function () {
    refresh();
    callback(input.value);
    if (displayValue) {
      valueDisplay.textContent = ' = ' + input.value
    }
  }
  config.appendChild(input);
  if (displayValue) {
    var valueDisplay = document.createTextNode(' = ' + input.value);
    config.appendChild(valueDisplay)
  }
  config.appendChild(document.createElement('br'))
  let ret = {
    refresh: refresh
  }
  Object.defineProperty(ret, 'value', {
    get: () => input.value,
    set: (value) => input.value = value
  });
  return ret
}
let configApi = {
  slider: function ({description, min, max, defaultValue}, callback) {
    return addConfig(description, 'range', undefined, { min: min, max: max, value: defaultValue || 0}, callback)
  }
}

function scaleMineAmount() {
  mineAmount.value = Math.floor(Number(fieldHeight.value)*Number(fieldWidth.value))/3;
  mineAmount.refresh();
}

let fieldHeight = configApi.slider({
  description: 'Height of grid',
  min: 5,
  max: 50,
  defaultValue: 10
}, scaleMineAmount)

let fieldWidth = configApi.slider({
  description: 'Width of grid',
  min: 5,
  max: 50,
  defaultValue: 10
}, scaleMineAmount)

let mineAmount = configApi.slider({
  description: 'Amount of mines',
  min: 1,
  max: ()  => (fieldHeight.value * fieldWidth.value) - 9,
  defaultValue: 33
})
initField(Number(fieldHeight.value), Number(fieldWidth.value))
