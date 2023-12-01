<template>
  <div class="appTab pagesTab">
    <TopMenu>
      <div class="menuItem">
        <button class="btn" @click="toggleSidebar">
          <i class="icon" :class="{'icon-arrow-left': pageTabSidebarVisible, 'icon-arrow-right': !pageTabSidebarVisible}"></i>
        </button>
      </div>
      <div class="osdButtons">
        <div class="osdButton" id="zoomOut"><i class="icon icon-minus"></i></div>
        <div class="osdButton" id="zoomIn"><i class="icon icon-plus"></i></div>
        <button class="btn" @click="toggleRightSidebar">
          <i class="icon" :class="{'icon-arrow-right': pageTabRightSidebarVisible, 'icon-arrow-left': !pageTabRightSidebarVisible}"></i>
        </button>
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
        <!--<OpenSeadragonComponent :svg="false" :annotorious="true" :pageBorders="true" :rastrums="true" :page="currentPage"/>-->
        <div><FacsimileComponent type="facsimile" v-if="tileSource !== null"/></div>
      </MainStage>
      <SideBar class="stageItem sidebarRight" position="right" tab="pagesTab" v-if="pageTabRightSidebarVisible">
        <div class="sidebarBox">
          <h1>SVG Shapes</h1>
          <template v-if="svgFile === null">
            <div class="customBtn" @click="addSVG"><i class="icon icon-upload"></i> Import SVG</div>
          </template>
          <template v-else>
            <div class="denseFont">{{svgFile}}</div>
          </template>
        </div>
        <div class="sidebarBox">
          <h1>Page Dimensions <small>[values in mm]</small></h1>
          <div class="dimensionBox pageDimensions" v-if="tileSource !== null">
            <SliderInput label="Width" getterName="currentPageWidthMm" setterName="setPageWidth" :min="100" :max="500" :step="0.5"/>
            <SliderInput label="Height" getterName="currentPageHeightMm" setterName="setPageHeight" :min="100" :max="500" :step="0.5"/>
          </div>
        </div>
        <div class="sidebarBox">
          <h1>Media Fragment <small>[values in px]</small></h1>
          <div class="dimensionBox fragmentDimensions" v-if="tileSource !== null">
            <SliderInput label="X" getterName="currentPageFragmentX" setterName="setPageFragX" :min="0" :max="currentPageDimensions.width" :step="1"/>
            <SliderInput label="Y" getterName="currentPageFragmentY" setterName="setPageFragY" :min="0" :max="currentPageDimensions.height" :step="1"/>
            <SliderInput label="W" getterName="currentPageFragmentW" setterName="setPageFragW" :min="0" :max="currentPageDimensions.width" :step="1"/>
            <SliderInput label="H" getterName="currentPageFragmentH" setterName="setPageFragH" :min="0" :max="currentPageDimensions.height" :step="1"/>
            <SliderInput label="°" getterName="currentPageRotation" setterName="setPageRotation" :min="-5" :max="5" :step="0.1"/>
          </div>
        </div>
        <div class="sidebarBox">
          <h1>Systems <small>[values in mm]</small></h1>
          <RastrumListing/>
        </div>
      </SideBar>
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
import RastrumListing from '@/components/RastrumListing.vue'

import SliderInput from '@/components/SliderInput.vue'

// import OpenSeadragonComponent from '@/components/OpenSeadragonComponent.vue'
import FacsimileComponent from '@/components/FacsimileComponent.vue'

export default {
  name: 'PagesTab',
  components: {
    MainStage,
    SideBar,
    TopMenu,
    PageList,
    SourceSelector,
    FacsimileComponent,
    RastrumListing,
    SliderInput
    // OpenSeadragonComponent
  },
  methods: {
    toggleSidebar () {
      this.$store.dispatch('togglePageTabSidebar')
    },
    toggleRightSidebar () {
      this.$store.dispatch('togglePageTabRightSidebar')
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
    ...mapGetters(['pageTabSidebarVisible',
      'page',
      'currentPageZeroBased',
      'currentPageAngle',
      'pageBorderPoints',
      'pageBorderPointsIncomplete',
      'currentPageDimensions',
      'allDocsLoaded',
      'pageTabRightSidebarVisible',
      'rastrumsOnCurrentPage']),
    tileSource () {
      const tileSource = this.$store.getters.osdTileSourceForCurrentPage
      return tileSource
    },
    svgFile () {
      const path = this.$store.getters.currentSvgPath
      if (path === null) {
        return null
      }
      const tokens = path.split('/')
      const name = tokens[tokens.length - 1]
      return name
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

    .sidebar {
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
      // this color is to increase visibility of the image borders
      // background: repeating-linear-gradient( -30deg, $mainBackgroundColor, $mainBackgroundColor 10px, darken($mainBackgroundColor, 10%) 10px, darken($mainBackgroundColor, 10%) 20px );
      background: linear-gradient(to bottom, $mainBackgroundColor, darken($mainBackgroundColor, 10%));
      flex: 1 1 auto;
      order: 2;
      height: calc(100vh - $totalHeaderHeight - $topMenuHeight - 10px);

      & > div {
        width: 100%;
        height: 100%;
        position: relative;
      }
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

.menuItem, .osdButtons {
  display: inline-block;
  margin: 0 .5rem 0 .5rem;

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

  &.mediaFragment.active, &.systems .customBtn.active {
    background-color: pink;
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

.sidebarBox {

  padding: .3rem .3rem .6rem;

  & + .sidebarBox {
    border-top: $lightBorder;
  }

  .denseFont {
    font-weight: 100;
    font-size: .7rem;
  }

  h1 {
    font-size: .8rem;
    font-weight: 900;
    margin: 0 0 .2rem;
    padding: 0;
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

</style>
