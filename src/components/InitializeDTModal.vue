<template>

<div class="modal" :class="{ active }" id="select-dt-systems-modal">
   <a href="#close" @click="closeModal()" class="modal-overlay" aria-label="Close"></a>
   <div class="modal-container">
     <div class="modal-header">
       <a href="#close" @click="closeModal()" class="btn btn-clear float-right" aria-label="Close"></a>
       <div class="modal-title h5">Select Systems to include in DT</div>
     </div>
     <div class="modal-body">
      <div v-for="(rastrum, i) in rastrumsOnCurrentPage" :key="i">
        <span class="sysnum">{{ i+1 }}.:</span>
        <input type="checkbox" :checked="systems[i + 1]" @change="toggle(i + 1)" />
        {{ `${rastrum.x}, ${rastrum.y}` }}
      </div>
      <div>{{ systems }}</div>
    </div>
     <div class="modal-footer">
       <div class="btn-group">
         <button class="btn" @click="closeModal()">Cancel</button>
         <button class="btn btn-primary" @click="main()">Select</button>
       </div>
     </div>
   </div>
 </div>

</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'InitializeDTModal',
  data: () => ({
    systems: {}
  }),
  components: {
  },
  methods: {
    closeModal () {
      this.$store.dispatch('setModal', null)
    },
    toggle (i) {
      this.systems[i] = !this.systems[i]
    },
    main () {
      console.log(Object.keys(this.systems).filter(k => this.systems[k]).map(k => +k))
      this.$store.dispatch('setModal', null)
    }
  },
  computed: {
    ...mapGetters(['rastrumsOnCurrentPage']),
    active () {
      return this.$store.getters.modal === 'initializeDT'
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/css/_variables.scss';

.sysnum {
  display: inline-block;
  width: 2em;
  text-align: right;
}

</style>
