<template>
  <div class="appTab annotationsTab">
    <TopMenu>
      <div class="menuItem">
        <button class="btn" @click="toggleSidebar">
          <i class="icon" :class="{'icon-arrow-left': diploTabSidebarVisible, 'icon-arrow-right': !diploTabSidebarVisible}"></i>
        </button>
      </div>
      <div class="menuItem" v-if="diploTabSidebarVisible">
        <button class="btn" @click="$refs.writingZoneDirectory?.scrollToCurrentPage()">
          <i class="icon icon-arrow-down"></i>
        </button>
      </div>
      <div class="osdButtons">
        <div class="osdButton" v-if="currentWritingZoneObject" title="zoom to wrting zone"><button class="zoomWZ" @click="zoomWZ">[<i>wz</i>]</button></div>
        <div class="osdButton" id="zoomOut" title="zoom out"><i class="icon icon-minus"></i></div>
        <div class="osdButton" id="zoomIn" title="zoom in"><i class="icon icon-plus"></i></div>
      </div>
    </TopMenu>
    <div class="flexBox">
      <div class="showSideBar" v-if="!diploTabSidebarVisible" @click="toggleSidebar"></div>
      <Transition name="slide-fade">
        <SideBar class="stageItem sidebarLeft" position="left" tab="diploTab" v-if="diploTabSidebarVisible">
          <SourceSelector/>
          <WritingZoneDirectory purpose="annotations" ref="writingZoneDirectory"/>
        </SideBar>
      </Transition>
      <MainStage class="mainStage stageItem">
        <div class="mainBox">
          <FacsimileComponent type="facsimile"/>
        </div>
        <div class="mainBox">
          <div class="vscale">
            <input type="range" v-model="annotScale" min="0.2" max="5" step=".01" />
          </div>
          <VerovioComponent purpose="transcribing" type="annotTrans" getter="annotatedTranscriptForCurrentWzPrepared" pathGetter="resolvedAtSymlinkForCurrentWz" :scale="annotScale"/>
        </div>
        <div class="mainBox">
          <FacsimileComponent type="diploTrans" ref="facsShapes"/>
        </div>
        <div class="mainBox editorBox">
          <AnnotationEditor/>
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
import SourceSelector from '@/components/shared/SourceSelector.vue'
import WritingZoneDirectory from '@/components/WritingZoneDirectory.vue'

import FacsimileComponent from '@/components/FacsimileComponent.vue'
import VerovioComponent from '@/components/shared/VerovioComponent.vue'
import AnnotationEditor from '@/components/AnnotationEditor.vue'

import transcriptLoading from '@/mixins/transcriptLoading.js'

export default {
  name: 'AnnotationsTab',
  mixins: [transcriptLoading],
  components: {
    MainStage,
    SideBar,
    TopMenu,
    SourceSelector,
    WritingZoneDirectory,
    FacsimileComponent,
    VerovioComponent,
    AnnotationEditor
  },
  data: () => ({ annotScale: '1' }),
  methods: {
    toggleSidebar () {
      this.$store.dispatch('toggleDiploTabSidebar')
    },
    zoomWZ () {
      const currentWz = this.$store.getters.currentWritingZoneObject
      if (currentWz) {
        const [x, y, w, h] = currentWz.xywh.split(',')
        const bounds = this.$refs.facsShapes.viewer.viewport.imageToViewportRectangle(+x, +y, +w, +h)
        this.$refs.facsShapes.viewer.viewport.fitBounds(bounds)
      }
    }
  },
  computed: {
    ...mapGetters(['diploTabSidebarVisible', 'currentWritingZoneObject'])
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/css/_variables.scss';

.appTab {
  background: linear-gradient(to bottom, lighten($mainBackgroundColor, 10%), darken($mainBackgroundColor, 2%));
  height: calc(100vh - $totalHeaderHeight);
  position: relative;

  .flexBox {
    display: flex;
    flex-flow: row nowrap;
    align-items: stretch;

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
      position: relative;
      background: linear-gradient( to bottom, $darkBackgroundColor, darken($darkBackgroundColor, 10%));
      flex: 1 1 auto;
      order: 2;
      height: calc(100vh - $totalHeaderHeight - $topMenuHeight - 10px);

      .vscale {
        position: relative;
        display: inline-block;
        height: 100%;
        input[type="range"] {
          writing-mode: vertical-lr;
          direction: rtl;
          appearance: slider-vertical;
          width: 16px;
          height: 100%;
        }
      }
      .verovioComponent {
        width: calc(100% - 16px);
        display: inline-block;
      }
    }
  }
}

.showSideBar {
  height: 100%;
  width: 10px;
  z-index: 10;
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
}

.osdButtons {
  float: right;
  display: inline-block;

  .osdButton {
    display: inline-block;
    margin: 0 .2rem;
  }
  .zoomWZ {
    font-size: 80%;
  }
}

.mainBox {
  padding: .5rem;
}
.mainBox:nth-child(1) {
  height: 28%;
}
.mainBox:nth-child(2) {
  height: 17%;
}
.mainBox:nth-child(3) {
  height: 28%;
}
.mainBox.editorBox {
  height: 27%;
  padding: 0;
}

</style>
