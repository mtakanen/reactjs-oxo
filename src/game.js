import React from 'react';
import './index.css';
import Ai from './ai.js';

function Points(props) {
  // stateless component for game points
  return (
    <div className="points">
      <div className="points-left">
        X: {props.points['X'] ? props.points['X'] : '–'}
      </div>
      <div className="points-right">
        O: {props.points['O'] ? props.points['O'] : '–'}
      </div>
    </div>
  );
}

function Strategy(props) {
  //TODO: render strategy as a vertical bar
  return (
    <div className="strategy">
      {props.strategy}
    </div>
  );
}

function Reset(props) {
  // stateless component for reset button
  if(!props.show) {
    return null;
  }
  return (
    <button className="reset" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

function Square(props) {
  // stateless component for button
  let classes = "square"
  let lineClass = null;
  if(props.lineAngle !== null) {
    lineClass = "line-"+props.lineAngle;
  }
  classes += lineClass ? " "+lineClass : "";

  return (
    <button className={classes}
            onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  // stateless component for game board
  renderSquare(i) {
    let lineAngle = null;
    if(this.props.winningLine && this.props.winningLine.squares.includes(i)) {
      lineAngle = this.props.winningLine.angle;
    }

    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        lineAngle={lineAngle}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  renderRow(rowId, cols) {
    return (
      <div key={"row-"+rowId} className="board-row">
        {cols}
      </div>
    );
  }

  render() {
    var rows=[]
    const size = this.props.boardSize;
    for (let row = 0; row < size; row++) {
      var cols = [];
      for (let col = 0; col < size; col++) {
        cols.push(this.renderSquare(row*size+col));
      }
      rows.push(this.renderRow(row, cols));
    }

    return (
      <div>
        {rows}
      </div>
    );
  }
}


class Game extends React.Component {
  // stateful component for game
  constructor(props) {
    super(props);
    this.boardSize = props.boardSize;
    this.lineLength = props.lineLength;
    this.xIsNext = true;
    this.points = {'X':0, 'O':0}

    this.lines = new Lines(props.boardSize).combineLines(props.lineLength);
    this.ai = new Ai('O', this.lines);
    this.commitTurn = this.commitTurn.bind(this);

    const squares = this.newSquares();
    this.state = {
      squares: squares,
      hasEnded: true,
      isWelcome: true,
      strategy: 0,
    };
  }

  newSquares() {
    return Array(this.boardSize * this.lineLength).fill(null);
  }

  commitTurn(square) {
    // commits turn in square i
    let hasEnded = false;
    const points = this.points;
    const squares = this.state.squares.slice();
    squares[square] = this.xIsNext ? 'X' : 'O';
    const winningLine = this.calculateWinner(squares);
    if (winningLine !== null) {
      points[winningLine.mark] +=1;
      this.ai.changeStrategy(points, winningLine.mark);
      hasEnded = true;
    } else if(this.isFull(squares)) {
      hasEnded = true;
    }
    this.xIsNext = !this.xIsNext;
    this.setState({
      squares: squares,
      hasEnded: hasEnded,
    });
  }

  componentDidUpdate() {
    // lifecycle callback when component state has updated
    if(!this.xIsNext && !this.state.hasEnded) {
      this.ai.playTurn(this.state.squares, this.commitTurn);
    }
  }

  handleClick(i) {
    // handles click in square i.
    if (!this.xIsNext || this.state.squares[i] || this.state.hasEnded) {
      return;
    }
    this.commitTurn(i);
  }

  handleReset() {
    // callback for reset button click.
    const squares = this.newSquares();
    this.setState({
      squares: squares,
      hasEnded: false,
      isWelcome: false,
    });
  }

  render() {
    let status;
    let winningLine;
    let squares = this.state.squares;
    if(this.state.isWelcome) {
      status = 'Let\'s play';
      squares[0] = 'O'; squares[4] = 'X'; squares[8] = 'O';
    } else {
      winningLine = this.calculateWinner(squares);
      if (winningLine !== null) {
        if(winningLine.mark !== this.ai.playMark)
          status = 'You win!';
        else
          status = 'AI wins!';
      } else if(this.isFull(squares)) {
        status = 'It\'s a tie!'
      } else {
        status = this.xIsNext ? 'Your turn' : 'My turn';
      }
    }

    // ui layout
    return (
      <div className="game">
        <Points
          points={this.points}
        />
        <div className="game-info">
          <div>{status}</div>
        </div>
        <div>
          <div className="game-board">
            <Board
              boardSize={this.boardSize}
              squares={squares}
              winningLine={winningLine}
              onClick={(i) => this.handleClick(i)}
            />
          </div>
          <Reset className="reset"
            value='New game'
            show={this.state.hasEnded}
            onClick={() => this.handleReset()}
          />
        </div>
      </div>
    );
    /**
    FIXME: add this to game div
    <Strategy
      strategy={this.ai.strategyId}
    />
    */
  }

  calculateWinner(squares) {
    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];
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
    let full=squares.filter((x) => x !== null);
    return full.length === squares.length ? true : false;
  }

}

class Lines {
  constructor(size) {
    this.size = size;
  }

  combineLines(lineLength) {
    var lines = []
    var board = this.squareMatrix(this.size);

    for( let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
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
