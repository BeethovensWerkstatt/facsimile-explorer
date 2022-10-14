<template>
  <div class="shapeCataloguer">
     <div class="verticalTabContent"></div>
     <div class="verticalTab" :class="{active: activeTab === 'notes'}" @click="switchTab('notes')"><span class="colorProbe color1"></span>Notes</div>
     <div class="verticalTab" :class="{active: activeTab === 'rests'}" @click="switchTab('rests')"><span class="colorProbe color2"></span>Rests</div>
     <div class="verticalTab" :class="{active: activeTab === 'barlines'}" @click="switchTab('barlines')"><span class="colorProbe color3"></span>Barlines</div>
     <div class="verticalTab" :class="{active: activeTab === 'beams'}" @click="switchTab('beams')"><span class="colorProbe color4"></span>Beams</div>
     <div class="verticalTab" :class="{active: activeTab === 'dynamics'}" @click="switchTab('dynamics')"><span class="colorProbe color5"></span>Dynamics</div>
     <div class="verticalTab" :class="{active: activeTab === 'artic'}" @click="switchTab('artic')"><span class="colorProbe color6"></span>Articulation</div>
     <div class="verticalTab" :class="{active: activeTab === 'text'}" @click="switchTab('text')"><span class="colorProbe color7"></span>Text</div>
     <div class="verticalTab" :class="{active: activeTab === 'other'}" @click="switchTab('other')"><span class="colorProbe color8"></span>Other</div>
  </div>
</template>

<script>
// import SystemListingEntry from '@/components/SystemListingEntry.vue'

export default {
  name: 'ShapeCataloguer',
  components: {
  },
  methods: {
    switchTab (val) {
      this.$store.dispatch('setCataloguerTab', val)
    }
  },
  computed: {
    activeTab () {
      return this.$store.getters.cataloguerTab
    }
    /* selectionEnabled: {
      get () {
        return this.$store.getters.selectionRectEnabled
      },
      set (value) {
        this.$store.dispatch('setSelectionRectEnabled', value)
      }
    },
    selectionRect () {
      return this.$store.getters.selectionRect
    },
    systems () {
      return this.$store.getters.systemsOnCurrentPage
    } */
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/css/_variables.scss';

.shapeCataloguer {
   min-height: calc(8 * 28.5px);
   overflow-y: scroll;
}

.verticalTabContent {
   float: right;
   width: 80%;
   height: 500px;
   border-left: $lightBorder;
   background-color: #ffffff;
}

.verticalTab {
   width: 20%;
   background-color: #e5e5e5;
   padding: .1rem .3rem;
   border-bottom: $lightBorder;

   .colorProbe {
      margin: .1rem .3rem .1rem .1rem;
      width: 10px;
      height: 10px;
      border: $lightBorder;
      display: inline-block;
      position: relative;
      top: 2px;
      border-radius: 3px;

      &.color1 {
         background-color: $highlightColor01;
      }
      &.color2 {
         background-color: $highlightColor02;
      }
      &.color3 {
         background-color: $highlightColor03;
      }
      &.color4 {
         background-color: $highlightColor04;
      }
      &.color5 {
         background-color: $highlightColor05;
      }
      &.color6 {
         background-color: $highlightColor06;
      }
      &.color7 {
         background-color: $highlightColor07;
      }
      &.color8 {
         background-color: $highlightColor08;
      }
   }

   &.active {
      background-color: #ffffff;
      width: 20%;
   }
}
</style>
