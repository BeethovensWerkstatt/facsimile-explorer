<template>

  <div class="modal modal-lg" :class="{ active }" id="assign-svgs-modal">
    <a href="#close" @click="closeModal()" class="modal-overlay" aria-label="Close"></a>
    <div class="modal-container">
      <div class="modal-header">
        <a href="#close" @click="closeModal()" class="btn btn-clear float-right" aria-label="Close"></a>
        <div class="modal-title h5">Assign SVGs</div>
      </div>
      <div class="modal-body">
        <div class="content">
          <div>
            <h1>Pages</h1>
            <table class="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Page</th>
                  <th>SVG available</th>
                  <th>release date</th>
                </tr>
              </thead>
              <tbody>
                <tr class="active">
                  <td>The Shawshank Redemption</td>
                  <td>Crime, Drama</td>
                  <td>14 October 1994</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <div class="btn-group">
          <button class="btn btn-primary" @click="closeModal()">Close</button>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
export default {
  name: 'AssignSVGsModal',
  components: {

  },
  methods: {
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
    },
    closeModal () {
      this.$store.dispatch('setModal', null)
    }
  },
  computed: {
    active () {
      return this.$store.getters.modal === 'assignSVGs'
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
    }
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
