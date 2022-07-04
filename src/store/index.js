import { createStore } from 'vuex'
import { iiifManifest2mei, checkIiifManifest, getPageArray } from '@/tools/iiif.js'

/**
 * nsResolver: A namespace resolver for use with XPath queries inside Javascript
 * See https://developer.mozilla.org/en-US/docs/Web/XPath/Introduction_to_using_XPath_in_JavaScript
 * @param  {string} prefix The namespace prefix
 * @return {string}        The namespace URI
 */
function nsResolver (prefix) {
  const ns = {
    xhtml: 'http://www.w3.org/1999/xhtml',
    mathml: 'http://www.w3.org/1998/Math/MathML',
    mei: 'http://www.music-encoding.org/ns/mei',
    svg: 'http://www.w3.org/2000/svg',
    tei: 'http://www.tei-c.org/ns/1.0'
  }
  return ns[prefix] || null
}

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
  },
  state: {
    pages: [],
    currentPage: -1,
    previewPage: -1,
    title: '',
    parsedXml: null,
    temporaryCode: '',
    wellformed: false,
    modal: null,
    loading: false,
    processing: false
  },
  mutations: {
    SET_XML_DOC (state, domDoc) {
      state.parsedXml = domDoc
    },
    SET_TEMPORARY_CODE (state, string) {
      state.temporaryCode = string
    },
    SET_PAGES (state, arr) {
      state.pages = arr
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
    }
  },
  actions: {
    setXmlByEditor ({ commit, state }, string) {
      const snippet = parser.parseFromString(string, 'application/xml')
      console.log('snippet')
      console.log(snippet)
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
      const xmlDoc = state.parsedXml

      const oldPage = xmlDoc.querySelector(queryString)
      const newPage = snippet.querySelector('page')

      oldPage.replaceWith(newPage)

      commit('SET_XML_DOC', xmlDoc)
    },
    getTestData ({ commit, dispatch }) {
      fetch('testfile.xml')
        .then(res => {
          return res.text()
        })
        .then(xml => dispatch('setData', xml))
    },
    setData ({ commit }, xml) {
      console.log('got xml')

      const doc = parser.parseFromString(xml, 'application/xml')

      commit('SET_XML_DOC', doc)
      commit('SET_CURRENT_PAGE', 0)
      commit('SET_WELLFORMED', true)

      const titleQuery = '//mei:fakeTitle'
      const result = doc.evaluate(titleQuery, doc, nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
      commit('SET_TITLE', result.singleNodeValue.textContent)
      // commit('SET_XML_CODE', doc)
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
    importIIIF ({ commit }, url) {
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
              const pageArray = getPageArray(mei)
              commit('SET_PAGES', pageArray)

              commit('SET_XML_DOC', mei)
              const title = mei.querySelector('title').textContent
              commit('SET_TITLE', title)

              commit('SET_CURRENT_PAGE', 0)
              commit('SET_WELLFORMED', true)
              commit('SET_PROCESSING', false)
              commit('SET_MODAL', null)
            })
        })
        .catch(err => {
          commit('SET_LOADING', false)
          console.log(err)
          // add some error message
        })
    }
  },
  getters: {
    /**
     * whether an XML file is properly loaded or not
     * @param  {[type]}  state               [description]
     * @return {Boolean}       [description]
     */
    isReady: state => {
      return state.parsedXml !== null
    },

    /**
     * getter for the XML code for the current page
     * @param  {Object} state               [description]
     * @return {string}       [description]
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
      /* const queryString = '//mei:page[' + pageIndex + ']'
      const xmlDoc = state.parsedXml

      const result = xmlDoc.evaluate(queryString, xmlDoc, nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
      */

      return serializer.serializeToString(page) // state.parsedXml)
      // return state.xmlCode
    },

    xmlDocumentCode: state => () => {
      if (state.parsedXml === null) {
        return null
      }
      const xmlDoc = state.parsedXml
      console.log('serialize xml')
      return serializer.serializeToString(xmlDoc)
    },

    pageArray: state => {
      const uris = []
      state.pages.forEach(page => {
        uris.push(page.uri)
      })

      return uris
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
      return state.title
    },

    /**
     * A representation of the systems on the current page
     * @param  {[type]} state               [description]
     * @return {[type]}       [description]
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
      const pageWidth = page.getAttributeNS('', 'page.width')

      const systems = []
      page.querySelectorAll('system').forEach(system => {
        const rawY = pageHeight - system.getAttributeNS('', 'uly')
        console.log('rawY: ' + rawY + ', pageHeight: ' + pageHeight + ', uly: ' + system.getAttributeNS('', 'uly'))
        const y = 1 / pageHeight * (rawY)
        const measure = system.querySelector('measure')

        const x = 1 / pageWidth * measure.getAttributeNS('', 'ulx')
        const width = 1 / pageWidth * (measure.getAttributeNS('', 'lrx')) - x
        const height = 0.005

        const obj = { x, y, width, height }
        systems.push(obj)
      })

      return systems
    },

    svgOnCurrentPage: state => {
      const pageIndex = state.currentPage + 1
      const queryString = 'surface:nth-child(' + pageIndex + ') svg'
      const xmlDoc = state.parsedXml

      if (xmlDoc === null) {
        return null
      }

      const svg = xmlDoc.querySelector(queryString)

      if (svg === null) {
        return null
      }

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
    }
  }
})
