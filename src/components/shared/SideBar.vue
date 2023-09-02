<template>
  <div class="sidebar" :class="position" :style="{width: localWidth + 'px'}">
    <slot/>
    <div class="closer" v-if="closable" @click="closeSidebar"></div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'SideBar',
  props: {
    position: String,
    tab: String
  },
  components: {

  },
  methods: {
    closeSidebar () {
      if (this.tab === 'pagesTab' && this.position === 'left') {
        this.$store.dispatch('togglePageTabSidebar')
      } else if (this.tab === 'pagesTab' && this.position === 'right') {
        this.$store.dispatch('togglePageTabRightSidebar')
      } else if (this.tab === 'zonesTab' && this.position === 'left') {
        this.$store.dispatch('toggleZonesTabLeftSidebar')
      } else if (this.tab === 'annotTab' && this.position === 'left') {
        this.$store.dispatch('toggleAnnotTabLeftSidebar')
      } else {
        console.error('Unable to close sidebar at ' + this.tab)
      }
    }
  },
  computed: {
    ...mapGetters(['pageTabSidebarWidth',
      'pageTabRightSidebarWidth',
      'zonesTabLeftSidebarWidth',
      'zonesTabRightSidebarWidth',
      'annotTabLeftSidebarWidth',
      'annotTabRightSidebarWidth',
      'diploTabSidebarWidth']),
    localWidth () {
      if (this.tab === 'pagesTab' && this.position === 'left') {
        return this.pageTabSidebarWidth
      } else if (this.tab === 'pagesTab' && this.position === 'right') {
        return this.pageTabRightSidebarWidth
      } else if (this.tab === 'zonesTab' && this.position === 'left') {
        return this.zonesTabLeftSidebarWidth
      } else if (this.tab === 'zonesTab' && this.position === 'right') {
        return this.zonesTabRightSidebarWidth
      } else if (this.tab === 'annotTab' && this.position === 'left') {
        return this.annotTabLeftSidebarWidth
      } else if (this.tab === 'annotTab' && this.position === 'right') {
        return this.annotTabRightSidebarWidth
      } else if (this.tab === 'diploTab') {
        return this.diploTabSidebarWidth
      } else {
        return '200'
      }
    },
    closable () {
      return this.tab === 'pagesTab' || (this.tab === 'zonesTab' && this.position === 'left')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/css/_variables.scss';

.sidebar {
  display: inline-block;
  padding: 1rem;
  position: relative;
  overflow: auto;

  .closer {
    position: absolute;
    top: 0; // calc(50% - 1rem);
    height: 100%; // 2rem;
    width: .4rem;
    z-index: 10;
    cursor: w-resize;

    &:hover {
      background: linear-gradient(to left, $mainBackgroundColor, #ffffff);
    }
  }

  &.left {
    border-right: $lightBorder;
    background: lighten($mainBackgroundColor, 10%);

    .closer {
      right: 0;
    }
  }

  &.right {
    border-left: $lightBorder;
    background: lighten($mainBackgroundColor, 10%);

    .closer {
      left: 0;
    }
  }
}

</style>
