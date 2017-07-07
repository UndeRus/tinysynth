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
const TRACK_SWITCH_MODE = 2;
const RECORD_MODE = 3;
const BPM_MODE = 4;
const VOLUME_MODE = 5;
const ERASE_MODE = 6;

var keypadMode = NOTE_MODE

var selectedSampler = 0;

var samplers = [
];

for (var i = 0; i < samples.length; i++) {
  samplers.push(new Tone.Sampler("/audio/" + samples[i] + ".wav").toMaster());
}

//Tone.context.latencyHint = 'fastest';
Tone.context.latencyHint = 0.05;


class SequencerStore {
	@observable playState = STOPPED;
	@observable selectMode;
	@observable selectedSample;
	@observable sequencePosition = 0;
  @observable volumes = [];

  @observable numButtons;

  @observable bpm;

  loop;
  @observable tracks;


  @observable tracksEnabled = [];


	constructor() {

    this.numButtons =
    [
      {
        sampleSelected: true
      }
    ];

    this.bpm = Tone.Transport.bpm.value;

    //this.playState = STOPPED;

    for (var k = 0; k < 16; k++) {
      this.numButtons.push({
        sampleSelected: false
      });

      this.tracksEnabled.push(true);
      this.volumes.push(100);
    }

    this.tracks = [];
    // Create empty track for each sample
    for (var i = 0; i < 16; i++) {
        var pitches = [];
        for (var j = 0; j < 16; j++) {
          pitches.push(null);
        }
        this.tracks.push(pitches);
    }

    //console.log(this.tracks);


    var steps = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
    this.loop = new Tone.Sequence((time, index) => {
      for (let i = 0; i < this.tracks.length; i++) {
        if (this.tracksEnabled[i] === false) {
          continue;
        }
        var note = this.tracks[i][index];
        if (note != null) {
          samplers[i].triggerAttackRelease(note, "8n", "+0.05");
        }
      }
      /*
      Tone.Draw.schedule((asdf) => {
        this.sequencePosition = index;
      }, time);
      */
      //console.log(time, index);
    }, steps, "8n");

    this.loop.humanize = false;
    Tone.Transport.start("+0.1");
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
      this.sequencePosition = 0;
      //Tone.context.latencyHint = "interactive";
    } else if (this.playState === STOPPED) {
      this.loop.start();
      this.playState = PLAYING;
      //Tone.context.latencyHint = "playback";
    }

    //console.log(this.playState);
  }

  putNote(samplerIndex, position, pitch) {
    //const currentPitch = this.tracks[samplerIndex][position];
    this.tracks[samplerIndex][position] = pitch;
  }

  moveCursorNext() {
    var curPos = this.sequencePosition;
    if (curPos === 15) {
      this.sequencePosition = 0;
    } else {
      this.sequencePosition = curPos + 1;
    }
  }

  moveCursorPrev() {
    var curPos = this.sequencePosition;
    if (curPos === 0) {
      this.sequencePosition = 15;
    } else {
      this.sequencePosition = curPos - 1;
    }
  }


  getJson() {
    return {
      volumes: this.volumes,
      tracks: this.tracks,
      tracksEnabled: this.tracksEnabled,
      bpm: this.bpm
    }
  }

  loadJson(json) {
    this.loop.stop();
    this.volumes = json.volumes;
    this.tracks = json.tracks;
    this.tracksEnabled = json.tracksEnabled;
    this.bpm = json.bpm;
    Tone.Transport.bpm.rampTo(this.bpm);
  }
}

const sequencerStore = new SequencerStore();


@observer
class SequenceItem extends Component {
  render() {
    const classes= "sequenceItem" + (this.props.selected ? " sequenceItemCurrent": "");
    return (
      <span className={classes} >
        <table style={{"width": "100%", "height": "100%"}}>
          <tbody>
            <tr>{[0, 1, 2, 3].map((x, i) => {
                const enabled = sequencerStore.tracks[x][this.props.index] != null;
                var style = {"width": "25%", "height": "25%"}
                if (enabled) {
                  style["backgroundColor"] = "red";
                }
                return (<td key={i} style={style} />)
              })}
            </tr>
            <tr>{
              [4, 5, 6, 7].map((x, i) => {
                const enabled = sequencerStore.tracks[x][this.props.index] != null;
                var style = {"width": "25%", "height": "25%"}
                if (enabled) {
                  style["backgroundColor"] = "red";
                }
                return (<td key={i} style={style} />)
            })}
            </tr>
            <tr>{
              [8, 9, 10, 11].map((x, i) => {
                const enabled = sequencerStore.tracks[x][this.props.index] != null;
                var style = {"width": "25%", "height": "25%"}
                if (enabled) {
                  style["backgroundColor"] = "red";
                }
                return (<td key={i} style={style} />)
            })}
            </tr>
            <tr>{
              [12, 13, 14, 15].map((x, i) => {
                const enabled = sequencerStore.tracks[x][this.props.index] != null;
                var style = {"width": "25%", "height": "25%"}
                if (enabled) {
                  style["backgroundColor"] = "red";
                }
                return (<td key={i} style={style} />)
            })}
            </tr>
          </tbody>
        </table>
      </span>
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
  }

  render() {
    const position = this.props.store.sequencePosition;
    return (
      <div className="sequenceTrack">
        {[...Array(16)].map((x, i) =>
          <SequenceItem key={i} index={i} selected={i === position} />
        )}
      </div>
    )
  }
}


@observer
class NumButton extends Component {

