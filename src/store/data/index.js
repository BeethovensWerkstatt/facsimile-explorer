import { uuid } from '@/tools/uuid.js'

/**
 * @namespace store.data
 */
const dataModule = {
  /**
   * @namespace store.data.state
   * @property {Object} documents               a hashmap with all loaded XML documents. Hash is the path within the repo
   * @property {[type]} documentNamePathMapping An array with objects mapping document names and paths
   */
  state: {
    documents: {},
    documentNamePathMapping: []
  },

  /**
   * @namespace store.data.mutations
   */
  mutations: {
    /**
     * load document into data store (Mutation)
     * @memberof store.data.mutations
     * @param {[type]} state  The vuex state
     * @param {[type]} path   The path of the document in the repo
     * @param {[type]} dom    The DOM of the document
     */
    LOAD_DOCUMENT_INTO_STORE (state, { path, dom }) {
      state.documents[path] = dom
    },

    /**
     * sets a mapping between document name and full git path
     * @memberof store.data.mutations
     * @param {[type]} state  the vuew state
     * @param {[type]} arr    the array containing the mapping
     */
    SET_DOCUMENTNAME_PATH_MAPPING (state, arr) {
      state.documentNamePathMapping = arr
    },

    ADD_SVG_FILE_FOR_SURFACE (state, { surfaceId, svgText }) {
      let document = null
      let docPath = null

      Object.entries(state.documents).forEach(doc => {
        const sf = doc[1].querySelector('#' + surfaceId)
        if (sf !== null) {
          document = doc[1]
          docPath = doc[0]
        }
      })

      if (document === null) {
        console.error('Unable to find XML document containing surfaceId #' + surfaceId)
        return false
      }

      const xmlDoc = document.cloneNode(true)
      const surface = xmlDoc.querySelector('#' + surfaceId)

      const allSurfaces = [...xmlDoc.querySelectorAll('surface')]
      const surfaceIndex = allSurfaces.indexOf(surface)
      const paddedSurfaceIndex = String(surfaceIndex).padStart(3, '0')

      const graphic = xmlDoc.createElementNS('http://www.music-encoding.org/ns/mei', 'graphic')
      graphic.setAttribute('xml:id', 's' + uuid())
      graphic.setAttribute('type', 'svg')

      const svgFileName = '_surface' + paddedSurfaceIndex + '-shapes.svg'
      const svgRelativePath = './' + svgFileName
      const svgFullPath = docPath.replace([...docPath.split('/')].pop(), svgFileName)
      console.log('TODO: Need to commit SVG file to ' + svgFullPath)

      graphic.setAttribute('target', svgRelativePath)
      surface.appendChild(graphic)

      // TODO: Check dimensions of SVG
      // TODO: Upload SVG

      state.documents[docPath] = xmlDoc
    }
  },

  /**
   * @namespace store.data.actions
   */
  actions: {
    /**
     * load document into data store (Action)
     * @memberof store.data.actions
     * @param  {[type]} commit               The vuex commit function
     * @param  {[type]} path                 The path of the document in the repo
     * @param  {[type]} dom                  The DOM of the document
     */
    loadDocumentIntoStore ({ commit }, { path, dom }) {
      commit('LOAD_DOCUMENT_INTO_STORE', { path, dom })
    }
  },
  /**
   * @namespace store.data.getters
   */
  getters: {
    /**
     * retrieves an array of tileSources for OpenSeadragon
     * @memberof store.data.getters
     * @param  {Object} state              The vuex state of the current module
     * @param  {Object} getters            The getters of the current module
     * @param  {Object} rootState          The vuex root state, which can be used to access stuff from other modules
     * @param  {Object} rootGetters        The root getters, which allow access to getters from other modules
     * @param  {String} path               The Git path of the document in question
     * @return {[type]}                    An array of tileSources, for use with OpenSeadragon
     */
    documentPagesForOSD: (state, getters, rootState, rootGetters) => (path) => {
      const resolveFoliumLike2Surfaces = (arr, foliumLike) => {
        const type = foliumLike.localName
        if (type === undefined) {
          // this is a textnode
        } else if (type === 'bifolium') {
          if (foliumLike.hasAttribute('outer.recto')) {
            arr.push(foliumLike.getAttribute('outer.recto'))
          }
          if (foliumLike.hasAttribute('inner.verso')) {
            arr.push(foliumLike.getAttribute('inner.verso'))
          }

          foliumLike.childNodes.forEach(child => {
            resolveFoliumLike2Surfaces(arr, child)
          })

          if (foliumLike.hasAttribute('inner.recto')) {
            arr.push(foliumLike.getAttribute('inner.recto'))
          }
          if (foliumLike.hasAttribute('outer.verso')) {
            arr.push(foliumLike.getAttribute('outer.verso'))
          }
        } else if (type === 'folium' || type === 'unknownFoliation') {
          if (foliumLike.hasAttribute('recto')) {
            arr.push(foliumLike.getAttribute('recto'))
          }

          foliumLike.childNodes.forEach(child => {
            resolveFoliumLike2Surfaces(arr, child)
          })

          if (foliumLike.hasAttribute('verso')) {
            arr.push(foliumLike.getAttribute('verso'))
          }
        } else {
          // continue searching for child elements, like when nested inside an add or so
          foliumLike.childNodes.forEach(child => {
            resolveFoliumLike2Surfaces(arr, child)
          })
        }
      }

      const arr = []
      const mei = state.documents[path]
      if (mei === null) {
        return []
      }

      mei.querySelectorAll('foliaDesc > *').forEach(foliumLike => {
        resolveFoliumLike2Surfaces(arr, foliumLike)
      })

      arr.forEach((link, i) => {
        if (link.startsWith('#')) {
          arr[i] = mei.querySelector('surface[*|id = "' + link.substring(1) + '"]')
        } else {
          const relativePath = link.split('#')[0]
          const id = link.split('#')[1]
          const folder = relativePath.split('/')[relativePath.split('/').length - 2]

          const fullPath = getters.documentPathByName(folder)
          const file = getters.documentByPath(fullPath)
          arr[i] = file.querySelector('surface[*|id = "' + id + '"]')
        }
      })

      arr.forEach((surface, n) => {
        const graphic = surface.querySelector('graphic[type="facsimile"]')
        // const i = n + 1
        // const page = mei.querySelector('page:nth-child(' + i + ')')

        const obj = {}
        obj.uri = graphic.getAttributeNS('', 'target').trim()
        obj.id = surface.getAttribute('xml:id').trim()
        obj.n = surface.hasAttribute('n') ? surface.getAttributeNS('', 'n').trim() : n
        obj.label = surface.hasAttribute('label') ? surface.getAttributeNS('', 'label').trim() : n
        obj.width = parseInt(graphic.getAttributeNS('', 'width').trim(), 10)
        obj.height = parseInt(graphic.getAttributeNS('', 'height').trim(), 10)
        obj.hasSvg = surface.querySelector('graphic[type="svg"]') !== null // exists(graphic[@type='svg']) inside relevant /surface
        obj.hasZones = surface.querySelector('zone') !== null // exists(mei:zone) inside relevant /surface

        obj.systems = 0 // page.querySelectorAll('system').length // count(mei:system) inside relevant /page
        arr[n] = obj
      })
      return arr
    },

    /**
     * retrieves the path of a document by its name
     * @memberof store.data.getters
     * @param  {[type]} state              The vuex state of the current module
     * @param  {[type]} name               The name of the document for which the path shall be retrieved
     * @return {[type]}                    The path of the document
     */
    documentPathByName: state => (name) => state.sources.find(s => s.name === name)?.path,

    /**
     * retrieves the name of a document by its path
     * @memberof store.data.getters
     * @param  {[type]} state              The vuex state of the current module
     * @param  {[type]} path               The path of the document for which the name shall be retrieved
     * @return {[type]}                    The name of the document
     */
    documentNameByPath: state => (path) => state.sources.find(s => s.path === path)?.name,

    /**
     * retrieves a document by its path
     * @memberof store.data.getters
     * @param  {[type]} state              The vuex state of the current module
     * @param  {[type]} path               The path of the document for which the name shall be retrieved
     * @return {[type]}                    The document
     */
    documentByPath: state => (path) => state.documents[path],

    /**
     * retrieves the path of a document by a given surface ID
     * @memberof store.data.getters
     * @param  {[type]} state              The vuex state of the current module
     * @param  {[type]} surfaceId          The ID of a surface contained in the sought document
     * @return {[type]}                    The path of the document
     */
    documentPathBySurfaceId: state => (surfaceId) => {
      const docs = Object.entries(state.documents)
      const document = docs.find(doc => {
        const dom = doc[1]
        const elem = dom.querySelector('#' + surfaceId)
        return elem !== null
      })
      return document !== undefined ? document[0] : null
    }
  }
}

export default dataModule
