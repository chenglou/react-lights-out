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

var classSet = React.addons.classSet;

// https://github.com/danro/jquery-easing/blob/master/jquery.easing.js
// t: current time, b: beginning value, c: change in value, d: duration
function easeOutQuad(t, b, c, d) {
  return -c *(t/=d)*(t-2) + b;
}

function easeOutBounce(t, b, c, d) {
  if ((t/=d) < (1/2.75)) {
    return c*(7.5625*t*t) + b;
  } else if (t < (2/2.75)) {
    return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
  } else if (t < (2.5/2.75)) {
    return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
  } else {
    return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
  }
}

var Apple = {
  configAnim: function() {
    // easingFunc, duration, initValue, finalValue
    // Penner's easing functions take different parameters. Convert here into
    // [easingFunc, currentTime, initValue, changeInValue, duration, currentAbsTime]
    var a = arguments;
    return [a[0], 0, a[2], a[3] - a[2], a[1], Date.now()];
  },

  animate: function(stateConfig, done) {
    var stateObj = {};
    for (var key in stateConfig) {
      if (!{}.hasOwnProperty.call(stateConfig, key)) continue;

      // set state value to the initialValue passed in `stateConfig`
      stateObj[key] = stateConfig[key][2];
    }

    this.setState(stateObj, function() {
      this.__transition(stateObj, stateConfig, done);
    }.bind(this));
  },

  __transition: function(stateObj, stateConfig, done) {
    var allDone = true;

    for (var key in stateConfig) {
      if (!{}.hasOwnProperty.call(stateConfig, key)) continue;

      var curConfig = stateConfig[key];
      var now = Date.now();
      if (now - curConfig[5] < curConfig[4]) {
        allDone = false;
        curConfig[1] = now - curConfig[5]
      } else {
        curConfig[1] = curConfig[4];
      }

      stateObj[key] = curConfig[0](curConfig[1], curConfig[2], curConfig[3], curConfig[4]);
    }


    requestAnimationFrame(function() {
      this.setState(stateObj, function() {
        if (allDone) return done();

        this.__transition(stateObj, stateConfig, done);
      }.bind(this));
    }.bind(this));
  }
};



//----------------end apple mixin----------------


var Switch = React.createClass({
  mixins: [Apple],
  transitioning: false,

  getInitialState: function() {
    return {
      scale: 0,
      rotation: 0
    }
  },

  componentDidMount: function() {
    setTimeout(function() {
      this.animate({
        scale: this.configAnim(easeOutBounce, 800, 0, 1),
        rotation: this.configAnim(easeOutQuad, 500, 0, 360)
      }, function() {
        // console.log('done');
      });
    }.bind(this), (this.props.posX + this.props.posY) * 35);
  },

  render: function() {
    var classes = {
      'switch': true,
      'switch-done': this.props.done,
      'switch-on': this.props.isOn,
      'switch-off': !this.props.isOn
    }
    var style = {
      transform: 'scale(' + this.state.scale + ') rotateZ(' + this.state.rotation + 'deg)',
      WebkitTransform: 'scale(' + this.state.scale + ') rotateZ(' + this.state.rotation + 'deg)'
    };
    return <div className={classSet(classes)} style={style} onMouseDown={this.props.onMouseDown} />
  }
});

var LightsOut = React.createClass({
  getInitialState: function() {
    return {
      board: this.getNewRandomBoard(),
      done: false,
      reset: true
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
    this.setState({
      board: this.getNewRandomBoard(),
      done: false,
      reset: true,
      clickedI: null,
      clickedJ: null
    });
  },

  handleSwitchClick: function(i, j) {
    var board = this.state.board;
    var lastCellIndex = board.length - 1;

    board[i][j] = !board[i][j];
    if (i !== 0) board[i - 1][j] = !board[i - 1][j];
    if (i !== board[i].length - 1) board[i + 1][j] = !board[i + 1][j];
    if (j !== 0) board[i][j - 1] = !board[i][j - 1];
    if (j !== board.length - 1) board[i][j + 1] = !board[i][j + 1];

    var done = this.state.board.every(function(row) {
      return row.every(function(cell) {
        return !!cell;
      });
    });

    var updatedState = {
      board: this.state.board,
      done: done,
      reset: false,
      clickedI: i,
      clickedJ: j
    }

    this.setState(updatedState, function() {
      if (done) {
        setTimeout(function() {
          this.setState({
            board: this.getNewRandomBoard(),
            done: false,
            reset: true,
            clickedI: null,
            clickedJ: null
          });
        }.bind(this), 500);
      }
    }.bind(this));
  },

  render: function() {
    var state = this.state;
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
        <div ref="grid">
          {
            state.board.map(function(row, i) {
              return (
                <div>
                  {
                    row.map(function(cell, j) {
                      // 5x5 swiches. Pass some props to each one
                      return (
                        <Switch
                          isOn={!!cell}
                          done={state.done}
                          onMouseDown={this.handleSwitchClick.bind(this, i, j)}
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
      </div>
    );
  }
});

React.renderComponent(<LightsOut />, document.getElementById('game'))
