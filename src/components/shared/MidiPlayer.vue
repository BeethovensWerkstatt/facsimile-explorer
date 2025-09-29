
<template>
  <div>
    <button @click="playMidi" :disabled="!MIDI || isPlaying">Abspielen</button>
    <span v-if="isPlaying">Wiedergabe läuft...</span>
    <span v-if="error" style="color:red">{{ error }}</span>
  </div>
</template>

<script>
import * as MIDI from 'midicube'

export default {
  name: 'MidiPlayer',
  props: {
    midiBase64: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      MIDI: null,
      isPlaying: false,
      error: null,
      player: null
    }
  },
  created () {
    MIDI.loadPlugin({
      soundfontUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/',
      instrument: 'acoustic_grand_piano',
      onprogress: (state, progress) => {
        console.log(525, state, progress)
      },
      onsuccess: () => {
        this.MIDI = MIDI
      }
    })
  },
  computed: {
    midiurl () {
      return 'data:audio/midi;base64,' + this.midiBase64
    }
  },
  methods: {
    unlockAudio () {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume()
      }
    },
    async playMidi () {
      // Initialisiere eigenen AudioContext (unabhängig von MIDI.js)
      this.unlockAudio()
      // Versuche, WebAudio zu initialisieren (stummer Ton)
      if (this.MIDI && typeof this.MIDI.noteOn === 'function') {
        try {
          this.MIDI.setVolume(0, 0)
          this.MIDI.noteOn(0, 60, 0, 0)
          setTimeout(() => this.MIDI.noteOff(0, 60, 0.01), 20)
        } catch (e) {
          console.warn(525, 'WebAudio-Init fehlgeschlagen:', e)
        }
      }
      this.error = null
      this.isPlaying = false
      this.MIDI.setVolume(0, 127)
      try {
        // base64 zu ArrayBuffer
        if (this.player) {
          try {
            this.player.stop()
          } catch (e) {
            console.warn('Fehler beim Stoppen des Players:', e)
          }
        } else {
          this.player = new MIDI.Player({
            soundfontUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/',
            instrument: 'acoustic_grand_piano',
            onprogress: (state, progress) => {
              console.log(525, state, progress)
            },
            onend: () => {
              console.log(525, 'MIDI-Wiedergabe beendet')
              this.isPlaying = false
              this.player.stop()
            }
          })
        }
        this.player.addListener((data) => {
          console.log(525, 'MIDI Event:', data)
        })
        console.log(525, 'Lade MIDI-Datei von URL:', this.midiurl)
        this.player.loadFile(this.midiurl, () => {
          console.log(525, 'Starte MIDI-Wiedergabe ...')
          this.MIDI.setVolume(127)
          this.MIDI.noteOn(0, 60, 127, 0) // Beispiel: spiele Mittleres C
          this.player.start(() => {
            console.log(525, 'MIDI-Wiedergabe gestartet')
            this.isPlaying = true
          })
        }, (progress) => {
          console.log(525, 'Spiele MIDI-Datei ...', progress)
        }, (err) => {
          console.error('Fehler beim Laden der MIDI-Datei:', err)
          this.error = 'Fehler beim Laden der MIDI-Datei.'
          this.isPlaying = false
        })
      } catch (e) {
        console.error(525, e)
        this.error = 'Fehler beim Abspielen der MIDI-Datei.'
        this.isPlaying = false
      }
    }
  }
}
</script>

<style scoped>
button[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
