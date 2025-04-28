<template>
  <div class="verovioComponent" ref="verovioContainer"><div :class="purpose" ref="mei">
    <div class="placeholder">no transcript available ...</div>
  </div></div>
</template>

<script>
import { draft2score, draft2page, addSbIndicators } from '@/tools/mei.js'
import { resolveSbIndicators } from '@/tools/annotatedTranscripts.js'
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
  'tie',
  'dynam',
  'dir',
  'keySig',
  'meterSig',
  'barLine',
  'dots'
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
    pathGetter: String,
    scale: {
      type: String,
      default: '2'
    }
  },
  computed: {
    ...mapGetters(['diploPageBackgroundVerovioOptions', 'annotTransVerovioOptions'])
  },
  watch: {
    scale (newScale, oldScale) {
      const fac = +newScale / +oldScale
      const hscroll = this.$refs.verovioContainer.scrollLeft
      this.$refs.verovioContainer.scrollTo({ left: hscroll * fac, behaviour: 'instant' })
      this.render()
    }
  },
  methods: {
    async render () {
      const meiDom = this.$store.getters[this.getter]

      if (!meiDom) {
        // console.log('VerovioComponent:render(): No data available.')
        this.$refs.mei.innerHTML = '<div class="placeholder"><!-- loading data… -->select writing zone ...</div>'
        return false
      }

      try {
        this.removeListeners()
        if (this.type === 'annotTrans') {
          const resolvedDraft = draft2score(meiDom)[0]
          const addedSbIndicators = addSbIndicators(resolvedDraft)
          console.log('VerovioComponent', meiDom, addedSbIndicators)

          const svg = await this.$store.getters.annotatedTranscriptForWz(addedSbIndicators)
          const localCopy = svg.repeat(1)
          const left = this.$refs.verovioContainer.scrollLeft
          console.log('VerovioComponent left', left)
          this.$refs.mei.innerHTML = localCopy

          if (+this.scale > 0 || !this.scale) {
            const nre = /^([0-9.]*)([a-z]*)$/
            const whnum = (att) => +att.match(nre)[1]

            const svgDom = resolveSbIndicators(this.$refs.mei.querySelector('svg'), meiDom, this.$store.getters)
            const svgWidth = whnum(svgDom.getAttribute('width'))
            const svgHeight = whnum(svgDom.getAttribute('height'))
            const percHeight = 10 * +this.scale
            const percWidth = percHeight * svgWidth / svgHeight
            // console.log(`VerovioComponent width="${svgWidth}" height="${svgHeight}"`)
            svgDom.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`)
            svgDom.removeAttribute('width')
            svgDom.removeAttribute('height')
            svgDom.setAttribute('style', `width: ${percWidth}%; height: ${percHeight}%; max-width: none; max-height: none;`)
          }

          this.$refs.verovioContainer.scrollTo({ left, behaviour: 'smooth' })
        }

        if (this.type === 'diploTrans') {
          const resolvedTrans = draft2page(meiDom)

          const svg = await this.$store.getters.diplomaticTranscriptForWz(resolvedTrans)
          const localCopy = svg.repeat(1)
          this.$refs.mei.innerHTML = localCopy
        }

        this.addListeners()
      } catch (err) {
        console.warn('VerovioComponent:render(): Unable to render file: ' + err, err)
      }
    },
    removeListeners () {
      this.$refs.mei.removeEventListener('click', this.clickListener)
      this.$refs.mei.removeEventListener('mouseover', this.hoverListener)
      this.$refs.mei.removeEventListener('mouseout', this.hoverListener)
      /* const els = this.$refs.mei.querySelectorAll(selectables)
      els.forEach((elm) => elm.removeEventListener('click', this.clickListener)) */
    },
    addListeners () {
      this.$refs.mei.addEventListener('click', this.clickListener)
      this.$refs.mei.addEventListener('mouseover', this.hoverListener)
      this.$refs.mei.addEventListener('mouseout', this.hoverListener)
      /* const els = this.$refs.mei.querySelector('selectables')
      els.forEach((elm) => elm.addEventListener('click', this.clickListener)) */
    },
    clickListener (e) {
      const target = e.target.closest(selectables)

      // console.log('\n\n841 clickListener', target)

      if (target !== null) {
        // TODO: Hier müssen wir auf this.purpose reagieren und unterschiedliche
        // Aktionen ausführen. Hier erstmal nur zur Anschauung – das müsste
        // natürlich über die Daten koordiniert werden…
        // target.classList.toggle('supplied')

        // const isBarline = target.classList.contains('barLine')

        const name = target.getAttribute('data-class')
        const id = (name === 'dots') ? target.closest('.note').getAttribute('data-id') : target.getAttribute('data-id')
        const measure = target.closest('.measure').getAttribute('data-id')

        const meiDom = this.$store.getters[this.getter]
        const path = this.$store.getters[this.pathGetter]

        const dtPath = target.closest('g[data-dt-path]').getAttribute('data-dt-path')
        console.log('\n841 clicked verovio\nname: ' + name + '\nid: ' + id + '\nmeasure: ' + measure + '\npath: ' + path + '\npurpose: ' + this.purpose + '\ndtPath: ' + dtPath)
        this.$store.dispatch('clickedVerovio', {
          meiDom,
          path,
          dtPath,
          id,
          name,
          measure,
          purpose: this.purpose,
          callback: () => { this.render() }
        })
      }
    },
    // TODO: make global getter in score to retrieve related objects
    hoverListener (e) {
      const hilite = (target) => target?.classList[(activate ? 'add' : 'remove')]('highlightHover')
      const activate = e.type === 'mouseover'
      const target = e.target.closest(selectables)
      if (target !== null) {
        // console.log('hover:', target)
        hilite(target)
        const corresp = target.getAttribute('data-corresp')
        if (corresp) {
          const dtid = corresp.split('#')[1]
          // console.log(activate, this.$store.getters.activeWritingZone, dtid)
          const dtdoc = this.$store.getters.diplomaticTranscriptForCurrentWz
          const dtelm = dtdoc?.querySelector(`[*|id="${dtid}"]`)
          const dtsvg = document.querySelector(`[*|data-id="${dtid}"]`)
          hilite(dtsvg)
          // console.log(dtelm.parentElement, dtelm, dtsvg)
          const getFacs = elm => {
            if (elm.hasAttribute('facs')) {
              return elm.getAttribute('facs')
            }
            if (elm.parentElement) {
              return getFacs(elm.parentElement)
            }
            return ''
          }
          if (dtelm) {
            const facs = getFacs(dtelm)
            const shapes = facs.split(' ').map(furl => {
              const shapeid = furl.split('#')[1]
              return document.querySelector(`[*|id="${shapeid}"]`)
            })
            shapes.forEach(hilite)
          }
          // console.log(shapes)
        }
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
    // console.log('932: mounting verovio component')
    this.vrvToolkit = this.$store.getters.verovioToolkit
    this.vrvToolkit.setOptions(this.annotTransVerovioOptions)

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

    this.unwatchDTElementId = this.$store.watch((state, getters) => getters.activeDiploTransElementdIds,
      (newID, oldID) => {
        if (this.purpose === 'transcribing') {
          // console.log(oldID.at, '=>', newID.at, this.$refs.mei.querySelectorAll(`[data-id="${newID.at}"]`))
          this.$refs.mei.querySelectorAll(`[data-id="${oldID.at[0]}"]`).forEach(e => e.classList.remove('highlightDTChain'))
          this.$refs.mei.querySelectorAll(`[data-id="${newID.at[0]}"]`).forEach(e => e.classList.add('highlightDTChain'))
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
    this.unwatchDTElementId()
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
  height: 100%;
  width: 100%;
  overflow: scroll;

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

  svg g.note:not(.bounding-box) g.accid:not(.highlighted):not(*[data-corresp]) {
    stroke: black;
    fill: black;
  }
  svg g.note:not(.bounding-box) g.verse:not(.highlighted):not(*[data-corresp]) {
    stroke: black;
    fill: black;
  }
  svg g.beam:not(.bounding-box) > g:not(.highlighted):not(*[data-corresp]) {
    stroke: black;
    fill: black;
  }

  svg .bounding-box rect {
    display: none;
  }

  svg g.dir.sb {
    font-style: normal;
  }

  svg .dots:not([data-corresp]) {
    fill: currentColor;
    stroke: currentColor;
  }

  svg rect.pageLabelBox {
    fill: $verovioAtPageLabelBox;
  }

  svg rect.pageBg {
    fill: #ffffff;
  }

  svg rect.sysPreview {
    fill: red;
  }
}

</style>
