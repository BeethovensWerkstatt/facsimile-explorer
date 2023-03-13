<template>
  <div class="appTab pagesTab">
    <SideBar position="left"/>
    <TopMenu/>
    <MainStage/>
  </div>
</template>

<script>
import MainStage from '@/components/shared/MainStage.vue'
import SideBar from '@/components/shared/SideBar.vue'
import TopMenu from '@/components/shared/TopMenu.vue'

export default {
  name: 'PagesTab',
  components: {
    MainStage,
    SideBar,
    TopMenu
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

</style>
