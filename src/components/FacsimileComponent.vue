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
import { /* getMediaFragmentBBoxRect, getMediaFragmentRect, */ /* getMediaFragmentInnerBoxRect, */ getOsdRects } from '@/tools/facsimileHelpers.js'
import { getEmptyPage, selectables } from '@/tools/mei.js'
// import { useDiploTrans } from '@/store/gui/diplotrans'
import { cleanUpDiplomaticTranscript, bezierAttributeToControlpoints } from '@/tools/diplomaticTranscripts.js'

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

/*
const rawSelectables = [
  'note',
  'chord',
  'syl',
  'rest',
  'beam',
  'beamSpan',
  'artic',
  'accid',
  'clef',
  'slur',
  'tie',
  'dynam',
  'dir',
  'keyAccid',
  'meterSig',
  'barLine'
  // 'staff',
  // 'measure'
]
let selectables = []
rawSelectables.forEach(elem => {
  selectables.push('.' + elem + ':not(.bounding-box)')
})
selectables = selectables.join(', ')
*/

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
            this.$store.dispatch('diploTransToggle', { type: 'shape', id: click.target.id, wzgroup: svgGroupWzId })
          }
          const func = (type) => () => {
            console.log('make "' + click.target.id + '" a ' + type + ' (wz: ' + svgGroupWzId + ')')
          }

          const usedShape = click.target.classList.contains('usedShape')
          console.log('WRITING ZONE:', genDescWzId)

          const addShapeEntry = {
            label: 'Add shape to current DiploTrans element',
            action: () => {
              console.log('add shape to current DiploTrans element ...')
              // TODO: ask for function (stem/head/etc)
              const baseMessage = 'add shape to DT at '
              const filePath = this.$store.getters.currentWritingZoneObject?.diploTrans
              const id = this.$store.getters.activeDiploTransElementId
              const svgPath = '../svg/' + this.$store.getters.currentSvgPath.split('/').splice(-1)[0]
              const origdoc = this.$store.getters.documentByPath(filePath)
              const doc = origdoc?.cloneNode(true)
              const snippet = doc?.querySelector(`*[*|id="${id}"]`)
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
                  param: 0,
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

          const adjustFunctionEntry = {
            label: 'Adjust function of shape in DiploTrans',
            action: () => {
              console.log('TODO: adjust function of shape in DiploTrans')
            },
            // TODO: only possible for some element types, like notes, but not slurs
            disabled: this.$store.getters.diploTransSelectedId === null && !usedShape
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
                    { label: 'Deletion', action: func('deletion'), disabled: !wzActive },
                    { label: 'Pitch Clarification Letter', action: func('clarification letter'), disabled: !wzActive },
                    { label: 'Navigational Sign', action: func('nav sign'), disabled: !wzActive }
                  ]
                },
                addShapeEntry,
                activateDTEntry,
                adjustFunctionEntry
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

      if (click.target.closest('.diploTrans') && click.target.closest('.measure')) {
        const wzId = click.target.closest('.diploTrans').getAttribute('data-diploTrans')
        const target = click.target.closest(selectables)
        console.log(365, target, selectables)
        if (target) {
          let id = target.getAttribute('data-id')
          this.$store.dispatch('setActiveWritingZone', wzId)
          // select chords to show up in XML editor instead of single notes
          if (target.matches('.note') && target.closest('.chord')) {
            id = target.closest('.chord').getAttribute('data-id')
          }
          this.$store.dispatch('setActiveDiploTransElementId', id)
          console.log('selecting activeDiploTransElementId: ', id)
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
      // console.log('FacsimileComponent:indicateUsedShapes(): starting with this array:\n', arr)
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
      // console.log('FacsimileComponent:indicateSelectedShapes(): hilighting with this array:\n', arr2)
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
     * indicate currently selected DT element
     */
    indicateSelectedDTElement () {
      // console.log('indicateSelectedDTElement', this.$store.getters.activeDiploTransElementdIds)
      const dtid = this.$store.getters.activeDiploTransElementId
      const existingOverlay = this.$refs.container.querySelector('.diploTrans.activeDiploTrans')

      if (existingOverlay !== null) {
        // console.log('found an overlay')
        existingOverlay.querySelectorAll('.selectedDiploTrans').forEach(element => {
          element.classList.remove('selectedDiploTrans')
        })
        existingOverlay.querySelectorAll(`*[data-id="${dtid}"]`).forEach((element, i) => {
          element.classList.add('selectedDiploTrans')
          // console.log(752, element, i)
          if (i === 0 && this.$store.getters.activeDiploTransElementName === 'curve') {
            const curve = this.$store.getters.activeDiploTransElement
            const section = curve.closest('section')
            const diploStaffDef = section.parentElement.querySelector('staffDef[n="1"]')
            // TODO: make ratsrum consistent with cleanUpDiplomaticTranscript
            const rastrumId = diploStaffDef.getAttribute('decls').split('#')[1]
            const rastrum = this.$store.getters.rastrumsOnCurrentPage.find(rastrum => rastrum.id === rastrumId)
            const g = element
            const factor = 90 // 9px per vu, factor 10 as general factor of Verovio
            const path = g.querySelector('path')
            const bezier = (curve.getAttribute('bezier') || '').split(' ').map(p => parseFloat(p))
            const controlpoints = bezierAttributeToControlpoints(bezier, rastrum, factor)
            const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line')
            line1.setAttribute('x1', controlpoints[0])
            line1.setAttribute('y1', controlpoints[1])
            line1.setAttribute('x2', controlpoints[2])
            line1.setAttribute('y2', controlpoints[3])
            line1.setAttribute('stroke-width', 23)
            g.append(line1)
            const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line')
            line2.setAttribute('x1', controlpoints[4])
            line2.setAttribute('y1', controlpoints[5])
            line2.setAttribute('x2', controlpoints[6])
            line2.setAttribute('y2', controlpoints[7])
            line2.setAttribute('stroke-width', 23)
            g.append(line2)
            for (const i of [0, 2, 4, 6]) {
              const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
              console.log(836, i, i + 1, controlpoints[i], controlpoints[i + 1])
              circle.setAttribute('cx', controlpoints[i])
              circle.setAttribute('cy', controlpoints[i + 1])
              circle.setAttribute('r', '52')
              circle.setAttribute('class', 'curve-controlpoint')
              g.append(circle)
              const tracker = new OpenSeadragon.MouseTracker({
                element: circle,
                dragHandler: (event) => {
                  const windowCoords = new OpenSeadragon.Point(event.originalEvent.x, event.originalEvent.y)
                  const viewportCoords = this.viewer.viewport.windowToViewportCoordinates(windowCoords)
                  const newX = viewportCoords.x * factor
                  const newY = viewportCoords.y * factor
                  controlpoints[i] = newX
                  controlpoints[i + 1] = newY
                  console.log(836, controlpoints, viewportCoords)
                  const line = i < 4 ? line1 : line2 // line1 or line2
                  const pidx = ((i % 4) / 2) + 1 // x1,y1 or x2,y2?
                  line.setAttribute('x' + pidx, newX)
                  line.setAttribute('y' + pidx, newY)
                  circle.setAttribute('cx', newX)
                  circle.setAttribute('cy', newY)
                  path.setAttribute('d', controlpointsToVerovioSvgBezier(controlpoints, 52))
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
                  path.setAttribute('d', controlpointsToVerovioSvgBezier(controlpoints, 52))
                  // update curve bezier attribute in MEI
                  bezier[i] = (newX / factor) - rastrum.x
                  bezier[i + 1] = (newY / factor) - rastrum.y
                  this.$store.dispatch('setActiveDiploTransElementAttValue', { id: 'bezier', value: bezier.map(c => c.toFixed(2)).join(' ') })
                  console.log(836, 'curve bezier updated', bezier)
                }
              })
              this.setMouseTracker(i / 2, tracker)
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
        this.mouseTracker[i].element.closest('g').querySelectorAll('line').forEach(elem => elem.remove())
        this.mouseTracker[i].element.remove()
        this.mouseTracker[i].destroy()
      }
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
      console.log(643, 'renderDiploTransOnPage()')
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

      // ----
      const ep = await getEmptyPage(this.$store.getters.documentWithCurrentPage, this.$store.getters.currentSurfaceId)
      if (!ep) {
        return null
      }

      // x const serializer = new XMLSerializer()
      // x const meiString = serializer.serializeToString(ep)

      const tk = this.$store.getters.verovioToolkit
      const options = this.$store.getters.diploPageBackgroundVerovioOptions
      const width = ep.querySelector('surface').getAttribute('lrx')
      const height = ep.querySelector('surface').getAttribute('lry')
      options.pageHeight = height
      options.pageWidth = width

      const rastrumsOnCurrentPage = this.$store.getters.rastrumsOnCurrentPage

      // console.log('643: height of empty page: ' + typeof height, height)

      tk.setOptions(options)
      console.log('643 again', dtArr)

      // const diplomaticTranscripts = await this.$store.getters.diplomaticTranscriptsOnCurrentPage
      // console.log('913 diplomaticTranscripts', diplomaticTranscripts)

      // ----
      dtArr.forEach(async obj => {
        // console.log('913 entering ', obj)

        if (obj.dt) {
          const renderedDiplo = this.renderDiploTrans(tk, obj.wzDetails, obj.dt, rects, this.$store.getters.documentWithCurrentPage)
          // console.log('913: diplo', renderedDiplo)

          const existingOverlay = [...existingOverlays].find(overlay => overlay.getAttribute('data-diploTrans') === obj.wzDetails.diploTrans)
          const activeWritingZone = this.$store.getters.activeWritingZone

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
            element.append(cleanUpDiplomaticTranscript(renderedDiplo, obj.dt, {
              rastrumsOnCurrentPage,
              selectedElementId: this.$store.getters.activeDiploTransElementId,
              viewer: this.viewer
            }))

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
            existingOverlay.replaceChild(cleanUpDiplomaticTranscript(renderedDiplo, obj.dt, {
              rastrumsOnCurrentPage,
              selectedCurve: this.$store.getters.activeDiploTransElementId,
              viewer: this.viewer
            }), existingOverlay.firstChild)
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

    renderDiploTrans (toolkit, wzDetails, meiDom, rects, sourceDom) {
      /* if (wzDetails.annotTrans === 'data/sources/D-BNba_MH_60_Engelmann/annotatedTranscripts/D-BNba_MH_60_Engelmann_p010_wz02_at.xml') {
        console.log('913a: renderDiploTrans()', meiDom)
        console.log('913a: renderDiploTrans()', wzDetails)
      } */
      // console.log(614, 'calling Elvis', meiDom)
      meiDom.querySelectorAll('measure').forEach(measure => {
        // const sb = measure.previousElementSibling
        // console.log('913a: sb', sb)
        // const staves = sb.getAttribute('corresp').split(' ')
        // console.log('913a: staves', staves)
        const xOff = 0 // parseFloat(measure.getAttribute('x'))
        const eventsThatRequireSystemMargin = ['barLine', 'dynam', 'dir']

        // const zoneId = measure.getAttribute('facs').substr(1)
        // const zone = [...meiDom.querySelectorAll('zone[type="measure"]')].find(z => z.getAttribute('xml:id') === zoneId)
        // const sbZone = zone.previousElementSibling
        // const xOffPlusSystem = (parseFloat(zone.getAttribute('ulx'))) / rects.ratio

        // console.log(614, 'zoneId', zoneId, zone, 'rects', rects)
        measure.querySelectorAll('*[x], *[x2]').forEach(event => {
          if (eventsThatRequireSystemMargin.indexOf(event.localName) > -1) {
            // console.log(614, 'found a barLine', event)
            /* if (event.hasAttribute('x')) {
              const x1 = parseFloat(event.getAttribute('x')) + xOffPlusSystem
              event.setAttribute('x', x1)
            }
            if (event.hasAttribute('x2')) {
              const x2 = parseFloat(event.getAttribute('x2')) + xOffPlusSystem
              event.setAttribute('x2', x2)
            } */

            // console.log(463, 'found a barLine: ', event)
            // console.log(463, 'xOffPlusSystem', xOffPlusSystem)
            const staffDef1 = event.closest('score').querySelector('staffDef')
            // console.log(463, 'staffDef', staffDef1)
            // console.log(463, 'decls', staffDef1.getAttribute('decls'))
            const rastrumId = staffDef1.getAttribute('decls').split('#')[1]
            const rastrum = [...sourceDom.querySelectorAll('rastrum')].find(r => r.getAttribute('xml:id') === rastrumId)
            // console.log(463, 'rastrum', rastrum)

            event.setAttribute('ho', rastrum.getAttribute('system.leftmar'))
          } else {
            // console.log(614, 'found a non-barLine', event)
            /* if (event.hasAttribute('x')) {
              const x1 = parseFloat(event.getAttribute('x')) + xOff
              event.setAttribute('x', x1)
            }
            if (event.hasAttribute('x2')) {
              const x2 = parseFloat(event.getAttribute('x2')) + xOff
              event.setAttribute('x2', x2)
            } */
            event.setAttribute('ho', xOff.toFixed(1))
          }
          /* if (event.localName === 'barLine') {
            console.log(614, 'fixed a barLine', event)
          } */
        })
      })

      /* if (wzDetails.annotTrans === 'data/sources/D-BNba_MH_60_Engelmann/annotatedTranscripts/D-BNba_MH_60_Engelmann_p010_wz02_at.xml') {
        console.log('913: meiDom', meiDom)
      } */
      // console.log('913: meiDom', meiDom)

      const meiString = new XMLSerializer().serializeToString(meiDom)
      toolkit.loadData(meiString)
      const svgText = toolkit.renderToSVG(1, {})
      const parser = new DOMParser()
      const svgDom = parser.parseFromString(svgText, 'application/xml')

      return svgDom.querySelector('svg')
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
        this.renderDiploTransOnPage()
      })

    this.unwatchUsedShapes = this.$store.watch((state, getters) => getters.activeDiploTransUsedShapes,
      (newArr, oldArr) => {
        this.indicateUsedShapes()
        this.indicateSelectedDTElement()
      })

    this.unwatchSelectedId = this.$store.watch((state, getters) => getters.diploTransActivationsInShapes,
      (newValue, oldValue) => {
        // console.log(`select: '${JSON.stringify(oldValue)}' => '${JSON.stringify(newValue)}'`)
        this.indicateSelectedShapes()
        this.indicateSelectedDTElement()
      })

    this.unwatchSelectedDTElement = this.$store.watch((state, getters) => getters.activeDiploTransElementId,
      (newValue, oldValue) => {
        // console.log(`select DT: '${JSON.stringify(oldValue)}' => '${JSON.stringify(newValue)}'`)
        this.indicateSelectedShapes()
        this.indicateSelectedDTElement()
        if (this.$store.getters.activeDiploTransElementName !== 'curve') {
          for (const i in this.mouseTracker) {
            this.setMouseTracker(i, null)
          }
        }
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
      }
      .curve.selectedDiploTrans path {
        fill: #961010;
        stroke: #961010 !important;
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
</style>
