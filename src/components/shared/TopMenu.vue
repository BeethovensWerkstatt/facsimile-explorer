<template>
  <div class="topmenu">
    <slot/>
  </div>
</template>

<script>
// import { mapGetters } from 'vuex'

export default {
  name: 'TopMenu',
  components: {

  },
  methods: {

  },
  computed: {

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/css/_variables.scss';
.topmenu {
  background: linear-gradient(to bottom, lighten($mainBackgroundColor, 10%), darken($mainBackgroundColor, 1%));
  padding: .2rem .5rem;
  border-bottom: $lightBorder;
  // flex-grow: 1;
  height: 1.6rem;
}
</style>