  numKeyPress = (event) => {
    event.preventDefault();
  };


  numKeyDown = (event) => {
    event.preventDefault();
    var props = this.props;

    switch (keypadMode) {
      case NOTE_MODE:
        samplers[selectedSampler].triggerAttackRelease(props.num, "8n");
        break;
      case SAMPLE_SWITCH_MODE:
        selectedSampler = this.props.num - 1;
        sequencerStore.setSamplerActive(selectedSampler);
        break;
      case RECORD_MODE:
        //TODO: record current sample to sequence
        sequencerStore.putNote(selectedSampler, sequencerStore.sequencePosition, props.num);
        sequencerStore.moveCursorNext();
        samplers[selectedSampler].triggerAttackRelease(props.num, "8n");
        break;
      case TRACK_SWITCH_MODE:
        sequencerStore.tracksEnabled[props.num - 1] = !sequencerStore.tracksEnabled[props.num - 1];
        break;
      case ERASE_MODE:
        sequencerStore.tracks[props.num - 1][sequencerStore.sequencePosition] = null;
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
    var trackEnabled = sequencerStore.tracksEnabled[this.props.num - 1];

    var enabledClass = trackEnabled ? "track-enabled" : "track-disabled";

    const volumeHeight = `${sequencerStore.volumes[this.props.num - 1]}%`;
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
             <div className={enabledClass} />
             <div style={{"height": "12vw", "width": "10%"}}>
              <div style={{"height": volumeHeight, "backgroundColor": "#FF9000"}}></div>
             </div>
      </div>
    )
  }
}

class EraseButton extends Component {
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
    keypadMode = ERASE_MODE;
    console.log("ERASE MODE");
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


// DECIBELS
// -20...0

function percent2decibel(percent: number){
  return -20. / 100 * (100 - percent);
}

class NextSeqButton extends FuncButton {
  render() {
    return (
      <div className="button func arrow" onMouseDown={this.onClick}  onTouchEnd={this.onClick}>{this.props.label}</div>
    )
  }

  onClick = (event) => {
    event.preventDefault();
    switch (keypadMode) {
      case NOTE_MODE:
        sequencerStore.moveCursorNext();
        break;
      case BPM_MODE:
        const currentBpm = sequencerStore.bpm;
        if (currentBpm === 1000) {
          return;
        }
        sequencerStore.bpm += 5;
        Tone.Transport.bpm.rampTo(sequencerStore.bpm, 1);
        break;
      case VOLUME_MODE:
        var currentVolume = sequencerStore.volumes[selectedSampler];
        if (currentVolume === 100) {
          return;
        }
        currentVolume += 1;
        sequencerStore.volumes[selectedSampler] = currentVolume;
        samplers[selectedSampler].volume.rampTo(percent2decibel(currentVolume), 1);
        break;
      default:
        break;
    }

  }
}


class PrevSeqButton extends FuncButton {
  render() {
    return (
      <div className="button func arrow" onMouseDown={this.onClick} onTouchEnd={this.onClick}>{this.props.label}</div>
    )
  }

