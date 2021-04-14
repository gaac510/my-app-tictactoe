import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Square extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      moveNumber: 99,
      playedBy: ""
    };
    this.playMove = this.playMove.bind(this);
  }

  playMove() {
    if(!this.state.playedBy) {
      this.setState({
        moveNumber: this.props.currentMove,
        playedBy: this.props.player
      }
      ,() => {console.clear(); console.log(this.state);} // For debugging.
      );
      this.props.onPlayMove(this.props.row, this.props.column);
    }    
  }

  render() {
    return (
      <button className="square" onClick={this.playMove}>
        {this.state.playedBy}
      </button>
    );
  }
}

class Board extends React.Component {
  renderSquare(row, column) {
    return <Square 
              row={row} 
              column={column} 
              player={this.props.player} 
              currentMove={this.props.currentMove} 
              onPlayMove={this.props.onPlayMove} 
            />;
  }

  render() {
    const status = 'Next player: X';

    return (
      <div>
        <div className="status">{status}</div>
        <div className="board-row">
          {this.renderSquare(1, "A")}
          {this.renderSquare(1, "B")}
          {this.renderSquare(1, "C")}
        </div>
        <div className="board-row">
          {this.renderSquare(2, "A")}
          {this.renderSquare(2, "B")}
          {this.renderSquare(2, "C")}
        </div>
        <div className="board-row">
          {this.renderSquare(3, "A")}
          {this.renderSquare(3, "B")}
          {this.renderSquare(3, "C")}
        </div>
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    /**
     * To uniquely identify each move:
     * 1. Who's playing?
     * 2. How many moves have there already been?
     * 3. On which grid cell?
     * 
     * So that we can go back to a previous move:
     * 4. What unique moves have there been?
     * 
     * Presumebaly these should be the states to maintain.
    */
    this.state = {
      nextPlayer: "X",
      moveHistory: []
    };
    this.onPlayMove = this.onPlayMove.bind(this);
  }

  onPlayMove(playedRow, playedColumn) {
    const moves = this.state.moveHistory;
    const player = this.state.nextPlayer;
    const playerSwitcher = {
      X: "O",
      O: "X"
    };

    this.setState({
      nextPlayer: playerSwitcher[player],
      moveHistory: [...moves, 
        {movePlayer: player,
        moveRow: playedRow,
        moveColumn: playedColumn}
      ]
    });
  }

  // For debugging.
  componentDidUpdate() {
    const moves = this.state.moveHistory;
    if(moves[0]) {
      console.log(moves);
    }
  }

  render() {
    return (
      <div className="game">
        <div className="game-board">
          <Board 
            onPlayMove={this.onPlayMove} 
            player={this.state.nextPlayer} 
            currentMove={this.state.moveHistory.length}
          />
        </div>
        <div className="game-info">
          <div>{/* status */}</div>
          <ol>{/* TODO */}</ol>
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