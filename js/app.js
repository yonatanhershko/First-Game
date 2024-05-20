'use strict'

const WALL = 'WALL'
const FLOOR = 'FLOOR'
const BALL = 'BALL'
const GAMER = 'GAMER'
const GLUE = 'GLUE'

var gGlueInterval
var gBallInterval
var gBallCount
var gBallAround
var count
var gIsGlue
var elBtn = document.querySelector('button')

const GAMER_IMG = '<img src="img/Yonatan (1).jpeg">'
const BALL_IMG = '<img src="img/Lola.jpeg">'
const GLUE_IMG = '🍥'

// Model:
var gBoard
var gGamerPos
var gBallWin


function onInitGame() {
	gGamerPos = { i: 2, j: 9 }
	gBoard = buildBoard()
	renderBoard(gBoard)
	gBallCount = 0
	gBallWin = 2
	gBallInterval = setInterval(addBall, 5000)
	gGlueInterval = setInterval(addGlue, 5000)
}

function buildBoard() {
	// Create the Matrix 10 * 12 
	const board = createMat(10, 12)
	// Put FLOOR everywhere and WALL at edges 
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			board[i][j] = { type: FLOOR, gameElement: null }
			if (i === 0 || i === board.length - 1 || j === 0 || j === board[0].length - 1) {
				board[i][j].type = WALL
			}
		}
	}


	////midOp// M

	board[0][5].type = FLOOR /// i u
	board[9][5].type = FLOOR/// i d
	board[5][0].type = FLOOR/// j l
	board[5][11].type = FLOOR /// jr

	// Place the gamer and two balls
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER
	board[2][4].gameElement = BALL
	board[7][6].gameElement = BALL


	console.log(board)
	return board
}



// Render the board to an HTML table
function renderBoard(board) {

	var strHTML = ''
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>'
		for (var j = 0; j < board[0].length; j++) {
			const currCell = board[i][j] // {type,gameElement}

			var cellClass = getClassName({ i: i, j: j }) // 'cell-0-0'

			if (currCell.type === FLOOR) cellClass += ' floor' // 'cell-0-0 floor'
			else if (currCell.type === WALL) cellClass += ' wall' // 'cell-0-0 wall'

			strHTML += '<td class="cell ' + cellClass + '"  onclick="moveTo(' + i + ',' + j + ')" >'

			if (currCell.gameElement === GAMER) {
				strHTML += GAMER_IMG
			} else if (currCell.gameElement === BALL) {
				strHTML += BALL_IMG
			}

			strHTML += '</td>'
		}
		strHTML += '</tr>'
	}

	const elBoard = document.querySelector('.board')
	elBoard.innerHTML = strHTML
}

// Move the player to a specific location
function moveTo(i, j) {
	if (gIsGlue) return
	console.log('i, j:', i, j)
	count = document.querySelector('h2 span')
	var ballsAround = document.querySelector('h3 span')
	const targetCell = gBoard[i][j]
	if (targetCell.type === WALL) return

	// Calculate distance to make sure we are moving to a neighbor cell
	const iAbsDiff = Math.abs(i - gGamerPos.i) // 1 ,2..
	const jAbsDiff = Math.abs(j - gGamerPos.j) // 1 ,7...

	// If the clicked Cell is one of the four allowed
	if ((iAbsDiff === 1 && jAbsDiff === 0) ||
		(jAbsDiff === 1 && iAbsDiff === 0)) {
		// console.log('MOVE')

		if (targetCell.gameElement === BALL) {
			gBallCount++
			console.log('Collecting!', gBallCount)
			gBallWin--
			playSound()
			GameOver()
			count.innerText = gBallCount
		} else if (targetCell.gameElement === GLUE) {
			gIsGlue = true
			setTimeout(() =>
				{gIsGlue = false},3000)
		}

		// Move the gamer
		// Moving from current position:
		// Model: //מעיף אותו מהמקום הישן
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = null

		// Dom:
		renderCell(gGamerPos, '')

		// Moving to selected position:
		// Model:///לעדכן אותו במקום החדש
		gBoard[i][j].gameElement = GAMER
		gGamerPos.i = i
		gGamerPos.j = j

		// Dom:
		if (gGamerPos.i === gBoard.length - 1) {
			gGamerPos.i = 0
		} else if (gGamerPos.i === 0) {
			gGamerPos.i = gBoard.length - 1
		}
		if (gGamerPos.j === gBoard[0].length - 1) {
			gGamerPos.j = 0
		} else if (gGamerPos.j === 0) {
			gGamerPos.j = gBoard[0].length - 1
		}
		///שם אותו בלוח במקום החדש
		renderCell(gGamerPos, GAMER_IMG)
		countNegs(gGamerPos.i, gGamerPos.j, gBoard)
		ballsAround.innerText = gBallAround

	} else console.log('TOO FAR', iAbsDiff, jAbsDiff)
	}


// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
	const cellSelector = '.' + getClassName(location)// .cell
	const elCell = document.querySelector(cellSelector)
	elCell.innerHTML = value
}

// Move the player by keyboard arrows
function onHandleKey(event) {
	// console.log('event:', event)
	const i = gGamerPos.i // 2
	const j = gGamerPos.j // 9

	switch (event.key) {
		case 'ArrowLeft':
			moveTo(i, j - 1)
			break
		case 'ArrowRight':
			moveTo(i, j + 1)
			break
		case 'ArrowUp':
			moveTo(i - 1, j)
			break
		case 'ArrowDown':
			moveTo(i + 1, j)
			break
	}
}

// Returns the class name for a specific cell
function getClassName(location) { // {i:2,j:4}
	const cellClass = `cell-${location.i}-${location.j}` // 'cell-2-4'
	return cellClass
}


function addGlue() {
	var pos = findEmptyPos();
	gBoard[pos.i][pos.j].gameElement = GLUE;
	renderCell(pos, GLUE_IMG);
	setTimeout(() => {
		if (gBoard[pos.i][pos.j].gameElement === GLUE) {
			gBoard[pos.i][pos.j].gameElement = null
			renderCell({ i: pos.i, j: pos.j }, '')}
	}, 3000);
}

function addBall() {
	var pos = findEmptyPos()
	gBoard[pos.i][pos.j].gameElement = BALL
	renderCell(pos, BALL_IMG)
	gBallWin++
}

function findEmptyPos() {
	// var emptyPoss = [{i:0,j:0},{i:0,j:1}]
	var emptyPoss = []

	for (var i = 0; i < gBoard.length; i++) {
		for (var j = 0; j < gBoard.length; j++) {
			var cell = gBoard[i][j]
			if (cell.type === FLOOR && cell.gameElement === null) {
				var pos = { i: i, j: j }
				// console.log('pos:', pos)
				emptyPoss.push(pos)
			}
		}
	}
	// console.log('emptyPoss:', emptyPoss)
	var randIdx = getRandomInt(0, emptyPoss.length) // 0 , 1
	// console.log('randIdx:', randIdx)
	var randPos = emptyPoss[randIdx] //{}
	console.log('randPos:', randPos)
	return randPos
}


function playSound() {
	const sound = new Audio('eating.mp3')
	sound.play()
}


function GameOver() {
	if (gBallWin === 0) {
		elBtn.style.display = 'block'
		clearInterval(gBallInterval)
		clearInterval(gGlueInterval)
		console.log('ended')
	}
}

function restart() {
	onInitGame()
	count.innerText = 0
	elBtn.style.display = 'none'
}



function countNegs(cellI, cellJ, gBoard) {
	// console.log(gBoard, 'great');
	gBallAround = 0
	for (var i = cellI - 1; i <= cellI + 1; i++) {
		if (i < 0 || i >= gBoard.length) continue
		for (var j = cellJ - 1; j <= cellJ + 1; j++) {
			if (j < 0 || j >= gBoard[i].length) continue
			if (i === cellI && j === cellJ) continue
			if (gBoard[i][j].gameElement === BALL) gBallAround++
		}
	}
	console.log('great', gBallAround);
	return gBallAround
}









// return (x>9)? true: false