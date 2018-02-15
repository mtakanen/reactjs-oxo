const STRATEGIES = ['naive','basic','medium','advanced','pro'];

class Ai {
  constructor(playMark, lines) {
    this.playMark = playMark;
    this.lines = lines;
    this.strategyId = 0;
    this.bindThis();
  }

  bindThis(methods) {
    //bind this to methods that relay on it
    this.playStrategy = this.playStrategy.bind(this);
    this.winOrBlock = this.winOrBlock.bind(this);
    this.opening = this.opening.bind(this);
    this.side = this.side.bind(this);
    this.corner = this.corner.bind(this);
    this.oppositeCorner = this.oppositeCorner.bind(this);
  }

  playTurn(squares, callback) {
    const square = this.playStrategy(this.strategyId, squares, callback);
    waitAndCommit(square, callback);
  }

  playStrategy(strategy, squares, callback) {
    const strategyMethods = {
      naive:    [this.any],
      basic:    [this.winOrBlock, this.side, this.any],
      medium:   [this.opening, this.winOrBlock, this.corner, this.any],
      advanced: [this.opening, this.winOrBlock, this.center, this.corner, this.any],
      pro:      [this.opening, this.winOrBlock, this.oppositeCorner, this.center,
                   this.corner, this.any],
    };

    const methods = strategyMethods[STRATEGIES[strategy]];
    for(let i=0; i<methods.length; i++) {
      const square = methods[i](squares);
      if(square !== null) {
        return square;
      }
    }
  }

  changeStrategy(points, previousWinnerMark) {
    // TODO: when ai has got a big lead, strategy drops and stays naive
    // as long as opponent reaches points
    let change = 0;
    const opponentMark = this.playMark ? 'X' : 'O';
    const diff = points[this.playMark] - points[opponentMark];
    if(previousWinnerMark === opponentMark &&
        diff < 0 && this.strategyId < STRATEGIES.length-1)
      change = 1;
    else if(previousWinnerMark === opponentMark && this.strategyId === 0)
      change = 1;
    else if( previousWinnerMark === this.playMark && diff > 2 && this.strategyId > 0)
      change = -1;

    // increment/decrement strategyId
    this.strategyId += change;
    return change;
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

  winOrBlock(squares) {
    let alt = [];
    for (let i = 0; i < this.lines.length; i++) {
      const [a, b, c] = this.lines[i].squares;
      if ( squares[c] && squares[c] === squares[b] && !squares[a] )
        alt.push([a,b]);
      if ( squares[a] && squares[a] === squares[c] && !squares[b] )
        alt.push([b,a]);
      if ( squares[a] && squares[a] === squares[b] && !squares[c] )
        alt.push([c,a]);
    }

    if(alt.length === 1) {
      return alt[0][0];
    } else if(alt.length > 1) {
      // prefer own winning line
      for(let j = 0; j< alt.length; j++) {
        if (squares[alt[j][1]] === this.playMark) {
          return alt[j][0];
        }
      }
      // opponent has a fork! it's futile but choose either.
      return alt[0][0];
    }
    return null;
  }

  opening(squares) {
    const five = [0,2,4,6,8];
    if(isEmpty(squares)) {
      five.sort(() => Math.random() * 2 - 1);
      return five[0];
    }
    return null;
  }

  center(squares) {
    const center = 4;
    return squares[center] === null ? center : null;
  }

  corner(squares) {
    const corners = [0,2,6,8];
    return targetSquares(squares, corners);
  }

  side(squares) {
    const sides = [1,3,5,7];
    return targetSquares(squares, sides);
  }

  oppositeCorner(squares) {
    const opponentMark = this.playMark ? 'X' : 'O';
    const corners = [[0,8], [2,6], [6,2], [8,0]];
    for(let i=0; i<corners.length; i++) {
      if(squares[corners[i][0]] === opponentMark &&
          squares[corners[i][1]] === null)
        return corners[i][1];
    }
    return null;
  }
}

const MIN_DELAY = 300;
const MAX_DELAY = 1000;

function waitAndCommit(square, callback) {
    const delay = Math.random()*(MAX_DELAY-MIN_DELAY);
    setTimeout(() => {
      callback(square);
    }, delay);
}

function isEmpty(squares) {
  let empty = squares.filter((x) => x !== null);
  return empty.length === 0 ? true : false;
}

function targetSquares(squares, target) {
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

export default Ai;
