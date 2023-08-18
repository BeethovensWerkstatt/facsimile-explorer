<template>

   <div class="row">
     <div class="infoLeft">
        <template v-if="hasLeft">
           <div class="pageLabel">{{ leftPage.label}}</div>
           <div class="info measureZones" :class="{ unavailable: !leftPage.hasZones }" :title="'Measure Zones' + ((!leftPage.hasZones)? ' unavailable' : '')">
             <i class="icon icon-apps"></i>
           </div>
           <div class="info svgShapes" :class="{ unavailable: !leftPage.hasSvg }" :title="'SVG Shapes' + ((!leftPage.hasSvg)? ' unavailable' : '')">
             <i class="icon icon-edit"></i>
           </div>
           <div class="info transcription" :class="{ unavailable: leftPage.systems === 0 }" :title="'Transcription ' + ((leftPage.systems === 0)? 'un' : '') + 'available'">
             <span>♫</span>
           </div>
        </template>
     </div>
     <div class="pageVerso">
        <img class="previewImage"
          v-if="hasLeft"
          :class="{current: left === currentPage, preview: left === previewPage }"
          @click="previewLeft"
          @dblclick="openLeft"
          :src="leftImg"
          :alt="leftPage.label"/>
     </div>
     <div class="pageRecto">
        <img class="previewImage"
          v-if="hasRight"
          :class="{current: right === currentPage, preview: right === previewPage }"
          @click="previewRight"
          @dblclick="openRight"
          :src="rightImg"
          :alt="rightPage.label"/>
     </div>
     <div class="infoRight">
        <template v-if="hasRight">
           <div class="pageLabel">{{ rightPage.label }}</div>
           <div class="info measureZones" :class="{ unavailable: !rightPage.hasZones }" :title="'Measure Zones' + ((!rightPage.hasZones)? ' unavailable' : '')">
             <i class="icon icon-apps"></i>
           </div>
           <div class="info svgShapes" :class="{ unavailable: !rightPage.hasSvg }" :title="'SVG Shapes' + ((!rightPage.hasSvg)? ' unavailable' : '')">
             <i class="icon icon-edit"></i>
           </div>
           <div class="info transcription" :class="{ unavailable: rightPage.systems === 0 }" :title="'Transcription ' + ((rightPage.systems === 0)? 'un' : '') + 'available'">
             <span>♫</span>
           </div>
        </template>
     </div>
   </div>

</template>

<script>

export default {
  name: 'DocumentOverviewRow',
  props: {
    left: Number,
    right: Number
  },
  components: {

  },
  methods: {
    previewLeft () {
      this.$store.dispatch('setPreviewPage', this.left)
    },
    openLeft () {
      this.$store.dispatch('setCurrentPage', this.left)
      this.$store.dispatch('setModal', null)
    },
    previewRight () {
      this.$store.dispatch('setPreviewPage', this.right)
    },
    openRight () {
      this.$store.dispatch('setCurrentPage', this.right)
      this.$store.dispatch('setModal', null)
    }
  },
  computed: {
    hasLeft () {
      return this.left > -1
    },
    leftPage () {
      return this.$store.getters.page(this.left)
    },
    leftImg () {
      const uri = this.$store.getters.page(this.left)?.uri
      if (typeof uri.endsWith !== 'function') {
        return uri
      }
      const slash = (uri.endsWith('/')) ? '' : '/'
      return uri + slash + 'full/!110,110/0/default.jpg'
    },
    hasRight () {
      return this.right < this.$store.getters.pageArray.length
    },
    rightPage () {
      return this.$store.getters.page(this.right)
    },
    rightImg () {
      const uri = this.$store.getters.page(this.right)?.uri
      if (typeof uri.endsWith !== 'function') {
        return uri
      }
      const slash = (uri.endsWith('/')) ? '' : '/'
      return uri + slash + 'full/!110,110/0/default.jpg'
    },
    currentPage () {
      return this.$store.getters.currentPageZeroBased
    },
    previewPage () {
      return this.$store.getters.previewPageZeroBased
    }
    /* active () {
      return this.$store.getters.modal === 'overview'
    },
    pages () {
      return this.$store.getters.pageArray
    },
    maxRows () {
      return Math.ceil(this.$store.getters.pageArray.length / 2)
    } */
  },
  watch: {
    previewPage () {
      if (this.previewPage === this.left || this.previewPage === this.right) {
        this.$el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/css/_variables.scss';
.row {
   margin-top: .2rem;
   padding: .1rem;
   border-bottom: $lightBorder;
   display: flex;

   .infoLeft {
      flex: none 0 25%;
      width: 25%;
      text-align: right;
      padding: 0 0.2rem 0 0;
   }

   .pageVerso {
      flex: none 0 25%;
      width: 25%;
      text-align: right;
   }

   .pageRecto {
      flex: none 0 25%;
      width: 25%;
   }

   .infoRight {
      flex: none 0 25%;
      width: 25%;
      padding: 0 0 0 0.2rem;
   }

   .pageLabel {
      font-weight: 500;
   }

   .info {
      font-size: .7rem;
      font-weight: 300;

      &.transcription {
         font-size: .9rem;
      }

      &.unavailable {
         color: #aaaaaa;
      }
   }

   .previewImage.current {
      outline: 3px solid red;
   }

   .previewImage.preview {
      outline: 3px solid blue;
   }
}
</style>
