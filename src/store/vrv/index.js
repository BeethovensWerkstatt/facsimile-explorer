import verovio from 'verovio'
// import createVerovioModule from 'verovio/wasm'
// import { VerovioToolkit } from 'verovio/esm'
let tk = null

verovio.module.onRuntimeInitialized = () => {
  // eslint-disable-next-line new-cap
  tk = new verovio.toolkit()
}

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
    async initVerovio ({ state }) {
      state.verovio = tk
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
        svgAdditionalAttribute: ['staff@rotate']
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
        svgAdditionalAttribute: ['beam@corresp', 'note@corresp', 'chord@corresp', 'measure@corresp', 'rest@corresp', 'slur@corresp'] //,
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
      const vrvToolkit = await getters.verovioToolkit()
      console.log('annotatedTranscriptForWz', dom)
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
        svgAdditionalAttribute: ['staff@rotate'] //,
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

      const mei = serializer.serializeToString(dom)
      vrvToolkit.setOptions(getters.diploTransVerovioOptions)
      vrvToolkit.loadData(mei)
      const svg = vrvToolkit.renderToSVG(1, {})

      return svg
    }
  }
}

export default verovioModule
