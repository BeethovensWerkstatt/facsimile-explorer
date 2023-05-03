import { createStore } from 'vuex'
import { iiifManifest2mei, checkIiifManifest, getPageArray } from '@/tools/iiif.js'
import { initializePageIfNecessary, generateSystemFromRect, insertSystem } from '@/tools/mei.js'
import octokitModule from '@/store/octokit'
import verovioModule from '@/store/vrv'
import guiModule from '@/store/gui'
import VuexPersistence from 'vuex-persist'

/* function nsResolver (prefix) {
  const ns = {
    xhtml: 'http://www.w3.org/1999/xhtml',
    mathml: 'http://www.w3.org/1998/Math/MathML',
    mei: 'http://www.music-encoding.org/ns/mei',
    svg: 'http://www.w3.org/2000/svg',
    tei: 'http://www.tei-c.org/ns/1.0'
  }
  return ns[prefix] || null
} */

/**
 * A Parser for reading in the XML Document
 * @type {DOMParser}
 */
const parser = new DOMParser()

/**
 * An XML Serializer for converting back to string
 * @type {XMLSerializer}
 */
const serializer = new XMLSerializer()

/**
 * persist state to localStorage
 * TODO? use localforage?
 */
const vuexLocal = new VuexPersistence({
  storage: window.sessionStorage,
  reducer: state => ({
    currentTab: state.currentTab,
    pages: state.pages,
    fileowner: state.fileowner,
    filerepo: state.filerepo,
    fileref: state.fileref,
    sources: state.sources,
    filepath: state.filepath,
    filesha: state.filesha
  })
})

/**
 * The Vuex Store of facsimile-explorer
 * @type {Object}
 */
