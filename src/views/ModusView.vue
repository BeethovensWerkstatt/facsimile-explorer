<template>
  <AppHeader/>

  <!-- TODO: Check modals -->
  <Modals/>
  <ContextMenu/>

  <!-- HELLO MODUSVIEW -->

  <HomeTab v-if="explorerTab === 'home'"/>
  <PagesTab v-else-if="explorerTab === 'pages'"/>
  <ZonesTab v-else-if="explorerTab === 'zones'"/>
  <AnnotTab v-else-if="explorerTab === 'annot'"/>
  <DiploTab v-else-if="explorerTab === 'diplo'"/>
</template>

<script>
import AppHeader from '@/components/AppHeader.vue'
import Modals from '@/components/shared/Modals.vue'

import HomeTab from '@/components/HomeTab.vue'
import PagesTab from '@/components/PagesTab.vue'
import ZonesTab from '@/components/ZonesTab.vue'
import AnnotTab from '@/components/AnnotTab.vue'
import DiploTab from '@/components/DiploTab.vue'
import ContextMenu from '@/components/shared/ContextMenu.vue'

export default {
  name: 'ModusView',
  components: {
    AppHeader,
    Modals,
    ContextMenu,
    HomeTab,
    PagesTab,
    ZonesTab,
    AnnotTab,
    DiploTab
  },
  created () {
    console.log('ModusView:created()')
    this.reload()
  },
  watch: {
    $route () {
      this.reload()
    },
    currentPath () {
      this.reload()
    },
    currentPage () {
      console.log('current page', this.$route.query.page)
      // this.reload()
    },
    docPath () {
      this.reload()
    }
  },
  methods: {
    doScroll (e) {
      console.log(e)
    },
    reload () {
      // console.log('route', this.$route)
      const path = this.$store.getters.getPathByName(this.$route.params.source)
      const modus = this.$route.params.modus
      const page = this.$route.query.page
      const zone = this.$route.query.zone
      console.log('ModusView: sourceParam="' + this.$route.params.source + '", resulting path="' + path + '", modus="' + modus + '", page="' + page + '", writing zone="' + zone + '"')
      if (path && this.$store.getters.filePath !== path) {
        this.$store.dispatch('loadContent', { path })
      }
      if (this.$store.getters.modus !== modus) {
        this.$store.dispatch('setExplorerTab', modus)
      }
      if (page && this.$store.getters.currentPageOneBased !== page) {
        const currentPage = { page: +page - 1 }
        if (zone) {
          currentPage.zone = +zone - 1
          /*
          const zones = this.$store.getters.writingZonesOnCurrentPage
          if (+zone >= 0 && +zone < zones.length) {
            const zoneid = zones[zone]
            if (zoneid !== this.$store.getters.activeWritingZone) {
              this.$store.dispatch('setActiveWritingZone', zoneid)
            }
          }
          */
        }
        // console.log('setCurrentPage', currentPage)
        this.$store.dispatch('setCurrentPage', currentPage)
      }
    }
  },
  computed: {
    currentPath () {
      return this.$route.fullPath
    },
    docPath () {
      return this.$store.getters.getPathByName(this.$route.params.source)
    },
    isReady () {
      return this.$store.getters.isReady
    },
    explorerTab () {
      return this.$route.params.modus // this.$store.getters.explorerTab
    },
    currentPage () {
      return (+this.$route.query.page || 1) - 1
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
