<template>
  <div class="writingZoneDirectory">

    <div class="page" :class="{ active: p === activePage }" v-for="(page, p) in pages" :key="p" :data-page-id="page.id">
      <!-- <h2 title="Page Number">{{pageLabel(page, p)}} <small v-if="page.reconstructionLabel" class="float-right">{{pageAltLabel(page, p)}}</small></h2> -->
      <h2 @click="setPage(p)">{{ page.label ? page.label : (p + 1).toFixed(0) }} <small class="modernLabel" v-if="page.modernLabel !== null">{{page.document?.replaceAll('_', ' ')}}: {{page.modernLabel}}</small></h2>
      <template v-if="p === activePage">
        <div
          class="wz"
          :class="{ firstZone: wz.annotTrans !== null && wz.annotTrans.firstZone, followUpZone: wz.annotTrans !== null && !wz.annotTrans.firstZone, active: wz.id === activeWritingZone }"
          v-for="(wz, w) in writingZonesOnActivePage"
          :key="w"
          @click="selectWritingZone(wz)"
        >
          <span class="zoneNumber">WZ {{w + 1}}</span>
          <span class="previewFrame" :style="{width: getPreviewWidth(page)}" @click="showWzPreview(page, wz)">
            <span class="actualPreview" :style="wzPageDimensions(page, wz.xywh)"></span>
          </span>
          <span class="hasTrans float-right">
            <template v-if="wz.annotTrans !== null">
              <template v-if="wz.annotTrans.firstZone">
                <span class="desc">annot</span>
                <i class="icon icon-check" :title="wz.annotTrans.file"></i>
              </template>
              <template v-else>
                <span class="desc">cont'd</span>
                <i class="icon icon-link" :title="wz.annotTrans.file"></i>
              </template>
            </template>
            <template v-else>
              <span class="desc">no trans</span>
              <i class="icon icon-stop" title="Writing Zone without Annotated Transcription"></i>
            </template>
          </span>
        </div>
      </template>
    </div>

  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

// import SystemListingEntry from '@/components/SystemListingEntry.vue'

export default {
  name: 'WritingZoneDirectory',
  components: {

  },
  methods: {
    ...mapActions(['setCurrentPage']),
    setPage (i) {
      this.setCurrentPage(i)
      // this.$router.replace({ query: { page: i + 1 } })
    },
    getPreviewWidth (page) {
      if (page.width < page.height) {
        const num = 0.8 * page.width / page.height
        return num.toFixed(2) + 'rem'
      } else if (page.width >= page.height) {
        const num = 0.8 * page.height / page.width
        return num.toFixed(2) + 'rem'
      } else {
        return '.8rem'
      }
    },
    pageLabel (page, p) {
      return page.modernLabel || p
    },
    pageAltLabel (page, p) {
      return page.reconstructionLabel
    },
    showWzPreview (page, wz) {
      alert('Hier könnte man gut einen Modal aufmachen, in dem der jeweilige Bildausschnitt per IIIF geladen wird. Keine Overlays o.ä., einfach nur eine schnelle Voransicht, damit man sehen kann, welcher Bereich das ist.')
    },
    wzPageDimensions (page, xywh) {
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

      const top = (100 / page.height * parseInt(xywh.split(',')[1])) + '%'
      const left = (100 / page.width * parseInt(xywh.split(',')[0])) + '%'
      const width = (100 / page.width * parseInt(xywh.split(',')[2])) + '%'
      const height = (100 / page.height * parseInt(xywh.split(',')[3])) + '%'

      return { pageWidth, top, left, width, height }
    },
    selectWritingZone (wz) {
      this.$store.dispatch('setActiveWritingZone', wz.id)
      // alert('Jetzt sollte die WritingZone mit der ID ' + this.wz.id + ' aktiviert werden.')
      const path = this.$store.getters.currentWzAtPath
      const callback = ({ xml, dom }) => {
        console.log('loaded', path)
      }
      if (path) {
        this.$store.dispatch('loadXmlFile', { path, callback })
      }
    }
  },
  computed: {
    ...mapGetters(['activeWritingZone']),
    activePage () {
      return this.$store.getters.currentPageZeroBased
    },
    activePageId () {
      return this.pages[this.$store.getters.currentPageZeroBased].id
    },
    activeWritingZoneId () {
      return this.activeWritingZone
    },
    pages () {
      const pages = this.$store.getters.documentPagesForSidebars(this.$store.getters.filepath)
      // console.log(this.activePage, pages)
      return pages.map((page, p) => ({ ...page, reconstructionLabel: page.document }))
    },
    writingZonesOnActivePage () {
      const wzArr = this.$store.getters.writingZonesOnCurrentPage
      // console.log('writing zones', wzArr)
      return wzArr
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/css/_variables.scss';

.source {
  margin: 0 0 1rem 0;

  h1 {
    font-size: .9rem;
    font-weight: 700;
    margin: 0;
    padding: .1rem .2rem;
    border: $lightBorder;
    border-radius: 3px;
    background-color: $mainBackgroundColor;
  }

  &.active h1 {
    background-color: lighten($highlightColor06, 20%);
  }

}

.page {

  margin: .1rem 0 .2rem 0;

  h2 {
    font-size: .8rem;
    font-weight: 700;
    margin: 0;
    padding: .1rem .2rem;
    border: $lightBorder;
    border-radius: 3px;
    background-color: lighten($mainBackgroundColor, 5%);
    position: relative;

    small {
      font-size: .7rem;
      line-height: 1rem;
      font-weight: 300;
    }
  }

  &.active h2 {
    background-color: lighten($highlightColor06, 30%);
  }

  .wz {
    margin: .1rem 0 .1rem .3rem;
    padding: 0 .1rem 0 .2rem;
    border-radius: 3px;

    &.active {
      background-color: lighten($highlightColor06, 35%);
      outline: $lightBorder;
    }

    /*
    &.firstZone {
      font-weight: 700;
    }

    &.followUpZone {
      color: lighten($darkFontColor, 30%);
    }
    */
    .zoneNumber {
      display: inline-block;
      width: 2.75rem;
    }

    .previewFrame {
      display: inline-block;
      height: .8rem;
      border: $lightBorder;
      position: relative;
      top: 2px;
      cursor: pointer;

      .actualPreview {
        position: absolute;
        background-color: red;
      }
    }

    .hasTrans {
      i.icon-check, i.icon-stop, i.icon-link {
        font-size: .7rem;
        position: relative;
        top: -2px;
        color: darken($darkFontColor, 10%);
      }

      i.icon-stop, i.icon-link {
        color: lighten($darkFontColor, 40%);
      }

      .desc {
        font-weight: 100;
        font-size: .6rem;
        color: lighten($darkFontColor, 40%);
        margin-right: .2rem;
        position: relative;
        top: -1px;
      }
    }
  }
}

</style>
