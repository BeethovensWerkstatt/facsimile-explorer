<template>
  <div class="verovioComponent" :class="purpose" ref="mei">
    <div class="placeholder">no transcript available ...</div>
  </div>
</template>

<script>
import { draft2score } from '@/tools/mei.js'
// import { mapGetters } from 'vuex'

const verovioOptions = {
  scale: 40,
  breaks: 'none',
  openControlEvents: true,
  svgBoundingBoxes: true,
  svgRemoveXlink: true,
  svgHtml5: true,
  header: 'none',
  footer: 'none' //,
  // unit: 18
}

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
  'meterSig'
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
  methods: {
    render () {
      const meiDom = this.$store.getters[this.getter]

      if (!meiDom) {
        console.log('VerovioComponent:render(): No data available.')
        this.$refs.mei.innerHTML = '<div class="placeholder">loading data…</div>'
        return false
      }

      try {
        this.removeListeners()

        const resolvedDrafts = this.type === 'annotTrans' ? draft2score(meiDom)[0] : meiDom.querySelector('music')
        console.log('rd ' + this.type, resolvedDrafts)
        const serializer = new XMLSerializer()
        const mei = serializer.serializeToString(resolvedDrafts)
        this.vrvToolkit.loadData(mei)
        const svg = this.vrvToolkit.renderToSVG(1, {})

        this.$refs.mei.innerHTML = svg

        this.addListeners()
      } catch (err) {
        console.log('VerovioComponent:render(): Unable to render file: ' + err, err)
      }
    },
    removeListeners () {
      // this.$refs.mei.removeEventListener('click', this.clickListener)
      const els = this.$refs.mei.querySelectorAll(selectables)
      els.forEach((elm) => elm.removeEventListener('click', this.clickListener))
    },
    addListeners () {
      // this.$refs.mei.addEventListener('click', this.clickListener)
      const els = this.$refs.mei.querySelectorAll(selectables)
      els.forEach((elm) => elm.addEventListener('click', this.clickListener))
    },
    clickListener (e) {
      const target = e.target.closest(selectables)
      if (target !== null) {
        // TODO: Hier müssen wir auf this.purpose reagieren und unterschiedliche
        // Aktionen ausführen. Hier erstmal nur zur Anschauung – das müsste
        // natürlich über die Daten koordiniert werden…
        // target.classList.toggle('supplied')
        const id = target.getAttribute('data-id')
        const name = target.getAttribute('data-class')
        // console.log(this.purpose, id, name)
        const meiDom = this.$store.getters[this.getter]
        const path = this.$store.getters[this.pathGetter]
        this.$store.dispatch('clickedVerovio', {
          meiDom,
          path,
          id,
          name,
          purpose: this.purpose,
          callback: () => { this.render() }
        })
      }
    }
  },
  mounted: function () {
    // eslint-disable-next-line
    // this.vrvToolkit = new verovio.toolkit()
    this.$store.getters.verovioToolkit().then(tk => {
      this.vrvToolkit = tk
      this.vrvToolkit.setOptions(verovioOptions)
      this.render()
    })

    this.unwatchData = this.$store.watch((state, getters) => getters[this.getter],
      (newCode, oldCode) => {
        if (newCode !== null) {
          this.render()
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

  svg .supplied {
    fill: $svgSuppliedColor;
    stroke: $svgSuppliedColor;
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
