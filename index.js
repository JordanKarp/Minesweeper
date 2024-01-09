const grid = document.getElementById("grid");
const minesIndicator = document.getElementById('minesRemaining')
const timer = document.getElementById('timeElapsed')
let seconds = 0
let stopstatus = 0;

let lockGame = false;
const debug = false;

const ROWS = 9;
const COLS = 9;
const MINES = 10;



function newGame(rows = ROWS, cols = COLS, mines = MINES) {
    window.rows = rows
    window.cols = cols
    window.mines = mines
    window.flags = new Number(mines)
    minesIndicator.innerHTML = window.flags
    resetTimer()
    generateGrid();
}

// Gen Grid
function generateGrid() {
    lockGame = false;
    grid.innerHTML = "";
    for (let i = 0; i < window.rows; i++) {
        let row = grid.insertRow(i);
        for (let j = 0; j < window.cols; j++) {
            let cell = row.insertCell(j);
            cell.onclick = function () { init(this); };
            cell.oncontextmenu = function (e) {
                e.preventDefault();
                markFlag(this);
            };
            let mine = document.createAttribute("mine");
            mine.value = "false";
            cell.setAttributeNode(mine);
        }
    }
    generateMines();
}

function generateMines() {
    for (let i = 0; i < window.mines; i++) {
        let row = Math.floor(Math.random() * window.rows);
        let col = Math.floor(Math.random() * window.cols);
        let cell = grid.rows[row].cells[col];
        cell.setAttribute("mine", "true");
        if (debug) {
            cell.innerHTML = 'X'
        }
    }
}

function startTimer() {
    if(stopstatus!==0){
        clearInterval(stopstatus);
    }
    stopstatus = setInterval(()=>{
        seconds+=1;
        timer.innerHTML = seconds < 10 ?("0" + seconds) : seconds;
    },1000)
    console.log('start')
}

function pauseTimer () {
    clearInterval(stopstatus);
}

function resetTimer() {
    clearInterval(stopstatus);
    seconds = 0;
    timer.innerHTML = '00 ';
}

function revealMines() {
    for (let i = 0; i < window.rows; i++) {
        for (let j = 0; j < window.cols; j++) {
            let cell = grid.rows[i].cells[j];
            if (cell.getAttribute("mine") == 'true') {
                if (cell.className == 'flag') {
                    cell.className = "correct"
                } else {
                    cell.className = "mine"
                }
            }
        }
    }
}

function checkWin() {
    if (checkFlagWin() || checkGameWin()) {
        lockGame = true;
        pauseTimer();
        revealMines();
        alert("You win! You found all the mines!");
        return;
    }
}


function checkFlagWin() {
    let gameComplete = true;
    for (let i = 0; i < window.rows; i++) {
        for (let j = 0; j < window.cols; j++) {
            let cell = grid.rows[i].cells[j];
            // if there are mines that are not flagged, continue game
            if ((cell.getAttribute("mine") == 'true') && (!cell.className.includes("flag"))) {
                gameComplete = false;
            }
            // if there are non-mines that are flagged, continue game
            if ((cell.getAttribute("mine") == 'false') && (cell.className.includes("flag"))) {
                gameComplete = false;
            }
        }
    }
    return gameComplete
}
function checkGameWin() {
    let gameComplete = true;
    for (let i = 0; i < window.rows; i++) {
        for (let j = 0; j < window.cols; j++) {
            let cell = grid.rows[i].cells[j];
            // If there are non-mines that are not activated, continue game
            if ((cell.getAttribute("mine") == 'false') && (!cell.className.includes("active"))) {
                gameComplete = false;
            }
        }
    }
    return gameComplete
}
function markFlag(cell) {
    if (lockGame) {
        return;
    }
    if (cell.className == "flag") {
        cell.className = "";
        window.flags++;
        
    } else if (!cell.className.includes("active")) {
        cell.className = "flag";
        window.flags--;
    }
    minesIndicator.innerHTML = window.flags;
    checkWin();
}

function init(cell) {
    if (lockGame || cell.className == "flag") {
        return;
    }
    if (cell.getAttribute("mine") == "true") {
        cell.innerHTML = "X"
        pauseTimer();
        revealMines();
        lockGame = true;
       
    } else {
        if (seconds == 0) {
            startTimer()
        }

        cell.className = "active";
        let mineCount = 0;
        let cellRow = cell.parentNode.rowIndex;
        let cellCol = cell.cellIndex;
        for (let i = Math.max(cellRow - 1, 0); i <= Math.min(cellRow + 1, window.rows - 1); i++) {
            for (let j = Math.max(cellCol - 1, 0); j <= Math.min(cellCol + 1, window.cols - 1); j++) {
                if (grid.rows[i].cells[j].getAttribute("mine") == "true") {
                    mineCount++;
                }
            }
        }

        cell.innerHTML = mineCount;
        cell.className += " " + mineCount.toString()

        // Check neighbors and expand outwards if there are 0 mines nearby.
        if (mineCount == 0) {
            cell.innerHTML = " ";
            for (let i = Math.max(cellRow - 1, 0); i <= Math.min(cellRow + 1, window.rows - 1); i++) {
                for (let j = Math.max(cellCol - 1, 0); j <= Math.min(cellCol + 1, window.cols - 1); j++) {
                    if (grid.rows[i].cells[j].innerHTML == "") {
                        init(grid.rows[i].cells[j]);
                    }
                }
            }
        }
        checkWin();
    }
}