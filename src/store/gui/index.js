const angleFunc = (p1, p2, direction) => {
  const dy = p2.y - p1.y
  const dx = p2.x - p1.x
  let theta = Math.atan2(dy, dx) // range (-PI, PI]
  theta *= 180 / Math.PI // rads to degs, range (-180, 180]
  // if (theta < 0) theta = 360 + theta; // range [0, 360)
  if (direction === 'vertical') {
    theta -= 90
  }
  return theta
}

/**
 * @namespace store.gui
 */
const guiModule = {
  /**
   * @namespace store.gui.state
   * @property {String} explorerTab the currently opened tab of the application
   * @property {String} modal the currently shown modal (null if none)
   * @property {Boolean} loading whether the app is currently loading data
   * @property {Boolean} processing whether the app is currently processing bigger data
   * @property {Boolean} pageTabSidebarVisible if the left sidebar in pageTab is visible
   * @property {Number} pageTabSidebarWidth width of the left sidebar in pageTab
   * @property {Boolean} pageTabRightSidebarVisible if the right sidebar in pageTab is visible
   * @property {Number} pageTabRightSidebarWidth width of the right sidebar in pageTab
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
   * @property {String} activeWritingZone ID of the currently active writing zone
   * @property {String} activeWritingLayer ID of the currently active writing layer
   * @property {String} activeSystem ID of the currently active system
   * @property {Object} focusRect
   * @property {String} awaitedDocument name of a document to be opened when sufficient data is available. Used to resolve routes
   * @property {Number} awaitedPage number of the page to be opened when sufficient data is available. Used to resolve routes
   * @property {Boolean} allDocsLoaded boolean if all docs / sources are successfully loaded
   * @property {Object} diploTransActivations an object of selected shapes and / or elements from the annotated transcription
   * @property {String} diploTransSelectedId ID of the currently selected element from the current diplomatic transcription
   * @property {Object} diploTransOsdBounds the OSD bounds currenlty viewed in both facsimile viewers
   */
  state: {
    explorerTab: 'home',
    modal: null,
    loading: false,
    processing: false,
    pageTabSidebarVisible: true,
    pageTabSidebarWidth: 310,
    pageTabRightSidebarVisible: true,
    pageTabRightSidebarWidth: 450,
    pageShowGrid: true,
    zonesTabLeftSidebarVisible: true,
    zonesTabLeftSidebarWidth: 310,
    zonesTabRightSidebarVisible: true,
    zonesTabRightSidebarWidth: 250,
    annotTabLeftSidebarVisible: true,
    annotTabLeftSidebarWidth: 310,
    annotTabRightSidebarVisible: true,
    annotTabRightSidebarWidth: 300,
    diploTabSidebarVisible: true,
    diploTabSidebarWidth: 310,
    activeWritingZone: null,
    activeWritingLayer: null,
    activeSystem: null,
    focusRect: null,
    pageBorderPoints: [],
    awaitedDocument: null,
    awaitedPage: -1,
    allDocsLoaded: false,
    diploTransActivations: {
      shapes: new Map(),
      annotTrans: new Map()
    },
    diploTransSelectedId: null,
    diploTransOsdBounds: null,
    activeDiploTransElementId: null
  },
  /**
   * @namespace store.gui.mutations
   */
  mutations: {
    /**
     * opens a given modal
     * @param {[type]} state  [description]
     * @param {[type]} modal  [description]
     */
    SET_MODAL (state, modal) {
      try {
        state.modal = modal
      } catch (err) {
        console.warn('something went wrong with modal "' + modal + '"')
        console.log(err)
      }
    },

    /**
     * shows a loading indicator
     * @param {[type]} state  [description]
     * @param {[type]} bool   [description]
     */
    SET_LOADING (state, bool) {
      state.loading = bool
    },

    /**
     * shows a processing indicator
     * @param {[type]} state  [description]
     * @param {[type]} bool   [description]
     */
    SET_PROCESSING (state, bool) {
      state.processing = bool
    },

    /**
     * opens a given tab
     * @param {[type]} state  [description]
     * @param {[type]} val    [description]
     */
    SET_EXPLORER_TAB (state, val) {
      const allowedTabs = ['home', 'pages', 'zones', 'annot', 'diplo']
      if (allowedTabs.indexOf(val) !== -1) {
        state.explorerTab = val
        state.diploTransBounds = null
      } else {
        console.error('Unknown application tab: ' + val)
      }
    },

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
     * sets width of right sidebar in pageTab
     * @memberof store.gui.mutations
     * @param {[type]} state  [description]
     * @param {[type]} width  [description]
     */
    SET_PAGETAB_RIGHT_SIDEBAR_WIDTH (state, width) {
      state.pageTabRightSidebarWidth = width
    },
    /**
     * toggles visibility of right sidebar in pageTab
     * @memberof store.gui.mutations
     * @param {[type]} state  [description]
     */
    TOGGLE_PAGETAB_RIGHT_SIDEBAR_VISIBILITY (state) {
      state.pageTabRightSidebarVisible = !state.pageTabRightSidebarVisible
    },
    /**
     * toggles visibility of grid in pageTab
     * @memberof store.gui.mutations
     * @param {[type]} state  [description]
     */
    TOGGLE_PAGE_SHOW_GRID (state) {
      state.pageShowGrid = !state.pageShowGrid
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
    },

    /**
     * sets the active writing zone
     * @param {[type]} state  [description]
     * @param {[type]} id     [description]
     */
    SET_ACTIVE_WRITINGZONE (state, id) {
      state.activeWritingZone = id
    },

    /**
     * sets the active writing layer
     * @param {[type]} state  [description]
     * @param {[type]} id     [description]
     */
    SET_ACTIVE_WRITINGLAYER (state, id) {
      state.activeWritingLayer = id
    },

    /**
     * sets the active system
     * @param {[type]} state  [description]
     * @param {[type]} id     [description]
     */
    SET_ACTIVE_SYSTEM (state, id) {
      state.activeSystem = id
    },

    /**
     * sets the OSD focus rect
     * @param {[type]} state  [description]
     * @param {[type]} xywh   [description]
     */
    FOCUS_RECT (state, xywh) {
      state.focusRect = xywh
    },

    /**
     * adds a point to the current page border points
     * @param {[type]} state  [description]
     * @param {[type]} x      [description]
     * @param {[type]} y      [description]
     */
    ADD_PAGE_BORDER_POINT (state, { x, y }) {
      state.pageBorderPoints.push({ x, y })
    },

    /**
     * resets the pageBorder points
     * @param {[type]} state  [description]
     */
    RESET_PAGE_BORDER_POINTS (state) {
      state.pageBorderPoints = []
    },

    /**
     * sets the awaited document (to be opened as soon as data is loaded)
     * @param {[type]} state  [description]
     * @param {[type]} name   [description]
     */
    SET_AWAITED_DOCUMENT (state, name) {
      state.awaitedDocument = name
    },

    /**
     * sets the awaited page number (to be openend as soon as data is loaded)
     * @param {[type]} state    [description]
     * @param {[type]} pageNum  [description]
     */
    SET_AWAITED_PAGE (state, pageNum) {
      state.awaitedPage = parseInt(pageNum)
    },

    /**
     * called once as soon as all documents are properly loaded
     * @param {[type]} state  [description]
     */
    SET_ALL_DOCS_LOADED (state) {
      state.allDocsLoaded = true
    },

    TOGGLE_DIPLO_TRANS_ITEM (state, { id, type, name, measure, path }) {
      if (type === 'annotTrans') {
        state.diploTransActivations.shapes.clear()
        if (state.diploTransActivations.annotTrans.has(id)) {
          state.diploTransActivations.annotTrans.delete(id)
        } else {
          state.diploTransActivations.annotTrans.clear()
          state.diploTransActivations.annotTrans.set(id, { id, name, measure, path })
        }
      } else if (type === 'shape') {
        if (state.diploTransActivations.shapes.has(id)) {
          state.diploTransActivations.shapes.delete(id)
        } else {
          state.diploTransActivations.shapes.set(id, { id, path })
        }
      }
    },

    /**
     * sets the ID of the selected item from the diplomatic transcription
     * @param {[type]} state  [description]
     * @param {[type]} id     [description]
     */
    DIPLO_TRANS_SELECT_ITEM (state, id) {
      state.diploTransSelectId = id
    },

    /**
     * sets the OSD bounds of the facsimile viewers
     * @param {[type]} state  [description]
     * @param {[type]} obj    [description]
     */
    SET_DIPLOTRANS_OSD_BOUNDS (state, obj) {
      state.diploTransOsdBounds = obj
    },

    /**
     * sets the ID of the active element in the diplomatic transcription
     * @param {*} state
     * @param {*} id
     */
    SET_ACTIVE_DIPLO_TRANS_ELEMENT_ID (state, id) {
      state.activeDiploTransElementId = id
    }
  },
  /**
   * @namespace store.gui.actions
   */
  actions: {
    /**
     * opens a given modal
     * @param {[type]} commit  [description]
     * @param {[type]} modal   [description]
     */
    setModal ({ commit }, modal) {
      commit('SET_MODAL', modal)
    },

    /**
     * shows a loading indicator
     * @param {[type]} commit  [description]
     * @param {[type]} bool    [description]
     */
    setLoading ({ commit }, bool) {
      commit('SET_LOADING', bool)
    },

    /**
     * shows a processing indicator
     * @param {[type]} commit  [description]
     * @param {[type]} bool    [description]
     */
    setProcessing ({ commit }, bool) {
      commit('SET_PROCESSING', bool)
    },

    /**
     * opens a given tab of the app
     * @param {[type]} commit  [description]
     * @param {[type]} val     [description]
     */
    setExplorerTab ({ commit, getters, dispatch }, val) {
      if (getters.isAuthenticated) {
        commit('SET_EXPLORER_TAB', val)
      }
    },

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
     * toggles visibility of the pageTab right sidebar
     * @memberof store.gui.actions
     * @param  {[type]} commit               [description]
     * @return {[type]}        [description]
     */
    togglePageTabRightSidebar ({ commit }) {
      commit('TOGGLE_PAGETAB_RIGHT_SIDEBAR_VISIBILITY')
    },
    /**
     * toggles visibility of the zonesTab left sidebar
     * @memberof store.gui.actions
     * @param  {[type]} commit               [description]
     * @return {[type]}        [description]
     */
    togglePageTabLeftSidebar ({ commit }) {
      commit('TOGGLE_PAGETAB_SIDEBAR_VISIBILITY')
    },
    /**
     * toggles visibility of the grid on the pageTab
     */
    togglePageShowGrid ({ commit }) {
      commit('TOGGLE_PAGE_SHOW_GRID')
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
    },

    /**
     * sets ID of active WritingZone
     * @param {[type]} commit  [description]
     * @param {[type]} id      [description]
     */
    setActiveWritingZone ({ commit, getters }, id) {
      commit('SET_ACTIVE_WRITINGZONE', id)

      if (id !== null) {
        const genDescWritingZone = getters.genDescForCurrentWritingZone
        const genDescWritingLayer = genDescWritingZone.querySelector('genState')
        const genDescWlId = genDescWritingLayer.getAttribute('xml:id')

        commit('SET_ACTIVE_WRITINGLAYER', genDescWlId)
      } else {
        commit('SET_ACTIVE_WRITINGLAYER', null)
      }
    },

    /**
     * sets ID of active WritingLayer
     * @param {[type]} commit  [description]
     * @param {[type]} id      [description]
     */
    setActiveWritingLayer ({ commit }, id) {
      commit('SET_ACTIVE_WRITINGLAYER', id)
    },

    /**
     * sets ID of active system
     * @param {[type]} commit  [description]
     * @param {[type]} id      [description]
     */
    setActiveSystem ({ commit }, id) {
      commit('SET_ACTIVE_SYSTEM', id)
    },

    /**
     * sets OSD focus rect
     * @param  {[type]} commit               [description]
     * @param  {[type]} xywh                 [description]
     * @return {[type]}        [description]
     */
    focusRect ({ commit }, xywh) {
      commit('FOCUS_RECT', xywh)
    },

    /**
     * handles the action when clicking onto the facsimile
     * @param  {[type]} commit                 [description]
     * @param  {[type]} getters                [description]
     * @param  {[type]} dispatch               [description]
     * @param  {[type]} x                      [description]
     * @param  {[type]} y                      [description]
     * @param  {[type]} shift                  [description]
     * @return {[type]}          [description]
     */
    facsimileClick ({ commit, getters, dispatch }, { x, y, shift }) {
      //
    },

    /**
     * adds a point to the current page border
     * @param {[type]} commit  [description]
     * @param {[type]} x       [description]
     * @param {[type]} y       [description]
     */
    addPageBorderPoint ({ commit, getters }, { x, y }) {
      if (getters.pageBorderPointsIncomplete) {
        commit('ADD_PAGE_BORDER_POINT', { x, y })
      } else { // temporary
        commit('RESET_PAGE_BORDER_POINTS')
      }
    },

    /**
     * resets the pageBorder points
     * @param {[type]} commit  [description]
     */
    resetPageBorderPoints ({ commit }) {
      commit('RESET_PAGE_BORDER_POINTS')
    },

    /**
     * this is a document name that shall be opened as soon as sufficient data for that is available
     * @param {[type]} commit    [description]
     * @param {[type]} getters   [description]
     * @param {[type]} filename  [description]
     */
    setAwaitedDocument ({ commit, getters }, filename) {
      commit('SET_AWAITED_DOCUMENT', filename)
    },

    /**
     * keeps the number of hte page to be openend when data is loaded
     * @param {[type]} commit   [description]
     * @param {[type]} pageNum  [description]
     */
    setAwaitedPage ({ commit }, pageNum) {
      if (pageNum === parseInt(pageNum)) {
        commit('SET_AWAITED_PAGE', pageNum)
      }
    },

    /**
     * used to flag that all documents are loaded
     * @param {[type]} commit  [description]
     */
    setAllDocsLoaded ({ commit }) {
      commit('SET_ALL_DOCS_LOADED')
    },

    /**
     * toggles an item (either SVG shape or from the annotated transcription in the selection for the diplomatic transcription
     * @param  {[type]} commit               [description]
     * @param  {[type]} type                 [description]
     * @param  {[type]} id                   [description]
     * @param  {[type]} name                 [description]
     * @param  {[type]} path                 [description]
     * @return {[type]}        [description]
     */
    diploTransToggle ({ commit, getters }, { type, id, name, measure, path }) {
      if (getters.activeWritingZone !== null) {
        commit('TOGGLE_DIPLO_TRANS_ITEM', { type, id, name, measure, path })
      }
    },

    /**
     * selects an element from the diplomatic transcription
     * @param  {[type]} commit               [description]
     * @param  {[type]} id                   [description]
     * @return {[type]}        [description]
     */
    diploTransSelectId ({ commit, getters }, id) {
      if (getters.activeWritingZone !== null) {
        commit('DIPLO_TRANS_SELECT_ITEM', id)
      }
    },

    /**
     * sets the OSD bounds of the facsimile viewers
     * @param  {[type]} commit               [description]
     * @param  {[type]} originOsd            [description]
     * @param  {[type]} bounds               [description]
     * @return {[type]}        [description]
     */
    setDiploTransOsdBounds ({ commit }, { originOsd, bounds }) {
      commit('SET_DIPLOTRANS_OSD_BOUNDS', { originOsd, bounds })
    },

    /**
     * sets the ID of the active element in the diplomatic transcription
     * @param {*} id
     */
    setActiveDiploTransElementId ({ commit }, id) {
      commit('SET_ACTIVE_DIPLO_TRANS_ELEMENT_ID', id)
    }
  },
  /**
   * @namespace store.gui.getters
   */
  getters: {
    /**
     * returns the currently opened modal
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    modal: state => {
      return state.modal
    },

    /**
     * whether a loading indicator should be visible
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    loading: state => {
      return state.loading
    },

    /**
     * whether a processing indicator should be visible
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    processing: state => {
      return state.processing
    },

    /**
     * the currently shown tab of the application
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    explorerTab: state => {
      return state.explorerTab
    },

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
     * returns visibility of right sidebar on pageTab
     * @memberof store.gui.getters
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    pageTabRightSidebarVisible: (state) => {
      return state.pageTabRightSidebarVisible
    },
    /**
     * returns width of right sidebar on pageTab
     * @memberof store.gui.getters
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    pageTabRightSidebarWidth: (state) => {
      return state.pageTabRightSidebarWidth
    },
    /**
     * returns visibility of grid on pageTab
     * @memberof store.gui.getters
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    pageShowGrid: (state) => {
      return state.pageShowGrid
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
    },

    /**
     * returns ID of active writingZone
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    activeWritingZone: (state) => {
      return state.activeWritingZone
    },

    /**
     * returns ID of active writingLayer
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    activeWritingLayer: (state) => {
      return state.activeWritingLayer
    },

    /**
     * returns ID of active system
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    activeSystemId: (state) => {
      return state.activeSystem
    },

    /**
     * returns rectangle (xywh) that OSD is supposed to focus
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    focusRect: (state) => {
      return state.focusRect
    },

    /**
     * returns whether all points for determining the rectangle of the current
     * page are available already
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    pageBorderPointsIncomplete: (state) => {
      return state.pageBorderPoints.length < 3
    },

    /**
     * returns all points for the rectangle defining the current page's bounding
     * box
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    pageBorderPoints: (state, getters) => {
      const fragment = getters.currentPageFragmentIdentifier

      // generate pagePoints from fragment
      if (state.pageBorderPoints.length === 0 && fragment !== null) {
        const arr = []
        arr.push({ x: fragment.x, y: fragment.y })
        arr.push({ x: fragment.x, y: fragment.y + fragment.h })
        arr.push({ x: fragment.x + fragment.w, y: fragment.y })

        return arr
      }

      return state.pageBorderPoints
    },

    /**
     * returns the number of pageBorderPoints (0 to 3)
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    pageBorderPointsLength: (state) => {
      return state.pageBorderPoints.length
    },

    /**
     * returns the angle of the current page's bounding box
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    currentPageAngle: (state) => {
      if (state.pageBorderPoints.length < 2) {
        return null
      }

      const p1 = state.pageBorderPoints[0]
      const p2 = state.pageBorderPoints[1]

      const angle = angleFunc(p1, p2, 'vertical')
      return angle
    },

    /**
     * returns the name of the currently awaited document (if any)
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    awaitedDocument: (state) => {
      return state.awaitedDocument
    },

    /**
     * returns the number of the currently awaited page (if any)
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    awaitedPage: (state) => {
      return state.awaitedPage
    },

    /**
     * returns if all docs are loaded
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    allDocsLoaded: (state) => {
      return state.allDocsLoaded
    },

    /**
     * returns an array with the IDs of all selected SVG shapes
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    diploTransActivationsInShapes: (state) => {
      return [...state.diploTransActivations.shapes.values()]
    },

    /**
     * returns a Map with id (key) and id / name (value) props of all selected elements from the annotTrans
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    diploTransActivationsInAnnotTrans: (state) => {
      if (state.diploTransActivations.annotTrans.size === 0) {
        return null
      }
      return [...state.diploTransActivations.annotTrans.values()][0]
    },

    /**
     * returns the ID of the element selected from the diplomatic transcript
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    diploTransSelectedId: (state) => {
      return state.diploTransSelectedId
    },

    /**
     * returns the OSD bounds of the facsimile viewers
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
     */
    diploTransOsdBounds: (state) => {
      return state.diploTransOsdBounds
    },

    /**
     * returns the ID of the currently active element in the diplomatic transcription
     * @param {*} state
     * @returns
     */
    activeDiploTransElementId: (state) => {
      return state.activeDiploTransElementId
    }
  }
}

export default guiModule
