<template>
  <div class="sidebar" :style="{ width: width }">
    <slot>
      {{ position }}
    </slot>
  </div>
</template>

<script>
// import { mapGetters } from 'vuex'

export default {
  name: 'SideBar',
  props: {
    position: String,
    width: {
      type: String,
      default: '150px'
    }
  },
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

.sidebar {
  float: left;
  height: 100%;
}
</style>
