<template>

   <div class="modal" :class="{ active }" id="iiif-modal">
   <a href="#close" @click="closeModal()" class="modal-overlay" aria-label="Close"></a>
   <div class="modal-container">
     <div class="modal-header">
       <a href="#close" @click="closeModal()" class="btn btn-clear float-right" aria-label="Close"></a>
       <div class="modal-title h5">Import IIIF Manifest</div>
     </div>
     <div class="modal-body">
       <div class="content">
         <div class="form-group">
           <label class="form-label" for="manifest-uri-input">IIIF Manifest</label>
           <input class="form-input" type="url" id="manifest-uri-input" placeholder="URL">
         </div>
         <div>
           <p>
             The given IIIF Manifest will be converted to an MEI file, holding
             the information relevant for the Facsimile Explorer app. This will
             be a very specific version of MEI, tailored for the needs of a
             diplomatic transcript of the contents of the music manuscript
             described by the IIIF Manifest provided.
           </p>
        </div>
        <div @click="useTestUri">{{ testUri }}</div>
       </div>
     </div>
     <div class="modal-footer">
       <div class="btn-group">
         <button class="btn" @click="closeModal()">Cancel</button>
         <button class="btn btn-primary" @click="main()">Import</button>
       </div>
     </div>
   </div>
 </div>

</template>

<script>

export default {
  name: 'IiifModal',
  components: {

  },
  data: () => ({
    testUri: 'https://content.staatsbibliothek-berlin.de/dc/800412591/manifest'
  }),
  methods: {
    useTestUri () {
      this.$el.querySelector('#manifest-uri-input').value = this.testUri
    },
    closeModal () {
      this.$store.dispatch('setModal', null)
    },
    main () {
      const input = document.querySelector('#manifest-uri-input')
      if (input.validity.valid) {
        this.$store.dispatch('importIIIF', input.value)
      }
    }
  },
  computed: {
    active () {
      return this.$store.getters.modal === 'iiif'
    },
    isValid () {
      if (this.$store.getters.modal !== 'iiif') {
        return true
      }
      const input = document.querySelector('#manifest-uri-input')
      if (input === null) {
        return true
      }
      return input.validity.valid
    },
    type () {
      return this.$store.getters.modal
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/css/_variables.scss';

</style>
