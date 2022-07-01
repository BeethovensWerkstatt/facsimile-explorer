<template>
  <div class="container">
    <div class="buttons">
      <div class="osdBtn" id="zoomHome"><i class="icon icon-photo"></i></div>
      <div class="osdBtn" id="zoomIn"><i class="icon icon-plus"></i></div>
      <div class="osdBtn" id="zoomOut"><i class="icon icon-minus"></i></div>
      <div class="osdBtn" id="pageLeft"><i class="icon icon-arrow-left"></i></div>
      <div class="osdBtn" id="pageRight"><i class="icon icon-arrow-right"></i></div>
    </div>
    <div class="osdNavBox">
      <div id="openSeadragonNavigator"></div>
    </div>
    <div class="featureInfos">
      <div class="feature" :class="{missing: !hasSvg}">SVG</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OpenSeadragonNavigator',
  computed: {
    hasSvg () {
      const svg = this.$store.getters.svgOnCurrentPage
      return svg !== null
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/css/_variables.scss';

$navigatorHeight: 125px;
$navigatorMargin: 5px;

.container {
  height: $navigatorHeight;
  width: 100%;
  display: flex;
  flex-direction: row;
  border-bottom: $lightBorder;
  background: linear-gradient(to bottom, $mainBackgroundColor 0%, darken($mainBackgroundColor, 20%) 100%);

  .buttons {
    flex: none;
    flex-shrink: none;
    width: 40px;
    .osdBtn {
      width: 24px;
    }
  }

  .osdNavBox {
    flex: 1;
    height: calc($navigatorHeight - ( 2 * $navigatorMargin));
    margin: $navigatorMargin;
    position:relative;
    max-width: calc(100% - 100px);

    #openSeadragonNavigator {
      width: 100%;
      height: 100%;
    }
  }

  .featureInfos {
    flex: none;
    flex-shrink: none;
    width: 40px;

    .feature {
      font-weight: 500;
      color: $darkFontColor;
      text-align: right;
      position: relative;

      &.missing {
         font-weight: 100;
         cursor: pointer;
         &:before {
            content: "";
            width: 100%;
            border-bottom: .5px solid #333;
            position: absolute;
            bottom: 11px;
            left: 4px;
            rotate: -10deg;
         }
      }
    }
  }
}

</style>
