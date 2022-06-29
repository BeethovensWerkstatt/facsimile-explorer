<template>
  <div class="container">
    <div class="buttons">
      <div class="osdBtn" id="zoomHome"><i class="icon icon-photo"></i></div>
      <div class="osdBtn" id="zoomIn"><i class="icon icon-plus"></i></div>
      <div class="osdBtn" id="zoomOut"><i class="icon icon-minus"></i></div>
      <div class="osdBtn" id="pageLeft"><i class="icon icon-arrow-left"></i></div>
      <div class="osdBtn" id="pageRight"><i class="icon icon-arrow-right"></i></div>
    </div>
    <div id="openSeadragonNavigator">

    </div>
  </div>
</template>

<script>
export default {
  name: 'OpenSeadragonNavigator',
  props: {
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/css/_variables.scss';

.container {
  height: 125px;
  width: 100%;
  display: flex;
  flex-direction: row;
  border-bottom: $lightBorder;
  background: linear-gradient(to bottom, $mainBackgroundColor 0%, darken($mainBackgroundColor, 20%) 100%);

  .buttons {
    flex: none;
    width: 40px;
    .osdBtn {
      width: 24px;
    }
  }

  #openSeadragonNavigator {
    flex: 1;
    width: 100%;
    height: 100%;
  }
}

</style>
