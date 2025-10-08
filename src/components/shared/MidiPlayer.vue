
<template>
  <div>
    <button @click="playMidi" :disabled="!$store.getters.midi || $store.getters.midiPlaying">Abspielen</button>
    <span>{{ ($store.getters.midiTime / 1000).toFixed(1) }}s / {{ (($store.getters.midiPlayer?.endTime || 0) / 1000).toFixed(1) }}s</span>
    <span v-if="isPlaying">Wiedergabe läuft...</span>
    <span v-if="error" style="color:red">{{ error }}</span>
  </div>
</template>

<script>
export default {
  name: 'MidiPlayer',
  props: {
    midiBase64: {
      type: String,
      required: true
    }
  },
  created () {
    if (!this.$store.getters.midiPlayer) {
      this.$store.dispatch('initMidi')
    }
  },
  watch: {
    midiBase64 (newVal) {
      this.$store.dispatch('stopMidi')
    }
  },
  computed: {
    midiurl () {
      return 'data:audio/midi;base64,' + this.midiBase64
    },
    isPlaying () {
      return this.$store.getters.midiPlaying
    },
    error () {
      return this.$store.getters.midiError
    }
  },
  methods: {
    async playMidi () {
      this.$store.getters.midi.noteOn(0, 60, 127, 0)
      this.$store.getters.midi.noteOff(0, 60, 0.75)
      this.$store.dispatch('playMidi', this.midiurl)
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
