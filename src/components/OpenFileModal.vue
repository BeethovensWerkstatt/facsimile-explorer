<template>

   <div class="modal" :class="{ active }" id="open-file-modal">
   <a href="#close" @click="closeModal()" class="modal-overlay" aria-label="Close"></a>
   <div class="modal-container">
     <div class="modal-header">
       <a href="#close" @click="closeModal()" class="btn btn-clear float-right" aria-label="Close"></a>
       <div class="modal-title h5">Open Document</div>
     </div>
     <div class="modal-body">
       <div class="content">
         <table class="table table-striped table-hover">
           <thead>
             <tr>
               <th>Filename</th>
             </tr>
           </thead>
           <tbody>
             <tr v-for="(source, n) in sources" :key="n" @click="openDocument(source.path)">
               <td>{{ source.name }}</td>
             </tr>
           </tbody>
         </table>
       </div>
     </div>
     <div class="modal-footer">
       <div class="btn-group">
         <button class="btn" @click="closeModal()">Cancel</button>
       </div>
     </div>
   </div>
 </div>

</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'OpenFileModal',
  components: {

  },
  methods: {
    closeModal () {
      this.$store.dispatch('setModal', null)
    },
    openDocument (path) {
      console.log('Opening File now: ' + path)
      this.$store.dispatch('setModal', null)
    }
  },
  computed: {
    ...mapGetters(['sources']),
    active () {
      return this.$store.getters.modal === 'openfile'
    },
    array () {
      return ['D-B_Grasnick_20b', 'D-Mbs 2 Mus.pr. 1326-165', 'F-Pn_Fonds_francais_12.756', 'F-Pn_Ms_57', 'F-Pn_Ms_96', 'Landsberg_8-1']
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/css/_variables.scss';

</style>
