// import verovio from 'verovio'
// import createVerovioModule from 'verovio/wasm'
// import { VerovioToolkit } from 'verovio/esm'

/**
 * @namespace store.verovio
 */
const verovioModule = {
  /**
   * @namespace store.verovio.state
   * @property {Boolean} vrvInitFinished true if verovio is eventually initialized
   */
  state: {
    vrvInitFinished: false,
    tkqueue: []
  },
  mutations: {
  },
  /**
   * @namespace store.verovio.actions
   */
  actions: {
    /**
     * init Verovio toolkit
     * @memberof store.verovio.actions
     * @param {Object} context
     */
    initVerovio ({ state }, toolkit) {
      state.verovio = toolkit
    }
  },
  /**
   * @namespace store.verovio.getters
   */
  getters: {
    verovioToolkit: (state) => state.verovio,

    /**
     * @memberof store.verovio.getters
     * @param {Object} state
     * @returns {Object} verovio options
     * @see https://book.verovio.org/toolkit-reference/toolkit-options.html
     */
    diploPageBackgroundVerovioOptions: (state) => {
      const verovioOptions = {
        scale: 30,
        openControlEvents: true,
        svgBoundingBoxes: true,
        svgRemoveXlink: true,
        svgHtml5: true,
        header: 'none',
        footer: 'none',
        pageMarginTop: 0,
        pageMarginRight: 0,
        pageMarginBottom: 0,
        pageMarginLeft: 0,
        svgAdditionalAttribute: [
          'staff@rotate',
          'staff@n',
          'staff@pivot',
          'chord@stem.dir',
          'note@stem.dir',
          'beamSpan@startid',
          'beamSpan@endid']
      }

      return verovioOptions
    },

    /**
     * @memberof store.verovio.getters
     * @param {Object} state
     * @returns {Object} verovio options
     * @see https://book.verovio.org/toolkit-reference/toolkit-options.html
     */
    annotTransVerovioOptions: (state) => {
      const verovioOptions = {
        scale: 40,
        breaks: 'none',
        openControlEvents: true,
        svgBoundingBoxes: true,
        svgRemoveXlink: true,
        svgHtml5: true,
        header: 'none',
        footer: 'none',
        pageMarginTop: 200,
        pageMarginRight: 50,
        pageMarginLeft: 50,
        pageMarginBottom: 50,
        svgAdditionalAttribute: [
          'beam@corresp',
          'note@corresp',
          'chord@corresp',
          'measure@corresp',
          'staff@corresp',
          'rest@corresp',
          'mRest@corresp',
          'slur@corresp',
          'tie@corresp',
          'hairpin@corresp',
          'staff@rotate',
          'accid@corresp',
          'keySig@template',
          'keySig@sig',
          'staff@n',
          'clef@shape',
          'clef@line',
          'clef@corresp',
          'annot@class',
          'annot@corresp',
          'sb@corresp',
          'note@stem.dir',
          // 'note@grace',
          'chord@stem.dir',
          'note@dot-corresp',
          'rest@dot-corresp',
          'dynam@corresp',
          'dir@corresp',
          'measure@corresp',
          // not essential, but useful for debugging
          'meterSig@count',
          'meterSig@unit'
        ] //,
        // unit: 18
      }

      return verovioOptions
    },

    /**
     * renders an annotated transcription
     * @memberof store.verovio.getters
     * @param {Object} state
     * @param {Object} getters
     * @param {Object} dom the MEI document to render
     * @returns {Promise} the annotated transcription as SVG
     */
    annotatedTranscriptForWz: (state, getters) => async (dom) => {
      const serializer = new XMLSerializer()
      const vrvToolkit = getters.verovioToolkit
      // console.log('annotatedTranscriptForWz', dom)
      dom.querySelectorAll('keysig').forEach(element => {
        element.setAttribute('template', element.getAttribute('xml:id'))
        console.log('keysig:', element)
      })
      const mei = serializer.serializeToString(dom)
      vrvToolkit.setOptions(getters.annotTransVerovioOptions)
      vrvToolkit.loadData(mei)
      const svg = vrvToolkit.renderToSVG(1, {})

      return svg
    },

    /**
     * @memberof store.verovio.getters
     * @param {Object} state
     * @returns {Object} verovio options
     * @see https://book.verovio.org/toolkit-reference/toolkit-options.html
     */
    diploTransVerovioOptions: (state) => {
      const verovioOptions = {
        scale: 40,
        breaks: 'none',
        openControlEvents: true,
        svgBoundingBoxes: true,
        svgRemoveXlink: true,
        svgHtml5: true,
        header: 'none',
        footer: 'none',
        svgAdditionalAttribute: ['staff@rotate', 'staff@pivot', 'chord@stem.dir', 'note@stem.dir'] //,
        // unit: 18
      }

      return verovioOptions
    },

    /**
     * renders a diplomatic transcription
     * @memberof store.verovio.getters
     * @param {Object} state
     * @param {Object} getters
     * @param {Object} dom the MEI document to render
     * @returns {Promise} the diplomatic transcription as SVG
     */
    diplomaticTranscriptForWz: (state, getters) => async (dom) => {
      const serializer = new XMLSerializer()
      const vrvToolkit = await getters.verovioToolkit()

      dom.querySelectorAll('keysig').forEach(element => {
        console.log('keysig:', element.getAttribute('xml:id'))
      })

      const mei = serializer.serializeToString(dom)
      vrvToolkit.setOptions(getters.diploTransVerovioOptions)
      vrvToolkit.loadData(mei)
      const svg = vrvToolkit.renderToSVG(1, {})
      const svgdom = new DOMParser().parseFromString(svg)
      svgdom.querySelectorAll('[data-class="keySig"]').forEach(element => {
        console.log('keySig:', element.getAttribute('data-id'))
      })

      return svg
    }
  }
}

export default verovioModule
