<template>
  <div class="writingZone" :class="{active: isActive}">
    <h1 @click="selectWritingZone">{{name}}
      <span class="previewFrame" :style="{width: pageDimensions.pageWidth}" @click="showWzPreview()">
        <span class="actualPreview" :style="{top: pageDimensions.top, left: pageDimensions.left, width: pageDimensions.width, height: pageDimensions.height}"></span>
      </span>
      <span class="shapeCount" title="Number of Shapes"><span class="sum">∑</span>{{wz.totalCount}} ({{wz.layers.length}}) <i class="icon icon-cross" @click.stop="deleteZone" title="Delete Writing Zone"></i></span></h1>
    <div class="writingLayer">Writing Layers:</div>
    <div v-for="(wl, i) in wz.layers" :key="i" class="writingLayer" :class="{active: wl.id === activeLayerId}" title="Shift-click on active layer will move it to the end.">
      <h2 @click.stop="selectWritingLayer($event, wl.id)">{{this.numPrefixer(i)}}
        <span class="shapeCount" title="Number of Shapes"># {{wl.shapes.length}} <i v-if="wz.layers.length !== 1" class="icon icon-cross" @click.stop="deleteLayer(wl.id)" title="Delete Writing Layer"></i></span>

      </h2>
    </div>
    <div class="writingLayer addLayerBtn" title="Add new writing layer"><i class="icon icon-plus" @click.stop="addLayer"></i></div>
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
    selectWritingLayer (e, id) {
      if (this.activeLayerId === id) {
        if (e.shiftKey) {
          this.$store.dispatch('setActiveWritingLayerAsLastInZone')
        }
      } else {
        this.$store.dispatch('setActiveWritingLayer', id)
      }
    },
    addLayer () {
      console.log('adding layer')
      this.$store.dispatch('createNewWritingLayer')
    },
    deleteZone () {
      this.$store.dispatch('deleteWritingZone', this.wz.id)
    },
    deleteLayer (id) {
      this.$store.dispatch('deleteWritingLayer', id)
    },
    showWzPreview () {
      console.log('dispatch something to make OSD focus on ', this.wz.xywh)
      this.$store.dispatch('focusRect', this.wz.xywh)
    }
    /* switchTab (val) {
      this.$store.dispatch('setExplorerTab', val)
   } */
  },
  computed: {
    name () {
      return this.numPrefixer(this.position)
    },
    isActive () {
      return this.wz.id === this.$store.getters.activeWritingZone
    },
    pageDimensions () {
      const page = this.$store.getters.currentPageDimensions

      let pageWidth

      if (page.width > page.height) {
        const num = 0.8 * page.width / page.height
        pageWidth = num.toFixed(2) + 'rem'
      } else if (page.width <= page.height) {
        const num = 0.8 * page.height / page.width
        pageWidth = num.toFixed(2) + 'rem'
      } else {
        pageWidth = '.8rem'
      }

      const top = (100 / page.height * parseInt(this.wz.xywh.split(',')[1])) + '%'
      const left = (100 / page.width * parseInt(this.wz.xywh.split(',')[0])) + '%'
      const width = (100 / page.width * parseInt(this.wz.xywh.split(',')[2])) + '%'
      const height = (100 / page.height * parseInt(this.wz.xywh.split(',')[3])) + '%'

      return { pageWidth, top, left, width, height }
    },
    activeLayerId () {
      return this.$store.getters.activeWritingLayer
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

  .writingLayer {
    display: none;
  }

  &.active .writingLayer {
    display: block;
  }
}

h1 {
  font-weight: 500;
  font-size: .8rem;
  margin: .1rem 0 .1rem 0;
  padding: .1rem .2rem;
  background-color: $mainBackgroundColor;
  border: $lightBorder;
  border-radius: 3px;

  .sum {
    font-size: .6rem;
    position: relative;
    top: -2px;
  }

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

.previewFrame {
  display: inline-block;
  height: .8rem;
  border: $lightBorder;
  position: relative;
  top: 2px;
  cursor: pointer;
  background-color: #ffffff;

  .actualPreview {
    position: absolute;
    background-color: red;
    min-width: 10%;
    min-height: 10%;
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
    margin: 0 0 0 -.2rem;
    border: .5px solid transparent;
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
}

.writingZone.active .writingLayer.active h2 {
  background-color: lighten($highlightColor06, 30%);
  border: $lightBorder;
}

.addLayerBtn {
  cursor: pointer;

  i {
    font-size: .6rem;
  }
}

.shapeCount {
  float: right;
}
</style>
