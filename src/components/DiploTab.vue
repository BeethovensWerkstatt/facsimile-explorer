<template>
  <div class="appTab diploTab">
    <TopMenu>
      <div class="menuItem">
        <button class="btn" @click="toggleSidebar">
          <i class="icon" :class="{'icon-arrow-left': diploTabSidebarVisible, 'icon-arrow-right': !diploTabSidebarVisible}"></i>
        </button>
      </div>
      <div class="menuItem" v-if="showInitializeButton">
        <button class="btn" @click="initializeDiploTrans">Initialize Diplomatic Transcription</button>
      </div>
      <div class="menuItem">ADT: {{ $store.getters.activeDiploTransElementId }}</div>
      <div class="osdButtons">
        <div class="osdButton" id="zoomOut"><i class="icon icon-minus"></i></div>
        <div class="osdButton" id="zoomIn"><i class="icon icon-plus"></i></div>
      </div>
    </TopMenu>
    <div class="flexBox">
      <div class="showSideBar" v-if="!diploTabSidebarVisible" @click="toggleSidebar"></div>
      <Transition name="slide-fade">
        <SideBar class="stageItem sidebarLeft" position="left" tab="diploTab" v-if="diploTabSidebarVisible">
          <SourceSelector/>
          <WritingZoneDirectory purpose="diploTrans"/>
          {{ diplomaticTranscriptsOnCurrentPage }}
        </SideBar>
      </Transition>
      <MainStage class="mainStage stageItem">
        <div class="mainBox">
          <FacsimileComponent type="facsimile"/>
        </div>
        <div class="mainBox">
          <FacsimileComponent type="diploTrans"/>
          <!--<VerovioComponent purpose="transcribing" type="diploTrans" getter="diplomaticTranscriptForCurrentWz" pathGetter="currentWzDtPath"/>-->
          <!--<OpenSeadragonComponent/>-->
        </div>
        <div class="mainBox">
          <DiploTabMenu :filePath="editorSettings.filePath" :id="editorSettings.id"/>
          <XmlEditor :filePath="editorSettings.filePath" :id="editorSettings.id"/>
        </div>
        <div class="mainBox">
          <VerovioComponent purpose="transcribing" type="annotTrans" getter="annotatedTranscriptForCurrentWz" pathGetter="currentWzAtPath"/>
        </div>
      </MainStage>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import MainStage from '@/components/shared/MainStage.vue'
import SideBar from '@/components/shared/SideBar.vue'
import TopMenu from '@/components/shared/TopMenu.vue'
// import PageList from '@/components/shared/PageList.vue'
import SourceSelector from '@/components/shared/SourceSelector.vue'
import WritingZoneDirectory from '@/components/WritingZoneDirectory.vue'

import FacsimileComponent from '@/components/FacsimileComponent.vue'
import VerovioComponent from '@/components/shared/VerovioComponent.vue'
import XmlEditor from '@/components/XmlEditor.vue'

import DiploTabMenu from '@/components/DiploTabMenu.vue'

import { useDiploTrans } from '@/store/gui/diplotrans'

