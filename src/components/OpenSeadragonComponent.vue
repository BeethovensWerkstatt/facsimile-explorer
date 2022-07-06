<template>
  <div id="osdContainer">

  </div>
</template>

<script>
import OpenSeadragon from 'openseadragon'
import * as Annotorious from '@recogito/annotorious-openseadragon'
import '@recogito/annotorious-openseadragon/dist/annotorious.min.css'

export default {
  name: 'OpenSeadragonComponent',
  props: {
  },
  methods: {
    clickSystemListener (e) {
      const n = e.target.getAttribute('data-n')
      console.log('clicked system ' + n)
      this.$store.dispatch('selectSystemOnCurrentPage', n)
    },
    doubleClickSystemListener (e) {
      const n = e.target.getAttribute('data-n')
      console.log('doubleClicked system ' + n)
      this.$store.dispatch('editSystemOnCurrentPage', n)
    },
    renderShapes () {
      const svg = this.$store.getters.svgOnCurrentPage
      const page = this.$store.getters.page(this.$store.getters.currentPageZeroBased)

      // only relevant before component is mounted
      if (this.viewer === undefined) {
        return null
      }
      console.log('rendering shapes')
      this.viewer.addOverlay({
        element: svg,
        x: 0,
        y: 0,
        width: page.width,
        height: page.height
      })
      /* if (svg !== null) {
        const width = 3727
        const height = 3021
        const factor = width / height

        const element = document.createElement('div')
        element.classList.add('fullSizeOverlay')
        element.appendChild(svg)
        this.viewer.addOverlay({
          element,
          px: 0,
          py: 0,
          width: 1,
          height: 1 / factor
        })
      }
      const world = this.viewer.world

      if (world.getItemCount() > 0) {
        this.viewer.addOverlay({
          element: svg,
          placement: OpenSeadragon.Placement.TOP_LEFT,
          location: this.viewer.world.getItemAt(0).getBounds()
        })
     } */
    },
    renderSystems () {
      const systems = this.$store.getters.systemsOnCurrentPage
      const page = this.$store.getters.page(this.$store.getters.currentPageZeroBased)

      // only relevant before component is mounted
      if (this.viewer === undefined) {
        return null
      }

      // const width = page.width
      // const height = page.height
      // const factor = height / width

      /* 3021

      310  2711
      518  2503
      721  2300
      916  2105
      1115 1906
      1308 1713
      1500 1521
      1689 1332
      1885 1136
      2077 944
      2268 753
      2469 552 */

      systems.forEach((system, i) => {
        console.log(system)
        const overlay = document.createElement('div')
        overlay.classList.add('system')
        overlay.setAttribute('title', i + 1)
        overlay.setAttribute('data-n', i)
        overlay.addEventListener('click', this.clickSystemListener)
        overlay.addEventListener('dblclick', this.doubleClickSystemListener)
        this.viewer.addOverlay({
          element: overlay,
          x: system.left,
          y: system.top,
          width: system.right - system.left,
          height: page.height / 30
        })
      })
    }
  },
  mounted: function () {
    this.viewer = OpenSeadragon({
      id: 'osdContainer',
      preserveViewport: false,
      visibilityRatio: 0.8,
      sequenceMode: true,
      showNavigator: true,
      navigatorId: 'openSeadragonNavigator',
      homeButton: 'zoomHome',
      zoomInButton: 'zoomIn',
      zoomOutButton: 'zoomOut',
      previousButton: 'pageLeft',
      nextButton: 'pageRight'
    })

    const annotoriousConfig = {
      disableEditor: true
    }
    // Initialize the Annotorious plugin
    this.anno = Annotorious(this.viewer, annotoriousConfig)
    this.anno.setVisible(false)
    this.anno.readOnly = true

    // Listener for new Selections
    this.anno.on('createSelection', (a) => {
      // console.log('created selection:', a)
      // xywh=pixel:647.4000244140625,802,1304.3333740234375,199.3333740234375
      const raw = a.target.selector.value.substr(11).split(',')
      const xywh = {
        x: Math.round(raw[0]),
        y: Math.round(raw[1]),
        w: Math.round(raw[2]),
        h: Math.round(raw[3])
      }
      this.$store.dispatch('setSelectionRect', xywh)
    })

    // Listener for changing selections
    this.anno.on('changeSelectionTarget', (a) => {
      // console.log('changed selection:', a)
      const raw = a.selector.value.substr(11).split(',')
      const xywh = {
        x: Math.round(raw[0]),
        y: Math.round(raw[1]),
        w: Math.round(raw[2]),
        h: Math.round(raw[3])
      }
      this.$store.dispatch('setSelectionRect', xywh)
    })

    const pages = this.$store.getters.pageArrayOSD
    if (pages.length > 0) {
      this.viewer.open(pages)
      this.$store.dispatch('setCurrentPage', 0)
      this.renderSystems()
      this.renderShapes()
    }

    this.viewer.addHandler('page', (data) => {
      // remove listeners
      document.querySelectorAll('#osdContainer .system').forEach(system => {
        system.removeEventListener('click', this.clickSystemListener)
        system.removeEventListener('dbllick', this.doubleClickSystemListener)
      })

      if (data.page !== this.$store.getters.currentPageZeroBased) {
        this.$store.dispatch('setCurrentPage', data.page)
        this.renderSystems()
        this.renderShapes()
      }
    })

    this.unwatchSelectionRectEnabled = this.$store.watch((state, getters) => getters.selectionRectEnabled,
      (newBool, oldBool) => {
        this.anno.setVisible(newBool)
        this.anno.readOnly = !newBool
      })

    this.unwatchCurrentPage = this.$store.watch((state, getters) => getters.currentPageZeroBased,
      (newPage, oldPage) => {
        this.viewer.goToPage(newPage)
      })

    this.unwatchPages = this.$store.watch((state, getters) => getters.pageArray,
      (newArr, oldArr) => {
        this.viewer.open(newArr)
        this.$store.dispatch('setCurrentPage', 0)
        this.renderSystems()
        this.renderShapes()
      })

    this.unwatchSVG = this.$store.watch((state, getters) => getters.svgOnCurrentPage,
      (svg) => {
        if (svg !== null) {
          this.renderShapes()
        }
        // this.viewer.open(newArr)
      })

    // const svg = this.$store.getters.svgOnCurrentPage

    this.unwatchSystems = this.$store.watch((state, getters) => getters.systemsOnCurrentPage,
      (newArr, oldArr) => {
        this.renderSystems()
      })
  },
  beforeUnmount () {
    this.unwatchPages()
    this.unwatchSVG()
    this.unwatchSystems()
    this.unwatchCurrentPage()
    this.unwatchSelectionRectEnabled()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
#osdContainer {
  width: 100%;
  height: 100%;

  .system {
     background-color: #ffffff33;
  }

  .fullSizeOverlay {
    svg {
      width: 100%;
      height: 100%;
   }
  }
}
</style>
