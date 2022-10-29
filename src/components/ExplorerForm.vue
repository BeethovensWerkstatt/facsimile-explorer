<template>
  <div>
    <OpenSeadragonNavigator/>
    <ul class="tab">
      <li class="tab-item" :class="{ active: currentTab === 'sketchGroups'}" @click="switchTab('sketchGroups')">
        <a href="#" class="btn btn-link">Sketch Areas</a>
      </li>
      <li class="tab-item" :class="{ active: currentTab === 'systems'}" @click="switchTab('systems')">
        <a href="#" class="btn btn-link"><i class="icon icon-menu"></i> Systems</a>
      </li>
      <li class="tab-item" :class="{ active: currentTab === 'transcript'}" @click="switchTab('transcript')">
        <a href="#" class="btn btn-link"><span class="transcript">♫</span> Transcription</a>
      </li>
      <li class="tab-item" :class="{ active: currentTab === 'rendering'}" @click="switchTab('rendering')">
        <a href="#" class="btn btn-link">Rendering</a>
      </li>
      <li class="tab-item" :class="{ active: currentTab === 'demo'}" @click="switchTab('demo')">
        <a href="#" class="btn btn-link">Demo</a>
      </li>
    </ul>
    <div class="container">
      <div id="tab_sketchGroups" class="tabContent" :class="{ active: currentTab === 'sketchGroups'}">
         <SketchAreaEditor/>
      </div>
      <div id="tab_systems" class="tabContent" :class="{ active: currentTab === 'systems'}">
         <SystemCartographer/>
      </div>
      <div id="tab_transcript" class="tabContent" :class="{ active: currentTab === 'transcript'}">
         <ShapeCataloguer/>
      </div>
      <div id="tab_rendering" class="tabContent" :class="{ active: currentTab === 'rendering'}">
         settings for Verovio (if any)
      </div>
      <div id="tab_demo" class="tabContent" :class="{ active: currentTab === 'demo'}">
         <!-- -->
      </div>
    </div>
  </div>
</template>

<script>
import OpenSeadragonNavigator from '@/components/OpenSeadragonNavigator.vue'
import SystemCartographer from '@/components/SystemCartographer.vue'
import ShapeCataloguer from '@/components/ShapeCataloguer.vue'
import SketchAreaEditor from '@/components/SketchAreaEditor.vue'

export default {
  name: 'ExplorerForm',
  components: {
    OpenSeadragonNavigator,
    SystemCartographer,
    ShapeCataloguer,
    SketchAreaEditor
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
@import '@/css/_variables.scss';
.tabContent {
   display: none;

   &.active {
      display: block;
   }
}
</style>