export default {
  name: 'DiploTab',
  components: {
    MainStage,
    SideBar,
    TopMenu,
    // PageList,
    SourceSelector,
    WritingZoneDirectory,
    FacsimileComponent,
    VerovioComponent,
    XmlEditor,
    DiploTabMenu
  },
  data: () => ({
    diploTransStore: useDiploTrans()
  }),
  methods: {
    toggleSidebar () {
      this.$store.dispatch('toggleDiploTabSidebar')
    },
    verifySvgAvailable () {
      const svgPath = this.$store.getters.currentSvgPath
      const svg = this.$store.getters.svgForCurrentPage
      if (svgPath !== null && !svg) {
        this.$store.dispatch('loadSvgFile', {
          path: svgPath
        })
      }
    },
    verifyAnnotTransLoaded () {
      const atPath = this.$store.getters.currentWzAtPath
      const at = this.$store.getters.annotatedTranscriptForCurrentWz
      if (this.$store.getters.availableAnnotatedTranscripts.indexOf(atPath) !== -1 && !at) {
        this.$store.dispatch('loadXmlFile', {
          path: atPath
        })
      }
    },
    async verifyDiploTransLoaded () {
      const dtOnPage = await this.$store.getters.diplomaticTranscriptsOnCurrentPage
      const availableDiplomaticTranscripts = this.$store.getters.availableDiplomaticTranscripts

      // console.warn('dtOnPage', dtOnPage)
      // console.warn('this.$store.getters.availableDiplomaticTranscripts', availableDiplomaticTranscripts)

      for (const dt of dtOnPage) {
        const path = dt.wzDetails.diploTrans
        if (availableDiplomaticTranscripts.indexOf(path) !== -1) {
          // console.log(' … going for ' + path)
          const callback = async () => {
            // const arr = await this.$store.getters.diplomaticTranscriptsOnCurrentPage
            // console.warn('\n\n\nreceived callback from verifyDiploTransLoaded() for ' + path, arr)
          }
          this.$store.dispatch('loadXmlFile', { path, callback })
        }
      }
      /*
        if (this.$store.getters.availableDiplomaticTranscripts.indexOf(dtPath) !== -1 && !dt) {
          console.log(' … going for ' + dtPath)
          this.$store.dispatch('loadXmlFile', {
            path: dtPath
          })
        }
      */
    },
    initializeDiploTrans () {
      this.$store.dispatch('initializeDiploTrans')
    },
    autoTranscribe (newShapes, oldShapes, newAnnotated, oldAnnotated) {
      if (newShapes.length === 0 || !newAnnotated) {
        return false
      }

      const currentWz = this.$store.getters.currentWritingZoneObject
      if (!currentWz) {
        return false
      }

      const atDoc = this.$store.getters.documentByPath(currentWz.annotTrans)
      const dtDoc = this.$store.getters.documentByPath(currentWz.diploTrans)

      if (!atDoc || !dtDoc) {
        return false
      }

      console.log('DiploTab: autoTranscribe()', newShapes, oldShapes, newAnnotated, oldAnnotated)

      if (newAnnotated === oldAnnotated && newShapes.length > oldShapes.length && oldShapes.length > 0) {
        // add shape to existing diploTrans
        console.log('TODO: add shape to existing diploTrans')
        this.$store.dispatch('diploTranscribe_setShapes', { annotElem: newAnnotated, shapes: newShapes })
      } else {
        this.$store.dispatch('diploTranscribe')
      }
    }
  },
  computed: {
    ...mapGetters(['diploTabSidebarVisible', 'diploTransActivationsInShapes', 'diploTransActivationsInAnnotTrans', 'diplomaticTranscriptsOnCurrentPage', 'activeDiploTransElementId']),
    showInitializeButton () {
      const currentWz = this.$store.getters.currentWritingZoneObject
      if (!currentWz) {
        return false
      }

      const annotTransLink = currentWz.annotTrans
      const diploTransLink = currentWz.diploTrans

      const annotTransAvailable = this.$store.getters.availableAnnotatedTranscripts.indexOf(annotTransLink) !== -1
      const diploTransAvailable = this.$store.getters.availableDiplomaticTranscripts.indexOf(diploTransLink) !== -1
      return annotTransAvailable && !diploTransAvailable
    },
    editorSettings () {
      return {
        filePath: this.$store.getters.currentWritingZoneObject?.diploTrans,
        id: this.$store.getters.activeDiploTransElementId
      }
    }
  },
  created () {
    this.unwatchSvgVerification = this.$store.watch((state, getters) => getters.currentSvgPath,
      (newPath, oldPath) => {
        this.verifySvgAvailable()
      })

    this.unwatchAnnotTransVerification = this.$store.watch((state, getters) => getters.currentWzAtPath,
      (newPath, oldPath) => {
        this.verifyAnnotTransLoaded()
      })

    this.unwatchDiploTransVerification = this.$store.watch((state, getters) => getters.diplomaticTranscriptsOnCurrentPage,
      (newArr, oldArr) => {
        this.verifyDiploTransLoaded()
      })

    this.unwatchDiploActivations = this.$store.watch((state, getters) => [getters.diploTransActivationsInShapes, getters.diploTransActivationsInAnnotTrans],
      ([newShapes, newAnnotated], [oldShapes, oldAnnotated]) => {
        console.log('selected shapes:', newShapes.target)
        this.autoTranscribe(newShapes, oldShapes, newAnnotated, oldAnnotated)
      })

    this.verifySvgAvailable()
    this.verifyAnnotTransLoaded()
    this.verifyDiploTransLoaded()
  },
  beforeUnmount () {
    this.unwatchSvgVerification()
    this.unwatchAnnotTransVerification()
    this.unwatchDiploTransVerification()
    this.unwatchDiploActivations()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/css/_variables.scss';

.appTab {
  background: linear-gradient(to bottom, lighten($mainBackgroundColor, 10%), darken($mainBackgroundColor, 2%));
  height: calc(100vh - $totalHeaderHeight);

  .flexBox {
    display: flex;
    flex-flow: row nowrap;
    align-items: stretch;
    // gap: 10px;

    .showSideBar {
      flex: 0 0 10px;
      order: 1;
      height: calc(100vh - $totalHeaderHeight - $topMenuHeight - 10px);
    }

    .sidebar {
      flex: 0 0 auto;
      order: 1;
      height: calc(100vh - $totalHeaderHeight - $topMenuHeight - 10px);
    }

    .mainStage {
      background: linear-gradient( to bottom, $darkBackgroundColor, darken($darkBackgroundColor, 10%));
      flex: 1 1 auto;
      order: 2;
      height: calc(100vh - $totalHeaderHeight - $topMenuHeight - 10px);
    }
  }
}

.diploTab {
  position: relative;
}

.showSideBar {
  height: 100%;
  width: 10px;
  z-index: 10;
  // display: block;
  &:hover {
    cursor: e-resize;
    background: linear-gradient(to right, darken($mainBackgroundColor, 10%), $mainBackgroundColor);
  }
}

.slide-fade-enter-active {
  transition: all 0.4s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.4s ease-in;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(-400px);
  // opacity: 0;
}

i.showSidebar {
  cursor: e-resize;
}

.menuItem {
  display: inline-block;
  margin: 0 .5rem 0 0;

  .btn {
    height: 1rem;
    padding: 0 0.2rem;
    margin: 0 0.2rem 0 0;
    border-color: $darkFontColor;
    font-size: .6rem;
    line-height: 1rem;
    * {
      color: $darkFontColor;
    }
  }

  .customBtn {
    display: inline-block;
    margin: 0 .5rem 0 0;
    font-weight: 100;
    cursor: pointer;
    i {
      position: relative;
      top: -2px;
      margin-right: .2rem;
    }
  }
}

.osdButtons {
  float: right;
  // display: inline-block;

  .osdButton {
    display: inline-block;
    margin: 0 .2rem;
  }
}

.mainBox {
  height: 25%;
  padding: .5rem;
}

</style>
