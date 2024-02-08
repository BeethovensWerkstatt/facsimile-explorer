<template>
  <div class="diploTabMenu">
    <div class="entry">
        <label>@xml:id</label>
        <div class="value string">{{elementId}}</div>
    </div>
    <div class="entry">
        <label>@coord.x1</label>
        <div class="value">
            <SliderInput label="" getterName="activeDiploTransElementAttValue" idParam="coord.x1" setterName="setActiveDiploTransElementAttValue" :min="0" :max="pageWidth" :step="1"/>
        </div>
    </div>
    <div class="entry" v-if="isNote">
        <label>@loc</label>
        <div class="value">
            <SliderInput label="" getterName="activeDiploTransElementAttValue" idParam="loc" setterName="setActiveDiploTransElementAttValue" :min="-10" :max="25" :step="1"/>
        </div>
    </div>
    <div class="entry" v-if="isNote">
        <label>@stem.len</label>
        <div class="value" v-if="hasStemLen">
            <SliderInput label="" getterName="activeDiploTransElementAttValue" idParam="stem.len" setterName="setActiveDiploTransElementAttValue" :min="0" :max="25" :step="1" :readOnly="false"/>
        </div>
        <div class="value string button" :onClick="initStemLen" v-else>add attribute</div>
    </div>
    <div class="entry" :onClick="test">Push</div>
  </div>
</template>

<script>
import SliderInput from '@/components/SliderInput.vue'

export default {
  name: 'DiploTabMenu',
  props: {
    filePath: String,
    id: String
  },
  components: {
    SliderInput
  },
  methods: {
    initStemLen () {
      this.$store.dispatch('setActiveDiploTransElementAttValue', { id: 'stem.len', value: 8 })
    },
    test () {
      const doc = this.$store.getters.documentByPath(this.filePath)
      console.log('got doc: \n', doc)
    }
  },
  computed: {
    elementId () {
      return this.$store.getters.activeDiploTransElementId
    },
    pageWidth () {
      const width = this.$store.getters.currentPageDetails?.mmWidth
      if (!width) {
        return 1000
      }
      return parseFloat(width)
    },
    isNote () {
      return this.$store.getters.activeDiploTransElementName === 'note'
    },
    isRest () {
      return this.$store.getters.activeDiploTransElementName === 'rest'
    },
    hasStemLen () {
      const val = this.$store.getters.activeDiploTransElementAttValue('stem.len')
      return val !== null
    }
  }
}
</script>

<style scoped lang="scss">
.diploTabMenu {
  background-color: #484848;
  color: white;
  padding: .1rem .5rem;

  .entry {
    display: inline-block;
    margin: 0 1rem 0 0;
    vertical-align: top;
    label {
      font-size: .6rem;
      color: #999999;
      font-weight: bold;
      margin: 0;
      padding: 0;
      text-shadow: 1px 1px 2px #000000;
    }
    .value {
      font-size: .7rem;
      color: #ffffff;
      font-weight: 100;
      margin: 0;
      padding: 0;
      line-height: .6rem;
      text-shadow: 1px 1px 2px #000000;

      &.string {
        margin-top: .2rem;
      }
    }

    .button {
      cursor: pointer;
      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
