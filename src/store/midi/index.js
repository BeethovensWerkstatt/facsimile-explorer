import * as MIDI from 'midicube'

const state = {
  MIDI: null,
  MIDIplaying: false,
  MIDIerror: null,
  MIDIplayer: null
}
const getters = {
  midi: (state) => state.MIDI,
  midiPlaying: (state) => state.MIDIplaying,
  midiError: (state) => state.MIDIerror,
  midiPlayer: (state) => state.Midiplayer
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
        state.MIDI.noteOn(0, 60, 0)
      }
    })
    state.Midiplayer = new MIDI.Player()
    state.Midiplayer.addListener((data) => {
      if (data.now >= getters.midiPlayer.endTime - 0.1) {
        // Ende der Wiedergabe fast erreicht
        state.MIDIplayer.stop()
        state.MIDIplaying = false
        state.Midiplayer.currentTime = 0
        console.log(525, 'MIDI-Wiedergabe beendet')
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
