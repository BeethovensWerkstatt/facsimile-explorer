<template>
  <div id="osdContainer">

  </div>
</template>

<script>
import OpenSeadragon from 'openseadragon'
export default {
  name: 'OpenSeadragonComponent',
  props: {
  },
  mounted: function () {
    this.viewer = OpenSeadragon({
      id: 'osdContainer',
      preserveViewport: false,
      visibilityRatio: 0.8,
      minZoomLevel: 0.4,
      defaultZoomLevel: 1,
      maxZoomPixelRatio: 5,
      sequenceMode: true,
      showNavigator: true,
      navigatorId: 'openSeadragonNavigator',
      homeButton: 'zoomHome',
      zoomInButton: 'zoomIn',
      zoomOutButton: 'zoomOut',
      previousButton: 'pageLeft',
      nextButton: 'pageRight'
    })

    const pages = this.$store.getters.pageArray
    if (pages.length > 0) {
      this.viewer.open(pages)
      this.$store.dispatch('setCurrentPage', 0)
    }

    this.viewer.addHandler('page', (data) => {
      this.$store.dispatch('setCurrentPage', data.page)
      const svg = this.$store.getters.svgOnCurrentPage

      if (svg !== null) {
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
    })

    this.unwatchPages = this.$store.watch((state, getters) => getters.pageArray,
      (newArr, oldArr) => {
        console.log('something happens over here…')
        this.viewer.open(newArr)
        this.$store.dispatch('setCurrentPage', 0)
      })

    this.unwatchSVG = this.$store.watch((state, getters) => getters.svgOnCurrentPage,
      (svg) => {
        if (svg !== null) {
          console.log('svg ' + typeof svg)
          console.log(svg)
          const world = this.viewer.world

          if (world.getItemCount() > 0) {
            this.viewer.addOverlay({
              element: svg,
              placement: OpenSeadragon.Placement.TOP_LEFT,
              location: this.viewer.world.getItemAt(0).getBounds()
            })
          }
        }
        // this.viewer.open(newArr)
      })

    // const svg = this.$store.getters.svgOnCurrentPage

    this.unwatchSystems = this.$store.watch((state, getters) => getters.systemsOnCurrentPage,
      (newArr, oldArr) => {
        newArr.forEach(system => {
          console.log(system)
          const overlay = document.createElement('div')
          overlay.classList.add('system')
          this.viewer.addOverlay({
            element: overlay,
            placement: OpenSeadragon.Placement.BOTTOM_LEFT,
            location: new OpenSeadragon.Rect(system.x, system.y, system.width, system.height)
          })
        })
      })
  },
  beforeUnmount () {
    this.unwatchPages()
    this.unwatchSystems()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
#osdContainer {
  width: 100%;
  height: 100%;

  .system {
     background-color: #ff000066;
  }

  .fullSizeOverlay {
    svg {
      width: 100%;
      height: 100%;
   }
  }
}
</style>
