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
    this.ai = new Ai(this.game, 'O');
    this.game = new Game(BOARD_SIZE, LINE_LENGHT, this.ai);
    this.state = {
      isWelcome: true,
    };
    this.updateCallback = this.updateCallback.bind(this);
  }

  handleClick(i) {
    // handles click in square i.
    if (!this.game.xIsNext || this.game.squares[i] || this.game.hasEnded) {
      return;
    }
    this.updateCallback(i);
  }

  handleReset() {
    // callback for reset button click.
    this.game.new();
    this.setState({
      isWelcome: false,
    });
  }

  componentDidUpdate() {
    // lifecycle callback when component state has updated
    if(!this.game.xIsNext && !this.game.hasEnded)
      this.ai.playTurn(this.game, this.updateCallback);
  }

  updateCallback(square) {
    this.game.commitTurn(square);
    this.setState(this.state); // hack to re-render with Game state
  }

  render() {
    let status;
    let winningLine;
    let squares = this.game.squares;

    if(this.state.isWelcome) {
      status = 'Let\'s play';
      squares[0] = 'O'; squares[4] = 'X'; squares[8] = 'O';
    } else {
      winningLine = this.game.calculateWinner();
      if (winningLine !== null) {
        if(winningLine.mark !== this.ai.playMark)
          status = 'You win!';
        else
          status = 'AI wins!';
      } else if(this.game.isFull()) {
        status = 'It\'s a tie!'
      } else {
        status = this.game.xIsNext ? 'Your turn' : 'My turn';
      }
    }

    // ui layout
    return (
      <div className="game">
        <Points
          points={this.game.points}
        />
        <div className="game-info">
          <div>{status}</div>
        </div>
        <div>
          <div className="game-board">
            <Board
              squares={this.game.squares}
              winningLine={winningLine}
              onClick={(i) => this.handleClick(i)}
            />
          </div>
          <Reset className="reset"
            value='New game'
            show={this.game.hasEnded}
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
