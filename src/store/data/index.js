// import { dom2base64, str2base64 } from '@/tools/github'
import { uuid } from '@/tools/uuid.js'
import { convertRectUnits, sortRastrumsByVerticalPosition } from '@/tools/mei.js'
// import { Base64 } from 'js-base64'

/**
 * A Parser for reading in the XML Document
 * @type {DOMParser}
 */
const parser = new DOMParser()

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
      state.documents[path] = dom // = { ...state.documents, [path]: dom } // reactivity ?
    },

    /**
     * sets a mapping between document name and full git path
     * @memberof store.data.mutations
     * @param {[type]} state  the vuew state
     * @param {[type]} arr    the array containing the mapping
     */
    SET_DOCUMENTNAME_PATH_MAPPING (state, arr) {
      state.documentNamePathMapping = arr
      // console.log(state.documentNamePathMapping)
    },

    ADD_REFERENCE_TO_SVG_FILE_FOR_SURFACE (state, { path, modifiedDom }) {
      state.documents[path] = modifiedDom
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
     * @param  {[type]} name                 The name of the document in the repo
     * @param  {[type]} dom                  The DOM of the document
     */
    loadDocumentIntoStore ({ commit, state }, { path, name, dom }) {
      commit('LOAD_DOCUMENT_INTO_STORE', { path, dom })
      if (name && path) {
        commit('SET_DOCUMENTNAME_PATH_MAPPING', { ...state.documentNamePathMapping, [name]: path, [path]: name })
      }
    },

    addSvgFileForSurface ({ commit, state, dispatch, getters }, { surfaceId, svgText }) {
      let oldDom = null
      let path = null

      Object.entries(state.documents).forEach(doc => {
        const sf = doc[1].querySelector('surface[*|id="' + surfaceId + '"]')
        if (sf !== null) {
          oldDom = doc[1]
          path = doc[0]
        }
      })

      if (oldDom === null) {
        console.error('Unable to find XML document containing surfaceId #' + surfaceId)
        return false
      }

      const modifiedDom = oldDom.cloneNode(true)
      const surface = modifiedDom.querySelector('surface[*|id="' + surfaceId + '"]')

      const allSurfaces = [...modifiedDom.querySelectorAll('surface')]
      const surfaceIndex = allSurfaces.indexOf(surface) + 1
      const paddedSurfaceIndex = String(surfaceIndex).padStart(3, '0')

      const graphic = modifiedDom.createElementNS('http://www.music-encoding.org/ns/mei', 'graphic')
      graphic.setAttribute('xml:id', 'g' + uuid())
      graphic.setAttribute('type', 'shapes')

      const docName = getters.documentNameByPath(path)
      const svgFileName = docName + '_p' + paddedSurfaceIndex + '.svg'
      const svgRelativePath = './svg/' + svgFileName
      const meiFileName = path.split('/').pop()
      const svgFullPath = path.replace(meiFileName, 'svg/' + svgFileName)

      graphic.setAttribute('target', svgRelativePath)
      surface.appendChild(graphic)

      // TODO: Check dimensions of svgDom -> JK
      const svgDom = parser.parseFromString(svgText, 'application/xml')

      const svgWidth = svgDom.querySelector('svg')?.hasAttribute('width') ? parseInt(svgDom.querySelector('svg').getAttribute('width')) : null
      const svgHeight = svgDom.querySelector('svg')?.hasAttribute('height') ? parseInt(svgDom.querySelector('svg').getAttribute('height')) : null

      const pixelWidth = parseInt(surface.querySelector('graphic[type="facsimile"]').getAttribute('width'))
      const pixelHeight = parseInt(surface.querySelector('graphic[type="facsimile"]').getAttribute('height'))

      if (!svgDom.querySelector('g.unassigned')) {
        const unassignedG = document.createElementNS('http://www.w3.org/2000/svg', 'g')
        unassignedG.classList.add('unassigned')
        svgDom.querySelectorAll('path').forEach(shape => unassignedG.append(shape))
        svgDom.querySelector('svg').append(unassignedG)
      }

      console.log('\n\nME HERE')
      console.log(svgDom)

      if (svgWidth === pixelWidth && svgHeight === pixelHeight) {
        dispatch('loadDocumentIntoStore', { path: svgFullPath, dom: svgDom.querySelector('svg') })
        dispatch('loadDocumentIntoStore', { path, dom: modifiedDom })

        // create array with files to commit
        /* const files = []
        files.push({ path, content: dom2base64(modifiedDom) })
        files.push({ path: svgFullPath, content: str2base64(svgText) }) */

        const param = surfaceIndex
        const baseMessage = 'added SVG for ' + docName + ', p.'
        // TODO collect xmlIDs for changed elements
        dispatch('logChange', { path, baseMessage, param, xmlIDs: [surfaceId], isNewDocument: false })
        dispatch('logChange', { path: svgFullPath, baseMessage, param, xmlIDs: [], isNewDocument: true })
      } else {
        alert('[ERROR] SVG Dimensions for ' + svgFullPath + ' incorrect: \n\n   pixelWidth: ' + pixelWidth + '\n     svgWidth: ' + svgWidth + '\n  pixelHeight: ' + pixelHeight + '\n    svgHeight: ' + svgHeight + '\n\n Loading SVG file aborted.')
      }
    },

    /**
     * creates a new writingZone on the current page
     * @param  {[type]} commit                 [description]
     * @param  {[type]} getters                [description]
     * @param  {[type]} dispatch               [description]
     * @return {[type]}          [description]
     */
    createNewWritingZone ({ commit, getters, dispatch }) {
      if (!getters.documentWithCurrentPage || !getters.svgForCurrentPage) {
        return null
      }

      const modifiedDom = getters.documentWithCurrentPage.cloneNode(true)
      const modifiedSvgDom = getters.svgForCurrentPage.cloneNode(true)

      const svgId = modifiedSvgDom.querySelector('svg').getAttribute('id')

      const surfaceId = getters.currentPageId

      const surface = modifiedDom.querySelector('surface[*|id="' + surfaceId + '"]')
      const genDescPage = modifiedDom.querySelector('genDesc[corresp="#' + surfaceId + '"]')
      const genDescPageId = genDescPage.getAttribute('xml:id')

      const svgLink = surface.querySelector('graphic[type="shapes"]').getAttribute('target')

      const genDescWzId = 'g' + uuid()
      const genDescWlId = 'g' + uuid()
      const zoneId = 'z' + uuid()
      const gWzId = 'z' + uuid()
      const gWlId = 'l' + uuid()

      const existingWzCount = genDescPage.querySelectorAll('genDesc[class~="#geneticOrder_writingZoneLevel"]').length
      const genDescWzLabel = existingWzCount + 1

      const genDescWz = document.createElementNS('http://www.music-encoding.org/ns/mei', 'genDesc')
      genDescWz.setAttribute('xml:id', genDescWzId)
      genDescWz.setAttribute('class', '#geneticOrder_writingZoneLevel')
      genDescWz.setAttribute('corresp', svgLink + '#' + gWzId)
      genDescWz.setAttribute('label', genDescWzLabel)

      const genStateWl = document.createElementNS('http://www.music-encoding.org/ns/mei', 'genState')
      genStateWl.setAttribute('xml:id', genDescWlId)
      genStateWl.setAttribute('class', '#geneticOrder_writingLayerLevel #geneticOrder_finalState')
      genStateWl.setAttribute('corresp', svgLink + '#' + gWlId)
      genStateWl.setAttribute('label', '#final')

      genDescWz.appendChild(genStateWl)
      genDescPage.appendChild(genDescWz)

      const zone = document.createElementNS('http://www.music-encoding.org/ns/mei', 'zone')
      zone.setAttribute('xml:id', zoneId)
      zone.setAttribute('data', '#' + genDescWzId)
      zone.setAttribute('ulx', 0)
      zone.setAttribute('uly', 0)
      zone.setAttribute('lrx', 0)
      zone.setAttribute('lry', 0)

      surface.appendChild(zone)

      const gWz = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      gWz.setAttribute('id', gWzId)
      gWz.setAttribute('class', 'writingZone')

      const gWl = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      gWl.setAttribute('id', gWlId)
      gWl.setAttribute('class', 'writingLayer')

      gWz.appendChild(gWl)
      modifiedSvgDom.appendChild(gWz)

      const docPath = getters.currentDocPath
      const docName = getters.documentNameByPath(docPath)
      const svgPath = getters.currentSvgPath

      dispatch('loadDocumentIntoStore', { path: svgPath, dom: modifiedSvgDom })
      dispatch('loadDocumentIntoStore', { path: docPath, dom: modifiedDom })

      const param = getters.currentSurfaceIndexForCurrentDoc
      const baseMessage = 'changed writingZones for ' + docName + ', p.'
      dispatch('logChange', { path: docPath, baseMessage, param, xmlIDs: [surfaceId, genDescPageId], isNewDocument: false })
      dispatch('logChange', { path: svgPath, baseMessage, param, xmlIDs: [svgId], isNewDocument: false })

      dispatch('setActiveWritingZone', genDescWzId)
      dispatch('setActiveWritingLayer', genDescWlId)
    },

    /**
     * creates a new writingLayer in the currently active writingZone
     * @param  {[type]} commit                 [description]
     * @param  {[type]} getters                [description]
     * @param  {[type]} dispatch               [description]
     * @return {[type]}          [description]
     */
    createNewWritingLayer ({ commit, getters, dispatch }) {
      if (!getters.documentWithCurrentPage || !getters.svgForCurrentPage) {
        return null
      }

      const modifiedDom = getters.documentWithCurrentPage.cloneNode(true)
      const modifiedSvgDom = getters.svgForCurrentPage.cloneNode(true)

      const svgId = modifiedSvgDom.querySelector('svg').getAttribute('id')

      const surfaceId = getters.currentPageId

      const activeWzGenDescId = getters.activeWritingZone

      const surface = modifiedDom.querySelector('surface[*|id="' + surfaceId + '"]')
      // const genDescWz = getters.genDescForCurrentWritingZone

      const genDescWz = [...modifiedDom.querySelectorAll('genDesc[class~="#geneticOrder_writingZoneLevel"]')].find(wz => wz.getAttribute('xml:id') === activeWzGenDescId)
      const genDescPageId = genDescWz.closest('genDesc[class~="#geneticOrder_pageLevel"]').getAttribute('xml:id')

      console.log('\n\nStrange things happening')
      console.log('activeWzGenDescId: ' + activeWzGenDescId)
      console.log(genDescWz)

      console.log(getters.genDescForCurrentPage)
      console.log(getters.genDescForCurrentWritingZone)
      console.log(getters.genDescForCurrentWritingLayer)

      const svgLink = surface.querySelector('graphic[type="shapes"]').getAttribute('target')

      const genDescWlId = 'g' + uuid()
      const gWlId = 'l' + uuid()

      const existingWlCount = genDescWz.querySelectorAll('genDesc[class~="#geneticOrder_writingLayerLevel"]').length
      const genDescWlLabel = existingWlCount + 1

      const genStateWl = document.createElementNS('http://www.music-encoding.org/ns/mei', 'genState')
      genStateWl.setAttribute('xml:id', genDescWlId)
      genStateWl.setAttribute('class', '#geneticOrder_writingLayerLevel')
      genStateWl.setAttribute('corresp', svgLink + '#' + gWlId)
      genStateWl.setAttribute('label', genDescWlLabel)

      genDescWz.appendChild(genStateWl)

      const gWzId = genDescWz.getAttribute('corresp').split('#')[1]

      const gWz = modifiedSvgDom.querySelector('#' + gWzId)

      const gWl = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      gWl.setAttribute('id', gWlId)
      gWl.setAttribute('class', 'writingLayer')

      gWz.appendChild(gWl)

      const docPath = getters.currentDocPath
      const docName = getters.documentNameByPath(docPath)
      const svgPath = getters.currentSvgPath

      dispatch('loadDocumentIntoStore', { path: svgPath, dom: modifiedSvgDom })
      dispatch('loadDocumentIntoStore', { path: docPath, dom: modifiedDom })

      const param = getters.currentSurfaceIndexForCurrentDoc
      const baseMessage = 'changed writingZones for ' + docName + ', p.'
      dispatch('logChange', { path: docPath, baseMessage, param, xmlIDs: [surfaceId, genDescPageId], isNewDocument: false })
      dispatch('logChange', { path: svgPath, baseMessage, param, xmlIDs: [svgId], isNewDocument: false })

      dispatch('setActiveWritingLayer', genDescWlId)
    },

    /**
     * called when a shape is supposed to be moved to the current writingZone
     * @param  {[type]} commit                 [description]
     * @param  {[type]} getters                [description]
     * @param  {[type]} dispatch               [description]
     * @param  {[type]} shapeId                [description]
     * @return {[type]}          [description]
     */
    moveShapeToCurrentWritingZone ({ commit, getters, dispatch }, shapeId) {
      if (!shapeId) {
        return null
      }
      const modifiedDom = getters.documentWithCurrentPage.cloneNode(true)
      const modifiedSvgDom = getters.svgForCurrentPage.cloneNode(true)

      if (!modifiedDom || !modifiedSvgDom) {
        return null
      }

      const svgId = modifiedSvgDom.querySelector('svg').getAttribute('id')

      const path = getters.currentDocPath
      const docName = getters.documentNameByPath(path)

      const writingLayerGenDesc = getters.genDescForCurrentWritingLayer
      if (!writingLayerGenDesc) {
        return null
      }

      const corresp = writingLayerGenDesc.getAttribute('corresp')
      const writingLayerSvgGroupId = corresp.split('#')[1]

      const writingLayerSvgGroup = modifiedSvgDom.querySelector('#' + writingLayerSvgGroupId)

      const shape = modifiedSvgDom.querySelector('#' + shapeId)
      writingLayerSvgGroup.append(shape)

      // the following is necessary to get proper bboxes
      const renderedLayerSvgGroup = document.querySelector('#' + writingLayerSvgGroupId)
      const renderedShape = document.querySelector('#' + shapeId)
      renderedLayerSvgGroup.append(renderedShape)

      const pageGenDesc = getters.genDescForCurrentPage
      const genDescPageId = pageGenDesc.getAttribute('xml:id')
      const wzGenDescArr = pageGenDesc.querySelectorAll('genDesc[class~="#geneticOrder_writingZoneLevel"]')

      const surfaceId = getters.currentPageId
      const surface = modifiedDom.querySelector('surface[*|id="' + surfaceId + '"]')

      const renderedWritingZones = document.querySelectorAll('svg .writingZone')
      renderedWritingZones.forEach(svgWz => {
        const bbox = svgWz.getBBox()
        console.log('shapeCount:' + svgWz.querySelectorAll('path').length)
        const wzGenDesc = [...wzGenDescArr].find(wz => wz.getAttribute('corresp').split('#')[1] === svgWz.getAttribute('id'))
        const zone = surface.querySelector('zone[data="#' + wzGenDesc.getAttribute('xml:id') + '"]')
        zone.setAttribute('ulx', Math.round(bbox.x))
        zone.setAttribute('uly', Math.round(bbox.y))
        zone.setAttribute('lrx', Math.round(bbox.x + bbox.width))
        zone.setAttribute('lry', Math.round(bbox.y + bbox.height))
      })

      const svgPath = getters.currentSvgPath
      const param = getters.currentSurfaceIndexForCurrentDoc
      const baseMessage = 'changed writingZones for ' + docName + ', p.'

      dispatch('loadDocumentIntoStore', { path: path, dom: modifiedDom })
      dispatch('loadDocumentIntoStore', { path: svgPath, dom: modifiedSvgDom })
      dispatch('logChange', { path: path, baseMessage, param, xmlIDs: [surfaceId, genDescPageId], isNewDocument: false })
      dispatch('logChange', { path: svgPath, baseMessage, param, xmlIDs: [svgId], isNewDocument: false })
    },

    /**
     * deletes a writing zone and moves all its shapes to the unassigned group
     * @param  {[type]} commit                    [description]
     * @param  {[type]} getters                   [description]
     * @param  {[type]} dispatch                  [description]
     * @param  {[type]} genDescWzId               [description]
     * @return {[type]}             [description]
     */
    deleteWritingZone ({ commit, getters, dispatch }, genDescWzId) {
      if (!genDescWzId) {
        return null
      }
      const modifiedDom = getters.documentWithCurrentPage.cloneNode(true)
      const modifiedSvgDom = getters.svgForCurrentPage.cloneNode(true)

      if (!modifiedDom || !modifiedSvgDom) {
        return null
      }

      const svgId = modifiedSvgDom.querySelector('svg').getAttribute('id')

      const genDescWz = modifiedDom.querySelector('genDesc[*|id="' + genDescWzId + '"]')
      const svgGroupWz = modifiedSvgDom.querySelector('#' + genDescWz.getAttribute('corresp').split('#')[1])
      const svgUnassignedGroup = modifiedSvgDom.querySelector('g.unassigned')

      svgGroupWz.querySelectorAll('path').forEach(shape => svgUnassignedGroup.append(shape))

      const surfaceId = getters.currentPageId
      const surface = modifiedDom.querySelector('surface[*|id="' + surfaceId + '"]')
      const zone = surface.querySelector('zone[data="#' + genDescWz.getAttribute('xml:id') + '"]')

      const pageGenDesc = getters.genDescForCurrentPage
      const genDescPageId = pageGenDesc.getAttribute('xml:id')

      zone.remove()
      genDescWz.remove()
      svgGroupWz.remove()

      const path = getters.currentDocPath
      const docName = getters.documentNameByPath(path)

      const svgPath = getters.currentSvgPath
      const param = getters.currentSurfaceIndexForCurrentDoc
      const baseMessage = 'deleted writingZone on ' + docName + ', p.'

      dispatch('loadDocumentIntoStore', { path: path, dom: modifiedDom })
      dispatch('loadDocumentIntoStore', { path: svgPath, dom: modifiedSvgDom })
      dispatch('logChange', { path: path, baseMessage, param, xmlIDs: [surfaceId, genDescPageId], isNewDocument: false })
      dispatch('logChange', { path: svgPath, baseMessage, param, xmlIDs: [svgId], isNewDocument: false })
    },

    /**
     * deletes a writing layer and moves all its shapes to the unassigned group
     * @param  {[type]} commit                    [description]
     * @param  {[type]} getters                   [description]
     * @param  {[type]} dispatch                  [description]
     * @param  {[type]} genDescWzId               [description]
     * @return {[type]}             [description]
     */
    deleteWritingLayer ({ commit, getters, dispatch }, genDescWlId) {
      if (!genDescWlId) {
        return null
      }
      const modifiedDom = getters.documentWithCurrentPage.cloneNode(true)
      const modifiedSvgDom = getters.svgForCurrentPage.cloneNode(true)

      if (!modifiedDom || !modifiedSvgDom) {
        return null
      }

      const svgId = modifiedSvgDom.querySelector('svg').getAttribute('id')

      const genDescWl = [...modifiedDom.querySelectorAll('genState')].find(genState => genState.getAttribute('xml:id') === genDescWlId)
      const genDescWz = genDescWl.closest('genDesc[class~="#geneticOrder_writingZoneLevel"]')
      const svgGroupWl = modifiedSvgDom.querySelector('#' + genDescWl.getAttribute('corresp').split('#')[1])
      const svgUnassignedGroup = modifiedSvgDom.querySelector('g.unassigned')

      svgGroupWl.querySelectorAll('path').forEach(shape => svgUnassignedGroup.append(shape))

      const surfaceId = getters.currentPageId
      const surface = modifiedDom.querySelector('surface[*|id="' + surfaceId + '"]')
      const zone = surface.querySelector('zone[data="#' + genDescWz.getAttribute('xml:id') + '"]')

      const pageGenDesc = getters.genDescForCurrentPage
      const genDescPageId = pageGenDesc.getAttribute('xml:id')

      // this needs to happen with the rendered svg, or it won't get positions!
      const renderedWritingLayer = document.querySelector('#' + genDescWl.getAttribute('corresp').split('#')[1])
      const renderedWritingZone = renderedWritingLayer.closest('g.writingZone')
      renderedWritingLayer.remove()

      const bbox = renderedWritingZone.getBBox()
      zone.setAttribute('ulx', Math.round(bbox.x))
      zone.setAttribute('uly', Math.round(bbox.y))
      zone.setAttribute('lrx', Math.round(bbox.x + bbox.width))
      zone.setAttribute('lry', Math.round(bbox.y + bbox.height))

      genDescWl.remove()
      svgGroupWl.remove()

      const path = getters.currentDocPath
      const docName = getters.documentNameByPath(path)

      const svgPath = getters.currentSvgPath
      const param = getters.currentSurfaceIndexForCurrentDoc
      const baseMessage = 'deleted writingLayer on ' + docName + ', p.'

      dispatch('loadDocumentIntoStore', { path: path, dom: modifiedDom })
      dispatch('loadDocumentIntoStore', { path: svgPath, dom: modifiedSvgDom })
      dispatch('logChange', { path: path, baseMessage, param, xmlIDs: [surfaceId, genDescPageId], isNewDocument: false })
      dispatch('logChange', { path: svgPath, baseMessage, param, xmlIDs: [svgId], isNewDocument: false })
    },

    /**
     * called by OSD when clicking on an svg path element
     * @param  {[type]} commit                 [description]
     * @param  {[type]} getters                [description]
     * @param  {[type]} dispatch               [description]
     * @param  {[type]} shapeId                [description]
     * @return {[type]}          [description]
     */
    clickedSvgShape ({ commit, getters, dispatch }, shapeId) {
      if (getters.currentTab === 'zones') {
        dispatch('moveShapeToCurrentWritingZone', shapeId)
      }
    },

    /**
     * sets the fragment identifier for pages, describing the actual page size within an image
     * @param  {[type]} commit                 [description]
     * @param  {[type]} getters                [description]
     * @param  {[type]} dispatch               [description]
     * @param  {[type]} xywh                   [description]
     * @return {[type]}          [description]
     */
    identifyPageFragment ({ commit, getters, dispatch }, xywh) {
      if (!xywh || !xywh.x || !xywh.y || !xywh.w || !xywh.h) {
        return null
      }
      const modifiedDom = getters.documentWithCurrentPage.cloneNode(true)

      if (!modifiedDom) {
        return null
      }

      const surfaceId = getters.currentPageId
      const surface = modifiedDom.querySelector('surface[*|id="' + surfaceId + '"]')
      const graphic = surface.querySelector('graphic[type="facsimile"]')
      const graphicId = graphic.getAttribute('xml:id')

      const existingTarget = graphic.getAttribute('target')
      const basePath = existingTarget.split('#xywh')[0]
      const fragment = '#xywh=' + xywh.x + ',' + xywh.y + ',' + xywh.w + ',' + xywh.h

      graphic.setAttribute('target', basePath + fragment)

      const path = getters.currentDocPath
      const docName = getters.documentNameByPath(path)

      const param = getters.currentSurfaceIndexForCurrentDoc
      const baseMessage = 'determine actual page dimensions within scan of ' + docName + ', p.'

      dispatch('loadDocumentIntoStore', { path: path, dom: modifiedDom })
      dispatch('logChange', { path: path, baseMessage, param, xmlIDs: [graphicId], isNewDocument: false })

      dispatch('disableAnnotorious')
    },

    /**
     * adds a system to the current page
     * @param {[type]} commit    [description]
     * @param {[type]} getters   [description]
     * @param {[type]} dispatch  [description]
     * @param {[type]} xywh      [description]
     */
    addSystem ({ commit, getters, dispatch }, xywh) {
      if (!xywh || !xywh.x || !xywh.y || !xywh.w || !xywh.h) {
        return null
      }
      const modifiedDom = getters.documentWithCurrentPage.cloneNode(true)
      if (!modifiedDom) {
        return null
      }

      const activeSystemId = getters.activeSystemId
      const surfaceId = getters.currentPageId
      const surface = modifiedDom.querySelector('surface[*|id="' + surfaceId + '"]')

      // create layout if necessary
      if (!surface.hasAttribute('decls')) {
        const physDesc = modifiedDom.querySelector('physDesc')

        // create layoutDesc if necessary
        if (!physDesc.querySelector('layoutDesc')) {
          const layoutDesc = document.createElementNS('http://www.music-encoding.org/ns/mei', 'layoutDesc')
          physDesc.append(layoutDesc)
        }

        const layoutDesc = physDesc.querySelector('layoutDesc')

        const layout = document.createElementNS('http://www.music-encoding.org/ns/mei', 'layout')
        const layoutId = 'l' + uuid()
        layout.setAttribute('xml:id', layoutId)
        layout.setAttribute('label', surface.hasAttribute('label') ? surface.getAttribute('label') : surface.getAttribute('n'))

        const rastrumDesc = document.createElementNS('http://www.music-encoding.org/ns/mei', 'rastrumDesc')

        layout.append(rastrumDesc)
        layoutDesc.append(layout)

        surface.setAttribute('decls', '#' + layoutId)
      }

      const layoutId = surface.getAttribute('decls').substring(1)
      const layout = [...modifiedDom.querySelectorAll('layout')].find(layout => layout.getAttribute('xml:id') === layoutId)

      if (!layout.querySelector('rastrumDesc')) {
        const rastrumDesc = document.createElementNS('http://www.music-encoding.org/ns/mei', 'rastrumDesc')
        layout.append(rastrumDesc)
      }

      // get relevant rastrumDesc
      const rastrumDesc = layout.querySelector('rastrumDesc')

      // convert px to mm coordinates
      const mmRect = convertRectUnits(modifiedDom, surfaceId, xywh, 'px2mm')
      /* console.log('\n\nHELLO POOOOLLLY:')
      console.log(xywh)
      console.log(mmRect)
      console.log(layout)
      console.log(rastrumDesc) */

      // no rastrum so far
      if (!activeSystemId || !rastrumDesc.querySelector('rastrum[*|id="' + activeSystemId + '"]')) {
        const rastrum = document.createElementNS('http://www.music-encoding.org/ns/mei', 'rastrum')
        const rastrumId = 'r' + uuid()
        rastrum.setAttribute('xml:id', rastrumId)
        rastrum.setAttribute('systems', 1)
        rastrum.setAttribute('system.height', mmRect.h)
        rastrum.setAttribute('width', mmRect.w)
        rastrum.setAttribute('system.leftmar', mmRect.x)
        rastrum.setAttribute('system.topmar', mmRect.y)
        rastrumDesc.append(rastrum)

        dispatch('setActiveSystem', rastrumId)
      } else {
        const rastrum = rastrumDesc.querySelector('rastrum[*|id="' + activeSystemId + '"]')
        rastrum.setAttribute('system.height', mmRect.h + 'mm')
        rastrum.setAttribute('width', mmRect.w + 'mm')
        rastrum.setAttribute('system.leftmar', mmRect.x + 'mm')
        rastrum.setAttribute('system.topmar', mmRect.y + 'mm')
      }

      sortRastrumsByVerticalPosition(rastrumDesc)

      console.log('\n\nHELLO POLLY')
      console.log(modifiedDom)

      const path = getters.currentDocPath
      const docName = getters.documentNameByPath(path)

      const param = getters.currentSurfaceIndexForCurrentDoc
      const baseMessage = 'adjust systems on ' + docName + ', p.'

      dispatch('loadDocumentIntoStore', { path: path, dom: modifiedDom })
      // TODO xmlIDs
      dispatch('logChange', { path: path, baseMessage, param, xmlIDs: [], isNewDocument: false })

      dispatch('disableAnnotorious')
    }

    /*
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
     */
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
      if (!mei) {
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
        const target = graphic.getAttributeNS('', 'target').trim()

        obj.uri = target
        obj.id = surface.getAttribute('xml:id').trim()
        obj.n = surface.hasAttribute('n') ? surface.getAttributeNS('', 'n').trim() : n
        obj.label = surface.hasAttribute('label') ? surface.getAttributeNS('', 'label').trim() : n
        obj.width = parseInt(graphic.getAttributeNS('', 'width').trim(), 10)
        obj.height = parseInt(graphic.getAttributeNS('', 'height').trim(), 10)
        obj.hasSvg = surface.querySelector('graphic[type="shapes"]') !== null // exists(graphic[@type='svg']) inside relevant /surface
        obj.hasZones = surface.querySelector('zone') !== null // exists(mei:zone) inside relevant /surface
        obj.hasFragment = target.indexOf('#xywh=') !== -1

        if (!surface.hasAttribute('decls')) {
          obj.systems = -2
        } else {
          const layoutId = surface.getAttribute('decls')?.substring(1)
          const layout = mei.querySelector('layout[*|id="' + layoutId + '"]')

          if (!layout) {
            obj.systems = -1
          } else {
            obj.systems = layout.querySelectorAll('rastrum').length
          }
        }

        arr[n] = obj
      })
      return arr
    },

    documentPagesForSidebars: (state, getters) => (path) => {
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
      if (!mei) {
        return []
      }

      mei.querySelectorAll('foliaDesc > *').forEach(foliumLike => {
        resolveFoliumLike2Surfaces(arr, foliumLike)
      })

      const encodingDescClasses = mei.querySelector('encodingDesc').getAttribute('class').trim().replace(/s+/, ' ').split(' ')
      const isReconstruction = encodingDescClasses.indexOf('#bw_document_reconstruction') !== -1

      const name = getters.documentNameByPath(path)

      arr.forEach((link, i) => {
        if (link.startsWith('#')) {
          arr[i] = { name, surface: mei.querySelector('surface[*|id = "' + link.substring(1) + '"]') }
        } else {
          const relativePath = link.split('#')[0]
          const id = link.split('#')[1]
          const folder = relativePath.split('/')[relativePath.split('/').length - 2]

          const fullPath = getters.documentPathByName(folder)
          const file = getters.documentByPath(fullPath)
          arr[i] = { name: folder, surface: file.querySelector('surface[*|id = "' + id + '"]') }
        }
      })

      arr.forEach((page, n) => {
        const name = page.name
        const surface = page.surface
        const graphic = surface.querySelector('graphic[type="facsimile"]')
        const i = n + 1
        // const page = mei.querySelector('page:nth-child(' + i + ')')

        const obj = {}

        const target = graphic.getAttributeNS('', 'target').trim()
        const surfaceN = surface.hasAttribute('n') ? surface.getAttributeNS('', 'n').trim() : i
        const surfaceLabel = surface.hasAttribute('label') ? surface.getAttributeNS('', 'label').trim() : surfaceN
        const label = isReconstruction ? i : surfaceLabel

        obj.uri = target
        obj.id = surface.getAttribute('xml:id').trim()
        obj.label = label
        obj.modernLabel = isReconstruction ? surfaceLabel : null

        obj.document = name

        obj.width = parseInt(graphic.getAttributeNS('', 'width').trim(), 10)
        obj.height = parseInt(graphic.getAttributeNS('', 'height').trim(), 10)

        obj.hasSvg = surface.querySelector('graphic[type="shapes"]') !== null // exists(graphic[@type='svg']) inside relevant /surface
        obj.zonesCount = surface.querySelectorAll('zone[type="writingZone"]').length // exists(mei:zone) inside relevant /surface
        obj.hasFragment = target.indexOf('#xywh=') !== -1

        if (!surface.hasAttribute('decls')) {
          obj.systems = 0
        } else {
          const layoutId = surface.getAttribute('decls')?.substring(1)
          const layout = [...surface.closest('mei').querySelectorAll('layout')].find(layout => layout.getAttribute('xml:id') === layoutId)

          if (!layout) {
            obj.systems = 0
          } else {
            obj.systems = layout.querySelectorAll('rastrum').length
          }
        }

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
    documentPathByName: state => (name) => state.documentNamePathMapping[name],

    /**
     * retrieves the name of a document by its path
     * @memberof store.data.getters
     * @param  {[type]} state              The vuex state of the current module
     * @param  {[type]} path               The path of the document for which the name shall be retrieved
     * @return {[type]}                    The name of the document
     */
    documentNameByPath: state => (path) => state.documentNamePathMapping[path],

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
    },

    /**
     * returns the xml:id of the current page
     * @param  {[type]} state                 [description]
     * @param  {[type]} getters               [description]
     * @return {[type]}         [description]
     */
    currentPageId: (state, getters) => {
      const pageIndex = getters.currentPageZeroBased
      const path = getters.filepath
      const arr = getters.documentPagesForSidebars(path)
      let out = null

      try {
        const surface = arr[pageIndex]
        out = surface.id
      } catch (err) {
        // console.log('Unable to find surface: ' + err)
      }
      return out
    },

    /**
     * returns the index of the current surface in its modern document
     * @param  {[type]} state                 [description]
     * @param  {[type]} getters               [description]
     * @return {[type]}         [description]
     */
    currentSurfaceIndexForCurrentDoc: (state, getters) => {
      try {
        const doc = getters.documentWithCurrentPage
        const allSurfaces = [...doc.querySelectorAll('surface')]
        const surfaceIndex = allSurfaces.findIndex(surface => surface.getAttribute('xml:id') === getters.currentPageId) + 1
        return surfaceIndex
      } catch (err) {
        return -1
      }
    },

    /**
     * retrieves the path for the currently relevant MEI file
     * @param  {[type]} state                 [description]
     * @param  {[type]} getters               [description]
     * @return {[type]}         [description]
     */
    currentDocPath: (state, getters) => {
      const pageIndex = getters.currentPageZeroBased
      const path = getters.filepath
      const pages = getters.documentPagesForSidebars(path)
      if (pages.length === 0) {
        return null
      }

      const page = pages[pageIndex]
      const docName = page.document
      const docPath = getters.documentPathByName(docName)

      return docPath
    },

    /**
     * retrieves the path of the SVG file for currently visible page
     * @param  {[type]} state                 [description]
     * @param  {[type]} getters               [description]
     * @return {[type]}         [description]
     */
    currentSvgPath: (state, getters) => {
      const pageIndex = getters.currentPageZeroBased
      const path = getters.filepath
      const pages = getters.documentPagesForSidebars(path)

      const page = pages[pageIndex]
      if (!page) {
        return null
      }

      const docName = page.document
      const surfaceId = page.id
      const docPath = getters.documentPathByName(docName)
      const dom = getters.documentByPath(docPath)

      const surface = dom.querySelector('surface[*|id="' + surfaceId + '"]')
      const svgGraphic = surface.querySelector('graphic[type="shapes"]')
      if (!svgGraphic) {
        return null
      }
      const svgFileRelativeLink = svgGraphic.getAttribute('target')
      const svgFilePath = docPath.split(docName + '.xml')[0] + svgFileRelativeLink.substring(2)

      return svgFilePath
    },

    /**
     * retrieves the svg file of the current page
     * @param  {[type]} state                 [description]
     * @param  {[type]} getters               [description]
     * @return {[type]}         [description]
     */
    svgForCurrentPage: (state, getters) => {
      const svgFilePath = getters.currentSvgPath
      if (svgFilePath === null) {
        return null
      }

      const svgDom = getters.documentByPath(svgFilePath)

      return svgDom
    },

    /**
     * retrieves the document with the current page
     * @param  {[type]} state                 [description]
     * @param  {[type]} getters               [description]
     * @return {[type]}         [description]
     */
    documentWithCurrentPage: (state, getters) => {
      const pageIndex = getters.currentPageZeroBased
      const path = getters.filepath
      const pages = getters.documentPagesForSidebars(path)

      const page = pages[pageIndex]
      const docName = page.document
      const docPath = getters.documentPathByName(docName)
      const dom = getters.documentByPath(docPath)

      return dom
    },

    /**
     * gets genDesc for current page
     * @param  {[type]} state                 [description]
     * @param  {[type]} getters               [description]
     * @return {[type]}         [description]
     */
    genDescForCurrentPage: (state, getters) => {
      const dom = getters.documentWithCurrentPage
      const surfaceId = getters.currentSurfaceId

      if (!dom || !surfaceId) {
        return null
      }

      const genDescPage = dom.querySelector('genDesc[corresp="#' + surfaceId + '"]')

      return genDescPage
    },

    /**
     * retrieves the genDesc for current writingZone
     * @param  {[type]} state                 [description]
     * @param  {[type]} getters               [description]
     * @return {[type]}         [description]
     */
    genDescForCurrentWritingZone: (state, getters) => {
      const genDescPage = getters.genDescForCurrentPage
      const writingZoneId = getters.activeWritingZone

      if (!genDescPage || !writingZoneId) {
        return null
      }
      const genDescWritingZone = [...genDescPage.children].find(wz => wz.getAttribute('xml:id') === writingZoneId)
      return genDescWritingZone
    },

    /**
     * retrieves the genDesc for current writingLayer
     * @param  {[type]} state                 [description]
     * @param  {[type]} getters               [description]
     * @return {[type]}         [description]
     */
    genDescForCurrentWritingLayer: (state, getters) => {
      const genDescPage = getters.genDescForCurrentPage
      const writingLayerId = getters.activeWritingLayer

      if (!genDescPage || !writingLayerId) {
        return null
      }
      const genDescWritingLayer = [...genDescPage.querySelectorAll('genState')].find(wz => wz.getAttribute('xml:id') === writingLayerId)
      return genDescWritingLayer
    },

    /**
     * retrieves the final writingLayer in the currently active writingZone
     * @param  {[type]} state                 [description]
     * @param  {[type]} getters               [description]
     * @return {[type]}         [description]
     */
    genDescForFinalWritingLayerInCurrentWritingZone: (state, getters) => {
      const genDescWritingZone = getters.genDescForCurrentWritingZone

      if (!genDescWritingZone) {
        return null
      }

      const writingLayer = genDescWritingZone.querySelector('genState[class~="#geneticOrder_finalState"]')
      return writingLayer
    },

    /**
     * retrieves the xml:id of the currently displayed surface
     * @param  {[type]} state                 [description]
     * @param  {[type]} getters               [description]
     * @return {[type]}         [description]
     */
    currentSurfaceId: (state, getters) => {
      const pageIndex = getters.currentPageZeroBased
      const path = getters.filepath
      const pages = getters.documentPagesForSidebars(path)

      const page = pages[pageIndex]
      const surfaceId = page.id
      return surfaceId
    },

    /**
     * returns the width and height of the current page in pixels
     * @param  {[type]} state                 [description]
     * @param  {[type]} getters               [description]
     * @return {[type]}         [description]
     */
    currentPageDimensions: (state, getters) => {
      const pageIndex = getters.currentPageZeroBased
      const path = getters.filepath
      const pages = getters.documentPagesForSidebars(path)

      const page = pages[pageIndex]
      return { width: page.width, height: page.height }
    },

    /**
     * returns an object with the dimensions of the current page fragment identifier, if any
     * @param  {[type]} state                 [description]
     * @param  {[type]} getters               [description]
     * @return {[type]}         [description]
     */
    currentPageFragmentIdentifier: (state, getters) => {
      const dom = getters.documentWithCurrentPage
      const surfaceId = getters.currentSurfaceId

      if (!dom || !surfaceId) {
        return null
      }

      const graphic = dom.querySelector('surface[*|id="' + surfaceId + '"] graphic[type="facsimile"]')

      if (!graphic) {
        return null
      }

      const fragment = graphic.getAttribute('target').split('#xywh=')[1]

      if (!fragment) {
        return null
      }

      const obj = {
        x: fragment.split(',')[0],
        y: fragment.split(',')[1],
        w: fragment.split(',')[2],
        h: fragment.split(',')[3]
      }
      return obj
    },

    /**
     * retrieves the writing zons on the current page
     * @param  {[type]} state                 [description]
     * @param  {[type]} getters               [description]
     * @return {[type]}         [description]
     */
    writingZonesOnCurrentPage: (state, getters) => {
      const genDescPage = getters.genDescForCurrentPage // dom.querySelector('genDesc[corresp="#' + surfaceId + '"]')
      const genDescWzArr = genDescPage.querySelectorAll('genDesc[class="#geneticOrder_writingZoneLevel"]')

      if (genDescWzArr.length === 0) {
        return []
      }
      const dom = getters.documentWithCurrentPage
      const surfaceId = getters.currentSurfaceId
      const surface = dom.querySelector('surface[*|id="' + surfaceId + '"]')
      const svgDom = getters.svgForCurrentPage

      const arr = []

      if (!svgDom) {
        return arr
      }

      genDescWzArr.forEach(genDescWz => {
        const genDescWzId = genDescWz.getAttribute('xml:id')

        const svgGroupWzId = genDescWz.getAttribute('corresp').split('#')[1]

        const zone = surface.querySelector('zone[data="#' + genDescWzId + '"]')
        const x = parseInt(zone.getAttribute('ulx'))
        const y = parseInt(zone.getAttribute('uly'))
        const w = parseInt(zone.getAttribute('lrx')) - x
        const h = parseInt(zone.getAttribute('lry')) - y

        let totalCount = 0

        const genDescWlArr = genDescWz.querySelectorAll('genState[class~="#geneticOrder_writingLayerLevel"]')
        const layers = []
        genDescWlArr.forEach(genDescWl => {
          const svgGroupFullLink = genDescWl.getAttribute('corresp')
          // const svgFileRelativeLink = svgGroupFullLink.split('#')[0]
          const svgGroupId = svgGroupFullLink.split('#')[1]

          const svgGroup = svgDom.querySelector('g[id="' + svgGroupId + '"')
          const shapes = []
          svgGroup.querySelectorAll('path').forEach(path => {
            shapes.push(path.getAttribute('id'))
          })

          const wl = {}
          wl.id = genDescWl.getAttribute('xml:id')
          wl.label = genDescWl.getAttribute('label')
          wl.shapes = shapes
          wl.svgGroupWlId = svgGroupId
          wl.classes = genDescWl.getAttribute('class').split(' ')

          totalCount += shapes.length

          layers.push(wl)
        })

        const wz = {}
        wz.id = genDescWzId
        wz.label = genDescWz.getAttribute('label')

        wz.totalCount = totalCount
        wz.annotTrans = null
        wz.xywh = x + ',' + y + ',' + w + ',' + h
        wz.layers = layers
        wz.svgGroupWzId = svgGroupWzId

        arr.push(wz)
      })

      return arr
    },

    /**
     * retrieves all shapes of the current page not currently assigned to a writing zone
     * @param  {[type]} state                 [description]
     * @param  {[type]} getters               [description]
     * @return {[type]}         [description]
     */
    unassignedShapesOnCurrentPage: (state, getters) => {
      const svg = getters.svgForCurrentPage

      if (!svg) {
        return []
      }

      const shapes = []
      const children = svg.querySelectorAll('g[class="unassigned"] path')
      children.forEach(elem => {
        if (elem.localName === 'path') {
          shapes.push(elem.id)
        }
      })

      return shapes
    }
  }
}

export default dataModule
