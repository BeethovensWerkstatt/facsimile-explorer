<template>
  <div class="appTab annotTranscriptTab">
    <p>
      In diesem Reiter kann man annotierte Transkriptionen hochladen und die zugehörigen Schreibzonen auswählen.
      Dazu Auswahl nach Seite und dann nach Schreibzone. Evtl. mit Faksimile-Vorschau?! Es sollen Metadaten
      entstehen, was wie zusammengehört, und die annotTrans soll an definierter Stelle gespeichert werden.
    </p>
  </div>
</template>

<script>
// import SystemListingEntry from '@/components/SystemListingEntry.vue'

export default {
  name: 'AnnotTab',
  components: {

  },
  methods: {
    loadAnnotTrans () {
      this.$store.dispatch('getFile', {
        path: '',
        callback: (file) => {
        }
      })
    }
  },
  computed: {

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/css/_variables.scss';

.appTab {
  background: linear-gradient(to bottom, lighten($mainBackgroundColor, 10%), darken($mainBackgroundColor, 2%));
  height: calc(100vh - $totalHeaderHeight);
}

</style>
