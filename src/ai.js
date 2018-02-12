const STRATEGIES = ['naive','basic','medium','advanced','pro'];

class Ai {
  constructor(boardSize, mark) {
    this.mark = mark;
    this.winningLines = combineLines(boardSize);
    this.strategyId = 0;
    //bind this to methods that relay on it
    this.bindThis();
  }

  bindThis(methods) {
    this.winOrBlock = this.winOrBlock.bind(this);
    this.side = this.side.bind(this);
    this.corner = this.corner.bind(this);
    this.oppositeCorner = this.oppositeCorner.bind(this);
  }

  playStrategy(squares, callback) {
    const strategyMethods = {
      naive:    [this.any],
      basic:    [this.winOrBlock, this.side, this.any],
      medium:   [this.opening, this.winOrBlock, this.corner, this.any],
      advanced: [this.opening, this.winOrBlock, this.center, this.corner, this.any],
      pro:      [this.opening, this.winOrBlock, this.oppositeCorner, this.center,
                   this.corner, this.any],
    };

    console.log('strategy: ',STRATEGIES[this.strategyId]);
    const methods = strategyMethods[STRATEGIES[this.strategyId]];
    for(let i=0; i<methods.length; i++) {
      const square = methods[i](squares);
      if(square !== null) {
        waitAndCommit(callback, square);
        return;
      }
    }
  }

  revisitStrategy(points, previousWinnerMark) {
    // TODO: when ai has got a big lead, strategy drops and stays naive
    // as long as opponent reaches points
    const opponentMark = this.mark ? 'X' : 'O';
    const diff = points[this.mark] - points[opponentMark];
    if(diff < 0 && this.strategyId < STRATEGIES.length)
      this.strategyId+=1;
    else if( previousWinnerMark === this.mark && diff > 2 && this.strategyId > 0)
      this.strategyId-=1;
  }

  center(squares) {
    const center = 4;
    if(!squares[center])
      return center;
    else
      return null;
  }

  any(squares) {
    var freeSquares = [];
    for(let i=0; i<squares.length; i++) {
      if(squares[i] === null) {
        freeSquares.push(i);
      }
    }
    freeSquares.sort(() => Math.random() * 2 - 1);
    return freeSquares[0];
  }

  opening(squares) {
    const five = [0,2,4,6,8];
    if(isEmpty(squares)) {
      five.sort(() => Math.random() * 2 - 1);
      return five[0];
    }
    return null;
  }

  oppositeCorner(squares) {
    const opponentMark = this.mark ? 'X' : 'O';
    const corners = [[0,8], [2,6], [6,2], [8,0]];
    for(let i=0; i<corners.length; i++) {
      if(squares[corners[i][0]] === opponentMark &&
          squares[corners[i][1]] === null)
        return corners[i][1];
    }
    return null;
  }

  corner(squares) {
    const corners = [0,2,6,8];
    return this.targetSquares(squares, corners);
  }

  side(squares) {
    const sides = [1,3,5,7];
    return this.targetSquares(squares, sides);
  }

  targetSquares(squares, target) {
    let emptySquares = [];
    for(let i=0; i<target.length; i++) {
      if(squares[target[i]] === null)
        emptySquares.push(target[i]);
    }
    if(emptySquares.length > 0) {
      emptySquares.sort(() => Math.random() * 2 - 1);
      return emptySquares[0];
    } else
      return null;
  }

  winOrBlock(squares) {
    let alt = [];
    for (let i = 0; i < this.winningLines.length; i++) {
      const [a, b, c] = this.winningLines[i].squares;
      if ( squares[c] && squares[c] === squares[b] && !squares[a] )
        alt.push([a,b]);
      if ( squares[a] && squares[a] === squares[c] && !squares[b] )
        alt.push([b,a]);
      if ( squares[a] && squares[a] === squares[b] && !squares[c] )
        alt.push([c,a]);
    }

    if(alt.length === 1) {
      return alt[0][0];
    } else if(alt.length === 2) {
      // prefer own winning line
      for(let i = 0; i< alt.length; i++) {
        if (squares[alt[i][1]] === this.mark) {
          return alt[i][0];
        }
      }
      // oppponen has a fork! ai will lose game, block either
      return alt[0][0];
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

  isFull(squares) {
    for(let i=0; i<squares.length; i++) {
      if(!squares[i])
        return false;
    }
    return true;
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

function isEmpty(squares) {
  for(let i=0; i<squares.length; i++) {
    if(squares[i])
      return false;
  }
  return true;
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

export default Ai;
