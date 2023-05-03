<template>
  <AppHeader/>

  <!-- TODO: Check modals -->

  <IiifModal/>
  <LoadXmlModal/>
  <OverviewModal/>
  <CommitModal/>
  <OpenFileModal/>
  <AssignSVGsModal/>

  <HomeTab v-if="currentTab === 'home'"/>
  <PagesTab v-if="currentTab === 'pages'"/>
  <ZonesTab v-if="currentTab === 'zones'"/>
  <AnnotTab v-if="currentTab === 'annot'"/>
  <DiploTab v-if="currentTab === 'diplo'"/>

  <template v-if="isReady && !isReady">
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
  <template v-if="!isReady && isReady">
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
import OpenFileModal from '@/components/OpenFileModal.vue'
import AssignSVGsModal from '@/components/AssignSVGsModal.vue'

import HomeTab from '@/components/HomeTab.vue'
import PagesTab from '@/components/PagesTab.vue'
import ZonesTab from '@/components/ZonesTab.vue'
import AnnotTab from '@/components/AnnotTab.vue'
import DiploTab from '@/components/DiploTab.vue'

import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'

export default {
  name: 'ModusView',
  components: {
    AppHeader,
    ExplorerForm,
    OpenSeadragonComponent,
    XmlEditor,
    IiifModal,
    LoadXmlModal,
    OverviewModal,
    CommitModal,
    OpenFileModal,
    AssignSVGsModal,
    Splitpanes,
    Pane,
    HomeTab,
    PagesTab,
    ZonesTab,
    AnnotTab,
    DiploTab
  },
  mounted () {
    this.reload()
  },
  watch: {
    $route () {
      this.reload()
    },
    currentPath () {
      this.reload()
    },
    docPath () {
      this.reload()
    }
  },
  methods: {
    doScroll (e) {
      console.log(e)
    },
    reload () {
      const path = this.$store.getters.getPathByName(this.$route.params.source)
      const modus = this.$route.params.modus
      const page = this.$route.query.page
      console.log(path, modus, page)
      if (path && this.$store.getters.filePath !== path) {
        this.$store.dispatch('loadContent', { path })
      }
      if (this.$store.getters.modus !== modus) {
        this.$store.dispatch('openTab', modus)
      }
      if (page && this.$store.getters.currentPageOneBased !== page) {
        console.log('setCurrentPage', +page - 1)
        this.$store.dispatch('setCurrentPage', +page - 1)
      }
    }
  },
  computed: {
    currentPath () {
      return this.$route.fullPath
    },
    docPath () {
      return this.$store.getters.getPathByName(this.$route.params.source)
    },
    isReady () {
      return this.$store.getters.isReady
    },
    currentTab () {
      return this.$route.params.modus // this.$store.getters.currentTab
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
