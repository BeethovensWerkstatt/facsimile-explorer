<template>
  <div class="pageList">
    <table class="table table-striped">
      <thead>
        <tr>
          <th>Page</th>
          <th>SVG</th>
          <th title="Image URI has a fragment identifier that specifies the actual physical page">#xywh</th>
          <th>Systems</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(page, i) in pages" :key="i" :class="{active: i === activePage}">
          <td>{{ page.label }}</td>
          <td><input type="checkbox" :checked="page.hasSVG" disabled/></td>
          <td><input type="checkbox" :checked="page.hasFragment" disabled/></td>
          <td>{{ page.systems }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
// import { mapGetters } from 'vuex'

export default {
  name: 'PageList',
  components: {

  },
  methods: {

  },
  computed: {
    pages () {
      return [{ label: '1', hasSVG: true, systems: 12, hasFragment: true },
        { label: '2', hasSVG: true, systems: 12, hasFragment: true },
        { label: '3', hasSVG: true, systems: 11, hasFragment: true },
        { label: '4', hasSVG: true, systems: 12, hasFragment: true },
        { label: '5', hasSVG: true, systems: 13, hasFragment: true },
        { label: '6', hasSVG: false, systems: 12, hasFragment: true },
        { label: '7', hasSVG: false, systems: 12, hasFragment: true },
        { label: '8', hasSVG: false, systems: 12, hasFragment: false }]
    },
    activePage () {
      /* INFO JP: Wie wir die aktive Seite identifizieren (Index oder Label) ist egal… */
      return 5
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
</style>
