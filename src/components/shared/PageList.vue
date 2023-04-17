<template>
  <div class="pageList">
    <table class="table table-striped">
      <thead>
        <tr>
          <th>Page</th>
          <template v-if="tab === 'pagesTab'">
            <th>SVG</th>
            <th title="Image URI has a fragment identifier that specifies the actual physical page">#xywh</th>
            <th>Systems</th>
          </template>
          <template v-if="tab === 'zonesTab'">
            <th># Zones</th>
          </template>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(page, i) in pages" :key="i" :class="{active: i === activePage}" @click="$store.dispatch('setCurrentPage', i)">
          <td><sub>{{ i+1 }}</sub> {{ page.label }}</td>
          <template v-if="tab === 'pagesTab'">
            <td><input type="checkbox" :checked="page.hasSVG" disabled/></td>
            <td><input type="checkbox" :checked="page.hasFragment" disabled/></td>
            <td>{{ page.systems }}</td>
          </template>
          <template v-if="tab === 'zonesTab'">
            <td>{{page.zonesCount}}</td>
          </template>
        </tr>
      </tbody>
    </table>
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
      // Info JP: das kann auch das gleiche Objekt sein, falls das einfacher ist…
      console.log(this.$store.getters.pages)
      return this.$store.getters.pages.map(p => ({
        ...p,
        hasSVG: !!p.hasSVG,
        hasFragment: !!p.hasFragment,
        systems: p.systems || 0,
        zonesCount: p.zonesCount || 0
      }))
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

td {
  padding: .1rem .2rem;
}

tr.active td {
  background-color: lighten($activeHighlightColor, 15%);
}

sub {
  color: gray;
}
</style>
