/** @jsx React.DOM */

var boards = [
  [
    [1,0,0,0,1],
    [0,1,0,1,0],
    [0,0,1,0,0],
    [0,1,0,1,0],
    [1,0,0,0,1]
  ],
  [
    [0,0,0,0,0],
    [0,1,1,1,0],
    [0,1,0,1,0],
    [0,1,1,1,0],
    [0,0,0,0,0]
  ],
  [
    [0,0,1,0,0],
    [0,1,0,1,0],
    [1,0,1,0,1],
    [0,1,0,1,0],
    [0,0,1,0,0]
  ]
];

// boards = [
//   [[1]]
// ]

var TransitionGroup = React.addons.TransitionGroup;
var classSet = React.addons.classSet;


function easeOut3(curX, destX, initY, destY) {
  return Math.pow(curX / destX, 1/3) * (destY - initY) + initY;
}

function linear(curX, destX, initY, destY) {
  return curX / destX * (destY - initY) + initY;
}

var Apple = {
  animate: function(initState, transitionState, doneFunc) {
    initState(doneFunc);
  }
};

var Switch = React.createClass({
  mixins: [Apple],

  isTransitioning: false,

  doUpdateTransition: false,

  getInitialState: function() {
    return {
      scale: 0
    }
  },

  componentDidMount: function() {
    this.isTransitioning = true;

    var totalDuration = 300;
    var initObj = {
      scale: 0
    }
    var finalObj = {
      scale: 1
    }

    // this.applefy(initObj, finalObj);
    this.enterAnim(function() {
      this.isTransitioning = false;
    }.bind(this));
  },

  componentWillReceiveProps: function() {
    this.doUpdateTransition = true;
  },

  componentDidUpdate: function() {
    console.log(this.props.done);
    if (this.isTransitioning || this.props.done) {
      return;
    }

    if (this.doUpdateTransition) {
      this.doUpdateTransition = false;
      this.updateAnim(function() {
        // console.log('done');
      }.bind(this));
    }
  },

  updateAnim: function(done) {
    this.setState({scale: 0}, function() {
      setTimeout(function() {
        this.enterActiveAnim(0, done);
      }.bind(this), (this.props.posX + this.props.posY) * 35);
    }.bind(this));
  },

  enterAnim: function(done) {
    setTimeout(function() {
      this.setState({scale: 0}, function() {
        this.enterActiveAnim(0, done);
      }.bind(this));
    }.bind(this), (this.props.posX + this.props.posY) * 35);
  },

  enterActiveAnim: function(framesDone, done) {
    var totalDuration = 300;
    var totalFrameBudget = totalDuration / (1000 / 60);
    var initScale = 0;
    var finalScale = 1;
    var curScale = easeOut3(framesDone, totalFrameBudget, initScale, finalScale);

    if (framesDone >= totalFrameBudget) {
      this.setState({scale: finalScale}, done);
      return;
    }

    requestAnimationFrame(function() {
      this.setState({scale: curScale}, function() {
        this.enterActiveAnim(framesDone + 1, done);
      }.bind(this));
    }.bind(this));
  },

  render: function() {
    // got the props from parent (LightsOut)
    var classes = {
      'switch': true,
      'switch-done': this.props.done,
      'switch-on': this.props.isOn,
      'switch-off': !this.props.isOn
    }
    var style = {
      transform: 'scale(' + this.state.scale + ')',
      WebkitTransform: 'scale(' + this.state.scale + ')'
    };
    return <div className={classSet(classes)} style={style} onClick={this.props.onClick} />
  }
});

var LightsOut = React.createClass({
  getInitialState: function() {
    // component's internal value(s)
    return {
      board: this.getNewRandomBoard(),
      done: false
    };
  },

  getNewRandomBoard: function() {
    // clone a board
    return boards[Math.floor(Math.random() * boards.length)].map(function(row) {
      return row.map(function(cell) {
        return cell;
      });
    });
  },

  handleReset: function() {
    // updating the state auto re-renders the component UI
    this.setState({
      board: this.getNewRandomBoard(),
      done: false
    });
  },

  handleSwitchClick: function(i, j) {
    var board = this.state.board;
    var lastCellIndex = board.length - 1;
    // flip current and ajacent switches
    board[i][j] = !board[i][j];
    if (i !== 0) board[i - 1][j] = !board[i - 1][j];
    if (i !== board[i].length - 1) board[i + 1][j] = !board[i + 1][j];
    if (j !== 0) board[i][j - 1] = !board[i][j - 1];
    if (j !== board.length - 1) board[i][j + 1] = !board[i][j + 1];

    // setState is asynchronous. Pass a callback that verifies if all the lights
    // are on; if so, create new game
    var done = this.state.board.every(function(row) {
      return row.every(function(cell) {
        return !!cell;
      });
    });

    this.setState({board: this.state.board, done: done}, function() {
      if (done) {
        setTimeout(function() {
          this.setState({
            board: this.getNewRandomBoard(),
            done: false
          });
        }.bind(this), 500);
      }
    }.bind(this));
  },

  render: function() {
    return (
      <div>
        <a
          href="http://en.wikipedia.org/wiki/Lights_Out_(game)#Light_chasing"
          target="_blank"
          id="hidden-cheat"
        >
          Turn on every switch.
        </a>
        <button onClick={this.handleReset}>Shuffle</button>
        {
          this.state.board.map(function(row, i) {
            return (
              // `TransitionGroup` defaults to a `span` wrapper. We want a `div`
              <div
                transitionName="switch"
                component={React.DOM.div}
              >
                {
                  row.map(function(cell, j) {
                    // 5x5 swiches. Pass some props to each one
                    return (
                      <Switch
                        isOn={!!cell}
                        done={this.state.done}
                        onClick={this.handleSwitchClick.bind(this, i, j)}
                        posX={i}
                        posY={j}
                      />
                    )
                  }, this)
                }
              </div>
            )
          }, this)
        }
      </div>
    );
  }
});

React.renderComponent(<LightsOut />, document.getElementById('game'))
