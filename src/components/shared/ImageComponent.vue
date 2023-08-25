<template>
  <div class="imageComponent">
    <img :src="imagesrc" />
  </div>
</template>

<script>
export default {
  name: 'ImageComponent',
  computed: {
    imagesrc () {
      // TODO calc IIIF Url for image fragment
      return 'https://edirom-images.beethovens-werkstatt.de/Scaler/IIIF/D-BNba_HCB_Mh_60%2FHCB_Mh_60_05.jpg/full/full/1/default.jpg'
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/css/_variables.scss';
.imageComponent {
  margin: .5rem;
  padding: .5rem;
  border: $lightBorder;
  border-radius: .3rem;
  background-color: #ffffff;
  box-shadow: 0 0 .3rem #00000066 inset;
  max-height: calc(100% - 1rem);
  overflow: auto;

  img {
    width: 100%;
  }
}
</style>
