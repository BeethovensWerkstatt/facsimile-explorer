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
      preserveViewport: true,
      visibilityRatio: 1,
      minZoomLevel: 1,
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

    this.unwatch = this.$store.watch((state, getters) => getters.pageArray,
      (newArr, oldArr) => {
        this.viewer.open(newArr)
        this.$store.dispatch('setCurrentPage', 0)
      })
  },
  beforeUnmount () {
    this.unwatch()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
#osdContainer {
  width: 100%;
  height: 100%;
}
</style>
