import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Game from './game.js';
import Ai from './ai.js';

const BOARD_SIZE = 3;
const LINE_LENGHT = 3;

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


class OXO extends React.Component {
  // stateful component for game
  constructor(props) {
    super(props);
    const squares = this.initSquares();
    this.game = new Game(BOARD_SIZE, LINE_LENGHT);
    this.ai = new Ai(this.game, 'O');
    this.commitTurn = this.commitTurn.bind(this);
    this.state = {
      squares: squares,
      gameEnded : true,
      xIsNext: true,
      points: {'X':0, 'O':0},
      isWelcome: true,
    };
  }

  initSquares() {
    // for welcome screen only!
    const squares = Array(BOARD_SIZE * BOARD_SIZE).fill(null);
    squares[3] = 'O';
    squares[4] = 'X';
    squares[5] = 'O';
    return squares;
  }

  commitTurn(i) {
    // commits turn in square i
    const squares = this.game.squares.slice();
    const points = this.state.points;
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.game.setSquares(this.state.squares);
    let gameEnded = false;
    const winningLine = this.game.calculateWinner(squares);
    if (winningLine !== null) {
      points[winningLine.mark] +=1;
      this.ai.changeStrategy(points, winningLine.mark);
      gameEnded = true;
    } else if(this.game.isFull(squares)) {
      gameEnded = true;
    }

    // TODO: move squares to Game. How to keep in sync?
    this.setState({
      squares: squares,
      gameEnded : gameEnded,
      points: points,
      xIsNext: !this.state.xIsNext,
    });

  }

  handleClick(i) {
    // handles click in square i.
    if (!this.state.xIsNext || this.state.squares[i] || this.state.gameEnded) {
      return;
    }
    this.commitTurn(i);
  }

  handleReset() {
    // callback for reset button click.
    const squares = this.game.new();
    this.setState({
      squares: squares,
      gameEnded: false,
      isWelcome: false,
    });
  }

  componentDidUpdate() {
    // lifecycle callback when component state has updated
    this.game.setSquares(this.state.squares);
    if(!this.state.xIsNext && !this.state.gameEnded)
      this.ai.playTurn(this.game, this.commitTurn);
  }


  render() {
    let status;
    let winningLine;

    if(this.state.isWelcome) {
      status = 'Let\'s play';
    } else {
      winningLine = this.game.calculateWinner(this.state.squares);
      if (winningLine !== null) {
        if(winningLine.mark !== this.ai.playMark)
          status = 'You win!';
        else
          status = 'AI wins!';
      } else if(this.game.isFull(this.state.squares)) {
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
  <OXO />,
  document.getElementById('root')
);
