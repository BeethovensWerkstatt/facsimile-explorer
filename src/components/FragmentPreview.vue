<template>
  <div class="fragmentPreview">
  </div>
</template>

<script>
export default {
  name: 'FragmentPreview',
  props: {

  },
  components: {
    // OpenSeadragonComponent
  },
  methods: {
    /* toggleSidebar () {
      this.$store.dispatch('togglePageTabSidebar')
    } */
  },
  computed: {
    percent () {
      const val = parseFloat(this.$store.getters[this.getterName])
      const dist = this.max - this.min
      const pos = val - this.min
      const percent = parseInt(100 / dist * pos)
      return percent
    },
    data: {
      get () {
        return parseFloat(this.$store.getters[this.getterName])
      },
      set (value) {
        this.$store.dispatch(this.setterName, value)
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/css/_variables.scss';

.fragmentPreview {

}

input[type="number"] {
  -webkit-appearance: textfield;
     -moz-appearance: textfield;
          appearance: textfield;
}
input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
  -webkit-appearance: none;
}
</style>
