<template v-if="explorerTab === 'home' && noCurrentDoc">
  <AppHeader/>

  <!-- TODO: Check modals -->
  <Modals/>

  <HomeTab/>
</template>

<script>
import AppHeader from '@/components/AppHeader.vue'

import HomeTab from '@/components/HomeTab.vue'
import Modals from '@/components/shared/Modals.vue'

export default {
  name: 'App',
  components: {
    AppHeader,
    Modals,
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
    explorerTab () {
      return this.$store.getters.explorerTab
    },
    noCurrentDoc () {
      return !this.$store.getters.currentDocPath
    }
  },
  beforeUnmount () {
    console.log('HomeView:beforeUnmount()')
  },
  unmounted () {
    console.log('HomeView:unmounted()')
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
