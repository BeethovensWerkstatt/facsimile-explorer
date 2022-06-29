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
    xmlCode: '',
    parsedXml: null
  },
  mutations: {
    SET_XML_CODE (state, val) {
      state.xmlCode = val
    },
    SET_XML_DOC (state, domDoc) {
      state.parsedXml = domDoc
    },
    SET_CURRENT_PAGE (state, i) {
      state.currentPage = i
    },
    SET_TITLE (state, title) {
      state.title = title
    }
  },
  actions: {
    setXmlCode ({ commit }, val) {
      commit('SET_XML_CODE', val)
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

          const titleQuery = '//mei:fakeTitle'
          const result = doc.evaluate(titleQuery, doc, nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
          commit('SET_TITLE', result.singleNodeValue.textContent)
          // commit('SET_XML_CODE', doc)
        })
    },
    setCurrentPage ({ commit }, i) {
      commit('SET_CURRENT_PAGE', i)
    }
  },
  getters: {
    xmlCode: state => {
      if (state.parsedXml === null || state.currentPage === -1) {
        return ''
      }

      const pageIndex = state.currentPage + 1
      const queryString = '//mei:page[' + pageIndex + ']'
      console.log('querying: ' + queryString)
      const xmlDoc = state.parsedXml
      const result = xmlDoc.evaluate(queryString, xmlDoc, nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
      console.log('got results: ')
      console.log(result.singleNodeValue)
      return serializer.serializeToString(result.singleNodeValue) // state.parsedXml)
      // return state.xmlCode
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
    }
  }
})