export default createStore({
  modules: {
    octokitModule,
    verovioModule,
    guiModule
  },
  plugins: [vuexLocal.plugin],
  state: {
    explorerTab: 'home',
    pages: [],
    currentPage: -1,
    previewPage: -1,
    title: '',
    parsedXml: null,
    temporaryCode: '',
    wellformed: false,
    modal: null,
    loading: false,
    processing: false,
    selectionRectEnabled: false,
    selectionRect: null,
    selectedSystemOnCurrentPage: -1,
    editingSystemOnCurrentPage: -1,
    pageSVGs: [],
    currentTab: 'home' // allowed values: 'home', 'pages', 'systems', 'zones', 'diplo'
  },
  mutations: {
    SET_XML_DOC (state, domDoc) {
      const surfaces = domDoc.querySelectorAll('surface')
      surfaces.forEach((surface, i) => {
        const svg = surface.querySelector('svg')
        state.pageSVGs[i] = svg // shall we svg.clone(true) ?
        if (svg) {
          svg.remove()
        }
      })
      state.parsedXml = domDoc
    },
    SET_TEMPORARY_CODE (state, string) {
      state.temporaryCode = string
    },
    SET_PAGES (state, arr) {
      // faulty IIIF server
      state.pages = arr.map(p => ({ ...p, uri: (p.uri?.startsWith('https://gallica.bnf.fr/iiif/') && !p.uri?.endsWith('/info.json')) ? p.uri + '/info.json' : p.uri }))
      // console.log(state.pages)
    },
    SET_PAGE_SVG (state, { i, svg }) {
      state.pageSVGs[i] = svg
    },
    SET_CURRENT_PAGE (state, i) {
      state.previewPage = -1
      state.currentPage = i
    },
    SET_PREVIEW_PAGE (state, i) {
      state.previewPage = i
    },
    SET_TITLE (state, title) {
      state.title = title
    },
    SET_WELLFORMED (state, bool) {
      state.wellformed = bool
    },
    SET_MODAL (state, modal) {
      state.modal = modal
    },
    SET_LOADING (state, bool) {
      state.loading = bool
    },
    SET_PROCESSING (state, bool) {
      state.processing = bool
    },
    SET_EXPLORER_TAB (state, val) {
      state.explorerTab = val
    },
    SET_SELECTION_RECT_ENABLED (state, bool) {
      state.selectionRectEnabled = bool
      state.selectionRect = null
    },
    UPDATE_SYSTEM_COORDINATES (state, sys) {
      // todo: check if needed
      // state.selectionRect = rect
      const index = sys.i
      console.log('need to fix system ' + index)
      console.log(sys)

      const xmlDoc = state.parsedXml.cloneNode(true)
      const pageIndex = state.currentPage + 1
      const pageQueryString = 'page:nth-child(' + pageIndex + ')'
      const page = xmlDoc.querySelector(pageQueryString)

      const pageHeight = parseInt(page.getAttribute('page.height'))
      const uly = pageHeight - sys.rect.y
      const left = sys.rect.x
      const right = sys.rect.w + sys.rect.x

      const system = page.querySelectorAll('system')[index]
      const measure = system.querySelector('measure')
      const staff = measure.querySelector('staff')

      staff.setAttribute('coord.y1', uly)
      measure.setAttribute('coord.x1', left)
      measure.setAttribute('coord.x2', right)

      state.parsedXml = null
      state.parsedXml = xmlDoc

      state.editingSystemOnCurrentPage = -1
    },
    CREATE_SYSTEM (state, rect) {
      const xmlDoc = state.parsedXml.cloneNode(true)
      const pageIndex = state.currentPage + 1
      const pageQueryString = 'page:nth-child(' + pageIndex + ')'
      const page = xmlDoc.querySelector(pageQueryString)

      const pageHeight = parseInt(page.getAttribute('page.height'))
      const newSystemUly = pageHeight - rect.y
      const left = rect.x
      const right = rect.w + rect.x
      const height = rect.h

      const existingSystems = page.querySelectorAll('system')
      let i = 0

      while (existingSystems.length > i && parseInt(existingSystems[i].getAttribute('uly')) > newSystemUly) {
        i++
      }
      const newSystem = generateSystemFromRect(newSystemUly, left, right)

      if (existingSystems.length === 0) {
        initializePageIfNecessary(page, height)
        insertSystem(page, newSystem, null)
      } else {
        const followingSystem = existingSystems[i]
        insertSystem(page, newSystem, followingSystem)
      }

      state.parsedXml = xmlDoc
    },
    SET_SELECTED_SYSTEM_ON_CURRENT_PAGE (state, i) {
      state.selectedSystemOnCurrentPage = i
    },
    SET_EDITING_SYSTEM_ON_CURRENT_PAGE (state, i) {
      console.log('working here ' + i)
      // if (state.selectionRectEnabled) {
      state.editingSystemOnCurrentPage = i

      const xmlDoc = state.parsedXml
      const pageIndex = state.currentPage + 1
      const pageQueryString = 'page:nth-child(' + pageIndex + ')'
      const page = xmlDoc.querySelector(pageQueryString)

      const systemIndex = i + 1
      const systemQueryString = 'system:nth-of-type(' + systemIndex + ')'
      const system = page.querySelector(systemQueryString)
      const measure = page.querySelector('measure')

      const pageHeight = state.pages[state.currentPage].height

      console.log(system)

      const x = parseInt(measure.getAttribute('coord.x1'))
      const y = parseInt(pageHeight - parseInt(system.getAttribute('uly')))
      const w = parseInt(measure.getAttribute('coord.x2') - x)
      const h = parseInt(Math.round(pageHeight / 30))

      console.log('xywh:', x, y, w, h)
      // }
    },
    OPEN_TAB (state, tab) {
      const allowedTabs = ['home', 'pages', 'zones', 'annot', 'diplo']
      if (allowedTabs.indexOf(tab) !== -1) {
        console.log('open tab', tab)
        state.currentTab = tab
      }
    }
  },
  actions: {
    setXmlByEditor ({ commit, state }, string) {
      const snippet = parser.parseFromString(string, 'application/xml')

      const errorNode = snippet.querySelector('parsererror')
      if (errorNode) {
        console.log('error while parsing')
        commit('SET_WELLFORMED', false)
        commit('SET_TEMPORARY_CODE', string)
        return
      } else {
        commit('SET_WELLFORMED', true)
        commit('SET_TEMPORARY_CODE', '')
      }

      const pageIndex = state.currentPage + 1
      const queryString = 'page:nth-child(' + pageIndex + ')'
      const xmlDoc = state.parsedXml.cloneNode(true)

      const oldPage = xmlDoc.querySelector(queryString)
      const newPage = snippet.querySelector('page')

      oldPage.replaceWith(newPage)

      commit('SET_XML_DOC', xmlDoc)
    },
    getTestData ({ commit, dispatch, state, getters }) {
      fetch('testfile.xml')
        .then(res => {
          return res.text()
        })
        .then(xml => {
          const mei = parser.parseFromString(xml, 'application/xml')
          commit('SET_GH_FILE', {}) // remove GH link
          dispatch('setData', mei)
        })
    },
    setData ({ commit }, mei) {
      const pageArray = getPageArray(mei)
      commit('SET_PAGES', pageArray)

      commit('SET_XML_DOC', mei)
      const title = mei.querySelector('title').textContent
      commit('SET_TITLE', title)

      commit('SET_CURRENT_PAGE', 0)
      commit('SET_WELLFORMED', true)
      commit('SET_PROCESSING', false)
      commit('SET_MODAL', null)
    },
    setCurrentPage ({ commit }, i) {
      commit('SET_WELLFORMED', true)
      commit('SET_CURRENT_PAGE', i)
    },
    setPreviewPage ({ commit }, i) {
      commit('SET_PREVIEW_PAGE', i)
    },
    setModal ({ commit }, modal) {
      commit('SET_MODAL', modal)
    },
    setLoading ({ commit }, bool) {
      commit('SET_LOADING', bool)
    },
    setProcessing ({ commit }, bool) {
      commit('SET_PROCESSING', bool)
    },
    setExplorerTab ({ commit }, val) {
      commit('SET_EXPLORER_TAB', val)
    },
    setSelectionRectEnabled ({ commit }, bool) {
      commit('SET_SELECTION_RECT_ENABLED', bool)
    },
    updateSystemCoordinates ({ commit }, system) {
      commit('UPDATE_SYSTEM_COORDINATES', system)
    },
    createSystem ({ commit }, rect) {
      commit('CREATE_SYSTEM', rect)
    },
    selectSystemOnCurrentPage ({ commit }, i) {
      commit('SET_SELECTED_SYSTEM_ON_CURRENT_PAGE', parseInt(i))
    },
    editSystemOnCurrentPage ({ commit }, i) {
      commit('SET_EDITING_SYSTEM_ON_CURRENT_PAGE', parseInt(i))
    },
    importIIIF ({ commit, dispatch }, url) {
      commit('SET_LOADING', true)
      fetch(url)
        .then(res => {
          return res.json()
        })
        .then(json => {
          commit('SET_LOADING', false)
          commit('SET_PROCESSING', true)
          // check if this is a proper IIIF Manifest, then convert to MEI
          const isManifest = checkIiifManifest(json)
          console.log('isManifest: ' + isManifest)
          if (!isManifest) {
            // do some error handling
            return false
          }

          iiifManifest2mei(json, url, parser)
            .then(mei => {
              commit('SET_GH_FILE', {}) // remove GH link
              dispatch('setData', mei)
            })
        })
        .catch(err => {
          commit('SET_LOADING', false)
          console.log(err)
          // add some error message
        })
    },
    addSVGshapes ({ commit, getters }, { svgstr, page }) {
      const svgdom = parser.parseFromString(svgstr, 'image/svg+xml')
      const svg = svgdom?.documentElement
      console.log(page, svg)
      commit('SET_PAGE_SVG', { i: getters.previewPageZeroBased, svg })
    },
    openTab ({ commit, getters }, tab) {
      if (getters.isAuthenticated) {
        commit('OPEN_TAB', tab)
      }
    }
  },
  getters: {
    /**
     * whether an XML file is properly loaded or not
     * @param  {Object}  state store
     * @return {Boolean} true if MEI is available
     */
    isReady: state => {
      return state.parsedXml !== null
    },

    /**
     * getter for the XML code for the current page
     * @param  {Object} state store
     * @return {string} MEI serialized to string
     */
    xmlCode: state => {
      if (state.parsedXml === null || state.currentPage === -1) {
        return ''
      }

      if (!state.wellformed) {
        return state.temporaryCode
      }

      const xmlDoc = state.parsedXml
      const pageIndex = state.currentPage + 1
      const queryString = 'page:nth-child(' + pageIndex + ')'
      const page = xmlDoc.querySelector(queryString)

      return serializer.serializeToString(page)
    },

    hasXML: state => !!state.parsedXml,

    xmlDocumentCode: state => () => {
      // TODO: We may need to reintegrate the SVG files…
      if (state.parsedXml === null) {
        return null
      }
      const xmlDoc = state.parsedXml.cloneNode(true)
      const surfaces = xmlDoc.querySelectorAll('surface')
      surfaces.forEach((surface, i) => {
        const svg = state.pageSVGs[i]?.cloneNode(true)
        if (svg) {
          surface.appendChild(svg)
        }
      })
      return serializer.serializeToString(xmlDoc)
    },

    pages: state => state.pages,

    pageArray: state => {
      const uris = []
      state.pages.forEach(page => {
        uris.push(page.uri)
      })

      return uris
    },

    pageArrayOSD: state => {
      const arr = []
      state.pages.forEach(page => {
        const obj = {
          tileSource: page.uri,
          width: page.width,
          x: 0,
          y: 0
        }
        arr.push(obj)
      })

      return arr
    },

    page: state => (i) => {
      return state.pages[i]
    },

    currentPageZeroBased: state => {
      return state.currentPage
    },

    currentPageOneBased: state => {
      return state.currentPage + 1
    },

    previewPageZeroBased: state => {
      return state.previewPage
    },

    title: state => {
      if (state.parsedXml === null) {
        return ''
      }

      const title = state.parsedXml.querySelector('title').textContent
      return title
    },

    /**
     * A representation of the systems on the current page
     * @param  {Object} state store
     * @return {Object} systems on the current page
     */
    systemsOnCurrentPage: state => {
      const pageIndex = state.currentPage + 1
      const queryString = 'page:nth-child(' + pageIndex + ')'
      const xmlDoc = state.parsedXml

      if (xmlDoc === null) {
        return []
      }

      const page = xmlDoc.querySelector(queryString)
      const pageHeight = page.getAttributeNS('', 'page.height')
      // const pageWidth = page.getAttributeNS('', 'page.width')

      const systems = []
      page.querySelectorAll('system').forEach(system => {
        // console.log('rawY: ' + rawY + ', pageHeight: ' + pageHeight + ', uly: ' + system.getAttributeNS('', 'uly'))

        const measure = system.querySelector('measure')
        const staff = measure.querySelector('staff')
        const top = parseInt(pageHeight - staff.getAttributeNS('', 'coord.y1'))

        const left = parseInt(measure.getAttributeNS('', 'coord.x1'))
        const right = parseInt(measure.getAttributeNS('', 'coord.x2'))

        const obj = { top, left, right }
        systems.push(obj)
      })

      return systems.sort((a, b) => a.top - b.top)
    },

    svgOnCurrentPage: state => {
      const svg = state.pageSVGs[state.currentPage]
      return svg
    },

    modal: state => {
      return state.modal
    },

    loading: state => {
      return state.loading
    },

    processing: state => {
      return state.processing
    },

    explorerTab: state => {
      return state.explorerTab
    },

    selectionRectEnabled: state => {
      return state.selectionRectEnabled
    },

    selectionRect: state => {
      return state.selectionRect
    },

    selectedSystemOnCurrentPage: state => {
      return state.selectedSystemOnCurrentPage
    },

    editingSystemOnCurrentPage: state => {
      return state.editingSystemOnCurrentPage
    },
    currentTab: state => {
      return state.currentTab
    }
  }
})
