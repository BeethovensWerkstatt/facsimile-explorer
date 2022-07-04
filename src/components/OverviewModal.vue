<template>

   <div class="modal" :class="{ active }" id="overview-modal">
   <a href="#close" @click="closeModal()" class="modal-overlay" aria-label="Close"></a>
   <div class="modal-container">
     <div class="modal-header">
       <a href="#close" @click="closeModal()" class="btn btn-clear float-right" aria-label="Close"></a>
       <div class="modal-title h5">Overview</div>
     </div>
     <div class="modal-body">
       <div class="content">
         <div>
           <h1>Pages</h1>
           <DocumentOverviewRow v-for="r in maxRows" :key="r" :left="((r - 1) * 2 - 1)"  :right="((r - 1) * 2)"/>
         </div>
       </div>
     </div>
     <div class="modal-footer">
       <div class="btn-group">
         <button class="btn" @click="closeModal()">Close</button>
         <button class="btn btn-primary" :disabled="openPageBlocked" @click="openPage()">Open Page {{previewLabel}}</button>
       </div>
     </div>
   </div>
 </div>

</template>

<script>
import DocumentOverviewRow from '@/components/DocumentOverviewRow.vue'

export default {
  name: 'OverviewModal',
  components: {
    DocumentOverviewRow
  },
  methods: {
    closeModal () {
      this.$store.dispatch('setModal', null)
    },
    openPage () {
      const previewPage = this.$store.getters.previewPageZeroBased
      this.$store.dispatch('setCurrentPage', previewPage)
      this.$store.dispatch('setModal', null)
    }
  },
  computed: {
    active () {
      return this.$store.getters.modal === 'overview'
    },
    pages () {
      return this.$store.getters.pageArray
    },
    maxRows () {
      return Math.ceil(this.$store.getters.pageArray.length / 2)
    },
    previewLabel () {
      const previewNum = this.$store.getters.previewPageZeroBased

      if (previewNum === -1) {
        return ''
      }

      return this.$store.getters.page(previewNum).label
    },
    openPageBlocked () {
      const previewPage = this.$store.getters.previewPageZeroBased
      const currentPage = this.$store.getters.currentPageZeroBased

      return previewPage === -1 || previewPage === currentPage
    }
  },
  created () {
    this.keyListener = (e) => {
      if (this.$store.getters.modal !== 'overview') {
        return false
      }

      const previewPage = this.$store.getters.previewPageZeroBased
      const currentPage = this.$store.getters.currentPageZeroBased
      const maxPage = this.$store.getters.pageArray.length - 1

      if (e.code === 'ArrowUp') {
        const startPage = previewPage !== -1 ? previewPage : currentPage
        const endPage = startPage - 2

        if (endPage >= 0) {
          this.$store.dispatch('setPreviewPage', endPage)
        }
      }

      if (e.code === 'ArrowRight') {
        const startPage = previewPage !== -1 ? previewPage : currentPage
        const endPage = startPage + 1

        if (endPage <= maxPage) {
          this.$store.dispatch('setPreviewPage', endPage)
        }
      }

      if (e.code === 'ArrowDown') {
        const startPage = previewPage !== -1 ? previewPage : currentPage
        const endPage = startPage + 2

        if (endPage <= maxPage) {
          this.$store.dispatch('setPreviewPage', endPage)
        }
      }

      if (e.code === 'ArrowLeft') {
        const startPage = previewPage !== -1 ? previewPage : currentPage
        const endPage = startPage - 1

        if (endPage >= 0) {
          this.$store.dispatch('setPreviewPage', endPage)
        }
      }

      if (e.code === 'Enter') {
        if (!this.openPageBlocked) {
          this.openPage()
        }
      }
    }
    window.addEventListener('keyup', this.keyListener)
  },
  unmounted () {
    window.removeEventListener('keyup', this.keyListener)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/css/_variables.scss';
.pagesRow {
   border-bottom: $lightBorder;
}
</style>
