<template>
  <div class="appTab zonesTab">
    <TopMenu>
      <div class="menuItem">
        <button class="btn" @click="toggleSidebar">
          <i class="icon" :class="{'icon-arrow-left': zonesTabLeftSidebarVisible, 'icon-arrow-right': !zonesTabLeftSidebarVisible}"></i>
        </button>
      </div>
      <div class="osdButtons">
        <div class="osdButton" id="zoomOut"><i class="icon icon-minus"></i></div>
        <div class="osdButton" id="zoomIn"><i class="icon icon-plus"></i></div>
      </div>
      <div class="menuItem displayModes">
        <span class="displayMode" ref="hideInactive" @click="toggleDisplayOptions('hideInactive')">Hide Inactive Zones</span>
        <span class="displayMode" ref="hideActive" @click="toggleDisplayOptions('hideActive')">Hide Active Zone</span>
        <span class="displayMode" ref="hideUnassigned" @click="toggleDisplayOptions('hideUnassigned')">Hide Unassigned</span>
      </div>
    </TopMenu>
    <div class="flexBox" ref="container">
      <div class="showSideBar" v-if="!zonesTabLeftSidebarVisible" @click="toggleSidebar"></div>
      <Transition name="slide-fade">
        <SideBar class="stageItem sidebarLeft" position="left" tab="zonesTab" v-if="zonesTabLeftSidebarVisible">
          <SourceSelector/>
          <PageList tab="zonesTab"/>
        </SideBar>
      </Transition>
      <MainStage class="mainStage stageItem">
        <!--<OpenSeadragonComponent :svg="true" :annotorious="false" :pageBorders="false" :rastrums="false"/>-->
        <FacsimileComponent type="facsimile"/>
      </MainStage>
      <SideBar class="stageItem sidebarRight" position="right" tab="zonesTab" v-if="zonesTabRightSidebarVisible">
        <h1>Writing Zones ({{writingZones.length}})</h1>
        <WritingZoneListEntry v-for="(wz, i) in writingZones" :key="i" :wz="wz" :position="i"/>
        <button id="newZone" class="btn btn-sm" @click="createZone">Start new Writing Zone</button>
        <h1 class="spaced">Unassigned Shapes: {{unAssignedShapes.length}}</h1>
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

// import OpenSeadragonComponent from '@/components/OpenSeadragonComponent.vue'
import FacsimileComponent from '@/components/FacsimileComponent.vue'
import WritingZoneListEntry from '@/components/WritingZoneListEntry.vue'

export default {
  name: 'ZonesTab',
  components: {
    MainStage,
    SideBar,
    TopMenu,
    PageList,
    SourceSelector,
    // OpenSeadragonComponent,
    FacsimileComponent,
    WritingZoneListEntry
  },
  methods: {
    toggleSidebar () {
      this.$store.dispatch('toggleZonesTabLeftSidebar')
    },
    createZone () {
      if (this.$store.getters.svgForCurrentPage) {
        this.$store.dispatch('createNewWritingZone')
      }
    },
    toggleDisplayOptions (option) {
      this.$refs.container.classList.toggle(option)
      this.$refs[option].classList.toggle('active')
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
    }
  },
  computed: {
    ...mapGetters(['zonesTabLeftSidebarVisible', 'zonesTabRightSidebarVisible']),
    writingZones () {
      return this.$store.getters.writingZonesOnCurrentPage
      /* return [{ id: 'asd', totalCount: 73, layers: [{ id: 'asd1', shapes: ['shape1', 'shape2', 'shape3', 'shape4'] }] },
        { id: 'sdf', totalCount: 114, layers: [{ id: 'sdf1', shapes: ['shapeX', 'shapeY', 'shapeZ'] }] },
        { id: 'dfg', totalCount: 82, layers: [{ id: 'dfg1', shapes: ['shapeP', 'shapeQ', 'shapeR', 'shapeS', 'shapeT'] }] }] */
    },
    unAssignedShapes () {
      return this.$store.getters.unassignedShapesOnCurrentPage
    }
  },
  created () {
    this.unwatchSvgVerification = this.$store.watch((state, getters) => getters.currentSvgPath,
      (newPath, oldPath) => {
        this.verifySvgAvailable()
      })

    this.verifySvgAvailable()
  },
  beforeUnmount () {
    this.unwatchSvgVerification()
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
      background: linear-gradient( to bottom, $darkBackgroundColor, darken($darkBackgroundColor, 10%));
      flex: 1 1 auto;
      order: 2;
      height: calc(100vh - $totalHeaderHeight - $topMenuHeight - 10px);
    }
  }
}

.zonesTab {
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

.displayModes {
  float: right;

  .displayMode {
    display: inline-block;
    padding: 0 .4rem;
    margin: 0 .2rem;
    cursor: pointer;
    border-radius: 6px;

    &.active {
      background-color: transparentize($highlightColor05, 0.6);
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

h1 {
  font-size: .9rem;
  font-weight: 700;
  margin: 0;
  padding: 0;

  &.spaced {
    margin-top: 3rem;
  }
}

button#newZone {
  margin: 1rem 0;
  float: right;
}

</style>
