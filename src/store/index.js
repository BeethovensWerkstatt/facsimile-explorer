import { createStore } from 'vuex'
import { iiifManifest2mei, checkIiifManifest, getPageArray } from '@/tools/iiif.js'
import { initializePageIfNecessary, generateSystemFromRect, insertSystem, createElement } from '@/tools/mei.js'
import octokit from '@/store/octokit'
import { uuid } from '@/tools/uuid.js'

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
 * The Vuex Store of facsimile-explorer
 * @type {Object}
 */
export default createStore({
  modules: {
    octokit
  },
  state: {
    explorerTab: 'systems',
    cataloguerTab: 'notes',
    pages: [],
    currentPage: -1,
    previewPage: -1,
    activeSystem: -1,
    activeElement: null,
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
    activeSketchArea: null,
    // TEMP
    alignment: {
      mode: 'ref',
      ref: {
        diplomatic: null,
        annotated: null
      },
      offset: {
        x: 0,
        y: 0
      },
      temp: null,
      alignedPairs: []
    }
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
      state.pages = arr
    },
    SET_PAGE_SVG (state, { i, svg }) {
      state.pageSVGs[i] = svg
    },
    SET_CURRENT_PAGE (state, i) {
      state.previewPage = -1
      state.currentPage = i
      state.activeSystem = -1
    },
    SET_ACTIVE_SYSTEM (state, i) {
      state.activeSystem = i
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
    SET_CATALOGUER_TAB (state, val) {
      state.cataloguerTab = val
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

      while (existingSystems.length > i && parseInt(existingSystems[i].querySelector('staff').getAttribute('coord.y1')) > newSystemUly) {
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
    CREATE_TRANSCRIPTION_ELEMENT (state, { type, system, id }) {
      console.log('need to create element of type ' + type + ' at system ' + system + ' with id ' + id)

      const xmlDoc = state.parsedXml
      const pageIndex = state.currentPage + 1
      const pageQueryString = 'page:nth-child(' + pageIndex + ')'
      const page = xmlDoc.querySelector(pageQueryString)

      const systemQueryString = 'system:nth-of-type(' + system + ')'
      const systemElem = page.querySelector(systemQueryString)

      createElement(type, systemElem, id)

      state.parsedXml = null
      state.parsedXml = xmlDoc
      state.activeElement = id
    },
    ACTIVATE_TRANSCRIPTION_ELEMENT (state, id) {
      state.activeElement = id
    },
    SET_ATTRIBUTE (state, { elemId, attName, attValue }) {
      const pageIndex = state.currentPage + 1
      const queryString = 'page:nth-child(' + pageIndex + ')'
      const xmlDoc = state.parsedXml

      const page = xmlDoc.querySelector(queryString)

      const elem = page.querySelector('*[*|id=' + elemId + ']')
      elem.setAttribute(attName, attValue)

      state.parsedXml = null
      state.parsedXml = xmlDoc
    },
    CLICKED_SHAPE (state, shape) {
      if (state.parsedXml === null || state.activeElement === null) {
        return
      }

      const pageIndex = state.currentPage + 1
      const queryString = 'page:nth-child(' + pageIndex + ')'
      const xmlDoc = state.parsedXml

      const page = xmlDoc.querySelector(queryString)

      const elem = page.querySelector('*[*|id=' + state.activeElement + ']')
      if (elem === null) {
        return
      }

      if (elem.hasAttribute('facs')) {
        const refs = elem.getAttribute('facs').replace(/\s+/g, ' ').trim().split(' ')
        const index = refs.indexOf('#' + shape.id)

        if (index === -1) {
          refs.push('#' + shape.id)
          elem.setAttribute('facs', refs.join(' '))
        } else if (refs.length === 1) {
          elem.removeAttribute('facs')
          elem.removeAttribute('coord.x1')
        } else {
          refs.splice(index, 1)
          elem.setAttribute('facs', refs.join(' '))
        }
      } else {
        elem.setAttribute('facs', '#' + shape.id)
        const bbox = shape.getBBox()
        const x = parseInt(bbox.x)
        elem.setAttribute('coord.x1', x)
      }
      state.parsedXml = null
      state.parsedXml = xmlDoc
    },
    CREATE_SKETCH_AREA (state, id) {
      const svg = state.pageSVGs[state.currentPage]
      if (svg === null || svg === undefined) {
        console.log('no svg on this page')
        return null
      }

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      g.setAttribute('id', id)
      g.classList.add('sketchArea')
      svg.append(g)

      state.pageSVGs[state.currentPage] = null
      state.pageSVGs[state.currentPage] = svg
      state.activeSketchArea = id
    },
    ACTIVATE_SKETCH_AREA (state, id) {
      state.activeSketchArea = id
    },
    MOVE_SHAPE_TO_ACTIVE_SKETCH_AREA (state, shapeId) {
      const svg = state.pageSVGs[state.currentPage]
      if (svg === null || svg === undefined) {
        console.log('no svg on this page')
        return null
      }

      const shape = svg.querySelector('#' + shapeId)
      const g = svg.querySelector('#' + state.activeSketchArea)
      g.append(shape)

      state.pageSVGs[state.currentPage] = null
      state.pageSVGs[state.currentPage] = svg

      const surfaceIndex = state.currentPage + 1
      const queryString = 'surface:nth-child(' + surfaceIndex + ')'
      const xmlDoc = state.parsedXml

      const surface = xmlDoc.querySelector(queryString)
      const existingZone = surface.querySelector('zone[data="#' + state.activeSketchArea + '"]')

      const bbox = g.getBBox()
      const ulx = parseInt(bbox.x)
      const uly = parseInt(bbox.y)
      const lrx = ulx + parseInt(bbox.width)
      const lry = uly + parseInt(bbox.height)

      if (existingZone !== null) {
        console.log('schon da')
        existingZone.setAttribute('ulx', ulx)
        existingZone.setAttribute('uly', uly)
        existingZone.setAttribute('lrx', lrx)
        existingZone.setAttribute('lry', lry)
      } else {
        console.log('muss noch')
        const newZone = document.createElementNS('http://www.music-encoding.org/ns/mei', 'zone')
        newZone.setAttribute('type', 'writingZone')
        newZone.setAttribute('data', '#' + state.activeSketchArea)
        newZone.setAttribute('ulx', ulx)
        newZone.setAttribute('uly', uly)
        newZone.setAttribute('lrx', lrx)
        newZone.setAttribute('lry', lry)

        surface.append(newZone)
      }

      state.parsedXml = null
      state.parsedXml = xmlDoc
    },
    // TEMP
    SET_ALIGNMENT_MODE (state, mode) {
      state.alignment.mode = mode
    },
    CLICK_ALIGNMENT_SHAPE (state, { shape, file }) {
      /*
      alignment: {
        mode: 'ref',
        ref: {
          diplomatic: null,
          annotated: null
        },
        offset: {
          x: 0,
          y: 0
        },
        temp: null,
        alignedPairs: []
      }
      */

      if (state.alignment.mode === 'ref') {
        if (file === 'annotated') {
          state.alignment.ref.annotated = shape
        } else {
          state.alignment.ref.diplomatic = shape
        }
        if (state.alignment.ref.annotated !== null && state.alignment.ref.diplomatic !== null) {
          const annotUse = state.alignment.ref.annotated.querySelector('use')
          const diploUse = state.alignment.ref.diplomatic.querySelector('use')
          state.alignment.offset.x = diploUse.getAttribute('x') - annotUse.getAttribute('x')
          state.alignment.offset.y = diploUse.getAttribute('y') - annotUse.getAttribute('y')
          state.alignment.mode = 'align'
        }
      } else if (state.alignment.offset.x !== null) {
        if (file === 'annotated') {
          state.alignment.temp = shape
        } else if (state.alignment.temp !== null) {
          // state.alignment.
          const annotUse = state.alignment.temp.querySelector('use')
          const diploUse = shape.querySelector('use')
          const offX = state.alignment.offset.x
          const offY = state.alignment.offset.y

          state.alignment.alignedPairs.push({
            id: state.alignment.temp.id,
            x: annotUse.getAttribute('x'),
            y: annotUse.getAttribute('y'),
            dx: diploUse.getAttribute('x') - offX,
            dy: diploUse.getAttribute('y') - offY,
            diploX: diploUse.getAttribute('x'),
            diploY: diploUse.getAttribute('y'),
            dipl: shape.id
          })
          state.alignment.temp = null
        }
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
          dispatch('setData', xml)
        })
    },
    setData ({ commit }, input) {
      const mei = (typeof input === 'string') ? parser.parseFromString(input, 'application/xml') : input

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
    setActiveSystem ({ commit }, i) {
      commit('SET_ACTIVE_SYSTEM', i)
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
      commit('ACTIVATE_SKETCH_AREA', null)
      commit('ACTIVATE_TRANSCRIPTION_ELEMENT', null)
    },
    setCataloguerTab ({ commit }, val) {
      commit('SET_CATALOGUER_TAB', val)
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
    createTranscriptionElement ({ commit }, { type, system }) {
      const id = type.substring(0, 1) + uuid()
      commit('CREATE_TRANSCRIPTION_ELEMENT', { type, system, id })
    },
    activateTranscriptionElement ({ commit }, id) {
      commit('ACTIVATE_TRANSCRIPTION_ELEMENT', id)
    },
    setAttribute ({ commit }, { elemId, attName, attValue }) {
      commit('SET_ATTRIBUTE', { elemId, attName, attValue })
    },
    clickedShape ({ commit, state }, shape) {
      if (state.explorerTab === 'sketchGroups' && state.activeSketchArea !== null) {
        commit('MOVE_SHAPE_TO_ACTIVE_SKETCH_AREA', shape.id)
      } else {
        commit('CLICKED_SHAPE', shape)
      }
    },
    createSketchArea ({ commit }) {
      const id = 'g' + uuid()
      commit('CREATE_SKETCH_AREA', id)
    },
    activateSketchArea ({ commit }, id) {
      commit('ACTIVATE_SKETCH_AREA', id)
    },
    moveShapeToActiveSketchArea ({ commit }, shapeId) {
      commit('MOVE_SHAPE_TO_ACTIVE_SKETCH_AREA', shapeId)
    },
    showSliderDemo ({ commit }) {
      commit('SET_MODAL', 'demo')
    },
    // TEMP
    setAlignmentMode ({ commit }, mode) {
      commit('SET_ALIGNMENT_MODE', mode)
    },
    clickAlignmentShape ({ commit, state }, { shape, file }) {
      commit('CLICK_ALIGNMENT_SHAPE', { shape, file })
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

    cataloguerTab: state => {
      return state.cataloguerTab
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

    activeSystem: state => {
      return state.activeSystem
    },

    activeElementId: state => {
      return state.activeElement
    },

    activeElement: state => {
      if (state.parsedXml === null || state.activeElement === null) {
        return null
      }

      const pageIndex = state.currentPage + 1
      const queryString = 'page:nth-child(' + pageIndex + ')'
      const xmlDoc = state.parsedXml

      const page = xmlDoc.querySelector(queryString)

      return page.querySelector('*[*|id=' + state.activeElement + ']')
    },

    activeElementAttribute: state => (att) => {
      if (state.parsedXml === null || state.activeElement === null) {
        return null
      }

      const pageIndex = state.currentPage + 1
      const queryString = 'page:nth-child(' + pageIndex + ')'
      const page = state.parsedXml.querySelector(queryString)

      const elem = page.querySelector('*[*|id=' + state.activeElement + ']')

      if (elem === null || !elem.hasAttribute(att)) {
        return null
      } else {
        return elem.getAttribute(att)
      }
    },
    relevantElementsByActiveSystem: state => {
      if (state.parsedXml === null || state.activeSystem === -1) {
        return []
      }

      const pageIndex = state.currentPage + 1
      const pageQuery = 'page:nth-child(' + pageIndex + ')'
      const page = state.parsedXml.querySelector(pageQuery)

      const systemQuery = 'system:nth-of-type(' + state.activeSystem + ')'
      const system = page.querySelector(systemQuery)

      let elementQuery
      if (state.cataloguerTab === 'notes') {
        elementQuery = 'note'
      }
      if (state.cataloguerTab === 'accidental') {
        elementQuery = 'accid'
      }

      const elements = system.querySelectorAll(elementQuery)
      return [...elements]
    },
    sketchAreasOnCurrentPage: state => {
      const svg = state.pageSVGs[state.currentPage]

      if (svg === null || svg === undefined) {
        return []
      }

      const page = state.pages[state.currentPage]

      const arr = []
      svg.querySelectorAll('g.sketchArea').forEach(g => {
        const bbox = g.getBBox()
        const shapes = g.querySelectorAll('path').length
        arr.push({
          id: g.id,
          x: parseInt(100 / page.width * bbox.x) + '%',
          y: parseInt(100 / page.height * bbox.y) + '%',
          w: parseInt(100 / page.width * bbox.width) + '%',
          h: parseInt(100 / page.height * bbox.height) + '%',
          shapes
        })
      })
      return arr
    },
    activeSketchArea: state => {
      return state.activeSketchArea
    },

    writingZonesOnCurrentPage: state => {
      const surfaceIndex = state.currentPage + 1
      const queryString = 'surface:nth-child(' + surfaceIndex + ')'
      const xmlDoc = state.parsedXml

      if (xmlDoc === null) {
        return []
      }

      const surface = xmlDoc.querySelector(queryString)

      const systems = []
      surface.querySelectorAll('zone[type="writingZone"]').forEach(zone => {
        // console.log('rawY: ' + rawY + ', pageHeight: ' + pageHeight + ', uly: ' + system.getAttributeNS('', 'uly'))

        const x = parseInt(zone.getAttributeNS('', 'ulx'))
        const y = parseInt(zone.getAttributeNS('', 'uly'))
        const width = parseInt(zone.getAttributeNS('', 'lrx')) - x
        const height = parseInt(zone.getAttributeNS('', 'lry')) - y

        const data = zone.getAttributeNS('', 'data').replace('#', '')

        const obj = { x, y, width, height, data }
        systems.push(obj)
      })

      return systems
    },

    // TEMP
    /* alignment: {
     mode: 'ref',
     ref: {
        diplomatic: null,
        annotated: null
     },
     offset: {
        x: 0,
        y: 0
     },
     temp: null,
     alignedPairs: []
    } */
    alignmentMode: state => {
      return state.alignment.mode
    },
    alignmentTemp: state => {
      return state.alignment.temp?.id
    },
    alignedPairs: state => {
      return state.alignment.alignedPairs
    },
    alignmentRefDiplo: state => {
      return state.alignment.ref.diplomatic?.id
    },
    alignmentRefAnnot: state => {
      return state.alignment.ref.annotated?.id
    },
    alignmentOffset: state => {
      return state.alignment.offset
    },
    alignmentCovered: state => {
      const obj = {}
      state.alignment.alignedPairs.forEach(entry => {
        obj[entry.id] = null
        obj[entry.dipl] = null
      })
      return Object.keys(obj)
    }
  }
})
