<template>

   <div>
     <div class="rastrumListing">
       <div v-for="(rastrum, i) in rastrumsOnCurrentPage"
         class="rastrumEntry"
         :class="{active: rastrum.id === activeSystemId}"
         :key="i"
         @click="setActiveRastrum(rastrum.id)">
         <span class="rastrumNumber">{{ i + 1 }}</span>
         <template v-if="currentPageDimensions !== null">
           <SliderInput label="X" :val="rastrum.x" setterName="setActiveSystemX" :min="0" :max="currentPageDimensions.wwWidth" :step="0.1"/>
           <SliderInput label="Y" :val="rastrum.y" setterName="setActiveSystemY" :min="0" :max="currentPageDimensions.mmHeight" :step="0.1"/>
           <SliderInput label="W" :val="rastrum.w" setterName="setActiveSystemW" :min="0" :max="currentPageDimensions.mmWidth" :step="0.1"/>
           <SliderInput label="H" :val="rastrum.h" setterName="setActiveSystemH" :min="0" :max="currentPageDimensions.mmHeight" :step="0.1"/>
           <SliderInput label="°" :val="rastrum.rotate" setterName="setActiveSystemRotate" :min="-180" :max="180" :step="0.1"/>
         </template>
       </div>
     </div>
     <button class="addSystem btn btn-sm" @click="addRastrum">Add System</button>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import SliderInput from '@/components/SliderInput.vue'
import { suggestRastrum } from '@/tools/facsimileHelpers.js'

export default {
  name: 'RastrumListing',
  components: {
    SliderInput
  },
  methods: {
    /* closeModal () {
      this.$store.dispatch('setModal', null)
    } */
    addRastrum () {
      const rastrum = suggestRastrum(this.$store.getters)
      this.$store.dispatch('addSystem', rastrum)
    },
    setActiveRastrum (id) {
      this.$store.dispatch('setActiveSystem', id)
    }
  },
  computed: {
    ...mapGetters(['rastrumsOnCurrentPage',
      'currentPageDimensions',
      'activeSystemId']) /* ,
    activeRastrum () {
      return 'asd'
    } */
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/css/_variables.scss';

.rastrumEntry {
  padding: .1rem 0 .1rem .5rem;
  border-radius: .2rem;

  &:nth-child(even) {
    background: $mainBackgroundColor;
  }

  & + .rastrumEntry {
    margin: .2rem 0 0 0;
  }

  &.active {
    background-color: $activeHighlightColor;
  }

  .rastrumNumber {
    width: 1.2rem;
    font-weight: bold;
    text-align: right;
    display: inline-block;
    margin: 0 .4rem 0 0;
    padding: 0 .4rem 0 0;
    border-right: 1px solid #666666;
  }
}

.addSystem.btn {
  margin: .3rem 0 0 0;
}

</style>
