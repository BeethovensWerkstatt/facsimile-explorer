<template>
  <AppHeader/>
  <IiifModal/>
  <LoadXmlModal/>
  <OverviewModal/>
  <SliderOverlay/>
  <TranscriptionAlignmentModal/>
  <template v-if="isReady">
    <splitpanes class="mainSplitter default-theme">
      <pane size="55" min-size="30" @scroll="doScroll">
         <!--<SliderOverlay/>-->
        <OpenSeadragonComponent/>
      </pane>
      <pane>
        <splitpanes horizontal @scroll="doScroll">
          <pane size="70" min-size="30" max-size="90">
            <ExplorerForm/>
          </pane>
          <pane @scroll="doScroll">
            <XmlEditor/>
          </pane>
        </splitpanes>
      </pane>
    </splitpanes>
  </template>
  <template v-if="!isReady">
     <div class="loadingBack">
        <!-- -->
     </div>
  </template>
</template>

<script>
import AppHeader from '@/components/AppHeader.vue'
import OpenSeadragonComponent from '@/components/OpenSeadragonComponent.vue'
import ExplorerForm from '@/components/ExplorerForm.vue'
import XmlEditor from '@/components/XmlEditor.vue'
import IiifModal from '@/components/IiifModal.vue'
import LoadXmlModal from '@/components/LoadXmlModal.vue'
import OverviewModal from '@/components/OverviewModal.vue'
import TranscriptionAlignmentModal from '@/components/TranscriptionAlignmentModal.vue'
import SliderOverlay from '@/components/SliderOverlay.vue'

import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'

export default {
  name: 'App',
  components: {
    AppHeader,
    ExplorerForm,
    OpenSeadragonComponent,
    XmlEditor,
    IiifModal,
    LoadXmlModal,
    OverviewModal,
    TranscriptionAlignmentModal,
    SliderOverlay,
    Splitpanes,
    Pane
  },
  methods: {
    doScroll (e) {
      console.log(e)
    }
  },
  computed: {
    isReady () {
      return this.$store.getters.isReady
    }
  }
}
</script>

<style lang="scss">
@import '@/css/_variables.scss';

#app {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.mainSplitter {
  height: calc(100% - $appHeaderHeight);
  background-color: $mainBackgroundColor;
}

.loadingBack {
   width: 100%;
   height: calc(100% - $appHeaderHeight);
   padding: 3rem;
   background: linear-gradient(to bottom, $mainBackgroundColor, darken($mainBackgroundColor, 30%));
}

</style>
