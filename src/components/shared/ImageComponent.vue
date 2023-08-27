<template>
  <div class="imageComponent">
    <img :src="uri" />
  </div>
</template>

<script>
export default {
  name: 'ImageComponent',
  props: {
    uri: String
  }
}
</script>

<style lang="scss" scoped>
@import '@/css/_variables.scss';
.imageComponent {
  margin: .5rem;
  border: $lightBorder;
  border-radius: .3rem;
  background-color: #ffffff;
  box-shadow: 0 0 .3rem #00000066 inset;
  // max-height: calc(100% - 1rem);
  overflow: auto;

  img {
    width: 100%;
    position: relative;
    top: .18rem;
  }
}
</style>
