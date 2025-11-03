<template>
  <div ref="container" class="facsimileContainer" :class="[ explorerTab, { diploTrans: this.type === 'diploTrans' }]">
    <!--<div style="position: absolute; top: 1em; left: 1em; right: 1em; border: .5px solid red; z-index: 20; padding: .3rem; background-color: #ffffff66;">TileSource: {{ tileSource }}</div>-->
  </div>
</template>

<script>
import OpenSeadragon from 'openseadragon'
import { mapGetters } from 'vuex'
// import { rotatePoint } from '@/tools/trigonometry.js'
import { controlpointsToVerovioSvgBezier } from '@/tools'
// Temporary local import for thulemeier; swap to 'import { ... } from "thulemeier"' when published to NPM
import { render } from 'thulemeier'
import { /* getMediaFragmentBBoxRect, getMediaFragmentRect, */ /* getMediaFragmentInnerBoxRect, */ getOsdRects } from '@/tools/facsimileHelpers.js'
import { appendNewElement, CSSselectables } from '@/tools/mei.js'

// import { useDiploTrans } from '@/store/gui/diplotrans'
import { scaleXYControlpoints, identifyClosestSystem } from '@/tools/diplomaticTranscripts.js'

const osdOptions = {
  preserveViewport: false,
  visibilityRatio: 0.8,
  sequenceMode: false,
  showNavigator: false,
  // navigatorId: 'openSeadragonNavigator',
  homeButton: 'zoomHome',
  zoomInButton: 'zoomIn',
  zoomOutButton: 'zoomOut',
  previousButton: 'pageLeft',
  nextButton: 'pageRight',
  gestureSettingsMouse: {
    clickToZoom: false
  },
  silenceMultiImageWarnings: true
}

