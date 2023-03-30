<template>
  <div class="appTab pagesTab">
    <div class="showSideBar" v-if="!pageTabSidebarVisible" @click="toggleSidebar"></div>
    <Transition name="slide-fade">
      <SideBar class="stageItem sidebar" position="left" tab="pagesTab" v-if="pageTabSidebarVisible">
        <PageList/>
      </SideBar>
    </Transition>
    <TopMenu class="stageItem">
      <!--<i class="icon icon-menu showSidebar" @click="toggleSidebar" title="show page list" v-if="!pageTabSidebarVisible"></i>-->
      <div class="menuItem fileInput" title="TODO: open a filepicker and load svg">
        Import SVG
      </div>
      <div class="menuItem mediaFragment">
        #xywh
      </div>
      <div class="menuItem systems">
        Add | Remove
      </div>
    </TopMenu>
    <MainStage class="mainStage stageItem">
      <div>Hello</div>
    </MainStage>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import MainStage from '@/components/shared/MainStage.vue'
import SideBar from '@/components/shared/SideBar.vue'
import TopMenu from '@/components/shared/TopMenu.vue'

import PageList from '@/components/shared/PageList.vue'

export default {
  name: 'PagesTab',
  components: {
    MainStage,
    SideBar,
    TopMenu,
    PageList
  },
  methods: {
    toggleSidebar () {
      this.$store.dispatch('togglePageTabSidebar')
    }
  },
  computed: {
    ...mapGetters(['pageTabSidebarVisible'])
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/css/_variables.scss';

.pagesTab {
  position: relative;
}

.showSideBar {
  position: absolute;
  left: 0;
  top: 1.6rem;
  bottom: 0;
  width: 10px;
  &:hover {
    cursor: e-resize;
    background: linear-gradient(to right, darken($mainBackgroundColor, 10%), $mainBackgroundColor);
  }
}

.appTab {
  background: linear-gradient(to bottom, lighten($mainBackgroundColor, 10%), darken($mainBackgroundColor, 2%));
  height: calc(100vh - $totalHeaderHeight);

  display: flex;
  flex-flow: row wrap;

  .stageItem {
    flex: 1 100%;
  }

  .sidebar {
    order: 1;
  }

  .mainStage {
    background-color: red;

    flex: 3 0px;
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

  & + .menuItem {
    border-left: $lightBorder;
    padding-left: .5rem;
  }
}

</style>
