<template>
  <div class="systemCartographer">
    <div class="form-group">
      <label class="form-switch">
        <input type="checkbox" v-model="selectionEnabled">
        <i class="form-icon"></i> Enable System Selection
      </label>
    </div>
    <div class="currentSelection">
      <h3>Systems on Page</h3>
      <table class="table table-striped">
        <thead>
          <tr>
            <th>#</th>
            <th>Top</th>
            <th>Left</th>
            <th>Right</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
           <SystemListingEntry v-for="(system, n) in systems" :key="'system_' + n" :n="n" :system="system"/>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import SystemListingEntry from '@/components/SystemListingEntry.vue'

export default {
  name: 'SystemCartographer',
  components: {
    SystemListingEntry
  },
  methods: {
    switchTab (val) {
      this.$store.dispatch('setExplorerTab', val)
    }
  },
  computed: {
    selectionEnabled: {
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
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.systemCartographer {
  padding: .5rem;

  h3 {
    font-size: .9rem;
  }
}
</style>
