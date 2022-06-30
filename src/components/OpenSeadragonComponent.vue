<template>
  <div id="osdContainer">

  </div>
</template>

<script>
import OpenSeadragon from 'openseadragon'
console.log('123')
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
      sequenceMode: true,
      showNavigator: true,
      navigatorId: 'openSeadragonNavigator',
      homeButton: 'zoomHome',
      zoomInButton: 'zoomIn',
      zoomOutButton: 'zoomOut',
      previousButton: 'pageLeft',
      nextButton: 'pageRight'
    })

    this.viewer.addHandler('page', (data) => {
      this.$store.dispatch('setCurrentPage', data.page)
    })

    this.unwatchPages = this.$store.watch((state, getters) => getters.pageArray,
      (newArr, oldArr) => {
        this.viewer.open(newArr)
        this.$store.dispatch('setCurrentPage', 0)
      })

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
}
</style>
