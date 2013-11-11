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
  c = c - b;
  return -c *(t/=d)*(t-2) + b;
}

function easeOutBounce(t, b, c, d) {
  c = c - b;
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

function linear(t, b, c, d) {
  c = c - b;
  return c * t/d + b;
}

var Apple = {
  __transitioning: false,

  animate: function(config) {
    if (!this.__animConfigs) {
      this.__animConfigs = {};
    }
    var configs = this.__animConfigs;

    config.initTime = Date.now() + (config.delay || 0);
    config.initVal = this.state[config.stateName];

    if (config.behavior === 'queue') {
       if (configs[config.stateName]) {
          var oldCallback = configs[config.stateName].callback;
          configs[config.stateName].callback = function() {
            oldCallback && oldCallback();
            this.animate(config);
          }.bind(this);
          return;
       }
    }

    if (configs[config.stateName]) {
      // terminate the previous by calling back before override
      configs[config.stateName].callback && configs[config.stateName].callback();
    }

    configs[config.stateName] = config;

    if (!this.__transitioning) {
      this.__transitioning = true;
      this.__transition();
    }
  },

  __transition: function() {
    var configs = this.__animConfigs;
    var state = this.state;
    var progressTime;
    var doneCallbacks = {};

    for (var key in configs) {
      var config = configs[key];
      var duration = config.transitionParams[1];
      var now = Date.now();

      if (now < config.initTime) continue;

      if (now - config.initTime < duration) {
        progressTime = now - config.initTime;
      } else {
        // animate to the final state one last time to avoid rounding errors
        progressTime = duration;
        doneCallbacks[key] = config.callback;
      }
      state[key] = config.transitionMethod.apply(null, [progressTime, config.initVal].concat(config.transitionParams));
    }

    requestAnimationFrame(function() {
      this.setState(state, function() {
        for (var key in doneCallbacks) {
          delete configs[key];
          doneCallbacks[key] && doneCallbacks[key]();
        }
        if (Object.keys(configs).length === 0) {
          this.__transitioning = false;
          return;
        }

        this.__transition();
      }.bind(this));
    }.bind(this));
  }
};


//----------------end apple mixin----------------


var Switch = React.createClass({
  mixins: [Apple],

  getInitialState: function() {
    return {
      scale: 0,
      rotation: 0,
      color: this.props.isOn ? 264182334 : 811880979,
    }
  },

  componentDidMount: function() {
    this.playMountAnim();
  },

  playMountAnim: function() {
    var animPolicy = {
      stateName: 'scale',
      transitionMethod: easeOutQuad,
      transitionParams: [1, 400],
      delay: this.props.delay,
    };
    var animPolicy2 = {
      stateName: 'color',
      transitionMethod: easeOutQuad,
      transitionParams: [this.props.isOn ? 264182334 : 811880979, 400],
      delay: this.props.delay,
    };

    this.animate(animPolicy);
    this.animate(animPolicy2);
  },

  playResetAnim: function() {
    var animPolicy = {
      stateName: 'scale',
      transitionMethod: linear,
      transitionParams: [.4, 200],
      delay: this.props.delay,
    };
    var animPolicy2 = {
      stateName: 'scale',
      transitionMethod: easeOutQuad,
      transitionParams: [1, 200],
      behavior: 'queue',
    };
    var animPolicy3 = {
      stateName: 'rotation',
      transitionMethod: easeOutQuad,
      transitionParams: [Math.ceil(this.state.rotation / 90 + 1) * 90, 400],
      delay: this.props.delay,
    };
    var animPolicy4 = {
      stateName: 'color',
      transitionMethod: easeOutQuad,
      transitionParams: [this.props.isOn ? 264182334 : 811880979, 400],
      delay: this.props.delay,
    };

    this.animate(animPolicy);
    this.animate(animPolicy2);
    this.animate(animPolicy3);
    this.animate(animPolicy4);
  },

  playPressAnim: function(delay) {
    var animPolicy = {
      stateName: 'scale',
      transitionMethod: easeOutQuad,
      transitionParams: [.8, 100],
      delay: delay || 0,
    };
    var animPolicy2 = {
      stateName: 'color',
      transitionMethod: easeOutQuad,
      transitionParams: [this.props.isOn ? 264182334 : 811880979, 400],
      delay: this.props.delay,
    };

    this.animate(animPolicy);
    this.animate(animPolicy2);
  },

  playReleaseAnim: function(delay) {
    var animPolicy = {
      stateName: 'scale',
      transitionMethod: easeOutQuad,
      transitionParams: [1, 100],
      delay: delay || 0,
      behavior: 'queue',
    };

    this.animate(animPolicy);
  },

  onMouseDown: function(e) {
    this.playPressAnim();
    this.props.onMouseDown && this.props.onMouseDown();
  },

  onMouseUp: function() {
    this.playReleaseAnim();
    this.props.onMouseUp && this.props.onMouseUp();
  },

  render: function() {
    var classes = {
      'switch': true,
      'switch-done': this.props.done,
      'switch-on': this.props.isOn,
      'switch-off': !this.props.isOn
    }
    var state = this.state;

    var style = {
      transform: 'scale(' + state.scale + ') rotateZ(' + state.rotation + 'deg)',
      WebkitTransform: 'scale(' + state.scale + ') rotateZ(' + state.rotation + 'deg)',
      backgroundColor: '#' + state.color.toString(36)
    };
    return (
      <div
        className={classSet(classes)}
        style={style}
        onMouseDown={this.onMouseDown}
        onMouseUp={this.onMouseUp}
        onMouseLeave={this.onMouseUp}
      />
    );
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
    }, function() {
      this.state.board.forEach(function(row, i) {
        row.forEach(function(cell, j) {
          this.refs[i + ',' + j].playResetAnim();
        }, this);
      }, this);
    }.bind(this));
  },

  handleNeighborRelease: function(i, j) {
    var board = this.state.board;
    var refs = this.refs;
    if (i !== 0) refs[(i - 1) + ',' + j].playReleaseAnim(60);
    if (i !== board[i].length - 1) refs[(i + 1) + ',' + j].playReleaseAnim(60);
    if (j !== 0) refs[i + ',' + (j - 1)].playReleaseAnim(60);
    if (j !== board.length - 1) refs[i + ',' + (j + 1)].playReleaseAnim(60);
  },

  handleSwitchClick: function(i, j, callback) {
    var board = this.state.board;
    var lastCellIndex = board.length - 1;

    board[i][j] = !board[i][j];
    if (i !== 0) board[i - 1][j] = !board[i - 1][j];
    if (i !== board[i].length - 1) board[i + 1][j] = !board[i + 1][j];
    if (j !== 0) board[i][j - 1] = !board[i][j - 1];
    if (j !== board.length - 1) board[i][j + 1] = !board[i][j + 1];

    var refs = this.refs;
    if (i !== 0) refs[(i - 1) + ',' + j].playPressAnim(60);
    if (i !== board[i].length - 1) refs[(i + 1) + ',' + j].playPressAnim(60);
    if (j !== 0) refs[i + ',' + (j - 1)].playPressAnim(60);
    if (j !== board.length - 1) refs[i + ',' + (j + 1)].playPressAnim(60);

    var done = this.state.board.every(function(row) {
      return row.every(function(cell) {
        return !!cell;
      });
    });

    var updatedState = {
      board: this.state.board,
      done: done,
      reset: false,
    }

    this.setState(updatedState, function() {
      if (done) {
        setTimeout(this.handleReset, 1000);
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
                          onMouseUp={this.handleNeighborRelease.bind(this, i, j)}
                          i={i}
                          j={j}
                          delay={(Math.abs(i - (row.length - 1) / 2) + Math.abs(j - (row.length - 1) / 2)) * 60}
                          ref={i + ',' + j}
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
