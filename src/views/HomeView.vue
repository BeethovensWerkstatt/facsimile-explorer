<template>
  <AppHeader/>

  <!-- TODO: Check modals -->

  <OpenFileModal/>

  <HomeTab />

</template>

<script>
import AppHeader from '@/components/AppHeader.vue'
import OpenFileModal from '@/components/OpenFileModal.vue'

import HomeTab from '@/components/HomeTab.vue'

import 'splitpanes/dist/splitpanes.css'

export default {
  name: 'App',
  components: {
    AppHeader,
    OpenFileModal,
    HomeTab
  },
  methods: {
    doScroll (e) {
      console.log(e)
    }
  },
  computed: {
    isReady () {
      return this.$store.getters.isReady
    },
    currentTab () {
      return this.$store.getters.currentTab
    }
  }
}
</script>

<style lang="scss">
@import '@/css/_variables.scss';

#app {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.mainSplitter {
  height: calc(100% - $appHeaderHeight);
  background-color: $mainBackgroundColor;
}

.loadingBack {
   width: 100%;
   height: calc(100% - $appHeaderHeight);
   padding: 3rem;
   background: linear-gradient(to bottom, $mainBackgroundColor, darken($mainBackgroundColor, 30%));
}

</style>
