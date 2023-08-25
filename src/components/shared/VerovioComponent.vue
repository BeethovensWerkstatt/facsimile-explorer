<template>
  <div class="verovioComponent" :class="purpose" ref="mei">
    <div class="placeholder">no transcript available ...</div>
  </div>
</template>

<script>
// import verovio from 'verovio'
// import { mapGetters } from 'vuex'

const verovioOptions = {
  scale: 40,
  breaks: 'none',
  openControlEvents: true,
  svgBoundingBoxes: true,
  svgRemoveXlink: true,
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
  'dir'// ,
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
  data: () => ({
    unwatchCurrentWzAtPath: null
  }),
  props: {
    purpose: String,
    source: String
  },
  watch: {
    sourceDOM () {
      this.render()
    }
  },
  methods: {
    render () {
      this.removeListeners()

      if (this.source) {
        let mei = null
        // TODO action: documentByPath with optional loading from GH
        let dom = this.sourceDOM
        if (dom) {
          const serializer = new XMLSerializer()
          mei = serializer.serializeToString(dom)
          this.vrvToolkit.loadData(mei)
          const svg = this.vrvToolkit.renderToSVG(1, {})

          this.$refs.mei.innerHTML = svg

          this.addListeners()
        } else {
          // TODO load from GitHub
          dom = null
          this.$refs.mei.innerHTML = '<div class="placeholder">no transcript available ...</div>'
        }
      }
    },
    removeListeners () {
      this.$refs.mei.removeEventListener('click', this.clickListener)
    },
    addListeners () {
      this.$refs.mei.addEventListener('click', this.clickListener)
    },
    clickListener (e) {
      const target = e.target.closest(selectables)
      if (target !== null) {
        // TODO: Hier müssen wir auf this.purpose reagieren und unterschiedliche
        // Aktionen ausführen. Hier erstmal nur zur Anschauung – das müsste
        // natürlich über die Daten koordiniert werden…
        target.classList.toggle('supplied')
      }
    }
  },
  computed: {
    sourceDOM () {
      return this.$store.getters.documentByPath(this.source)
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
    /*
    this.unwatchPageXML = this.$store.watch((state, getters) => getters.xmlCode,
      (newCode, oldCode) => {
        this.render()
      })
     */
    this.render()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
@import '@/css/_variables.scss';

.verovioComponent {
  margin: .5rem;
  padding: .5rem;
  border: $lightBorder;
  border-radius: .3rem;
  background-color: #ffffff;
  box-shadow: 0 0 .3rem #00000066 inset;
  max-height: calc(100% - 1rem);
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
}

</style>
