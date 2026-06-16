<template>
  <div class="diploTabMenu">
    <!--
    <div class="entry right">
      <div class="cancel button" title="Cancel [Esc]">⛌</div>
      <label>Next</label>
      <div class="value" :title="stateTitle">{{ stateLabel }}</div>
    </div>
    -->
    <div class="entry">
      <label>Cleanup</label>
      <div class="value string button" @click="$store.dispatch('removeOrphanCorresps')" title="Remove orphan corresp attributes">&#129529;</div>
    </div>
    <div class="entry" v-if="elementId">
      <label>close</label>
      <div class="value string button" @click="$store.dispatch('setActiveDiploTransElementId', null)">X</div>
    </div>
    <div class="entry" v-if="elementId">
        <label>@xml:id</label>
        <div class="value string">{{elementId}}</div>
    </div>
    <div class="entry" v-if="elementId && !isCurve && !isDeletion && !isUnclear">
        <label>@x</label>
        <div class="value">
            <SliderInput label="" getterName="activeDiploTransElementAttValue" idParam="x" setterName="setActiveDiploTransElementAttValue" :min="0" :max="pageWidth" :step="1"/>
        </div>
    </div>
    <div class="entry" v-if="hasAdjustableY">
        <label>@y</label>
        <div class="value">
            <SliderInput label="" getterName="activeDiploTransElementAttValue" idParam="y" setterName="setActiveDiploTransElementAttValue" :min="-30" :max="50" :step="1"/>
        </div>
    </div>
    <div class="entry" v-if="hasAdjustableX2">
        <label>@x2</label>
        <div class="value">
            <SliderInput label="" getterName="activeDiploTransElementAttValue" idParam="x2" setterName="setActiveDiploTransElementAttValue" :min="0" :max="pageWidth" :step="1"/>
        </div>
    </div>
    <div class="entry" v-if="hasAdjustableWidth">
        <label>@width</label>
        <div class="value">
            <SliderInput label="" getterName="activeDiploTransElementAttValue" idParam="width" setterName="setActiveDiploTransElementAttValue" :min="0" :max="pageWidth" :step="1"/>
        </div>
    </div>
    <div class="entry" v-if="hasAdjustableY2">
        <label>@y2</label>
        <div class="value">
            <SliderInput label="" getterName="activeDiploTransElementAttValue" idParam="y2" setterName="setActiveDiploTransElementAttValue" :min="0" :max="pageWidth" :step="1"/>
        </div>
    </div>
    <div class="entry" v-if="maySwapYandY2">
        <label>swap y/y2</label>
        <div class="value string button" :onClick="swapActiveDiploTransElementYandY2" title="swap y and y2">&#8645;</div>
    </div>
    <div class="entry" v-if="isHairpin">
        <label>@opening</label>
        <div class="value">
            <SliderInput label="" getterName="activeDiploTransElementAttValue" idParam="opening" setterName="setActiveDiploTransElementAttValue" :min="0" :max="60" :step="1"/>
        </div>
    </div>
    <div class="entry" v-if="isHairpin">
        <label>@bw:start.opening</label>
        <div class="value">
            <SliderInput label="" getterName="activeDiploTransElementAttValue" idParam="bw:start.opening" setterName="setActiveDiploTransElementAttValue" :min="0" :max="60" :step="1"/>
        </div>
    </div>
    <div class="entry" v-if="hasAdjustableLoc">
        <label>@loc</label>
        <div class="value">
            <SliderInput label="" getterName="activeDiploTransElementAttValue" idParam="loc" setterName="setActiveDiploTransElementAttValue" :min="-10" :max="25" :step="1"/>
        </div>
    </div>
    <div class="entry" v-if="isNote || isChord">
        <label>@stem.len</label>
        <div class="value" v-if="hasStemLen">
            <SliderInput label="" getterName="activeDiploTransElementAttValue" idParam="stem.len" setterName="setActiveDiploTransElementAttValue" :min="0" :max="25" :step="1" :readOnly="false"/>
        </div>
        <div class="value string button" :onClick="initStemLen" v-else>add attribute</div>
    </div>
    <div class="entry" v-if="isDir">
        <label>@lineheight</label>
        <div class="value" v-if="hasLineheight">
            <SliderInput label="" getterName="activeDiploTransElementAttValue" idParam="lineheight" setterName="setActiveDiploTransElementAttValue" :min="0.5" :max="100" :step="0.5" :readOnly="false"/>
        </div>
        <div class="value string button" :onClick="initLineheight" v-else>add attribute</div>
    </div>
    <div class="entry" v-if="isDir">
        <label>@rotation</label>
        <div class="value" v-if="hasRotation">
            <SliderInput label="" getterName="activeDiploTransElementAttValue" idParam="rotation" setterName="setActiveDiploTransElementAttValue" :min="-180" :max="180" :step="1" :readOnly="false"/>
        </div>
        <div class="value string button" :onClick="initRotation" v-else>add attribute</div>
    </div>
    <div class="entry" v-if="elementId">
      <label>unclear</label>
      <div class="value">
        <input :checked="unclearFunc" @change="unclearFunc = !unclearFunc" type="checkbox"/>
      </div>
    </div>
    <div class="entry" v-if="elementId">
      <label>unlink</label>
      <div class="value string button" :onClick="removeDTElement" title="remove DT element">&#x2702;</div>
    </div>
    <!-- <div class="entry" :onClick="test">Push</div> -->
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
    initLineheight () {
      this.$store.dispatch('setActiveDiploTransElementAttValue', { id: 'lineheight', value: 6 })
    },
    initRotation () {
      this.$store.dispatch('setActiveDiploTransElementAttValue', { id: 'rotation', value: 0 })
    },
    swapActiveDiploTransElementYandY2 () {
      const y = this.$store.getters.activeDiploTransElementAttValue('y')
      const y2 = this.$store.getters.activeDiploTransElementAttValue('y2')
      this.$store.dispatch('setActiveDiploTransElementAttValue', { id: 'y', value: y2 })
      this.$store.dispatch('setActiveDiploTransElementAttValue', { id: 'y2', value: y })
    },
    removeDTElement () {
      if (confirm('Do you relly want to delete the selected DT element?\nThis cannot be undone!')) {
        this.$store.dispatch('removeDTElement')
      }
    },
    test () {
      // const doc = this.$store.getters.documentByPath(this.filePath)
      // console.log('got doc: \n', doc)
    }
  },
  computed: {
    diploTransState () {
      return this.$store.getters.diploTransState
    },
    stateLabel () {
      const state = this.diploTransState
      // console.log('773: ' + state + ' – ' + this.$store.getters.diploTransState)
      if (state === 'awaitStart') {
        return 'Select Shape in Facsimile'
      } else if (state === 'awaitAT') {
        return 'Select from Annotated Transcription'
      } else {
        return 'Modify Diplomatic Transcription'
      }
    },
    stateTitle () {
      const state = this.diploTransState
      if (state === 'awaitStart') {
        return 'Select Shape in Facsimile'
      } else if (state === 'awaitAT') {
        return 'Select from Annotated Transcription'
      } else {
        return 'Modify Diplomatic Transcription or select new shape in Facsimile'
      }
    },
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
    isAccid () {
      return this.$store.getters.activeDiploTransElementName === 'accid'
    },
    isChord () {
      return this.$store.getters.activeDiploTransElementName === 'chord'
    },
    isRest () {
      return this.$store.getters.activeDiploTransElementName === 'rest'
    },
    isDot () {
      return this.$store.getters.activeDiploTransElementName === 'dot'
    },
    isBarLine () {
      return this.$store.getters.activeDiploTransElementName === 'barLine'
    },
    isDynam () {
      return this.$store.getters.activeDiploTransElementName === 'dynam'
    },
    isDir () {
      return this.$store.getters.activeDiploTransElementName === 'dir'
    },
    hasStemLen () {
      const elem = this.$store.getters.activeDiploTransElement
      return elem && elem.hasAttribute('stem.len')
      // const val = this.$store.getters.activeDiploTransElementAttValue('stem.len')
      // return val !== null
    },
    hasLineheight () {
      const elem = this.$store.getters.activeDiploTransElement
      return elem && elem.hasAttribute('lineheight')
      // const val = this.$store.getters.activeDiploTransElementAttValue('lineheight')
      // return val !== null
    },
    hasRotation () {
      const elem = this.$store.getters.activeDiploTransElement
      return elem && elem.hasAttribute('rotation')
      // const val = this.$store.getters.activeDiploTransElementAttValue('rotation')
      // return val !== null
    },
    isCurve () {
      return this.$store.getters.activeDiploTransElementName === 'curve'
    },
    isDeletion () {
      return this.$store.getters.activeDiploTransElementName === 'del'
    },
    isHairpin () {
      return this.$store.getters.activeDiploTransElementName === 'hairpin'
    },
    isUnclear () {
      return this.$store.getters.activeDiploTransElementName === 'unclear'
    },
    hasAdjustableLoc () {
      const elem = this.$store.getters.activeDiploTransElement
      return elem && elem.hasAttribute('loc')
    },
    hasAdjustableY () {
      const elem = this.$store.getters.activeDiploTransElement
      return elem && elem.hasAttribute('y')
      // const name = this.$store.getters.activeDiploTransElementName
      // return name === 'metaMark' || name === 'barLine' || name === 'dynam' || name === 'dir' || name === 'hairpin' || name === 'trill' || name === 'word' || name === 'tempo' || name === 'fing' || name === 'fermata' || name === 'octave' || name === 'line' || name === 'f' || name === 'artic' || name === 'num'
    },
    hasAdjustableX2 () {
      const elem = this.$store.getters.activeDiploTransElement
      return elem && elem.hasAttribute('x2')
      // const name = this.$store.getters.activeDiploTransElementName
      // return name === 'line' || name === 'barLine' || name === 'hairpin'
    },
    hasAdjustableY2 () {
      const elem = this.$store.getters.activeDiploTransElement
      return elem && elem.hasAttribute('y2')
      // const name = this.$store.getters.activeDiploTransElementName
      // return name === 'line' || name === 'barLine' || name === 'hairpin'
    },
    maySwapYandY2 () {
      const name = this.$store.getters.activeDiploTransElementName
      return name === 'line' || name === 'barLine'
    },
    hasAdjustableWidth () {
      const elem = this.$store.getters.activeDiploTransElement
      return elem && elem.hasAttribute('width')
      // const name = this.$store.getters.activeDiploTransElementName
      // return name === 'dir' || name === 'dynam' || name === 'word' || name === 'tempo' || name === 'octave'
    },
    unclearFunc: {
      get () {
        return this.$store.getters.get_DTelement_unclear(this.elementId)
      },
      set (unclear) {
        console.log(735, 'set unclearFunc:', unclear)
        if (!this.elementId) {
          console.warn('No active DT element to toggle unclear state for!')
          return
        }
        this.$store.dispatch('toggle_DTelement_unclear', { dtElemId: this.elementId })
      }
    }
  }
}
</script>

<style scoped lang="scss">
.diploTabMenu {
  background-color: #484848;
  color: white;
  padding: .1rem .5rem;
  min-height: 50.5px;

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

    .cancel {
      cursor: pointer;
      float: right;
      font-size: .7rem;
      &:hover {
        text-decoration: none;
      }
    }

    &.right {
      float: right;
    }
  }
}
</style>
