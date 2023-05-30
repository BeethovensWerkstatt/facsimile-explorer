<template>
  <div class="writingZone" :class="{active: isActive}">
    <h1 @click="selectWritingZone">{{name}} <span class="shapeCount" title="Number of Shapes"># {{wz.totalCount}} <i class="icon icon-cross" @click.stop="deleteZone" title="Delete Writing Zone"></i></span></h1>
    <div class="writingLayer">Writing Layers:</div>
    <div v-for="(wl, i) in wz.layers" :key="i" class="writingLayer active">
      <h2>{{this.numPrefixer(i)}}  <span class="shapeCount" title="Number of Shapes"># {{wl.shapes.length}}</span></h2>
    </div>
  </div>
</template>

<script>
// import SystemListingEntry from '@/components/SystemListingEntry.vue'

export default {
  name: 'WritingZoneListEntry',
  components: {

  },
  props: {
    wz: Object,
    position: Number
  },
  methods: {
    numPrefixer (input) {
      const num = input + 1
      if (num < 10) {
        return '0' + num
      } else {
        return '' + num
      }
    },
    selectWritingZone () {
      this.$store.dispatch('setActiveWritingZone', this.wz.id)
      // alert('Jetzt sollte die WritingZone mit der ID ' + this.wz.id + ' aktiviert werden.')
    },
    deleteZone () {
      this.$store.dispatch('deleteWritingZone', this.wz.id)
    }
    /* switchTab (val) {
      this.$store.dispatch('setExplorerTab', val)
   } */
  },
  computed: {
    name () {
      return this.numPrefixer(this.position)
    },
    // TODO: Hier vermutlich sinnvoller mit einem Getter arbeiten
    isActive () {
      return this.wz.id === this.$store.getters.activeWritingZone
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
    } */
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/css/_variables.scss';

.writingZone {
  margin-bottom: 1.2rem;
}

h1 {
  font-weight: 500;
  font-size: .8rem;
  margin: .1rem 0 .1rem 0;
  padding: .1rem .2rem;
  background-color: $mainBackgroundColor;
  border: $lightBorder;
  border-radius: 3px;

  .icon-cross {
    font-size: .6rem;
    position: relative;
    top: -2px;
    cursor: pointer;

    &:hover {
      color: #cc3333;
    }
  }
}

.writingZone.active h1 {
  background-color: lighten($highlightColor06, 20%);
}

.writingLayer {
  margin: 0 0 .1rem .7rem;

  h2 {
    font-weight: 500;
    font-size: .8rem;
    padding: 0 .2rem;
    margin-left: -.2rem;
    border: .5px solid transparent;
    border-radius: 3px;
  }
}

.writingZone.active .writingLayer.active h2 {
  background-color: lighten($highlightColor06, 30%);
  border: $lightBorder;
}

.shapeCount {
  float: right;
}
</style>
