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
            <template v-if="allDocsLoaded">
              <DocumentOverviewRow
                v-for="r in maxRows"
                :key="r"
                :left="calcRowLeft(r)"
                :right="calcRowRight(r)"
              />
            </template>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <div v-if="allDocsLoaded && this.$store.getters.previewPageZeroBased >= 0" class="preview-info">
          <div>
            <div>
              Label: {{ previewLabel }}
            </div>
            <div>
              Width: {{ previewPage.width }}
            </div>
            <div>
              Height: {{ previewPage.height }}
            </div>
          </div>
          <div>
            <div class="info measureZones" :class="{ unavailable: !previewPage.hasZones }" :title="'Measure Zones' + ((!previewPage.hasZones) ? ' unavailable' : '')">
              <i class="icon icon-apps"></i>
            </div>
            <div class="info svgShapes" :class="{ unavailable: !previewPage.hasSvg }" :title="'SVG Shapes' + ((!previewPage.hasSvg) ? ' unavailable' : '')">
              <i class="icon icon-edit"></i>
              <button v-if="!previewPage.hasSvg" class="btn btn-link" @click="addSVG">add shapes ...</button>
            </div>
            <div class="info transcription" :class="{ unavailable: !previewPage.systems }" :title="'Transcription ' + (( !previewPage.systems ) ? 'un' : '') + 'available'">
              <span>♫</span>
            </div>
          </div>
        </div>
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
    calcRowLeft: (r) => ((r - 1) * 2 - 1),
    calcRowRight: (r) => ((r - 1) * 2),
    closeModal () {
      this.$store.dispatch('setModal', null)
    },
    openPage () {
      const previewPage = this.$store.getters.previewPageZeroBased
      this.$store.dispatch('setCurrentPage', previewPage)
      this.$store.dispatch('setModal', null)
    },
    addSVG () {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.svg'
      input.onchange = _this => {
        const [file] = Array.from(input.files)
        if (file) {
          const reader = new FileReader()
          reader.addEventListener('load', () => {
            // console.log('add SVG ...', reader.result)
            this.$store.dispatch('addSVGshapes', {
              svgstr: reader.result,
              page: this.previewPageNum
            })
          })
          reader.readAsText(file)
        }
      }
      input.click()
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
      return Math.floor(this.$store.getters.pageArray.length / 2) + 1
    },
    previewPageNum () {
      return this.$store.getters.previewPageZeroBased
    },
    previewPage () {
      const previewNum = this.previewPageNum

      if (previewNum === -1) {
        return {
          label: ''
        }
      }

      return this.$store.getters.page(previewNum)
    },
    previewLabel () {
      return this.previewPage.label
    },
    openPageBlocked () {
      const previewPage = this.$store.getters.previewPageZeroBased
      const currentPage = this.$store.getters.currentPageZeroBased

      return previewPage === -1 || previewPage === currentPage
    },
    allDocsLoaded () {
      return this.$store.getters.allDocsLoaded
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

.modal-footer {
  .preview-info {
    display: flex;
    width: 100%;
    div {
      width: 50%;
      text-align: left;

      font-size: .7rem;
      font-weight: 300;

      &.transcription {
         font-size: .9rem;
      }

      &.unavailable {
         color: #aaaaaa;
      }
    }
  }
}
</style>
