<template>
  <div class="appHeader">
    Hallo
  </div>
</template>

<script>
export default {
  name: 'AppHeader',
  props: {
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/css/_variables.scss';

.appHeader {
  height: $appHeaderHeight;
}
</style>
