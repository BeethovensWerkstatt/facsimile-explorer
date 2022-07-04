<template>

   <div class="modal" :class="{ active }" id="modal-id">
   <a href="#close" @click="closeModal()" class="modal-overlay" aria-label="Close"></a>
   <div class="modal-container">
     <div class="modal-header">
       <a href="#close" @click="closeModal()" class="btn btn-clear float-right" aria-label="Close"></a>
       <div class="modal-title h5">{{ title }}</div>
     </div>
     <div class="modal-body">
       <div class="content">
         <template v-if="type === 'iiif'">
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
           <div>https://content.staatsbibliothek-berlin.de/dc/800412591/manifest.json</div>
         </template>
         <template v-if="type === 'loadxml'">
            <button class="btn btn-link" @click="testData()">Load test data</button><br />
            <input type="file" id="mei-file-input" accept=".xml, .mei" />
         </template>
       </div>
     </div>
     <div class="modal-footer">
       <div class="btn-group">
         <button class="btn" @click="closeModal()">Cancel</button>
         <button class="btn btn-primary" @click="main()">{{ mainButtonLabel }}</button>
       </div>
     </div>
   </div>
 </div>

</template>

<script>

export default {
  name: 'ModalOverlay',
  components: {

  },
  methods: {
    testData () {
      this.$store.dispatch('getTestData')
      this.$store.dispatch('setModal', null)
    },
    closeModal () {
      this.$store.dispatch('setModal', null)
    },
    main () {
      const modal = this.$store.getters.modal
      if (modal === 'iiif') {
        const input = document.querySelector('#manifest-uri-input')
        if (input.validity.valid) {
          this.$store.dispatch('importIIIF', input.value)
        }
      } else if (modal === 'loadxml') {
        const input = document.querySelector('#mei-file-input')
        const [file] = input.files
        if (file) {
          const reader = new FileReader()
          reader.addEventListener('load', () => {
            console.log(file)
            this.$store.dispatch('setData', reader.result)
            this.closeModal()
          })
          reader.readAsText(file)
        }
      }
    }
  },
  computed: {
    active () {
      return this.$store.getters.modal !== null
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
    title () {
      const modal = this.$store.getters.modal

      let title
      switch (modal) {
        case 'null':
          title = ''
          break
        case 'iiif':
          title = 'Import IIIF Manifest'
          break
        case 'loadxml':
          title = 'Load XML File'
          break
        default:
          title = modal
      }
      return title
    },
    mainButtonLabel () {
      const modal = this.$store.getters.modal

      let label
      switch (modal) {
        case 'null':
          label = ''
          break
        case 'iiif':
          label = 'Import'
          break
        case 'loadxml':
          label = 'Load'
          break
        default:
          label = modal
      }
      return label
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
