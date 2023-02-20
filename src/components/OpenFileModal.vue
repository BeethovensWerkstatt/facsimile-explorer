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
         Liste mit erlaubten Dokumenten hier einbinden.
       </div>
     </div>
     <div class="modal-footer">
       <div class="btn-group">
         <button class="btn" @click="closeModal()">Cancel</button>
         <button class="btn btn-primary" @click="main()">Open</button>
       </div>
     </div>
   </div>
 </div>

</template>

<script>

export default {
  name: 'OpenFileModal',
  components: {

  },
  methods: {
    closeModal () {
      this.$store.dispatch('setModal', null)
    },
    main () {
      console.log('Opening File now!')
    }
  },
  computed: {
    active () {
      return this.$store.getters.modal === 'openfile'
    }
    /* isValid () {
      if (this.$store.getters.modal !== 'loadxml') {
        return true
      }
      const input = document.querySelector('#manifest-uri-input')
      if (input === null) {
        return true
      }
      return input.validity.valid
    }, */
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/css/_variables.scss';

</style>
