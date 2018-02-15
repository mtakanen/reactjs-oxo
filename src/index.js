import React from 'react';
import ReactDOM from 'react-dom';

import Game from './game.js'

const BOARD_SIZE = 3;
const LINE_LENGHT = 3;


// ========================================

ReactDOM.render(
  <Game
    boardSize={BOARD_SIZE}
    lineLength={LINE_LENGHT}/>,
  document.getElementById('root')
);