  onClick = (event) => {
    event.preventDefault();

    switch (keypadMode) {
      case NOTE_MODE:
        sequencerStore.moveCursorPrev();
        break;
      case BPM_MODE:
        const currentBpm = sequencerStore.bpm;
        if (currentBpm === 5) {
          return;
        }
        sequencerStore.bpm -= 5;
        Tone.Transport.bpm.rampTo(sequencerStore.bpm, 1);
        break;
      case VOLUME_MODE:
        var currentVolume = sequencerStore.volumes[selectedSampler];
        if (currentVolume === 0) {
          return;
        }
        currentVolume -= 1;
        sequencerStore.volumes[selectedSampler] = currentVolume;
        samplers[selectedSampler].volume.rampTo(percent2decibel(currentVolume), 1);
        break;
      default:
        break;
    }
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

class TrackSwitchButton extends Component {
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
    keypadMode = TRACK_SWITCH_MODE;
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


class RecordButton extends Component {
  state: {
    active: false
  }


  constructor(props) {
    super(props);

    this.state = {
      active: false
    };
  }

  render() {
    var active = this.state.active ? "func-active" : "";
    var classes = `button func ${active}`;
    return (
      <div className={classes}
           onContextMenu={() => false}
           onTouchStart={this.onDown}
           onTouchEnd={this.onUp}
           onMouseDown={this.onDown}
           onMouseUp={this.onUp}>{this.props.label}</div>
    )
  }

  onDown = (event) => {
    event.preventDefault();
    console.log("RECORD MODE");
    this.setState({active: true});
    keypadMode = RECORD_MODE;
  }

  onUp = (event) => {
    event.preventDefault();
    console.log("NOTE MODE");
    this.setState({active: false});
    keypadMode = NOTE_MODE;
  }
}

@observer
class BPMButton extends Component {
  state: {
    active: false
  }


  constructor(props) {
    super(props);

    this.state = {
      active: false
    };
  }

  render() {
    var active = this.state.active ? "func-active" : "";
    var classes = `button knob ${active}`;
    var content = `BPM ${sequencerStore.bpm}`;
    return (
      <div className={classes}
           onContextMenu={() => false}
           onTouchStart={this.onDown}
           onTouchEnd={this.onUp}
           onMouseDown={this.onDown}
           onMouseUp={this.onUp}>{content}</div>
    )
  }

  onDown = (event) => {
    event.preventDefault();
    console.log("BPM MODE");
    this.setState({active: true});
    keypadMode = BPM_MODE;
  }

  onUp = (event) => {
    event.preventDefault();
    console.log("NOTE MODE");
    this.setState({active: false});
    keypadMode = NOTE_MODE;
  }
}

class VolumeButton extends Component {
  state: {
    active: false
  }


  constructor(props) {
    super(props);

    this.state = {
      active: false
    };
  }

  onDown = (event) => {
    event.preventDefault();
    console.log("VOLUME MODE");
    this.setState({active: true});
    keypadMode = VOLUME_MODE;
  }

  onUp = (event) => {
    event.preventDefault();
    console.log("NOTE MODE");
    this.setState({active: false});
    keypadMode = NOTE_MODE;
  }

  render() {
    var active = this.state.active ? "func-active" : "";
    var classes = `button knob ${active}`;
    return (
      <div className={classes}
         onContextMenu={() => false}
         onTouchStart={this.onDown}
         onTouchEnd={this.onUp}
         onMouseDown={this.onDown}
         onMouseUp={this.onUp}>{this.props.label}</div>
    )
  }
}

/*
class Knob extends Component {
  render() {
    return (
      <div className="button knob">{this.props.label}</div>
    )
  }
}
*/

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
      <div style={{textAlign: "center"}}>
        <SoundSelectButton label="♪" />
        <TrackSwitchButton label="𝄜" />
        <EraseButton label="C" />
        <VolumeButton label="VOL" />
        <BPMButton label="BPM" />
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
        <RecordButton label="●" />
        <br/>
        <PrevSeqButton label="&lt;" />
        <NextSeqButton label="&gt;" />
        <br/>
      </div>
    )
  }
}

var currentSong = 0;

class SaveButton extends Component {
  render() {
    const style = {"height": "19vw", "width": "19%", "backgroundColor": "orange", "border": "1px solid gray", "display": "inline-block", "color": "white", "textAlign": "center"};
    return (
      <span style={style} onClick={this.onClick}>S</span>
    )
  }

  onClick = (e) => {
    console.log(currentSong);
    const songJson = sequencerStore.getJson();

    localStorage.setItem("song" + currentSong, JSON.stringify(songJson));
  }
}

class LoadButton extends Component {
  render() {
    const style = {"height": "19vw", "width": "19%", "backgroundColor": "orange", "border": "1px solid gray", "display": "inline-block", "color": "white", "textAlign": "center"};
    return (
      <span style={style} onClick={this.onClick}>L</span>
    )
  }

  onClick = (e) => {
    console.log(currentSong);

    var songStr = localStorage.getItem("song" + currentSong);
    if (songStr != null) {
      const songJson = JSON.parse(songStr);
      sequencerStore.loadJson(songJson);
    }
  }
}



class TrackSelector extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 0
    };
  }
  render() {
    const style = {"height": "19vw", "width": "60%", "display": "inline-block", "verticalAlign": "top"};
    return (
      <div>
        <select style={style} onChange={this.change} value={this.state.value}>
          {[...Array(10)].map((x, i) => {
            return (<option key={i}>{i}</option>)
          })}
        </select>
        <SaveButton />
        <LoadButton />
      </div>
    )
  }

  change = (e) => {
    console.log(e.target.value);
    currentSong = e.target.value;
  };
}


class SixVencer extends Component {
  render() {
    const store = this.props.store;
    return (
      <div>
        <SequenceLine store={ store } />
        <SixVencerKeyboard store={ store } numButtons={ store.numButtons } playState={ store.playState } />
        <br/>
        <TrackSelector />
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
