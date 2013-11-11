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

boards = [
  [[1]]
]

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

var Apple = {
  __transitioning: false,

  animate: function(config) {
    if (!this.__animConfigs) {
      this.__animConfigs = {};
    }
    var configs = this.__animConfigs;

    config.initTime = Date.now() + (config.delay || 0);
    config.initVal = this.state[config.stateName];

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
          doneCallbacks[key] && doneCallbacks[key]();
          delete configs[key];
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
      opacity: 1
    }
  },

  componentDidMount: function() {
    this.playMountAnim();
    // setTimeout(function() {
    //   console.log('-------------------');
    //   this.setState({
    //     rotation: 200,
    //   });
    // }.bind(this), 5000);
  },

  playMountAnim: function() {
    console.log('playing mount anim');
    var animPolicy = {
      stateName: 'scale',
      transitionMethod: easeOutQuad,
      transitionParams: [1, 400],
      delay: this.props.delay,
      callback: function() {
        console.log('done reset scale');
      }
    };
    this.animate(animPolicy);
  },

  playResetAnim: function() {
    console.log('playing reset anim');
    var animPolicy = {
      stateName: 'scale',
      transitionMethod: easeOutBounce,
      transitionParams: [1, 1000],
      delay: this.props.delay,
      callback: function() {
        console.log('done reset scale');
      }
    };

    var animPolicy2 = {
      stateName: 'rotation',
      transitionMethod: easeOutQuad,
      transitionParams: [360, 500],
      delay: this.props.delay,
      callback: function() {
        console.log('done reset rotate');
      }
    };

    this.animate(animPolicy);
    this.animate(animPolicy2);
  },

  playClickedAnim: function() {
    console.log('playing click anim');
    var animPolicy = {
      stateName: 'scale',
      transitionMethod: easeOutQuad,
      transitionParams: [.8, 100],
    };
    var animPolicy2 = {
      stateName: 'scale',
      transitionMethod: easeOutQuad,
      transitionParams: [1, 100],
      delay: 100
    }
    this.animate(animPolicy);
    this.animate(animPolicy2);
  },

  onMouseDown: function(e) {
    // this.playClickedAnim();
    this.props.onMouseDown && this.props.onMouseDown(this.playClickedAnim);
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
      opacity: state.opacity
    };
    return <div className={classSet(classes)} style={style} onMouseDown={this.onMouseDown} />
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

  componentDidUpdate: function() {
    this.state.board.forEach(function(row, i) {
      row.forEach(function(cell, j) {
        this.refs[i + ',' + j].playResetAnim();
      }, this);
    }, this);
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

  handleSwitchClick: function(i, j, callback) {
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
    done = false;
    var updatedState = {
      board: this.state.board,
      done: done,
      reset: false,
      clickedI: i,
      clickedJ: j
    }

    this.setState(updatedState, function() {
      callback && callback();
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
