<template>
  <div class="appTab diploTab">
    <TopMenu>
      <div class="menuItem">
        <button class="btn" @click="toggleSidebar">
          <i class="icon" :class="{'icon-arrow-left': diploTabSidebarVisible, 'icon-arrow-right': !diploTabSidebarVisible}"></i>
        </button>
      </div>
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
          <p>
            <b>Hallo Jan-Peter</b>: Das ist hier natürlich alles noch sehr vorläufig, aber ich denke,
            Du hast auch anderweitig genug Baustellen in der App, um die beiden nächsten Wochen zu füllen ;-)
          </p>
        </SideBar>
      </Transition>
      <MainStage class="mainStage stageItem">
        <div class="mainBox">
          <OpenSeadragonComponent/>
        </div>
        <div class="mainBox">
          <OpenSeadragonComponent/>
        </div>
        <div class="mainBox">
          <code>XML Editor goes here</code>
        </div>
        <div class="mainBox">
          <VerovioComponent purpose="transcribing"/>
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

import OpenSeadragonComponent from '@/components/OpenSeadragonComponent.vue'
import VerovioComponent from '@/components/shared/VerovioComponent.vue'

export default {
  name: 'DiploTab',
  components: {
    MainStage,
    SideBar,
    TopMenu,
    // PageList,
    SourceSelector,
    OpenSeadragonComponent,
    VerovioComponent
  },
  methods: {
    toggleSidebar () {
      this.$store.dispatch('toggleDiploTabSidebar')
    }
  },
  computed: {
    ...mapGetters(['diploTabSidebarVisible'])
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
  display: inline-block;

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
