<template>
  <div class="sliderInput">
    {{ label }}
    <input ref="slider"
      class="simplifiedSlider"
      type="number"
      v-model.lazy="data"
      :min="min"
      :max="max"
      :step="step"
      :style="{ background: 'linear-gradient(to right, #999 ' + percent + '%, #ccc ' + percent + '%)'}"/>
  </div>
</template>

<script>
export default {
  name: 'SliderInput',
  props: {
    label: String,
    getterName: String,
    setterName: String,
    min: Number,
    max: Number,
    step: Number
  },
  components: {
    // OpenSeadragonComponent
  },
  methods: {
    //
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

.sliderInput {
  display: inline-block;
  position: relative;

}
.simplifiedSlider {
  width: 3em;
  text-align: center;
  border: $lightBorder;
  border-radius: 3px;
  line-height: .8rem;
  margin: .05rem .3rem;
  padding: 0 .2rem;
  font-size: .7rem;
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
