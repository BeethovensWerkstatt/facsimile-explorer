import verovio from 'verovio'

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
      verovio.module.onRuntimeInitialized = () => {
        state.vrvInitFinished = true
        while (state.tkqueue.length > 0) state.tkqueue.shift()()
      }
    }
  },
  /**
   * @namespace store.verovio.getters
   */
  getters: {
    verovioToolkit: (state) => () => {
      return new Promise((resolve) => {
        if (state.vrvInitFinished) {
          while (state.tkqueue.length > 0) state.tkqueue.shift()()
          // eslint-disable-next-line new-cap
          resolve(new verovio.toolkit())
        } else {
          // eslint-disable-next-line new-cap
          state.tkqueue.push(() => resolve(new verovio.toolkit()))
        }
      })
    },

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
        svgAdditionalAttribute: 'staff@rotateheight'
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
        footer: 'none' //,
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
        footer: 'none' //,
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
