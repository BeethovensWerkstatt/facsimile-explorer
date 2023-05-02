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
    }
  }
}

export default verovioModule
