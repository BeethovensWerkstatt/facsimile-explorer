<template>

   <div class="row">
     <div class="infoLeft">
        <div class="pageLabel">{{leftLabel}}</div>
     </div>
     <div class="pageVerso">
        <img class="previewImage"
          v-if="hasLeft"
          :class="{current: left === currentPage, preview: left === previewPage }"
          @click="previewLeft"
          @dblclick="openLeft"
          :src="leftImg"
          :alt="leftLabel"/>
     </div>
     <div class="pageRecto">
        <img class="previewImage"
          v-if="hasRight"
          :class="{current: right === currentPage, preview: right === previewPage }"
          @click="previewRight"
          @dblclick="openRight"
          :src="rightImg"
          :alt="rightLabel"/>
     </div>
     <div class="infoRight">
        <div class="pageLabel">{{rightLabel}}</div>
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
    leftLabel () {
      return this.$store.getters.page(this.left)?.label || ''
    },
    leftImg () {
      return this.$store.getters.page(this.left)?.uri + '/full/!110,110/0/default.jpg'
    },
    hasRight () {
      return this.right < this.$store.getters.pageArray.length
    },
    rightImg () {
      return this.$store.getters.page(this.right)?.uri + '/full/!110,110/0/default.jpg'
    },
    rightLabel () {
      return this.$store.getters.page(this.right)?.label || ''
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

   .previewImage.current {
      outline: 3px solid red;
   }

   .previewImage.preview {
      outline: 3px solid blue;
   }
}
</style>
