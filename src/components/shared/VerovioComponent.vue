<template>
  <div class="verovioComponent" :class="purpose" ref="mei">
    <div class="placeholder">no transcript available ...</div>
  </div>
</template>

<script>
import { draft2score, draft2page } from '@/tools/mei.js'
import { mapGetters } from 'vuex'

const rawSelectables = [
  'note',
  'chord',
  'syl',
  'rest',
  'beam',
  'artic',
  'accid',
  'clef',
  'slur',
  'dynam',
  'dir',
  'keySig',
  'meterSig',
  'barLine'
  // 'staff',
  // 'measure'
]
let selectables = []
rawSelectables.forEach(elem => {
  selectables.push('.' + elem + ':not(.bounding-box)')
})
selectables = selectables.join(', ')

export default {
  name: 'VerovioComponent',
  components: {

  },
  props: {
    purpose: String,
    type: String,
    getter: String,
    pathGetter: String
  },
  computed: {
    ...mapGetters(['diploPageBackgroundVerovioOptions', 'annotTransVerovioOptions'])
  },
  methods: {
    async render () {
      const meiDom = this.$store.getters[this.getter]

      if (!meiDom) {
        console.log('VerovioComponent:render(): No data available.')
        this.$refs.mei.innerHTML = '<div class="placeholder"><!-- loading data… -->select writing zone ...</div>'
        return false
      }

      try {
        this.removeListeners()

        if (this.type === 'annotTrans') {
          const resolvedDraft = draft2score(meiDom)[0]

          const svg = await this.$store.getters.annotatedTranscriptForWz(resolvedDraft)
          const localCopy = svg.repeat(1)
          this.$refs.mei.innerHTML = localCopy
        }

        if (this.type === 'diploTrans') {
          const resolvedTrans = draft2page(meiDom)

          const svg = await this.$store.getters.diplomaticTranscriptForWz(resolvedTrans)
          const localCopy = svg.repeat(1)
          this.$refs.mei.innerHTML = localCopy
        }

        this.addListeners()
      } catch (err) {
        console.log('VerovioComponent:render(): Unable to render file: ' + err, err)
      }
    },
    removeListeners () {
      this.$refs.mei.removeEventListener('click', this.clickListener)
      /* const els = this.$refs.mei.querySelectorAll(selectables)
      els.forEach((elm) => elm.removeEventListener('click', this.clickListener)) */
    },
    addListeners () {
      this.$refs.mei.addEventListener('click', this.clickListener)
      /* const els = this.$refs.mei.querySelector('selectables')
      els.forEach((elm) => elm.addEventListener('click', this.clickListener)) */
    },
    clickListener (e) {
      const target = e.target.closest(selectables)
      if (target !== null) {
        // TODO: Hier müssen wir auf this.purpose reagieren und unterschiedliche
        // Aktionen ausführen. Hier erstmal nur zur Anschauung – das müsste
        // natürlich über die Daten koordiniert werden…
        // target.classList.toggle('supplied')

        // const isBarline = target.classList.contains('barLine')

        const id = target.getAttribute('data-id')
        const name = target.getAttribute('data-class')
        const measure = target.closest('.measure').getAttribute('data-id')

        const meiDom = this.$store.getters[this.getter]
        const path = this.$store.getters[this.pathGetter]
        this.$store.dispatch('clickedVerovio', {
          meiDom,
          path,
          id,
          name,
          measure,
          purpose: this.purpose,
          callback: () => { this.render() }
        })
      }
    },
    /**
     * adds a highlighted class to the element with the given id
     * @param {*} newActivation
     * @param {*} oldActivation
     */
    activateElement (newActivation, oldActivation) {
      if ((!newActivation && oldActivation) || (oldActivation && newActivation !== oldActivation)) {
        const oldEl = this.$refs.mei.querySelector('*[data-id="' + oldActivation.id + '"]')
        if (oldEl) {
          oldEl.classList.remove('highlighted')
        }
      }
      if (newActivation) {
        const newEl = this.$refs.mei.querySelector('*[data-id="' + newActivation.id + '"]')
        if (newEl) {
          newEl.classList.add('highlighted')
        }
      }
    }
  },
  mounted: function () {
    // eslint-disable-next-line
    // this.vrvToolkit = new verovio.toolkit()
    this.$store.getters.verovioToolkit().then(tk => {
      this.vrvToolkit = tk
      this.vrvToolkit.setOptions(this.annotTransVerovioOptions)
      this.render()
    })

    this.unwatchData = this.$store.watch((state, getters) => getters[this.getter],
      (newCode, oldCode) => {
        if (newCode !== null) {
          this.render()
        }
      })

    this.unwatchActivations = this.$store.watch((state, getters) => getters.diploTransActivationsInAnnotTrans,
      (newActivation, oldActivation) => {
        if (this.purpose === 'transcribing') {
          this.activateElement(newActivation, oldActivation)
        }
      })
    /*
    this.unwatchPageXML = this.$store.watch((state, getters) => getters.xmlCode,
      (newCode, oldCode) => {
        this.render()
      })
     */
    this.render()
  },
  beforeUnmount () {
    this.unwatchData()
    this.removeListeners()
    this.unwatchActivations()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
@import '@/css/_variables.scss';

.verovioComponent {
  margin: 0;
  padding: .3rem;
  border: $lightBorder;
  border-radius: .3rem;
  background-color: #ffffff;
  box-shadow: 0 0 .3rem #00000066 inset;
  max-height: 100%;
  overflow: auto;

  svg *[data-corresp] {
    fill: $svgUsedShapeColor;
    stroke: $svgUsedShapeColor;
  }

  svg .supplied {
    fill: $svgSuppliedColor;
    stroke: $svgSuppliedColor;
  }

  svg .highlighted {
    fill: $scoreHighlightedColor;
    stroke: $scoreHighlightedColor;
  }

  svg .barLine.highlighted path {
    fill: $scoreHighlightedColor;
    stroke: $scoreHighlightedColor;
    stroke-width: 60;
  }

  svg .barLine path:hover {
    stroke-width: 80;
  }

  .placeholder {
    font-size: 24p;
    font-weight: bold;
    font-style: italic;
    color: gray;
  }

  &.transcribing svg {
    max-width: 150%;
    max-height: 150%;
  }
}

</style>
