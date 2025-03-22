<template>
  <div class="WritingZonesAtAnnotTrans">
    <h1>Writing Zones</h1>
    <div class="firstWritingZone" v-if="activeWritingZone">
      <label>Main Writing Zone</label>
      <div>{{ firstWritingZone.label }}</div>
    </div>
    <div class="additionalWritingZones" v-if="activeWritingZone">
      <label>Additional Writing Zones {{ additionalWritingZones.length > 0 ? '(' + additionalWritingZones.length + ')': '' }}</label>
      <div v-for="(zone, z) in additionalWritingZones" :key="z">
        <span class="wzLabel">{{ zone.label }}</span>
      </div>
      <div style="margin-top: 1em;"><small><strong>Warning:</strong> For now, additional writing zones must be entered and committed manually. The order of links in //source/@target of the Annotated Transcript specify the logical order of writing zones within the transcription.</small></div>
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
    ...mapGetters(['writingZonesOnCurrentPage', 'activeWritingZone', 'availableAnnotatedTranscripts', 'currentWritingZoneObject', 'currentAtWzIds', 'sources']),
    firstWritingZone () {
      const id = this.currentAtWzIds[0]

      console.log('713 WritingZonesAtAnnotTrans.vue', id, this.currentAtWzIds, this.additionalWritingZones)
      console.log('713a', this.activeWritingZone)
      if (!id) return { id: 'null', label: 'no Annotated Transcription selected' }
      const relativePath = id.split('#')[0]
      const wzId = id.split('#')[1]
      const fileName = relativePath.split('/').slice(-1)[0]
      const sourceInfo = this.sources.find(s => s.path.split('/').indexOf(fileName) !== -1)
      const fullPath = sourceInfo.path
      const sourceLabel = sourceInfo.name

      const source = this.$store.getters.documentByPath(fullPath)
      const gendescWZ = source.querySelector('genDesc[*|id="' + wzId + '"]')
      const wzLabel = gendescWZ.getAttribute('label')

      const surfaceId = gendescWZ.parentElement.getAttribute('corresp').substring(1)
      const surface = source.querySelector('surface[*|id="' + surfaceId + '"]')
      const surfaceLabel = surface.getAttribute('label')

      return { id: fullPath + '#' + wzId, label: sourceLabel + ', p.' + surfaceLabel + ', WZ ' + wzLabel }
    },
    additionalWritingZones () {
      const zoneIds = this.currentAtWzIds.slice(1)

      const arr = []
      zoneIds.forEach(id => {
        // example: ../D-BNba_MH_60_Engelmann.xml#g0fb67eed-9707-4d78-b650-f8cc84ce1718
        // path to source file, then xml:id of genDesc of WZ

        const relativePath = id.split('#')[0]
        const wzId = id.split('#')[1]
        const fileName = relativePath.split('/').slice(-1)[0]
        const sourceInfo = this.sources.find(s => s.path.split('/').indexOf(fileName) !== -1)
        const fullPath = sourceInfo.path
        const sourceLabel = sourceInfo.name

        const source = this.$store.getters.documentByPath(fullPath)
        const gendescWZ = source.querySelector('genDesc[*|id="' + wzId + '"]')
        const wzLabel = gendescWZ.getAttribute('label')

        const surfaceId = gendescWZ.parentElement.getAttribute('corresp').substring(1)
        const surface = source.querySelector('surface[*|id="' + surfaceId + '"]')
        const surfaceLabel = surface.getAttribute('label')

        arr.push({ id: fullPath + '#' + wzId, label: sourceLabel + ', p.' + surfaceLabel + ', WZ ' + wzLabel })
      })

      return arr // [{ id: 'dfg', label: '03', xywh: '11,18,37,13', annotTrans: { file: 'NK_p005_wz02_at.xml', firstZone: false }, page: { id: 'e5', modernLabel: '4r', reconstructionLabel: '5', zonesCount: 19, modernDocumentId: 'E', reconstructionId: 'NotK', width: 100, height: 80 } }]
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
