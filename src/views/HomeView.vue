<template>
  <AppHeader/>
  <IiifModal/>
  <LoadXmlModal/>
  <OverviewModal/>
  <CommitModal/>
  <template v-if="isReady">
    <splitpanes class="mainSplitter default-theme">
      <pane size="55" min-size="30" @scroll="doScroll">
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
        * Hier oder andernorts: Erzeugen MEI-Datei aus IIIF Manifest <br/>
        * Importieren des SVG für aktuelle Seite <br/>
        * "Formular" für einzelne Zeichen <br/>
        * annotorious-Plugin, um Rechtecke z.B. für Systeme zu erzeugen <br/>
        * Anbindung XML-Editor <br/>
        * <em>entweder</em>: Anbindung Git, <em>oder</em>: Up- und Download<br/>
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
import CommitModal from '@/components/CommitModal.vue'

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
    CommitModal,
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
