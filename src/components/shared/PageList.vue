<template>
  <div class="pageList">
    <div class="pageBox" v-for="(page, i) in pages" :key="i" :class="{active: i === activePage}" @click="$store.dispatch('setCurrentPage', i)">
      <h2>{{ page.label }} <small class="modernLabel" v-if="page.modernLabel !== null">{{page.document}}: {{page.modernLabel}}</small></h2>
      <div class="activePageContent" v-if="i === activePage && tab === 'pagesTab'">
        <span class="svg">SVG: <i class="icon" :class="{'icon-check': page.hasSvg, 'icon-cross': !page.hasSvg}"></i></span>
        <span class="fragment" title="Image URI has a fragment identifier that specifies the actual physical page">Page Size: <i class="icon" :class="{'icon-check': page.hasFragment, 'icon-cross': !page.hasFragment}"></i></span>
        <span class="systems">Systems: {{page.systems}}</span>
      </div>
      <div class="svgIndicator indicatorBox" v-if="page.hasSvg && i !== activePage"/>
      <div class="fragmentIndicator indicatorBox" v-if="page.hasFragment && i !== activePage"/>
      <div class="systemIndicator indicatorBox" v-if="page.systems !== 0 && i !== activePage"/>
    </div>

  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'PageList',
  props: {
    tab: String
  },
  components: {

  },
  methods: {
    ...mapActions(['setCurrentPage'])
  },
  computed: {
    ...mapGetters(['currentPageZeroBased']),
    pages () {
      const pages = this.$store.getters.documentPagesForSidebars(this.$store.getters.filepath)

      return pages

      /*
      if (this.tab === 'pagesTab') {
        return [{ label: '1', hasSVG: true, systems: 12, hasFragment: true },
          { label: '2', hasSVG: true, systems: 12, hasFragment: true },
          { label: '3', hasSVG: true, systems: 11, hasFragment: true },
          { label: '4', hasSVG: true, systems: 12, hasFragment: true },
          { label: '5', hasSVG: true, systems: 13, hasFragment: true },
          { label: '6', hasSVG: false, systems: 12, hasFragment: true },
          { label: '7', hasSVG: false, systems: 12, hasFragment: true },
          { label: '8', hasSVG: false, systems: 12, hasFragment: false }]
      } else if (this.tab === 'zonesTab') {
        return [{ label: '1', zonesCount: 11 },
          { label: '2', zonesCount: 3 },
          { label: '3', zonesCount: 7 },
          { label: '4', zonesCount: 12 },
          { label: '5', zonesCount: 19 },
          { label: '6', zonesCount: 8 },
          { label: '7', zonesCount: 14 },
          { label: '8', zonesCount: 11 }]
      }
      return []
      */
    },
    activePage () {
      /* INFO JP: Wie wir die aktive Seite identifizieren (Index oder Label) ist egal… */
      return this.currentPageZeroBased
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/css/_variables.scss';

.pageBox {
  margin: .1rem 0 .2rem 0;
  position: relative;

  .indicatorBox {
    position: absolute;
    bottom: 10%;
    width: 20%;
    height: .1rem;
    border-radius: 2px;

    &.svgIndicator {
      background-color: green;
      left: 2%;
    }

    &.fragmentIndicator {
      background-color: red;
      left: 40%;
    }

    &.systemIndicator {
      background-color: red;
      left: 75%;
    }
  }

  h2 {
    font-size: .8rem;
    font-weight: 700;
    margin: 0;
    padding: .1rem .2rem;
    border: $lightBorder;
    border-radius: 3px;
    background-color: lighten($mainBackgroundColor, 5%);
    position: relative;

    small {
      font-size: .7rem;
      line-height: 1rem;
      font-weight: 300;
      float: right;
    }
  }

  .activePageContent {
    font-size: .7rem;
    padding: 0 0 .3rem 1rem;
    text-align: right;

    .svg, .fragment {
      padding-right: .5rem;
    }

    i {
      font-size: .6rem;
      position: relative;
      top: -1px;
    }
  }

  &.active h2 {
    background-color: lighten($highlightColor06, 30%);
  }
}

</style>
