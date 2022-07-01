<template>
  <div id="explorer">
    <OpenSeadragonNavigator/>
  </div>
</template>

<script>
import OpenSeadragonNavigator from '@/components/OpenSeadragonNavigator.vue'

export default {
  name: 'ExplorerForm',
  components: {
    OpenSeadragonNavigator
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
#explorer {

}
</style>
