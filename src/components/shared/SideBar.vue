<template>
  <div class="sidebar">
    {{ position }}
  </div>
</template>

<script>
// import { mapGetters } from 'vuex'

export default {
  name: 'SideBar',
  props: {
    position: String
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

</style>
