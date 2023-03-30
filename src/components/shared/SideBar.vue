<template>
  <div class="sidebar" :class="position" :style="{width: pageTabSidebarWidth + 'px'}">
    <slot/>
    <div class="closer" @click="closeSidebar"></div>
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
      if (this.tab === 'pagesTab') {
        console.log('yikes')
        this.$store.dispatch('togglePageTabSidebar')
      } else {
        console.error('Unable to close sidebar at ' + this.tab)
      }
    }
  },
  computed: {
    ...mapGetters(['pageTabSidebarWidth', 'pageTabSidebarVisible'])
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

  .closer {
    position: absolute;
    top: 0; // calc(50% - 1rem);
    height: 100%; // 2rem;
    width: .4rem;
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
