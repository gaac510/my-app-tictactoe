import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Square extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      //moveNumber: -1,
      //playedBy: ""
      /**
       * Perhaps neither of these is necessary? If moveHistory records a 
       * move for a square, conditional render of the square should be achievable.
      */
    };
    this.playMove = this.playMove.bind(this);
    this.checkPlayed = this.checkPlayed.bind(this);
  }
  
  checkPlayed() { // Because DRY.
  /**
   * Would it be better-performance to just keep an internal state for flagging
   * whether the square has been played and at which move?
   * If would be a derived state as a change in `props.progressShown` will cause
   * it to change.
   * */
    const movesShown = this.props.gameStates.moveHistory.slice(0, this.props.gameStates.progressShown);
    
    let i = 0;
    while(movesShown[i]) {
      if(this.props.row === movesShown[i].moveRow && this.props.column === movesShown[i].moveColumn) {
        return i;
      }
      i++;
    }
  }

  playMove() {
    /*if(!this.state.playedBy) {
      this.setState({
        moveNumber: this.props.currentMove,
        playedBy: this.props.player
      }
      ,() => {console.clear(); console.log(this.state);} // For debugging.
      );*/
      if(this.checkPlayed() === undefined) {
        this.props.onPlayMove(this.props.row, this.props.column);
      }
    //}    
  }

  componentDidMount() {
    //console.log(this.checkPlayed()); // For debugging
  }

  componentDidUpdate() {
    /**
     * 1. Receive new progressShown (e.g. 3)in props.
     * 2. If progressShown(prop) < moveNumber(state) (e.g. 4) and playedBy isn't "",
     *    update playedBy to "" while leaving moveNumber as is.
     *    * Is this to 1) perform a side effect, 2) re-compute data, or 3) reset a state?
     *        * Pretty sure not 1.
     *        * Not sure if 2 - "data" in *what* content?
     *        * Likely 3, but is this only limited to an unconditional response to a change 
     *          in props?
     * 3. New local states trigger rerender of component.
    */
    //console.clear(); // For debugging.
    console.log(this.checkPlayed()); // For debugging.
  }

  render() {
    /**
     * Loop through moves & check if a square has been played.
     * If the a square finds itself, no need to continue the
     * loop:
     * > `for` - OK.
     * > `for...in` - No as specific to object properties.
     * > `for...of` - OK.
     * > `do... while` - No as executed at least once.
     * > `while` - OK.
     * > recursion - OK, but let's not complicate things.
     * > Array methods - `reduce` should work.
    */
    const i = this.checkPlayed();
    const playedBy = i === undefined? "" : this.props.gameStates.moveHistory[i].movePlayer;
    
    return (
      <button className="square" onClick={this.playMove}>
        {playedBy}
      </button>
    );
  }
}

class Board extends React.Component {
  renderSquare(row, column) { //Whether to combine row and column seems more like a preference.
    return <Square 
              row={row} 
              column={column}
              onPlayMove={this.props.onPlayMove}
              gameStates={this.props.gameStates}
            />;
  }

  render() {
    const moves = this.props.gameStates.moveHistory;
    const shown = this.props.gameStates.progressShown;
    const player = !shown ? "X"
                      : moves[shown - 1].movePlayer === "X" ? "O" 
                      : "X";
                      /**
                       * Will it ever be possible that `shown` isn't 0 but
                       * `moves` is empty?
                       * 
                       * No. Because a `shown` increment over `moves.length`
                       * is always preceded by a move insertion, but any
                       * other changes in `shown` don't necessarily concern
                       * `moves` changes; so `moves.length` is always >=
                       * shown.
                       * */    

    const status = 'Next player: ' + player;

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
     * 4a. What step to go back to?
     * 
     * So that we know when the game should end:
     * 5. Is there a winner and who?
     * 
     * Presumebaly these should be the states to maintain.
    */
    this.state = {
      //nextPlayer: "X", 
      /**
       * This can be calculated from moveHistory and
       * progressShown but keeping it saves some repetitions,
       * or does it?
       */
      moveHistory: [],
      progressShown: 0, // Needs to be passed down to Square.
      winner: ""
      /**
       * Winning condition:
       * 1. row the same
       * 	A1 B1 C1
       * 	A2 B2 C2
       * 	A3 B3 C3
       * 2. column the same
       * 	A1 A2 A3
       * 	B1 B2 B3
       * 	C1 C2 C3
       * 3. neither row nor column the same i.e. diagnal
       * 	A1 B2 C3
       * 	C1 B2 A3
       */
    };
    this.onPlayMove = this.onPlayMove.bind(this);
    this.goToMove = this.goToMove.bind(this);
  }

  onPlayMove(playedRow, playedColumn) {
    const moves = this.state.moveHistory;
    const shown = this.state.progressShown;
    /* const player = this.state.nextPlayer;
    const playerSwitcher = {
      X: "O",
      O: "X"
    }; */
    const player = !shown ? "X"
                      : moves[shown - 1].movePlayer === "X" ? "O" 
                      : "X";


    this.setState({
      //nextPlayer: playerSwitcher[player],
      moveHistory: [...moves.slice(0, shown),
        {movePlayer: player,
        moveRow: playedRow,
        moveColumn: playedColumn}
      ],
      progressShown: this.state.progressShown + 1
      // progressShown == n means show *only* move 1 to n.
    });
  }

  goToMove(destination) {
    this.setState({
      progressShown: destination
      // Go to move #n == set progressShown to n == show move 1 to n or index 0 to n-1. This is OK.
    });
  }

  // For debugging:
  componentDidUpdate() {
    console.clear();
    console.log(this.state.moveHistory);
    console.log(this.state.progressShown);
    }



  render() {
    const moves = this.state.moveHistory;

    const moveList = moves.map(
      (move, index) => {
        return <li key={move.movePlayer + move.moveColumn + move.moveRow}
                  /*Perhaps even movePlayer isn't necessary?*/>
                  <button onClick={() => this.goToMove(index + 1)}>Go to move #{index + 1}</button>
                </li>
      }
    );

    return (
      <div className="game">
        <div className="game-board">
          <Board 
            onPlayMove={this.onPlayMove}
            gameStates={this.state}
          />
        </div>
        <div className="game-info">
          <div>{/* status */}</div>
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