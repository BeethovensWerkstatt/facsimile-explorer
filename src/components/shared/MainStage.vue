<template>
  <div class="mainStage">
    <slot/>
  </div>
</template>

<script>
// import { mapGetters } from 'vuex'

export default {
  name: 'MainStage',
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

.mainStage {
  background: linear-gradient(to bottom, $mainBackgroundColor, darken($mainBackgroundColor, 30%));
}

</style>
