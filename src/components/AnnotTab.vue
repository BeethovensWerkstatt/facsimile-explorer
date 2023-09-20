<template>
  <div class="appTab annotTranscriptTab">
    <TopMenu>
      <div class="menuItem">
        <button class="btn" @click="toggleSidebar">
          <i class="icon" :class="{'icon-arrow-left': annotTabLeftSidebarVisible, 'icon-arrow-right': !annotTabLeftSidebarVisible}"></i>
        </button>
      </div>
    </TopMenu>
    <div class="flexBox">
      <div class="showSideBar" v-if="!annotTabLeftSidebarVisible" @click="toggleSidebar"></div>
      <Transition name="slide-fade">
        <SideBar class="stageItem sidebarLeft" position="left" tab="annotTab" v-if="annotTabLeftSidebarVisible">
          <SourceSelector/>
          <WritingZoneDirectory purpose="annotTrans"/>
        </SideBar>
      </Transition>
      <MainStage class="mainStage stageItem">
        <template v-if="annotatedTranscriptForCurrentWz !== null">
          <VerovioComponent purpose="proofreading" type="annotTrans" getter="annotatedTranscriptForCurrentWz" pathGetter="currentWzAtPath"/>
        </template>
        <template v-else-if="activeWritingZone === null">
          You need to select a writing zone on the left.
        </template>
        <template v-if="previewImageUri !== null">
          <ImageComponent :uri="previewImageUri"/>
        </template>
      </MainStage>
      <SideBar class="stageItem sidebarRight" position="right" tab="annotTab" v-if="annotTabRightSidebarVisible">
        <div class="desc">
          <h1>Supplied elements</h1>
          <p>In order to change whether an element is supplied or not, just click on it.
            All supplied elements cannot be linked to SVG shapes in a diplomatic transcript,
            and will be displayed in grey.</p>
        </div>
        <div class="filePicker" v-if="showFilePicker">
          <h1>Add Annotated Transcript</h1>
          <p>
            Here, you can upload an MEI-encoded Annotated Transcript.
          </p>
          <input type="file" @change="uploadAnnotTrans" accept=".xml,.mei" />
        </div>
        <WritingZonesAtAnnotTrans/>
      </SideBar>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import MainStage from '@/components/shared/MainStage.vue'
import SideBar from '@/components/shared/SideBar.vue'
import TopMenu from '@/components/shared/TopMenu.vue'

import SourceSelector from '@/components/shared/SourceSelector.vue'
import WritingZoneDirectory from '@/components/WritingZoneDirectory.vue'
import WritingZonesAtAnnotTrans from '@/components/WritingZonesAtAnnotTrans.vue'
import VerovioComponent from '@/components/shared/VerovioComponent.vue'
import ImageComponent from './shared/ImageComponent.vue'

export default {
  name: 'AnnotTab',
  components: {
    MainStage,
    SideBar,
    TopMenu,
    SourceSelector,
    WritingZoneDirectory,
    WritingZonesAtAnnotTrans,
    VerovioComponent,
    ImageComponent
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

    this.verifySvgAvailable()
    this.verifyAnnotTransLoaded()
  },
  beforeUnmount () {
    this.unwatchSvgVerification()
    this.unwatchAnnotTransVerification()
  },
  methods: {
    toggleSidebar () {
      this.$store.dispatch('toggleAnnotTabLeftSidebar')
    },
    verifySvgAvailable () {
      const svgPath = this.$store.getters.currentSvgPath
      const svg = this.$store.getters.svgForCurrentPage

      // console.log('\n\n\nSHOULD HAVE ' + svgPath)
      // console.log('what I have is')
      // console.log(svg)

      if (svgPath !== null && !svg) {
        // console.log('need to do something about this…')
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
    uploadAnnotTrans ({ target: input }) {
      const file = input?.files[0]
      console.log(file)
      const reader = new FileReader()
      // TODO Loader should be a store action, need getters for WZ index (param)
      reader.addEventListener('load', () => {
        const parser = new DOMParser()
        const dom = parser.parseFromString(reader.result, 'application/xml')
        // console.log(dom)
        const path = this.$store.getters.currentWzAtPath
        const baseMessage = 'added Annotated Transript for <docName> p. <pageIndex>'
        this.$store.dispatch('loadDocumentIntoStore', { path, dom })
        this.$store.dispatch('logChange', { path, baseMessage, param: 0, xmlIDs: [], isNewDocument: true })
      })
      reader.readAsText(file)
    }
    /* loadAnnotTrans () {
      this.$store.dispatch('getFile', {
        path: '',
        callback: (file) => {
        }
      })
    } */
  },
  computed: {
    ...mapGetters(['annotTabLeftSidebarVisible', 'annotTabRightSidebarVisible', 'writingZonesOnCurrentPage', 'activeWritingZone', 'availableAnnotatedTranscripts']),
    showFilePicker () {
      const activeWz = this.activeWritingZone
      const availableAnnotTrans = this.availableAnnotatedTranscripts

      // const wz = this.writingZonesOnCurrentPage?.find(wz => wz.id === this.activeWritingZone)
      // console.log(wz)
      return activeWz !== null && availableAnnotTrans.indexOf(activeWz) === -1// wz && !wz.annotTrans
    },
    currentAnnotTabFileName () {
      return this.$store.getters.currentWzAtPath
    },
    annotatedTranscriptForCurrentWz () {
      return this.$store.getters.annotatedTranscriptForCurrentWz
    },
    previewImageUri () {
      return this.$store.getters.currentWzImageUri
    }
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

    .sidebarLeft {
      flex: 0 0 auto;
      order: 1;
      height: calc(100vh - $totalHeaderHeight - $topMenuHeight - 10px);
    }

    .sidebarRight {
      flex: 0 0 auto;
      order: 3;
      height: calc(100vh - $totalHeaderHeight - $topMenuHeight - 10px);
    }

    .mainStage {
      background: linear-gradient( to bottom, $mainBackgroundColor, darken($mainBackgroundColor, 10%));
      flex: 1 1 auto;
      order: 2;
      height: calc(100vh - $totalHeaderHeight - $topMenuHeight - 10px);
      overflow: scroll;
    }
  }
}

.annotTab {
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
  display: inline-block;

  .osdButton {
    display: inline-block;
    margin: 0 .2rem;
  }
}

.mainStage h1 {
  font-size: .8rem;
  font-weight: 700;
  margin: .5rem;
  padding: 0;
}

.sidebarRight {
  font-size: .7rem;

  h1 {
    font-size: .8rem;
    font-weight: 700;
    margin: 0;
    padding: 0;
  }

  .filePicker {
    margin: 0 0 1rem;

    p {
      margin: 0;
    }
  }
}

</style>
