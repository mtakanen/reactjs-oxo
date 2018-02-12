import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Ai from './ai.js';

const BOARD_SIZE = 3;

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

class Board extends React.Component {
  // stateless componen for game board
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
    const size = BOARD_SIZE;
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
    const squares = this.initSquares();
    this.ai = new Ai(BOARD_SIZE, 'O');
    this.commitTurn = this.commitTurn.bind(this);
    this.state = {
      squares: squares,
      xIsNext: true,
      gameEnded: true,
      points: {'X':0, 'O':0},
      isWelcome: true,
    };
  }

  initSquares() {
    const squares = Array(BOARD_SIZE * BOARD_SIZE).fill(null);
    squares[3] = 'O';
    squares[4] = 'X';
    squares[5] = 'O';
    return squares;
  }

  commitTurn(i) {
    // commits turn in square i
    const squares = this.state.squares.slice();
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    let gameEnded = false;
    const winningLine = this.ai.calculateWinner(squares);
    if (winningLine !== null) {
      const points = this.state.points;
      points[winningLine.mark] +=1;
      this.ai.revisitStrategy(points, winningLine.mark);
      gameEnded = true;
      this.setState({
        points: points,
        gameEnded:gameEnded,
      });
    } else if(this.ai.isFull(squares)) {
      gameEnded = true;
    }

    this.setState({
      squares: squares,
      xIsNext: !this.state.xIsNext,
      gameEnded: gameEnded,
    });

  }

  handleClick(i) {
    // handles click in square i.
    if (!this.state.xIsNext || this.state.squares[i] || this.state.gameEnded) {
      return;
    }
    this.commitTurn(i);
  }

  componentDidUpdate() {
    // lifecycle callback when component state has updated
    if(!this.state.xIsNext && !this.state.gameEnded)
      this.ai.playStrategy(this.state.squares, this.commitTurn);
      //this.ai.turn(this.state.squares, this.commitTurn);
  }

  handleReset() {
    // callback for reset button click.
    const squares = Array(BOARD_SIZE * BOARD_SIZE).fill(null);
    this.setState({
      squares: squares,
      gameEnded: false,
      isWelcome: false,
    });
  }

  render() {
    let status;
    let winningLine;

    if(this.state.isWelcome) {
      status = 'Let\'s play';
    } else {
      winningLine = this.ai.calculateWinner(this.state.squares);
      if (winningLine !== null) {
        if(winningLine.mark !== this.ai.mark)
          status = 'You win!';
        else
          status = 'AI wins!';
      } else if(this.ai.isFull(this.state.squares)) {
        status = 'It\'s a tie!'
      } else {
        status = this.state.xIsNext ? 'Your turn' : 'My turn';
      }
    }

    // ui layout
    return (
      <div className="game">
        <Points
          points={this.state.points}
        />
        <div className="game-info">
          <div>{status}</div>
        </div>
        <div>
          <div className="game-board">
            <Board
              squares={this.state.squares}
              winningLine={winningLine}
              onClick={(i) => this.handleClick(i)}
            />
          </div>
          <Reset className="reset"
            value='New game'
            show={this.state.gameEnded}
            onClick={() => this.handleReset()}
          />
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
