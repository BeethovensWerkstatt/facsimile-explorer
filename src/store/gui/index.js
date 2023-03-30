/**
 * @namespace store.gui
 */
const guiModule = {
  /**
   * @namespace store.gui.state
   * @property {Boolean} pageTabSidebarVisible if the left sidebar in pageTab is visible
   * @property {Number} pageTabSidebarWidth width of the left sidebar in pageTab
   */
  state: {
    pageTabSidebarVisible: true,
    pageTabSidebarWidth: 400
  },
  /**
   * @namespace store.gui.mutations
   */
  mutations: {
    /**
     * sets width of sidebar in pageTab
     * @memberof store.gui.mutations
     * @param {[type]} state  [description]
     * @param {[type]} width  [description]
     */
    SET_PAGETAB_SIDEBAR_WIDTH (state, width) {
      state.pageTabSidebarWidth = width
    },
    /**
     * toggles visibility of sidebar in pageTab
     * @memberof store.gui.mutations
     * @param {[type]} state  [description]
     */
    TOGGLE_PAGETAB_SIDEBAR_VISIBILITY (state) {
      state.pageTabSidebarVisible = !state.pageTabSidebarVisible
    }
  },
  /**
   * @namespace store.gui.actions
   */
  actions: {
    /**
     * toggles visibility of the pageTab sidebar
     * @memberof store.gui.actions
     * @param  {[type]} commit               [description]
     * @return {[type]}        [description]
     */
    togglePageTabSidebar ({ commit }) {
      commit('TOGGLE_PAGETAB_SIDEBAR_VISIBILITY')
    }
  },
  /**
   * @namespace store.gui.getters
   */
  getters: {
    /**
     * returns visibility of sidebar on pageTab
     * @memberof store.gui.getters
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    pageTabSidebarVisible: (state) => {
      return state.pageTabSidebarVisible
    },
    /**
     * returns width of sidebar on pageTab
     * @memberof store.gui.getters
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    pageTabSidebarWidth: (state) => {
      return state.pageTabSidebarWidth
    }
  }
}

export default guiModule