export default {
  name: 'FacsimileComponent',
  props: {
    type: String // default: 'facsimile', 'diploTrans'
  },
  data: () => ({
    // we need up to 4 MouseTracker
    mouseTracker: [null, null, null, null]
  }),
  computed: {
    ...mapGetters(['diploTransVerovioOptions']),
    /**
     * the tileSource for the current page
     * @return {[type]} [description]
     */
    tileSource () {
      const tileSource = this.$store.getters.osdTileSourceForCurrentPage

      return tileSource
    },

    /**
     * the currently opened tab of FX
     * @return {[type]} [description]
     */
    explorerTab () {
      return this.$store.getters.explorerTab
    },

    /**
     * in which tabs of the FX shall we render svg shapes?
     * @return {[type]} [description]
     */
    showSvg () {
      const tab = this.$store.getters.explorerTab
      const validTabs = ['pages', 'zones', 'annot', 'diplo']
      return validTabs.indexOf(tab) !== -1 && (!this.type || this.type !== 'diploTrans')
    },

    /**
     * in which tabs of the FX shall we render th Grid?
     * @return {[type]} [description]
     */
    showGrid () {
      const tab = this.$store.getters.explorerTab
      const validTabs = ['pages']
      const gridFlag = this.$store.getters.pageShowGrid
      return gridFlag && validTabs.indexOf(tab) !== -1
    },

    /**
     * in which tabs of the FX shall we render rastrums / systems as boxes?
     * @return {[type]} [description]
     */
    showSystems () {
      const tab = this.$store.getters.explorerTab
      const validTabs = ['pages']
      return validTabs.indexOf(tab) !== -1
    },

    /**
     * in which tabs of the FX shall we render the page border as box?
     * @return {[type]} [description]
     */
    showPageBorders () {
      const tab = this.$store.getters.explorerTab
      if (tab === 'pages') {
        return true
      }
      if (tab === 'diplo' && this.type === 'diploTrans') {
        return true
      }
      return false
    },

    /**
     * in which tabs of the FX shall we render the stafflines of the current page?
     * @return {[type]} [description]
     */
    showRenderedStafflines () {
      const tab = this.$store.getters.explorerTab
      const validTabs = ['diplo']
      return validTabs.indexOf(tab) !== -1 && this.type === 'diploTrans'
    },
    activeBezier () {
      const name = this.$store.getters.activeDiploTransElementName
      if (name === 'curve') {
        // const id = this.$store.getters.activeDiploTransElementId
        const bezier = this.$store.getters.activeDiploTransElementAttValue('bezier')
        const cp = bezier?.split(' ').map(p => parseFloat(p))
        // const rastrum = this.$store.getters.rastrumForCurrentPage
        return cp
      }
      return null
    }
  },
  methods: {
    /**
     * Triggered by clicking into the facsimile. Gathers info about pixel
     * position and image position (mm), and the element clicked on.
     * @param  {[type]} e               [description]
     * @return {[type]}   [description]
     */
    facsimileClickListener (e) {
      const image = this.viewer.world.getItemAt(0)
      const imagePoint = image.viewerElementToImageCoordinates(e.position)

      const click = {
        image: { x: imagePoint.x, y: imagePoint.y },
        target: e.originalTarget,
        shift: e.shift,
        alt: e.originalEvent.altKey
      }

      // const dtstore = useDiploTrans()
      // console.log(dtstore.selections.facs)

      const origin = new OpenSeadragon.Point(0, 0)
      const deg = this.$store.getters.currentPageRotation

      const originalClick = new OpenSeadragon.Point(e.originalEvent.clientX, e.originalEvent.clientY)
      const viewportCoordinates = this.viewer.viewport.windowToViewportCoordinates(originalClick)
      const clickedPagePos = viewportCoordinates.rotate(deg, origin)
      // const pageRect = getMediaFragmentInnerBoxRect(OpenSeadragon, this.$store.getters)

      // const onPage = pageRect.location.containsPoint(clickedPagePos)

      // if (onPage) {
      click.page = clickedPagePos
      // }

      // console.log(click, click.target.localName)

      // check for click to svg shape
      if (click.target.localName === 'path' || click.target.localName === 'polygon') {
        // console.log('clicked on shape ' + click.target.id + ' – this.type: ' + this.type)
        if (this.type === 'facsimile' && this.explorerTab === 'diplo') {
          const svgGroupWzId = click.target.closest('.writingZone')?.id
          const genDescWzId = this.$store.getters.genWzIdForShape(svgGroupWzId)
          const wzActive = genDescWzId && genDescWzId === this.$store.getters.activeWritingZone

          const selectWzFunc = () => {
            // this.$store.dispatch('setActiveWritingZoneForShape', { type: 'shape', svgGroupWzId })
            this.$store.dispatch('setActiveWritingZone', genDescWzId)
          }

          const initializeDT = () => {
            this.$store.dispatch('setModal', 'initializeDT')
          }

          const selectFunc = () => {
            this.$store.dispatch('setActiveDiploTransElementId', null)
            this.$store.dispatch('diploTransToggle', { type: 'shape', id: click.target.id, wzgroup: svgGroupWzId })
          }
          const func = (type) => () => {
            console.log('make "' + click.target.id + '" a "' + type + '" (wz: ' + svgGroupWzId + ')')
          }

          const usedShape = click.target.classList.contains('usedShape')
          // console.log('WRITING ZONE:', genDescWzId)

          const addShapeEntry = {
            label: 'Add shape to current DiploTrans element',
            action: () => {
              // console.log('add shape to current DiploTrans element')
              // TODO: ask for function (stem/head/etc)
              const filePath = this.$store.getters.currentWritingZoneObject?.diploTrans
              const id = this.$store.getters.activeDiploTransElementId
              const baseMessage = 'Add shape to DT at '
              const svgPath = '../svg/' + this.$store.getters.currentSvgPath.split('/').splice(-1)[0]
              const origdoc = this.$store.getters.documentByPath(filePath)
              const doc = origdoc?.cloneNode(true)
              const allElems = doc.querySelectorAll('mdiv *')
              const snippet = [...allElems].find(elem => elem.getAttribute('xml:id') === id) // doc?.querySelector(`*[*|id="${id}"]`)
              if (snippet) {
                const facs = snippet.getAttribute('facs')?.split(' ') || []
                facs.push(svgPath + '#' + click.target.id)
                const afacs = facs.join(' ')
                snippet.setAttribute('facs', afacs)
                console.log('facs:', afacs, snippet)
                this.$store.dispatch('loadDocumentIntoStore', { path: filePath, dom: doc })
                this.$store.dispatch('logChange', {
                  path: filePath,
                  baseMessage,
                  param: id,
                  xmlIDs: [id],
                  isNewDoument: false
                })
              } else {
                console.warn('addShapeEntry: no snippet found!')
              }
            },
            disabled: this.$store.getters.activeDiploTransElementId === null
          }

          const activateDTEntry = {
            label: 'Activate element in DiploTrans',
            action: () => {
              const DT = this.$store.getters.diplomaticTranscriptForCurrentWz
              const elems = DT.querySelectorAll('*[facs]')
              for (const elem of elems) {
                const facs = elem.getAttribute('facs')
                if (facs.includes(click.target.id)) {
                  // console.log('activate?', elem.getAttribute('xml:id'))
                  this.$store.dispatch('setActiveDiploTransElementId', elem.getAttribute('xml:id'))
                }
              }
            },
            disabled: !usedShape
          }

          /* const adjustFunctionEntry = {
            label: 'Adjust function of shape in DiploTrans',
            action: () => {
              console.log('TODO: adjust function of shape in DiploTrans')
            },
            // TODO: only possible for some element types, like notes, but not slurs
            disabled: this.$store.getters.activeDiploTransElementId === null && !usedShape
          } */

          // Function to transcribe new Deletion
          const setDeletion = {
            label: 'Deletion',
            action: async () => {
              // console.log('identify shape as deletion')
              const baseMessage = 'transcribe deletion'
              const filePath = this.$store.getters.currentWritingZoneObject?.diploTrans
              // const id = this.$store.getters.activeDiploTransElementId
              const svgPath = '../svg/' + this.$store.getters.currentSvgPath.split('/').splice(-1)[0]
              const origdoc = this.$store.getters.documentByPath(filePath)
              const doc = origdoc?.cloneNode(true)
              const draft = doc?.querySelector('draft')

              if (draft) {
                const del = appendNewElement(draft, 'del')
                del.setAttribute('facs', svgPath + '#' + click.target.id)

                const path = appendNewElement(del, 'path', 'http://www.w3.org/2000/svg')
                // console.log(752, 'setDeletion: svg:path', path)

                const rects = this.$store.getters.osdRects
                const targetBBox = click.target.getBBox()
                // console.log(784, 'bbox', click.target.getBBox(), 'rects', rects)
                const bbox = { px: { x: targetBBox.x, y: targetBBox.y, w: targetBBox.width, h: targetBBox.height } }

                bbox.mm = {
                  x: parseFloat((bbox.px.x / rects.ratio + +rects.image.x).toFixed(1)),
                  y: parseFloat((bbox.px.y / rects.ratio + +rects.image.y).toFixed(1)),
                  w: parseFloat((bbox.px.w / rects.ratio).toFixed(1)),
                  h: parseFloat((bbox.px.h / rects.ratio).toFixed(1)),
                  offX: 0
                }

                const points = []
                points.push('M' + bbox.mm.x + ',' + bbox.mm.y)
                points.push('L' + (bbox.mm.x + bbox.mm.w) + ',' + bbox.mm.y)
                points.push('L' + (bbox.mm.x + bbox.mm.w) + ',' + (bbox.mm.y + bbox.mm.h))
                points.push('L' + bbox.mm.x + ',' + (bbox.mm.y + bbox.mm.h))
                points.push('Z')

                path.setAttribute('d', points.join(' '))

                await this.$store.dispatch('loadDocumentIntoStore', { path: filePath, dom: doc })
                await this.$store.dispatch('logChange', {
                  path: filePath,
                  baseMessage,
                  param: '',
                  xmlIDs: [draft.getAttribute('xml:id')],
                  isNewDoument: false
                })
                this.$store.dispatch('setActiveDiploTransElementId', del.getAttribute('xml:id'))

                /*
                // TEST: log the deletion element
                const id = del.getAttribute('xml:id')
                const file = this.$store.getters.documentByPath(filePath).cloneNode(true)
                // const file = doc.cloneNode(true)
                const allElems = doc.querySelectorAll('mdiv *')
                const elem = [...allElems].find(elem => elem.getAttribute('xml:id') === id)
                // const elem = file.querySelector('del[*|id="' + id + '"]')
                console.log(752, 'setDeletion: element', elem, 'id', id)
                const serializer = new XMLSerializer()
                console.log(752, serializer.serializeToString(file))
                // END TEST */
              } else {
                console.warn('setDeletion: no draft element found!')
              }
            },
            disabled: !wzActive
          }

          // Function to transcribe new unclear element
          const setUnclear = {
            label: 'Unclear Symbol',
            action: async () => {
              // console.log('identify shape as unclear')
              const baseMessage = 'transcribe unclear'
              const filePath = this.$store.getters.currentWritingZoneObject?.diploTrans
              // const id = this.$store.getters.activeDiploTransElementId
              const svgPath = '../svg/' + this.$store.getters.currentSvgPath.split('/').splice(-1)[0]
              const origdoc = this.$store.getters.documentByPath(filePath)
              const doc = origdoc?.cloneNode(true)
              const draft = doc?.querySelector('draft')

              if (draft) {
                const unclear = appendNewElement(draft, 'unclear')
                unclear.setAttribute('facs', svgPath + '#' + click.target.id)

                /*
                const rects = this.$store.getters.osdRects
                const targetBBox = click.target.getBBox()
                // console.log(784, 'bbox', click.target.getBBox(), 'rects', rects)
                const bbox = { px: { x: targetBBox.x, y: targetBBox.y, w: targetBBox.width, h: targetBBox.height } }

                bbox.mm = {
                  x: parseFloat((bbox.px.x / rects.ratio + +rects.image.x).toFixed(1)),
                  y: parseFloat((bbox.px.y / rects.ratio + +rects.image.y).toFixed(1)),
                  w: parseFloat((bbox.px.w / rects.ratio).toFixed(1)),
                  h: parseFloat((bbox.px.h / rects.ratio).toFixed(1)),
                  offX: 0
                } */

                await this.$store.dispatch('loadDocumentIntoStore', { path: filePath, dom: doc })
                await this.$store.dispatch('logChange', {
                  path: filePath,
                  baseMessage,
                  param: '',
                  xmlIDs: [draft.getAttribute('xml:id')],
                  isNewDoument: false
                })
                this.$store.dispatch('setActiveDiploTransElementId', unclear.getAttribute('xml:id'))
              } else {
                console.warn('setUnclear: no draft element found!')
              }
            },
            disabled: !wzActive
          }

          const setNavigationalSign = {
            label: 'Navigation Sign',
            action: async () => {
              const baseMessage = 'transcribe navigation sign'
              const filePath = this.$store.getters.currentWritingZoneObject?.diploTrans
              // const id = this.$store.getters.activeDiploTransElementId
              const svgPath = '../svg/' + this.$store.getters.currentSvgPath.split('/').splice(-1)[0]
              const origdoc = this.$store.getters.documentByPath(filePath)
              const doc = origdoc?.cloneNode(true)
              const draft = doc?.querySelector('draft')

              console.log(331, 'target', click.target)
              console.log(331, 'parent', click.target.parentElement)
              console.log(331, 'grandparent', click.target.parentElement?.parentElement)

              if (draft) {
                const rects = this.$store.getters.osdRects
                const targetBBox = click.target.getBBox()
                // console.log(784, 'bbox', click.target.getBBox(), 'rects', rects)

                const wzShapes = click.target.parentElement?.parentElement?.querySelectorAll('path')
                const systems = draft.querySelectorAll('system')
                const rastrumsOnCurrentPage = this.$store.getters.rastrumsOnCurrentPage

                // Identify the closest system to the clicked shape with relative positioning
                const targetSystem = identifyClosestSystem(targetBBox, systems, wzShapes, rastrumsOnCurrentPage, rects)

                console.log(641, 'Target system with relative position:', targetSystem)

                let positionX, positionY

                if (targetSystem && targetSystem.relativePosition) {
                  // Use relative position to top rastrum
                  positionX = parseFloat(targetSystem.relativePosition.relativeX.toFixed(1))
                  positionY = parseFloat(targetSystem.relativePosition.relativeY.toFixed(1))
                  console.log('Using relative position to rastrum:', targetSystem.relativePosition.rastrumId,
                    'at', positionX, positionY)
                } else {
                  // Fallback to absolute positioning (old method)
                  console.warn('No relative positioning available, using absolute coordinates')
                  positionX = parseFloat((targetBBox.x / rects.ratio + +rects.image.x).toFixed(1))
                  positionY = parseFloat((targetBBox.y / rects.ratio + +rects.image.y).toFixed(1))
                }
                const section = targetSystem.element.querySelector('section')
                const metaMark = appendNewElement(section, 'metaMark')
                metaMark.setAttribute('function', 'navigation')
                metaMark.setAttribute('x', positionX)
                metaMark.setAttribute('y', positionY)
                metaMark.setAttribute('target', '#')
                metaMark.setAttribute('facs', svgPath + '#' + click.target.id)
                metaMark.textContent = '⦻'

                await this.$store.dispatch('loadDocumentIntoStore', { path: filePath, dom: doc })
                await this.$store.dispatch('logChange', {
                  path: filePath,
                  baseMessage,
                  param: '',
                  xmlIDs: [section.getAttribute('xml:id')],
                  isNewDoument: false
                })
                this.$store.dispatch('setActiveDiploTransElementId', metaMark.getAttribute('xml:id'))
              } else {
                console.warn('setNavigationalSign: no draft element found!')
              }
            },
            disabled: !wzActive
          }

          // adjusted selectFunc that will allow to create pitch clarification letters
          const pitchClarificationLetterFunc = () => {
            this.$store.dispatch('setPitchClarificationLetterMode', true)
            selectFunc()
          }

          const items = []
          if (!wzActive) {
            const wzidx = this.$store.getters.writingZoneIndexOnCurrentPage(genDescWzId)
            const label = 'select writing zone' + (wzidx >= 0 ? ` (${wzidx + 1})` : '')
            items.push({ label, action: selectWzFunc, disabled: !genDescWzId || wzActive })
          } else {
            if (this.$store.getters.needInitializeDT) {
              items.push({ label: 'initialize diplomatic transcript', action: initializeDT, disabled: this.$store.needInitializeDT })
            } else {
              [
                { label: 'Select for automatic transcription', action: selectFunc, disabled: !wzActive },
                {
                  label: 'Transcribe shape without AnnotTrans',
                  disabled: !wzActive,
                  items: [
                    setDeletion, // { label: 'Deletion', action: func('deletion'), disabled: !wzActive },
                    setUnclear,
                    { label: 'Pitch Clarification Letter', action: pitchClarificationLetterFunc, disabled: !wzActive },
                    setNavigationalSign// { label: 'Navigational Sign', action: func('navSign'), disabled: !wzActive }
                  ]
                },
                addShapeEntry,
                activateDTEntry
                // adjustFunctionEntry
              ].forEach(it => items.push(it))
            }
          }

          const contextMenu = {
            pos: { x: e.originalEvent.clientX, y: e.originalEvent.clientY },
            items
          }
          this.$store.dispatch('setContextMenu', contextMenu)
        } else {
          this.$store.dispatch('clickedSvgShape', click.target.id)
        }
      }

      // check for click to system
      if (click.target.localName === 'div' && click.target.classList.contains('rotatedSystem')) {
        const id = click.target.parentElement.getAttribute('data-id')
        this.$store.dispatch('setActiveSystem', id)
      }

      if (click.target.closest('.diploTrans')/* && click.target.closest('.measure') */) {
        const wzId = click.target.closest('.diploTrans').getAttribute('data-diploTrans')
        const target = click.target.closest(CSSselectables)
        // console.log(365, target, CSSselectables)
        if (target) {
          let id = target.getAttribute('data-id')
          this.$store.dispatch('setActiveWritingZone', wzId)
          // select chords to show up in XML editor instead of single notes
          if (target.matches('.note') && target.closest('.chord')) {
            id = target.closest('.chord').getAttribute('data-id')
          }
          this.$store.dispatch('setActiveDiploTransElementId', id)
          // console.log('selecting activeDiploTransElementId: ', id)
        }
      }
    },

    /**
     * open the facsimile given in this.tileSource
     * @return {[type]} [description]
     */
    openFacsimile () {
      console.log('FacsimileComponent:openFasimile() started')
      if (!this.tileSource) {
        // console.log('Page not available (yet)')
        return null
      }

      if (this.renderedUri === this.tileSource.tileSource) {
        // console.log('already showing that page…')
        return null
      }

      // todo: remove listeners
      this.$store.dispatch('setLoading', true)
      // this.$store.dispatch('resetPageBorderPoints')

      const ts = this.tileSource

      if (this.type && this.type === 'diploTrans') {
        ts.opacity = 0.6
      }

      // ts.degrees = 0
      this.viewer.open(ts)
    },

    /**
     * listeners called when facsimile is opened
     * @return {[type]} [description]
     */
    facsimileOpened (data) {
      console.log('FacsimileComponent:facsimileOpened()')
      this.renderedUri = data.source
      this.$store.dispatch('setLoading', false)

      // temporary condition
      /* if (this.viewer) {
        return null
      } */

      this.setPageRotation()
      this.renderGrid(data)

      if (this.showPageBorders) {
        this.renderPageBorders()
      }

      if (this.showRenderedStafflines) {
        this.renderPageBackground()
        this.renderDiploTransOnPage()
      }

      this.renderShapes()
      this.renderSystems()

      // console.log('facsimileOpened', data)
    },

    /**
     * updates the facsimile position when borders or dimensions change etc.
     * @return {[type]} [description]
     */
    updateFacsimile (tileSource, oldSource) {
      // console.log('FacsimileComponent:updateFacsimile() received new tileSource:', tileSource, oldSource)
      if (!tileSource) {
        return null
      }

      const tiledImage = this.viewer.world.getItemAt(0)

      if (!tiledImage) {
        return null
      }

      try {
        if (tileSource.width !== oldSource.width) {
          tiledImage.setWidth(tileSource.width)
        }
      } catch (err) {
        console.error('FacsimileComponent:updateFacsimile(): Unable to set width of tiledImage to ' + tileSource.width + ': ' + err, err)
      }

      try {
        if (tileSource.x !== oldSource.x || tileSource.y !== oldSource.y) {
          tiledImage.setPosition(new OpenSeadragon.Point(tileSource.x, tileSource.y))
        }
      } catch (err) {
        console.error('FacsimileComponent:updateFacsimile(): Unable to set position of tiledImage to ' + tileSource.x + ' / ' + tileSource.y + ': ' + err, err)
      }

      try {
        if (tileSource.degrees !== oldSource.degrees) {
          this.setPageRotation()
        }
      } catch (err) {
        console.error('FacsimileComponent:updateFacsimile(): Unable to update page rotation: ' + err, err)
      }

      try {
        this.renderPageBorders()
      } catch (err) {
        console.error('FacsimileComponent:updateFacsimile(): Unable to update pageBorders: ' + err, err)
      }
    },

    /**
     * renders graph paper ("Millimeterpapier") as a grid
     * @return {[type]} [description]
     */
    renderGrid () {
      // console.log('FacsimileComponent:renderGrid()')
      // temporary condition
      /* if (this.viewer) {
        return null
      } */

      this.$refs.container.querySelectorAll('.grid').forEach(overlay => {
        this.viewer.removeOverlay(overlay)
      })

      if (!this.showGrid) {
        return null
      }

      const tiledImage = this.viewer.world.getItemAt(0)

      if (!tiledImage) {
        // console.log('no tiledImage, so no renderGrid')
        return null
      }

      const currentPageDimensions = this.$store.getters.currentPageDimensions

      if (!currentPageDimensions) {
        return null
      }

      const pageWidth = parseInt(currentPageDimensions.mmWidth)
      const pageHeight = parseInt(currentPageDimensions.mmHeight)

      const verticalStart = parseInt(pageHeight * -0.1)
      const verticalEnd = parseInt(pageHeight * 1.1)

      const horizontalStart = parseInt(pageWidth * -0.1)
      const horizontalEnd = parseInt(pageWidth * 1.1)

      // draw vertical lines
      for (let i = horizontalStart; i < horizontalEnd; i++) {
        const element = document.createElement('div')
        element.classList.add('grid')
        element.classList.add('v')

        let width = 0.1

        if (i % 100 === 0) {
          element.classList.add('v100')
          element.title = i + 'mm'
          width = 1
        } else if (i % 10 === 0) {
          element.classList.add('v10')
          element.title = i + 'mm'
          width = 0.5
        } else if (i % 5 === 0) {
          element.classList.add('v5')
          width = 0.2
        }

        this.viewer.addOverlay({
          element,
          location: new OpenSeadragon.Point(parseInt(i) - width / 2, verticalStart),
          width,
          height: pageHeight * 1.2,
          placement: OpenSeadragon.Placement.TOP,
          rotationMode: OpenSeadragon.OverlayRotationMode.NO_ROTATION
        })
      }

      // draw horizontal lines
      for (let i = verticalStart; i < verticalEnd; i++) {
        const element = document.createElement('div')
        element.classList.add('grid')
        element.classList.add('h')

        let height = 0.1

        if (i % 100 === 0) {
          element.classList.add('h100')
          element.title = i + 'mm'
          height = 1
        } else if (i % 10 === 0) {
          element.classList.add('h10')
          element.title = i + 'mm'
          height = 0.5
        } else if (i % 5 === 0) {
          element.classList.add('h5')
          height = 0.2
        }

        this.viewer.addOverlay({
          element,
          location: new OpenSeadragon.Point(horizontalStart, parseInt(i) - height / 2),
          width: pageWidth * 1.2,
          height,
          placement: OpenSeadragon.Placement.LEFT,
          rotationMode: OpenSeadragon.OverlayRotationMode.NO_ROTATION
        })
      }
    },

    /**
     * renders SVG shapes as overlay on the facsimile
     * @return {[type]} [description]
     */
    renderShapes () {
      // console.log('FacsimileComponent:renderShapes()')
      if (!this.showSvg) {
        return false
      }
      const svg = this.$store.getters.svgForCurrentPage
      const page = this.$store.getters.currentPageDimensions
      const rects = this.$store.getters.osdRects

      if (!svg || !this.viewer || !page) {
        return null
      }

      const existingOverlay = this.$refs.container.querySelector('.svgContainer.shapes')

      if (existingOverlay !== null) {
        const oldActive = existingOverlay.querySelector('.activeWritingZone')

        if (oldActive !== null) {
          oldActive.classList.remove('activeWritingZone')
        }

        this.viewer.removeOverlay(existingOverlay)
      }

      if (!svg.documentElement) {
        console.warn('FacsimileComponent:renderShapes: Not an XMLDocument', svg)
      }

      const svgClone = svg.documentElement.cloneNode(true)

      /* const pos = this.viewer.world.getItemAt(0)?.getBounds()
      if (!pos) {
        return false
     } */

      const loc = new OpenSeadragon.Rect(rects.image.x, rects.image.y, rects.image.w, rects.image.h, 0)

      const svgContainer = document.createElement('div')
      svgContainer.classList.add('svgContainer')
      svgContainer.classList.add('shapes')
      svgClone.setAttribute('style', 'transform: rotate(' + (rects.rotation * -1) + 'deg); transform-origin: top left;')

      svgContainer.append(svgClone)

      this.viewer.addOverlay({
        element: svgContainer,
        location: loc
      })
      const writingZonesOnCurrentPage = this.$store.getters.writingZonesOnCurrentPage
      const activeWritingZone = this.$store.getters.activeWritingZone
      const activeWritingLayer = this.$store.getters.activeWritingLayer

      const activeZone = writingZonesOnCurrentPage.find(wz => wz.id === activeWritingZone)

      if (activeZone) {
        svgClone.querySelector('#' + activeZone.svgGroupWzId).classList.add('activeWritingZone')
        this.indicateUsedShapes()
      }

      if (activeZone && activeWritingLayer) {
        const activeLayer = activeZone.layers.find(wl => wl.id === activeWritingLayer)

        if (activeLayer) {
          svgClone.querySelector('#' + activeLayer.svgGroupWlId).classList.add('activeWritingLayer')
        }
      }

      if (this.$store.getters.diploTransActivationsInShapes.length > 0) {
        // console.log(this.$store.getters.diploTransActivationsInShapes)
        this.indicateSelectedShapes()
      }

      this.indicateSelectedDTElement()
    },

    /**
     * indicates which shapes are already used in the active diploTrans
     * @return {[type]} [description]
     */
    indicateUsedShapes () {
      const arr = [...this.$store.getters.activeDiploTransUsedShapes]
      console.log(279, 'FacsimileComponent:indicateUsedShapes(): starting with this array:\n', arr)
      const existingOverlay = this.$refs.container.querySelector('.svgContainer.shapes')

      if (existingOverlay !== null) {
        // console.log('found an overlay')
        existingOverlay.querySelectorAll('.activeWritingZone .usedShape').forEach(shape => {
          const id = shape.getAttribute('data-id')
          const index = arr.indexOf(id)
          if (index === -1) {
            // console.log('removing usedShape from ' + id)
            shape.classList.remove('usedShape')
          } else {
            arr.splice(index, 1)
          }
        })

        // console.log('\n\nNEED TO ADD in following array\n', arr)
        arr.forEach(id => {
          const elem = existingOverlay.querySelector('.activeWritingZone path[id="' + id + '"]')
          if (elem) {
            // console.log('adding usedShape to ' + id)
            elem.classList.add('usedShape')
          } else {
            // console.log('unable to find element with id ' + id + '\n', this.$refs.container.querySelectorAll('path'))
          }
        })
      }
    },

    /**
     * indicates which shape is selected
     */
    indicateSelectedShapes () {
      const arr2 = [...this.$store.getters.diploTransActivationsInShapes.map(dt => dt.id)]
      console.log(279, 'FacsimileComponent:indicateSelectedShapes(): hilighting with this array:\n', arr2)
      const existingOverlay = this.$refs.container.querySelector('.svgContainer.shapes')

      if (existingOverlay !== null) {
        // console.log('found an overlay')
        existingOverlay.querySelectorAll('.activeWritingZone .selectedShape').forEach(shape => {
          shape.classList.remove('selectedShape')
        })
        arr2.forEach(id => {
          const elem = existingOverlay.querySelector('.activeWritingZone path[id="' + id + '"]')
          if (elem) {
            // console.log('selected shape ' + id)
            elem.classList.add('selectedShape')
          } else {
            // console.log('unable to find element with id ' + id + '\n', this.$refs.container.querySelectorAll('path'))
          }
        })
        existingOverlay.querySelectorAll('.highlightDTChain').forEach(s => s.classList.remove('highlightDTChain'))
        this.$store.getters.activeDiploTransElementdIds.shapes.forEach(shape => {
          // console.log(shape)
          existingOverlay.querySelectorAll(`[*|id="${shape}"]`).forEach(s => s.classList.add('highlightDTChain'))
        })
      }
    },

    /**
     * creates a control point circle for bezier curves, barlines or else
     * @param element - the SVG element to which the control point circle should be added
     * @param controlpoints - array of control point coordinates, e.g. [x1, y1, x2, y2, x3, y3, x4, y4]
     * @param i - index of the control point in the controlpoints array
     * @param renderChange - function to render the change in the control point coordinates
     * @param persistChange - function to persist the change in the store
     * @param factor - factor for the control point coordinates, default 90 (9px per vu)
     * @param cls - css class for the control point circle, default 'curve-controlpoint'
     */
    createControlPoint (element, controlpoints, i, renderChange, persistChange, factor = 90, cls = 'curve-controlpoint') {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      // console.log(836, i, i + 1, controlpoints[i], controlpoints[i + 1])
      circle.setAttribute('cx', controlpoints[i])
      circle.setAttribute('cy', controlpoints[i + 1])
      circle.setAttribute('r', '52')
      circle.setAttribute('class', cls)
      element.append(circle)
      const tracker = new OpenSeadragon.MouseTracker({
        element: circle,
        dragHandler: (event) => {
          const windowCoords = new OpenSeadragon.Point(event.originalEvent.x, event.originalEvent.y)
          const viewportCoords = this.viewer.viewport.windowToViewportCoordinates(windowCoords)
          const newX = viewportCoords.x * factor
          const newY = viewportCoords.y * factor
          controlpoints[i] = newX
          controlpoints[i + 1] = newY
          circle.setAttribute('cx', newX)
          circle.setAttribute('cy', newY)
          renderChange(controlpoints)
        },
        dragEndHandler: (event) => {
          const windowCoords = new OpenSeadragon.Point(event.originalEvent.x, event.originalEvent.y)
          const viewportCoords = this.viewer.viewport.windowToViewportCoordinates(windowCoords)
          const newX = viewportCoords.x * factor
          const newY = viewportCoords.y * factor
          controlpoints[i] = newX
          controlpoints[i + 1] = newY
          // console.log(836, controlpoints, viewportCoords)
          circle.setAttribute('cx', newX)
          circle.setAttribute('cy', newY)
          renderChange(controlpoints)
          persistChange(controlpoints, i, newX, newY, factor)
        }
      })
      return tracker
    },

    /**
     * indicate currently selected DT element
     *
     * creates a control points for barlines, curves or else
     */
    indicateSelectedDTElement () {
      // console.log('indicateSelectedDTElement', this.$store.getters.activeDiploTransElementdIds)
      const dtid = this.$store.getters.activeDiploTransElementId
      const existingOverlay = this.$refs.container.querySelector('.diploTrans.activeDiploTrans')
      // console.log(9272, 'indicateSelectedDTElement', dtid, this.$store.getters.activeDiploTransElement)

      if (existingOverlay !== null) {
        // console.log('found an overlay')
        existingOverlay.querySelectorAll('.selectedDiploTrans').forEach(element => {
          console.log(9272, 'remove selectedDiploTrans from', element)
          element.classList.remove('selectedDiploTrans')
        })
        existingOverlay.querySelectorAll(`*[data-id="${dtid}"]`).forEach((element, i) => {
          console.log(9272, 'add selectedDiploTrans to', element)
          element.classList.add('selectedDiploTrans')
          // console.log(752, element, i)
          if (i === 0) {
            if (this.$store.getters.activeDiploTransElementName === 'barLine') { // control barLine
              const barline = this.$store.getters.activeDiploTransElement
              // TODO: rastrum getter for DT element
              const section = barline.closest('section')
              const diploStaffDef = section.parentElement.querySelector('staffDef[n="1"]')
              // TODO: make rastrum consistent with cleanUpDiplomaticTranscript
              const rastrumId = diploStaffDef.getAttribute('decls').split('#')[1]
              // console.log(753, 'barLine rastrum control', rastrumId)
              const rastrum = this.$store.getters.rastrumsOnCurrentPage.find(rastrum => rastrum.id === rastrumId)
              const factor = 90 // 9px per vu, factor 10 as general factor of Verovio
              const path = element.querySelector('path')
              const barpoints = [
                barline.getAttribute('x'),
                barline.getAttribute('y'),
                barline.getAttribute('x2'),
                barline.getAttribute('y2')
              ].map(p => parseFloat(p))
              // scaleXYControlpoints calculates list of x,y coordinates
              // from the barline x,y,x2,y2 attributes, using rastrum and factor
              const controlpoints = scaleXYControlpoints(barpoints, rastrum, factor)
              // console.log(752, 'barline controlpoints', controlpoints, rastrum, factor)
              for (const i of [0, 2]) {
                const tracker = this.createControlPoint(
                  element,
                  controlpoints,
                  i,
                  // render change
                  (controlpoints) => {
                    path.setAttribute('d', `M${controlpoints[0]} ${controlpoints[1]} L${controlpoints[2]} ${controlpoints[3]}`)
                  },
                  // persist change
                  async (controlpoints, i, newX, newY, factor) => {
                    barpoints[i] = (newX / factor) - rastrum.x
                    barpoints[i + 1] = (newY / factor) - rastrum.y
                    this.$store.dispatch('setActiveDiploTransElementAttValue', { id: 'x', value: barpoints[0].toFixed(2) })
                    this.$store.dispatch('setActiveDiploTransElementAttValue', { id: 'y', value: barpoints[1].toFixed(2) })
                    this.$store.dispatch('setActiveDiploTransElementAttValue', { id: 'x2', value: barpoints[2].toFixed(2) })
                    this.$store.dispatch('setActiveDiploTransElementAttValue', { id: 'y2', value: barpoints[3].toFixed(2) })
                    // update barline x,y,x2,y2 attributes in MEI
                    console.log(9272, 'barline updated', barpoints)
                  },
                  factor
                )
                this.setMouseTracker(i / 2, tracker)
              }
              console.log(9272, 'barLine', element, barline)
            } else if (this.$store.getters.activeDiploTransElementName === 'curve') { // conmtrol curve
              const curve = this.$store.getters.activeDiploTransElement
              const section = curve.closest('section')
              const diploStaffDef = section.parentElement.querySelector('staffDef[n="1"]')
              // TODO: make rastrum consistent with cleanUpDiplomaticTranscript
              const rastrumId = diploStaffDef.getAttribute('decls').split('#')[1]
              const rastrum = this.$store.getters.rastrumsOnCurrentPage.find(rastrum => rastrum.id === rastrumId)
              const factor = 90 // 9px per vu, factor 10 as general factor of Verovio
              const path = element.querySelector('path')
              const bezier = (curve.getAttribute('bezier') || '').split(' ').map(p => parseFloat(p))
              // scaleXYControlpoints calculates list of x,y coordinates
              const controlpoints = scaleXYControlpoints(bezier, rastrum, factor)
              const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line')
              line1.setAttribute('class', 'curve-line')
              line1.setAttribute('x1', controlpoints[0])
              line1.setAttribute('y1', controlpoints[1])
              line1.setAttribute('x2', controlpoints[2])
              line1.setAttribute('y2', controlpoints[3])
              line1.setAttribute('stroke-width', 23)
              element.append(line1)
              const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line')
              line2.setAttribute('class', 'curve-line')
              line2.setAttribute('x1', controlpoints[4])
              line2.setAttribute('y1', controlpoints[5])
              line2.setAttribute('x2', controlpoints[6])
              line2.setAttribute('y2', controlpoints[7])
              line2.setAttribute('stroke-width', 23)
              element.append(line2)
              for (const i of [0, 2, 4, 6]) {
                const tracker = this.createControlPoint(
                  element,
                  controlpoints,
                  i,
                  // render change
                  (controlpoints) => {
                    path.setAttribute('d', controlpointsToVerovioSvgBezier(controlpoints, 52))
                    line1.setAttribute('x2', controlpoints[2])
                    line1.setAttribute('y2', controlpoints[3])
                    line2.setAttribute('x1', controlpoints[4])
                    line2.setAttribute('y1', controlpoints[5])
                  },
                  // persist change
                  (controlpoints, i, newX, newY, factor) => {
                    bezier[i] = (newX / factor) - rastrum.x
                    bezier[i + 1] = (newY / factor) - rastrum.y
                    this.$store.dispatch('setActiveDiploTransElementAttValue', { id: 'bezier', value: bezier.map(c => c.toFixed(2)).join(' ') })
                    // console.log(836, 'curve bezier updated', bezier)
                  },
                  factor
                )
                this.setMouseTracker(i / 2, tracker)
              }
            } else if (this.$store.getters.activeDiploTransElementName === 'hairpin') { // control hairpin
              const hairpin = this.$store.getters.activeDiploTransElement
              const cres = hairpin.getAttribute('form') === 'cres'
              const opening = +hairpin.getAttribute('opening')
              const hairpoints = [
                +hairpin.getAttribute('x'),
                +hairpin.getAttribute('y'),
                +hairpin.getAttribute('x2'),
                +hairpin.getAttribute('y2')
              ]
              console.log(752, 'hairpin', element, cres, opening)
              const section = hairpin.closest('section')
              const diploStaffDef = section.parentElement.querySelector('staffDef[n="1"]')
              // TODO: make rastrum consistent with cleanUpDiplomaticTranscript
              const rastrumId = diploStaffDef.getAttribute('decls').split('#')[1]
              const rastrum = this.$store.getters.rastrumsOnCurrentPage.find(rastrum => rastrum.id === rastrumId)
              const factor = 90 // 9px per vu, factor 10 as general factor of Verovio
              const polyline = element.querySelector('polyline')
              const controlpoints = scaleXYControlpoints(hairpoints, rastrum, factor)
              const svgpoints = controlpoints => {
                const opener = opening * factor / 2
                return cres
                  ? `${controlpoints[2]},${controlpoints[3] - opener} ${controlpoints[0]},${controlpoints[1]} ${controlpoints[2]},${controlpoints[3] + opener}`
                  : `${controlpoints[0]},${controlpoints[1] - opener} ${controlpoints[2]},${controlpoints[3]} ${controlpoints[0]},${controlpoints[1] + opener}`
              }
              console.log(752, 'hairpin controlpoints', controlpoints, rastrum, factor, svgpoints(controlpoints))
              for (const i of [0, 2]) {
                const tracker = this.createControlPoint(
                  element,
                  controlpoints,
                  i,
                  // render change
                  (controlpoints) => {
                    polyline.setAttribute('points', svgpoints(controlpoints))
                  },
                  // persist change
                  (controlpoints, i, newX, newY, factor) => {
                    hairpoints[i] = (newX / factor) - rastrum.x
                    hairpoints[i + 1] = (newY / factor) - rastrum.y
                    const x1 = hairpoints[0]
                    const y1 = hairpoints[1]
                    const x2 = hairpoints[2]
                    const y2 = hairpoints[3]
                    this.$store.dispatch('setActiveDiploTransElementAttValue', { id: 'x', value: x1.toFixed(2) })
                    this.$store.dispatch('setActiveDiploTransElementAttValue', { id: 'y', value: y1.toFixed(2) })
                    this.$store.dispatch('setActiveDiploTransElementAttValue', { id: 'x2', value: x2.toFixed(2) })
                    this.$store.dispatch('setActiveDiploTransElementAttValue', { id: 'y2', value: y2.toFixed(2) })
                    // update barline x,y,x2,y2 attributes in MEI
                    // console.log(836, 'barline updated', barpoints)
                  },
                  factor
                )
                this.setMouseTracker(i / 2, tracker)
              }
            } else if (this.$store.getters.activeDiploTransElementName === 'del') { // conmtrol deletion
              const del = this.$store.getters.activeDiploTransElement
              const delpath = del.querySelector('path')
              // four edge points for deletion area [x1,y1,x2,y2,x3,y3,x4,y4]
              const delpoints = delpath.getAttribute('d').split(' ').filter(p => p.length > 1).map(p => p.substring(1).split(',').map(parseFloat)).flat()
              console.log(752, 'del', element, del, delpoints)
              const rects = this.$store.getters.osdRects
              const factor = 90 // 9px per vu, factor 10 as general factor of Verovio
              // scaleXYControlpoints calculates list of x,y coordinates
              // from the deletion x1,y1,x2,y2,x3,y3,x4,y4 attributes scaled to image coordinates
              const controlpoints = scaleXYControlpoints(delpoints, { x: 0, y: 0 }, factor)
              console.log(752, 'del controlpoints', controlpoints, rects, factor)
              // create path d-attribute string for background deletion area
              const svgpoints = controlpoints => {
                const points = []
                for (const i of [0, 2, 4, 6]) {
                  const x = controlpoints[i]
                  const y = controlpoints[i + 1]
                  const c = i === 0 ? 'M' : 'L'
                  points.push(`${c}${x.toFixed(1)},${y.toFixed(1)}`)
                }
                return points.join(' ') + ' Z'
              }
              const path = element.querySelector('path')
              for (const i of [0, 2, 4, 6]) {
                // create control handle for each of the four deletion points
                const tracker = this.createControlPoint(
                  element,
                  controlpoints,
                  i,
                  // render change
                  (controlpoints) => {
                    // console.log(752, svgpoints(controlpoints))
                    path.setAttribute('d', svgpoints(controlpoints))
                    // two deletion lines crossed:
                    const dellines = element.querySelectorAll('.deletionLine')
                    if (dellines.length === 2) {
                      dellines[0].setAttribute('d', `M${controlpoints[0]},${controlpoints[1]} L${controlpoints[4]},${controlpoints[5]}`)
                      dellines[1].setAttribute('d', `M${controlpoints[2]},${controlpoints[3]} L${controlpoints[6]},${controlpoints[7]}`)
                    }
                  },
                  // persist change
                  (controlpoints, i, newX, newY, factor) => {
                    controlpoints[i] = newX
                    controlpoints[i + 1] = newY
                    delpoints[i] = controlpoints[i] / factor
                    delpoints[i + 1] = controlpoints[i + 1] / factor
                    const delpath = del.querySelector('path')
                    delpath.setAttribute('d', svgpoints(delpoints))
                    const delpathid = del.getAttribute('data-id')
                    this.$store.dispatch('modifyXml', {
                      filePath: this.$store.getters.currentWritingZoneObject.diploTrans,
                      id: delpathid,
                      val: (new XMLSerializer()).serializeToString(delpath)
                    })
                  },
                  factor
                )
                this.setMouseTracker(i / 2, tracker)
              }
            } else if (this.$store.getters.activeDiploTransElementName === 'line') { // control beam
              const line = this.$store.getters.activeDiploTransElement
              const section = line.closest('section')
              const diploStaffDef = section.parentElement.querySelector('staffDef[n="1"]')
              // TODO: make rastrum consistent with cleanUpDiplomaticTranscript
              const rastrumId = diploStaffDef.getAttribute('decls').split('#')[1]
              const rastrum = this.$store.getters.rastrumsOnCurrentPage.find(rastrum => rastrum.id === rastrumId)
              const factor = 90 // 9px per vu, factor 10 as general factor of Verovio
              const beamLineWidth = 90
              const linepoints = [
                +line.getAttribute('x'),
                +line.getAttribute('y'),
                +line.getAttribute('x2'),
                +line.getAttribute('y2')
              ]
              const func = line.getAttribute('func')
              if (func === 'beam') {
                const path = element.querySelector('polygon')
                const controlpoints = scaleXYControlpoints(linepoints, rastrum, factor)
                for (const i of [0, 2]) {
                  const tracker = this.createControlPoint(
                    element,
                    controlpoints,
                    i,
                    // render change
                    (controlpoints) => {
                      path.setAttribute('points', `${controlpoints[0]},${controlpoints[1] - beamLineWidth} ${controlpoints[2]},${controlpoints[3] - beamLineWidth} ${controlpoints[2]},${controlpoints[3]} ${controlpoints[0]},${controlpoints[1]}`)
                    },
                    // persist change
                    async (controlpoints, i, newX, newY, factor) => {
                      linepoints[i] = (newX / factor) - rastrum.x
                      linepoints[i + 1] = (newY / factor) - rastrum.y
                      this.$store.dispatch('setActiveDiploTransElementAttValue', { id: 'x', value: linepoints[0].toFixed(2) })
                      this.$store.dispatch('setActiveDiploTransElementAttValue', { id: 'y', value: linepoints[1].toFixed(2) })
                      this.$store.dispatch('setActiveDiploTransElementAttValue', { id: 'x2', value: linepoints[2].toFixed(2) })
                      this.$store.dispatch('setActiveDiploTransElementAttValue', { id: 'y2', value: linepoints[3].toFixed(2) })
                      // update barline x,y,x2,y2 attributes in MEI
                      console.log(9272, 'barline updated', linepoints)
                    },
                    factor
                  )
                  this.setMouseTracker(i / 2, tracker)
                }
                console.log(9272, 'line', element, linepoints, func)
              } else {
                console.log(9272, 'control line func ' + func + ' not implemented')
              }
            }
          }
        })
      }
    },

    setMouseTracker (i, mouseTracker) {
      if (i < 0 || i > this.mouseTracker.length) {
        return
      }
      if (typeof this.mouseTracker[i]?.destroy === 'function') {
        // console.log(836, 'remove MouseTracker', i, this.mouseTracker[i].element)
        this.mouseTracker[i].element.closest('g').querySelectorAll('.curve-line').forEach(elem => elem.remove())
        this.mouseTracker[i].element.remove()
        this.mouseTracker[i].destroy()
      }
      // console.log(836, 'set MouseTracker', i, mouseTracker)
      this.mouseTracker[i] = mouseTracker
    },

    /**
     * renders system overlays
     * @return {[type]} [description]
     */
    renderSystems () {
      if (!this.showSystems) {
        return null
      }
      const systems = this.$store.getters.rastrumsOnCurrentPage
      const activeSystemId = this.$store.getters.activeSystemId

      const renderedSystems = this.$refs.container.querySelectorAll('.system.overlay')
      const renderedIDs = []

      renderedSystems.forEach(rs => {
        renderedIDs.push(rs.getAttribute('data-id'))
        const hit = systems.find(s => s.id === rs.getAttribute('data-id'))
        if (!hit) {
          const rotatedSystem = rs.querySelector('.rotatedSystem')
          rotatedSystem.removeEventListener('click', this.systemClickListener)
          this.viewer.removeOverlay(rs)
        } else {
          const overlay = this.viewer.getOverlayById(rs)
          const rotatedSystem = rs.querySelector('.rotatedSystem')
          rotatedSystem.style.transform = 'rotate(' + hit.rotate + 'deg)'

          if (hit.id === activeSystemId) {
            rs.classList.add('active')
          } else {
            rs.classList.remove('active')
          }

          const location = new OpenSeadragon.Rect(hit.x, hit.y, hit.w, hit.h)
          overlay.update(location, OpenSeadragon.Placement.TOP_LEFT)
        }
      })

      systems.forEach(s => {
        if (renderedIDs.indexOf(s.id) === -1) {
          const element = document.createElement('div')
          element.classList.add('system')
          element.classList.add('overlay')
          if (s.id === activeSystemId) {
            element.classList.add('active')
          }
          element.setAttribute('data-id', s.id)

          const rotatedSystem = document.createElement('div')
          rotatedSystem.classList.add('rotatedSystem')
          rotatedSystem.style.transform = 'rotate(' + s.rotate + 'deg)'
          element.append(rotatedSystem)

          const location = new OpenSeadragon.Rect(s.x, s.y, s.w, s.h)

          this.viewer.addOverlay({
            element,
            location,
            placement: OpenSeadragon.Placement.TOP_LEFT,
            rotationMode: OpenSeadragon.OverlayRotationMode.EXACT
          })
        }
      })
    },

    /**
     * rotate the page facsimile
     */
    setPageRotation () {
      const tiledImage = this.viewer.world.getItemAt(0)
      const tileSource = this.$store.getters.osdTileSourceForCurrentPage

      if (!tiledImage || !tileSource) {
        return null
      }

      // console.log('tileSource', tileSource)
      tiledImage.setRotation(tileSource.degrees, false)
      const newPos = new OpenSeadragon.Point(tileSource.x, tileSource.y)

      tiledImage.setRotation(tileSource.degrees)
      tiledImage.setPosition(newPos)
      // tiledImage.fitBounds(rect)
      // console.log('setPos to ', newPos)
      /* const rotation = parseFloat(this.$store.getters.currentPageRotation)

      if (!rotation) {
        return null
      }

      const pageDimensions = this.$store.getters.currentPageDimensions

      if (!pageDimensions) {
        return null
      }

      console.log('pageDim', pageDimensions)
      const center = new OpenSeadragon.Point(parseFloat(pageDimensions.mmWidth) / 2, parseFloat(pageDimensions.mmHeight) / 2)

      const page = getMediaFragmentInnerBoxRect(OpenSeadragon, this.$store.getters)
      console.log('page', page) */
      // this.viewer.viewport.setRotationWithPivot(rotation, page.location.getCenter())
    },

    renderPageBorders () {
      // temporary condition
      /* if (this.viewer) {
        return null
      } */

      const tiledImage = this.viewer.world.getItemAt(0)

      if (!tiledImage) {
        // console.log('no tiledImage, so no renderPageBorders')
        return null
      }

      const pageDimensions = this.$store.getters.currentPageDimensions

      if (!pageDimensions) {
        return null
      }

      const pageIndex = this.$store.getters.currentPageZeroBased
      const path = this.$store.getters.filepath
      const pages = this.$store.getters.documentPagesForSidebars(path)
      const page = pages[pageIndex]

      if (!page) {
        return null
      }

      const rects = getOsdRects(page)

      if (!rects) {
        // console.log('rectangles unavailable', outerPos, centerPos, innerPos)
        return null
      }
      // console.log('relevant rects: ', rects)
      const invertedRot = rects.rotation * -1

      if (!this.type || this.type !== 'diploTrans') {
        // the media fragment as stored in the data
        const existingImage = this.$refs.container.querySelector('.overlay.imageBorder')
        const imageLocation = new OpenSeadragon.Rect(rects.image.x, rects.image.y, rects.image.w, rects.image.h)

        if (!existingImage) {
          const element = document.createElement('div')
          element.classList.add('overlay')
          element.classList.add('imageBorder')

          const innerRot = document.createElement('div')
          innerRot.classList.add('rotatedBox')
          innerRot.classList.add('overlay')
          innerRot.style.transform = 'rotate(' + invertedRot + 'deg)'
          element.append(innerRot)

          this.viewer.addOverlay({
            element,
            location: imageLocation // ,
            // rotationMode: centerPos.rotationMode
          })
        } else {
          this.viewer.updateOverlay(existingImage, imageLocation)
          existingImage.querySelector('.rotatedBox').style.transform = 'rotate(' + invertedRot + 'deg)'
        }

        // the media fragment as stored in the data
        const existingMediaFrag = this.$refs.container.querySelector('.overlay.pageBorder.mediaFragment')
        const mediaFragLocation = new OpenSeadragon.Rect(rects.mediaFrag.x, rects.mediaFrag.y, rects.mediaFrag.w, rects.mediaFrag.h)

        if (!existingMediaFrag) {
          const element = document.createElement('div')
          element.classList.add('overlay')
          element.classList.add('pageBorder')
          element.classList.add('mediaFragment')

          const innerRot = document.createElement('div')
          innerRot.classList.add('rotatedBox')
          innerRot.classList.add('overlay')
          innerRot.style.transform = 'rotate(' + invertedRot + 'deg)'
          element.append(innerRot)

          this.viewer.addOverlay({
            element,
            location: mediaFragLocation // ,
            // rotationMode: centerPos.rotationMode
          })
        } else {
          this.viewer.updateOverlay(existingMediaFrag, mediaFragLocation)
          existingMediaFrag.querySelector('.rotatedBox').style.transform = 'rotate(' + invertedRot + 'deg)'
        }
      }

      // get innermost rectangle
      const existingPageOverlay = this.$refs.container.querySelector('.overlay.pageBorder.actualPage')
      const pageLocation = new OpenSeadragon.Rect(rects.page.x, rects.page.y, rects.page.w, rects.page.h)

      if (!existingPageOverlay) {
        const element = document.createElement('div')
        element.classList.add('overlay')
        if (this.type && this.type === 'diploTrans') {
          element.classList.add('pageBackground')
        } else {
          element.classList.add('pageBorder')
        }
        element.classList.add('actualPage')

        this.viewer.addOverlay({
          element,
          location: pageLocation //,
          // rotationMode: innerPos.rotationMode
        })
      } else {
        this.viewer.updateOverlay(existingPageOverlay, pageLocation)
      }
    },

    /**
     * renders the background of the page (empty stafflines etc.)
     * @return {[type]} [description]
     */
    async renderPageBackground () {
      const bg = await this.$store.getters.emptyPageWithRastrums

      if (!bg) {
        return null
      }

      const pageIndex = this.$store.getters.currentPageZeroBased
      const path = this.$store.getters.filepath
      const pages = this.$store.getters.documentPagesForSidebars(path)
      const page = pages[pageIndex]

      if (!page) {
        return null
      }

      const rects = getOsdRects(page)

      const existingPageOverlay = this.$refs.container.querySelector('.overlay.emptyStaves')
      const pageLocation = new OpenSeadragon.Rect(rects.page.x, rects.page.y, rects.page.w, rects.page.h)

      if (!existingPageOverlay) {
        const element = document.createElement('div')
        element.classList.add('overlay')
        element.classList.add('emptyStaves')
        element.append(bg)

        this.viewer.addOverlay({
          element,
          location: pageLocation //,
          // rotationMode: innerPos.rotationMode
        })
      } else {
        this.viewer.updateOverlay(existingPageOverlay, pageLocation)
      }
    },

    /**
     * renders all diplomatic transcriptions on current page
     */
    async renderDiploTransOnPage () {
      // console.log(643, 'renderDiploTransOnPage()')
      if (!this.showRenderedStafflines) {
        return null
      }

      const pageIndex = this.$store.getters.currentPageZeroBased
      const path = this.$store.getters.filepath
      const pages = this.$store.getters.documentPagesForSidebars(path)
      const page = pages[pageIndex]

      if (!page) {
        return null
      }

      const rects = getOsdRects(page)
      const pageLocation = new OpenSeadragon.Rect(rects.page.x, rects.page.y, rects.page.w, rects.page.h)

      const dtArr = await this.$store.getters.diplomaticTranscriptsOnCurrentPage

      if (dtArr.length === 0) {
        // console.log('no diploTrans to render yet')
        return null
      }

      const existingOverlays = this.$refs.container.querySelectorAll('.overlay.diploTrans')

      existingOverlays.forEach(overlay => {
        const needsRendering = dtArr.findIndex(dt => dt.wzDetails.diploTrans === overlay.getAttribute('data-diploTrans')) !== -1

        if (!needsRendering) {
          // console.log('removing overlay for ' + overlay.getAttribute('data-diploTrans'))
          this.viewer.removeOverlay(overlay)
        }
      })

      dtArr.forEach(async obj => {
        console.log('913 entering ', obj)

        if (obj.dt) {
          const draftId = obj.dt.querySelector('draft').getAttribute('xml:id')
          // console.log('913: draftId', draftId)
          const renderedDiplo = await this.renderDiploTrans(obj.dt, draftId)
          // console.log('913: diplo', renderedDiplo)

          const existingOverlay = [...existingOverlays].find(overlay => overlay.getAttribute('data-diploTrans') === obj.wzDetails.diploTrans)
          const activeWritingZone = this.$store.getters.activeWritingZone
          // const svgForCurrentPage = this.$store.getters.svgForCurrentPage

          if (!existingOverlay) {
            // console.log('adding overlay for ' + dt.wzDetails.diploTrans)
            const element = document.createElement('div')
            element.classList.add('overlay')
            element.classList.add('diploTrans')
            if (obj.wzDetails.id === activeWritingZone) {
              element.classList.add('activeDiploTrans')
            }
            element.setAttribute('data-diploTrans', obj.wzDetails.id)
            element.setAttribute('data-filePath', obj.wzDetails.diploTrans)
            element.append(renderedDiplo)

            /* cleanUpDiplomaticTranscript(, obj.dt, {
              rastrumsOnCurrentPage,
              selectedElementId: this.$store.getters.activeDiploTransElementId,
              viewer: this.viewer
            }, svgForCurrentPage)) */

            /* const x = viewBox.split(' ')[0]
            const y = viewBox.split(' ')[1]
            const w = parseFloat(viewBox.split(' ')[2]) - parseFloat(x)
            const h = parseFloat(viewBox.split(' ')[3]) - parseFloat(y) */
            const location = pageLocation // new OpenSeadragon.Rect(x, y, w, h)

            this.viewer.addOverlay({
              element,
              location//,
              // rotationMode: innerPos.rotationMode
            })
          } else {
            // console.log('There already is an overlay for ' + dt.wzDetails.diploTrans)
            // TODO: renderedDiplo is newly created, so we need to cleanUp again???
            existingOverlay.replaceChild(renderedDiplo) /* cleanUpDiplomaticTranscript(renderedDiplo, obj.dt, {
              rastrumsOnCurrentPage,
              selectedCurve: this.$store.getters.activeDiploTransElementId,
              viewer: this.viewer
            }, svgForCurrentPage), existingOverlay.firstChild) */
            /* const x = viewBox.split(' ')[0]
            const y = viewBox.split(' ')[1]
            const w = parseFloat(viewBox.split(' ')[2]) - parseFloat(x)
            const h = parseFloat(viewBox.split(' ')[3]) - parseFloat(y) */
            const location = pageLocation // new OpenSeadragon.Rect(x, y, w, h)
            if (obj.wzDetails.id === activeWritingZone) {
              existingOverlay.classList.add('activeDiploTrans')
            }
            this.viewer.updateOverlay(existingOverlay, location)
          }
        }
      })
      this.indicateSelectedDTElement()
    },

    async renderDiploTrans (meiDom, draftId) {
      // Use Thulemeier to render diplomatic transcription
      try {
        // Use 'fullPage' mode for diplomatic rendering, as in test.js
        const svgElem = await render(meiDom, { mode: 'singleDraft', id: draftId })
        // console.log(9272, 'renderDiploTrans', svgElem)

        return svgElem
      } catch (err) {
        console.error('Thulemeier rendering failed:', err)
        return null
      }
    },

    /**
     * focusses the currently active writing zone
     * @return {[type]} [description]
     */
    focusActiveWritingZone () {
      // const currentZone = this.$store.getters.currentWritingZoneObject
      // const xywh = currentZone.xywh.split(',')

      // const image = this.viewer.world.getItemAt(0)
      // const pos = image.imageToViewportRectangle(parseInt(xywh[0]), parseInt(xywh[1]), parseInt(xywh[2]), parseInt(xywh[3]))

      // console.log('FacsimileComponent.vue: skipping focusActiveWritingZone()', pos)
      // this.viewer.viewport.fitBoundsWithConstraints(pos)

      const oldActive = this.$refs.container.querySelector('.activeDiploTrans')

      if (oldActive !== null) {
        oldActive.classList.remove('activeDiploTrans')
      }
      const activeWritingZone = this.$store.getters.activeWritingZone

      const newActiveZone = this.$refs.container.querySelector('[data-diploTrans="' + activeWritingZone + '"]')
      if (newActiveZone !== null) {
        newActiveZone.classList.add('activeDiploTrans')
      }
    },

    unload () {
      document.querySelectorAll('.overlay, .grid').forEach(overlay => {
        this.viewer.removeOverlay(overlay)
      })
    }
  },
  created () {
    // console.log('FacsimileComponent:created()')
    this.$watch(
      () => this.$route.query,
      (to, previous) => {
        // console.log('FacsimileComponent watch($query): ' + previous.page + ' -> ' + to.page)
        // react to route changes...
      },
      () => this.$route.params,
      (to, previous) => {
        // console.log('FacsimileComponent watch($params): ' + previous.source + ' -> ' + to.source)
        // react to route changes...
      }
    )
  },
  mounted () {
    // console.log('FacsimileComponent:mounted()')
    osdOptions.element = this.$refs.container
    this.viewer = OpenSeadragon(osdOptions)
    this.viewer.addHandler('open', (data) => {
      this.facsimileOpened(data)
    })
    this.viewer.addHandler('canvas-click', (data) => {
      this.facsimileClickListener(data)
    })

    this.viewer.addHandler('viewport-change', (data) => {
      if (this.explorerTab === 'diplo') {
        const viewer = data.eventSource
        const bounds = viewer.viewport.getBounds(false)

        const originOsd = this.type
        this.$store.dispatch('setDiploTransOsdBounds', { originOsd, bounds })
      }
    })

    /* this.unwatchPageBorders = this.$store.watch(
      (state, getters) => [getters.currentPageFragIdRect, getters.pageBorderPointsLength],
      ([newRect, newPoints], [oldRect, oldPoints]) => {
        this.renderPageBorders()
      }) */

    this.unwatchPageRotation = this.$store.watch(
      (state, getters) => getters.currentPageRotation,
      (newRot, oldRot) => {
        // this is done by updateFacsimile, as tileSources.degrees triggers that as well
        // this.setPageRotation()
      })

    this.unwatchPageDimensions = this.$store.watch(
      (state, getters) => [getters.currentPageWidthMm, getters.currentPageHeightMm],
      ([newW, newH], [oldW, oldH]) => {
        this.renderPageBorders()
      })
    this.unwatchTileSource = this.$store.watch(
      (state, getters) => getters.osdTileSourceForCurrentPage,
      (newTs, oldTs) => {
        const newTsUri = newTs && newTs.tileSource ? newTs.tileSource.split('#')[0] : null
        const oldTsUri = oldTs && oldTs.tileSource ? oldTs.tileSource.split('#')[0] : null
        if (newTsUri !== null && newTsUri !== oldTsUri) {
          this.openFacsimile()
        }
        this.updateFacsimile(newTs, oldTs)
      })
    this.unwatchSystems = this.$store.watch((state, getters) => [getters.rastrumsOnCurrentPage, getters.activeSystemId],
      ([newArr, newId], [oldArr, oldId]) => {
        this.renderSystems()
      })
    if (this.explorerTab === 'diplo') {
      this.unwatchDiploTransOsdBounds = this.$store.watch(
        (state, getters) => getters.diploTransOsdBounds,
        (newObj, oldObj) => {
          if (newObj.originOsd !== this.type) {
            const viewer = this.viewer
            const bounds = newObj.bounds
            viewer.viewport.fitBoundsWithConstraints(bounds, true)
          }
        })
    }

    this.unwatchSVG = this.$store.watch((state, getters) => [getters.activeWritingZone, getters.svgForCurrentPage, getters.activeWritingLayer],
      ([newId, newSvg, newLayer], [oldId, oldSvg, oldLayer]) => {
        // console.log(9272, 'watch SVG: ', newId, newSvg, newLayer, ' / ', oldId, oldSvg, oldLayer)
        if (newSvg) {
          this.renderShapes()
        }
        if (newId && newId !== oldId) {
          this.focusActiveWritingZone()
        }
      })

    this.unwatchGrid = this.$store.watch((state, getters) => getters.pageShowGrid,
      (newVal, oldVal) => {
        this.renderGrid()
      })

    this.unwatchDiploTranscriptsOnCurrentPage = this.$store.watch((state, getters) => getters.renderableDiplomaticTranscriptsOnCurrentPage,
      (newArr, oldArr) => {
        // console.log(9272, 'watch diploTranscripts: ', newArr, ' / ', oldArr)
        this.renderDiploTransOnPage()
      })

    this.unwatchUsedShapes = this.$store.watch((state, getters) => getters.activeDiploTransUsedShapes,
      (newArr, oldArr) => {
        // console.log(9272, 'watch usedShapes: ', newArr, ' / ', oldArr)
        this.indicateUsedShapes()
        this.indicateSelectedDTElement()
      })

    this.unwatchSelectedId = this.$store.watch((state, getters) => getters.diploTransActivationsInShapes,
      (newValue, oldValue) => {
        // console.log(9272, 'watch selectedId: ', newValue, ' / ', oldValue)
        this.indicateSelectedShapes()
        this.indicateSelectedDTElement()
      })

    this.unwatchSelectedDTElement = this.$store.watch((state, getters) => getters.activeDiploTransElementId,
      (newValue, oldValue) => {
        // console.log(9272, 'watch selectedDTElement: ', newValue, ' / ', oldValue)
        for (const i in this.mouseTracker) {
          this.setMouseTracker(i, null)
        }
        this.indicateSelectedShapes()
        this.indicateSelectedDTElement()
      })

    this.openFacsimile()
  },
  updated () {
    // console.log('FacsimileComponent:updated()')
    this.openFacsimile()
  },
  beforeUnmount () {
    // console.log('FacsimileComponent:beforeUnmount()')
    try {
      this.unload()
      // this.unwatchPageBorders()
      this.unwatchPageRotation()
      this.unwatchPageDimensions()
      this.unwatchTileSource()
      this.unwatchSVG()
      this.unwatchSystems()
      this.unwatchGrid()
      // TODO watch/unwatch on diplo tab ...
      if (this.explorerTab === 'diplo') {
        this.unwatchDiploTransOsdBounds()
        if (typeof unwatchDiploTranscriptsOnCurrentPage === 'function') {
          this.unwatchDiploTranscriptsOnCurrentPage()
        } else {
          // TODO
          console.warn('FacsimileComponent:beforeUnmount(): unwatchDiploTranscriptsOnCurrentPage is not a function')
        }
      }
      this.unwatchUsedShapes()
      this.unwatchSelectedId()
      this.unwatchSelectedDTElement()
    } catch (err) {
      console.warn('FacsimileComponent:beforeUnmount(): ' + err, err)
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
@import '@/css/_variables.scss';

.facsimileContainer {
  width: 100%;
  height: 100%;
  position: relative;

  &.diploTrans {
    background: #ffffff;
  }

  svg {
    width: 100%;
    height: 100%;
    z-index: 5;
  }

  .system.overlay {
    z-index: 10;

    .rotatedSystem {
      background-color: #ffffff66;
      transform-origin: top left;
      width: 100%;
      height: 100%;
    }
    &.active .rotatedSystem {
      background-color: #85b6ffcc;
    }
  }

  .bounding-box rect {
    display: none;
  }

  g.sketchArea {
    path {
      fill: rgb(67, 158, 3);
      stroke: rgb(67, 158, 3);
      opacity: .3;
    }
    &.activeGroup path {
      fill: rgb(156, 217, 43);
      stroke: rgb(156, 217, 43);
      opacity: .5;
    }
    &:hover path {
      opacity: .6;
    }
  }

  &.sketchGroups {
    .shapeOverlay {
      z-index: 10;
    }
  }

  &.transcript {
    .shapeOverlay {
      z-index: 10;

      path {
         opacity: .2;
         &:hover {
            opacity: .8;
         }

         &.activeElem {
            stroke: $activeHighlightColor;
            fill: $activeHighlightColor;
            opacity: .6;
         }
      }
    }
    .verovio.overlay {
      z-index: 5;
      opacity: .5;

      svg {
        width: 100%;
        height: 100%;
      }
    }
  }

  &.demo {
    .writingZone.overlay {
      background-color: rgba(100, 66, 119, 0.61);
      z-index: 1;

      &:hover {
        background-color: rgba(16, 158, 228, 0.21);
        outline: 5px solid rgba(11, 108, 156, 0.8);
      }
    }
  }

  &.systems {
     .system.overlay {
       z-index: 5;
       background-color: rgba(57, 6, 238, 0.2);
     }

     .shapeOverlay {
        z-index: -1;
     }
  }

  .verovio.overlay {
    z-index: -1;
  }

  &.rendering .verovio.overlay {
    z-index: 0;
    background-color: rgba(255,255,255,.3);

    svg {
      width: 100%;
      height: 100%;
    }
  }

  .fullSizeOverlay {
    svg {
      width: 100%;
      height: 100%;

   }
  }

  .unassigned path {
    fill: $svgUnassignedShapeColor;
    stroke: $svgUnassignedShapeColor;
    fill-rule: evenodd;
    &:hover {
      stroke-width: 10px;
      stroke: lighten($svgUnassignedShapeColor, 15%);
    }
  }

  .writingZone path {
    fill: #666666;
    stroke: #666666;
    fill-rule: evenodd;
    &:hover {
      stroke-width: 10px;
      stroke: azure;
    }
  }

  .activeWritingZone {
    path {
      fill: $svgActiveWritingZoneColor;
      stroke: $svgActiveWritingZoneColor;
    }
    .activeWritingLayer path {
      opacity: 1;
      fill: $svgActiveWritingLayerColor;
      stroke: $svgActiveWritingLayerColor;

      &.usedShape {
        fill: $svgUsedShapeColor;
        stroke: $svgUsedShapeColor;
      }
      &.selectedShape {
        filter: drop-shadow(0px 0px 5px $svgSelectedShapeColor);
        stroke: $svgSelectedShapeColor;
        stroke-width: 3px;
      }
    }

    .usedShape {
      fill: $svgUsedShapeColor;
      stroke: $svgUsedShapeColor;
    }
    .selectedShape {
      filter: drop-shadow(0px 0px 5px $svgSelectedShapeColor);
      stroke: $svgSelectedShapeColor;
      stroke-width: 3px;
    }
  }

  .overlay.diploTrans {
    fill: #666666;
    stroke: #666666;
    fill-rule: evenodd;

    &.activeDiploTrans {
      z-index: 10;
      fill: #000000;
      stroke: #000000;
      .selectedDiploTrans {
        fill: #961010;
        stroke: #961010;
        color: #961010; // for stroke: currentColor
        .curve-controlpoint {
          cursor: pointer;
        }
      }
    }

    .beamSpan polygon {
      transform: translate(40px, -40px);
    }
  }
}

.hideUnassigned .unassigned path {
  opacity: 0;
}

.hideInactive {
  .writingZone {
    &:not(.activeWritingZone) path {
      opacity: 0;
    }
  }
}

.hideActive .activeWritingZone path {
  opacity: 0;
}

.pageBorderPoint {
  background-color: transparent;
  border: 5px solid red;
  border-radius: 10px;

  &.point0 {
    border-color: red;
  }

  &.point1 {
    border-color: blue;
  }

  &.point2 {
    border-color: green;
  }
}

.unrotatedFrame {
   outline: 1px solid red;
   background-color: #ff000033;
   position: relative;
}

.fragmentIdentifier.overlay {
  background-color: #ff000066;
}

.overlay.point {
   background-color: blue;

   &.ul, &.lr {
     cursor: nwse-resize;
   }

   &.ur, &.ll {
     cursor: nesw-resize;
   }

   &.rotate {
     cursor: crosshair;
   }
}

.rotated.overlay {
   transform-origin: center;
   position: relative;
}

.overlay.imageBorder {
  // outline: 1px solid #ff00ff;

  .rotatedBox.overlay {
     transform-origin: top left;
     position: relative;
     outline: 1px solid #ff00ff;
     // background-color: #ff00ff22;
     width: 100%;
     height: 100%;
  }
}

.overlay.pageBorder.mediaFragment {
  // outline: 1px solid #00ffff;

  .rotatedBox.overlay {
     transform-origin: top left;
     position: relative;
     outline: 1px solid #00ffff;
     // background-color: #00ffff22;
     width: 100%;
     height: 100%;
  }
}

.overlay.pageBorder.actualPage {
  outline: 5px solid #0000ff99;
  // background-color: #0000ff22;
}

.overlay.pageBackground.actualPage {
  background-color: #ffffff99;
  outline: 1px solid #0000ff;
}

.overlay.diploTrans {
  &.activeDiploTrans {
    // outline: 5px solid $svgActiveWritingLayerColor;
    stroke: $svgActiveWritingLayerColor;
  }
  g.staff > path {
    fill: $svgActiveWritingZoneColor; //transparent;
    stroke: $svgActiveWritingZoneColor; //transparent;
    display: none;
  }
}

.grid {
  background-color: #00000033;
  opacity: 0.4;
  &.v10, &.v5, &.h10, &.h5 {
    background-color: #ff000066;
  }

  &.v100, &.h100 {
    background-color: #cc000099;
  }

  &.v10, &.h10, &.v100, &.h100 {
    z-index: 1;
    &:hover {
      border: 1px solid #99999999;
      opacity: 1;
    }
  }
}

svg .deletionBack {
  fill: #000000;
  opacity: 0.2;
}
svg .deletionLine {
  stroke: #000000 !important;
  opacity: 0.7;
}
</style>
