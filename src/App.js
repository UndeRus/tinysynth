/* @flow */

//import type { Track, EncodedTrack } from "./types";

import Tone from "tone";

import React, { Component } from "react";
/*
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FABButton,
  Icon,
  Slider,
  Switch,
} from "react-mdl";
*/

import "./App.css";
import "react-mdl/extra/css/material.light_blue-pink.min.css";
import "react-mdl/extra/material.js";


import {autorun, observable} from 'mobx';
import {observer} from 'mobx-react';

/*
import * as sequencer from "./sequencer";
import * as model from "./model";
*/
import samples from "./samples.json";


const PLAYING = 1;
const STOPPED = 0;


//var samplerReady = false;
//var sampler = new Tone.Sampler("/audio/" + samples[0] + ".wav").toMaster();

const NOTE_MODE = 0;
const SAMPLE_SWITCH_MODE = 1;

var keypadMode = NOTE_MODE

var selectedSampler = 0;

var samplers = [
];

for (var i = 0; i < samples.length; i++) {
  samplers.push(new Tone.Sampler("/audio/" + samples[i] + ".wav").toMaster());
}


class SequencerStore {
	@observable playState = STOPPED;
	@observable selectMode;
	@observable selectedSample;
	@observable sequencePosition = 0;

  @observable numButtons;

  loop;

  //@observable
  tracks;


	constructor() {

    this.numButtons =
    [
      {
        sampleSelected: true
      }
    ];

    //this.playState = STOPPED;

    for (var k = 0; k < 16; k++) {
      this.numButtons.push({
        sampleSelected: false
      });
    }

    this.tracks = [];
    // Create empty track for each sample
    for (var i = 0; i < 16; i++) {
        var pitches = [];
        for (var j = 0; j < 16; j++) {
          //pitches.push(null);
          //FOR TEST PURPOSES ONLY
          pitches.push(Math.floor(Math.random() * 16));
        }
        this.tracks.push(pitches);
    }

    //console.log(this.tracks);


    var steps = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
    this.loop = new Tone.Sequence((time, index) => {
      for (let i = 0; i < this.tracks.length; i++) {
        var note = this.tracks[i][index];
        if (note != null) {
          samplers[i].triggerAttackRelease(note, "1n");
        }
      }
      this.sequencePosition = index;
      //console.log(time, index);
    }, steps, "16n");
    Tone.Transport.start();
		autorun(() => console.log("event emitted"));
	}

  setSamplerActive(samplerId) {
    for (var i = 0; i < this.numButtons.length; i++) {
      if (samplerId === i) {
        this.numButtons[i].sampleSelected = true;
      } else {
        this.numButtons[i].sampleSelected = false;
      }
    }
  }


  togglePlay() {
    if (this.playState === PLAYING) {
      this.loop.stop();
      this.playState = STOPPED;
    } else if (this.playState === STOPPED) {
      this.loop.start();
      this.playState = PLAYING;
    }

    //console.log(this.playState);
  }
}

const sequencerStore = new SequencerStore();


@observer
class SequenceItem extends Component {
  /*
  constructor(props) {
    super(props);
  }
  */

  render() {
    return (
      <span className={this.props.selected ? "sequenceItemCurrent" : "sequenceItem"} />
    )
  }
}

@observer
class SequenceLine extends Component {
  state: {
    current: number,
    length: number,
  };

  constructor(props) {
    super(props);
    this.state = {
      current: 0
    }


    /*
    var that = this;
    setInterval(function(){
      var cursor = that.state.current;

      cursor++;
      if (cursor > 15) {
        cursor = 0;
      }

      console.log(cursor);

      that.setState({current: cursor});
    }, 100);
    */
  }

  render() {
    const position = this.props.store.sequencePosition;
    return (
      <div className="sequenceTrack">
        {[...Array(16)].map((x, i) =>
          <SequenceItem key={i} selected={i === position} />
        )}
      </div>
    )
  }
}


@observer
class NumButton extends Component {
  /*
  constructor(props) {
    super(props);
  }
  */

  numKeyPress = (event) => {
    event.preventDefault();
    //var props = this.props;
  };


  numKeyDown = (event) => {
    event.preventDefault();
    var props = this.props;

    switch (keypadMode) {
      case NOTE_MODE:
        samplers[selectedSampler].triggerAttackRelease(props.num, "1n");
        break;
      case SAMPLE_SWITCH_MODE:
        selectedSampler = this.props.num - 1;
        sequencerStore.setSamplerActive(selectedSampler);
        break;
      default:
        break;
    }
  };


