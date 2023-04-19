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
            <table class="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Page</th>
                  <th>SVG available</th>
                </tr>
              </thead>
              <tbody>
                <tr class="active">
                  <td>{{ previewLabel }}</td>
                  <td>{{ previewHasSVG }}</td>
                </tr>
              </tbody>
            </table>
            <!-- <img :src="previewPage.uri + '/full'" /> -->
            <div id="previewOsdContainer"></div>
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
import OpenSeadragon from 'openseadragon'

const osdOptions = {
  id: 'previewOsdContainer',
  preserveViewport: false,
  visibilityRatio: 0.8,
  sequenceMode: true,
  showNavigator: false,
  // navigatorId: 'openSeadragonNavigator',
  homeButton: 'zoomHome',
  zoomInButton: 'zoomIn',
  zoomOutButton: 'zoomOut',
  previousButton: 'pageLeft',
  nextButton: 'pageRight',
  gestureSettingsMouse: {
    clickToZoom: false
  },
  silenceMultiImageWarnings: true
}

export default {
  name: 'AssignSVGsModal',
  data: () => ({
    viewer: null
  }),
  mounted () {
    this.viewer = new OpenSeadragon(osdOptions)
    // this.setOSDPreview()
  },
  watch: {
    active () {
      if (this.active) {
        this.setOSDPreview()
      }
    }
  },
  components: {

  },
  methods: {
    setOSDPreview () {
      if (this.ti) {
        this.ti.destroy()
        this.ti = null
      }
      if (this.previewPage.uri && this.viewer) {
        console.log(this.previewPage.uri)
        this.viewer.open([this.previewPage.uri])
      }
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
      return this.$store.getters.pages
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
    previewHasSVG () {
      return this.previewPage.hasSVG ? 'yes' : 'no'
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

.modal-body {
  img {
    width: 100%;
  }
  #previewOsdContainer {
    width: 100%;
    height: 100%;
    min-height: calc(100vh - 3rem);
  }
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
