<template>

   <div class="modal" :class="{ active }" id="load-xml-modal">
   <a href="#close" @click="closeModal()" class="modal-overlay" aria-label="Close"></a>
   <div class="modal-container">
     <div class="modal-header">
       <a href="#close" @click="closeModal()" class="btn btn-clear float-right" aria-label="Close"></a>
       <div class="modal-title h5">Load XML File</div>
     </div>
     <div class="modal-body">
       <div class="content">
         <button class="btn btn-link" @click="testData()">Load test data</button>
         <input type="file" id="mei-file-input" accept=".xml, .mei" />
       </div>
     </div>
     <div class="modal-footer">
       <div class="btn-group">
         <button class="btn" @click="closeModal()">Cancel</button>
         <button class="btn btn-primary" @click="main()">Load</button>
       </div>
     </div>
   </div>
 </div>

</template>

<script>

export default {
  name: 'LoadXmlModal',
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
      const input = document.querySelector('#mei-file-input')
      const [file] = input.files
      if (file) {
        const reader = new FileReader()
        reader.addEventListener('load', () => {
          console.log(file)
          const mei = reader.result
          this.$store.dispatch('setData', { mei, path: file.path })
          this.closeModal()
        })
        reader.readAsText(file)
      }
    }
  },
  computed: {
    active () {
      return this.$store.getters.modal === 'loadxml'
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