  numKeyUp = (event) => {
    event.preventDefault();
  };

  render() {
    const buttonState = this.props.state;
    //var selectedSampleClass = (selectedSampler == this.props.num - 1) ? " num-selected" : "";
    //var selectedSampleClass = this.data.selected ? " num-selected" : "";
    var selectedSampleClass = buttonState.sampleSelected ? " num-selected" : "";;
    var classes = `button num${selectedSampleClass}`;
    return (
      <div className={classes}
           onClick={this.numKeyPress}
           onMouseDown={this.numKeyDown}
           onTouchStart={this.numKeyDown}
           onTouchEnd={this.numKeyUp}
           onTouchCancel={this.numKeyUp}
           onMouseUp={this.numKeyUp}>
           <div className="num-label">
           {this.props.label}
           </div>
      </div>
    )
  }
}

@observer
class FuncButton extends Component {
  /*
  constructor(props) {
    super(props);
  }
  */

  render() {
    return (
      <div className="button func">{this.props.label}</div>
    )
  }
}


class SoundSelectButton extends FuncButton {
  state: {
    active: boolean
  }

  constructor(props) {
    super(props);

    this.state = {
      active: false
    };
  }


  sKeyDown = (event) => {
    keypadMode = SAMPLE_SWITCH_MODE;
    this.setState({active: true});
  };


  sKeyUp = (event) => {
    keypadMode = NOTE_MODE;
    this.setState({active: false});
  };


  render() {

    var active = this.state.active ? "func-active" : "";
    var classes = `button func ${active}`;
    return (
      <div className={classes} onMouseDown={this.sKeyDown}
           onTouchStart={this.sKeyDown}
           onTouchEnd={this.sKeyUp}
           onTouchCancel={this.sKeyUp}
           onMouseUp={this.sKeyUp}>{this.props.label}</div>
    )
  }
}

@observer
class PlayStopButton extends Component {
  /*
  constructor(props){
    super(props);
  }
  */
  render() {
    const playState = this.props.store.playState;

    var label = (playState === PLAYING) ? "⏹" : "▶";
    return (
      <div className="button func" onClick={this.onClick}>{label}</div>
    )
  }

  onClick = (event) => {
    event.preventDefault();
    sequencerStore.togglePlay();
  }
}

class Knob extends Component {
  /*
  constructor(props) {
    super(props);
  }
  */

  render() {
    return (
      <div className="button knob">{this.props.label}</div>
    )
  }
}

@observer
class SixVencerKeyboard extends Component {
  /*
  constructor(props) {
    super(props);
  }
  */


  render() {
    const buttons = this.props.numButtons
    const store = this.props.store;
    return (
      <div>
        <SoundSelectButton label="♪" />
        <FuncButton label="𝄜" />
        <FuncButton label="BPM" />
        <Knob label="⟳" />
        <Knob label="⟳" />
        <br/>
        <NumButton state={buttons[0]} num="1" label="1" />
        <NumButton state={buttons[1]} num="2" label="2" />
        <NumButton state={buttons[2]} num="3" label="3" />
        <NumButton state={buttons[3]} num="4" label="4" />
        <FuncButton label="F" />
        <br/>
        <NumButton state={buttons[4]} num="5" label="5" />
        <NumButton state={buttons[5]} num="6" label="6" />
        <NumButton state={buttons[6]} num="7" label="7" />
        <NumButton state={buttons[7]} num="8" label="8" />
        <FuncButton label="FX" />
        <br/>
        <NumButton state={buttons[8]} num="9" label="9" />
        <NumButton state={buttons[9]} num="10" label="10" />
        <NumButton state={buttons[10]} num="11" label="11" />
        <NumButton state={buttons[11]} num="12" label="12" />
        <PlayStopButton store={store} />
        <br/>
        <NumButton state={buttons[12]} num="13" label="13" />
        <NumButton state={buttons[13]} num="14" label="14" />
        <NumButton state={buttons[14]} num="15" label="15" />
        <NumButton state={buttons[15]} num="16" label="16" />
        <FuncButton label="●" />
        <br/>
      </div>
    )
  }
}



class SixVencer extends Component {
  render() {
    const store = this.props.store;
    return (
      <div>
        <SequenceLine store={ store } />
        <SixVencerKeyboard store={ store } numButtons={ store.numButtons } playState={ store.playState } />
      </div>
    )
  }
}

class App extends Component {
  render() {
    return (
      <SixVencer store={ sequencerStore } />
    )
  }
}

export default App;
