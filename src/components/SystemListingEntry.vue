<template>
  <tr class="systemListingEntry narrow" :class="{ selected }">
     <td class="systemNo" :data-n="n">{{ n + 1 }}</td>
     <td class="top">{{ system.top }}</td>
     <td class="left">{{ system.left }}</td>
     <td class="right">{{ system.right }}</td>
     <td class="tools">{{ selected }}</td>
  </tr>
</template>

<script>
// import SystemListingEntry from '@/components/SystemListingEntry.vue'

export default {
  name: 'SystemListingEntry',
  components: {

  },
  props: {
    n: Number,
    system: Object
  },
  methods: {
    /* switchTab (val) {
      this.$store.dispatch('setExplorerTab', val)
   } */
  },
  computed: {
    selected () {
      return this.$store.getters.selectedSystemOnCurrentPage === this.n
    }
    /* selectionEnabled: {
      get () {
        return this.$store.getters.selectionRectEnabled
      },
      set (value) {
        this.$store.dispatch('setSelectionRectEnabled', value)
      }
    },
    selectionRect () {
      return this.$store.getters.selectionRect
    } */
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.narrow td {
   padding: .1rem .4rem;
}

.selected td {
   background-color: #5755d933;
}
</style>
