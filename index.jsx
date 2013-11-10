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
  __animating: false,

  animate: function(config) {
    if (!this.__animConfigs) {
      this.__animConfigs = {};
    }
    var behavior = config.behavior || 'continue';
    var configs = this.__animConfigs;

    if (configs[config.stateName]) {
      if (behavior === 'continue') {
        config.transitionParams[0] = this.__stateObj[config.stateName];
        configs[config.stateName] = config;
      } else if (behavior === 'interrupt') {
        configs[config.stateName] = config;
      } else if (behavior === 'queue') {

      } else {
        throw 'mary';
      }
    } else {
      configs[config.stateName] = config;
    }

    config.initTime = Date.now();
    if (!this.__animating) {
      this.__animating = true;
      this.__transition();
    }
  },

  __transition: function() {
    var configs = this.__animConfigs;
    if (!this.__stateObj) {
      this.__stateObj = {};
    }

    var state = this.__stateObj;
    var progressTime;
    var doneCallbacks = {};

    for (var key in configs) {
      var config = configs[key];
      var duration = config.transitionParams[2];
      var now = Date.now();

      if (now - config.initTime < duration) {
        progressTime = now - config.initTime;
      } else {
        // animate to the final state one last time to avoid rounding errors
        progressTime = duration;
        doneCallbacks[key] = config.callback;
      }

      state[key] = config.transitionMethod.apply(null, [progressTime].concat(config.transitionParams));
    }

    requestAnimationFrame(function() {
      this.setState(state, function() {
        for (var key in doneCallbacks) {
          doneCallbacks[key]();
          delete configs[key];
          delete state[key]
        }
        if (Object.keys(configs).length === 0) {
          this.__animating = false;
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
  transitioning: false,

  getInitialState: function() {
    return {
      scale: 1,
      rotation: 0
    }
  },

  componentDidMount: function() {
    this.playResetAnim();
  },

  playResetAnim: function() {
    console.log(this._lifeCycleState);
    var animPolicy = {
      stateName: 'scale',
      transitionMethod: easeOutBounce,
      transitionParams: [0, 1, 800],
      behavior: 'interrupt',
      delay: (this.props.posX + this.props.posY) * 35,
      callback: function() {
        console.log('done reset');
      }
    };
    this.animate(animPolicy);

    var animPolicy2 = {
      stateName: 'rotation',
      transitionMethod: easeOutQuad,
      transitionParams: [0, 360, 1000],
      behavior: 'interrupt',
      delay: (this.props.posX + this.props.posY) * 35,
      callback: function() {
        console.log('done reset');
      }
    };
    this.animate(animPolicy2);
  },

  playClickedAnim: function() {
    var animPolicy = {
      stateName: 'scale',
      transitionMethod: easeOutQuad,
      transitionParams: [.8, 10.5, 300],
      behavior: 'interrupt',
      callback: function() {
        console.log('done');
      }
    };
    console.log(this.__stateObj);
    this.animate(animPolicy);
  },

  onMouseDown: function(e) {
    this.playClickedAnim();
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
    // this.refs.grid.props.children.forEach(function(row) {
    //   console.log('basha', row._lifeCycleState);
    //   row.props.children.forEach(function(cell) {
    //     console.log(cell._lifeCycleState, 'baha');
    //     cell.playResetAnim();
    //   });
    // });
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
