<template>
  <div class="sketchAreaEditor">
    <table class="table table-striped">
      <thead>
         <tr>
           <th>x</th>
           <th>y</th>
           <th>width</th>
           <th>height</th>
           <th># shapes</th>
         </tr>
      </thead>
      <tbody>
        <tr v-for="(g,i) in sketchAreas" :key="i" :title="g.id" @click="activateGroup(g.id)" :class="{active: g.id === activeSketchArea}">
          <td>{{g.x}}</td>
          <td>{{g.y}}</td>
          <td>{{g.w}}</td>
          <td>{{g.h}}</td>
          <td>{{g.shapes}}</td>
        </tr>
      </tbody>
    </table>
    <button class="btn btn-link" @click="createGroup">Create Group</button>
  </div>
</template>

<script>
// import SystemListingEntry from '@/components/SystemListingEntry.vue'

export default {
  name: 'SketchAreaEditor',
  components: {

  },
  methods: {
    createGroup () {
      console.log('createGroup')
      this.$store.dispatch('createSketchArea')
    },
    activateGroup (id) {
      this.$store.dispatch('activateSketchArea', id)
    }
    /* switchTab (val) {
      this.$store.dispatch('setExplorerTab', val)
    } */
  },
  computed: {
    activeSketchArea () {
      return this.$store.getters.activeSketchArea
    },
    sketchAreas () {
      return this.$store.getters.sketchAreasOnCurrentPage
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
    },
    systems () {
      return this.$store.getters.systemsOnCurrentPage
    } */
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h1 {
  font-size: 1rem;
  font-weight: 500;
  margin: 0 0 .2rem;
}

tr.active {
   background-color: red;
}
</style>
