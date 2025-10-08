import { setTimeout } from 'core-js'

const MIDI = require('midicube')

const state = {
  MIDI: null,
  MIDIplaying: false,
  MIDIerror: null,
  MIDIplayer: null,
  MIDItime: 0
}
const getters = {
  midi: (state) => state.MIDI,
  midiPlaying: (state) => state.MIDIplaying,
  midiError: (state) => state.MIDIerror,
  midiPlayer: (state) => state.MIDIplayer,
  midiTime: (state) => state.MIDItime
}
const mutations = {}
const actions = {
  initMidi ({ state }) {
    MIDI.loadPlugin({
      soundfontUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/',
      instrument: 'acoustic_grand_piano',
      onprogress: (state, progress) => {
        console.log(525, state, progress)
      },
      onerror: console.warn,
      onsuccess: () => {
        console.log(525, 'MIDI-Plugin geladen')
        state.MIDI = MIDI
        state.MIDI.setVolume(0, 127)
        state.MIDI.noteOn(0, 60, 127, 0)
        state.MIDI.noteOff(0, 60, 0.75)
      }
    })
    state.MIDIplayer = new MIDI.Player()
    state.MIDIplayer.addListener((data) => {
      state.MIDItime = data.now
      if (data.now >= state.MIDIplayer.endTime - 1) {
        // Ende der Wiedergabe fast erreicht
        console.log(525, 'MIDI-Wiedergabe beenden ...')
        state.MIDIplayer.stop()
        state.MIDIplaying = false
        state.MIDIplayer.currentTime = 0
        setTimeout(() => { state.MIDItime = 0 }, 500) // kurz danach auch die Zeit zurücksetzen
      }
    })
  },
  playMidi ({ state, getters }, midiData) {
    if (getters.midi && getters.midiPlayer) {
      getters.midiPlayer.stop()
      getters.midiPlayer.loadFile(midiData, () => {
        getters.midiPlayer.start()
        state.MIDIplaying = true
      })
    }
  },
  stopMidi ({ state }) {
    if (state.MIDI && state.Midiplayer) {
      state.Midiplayer.stop()
      state.MIDIplaying = false
    }
  }
}

const module = {
  state, getters, mutations, actions
}

export default module
