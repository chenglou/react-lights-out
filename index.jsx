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

  animate: function(propName, ref, unitName, configArr, done) {
    // console.log(this.refs);
    this.refs[ref].getDOMNode().style[propName] = configArr[2] + unitName;
    this.__transition(propName, ref, unitName, configArr, done);
  },

  __transition: function(propName, ref, unitName, configArr, done) {
    var allDone = true;

    var now = Date.now();
    if (now - configArr[5] < configArr[4]) {
      allDone = false;
      configArr[1] = now - configArr[5]
    } else {
      configArr[1] = configArr[4];
    }

    var newVal = configArr[0](configArr[1], configArr[2], configArr[3], configArr[4]);
    console.log(newVal);
    requestAnimationFrame(function() {
      this.refs[ref].getDOMNode().style[propName] = newVal + unitName;
      if (allDone) {
        return done && done();
      }

      this.__transition(propName, ref, unitName, configArr, done);
    }.bind(this));
  }
};


//----------------end apple mixin----------------


var Switch = React.createClass({
  mixins: [Apple],

  getInitialState: function() {
    return {
      scale: 1,
      rotation: 0
    }
  },

  componentDidMount: function() {
    this.playResetAnim();
  },

  componentDidUpdate: function() {
    // this.playResetAnim();
  },

  playResetAnim: function() {
    // setTimeout(function() {
      this.animate('height', 'switch', 'px', this.configAnim(easeOutBounce, 800, 0, 36));
      this.animate('width', 'switch', 'px', this.configAnim(easeOutBounce, 800, 0, 36));
    // }.bind(this), (this.props.posX + this.props.posY) * 35);
  },

  playClickedAnim: function() {
    this.animate({
      scale: this.configAnim(easeOutQuad, 300, .8, 1),
    }, 'clickedAnim');
  },

  onMouseDown: function(e) {
    // this.playClickedAnim();
    this.props.onMouseDown && this.props.onMouseDown(e);
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
    return <div ref="switch" className={classSet(classes)} style={style} onMouseDown={this.onMouseDown} />
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
