<template>
  <div class="writingZoneDirectory">

    <div class="page" :class="{ active: p === activePage }" v-for="(page, p) in pages" :key="p" :data-page-id="page.id">
      <h2 title="Page Number">{{pageLabel(page, p)}} <small v-if="page.reconstructionLabel" class="float-right">{{pageAltLabel(page)}}</small></h2>
      <template v-if="p === activePage">
        <div class="wz" :class="{ firstZone: wz.annotTrans !== null && wz.annotTrans.firstZone, followUpZone: wz.annotTrans !== null && !wz.annotTrans.firstZone, active: wz.id === activeWritingZoneId }" v-for="(wz, w) in writingZonesOnActivePage" :key="w">
          <span class="zoneNumber">WZ {{wz.label}}</span>
          <span class="previewFrame" :style="{width: getPreviewWidth(page)}" @click="showWzPreview(page, wz)">
            <span class="actualPreview" :style="{top: wz.xywh.split(',')[0] + '%', left: wz.xywh.split(',')[1] + '%', width: wz.xywh.split(',')[2] + '%', height: wz.xywh.split(',')[3] + '%'}"></span>
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
// import SystemListingEntry from '@/components/SystemListingEntry.vue'

export default {
  name: 'WritingZoneDirectory',
  components: {

  },
  methods: {
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
      return page.label || p
    },
    pageAltLabel (page, p) {
      return page.name ? page.name + ' ' + p : null
    },
    showWzPreview (page, wz) {
      alert('Hier könnte man gut einen Modal aufmachen, in dem der jeweilige Bildausschnitt per IIIF geladen wird. Keine Overlays o.ä., einfach nur eine schnelle Voransicht, damit man sehen kann, welcher Bereich das ist.')
    }
  },
  computed: {
    activePage () {
      return this.$store.getters.currentPageZeroBased
    },
    activePageId () {
      // TODO: das sollte natürlich über einen getter funktionieren
      return this.pages[this.$store.getters.currentPageZeroBased].id
    },
    activeWritingZoneId () {
      return 'sdf'
    },
    pages () {
      const pages = this.$store.getters.documentPagesForSidebars(this.$store.getters.filepath)
      console.log(this.activePage, pages)
      return pages.map(p => ({ ...p, modernLabel: p.label }))
    },
    writingZonesOnActivePage () {
      // TODO: das sollte natürlich über einen getter funktionieren. WritingZones nicht in pages ()
      // integriert, um die Daten separat laden zu können und damit evtl. besser mit mehreren gleichzeitig
      // arbeiten zu können (was aber auch so nicht trivial und damit vielleicht erstmal egal ist).
      //
      // xywh sind gerundete Pixelwerte – die müssten wir halt vorab aus den Daten berechnen.
      // Die Zahlen sind so klein, weil ich erst über Prozente nachgedacht habe.
      return [{ id: 'asd', label: '01', xywh: '11,5,23,12', annotTrans: null },
        { id: 'sdf', label: '02', xywh: '37,6,43,15', annotTrans: { file: 'NK_p005_wz02_at.xml', firstZone: true } },
        { id: 'dfg', label: '03', xywh: '11,18,37,13', annotTrans: { file: 'NK_p005_wz02_at.xml', firstZone: false } },
        { id: 'qwe', label: '04', xywh: '14,21,23,9', annotTrans: null },
        { id: 'wer', label: '05', xywh: '38,47,32,23', annotTrans: { file: 'NK_p005_wz05_at.xml', firstZone: true } }]
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
