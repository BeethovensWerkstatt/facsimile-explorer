<template>
  <div class="WritingZonesAtAnnotTrans">
    <h1>Writing Zones</h1>
    <div class="firstWritingZone">
      <label>Main Writing Zone</label>
      <div>{{ firstWritingZone }}</div>
    </div>
    <div class="additionalWritingZones">
      <label>Additional Writing Zones</label>
      <div v-for="(zone, z) in additionalWritingZones" :key="z">
        <span class="wzLabel">{{docLabel(zone.page)}}, p.{{pageLabel(zone.page)}}, WZ {{z + 1}}</span>
        <span class="float-right">
          <template v-if="z !== 0">
            <i class="icon icon-upward" title="Reorder Writing Zones" @click="moveZoneUp(zone, z)"></i>
          </template>
          <template v-if="z !== additionalWritingZones.length - 1">
            <i class="icon icon-downward" title="Reorder Writing Zones" @click="moveZoneDown(zone, z)"></i>
          </template>
          <i class="icon icon-delete" title="Delete Additional Writing Zone" @click="deleteAdditionalWritingZone(zone)"></i>
        </span>
      </div>
      <button class="btn btn-link btn-sm" @click="addAdditionalWritingZone"><i class="icon icon-plus"></i> Add Additional Writing Zone</button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'WritingZonesAtAnnotTrans',
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
    docLabel (page) {
      if (this.displayPerspective === 'reconstruction') {
        const doc = this.reconstructionDocuments.find(d => d.id === page.reconstructionId)
        return doc.label
      } else {
        const doc = this.modernDocuments.find(d => d.id === page.modernDocumentId)
        return doc.label
      }
    },
    pageLabel (page) {
      if (this.displayPerspective === 'reconstruction') {
        return page.reconstructionLabel
      } else {
        return page.modernLabel
      }
    },
    pageAltLabel (page) {
      if (this.displayPerspective === 'reconstruction') {
        const doc = this.modernDocuments.find(d => d.id === page.modernDocumentId)
        return doc.label + ': ' + page.modernLabel
      } else {
        const doc = this.reconstructionDocuments.find(d => d.id === page.reconstructionId)
        return doc.label + ': ' + page.reconstructionLabel
      }
    },
    moveZoneUp (zone, index) {
      console.log(zone, index)
      alert('Hier müssten die Zones umsortiert werden.')
    },
    moveZoneDown (zone, index) {
      console.log(zone, index)
      alert('Hier müssten die Zones umsortiert werden.')
    },
    deleteAdditionalWritingZone (zone) {
      alert('Diese WritingZone muss von der aktuellen Annotated Transcription entfernt werden.')
    },
    addAdditionalWritingZone () {
      alert('Hier sollte ein Modal aufgehen, in dem wir die WritingZoneDirectory-Komponente (oder etwas sehr ähnliches) nutzen, um weitere Zones zur aktuellen AnnotTrans hinzuzufügen.')
    }
  },
  computed: {
    ...mapGetters(['writingZonesOnCurrentPage', 'activeWritingZone', 'availableAnnotatedTranscripts', 'currentWritingZoneObject']),
    firstWritingZone () {
      const wz = this.currentWritingZoneObject
      if (!wz) {
        return ''
      }
      const annotTransPath = wz.annotTrans.split('/').slice(-1)[0]
      const sourceName = annotTransPath.substring(0, annotTransPath.length - 17)
      // D-BNba_MH_60_Engelmann_p007_wz01_at.xml
      const pageNum = parseInt(annotTransPath.substring(sourceName.length + 2, sourceName.length + 5))
      const wzNum = parseInt(annotTransPath.substring(sourceName.length + 8, sourceName.length + 10))

      // TODO important!: pageNum durch label ersetzen!!!

      return sourceName + ', p.' + pageNum + ', WZ ' + wzNum
      // TODO: Hier am Objekt einfach noch die jeweilige Seite angehängt
      // return { id: 'sdf', label: '02', xywh: '37,6,43,15', annotTrans: { file: 'NK_p005_wz02_at.xml', firstZone: true }, page: { id: 'e5', modernLabel: '4r', reconstructionLabel: '5', zonesCount: 19, modernDocumentId: 'E', reconstructionId: 'NotK', width: 100, height: 80 } }
    },
    additionalWritingZones () {
      return [] // [{ id: 'dfg', label: '03', xywh: '11,18,37,13', annotTrans: { file: 'NK_p005_wz02_at.xml', firstZone: false }, page: { id: 'e5', modernLabel: '4r', reconstructionLabel: '5', zonesCount: 19, modernDocumentId: 'E', reconstructionId: 'NotK', width: 100, height: 80 } }]
    },
    displayPerspective () {
      // TODO: das sollte natürlich über einen getter funktionieren
      return 'reconstruction' // 'modern'
    },
    modernDocuments () {
      return [{ id: 'E', label: 'Engelmann' },
        { id: 'L', label: 'Landsberg 8' },
        { id: 'B', label: 'BSk 21' },
        { id: 'G', label: 'Grasnick 20b' },
        { id: 'F', label: 'BN fond français 12.756' },
        { id: 'Ms96', label: 'Ms. 96' },
        { id: 'Ms57', label: 'Ms. 57(2)' }
      ]
    },
    reconstructionDocuments () {
      return [{ id: 'NotK', label: 'Notirungsbuch K' }]
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/css/_variables.scss';

h1 {
  font-size: .8rem;
  font-weight: 700;
  margin: 0;
  padding: 0;
}

label {
  font-weight: 700;
  margin-top: .3rem;
  display: inline-block;
}

.additionalWritingZones {
  margin-bottom: .5rem;
}

</style>
