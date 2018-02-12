class Ai {
  constructor(boardSize, mark) {
    this.mark = mark;
    this.winningLines = combineLines(boardSize);
  }


  turn(squares, callback) {
    // opening turn
    if(this.isEmpty(squares)) {
      waitAndCommit(callback, this.openingTurn(squares));
      return;
    }

    // win or defend
    var square = this.winOrBlock(squares);
    if(square !== null) {
      waitAndCommit(callback, square);
      return;
    }

    // play opposite corner
    square = this.oppositeCorner(squares);
    if(square !== null) {
      waitAndCommit(callback, square);
      return;
    }

    // play center of (3x3) board
    const center = 4;
    if(!squares[center]) {
      waitAndCommit(callback, center);
      return;
    }

    // play empty corner
    square = this.emptyCorner(squares);
    if(square !== null) {
      waitAndCommit(callback, square);
      return;
    }

    // any free cell
    waitAndCommit(callback, this.anySquare(squares));

  }

  anySquare(squares) {
    var freeSquares = [];
    for(let i=0; i<squares.length; i++) {
      if(squares[i] === null) {
        freeSquares.push(i);
      }
    }
    freeSquares.sort(() => Math.random() * 2 - 1);
    return freeSquares[0];
  }

  openingTurn(squares) {
    const five = [0,2,4,6,8];
    five.sort(() => Math.random() * 2 - 1);
    return five[0];
  }

  oppositeCorner(squares) {
    const corners = [[0,8], [2,6], [6,2], [8,0]];
    for(let i=0; i<corners.length; i++) {
      if(squares[corners[i][0]] === this.getOpponentMark() &&
          squares[corners[i][1]] === null)
        return corners[i][1];
    }
    return null;
  }

  emptyCorner(squares) {
    const corners = [0,2,6,8];
    var emptyCorners = [];
    for(let i=0; i<corners.length; i++) {
      if(squares[corners[i]] === null)
        emptyCorners.push(corners[i]);
    }
    if(emptyCorners.length > 0) {
      emptyCorners.sort(() => Math.random() * 2 - 1);
      return emptyCorners[0];
    } else
      return null;
  }

  winOrBlock(squares) {
    var alt = [];
    for (let i = 0; i < this.winningLines.length; i++) {
      const [a, b, c] = this.winningLines[i].squares;
      if ( squares[c] && squares[c] === squares[b] && !squares[a] )
        alt.push([a,b]);
      if ( squares[a] && squares[a] === squares[c] && !squares[b] )
        alt.push([b,a]);
      if ( squares[a] && squares[a] === squares[b] && !squares[c] )
        alt.push([c,a]);
    }

    if(alt.length === 1)
      return alt[0][0];
    // prefer winning line
    for(let i = 0; i< alt.length; i++) {
      if (squares[alt[i][1]] === this.mark) {
        return alt[i][0];
      }
    }

    return null;
  }

  calculateWinner(squares) {

    for (let i = 0; i < this.winningLines.length; i++) {
      const line = this.winningLines[i];
      const [a, b, c] = line.squares;
      if (squares[a] && squares[a] === squares[b] &&
          squares[a] === squares[c]) {
            line.setMark(squares[a]);
        return line;
      }
    }
    return null;
  }

  isEmpty(squares) {
    for(let i=0; i<squares.length; i++) {
      if(squares[i])
        return false;
    }
    return true;
  }

  isFull(squares) {
    for(let i=0; i<squares.length; i++) {
      if(!squares[i])
        return false;
    }
    return true;
  }

  getOpponentMark() {
    return this.mark ? 'X' : 'O';
  }

}

class Line {
  constructor(squares, angle) {
    this.squares = squares;
    this.angle = angle;
  }

  setMark(mark) {
    this.mark = mark;
  }
}

const MIN_DELAY = 300;
const MAX_DELAY = 1000;

function waitAndCommit(callback, square) {
    const delay = Math.random()*(MAX_DELAY-MIN_DELAY);
    setTimeout(() => {
      callback(square);
    }, delay);
}

function combineLines(size) {
  var lines = []
  const n = 3;
  var board = squareMatrix(size);

  for( let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const linesFound = findLines(board, i, j, n)
      if (linesFound.length > 0)
        lines.push.apply(lines,linesFound);  // push.apply = extend
    }
  }

  return lines;
}

function findLines(board, i, j, n) {
  var lines = [];

  const hl = horiLine(board, i, j, n);
  if (hl.length === n) {
    lines.push(new Line(hl, 0));
  }
  const vl = vertLine(board, i, j, n);
  if (vl.length === n)
    lines.push(new Line(vl, 90));

  const dr = diagRLine(board, i, j, n);
  if (dr.length === n)
    lines.push(new Line(dr, 45));

  const dl = diagLLine(board, i, j, n);
  if (dl.length === n)
    lines.push(new Line(dl, 135));

  return lines;
}

function horiLine(board, i, j, n) {
  var line = [];
  if (j > board.length - n)
    return line;
  for(let k = 0; k<n; k++)
    line.push(board[i][j+k]);

  return line;
}

function vertLine(board, i, j, n) {
  var line = [];
  if (i > board.length - n)
    return line;
  for(let k = 0; k<n; k++)
    line.push(board[i+k][j]);

  return line;
}

function diagLLine(board, i, j, n) {
  var line = [];
  if ( (i > board.length - n) || (j < n-1))
    return line;


  for(let k = 0; k<n; k++)
    line.push(board[i+k][j-k]);

  return line;
}

function diagRLine(board, i, j, n) {
  var line = [];
  if ( (i > board.length - n) || (j > board.length-n))
    return line;

  for(let k = 0; k<n; k++)
    line.push(board[i+k][j+k]);

  return line;
}

function squareMatrix(n) {
  var matrix = Array(n);
  for(let i=0; i<n; i++) {
    var row = Array(n);
    for(let j=0; j<n; j++) {
      row[j] = i*n+j;
    }
    matrix[i] = row;
  }
  return matrix;
}

module.exports = Ai;
