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
      :disabled="disabled"
      :style="{ background: 'linear-gradient(to right, #999 ' + percent + '%, #ccc ' + percent + '%)'}"/>
  </div>
</template>

<script>
// inspired by https://kilianvalkhof.com/2020/javascript/supercharging-input-type-number/

export default {
  name: 'SliderInput',
  props: {
    label: String,
    getterName: String,
    setterName: String,
    min: Number,
    max: Number,
    step: Number,
    idParam: String,
    val: Number,
    readOnly: { type: Boolean, default: false }
  },
  components: {
    // OpenSeadragonComponent
  },
  methods: {
    changeFunc (e) {
      /* const isMac = navigator.platform === 'MacIntel';

      document.querySelector("input").addEventListener("keydown", e => {
        if (['ArrowUp','ArrowDown'].includes(e.key)) {
          e.preventDefault();

          const currentValue = isNaN(parseFloat(e.target.value))
            ? parseFloat(e.target.getAttribute("min")) || 0
            : parseFloat(e.target.value);

          const direction = e.key === 'ArrowUp' ? 1 : -1

          const modifier = (isMac ? e.metaKey : e.ctrlKey) ? 100 : e.shiftKey ? 10 : e.altKey ? 0.1 : 1;

          const decimals = Math.max(
            (currentValue.toString().split(".")[1] || "").length,
            e.altKey ? 1 : 0
          );

          const newValue = currentValue + direction * modifier;

          e.target.value = newValue.toFixed(decimals);
        }
      }) */
    }
  },
  computed: {
    percent () {
      let val

      try {
        if (this.idParam === 'undefined') {
          val = parseFloat(this.$store.getters[this.getterName])
        } else {
          val = parseFloat(this.$store.getters[this.getterName](this.idParam))
        }
      } catch (e) {
        val = parseFloat(this.$store.getters[this.getterName])
      }
      const dist = this.max - this.min
      const pos = val - this.min
      const percent = parseInt(100 / dist * pos)
      return percent
    },
    disabled () {
      if (this.readOnly) {
        return this.readOnly
      }
      return this.data === null || isNaN(this.data)
    },
    data: {
      get () {
        try {
          // console.warn('----\nSliderInput\ngetterName: ', this.getterName, '\nidParam: ', this.idParam, '\nval: ', this.$store.getters[this.getterName](this.idParam))
          if (typeof this.getterName !== 'undefined' && typeof this.idParam !== 'undefined') {
            return parseFloat(this.$store.getters[this.getterName](this.idParam))
          } else if (typeof this.getterName !== 'undefined') {
            return parseFloat(this.$store.getters[this.getterName])
          } else if (typeof this.val !== 'undefined') {
            return parseFloat(this.val)
          } else {
            return parseFloat(this.$store.getters[this.getterName](this.idParam))
          }
        } catch (e) {
          // console.error('----E: ' + this.getterName + '\n', e)
          return parseFloat(this.$store.getters[this.getterName])
        }
      },
      set (value) {
        if (typeof this.idParam === 'undefined') {
          this.$store.dispatch(this.setterName, value)
        } else {
          this.$store.dispatch(this.setterName, { id: this.idParam, value })
        }
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
  width: 3.6em;
  text-align: center;
  border: $lightBorder;
  border-radius: 3px;
  line-height: .8rem;
  margin: .05rem .5rem .05rem 0;
  padding: 0 .2rem;
  font-size: .7rem;
  position: relative;
  top: -1px;
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
