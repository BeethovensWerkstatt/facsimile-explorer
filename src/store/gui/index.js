/**
 * @namespace store.gui
 */
const guiModule = {
  /**
   * @namespace store.gui.state
   * @property {Boolean} pageTabSidebarVisible if the left sidebar in pageTab is visible
   * @property {Number} pageTabSidebarWidth width of the left sidebar in pageTab
   * @property {Boolean} zonesTabLeftSidebarVisible if the left sidebar in zonesTab is visible
   * @property {Number} zonesTabLeftSidebarWidth width of the left sidebar in zonesTab
   * @property {Boolean} zonesTabRightSidebarVisible if the left sidebar in zonesTab is visible
   * @property {Number} zonesTabRightSidebarWidth width of the left sidebar in zonesTab
   * @property {Boolean} annotTabLeftSidebarVisible if the left sidebar in annotTab is visible
   * @property {Number} annotTabLeftSidebarWidth width of the left sidebar in annotTab
   * @property {Boolean} annotTabRightSidebarVisible if the right sidebar in annotTab is visible
   * @property {Number} annotTabRightSidebarWidth width of the right sidebar in annotTab
   * @property {Boolean} diploTabSidebarVisible if the left sidebar in diploTab is visible
   * @property {Number} diploTabSidebarWidth width of the left sidebar in diploTab
   */
  state: {
    pageTabSidebarVisible: true,
    pageTabSidebarWidth: 300,
    zonesTabLeftSidebarVisible: true,
    zonesTabLeftSidebarWidth: 200,
    zonesTabRightSidebarVisible: true,
    zonesTabRightSidebarWidth: 250,
    annotTabLeftSidebarVisible: true,
    annotTabLeftSidebarWidth: 200,
    annotTabRightSidebarVisible: true,
    annotTabRightSidebarWidth: 300,
    diploTabSidebarVisible: true,
    diploTabSidebarWidth: 300
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
    },
    /**
     * sets width of left sidebar in zonesTab
     * @memberof store.gui.mutations
     * @param {[type]} state  [description]
     * @param {[type]} width  [description]
     */
    SET_ZONESTAB_LEFT_SIDEBAR_WIDTH (state, width) {
      state.zonesTabLeftSidebarWidth = width
    },
    /**
     * toggles visibility of left sidebar in zonesTab
     * @memberof store.gui.mutations
     * @param {[type]} state  [description]
     */
    TOGGLE_ZONESTAB_LEFT_SIDEBAR_VISIBILITY (state) {
      state.zonesTabLeftSidebarVisible = !state.zonesTabLeftSidebarVisible
    },
    /**
     * sets width of right sidebar in zonesTab
     * @memberof store.gui.mutations
     * @param {[type]} state  [description]
     * @param {[type]} width  [description]
     */
    SET_ZONESTAB_RIGHT_SIDEBAR_WIDTH (state, width) {
      state.zonesTabRightSidebarWidth = width
    },
    /**
     * toggles visibility of right sidebar in zonesTab
     * @memberof store.gui.mutations
     * @param {[type]} state  [description]
     */
    TOGGLE_ZONESTAB_RIGHT_SIDEBAR_VISIBILITY (state) {
      state.zonesTabRightSidebarVisible = !state.zonesTabRightSidebarVisible
    },
    /**
     * sets width of left sidebar in annotTab
     * @memberof store.gui.mutations
     * @param {[type]} state  [description]
     * @param {[type]} width  [description]
     */
    SET_ANNOTTAB_LEFT_SIDEBAR_WIDTH (state, width) {
      state.annotTabLeftSidebarWidth = width
    },
    /**
     * toggles visibility of left sidebar in annotTab
     * @memberof store.gui.mutations
     * @param {[type]} state  [description]
     */
    TOGGLE_ANNOTTAB_LEFT_SIDEBAR_VISIBILITY (state) {
      state.annotTabLeftSidebarVisible = !state.annotTabLeftSidebarVisible
    },
    /**
     * sets width of right sidebar in annotTab
     * @memberof store.gui.mutations
     * @param {[type]} state  [description]
     * @param {[type]} width  [description]
     */
    SET_ANNOTTAB_RIGHT_SIDEBAR_WIDTH (state, width) {
      state.annotTabRightSidebarWidth = width
    },
    /**
     * toggles visibility of right sidebar in annotTab
     * @memberof store.gui.mutations
     * @param {[type]} state  [description]
     */
    TOGGLE_ANNOTTAB_RIGHT_SIDEBAR_VISIBILITY (state) {
      state.annotTabRightSidebarVisible = !state.annotTabRightSidebarVisible
    },
    /**
     * sets width of sidebar in diploTab
     * @memberof store.gui.mutations
     * @param {[type]} state  [description]
     * @param {[type]} width  [description]
     */
    SET_DIPLOTAB_SIDEBAR_WIDTH (state, width) {
      state.diploTabSidebarWidth = width
    },
    /**
     * toggles visibility of sidebar in diploTab
     * @memberof store.gui.mutations
     * @param {[type]} state  [description]
     */
    TOGGLE_DIPLOTAB_SIDEBAR_VISIBILITY (state) {
      state.diploTabSidebarVisible = !state.diploTabSidebarVisible
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
    },
    /**
     * toggles visibility of the zonesTab left sidebar
     * @memberof store.gui.actions
     * @param  {[type]} commit               [description]
     * @return {[type]}        [description]
     */
    toggleZonesTabLeftSidebar ({ commit }) {
      commit('TOGGLE_ZONESTAB_LEFT_SIDEBAR_VISIBILITY')
    },
    /**
     * toggles visibility of the zonesTab right sidebar
     * @memberof store.gui.actions
     * @param  {[type]} commit               [description]
     * @return {[type]}        [description]
     */
    toggleZonesTabRightSidebar ({ commit }) {
      commit('TOGGLE_ZONESTAB_RIGHT_SIDEBAR_VISIBILITY')
    },
    /**
     * toggles visibility of the annotTab left sidebar
     * @memberof store.gui.actions
     * @param  {[type]} commit               [description]
     * @return {[type]}        [description]
     */
    toggleAnnotTabLeftSidebar ({ commit }) {
      commit('TOGGLE_ANNOTTAB_LEFT_SIDEBAR_VISIBILITY')
    },
    /**
     * toggles visibility of the annotTab right sidebar
     * @memberof store.gui.actions
     * @param  {[type]} commit               [description]
     * @return {[type]}        [description]
     */
    toggleAnnotTabRightSidebar ({ commit }) {
      commit('TOGGLE_ANNOTTAB_RIGHT_SIDEBAR_VISIBILITY')
    },
    /**
     * toggles visibility of the diploTab sidebar
     * @memberof store.gui.actions
     * @param  {[type]} commit               [description]
     * @return {[type]}        [description]
     */
    toggleDiploTabSidebar ({ commit }) {
      commit('TOGGLE_DIPLOTAB_SIDEBAR_VISIBILITY')
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
    },
    /**
     * returns visibility of left sidebar on zonesTab
     * @memberof store.gui.getters
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    zonesTabLeftSidebarVisible: (state) => {
      return state.zonesTabLeftSidebarVisible
    },
    /**
     * returns width of left sidebar on zonesTab
     * @memberof store.gui.getters
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    zonesTabLeftSidebarWidth: (state) => {
      return state.zonesTabLeftSidebarWidth
    },
    /**
     * returns visibility of right sidebar on zonesTab
     * @memberof store.gui.getters
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    zonesTabRightSidebarVisible: (state) => {
      return state.zonesTabRightSidebarVisible
    },
    /**
     * returns width of right sidebar on zonesTab
     * @memberof store.gui.getters
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    zonesTabRightSidebarWidth: (state) => {
      return state.zonesTabRightSidebarWidth
    },
    /**
     * returns visibility of left sidebar on annotTab
     * @memberof store.gui.getters
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    annotTabLeftSidebarVisible: (state) => {
      return state.annotTabLeftSidebarVisible
    },
    /**
     * returns width of left sidebar on annotTab
     * @memberof store.gui.getters
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    annotTabLeftSidebarWidth: (state) => {
      return state.annotTabLeftSidebarWidth
    },
    /**
     * returns visibility of right sidebar on annotTab
     * @memberof store.gui.getters
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    annotTabRightSidebarVisible: (state) => {
      return state.annotTabRightSidebarVisible
    },
    /**
     * returns width of right sidebar on annotTab
     * @memberof store.gui.getters
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    annotTabRightSidebarWidth: (state) => {
      return state.annotTabRightSidebarWidth
    },
    /**
     * returns visibility of sidebar on diploTab
     * @memberof store.gui.getters
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    diploTabSidebarVisible: (state) => {
      return state.diploTabSidebarVisible
    },
    /**
     * returns width of sidebar on diploTab
     * @memberof store.gui.getters
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    diploTabSidebarWidth: (state) => {
      return state.diploTabSidebarWidth
    }
  }
}

export default guiModule
