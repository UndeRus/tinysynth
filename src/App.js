/* @flow */

import type { Track, EncodedTrack } from "./types";

import Tone from "tone";

import React, { Component } from "react";
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

import "./App.css";
import "react-mdl/extra/css/material.light_blue-pink.min.css";
import "react-mdl/extra/material.js";


import {autorun, observable} from 'mobx';
import {observer} from 'mobx-react';

import * as sequencer from "./sequencer";
import * as model from "./model";
import samples from "./samples.json";


class SequencerStore {
	@observable playState;
	@observable selectMode;
	@observable selectedSample;
	@observable sequencePosition;

  @observable numButtons;


	constructor() {

    this.numButtons =
    [
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false
    ];
		autorun(() => console.log("event emitted"));
	}

  setSamplerActive(samplerId) {
    for (var i = 0; i < this.numButtons.length; i++) {
      if (samplerId === i) {
        this.numButtons[i] = true;
      } else {
        this.numButtons[i] = false;
      }
    }
  }
}

@observer
class SequenceItem extends Component {
  constructor(props) {
    super(props);
  }

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
    return (
      <div className="sequenceTrack">
        {[...Array(16)].map((x, i) =>
          <SequenceItem key={i} selected={i === this.state.current} />
        )}
      </div>
    )
  }
}

var samplerReady = false;
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

@observer
class NumButton extends Component {

  state: {
    selected: boolean
  };
  constructor(props) {
    super(props);
  }

  numKeyPress = (event) => {
    event.preventDefault();
    var props = this.props;
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
    var selectedSampleClass = buttonState ? " num-selected" : "";;
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
  constructor(props) {
    super(props);
  }

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


class Knob extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="button knob">{this.props.label}</div>
    )
  }
}

@observer
class SixVencerKeyboard extends Component {
  constructor(props) {
    super(props);
  }


