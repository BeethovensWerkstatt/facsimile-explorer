import { createStore } from 'vuex'

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
    currentPage: -1,
    title: '',
    parsedXml: null,
    temporaryCode: '',
    wellformed: false
  },
  mutations: {
    SET_XML_DOC (state, domDoc) {
      state.parsedXml = domDoc
    },
    SET_TEMPORARY_CODE (state, string) {
      state.temporaryCode = string
    },
    SET_CURRENT_PAGE (state, i) {
      state.currentPage = i
    },
    SET_TITLE (state, title) {
      state.title = title
    },
    SET_WELLFORMED (state, bool) {
      state.wellformed = bool
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
    getTestData ({ commit }) {
      fetch('testfile.xml')
        .then(res => {
          return res.text()
        })
        .then(xml => {
          console.log('got xml')

          const doc = parser.parseFromString(xml, 'application/xml')

          commit('SET_XML_DOC', doc)
          commit('SET_WELLFORMED', true)

          const titleQuery = '//mei:fakeTitle'
          const result = doc.evaluate(titleQuery, doc, nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
          commit('SET_TITLE', result.singleNodeValue.textContent)
          // commit('SET_XML_CODE', doc)
        })
    },
    setCurrentPage ({ commit }, i) {
      commit('SET_WELLFORMED', true)
      commit('SET_CURRENT_PAGE', i)
    }
  },
  getters: {
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

      const pageIndex = state.currentPage + 1
      const queryString = '//mei:page[' + pageIndex + ']'
      const xmlDoc = state.parsedXml

      const result = xmlDoc.evaluate(queryString, xmlDoc, nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null)

      return serializer.serializeToString(result.singleNodeValue) // state.parsedXml)
      // return state.xmlCode
    },

    xmlDocumentCode: state => () => {
      if (state.parsedXml === null) {
        return ''
      }
      const xmlDoc = state.parsedXml
      console.log('serialize xml')
      return serializer.serializeToString(xmlDoc)
    },

    pageArray: state => {
      if (state.parsedXml === null) {
        return []
      }

      const xmlDoc = state.parsedXml
      const surfaces = xmlDoc.evaluate('//mei:surface/mei:graphic', xmlDoc, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)
      const uris = []

      for (let i = 0; i < surfaces.snapshotLength; i++) {
        const surface = surfaces.snapshotItem(i)
        const target = surface.getAttributeNS('', 'target')
        uris.push(target)
      }
      return uris
    },

    currentPageZeroBased: state => {
      return state.currentPage
    },

    currentPageOneBased: state => {
      return state.currentPage + 1
    },

    title: state => {
      return state.title
    },

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
    }
  }
})
