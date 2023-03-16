<template>
  <div class="appTab pagesTab">
    <SideBar position="left">
      <div class="sidebar">list pages ...</div>
    </SideBar>
    <TopMenu>
      <div class="toolbar">toolbar ...</div>
    </TopMenu>
    <MainStage>
      <OpenSeadragonComponent />
    </MainStage>
  </div>
</template>

<script>
import MainStage from '@/components/shared/MainStage.vue'
import SideBar from '@/components/shared/SideBar.vue'
import TopMenu from '@/components/shared/TopMenu.vue'
import OpenSeadragonComponent from '@/components/OpenSeadragonComponent.vue'

export default {
  name: 'PagesTab',
  components: {
    MainStage,
    SideBar,
    TopMenu,
    OpenSeadragonComponent
  },
  methods: {

  },
  computed: {

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/css/_variables.scss';

.appTab {
  background: linear-gradient(to bottom, lighten($mainBackgroundColor, 10%), darken($mainBackgroundColor, 2%));
  height: calc(100vh - $totalHeaderHeight);
}
.toolbar {
  height: 50px;
}
.sidebar {
  height: 100%;
}
</style>
