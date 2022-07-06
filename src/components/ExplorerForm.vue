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
         <SystemCartographer/>
      </div>
      <div id="tab_transcript" class="tabContent" :class="{ active: currentTab === 'transcript'}">
         <div class="verticalTabContent"></div>
         <div class="verticalTab active"><span class="colorProbe color1"></span>Notes</div>
         <div class="verticalTab"><span class="colorProbe color2"></span>Rests</div>
         <div class="verticalTab"><span class="colorProbe color3"></span>Barlines</div>
         <div class="verticalTab"><span class="colorProbe color4"></span>Beams</div>
         <div class="verticalTab"><span class="colorProbe color5"></span>Dynamics</div>
         <div class="verticalTab"><span class="colorProbe color6"></span>Articulation</div>
         <div class="verticalTab"><span class="colorProbe color7"></span>Text</div>
         <div class="verticalTab"><span class="colorProbe color8"></span>Other</div>
      </div>
      <div id="tab_rendering" class="tabContent" :class="{ active: currentTab === 'rendering'}">
         settings for Verovio (if any)
      </div>
    </div>
  </div>
</template>

<script>
import OpenSeadragonNavigator from '@/components/OpenSeadragonNavigator.vue'
import SystemCartographer from '@/components/SystemCartographer.vue'

export default {
  name: 'ExplorerForm',
  components: {
    OpenSeadragonNavigator,
    SystemCartographer
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

      .verticalTabContent {
         float: right;
         width: 80%;
         height: 500px;
         border-left: $lightBorder;
         background-color: #ffffff;
      }

      .verticalTab {
         width: 20%;
         background-color: #e5e5e5;
         padding: .1rem .3rem;
         border-bottom: $lightBorder;

         .colorProbe {
            margin: .1rem .3rem .1rem .1rem;
            width: 10px;
            height: 10px;
            border: $lightBorder;
            display: inline-block;
            position: relative;
            top: 2px;
            border-radius: 3px;

            &.color1 {
               background-color: rgb(251, 59, 46);
            }
            &.color2 {
               background-color: rgb(251, 182, 46);
            }
            &.color3 {
               background-color: rgb(204, 251, 46);
            }
            &.color4 {
               background-color: rgb(46, 251, 147);
            }
            &.color5 {
               background-color: rgb(46, 165, 251);
            }
            &.color6 {
               background-color: rgb(46, 98, 251);
            }
            &.color7 {
               background-color: rgb(198, 46, 251);
            }
            &.color8 {
               background-color: rgb(251, 46, 163);
            }
         }

         &.active {
            background-color: #ffffff;
            width: 20%;
         }
      }
   }
</style>
