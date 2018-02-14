class Game {
  constructor(boardSize, lineLength) {
    this.boardSize = boardSize;
    this.lineLength = lineLength;
    this.squares = [];
    this.new(boardSize, lineLength);
    this.xIsNext = true;

    // TODO: -> lines
    this.winningLines = this.combineLines(boardSize, lineLength);
  }

  new() {
    this.squares = Array(this.boardSize * this.lineLength).fill(null);
    return this.squares;
  }

  setSquares(squares) {
    this.squares = squares;
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

  isEmpty() {
    for(let i=0; i<this.squares.length; i++) {
      if(this.squares[i])
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

  combineLines(boardSize, lineLength) {
    var lines = []
    var board = this.squareMatrix(boardSize);

    for( let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        const linesFound = this.findLines(board, i, j, lineLength)
        if (linesFound.length > 0)
          lines.push.apply(lines,linesFound);  // push.apply = extend
      }
    }

    return lines;
  }

  findLines(board, i, j, n) {
    var lines = [];

    const hl = this.horiLine(board, i, j, n);
    if (hl.length === n) {
      lines.push(new Line(hl, 0));
    }
    const vl = this.vertLine(board, i, j, n);
    if (vl.length === n)
      lines.push(new Line(vl, 90));

    const dr = this.diagRLine(board, i, j, n);
    if (dr.length === n)
      lines.push(new Line(dr, 45));

    const dl = this.diagLLine(board, i, j, n);
    if (dl.length === n)
      lines.push(new Line(dl, 135));

    return lines;
  }

  horiLine(board, i, j, n) {
    var line = [];
    if (j > board.length - n)
      return line;
    for(let k = 0; k<n; k++)
      line.push(board[i][j+k]);

    return line;
  }

  vertLine(board, i, j, n) {
    var line = [];
    if (i > board.length - n)
      return line;
    for(let k = 0; k<n; k++)
      line.push(board[i+k][j]);

    return line;
  }

  diagLLine(board, i, j, n) {
    var line = [];
    if ( (i > board.length - n) || (j < n-1))
      return line;


    for(let k = 0; k<n; k++)
      line.push(board[i+k][j-k]);

    return line;
  }

  diagRLine(board, i, j, n) {
    var line = [];
    if ( (i > board.length - n) || (j > board.length-n))
      return line;

    for(let k = 0; k<n; k++)
      line.push(board[i+k][j+k]);

    return line;
  }

  squareMatrix(n) {
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

export default Game;
