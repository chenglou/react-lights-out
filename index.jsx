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
  // lol no, brb fetching real formula
  // but hey at least this looks pretty
  return Math.pow(curX / destX, 1/3) * (destY - initY) + initY;
}

function linear(curX, destX, initY, destY) {
  return curX / destX * (destY - initY) + initY;
}

function sin(curX, destX, initY, halfY) {
  return Math.sin(curX / destX * Math.PI) * (halfY - initY) + initY;
}

function merge(dest, source) {
  for (var key in source) {
    if (!{}.hasOwnProperty.call(source, key)) continue;
    dest[key] = source[key];
  }

  return dest;
}

var Apple = {
  configAnim: function() {
    return [].slice.apply(arguments);
  },
  animate: function(stateConfig, done) {
    var stateObj = {};
    for (var key in stateConfig) {
      if (!{}.hasOwnProperty.call(stateConfig, key)) continue;
      stateConfig[key].unshift(0)
      // 0: currentFrame, 1: func, 2: duration, 3: initValue, 4: finalValue
      stateObj[key] = stateConfig[key][3];
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
      // 0: currentFrame, 1: func, 2: duration, 3: initValue, 4: finalValue
      if (curConfig[0] >= curConfig[2] / (1000 / 60)) continue;
      stateObj[key] = curConfig[1].bind(null, curConfig[0] * (1000 / 60)).apply(null, curConfig.slice(2));
      curConfig[0] = curConfig[0] + 1;
      allDone = false;
    }

    if (allDone) {
      for (var key in stateConfig) {
        if (!{}.hasOwnProperty.call(stateConfig, key)) continue;
        stateObj[key] = stateConfig[key][4];
      }
      this.setState(stateObj, done);
      return;
    }

    requestAnimationFrame(function() {
      this.setState(stateObj, function() {
        this.__transition(stateObj, stateConfig, done);
      }.bind(this));
    }.bind(this));
  }
};

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
    this.animate({
      scale: this.configAnim(easeOut3, 300, 0, 1),
      rotation: this.configAnim(easeOut3, 300, 0, 360)
    }, function() {
      console.log('le done');
    });
  },

  componentWillReceiveProps: function() {
    this.transitioning = false;
  },

  componentDidUpdate: function() {
    // var props = this.props;
    // if (this.transitioning) {
    //   return;
    // }
    // if (props.resetAnimDelay < 0 && !props.playToggle && !props.playSiblingToggle) {
    //   return;
    // }

    // this.transitioning = true;
    // if (props.playToggle) {
    //   this.toggleAnim(function() {
    //     // done
    //   });
    // } else if (props.playSiblingToggle) {
    //   this.toggleSiblingAnim(function() {
    //     // done
    //   });
    // } else {
    //   this.resetAnim(function() {
    //     // done
    //   }.bind(this));
    // }
  },

  toggleAnim: function(done) {
    this.setState({scale: 1}, function() {
      this.toggleActiveAim(0, done);
    }.bind(this));
  },

  toggleSiblingAnim: function(done) {
    setTimeout(function() {
      this.setState({scale: 1}, function() {
        this.toggleSiblingActiveAnim(0, done);
      }.bind(this));
    }.bind(this), 200);
  },

  toggleActiveAim: function(framesDone, done) {
    var totalDuration = 400;
    var totalFrameBudget = totalDuration / (1000 / 60);
    var initScale = 1;
    var halfScale = 0.9
    var curScale = sin(framesDone, totalFrameBudget, initScale, halfScale);

    if (framesDone >= totalFrameBudget) {
      this.setState({scale: initScale}, done);
      return;
    }

    requestAnimationFrame(function() {
      this.setState({scale: curScale}, function() {
        this.toggleActiveAim(framesDone + 1, done);
      }.bind(this));
    }.bind(this));
  },

  toggleSiblingActiveAnim: function(framesDone, done) {
    var totalDuration = 400;
    var totalFrameBudget = totalDuration / (1000 / 60);
    var initScale = 1;
    var halfScale = 0.9;
    var curScale = sin(framesDone, totalFrameBudget, initScale, halfScale);

    if (framesDone >= totalFrameBudget) {
      this.setState({scale: initScale}, done);
      return;
    }

    requestAnimationFrame(function() {
      this.setState({scale: curScale}, function() {
        this.toggleSiblingActiveAnim(framesDone + 1, done);
      }.bind(this));
    }.bind(this));
  },

  resetAnim: function(done) {
    this.setState({scale: 0}, function() {
      setTimeout(function() {
        this.enterActiveAnim(0, done);
      }.bind(this), this.props.resetAnimDelay);
    }.bind(this));
  },

  enterAnim: function(done) {
    setTimeout(function() {
      this.setState({scale: 0}, function() {
        this.enterActiveAnim(0, done);
      }.bind(this));
    }.bind(this), this.props.resetAnimDelay);
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
      transform: 'scale(' + this.state.scale + ') rotateZ(' + this.state.rotation + 'deg)',
      WebkitTransform: 'scale(' + this.state.scale + ') rotateZ(' + this.state.rotation + 'deg)'
    };
    return <div className={classSet(classes)} style={style} onMouseDown={this.props.onMouseDown} />
  }
});

var LightsOut = React.createClass({
  getInitialState: function() {
    // component's internal value(s)
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
    // updating the state auto re-renders the component UI
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
                      var resetAnimDelay = -1;
                      var playToggle = false;
                      var playSiblingToggle = false;
                      if (state.reset) {
                        resetAnimDelay = (i + j) * 35;
                      }
                      if (this.state.clickedI != null && this.state.clickedJ != null) {
                        if (state.clickedI === i && state.clickedJ === j) {
                          playToggle = true;
                        } else if ((Math.abs(state.clickedI - i) === 1 && j === state.clickedJ)
                          || (Math.abs(state.clickedJ - j) === 1 && i === state.clickedI)) {
                          playSiblingToggle = true;
                        }
                      }

                      return (
                        <Switch
                          isOn={!!cell}
                          done={state.done}
                          onMouseDown={this.handleSwitchClick.bind(this, i, j)}
                          posX={i}
                          posY={j}
                          resetAnimDelay={resetAnimDelay}
                          playToggle={playToggle}
                          playSiblingToggle={playSiblingToggle}
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
