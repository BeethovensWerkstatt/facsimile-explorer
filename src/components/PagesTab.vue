<template>
  <div class="appTab pagesTab">
    <TopMenu>
      <div class="menuItem">
        <button class="btn" @click="toggleSidebar">
          <i class="icon" :class="{'icon-arrow-left': pageTabSidebarVisible, 'icon-arrow-right': !pageTabSidebarVisible}"></i>
        </button>
      </div>
      <div class="menuItem fileInput" title="TODO: open a filepicker and load svg">
        <div class="customBtn" @click="addSVG"><i class="icon icon-upload"></i> Import SVG</div>
      </div>
      <div class="menuItem mediaFragment" title="">
        <div class="customBtn" @click="setPageMargins"><i class="icon icon-bookmark"></i> Set Page Margins</div>
      </div>
      <div class="menuItem systems">
        <div class="customBtn" title="Add system" @click="addSystem"><i class="icon icon-edit"></i> Add System</div>
        <div class="customBtn" title="Delete system" @click="removeSystem"><i class="icon icon-delete"></i> Remove System</div>
      </div>
      <div class="osdButtons">
        <div class="osdButton" id="zoomOut"><i class="icon icon-minus"></i></div>
        <div class="osdButton" id="zoomIn"><i class="icon icon-plus"></i></div>
      </div>
    </TopMenu>
    <div class="flexBox">
      <div class="showSideBar" v-if="!pageTabSidebarVisible" @click="toggleSidebar"></div>
      <Transition name="slide-fade">
        <SideBar class="stageItem sidebar" position="left" tab="pagesTab" v-if="pageTabSidebarVisible">
          <SourceSelector/>
          <PageList tab="pagesTab"/>
        </SideBar>
      </Transition>
      <MainStage class="mainStage stageItem">
        <OpenSeadragonComponent/>
      </MainStage>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import MainStage from '@/components/shared/MainStage.vue'
import SideBar from '@/components/shared/SideBar.vue'
import TopMenu from '@/components/shared/TopMenu.vue'
import PageList from '@/components/shared/PageList.vue'
import SourceSelector from '@/components/shared/SourceSelector.vue'

import OpenSeadragonComponent from '@/components/OpenSeadragonComponent.vue'

export default {
  name: 'PagesTab',
  components: {
    MainStage,
    SideBar,
    TopMenu,
    PageList,
    SourceSelector,
    OpenSeadragonComponent
  },
  methods: {
    toggleSidebar () {
      this.$store.dispatch('togglePageTabSidebar')
    },
    addSystem () {
      alert('Hiermit in den Modus schalten, bei dem ein neues System markiert werden kann, indem ein Annotorious-Rechteck angelegt werden kann.')
    },
    removeSystem () {
      alert('Hiermit wird das aktuell ausgewählte System gelöscht. Systeme werden einfach per Klick ausgewählt, und per Doppelklick wird wieder das Annotorious-Rect geladen, um sie anzupassen')
    },
    setPageMargins () {
      alert('In diesem Modus wird ein Annotorious-Rechteck aufgezogen, um ein #xywh=100,120,3000,2000 - Media-Fragment zu erzeugen, mit welchem die tatsächliche Seitengröße innerhalb der Bilddatei festgelegt wird (für die dann die Angaben in mm gelten).')
    },
    addSVG () {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.svg'
      input.onchange = _this => {
        const [file] = Array.from(input.files)
        if (file) {
          const reader = new FileReader()
          reader.addEventListener('load', () => {
            // console.log('add SVG ...', reader.result)
            const page = this.page(this.currentPageZeroBased)
            this.$store.dispatch('addSvgFileForSurface', {
              svgText: reader.result,
              surfaceId: page.id
            })
          })
          reader.readAsText(file)
        }
      }
      input.click()
    },
    importSVG () {
      // alert('Öffnet einen Modal, in dem man eine SVG-Datei für die aktuelle Seite hochladen kann. Evtl. disabled, wenn es für die aktuelle Seite schon ein SVG gibt – dann muss händischersetzt werden, um unbeabsichtigtes Überschreiben zu verhindern.')
      this.$store.dispatch('setPreviewPage', this.currentPageZeroBased)
      this.$store.dispatch('setModal', 'assignSVGs')
    }
  },
  computed: {
    ...mapGetters(['pageTabSidebarVisible', 'page', 'currentPageZeroBased'])
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
      // this color is to increase visibility of the image borders
      background: repeating-linear-gradient( -30deg, $mainBackgroundColor, $mainBackgroundColor 10px, darken($mainBackgroundColor, 10%) 10px, darken($mainBackgroundColor, 10%) 20px );
      flex: 1 1 auto;
      order: 2;
      height: calc(100vh - $totalHeaderHeight - $topMenuHeight - 10px);
    }
  }
}

.pagesTab {
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

</style>
