import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Square extends React.Component {
  // `Square`'s responsibility: responds to and render results of clicks.
  
  constructor(props) {
    super(props);
    this.state = {
      moveNumber: 99, // For correct rendering.
      playedBy: "" // For correct rendering.
    };
    this.playMove = this.playMove.bind(this);
  }

  // To avoid an obsolete move to be rendered.
  static getDerivedStateFromProps(props, state) {
    if(
      props.newMove === true
      && props.progressShown === state.moveNumber
      && props.lastSquare !== props.row + props.column
      ) {
        return {
          moveNumber: 99
        }
    }    
    return null;
  }

  // Called `onClick`.
  playMove() {
    // If there is already a winner, don't do anything.
    if(!this.props.winnerLetKnow) {

      // DRY
      const shown = this.props.progressShown;
  
      // Determine if this `square` is already played on.
      if(this.state.moveNumber > shown) {
  
        // Update this `square` internal states.
        this.setState({
          moveNumber: shown + 1,
          playedBy: shown % 2 === 0? "X" : "O"
        });
  
        // Update `game` states.
        this.props.onPlayMove(this.props.row, this.props.column);
      }      
    }
  }

  render() {
    /**
     * Conditional render based on `progressShwon` and `moveNumber`.
     * `progressShown` may change because of:
     * 1. New move played, where `progressShown` increase by 1.
     * 2. Jumping among moves.
    */
    
    return (
      <button className="square" onClick={this.playMove}>
        {this.state.moveNumber <= this.props.progressShown? this.state.playedBy : ""}
      </button>
    );
  }
}

class Board extends React.Component {
  // `Board`'s responsibility: render the required number of `square`s.

  renderSquare(row, column) {
    return <Square 
              row={row} 
              column={column}
              onPlayMove={this.props.onPlayMove}
              newMove={this.props.newMove} // `Square` needs this to render correctly.
              lastSquare={this.props.lastSquare} // `Square` needs this to render correctly.
              progressShown={this.props.progressShown} // `Square` needs this to render correctly.
              winnerLetKnow={this.props.winnerLetKnow} // `Square` needs this to know when game ends.
            />;
  }

  render() {
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0, 1)}
          {this.renderSquare(0, 2)}
          {this.renderSquare(0, 3)}
        </div>
        <div className="board-row">
          {this.renderSquare(3, 1)}
          {this.renderSquare(3, 2)}
          {this.renderSquare(3, 3)}
        </div>
        <div className="board-row">
          {this.renderSquare(6, 1)}
          {this.renderSquare(6, 2)}
          {this.renderSquare(6, 3)}
        </div>
      </div>
    );
  }
}

class Game extends React.Component {
  // `Game`'s responsibility: ref the game including allowing for going back to a previous move.

  constructor(props) {
    super(props);
    this.state = {
      newMove: true,
      moveHistory: [],
      progressShown: 0,
      winner: ""
    };
    this.onPlayMove = this.onPlayMove.bind(this);
    this.goToMove = this.goToMove.bind(this);
    this.checkWinner = this.checkWinner.bind(this);
  }

  onPlayMove(playedRow, playedColumn) {

    // DRY
    const moves = this.state.moveHistory;
    const shown = this.state.progressShown;
    const movesUpdated = [
      ...moves.slice(0, shown),
      {movePlayer: shown % 2 === 0 ? "X" : "O",
      moveRow: playedRow,
      moveColumn: playedColumn}
    ];

    this.setState({
      newMove: true,
      moveHistory: movesUpdated,
      progressShown: shown + 1,
      winner: "" // Reset winner when a move is played.
    });

    // Check if someone won if at least 5 moves on the board.
    // +1 due to setState() batching.
    if(shown + 1 >= 5) this.checkWinner(movesUpdated);    
  }

  goToMove(destination) {
    this.setState({
      newMove: false,
      progressShown: destination
    });
  }

  checkWinner(movesToCheck) {

    // DRY
    const newMove = movesToCheck[movesToCheck.length - 1];
    const newMovePlayer = newMove.movePlayer;
    const newMoveRow = newMove.moveRow;
    const newMoveColumn = newMove.moveColumn;
    const lessMovesToCheck = movesToCheck.filter(move => move.movePlayer === newMovePlayer);

    if(
      // Check if row has three of the same (as the last player).
      lessMovesToCheck.filter(move => move.moveRow === newMoveRow).length === 3
      // Check if column has three of the same (as the last player).
      || lessMovesToCheck.filter(move => move.moveColumn === newMoveColumn).length === 3
      // Check if diagonals have three of the same (as the last player).
      || lessMovesToCheck.filter(move => [1, 5, 9].indexOf(move.moveRow + move.moveColumn) !== -1).length === 3
      || lessMovesToCheck.filter(move => [3, 5, 7].indexOf(move.moveRow + move.moveColumn) !== -1).length === 3
      ) {
      this.setState({
        winner: newMovePlayer
      });
    }
  }
  
  componentDidUpdate() {
    // console.clear();
    // console.log(this.state.moveHistory);
    // console.log(this.state.winner);
  }

  render() {    
    /**
     * To rethink the logic -
     * 
     * `Game`'s responsibility: Oversees game history and status, 
     * while not worrying about visual representation of the game
     * board.
     * 
     * `Square`'s responsibility: Visually represent (ie render) the
     * game correctly based on info (ie props) passed down from `Game`,
     * while not worring about the the correctness of info received.
     * 
     * When a move is played, `Game` records what happened; A `square`
     * gets assigned its own internal states (for rendering purposes
     * only), and decides whether to show X, O or nothing by referencing
     * both it's own states and props given by `Game`.
     * 
     * When `progressShown` is manually adjusted, `Game` notifies
     * `square`s and the latter check whether they should shown X, O or
     * nothing by referencing the same info as above.
    */

    // DRY.
    const moves = this.state.moveHistory;
    const shown = this.state.progressShown;

    // For rendering buttons to go back to a previous move.
    const moveList = moves.map(
      (move, index) => {
        return (
          <li key={move.movePlayer + move.moveColumn + move.moveRow}>
            <button onClick={() => this.goToMove(index + 1)}>Go to move #{index + 1}</button>
          </li>
        );
      }
    );
    
    // For `square` state update.
    const lastSquare = shown? moves[shown - 1].moveRow + moves[shown - 1].moveColumn : 0;

    // Winner to show & to pass down.
    const winnerLetKnow = shown === moves.length? this.state.winner : "";
    
    // Game message.
    const gameMessage = !winnerLetKnow? "Next player: " + (shown % 2 === 0? "X" : "O")
                                      : "Winner: " + winnerLetKnow;

    return (
      <div className="game">
        <div className="game-board">
          <Board 
            onPlayMove={this.onPlayMove}
            newMove={this.state.newMove} // `Square` needs this to render correctly.
            lastSquare={lastSquare} // `Square` needs this to render correctly.
            progressShown={shown} // `Square` needs this to render correctly.
            winnerLetKnow={winnerLetKnow} // `Square` needs this to know when game ends.
          />
        </div>
        <div className="game-info">
          <div>{gameMessage}</div>
          <ol>
            <li><button onClick={() => this.goToMove(0)}>Go to game start</button></li>
            {moveList}
          </ol>
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