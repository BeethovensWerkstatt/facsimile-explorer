<template>
  <div>
    <OpenSeadragonNavigator/>
    <ul class="tab">
      <li class="tab-item" :class="{ active: currentTab === 'systems'}" @click="switchTab('systems')">
        <a href="#" class="btn btn-link"><i class="icon icon-menu"></i> Systems</a>
      </li>
      <li class="tab-item" :class="{ active: currentTab === 'transcript'}" @click="switchTab('transcript')">
        <a href="#" class="btn btn-link"><span class="transcript">♫</span> Transcription</a>
      </li>
      <li class="tab-item" :class="{ active: currentTab === 'rendering'}" @click="switchTab('rendering')">
        <a href="#" class="btn btn-link">Rendering</a>
      </li>
    </ul>
    <div class="container">
      <div id="tab_systems" class="tabContent" :class="{ active: currentTab === 'systems'}">
         tool for capturing system rectangles
      </div>
      <div id="tab_transcript" class="tabContent" :class="{ active: currentTab === 'transcript'}">
         Doing the transcriptions from here
      </div>
      <div id="tab_rendering" class="tabContent" :class="{ active: currentTab === 'rendering'}">
         settings for Verovio (if any)
      </div>
    </div>
  </div>
</template>

<script>
import OpenSeadragonNavigator from '@/components/OpenSeadragonNavigator.vue'

export default {
  name: 'ExplorerForm',
  components: {
    OpenSeadragonNavigator
  },
  methods: {
    switchTab (val) {
      this.$store.dispatch('setExplorerTab', val)
    }
  },
  computed: {
    currentTab () {
      return this.$store.getters.explorerTab
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
   .tabContent {
      display: none;

      &.active {
         display: block;
      }
   }
</style>