  render() {
    const buttons = this.props.numButtons
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
        <FuncButton label="▶" />
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


class SampleSelector extends Component {
  state: {
    open: boolean,
  };

  constructor(props) {
    super(props);
    this.state = {open: false};
  }

  open = (event) => {
    event.preventDefault();
    this.setState({open: true});
  };

  close = () => {
    this.setState({open: false});
  };

  onChange = (event) => {
    const {id, onChange} = this.props;
    onChange(id, event.target.value);
    this.close();
  };

  render() {
    const {current} = this.props;
    const {open} = this.state;
    if (open) {
      return (
        <select autoFocus value={current} onChange={this.onChange} onBlur={this.close}>{
          samples.map((sample, i) => {
            return <option key={i}>{sample}</option>;
          })
        }</select>
      );
    } else {
      return <a href="" onClick={this.open}>{current}</a>;
    }
  }
}

function TrackListView({
  tracks,
  currentBeat,
  toggleTrackBeat,
  setTrackVolume,
  updateTrackSample,
  muteTrack,
  clearTrack,
  deleteTrack,
}) {
  return (
    <tbody>{
      tracks.map((track, i) => {
        return (
          <tr key={i}className="track">
            <th>
              <SampleSelector id={track.id} current={track.name} onChange={updateTrackSample} />
            </th>
            <td className="vol">
              <Slider min={0} max={1} step={.1} value={track.vol}
                onChange={event => setTrackVolume(track.id, parseFloat(event.target.value))} />
            </td>
            <td className="mute">
              <Switch defaultChecked={!track.muted} onChange={event => muteTrack(track.id)} />
            </td>
            {
              track.beats.map((v, beat) => {
                const beatClass = v ? "active" : beat === currentBeat ? "current" : "";
                return (
                  <td key={beat} className={`beat ${beatClass}`}>
                    <a href="" onClick={(event) => {
                      event.preventDefault();
                      toggleTrackBeat(track.id, beat);
                    }} />
                  </td>
                );
              })
            }
            <td>
              {track.beats.some(v => v) ?
                <a href="" title="Clear track" onClick={event => {
                  event.preventDefault();
                  clearTrack(track.id);
                }}><Icon name="delete"/></a> :
                <Icon className="disabled-icon" name="delete"/>}
              <a href="" title="Delete track" onClick={event => {
                event.preventDefault();
                deleteTrack(track.id);
              }}><Icon name="delete_forever"/></a>
            </td>
          </tr>
        );
      })
    }</tbody>
  );
}

function Controls({bpm, updateBPM, playing, start, stop, addTrack, share}) {
  const onChange = event => updateBPM(parseInt(event.target.value, 10));
  return (
    <tfoot className="controls">
      <tr>
        <td style={{textAlign: "right"}}>
          <FABButton mini colored onClick={addTrack} title="Add new track">
            <Icon name="add" />
          </FABButton>
        </td>
        <td />
        <td>
          <FABButton mini colored onClick={playing ? stop : start}>
            <Icon name={playing ? "stop" : "play_arrow"} />
          </FABButton>
        </td>
        <td colSpan="2" className="bpm">
          BPM <input type="number" value={bpm} onChange={onChange} />
        </td>
        <td colSpan="13">
          <Slider min={30} max={240} value={bpm} onChange={onChange} />
        </td>
        <td colSpan="2">
          <FABButton mini onClick={share} title="Share">
            <Icon name="share" />
          </FABButton>
        </td>
      </tr>
    </tfoot>
  );
}

function ShareDialog({hash, closeDialog}) {
  return (
    <Dialog open>
      <DialogTitle>Share</DialogTitle>
      <DialogContent>
        <p>Send this link to your friends so they can enjoy your piece:</p>
        <p className="share-link" style={{textAlign: "center"}}>
          <a className="mdl-button mdl-js-button mdl-button--colored"
            href={"#" + hash} onClick={event => event.preventDefault()}>Link</a>
        </p>
        <p>Right-click, <em>Copy link address</em> to copy the link.</p>
      </DialogContent>
      <DialogActions>
        <Button colored type="button" onClick={closeDialog}>close</Button>
      </DialogActions>
    </Dialog>
  );
}

class App_old extends Component {
  loop: Tone.Sequence;

  state: {
    bpm: number,
    currentBeat: number,
    playing: boolean,
    tracks: Track[],
    shareHash: ?string,
  };

  constructor(props: {}) {
    super(props);
    const hash = location.hash.substr(1);
    if (hash.length > 0) {
      try {
        const {bpm, tracks}: {
          bpm: number,
          tracks: EncodedTrack[],
        } = JSON.parse(atob(hash));
        this.initializeState({
          bpm,
          tracks: model.decodeTracks(tracks),
        });
      } catch(e) {
        console.warn("Unable to parse hash", hash, e);
        this.initializeState({tracks: model.initTracks()});
      } finally {
        location.hash = "";
      }
    } else {
      this.initializeState({tracks: model.initTracks()});
    }
  }

  initializeState(state: {bpm?: number, tracks: Track[]}) {
    this.state = {
      bpm: 120,
      playing: false,
      currentBeat: -1,
      shareHash: null,
      ...state,
    };
    this.loop = sequencer.create(state.tracks, this.updateCurrentBeat);
    sequencer.updateBPM(this.state.bpm);
  }

  start = () => {
    this.setState({playing: true});
    this.loop.start();
  };

  stop = () => {
    this.loop.stop();
    this.setState({currentBeat: -1, playing: false});
  };

  updateCurrentBeat = (beat: number): void => {
    this.setState({currentBeat: beat});
  };

  updateTracks = (newTracks: Track[]) => {
    this.loop = sequencer.update(this.loop, newTracks, this.updateCurrentBeat);
    this.setState({tracks: newTracks});
  };

  addTrack = () => {
    const {tracks} = this.state;
    this.updateTracks(model.addTrack(tracks));
  };

  clearTrack = (id: number) => {
    const {tracks} = this.state;
    this.updateTracks(model.clearTrack(tracks, id));
  };

  deleteTrack = (id: number) => {
    const {tracks} = this.state;
    this.updateTracks(model.deleteTracks(tracks, id));
  };

  toggleTrackBeat = (id: number, beat: number) => {
    const {tracks} = this.state;
    this.updateTracks(model.toggleTrackBeat(tracks, id, beat));
  };

  setTrackVolume = (id: number, vol: number) => {
    const {tracks} = this.state;
    this.updateTracks(model.setTrackVolume(tracks, id, vol));
  };

  muteTrack = (id: number) => {
    const {tracks} = this.state;
    this.updateTracks(model.muteTrack(tracks, id));
  };

  updateBPM = (newBpm: number) => {
    sequencer.updateBPM(newBpm);
    this.setState({bpm: newBpm});
  };

  updateTrackSample = (id: number, sample: string) => {
    const {tracks} = this.state;
    this.updateTracks(model.updateTrackSample(tracks, id, sample));
  };

  closeDialog = () => {
    this.setState({shareHash: null});
  };

  randomSong = () => {
    const {bpm, tracks} = model.randomSong();
    this.updateTracks(tracks);
    this.updateBPM(bpm);
  };

  share = () => {
    const {bpm, tracks} = this.state;
    const shareHash = btoa(JSON.stringify({
      bpm,
      tracks: model.encodeTracks(tracks),
    }));
    this.setState({shareHash});
  };

  render() {
    const {bpm, currentBeat, playing, shareHash, tracks} = this.state;
    const {updateBPM, start, stop, addTrack, share, randomSong, closeDialog} = this;
    return (
      <div className="app">
        <h3>tinysynth</h3>
        {shareHash ?
          <ShareDialog hash={shareHash} closeDialog={closeDialog} /> : null}
        <table>
          <tr>
            <td colSpan="19">
              <p style={{textAlign: "right"}}>
                <Button type="button" colored onClick={randomSong}>I am uninspired, get me some random tracks</Button>
              </p>
            </td>
          </tr>
          <TrackListView
            tracks={tracks}
            currentBeat={currentBeat}
            toggleTrackBeat={this.toggleTrackBeat}
            setTrackVolume={this.setTrackVolume}
            updateTrackSample={this.updateTrackSample}
            muteTrack={this.muteTrack}
            randomSong={this.randomSong}
            clearTrack={this.clearTrack}
            deleteTrack={this.deleteTrack} />
          <Controls {...{bpm, updateBPM, playing, start, stop, addTrack, share}} />
        </table>
      </div>
    );
  }
}

class SixVencer extends Component {
  render() {
    const store = this.props.store;
    return (
      <div>
        <SequenceLine />
        <SixVencerKeyboard numButtons={ store.numButtons } />
      </div>
    )
  }
}
const sequencerStore = new SequencerStore();

class App extends Component {
  render() {
    return (
      <SixVencer store={ sequencerStore } />
    )
  }
}

export default App;
