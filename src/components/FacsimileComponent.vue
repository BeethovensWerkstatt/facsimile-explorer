<template>
   <div id="facsimileContainer" :class="explorerTab">
      <!--<div style="position: absolute; top: 1em; left: 1em; right: 1em; border: .5px solid red; z-index: 20; padding: .3rem; background-color: #ffffff66;">TileSource: {{ tileSource }}</div>-->
   </div>
</template>

<script>
import OpenSeadragon from 'openseadragon'
import { rotatePoint } from '@/tools/trigonometry.js'

const osdOptions = {
  id: 'facsimileContainer',
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

  },
  computed: {
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
    renderSvg () {
      const tab = this.$store.getters.explorerTab
      const validTabs = ['pages', 'zones', 'annot', 'diplo']
      return validTabs.indexOf(tab) !== -1
    },

    /**
     * in which tabs of the FX shall we render rastrums / systems as boxes?
     * @return {[type]} [description]
     */
    renderRastrums () {
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
      const validTabs = ['pages']
      return validTabs.indexOf(tab) !== -1
    }
  },
  methods: {
    /**
     * triggered by clicking into the facsimile
     * @param  {[type]} e               [description]
     * @return {[type]}   [description]
     */
    facsimileClickListener (e) {
      const image = this.viewer.world.getItemAt(0)
      const imagePoint = image.viewerElementToImageCoordinates(e.position)

      const click = {
        x: imagePoint.x,
        y: imagePoint.y,
        shift: e.shift
      }
      console.log('clicked image', click)
      // console.log(e)
      this.$store.dispatch('facsimileClick', click)
    },

    /**
     * triggered by clicking onto a rastrum box
     * @param  {[type]} e               [description]
     * @return {[type]}   [description]
     */
    rastrumClickListener (e) {
      e.preventDefault()
      e.stopPropagation()
      const n = e.target.getAttribute('data-n')
      // console.log('clicked rastrum ' + n)
      this.$store.dispatch('selectSystemOnCurrentPage', n)
    },

    /**
     * triggered by double-clicking onto a rastrum box
     * @param  {[type]} e               [description]
     * @return {[type]}   [description]
     */
    systemDoubleClickListener (e) {
      e.preventDefault()
      e.stopPropagation()
      const n = e.target.getAttribute('data-n')
      // console.log('doubleClicked rastrum ' + n)
      this.$store.dispatch('editSystemOnCurrentPage', n)
    },

    /**
     * triggered by clicking onto the svg overlay; extracts the shape actually clicked on
     * @param  {[type]} e               [description]
     * @return {[type]}   [description]
     */
    svgClickListener (e) {
      e.preventDefault()
      e.stopPropagation()
      // console.log(e.target)
      if (e.target.localName === 'path') {
        // console.log('clicked shape')
        // console.log(e)
        this.$store.dispatch('clickedSvgShape', e.target.id)
      }
    },

    pageClickListener (e) {
      e.preventDefault()
      e.stopPropagation()
      // const image = this.viewer.world.getItemAt(0)

      const counterRotate = this.viewer.viewport.getRotation()// this.tileSource.degrees * -1
      const center = { x: 0, y: 0 }
      console.log('counterRotate: ', counterRotate, this.tileSource.degrees * -1)
      console.log(e)

      const pageOverlay = this.viewer.getOverlayById(document.querySelector('.overlay.pageBorder'))
      const pageOverlayViewportBounds = pageOverlay.getBounds(this.viewer.viewport)

      console.log('pageOverlayViewportBounds', pageOverlayViewportBounds)

      const clientPos = new OpenSeadragon.Point(e.clientX, e.clientY)// { x: e.clientX, y: e.clientY }

      // const imagePoint = image.viewerElementToImageCoordinates(clientPos)
      // const viewerPoint = this.viewer.viewport.viewportToViewerElementCoordinates(clientPos)
      // const viewPoint = this.viewer.viewport.viewerElementToViewportCoordinates(clientPos)
      // const pointFromPixel = this.viewer.viewport.pointFromPixel(clientPos)
      // const pointFromPixelNoRotate = this.viewer.viewport.pointFromPixelNoRotate(clientPos)
      // const windowToImageCoordinates = this.viewer.viewport.windowToImageCoordinates(clientPos)
      const windowToViewportCoordinates = this.viewer.viewport.windowToViewportCoordinates(clientPos)
      const click = {
        x: clientPos.x,
        y: clientPos.y,
        shift: e.shift
      }

      console.log('clicked page', click)
      // console.log('unrotated imagePoint ', imagePoint, rotatePoint(imagePoint, center, counterRotate))
      // console.log('unrotated viewerPoint ', viewerPoint, rotatePoint(viewerPoint, center, counterRotate))
      // console.log('unrotated viewPoint ', viewPoint, rotatePoint(viewPoint, center, counterRotate))
      // console.log('unrotated pointFromPixel ', pointFromPixel, rotatePoint(pointFromPixel, center, counterRotate))
      // console.log('pointFromPixelNoRotate', pointFromPixelNoRotate)
      // console.log('windowToImageCoordinates ', windowToImageCoordinates, rotatePoint(windowToImageCoordinates, center, counterRotate))
      console.log('windowToViewportCoordinates ', windowToViewportCoordinates, rotatePoint(windowToViewportCoordinates, center, counterRotate), windowToViewportCoordinates.rotate(counterRotate, center))
    },

    /**
     * triggered by double-clicking onto the svg overlay
     * @param  {[type]} e               [description]
     * @return {[type]}   [description]
     */
    svgDoubleClickListener (e) {
      e.preventDefault()
      e.stopPropagation()
      // console.log('clicked shape')
      // console.log(e)
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
      ts.degrees = 0
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
      console.log('facsimileOpened', data)
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
      console.log('FacsimileComponent:renderGrid()')
      // temporary condition
      /* if (this.viewer) {
        return null
      } */

      document.querySelectorAll('.grid').forEach(overlay => {
        this.viewer.removeOverlay(overlay)
      })

      const tiledImage = this.viewer.world.getItemAt(0)

      if (!tiledImage) {
        console.log('no tiledImage, so no renderGrid')
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
     * rotate the page facsimile
     */
    setPageRotation () {
      /* const tiledImage = this.viewer.world.getItemAt(0)
      const rotation = parseFloat(this.$store.getters.currentPageRotation)

      if (!tiledImage || !rotation) {
        return null
      }

      tiledImage.setRotation(rotation) */
      const rotation = parseFloat(this.$store.getters.currentPageRotation)

      if (!rotation) {
        return null
      }

      this.viewer.viewport.setRotationWithPivot(rotation, new OpenSeadragon.Point(0, 0))
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

      // the bounding box of the media fragment, which could be loaded by IIIF
      const existingRotatedOverlay = document.querySelector('.overlay.pageBorder.bbox')

      const centerX = parseFloat(pageDimensions.mmWidth) / 2
      const centerY = parseFloat(pageDimensions.mmHeight) / 2
      const rotatedLocation = new OpenSeadragon.Rect(0, 0, centerX * 2, centerY * 2)

      if (!existingRotatedOverlay) {
        const element = document.createElement('div')
        element.classList.add('overlay')
        element.classList.add('pageBorder')
        element.classList.add('bbox')

        this.viewer.addOverlay({
          element,
          location: rotatedLocation,
          placement: OpenSeadragon.Placement.CENTER,
          rotationMode: OpenSeadragon.OverlayRotationMode.BOUNDING_BOX
        })
      } else {
        this.viewer.updateOverlay(existingRotatedOverlay, rotatedLocation)
      }

      // the actual rectangle stored in the data
      const location = new OpenSeadragon.Rect(0, 0, parseFloat(pageDimensions.mmWidth), parseFloat(pageDimensions.mmHeight))

      const existingOverlay = document.querySelector('.overlay.pageBorder.mediaFragment')

      if (!existingOverlay) {
        const element = document.createElement('div')
        element.classList.add('overlay')
        element.classList.add('pageBorder')
        element.classList.add('mediaFragment')
        element.title = 'Generated IIIF Selection'

        this.viewer.addOverlay({
          element,
          location,
          rotationMode: OpenSeadragon.OverlayRotationMode.EXACT
        })
      } else {
        this.viewer.updateOverlay(existingOverlay, location)
      }

      // get innermost rectangle
      const center = location.getCenter()
      const deg = this.viewer.viewport.getRotation()
      const tl = location.getTopLeft()// .rotate(deg, location.getTopLeft())

      const centerRotated = center.rotate(deg, tl)

      const width = location.width
      const height = location.height

      const offsetX = Math.abs(center.x - centerRotated.x)
      const offsetY = Math.abs(center.y - centerRotated.y)

      // const origin = rotatePoint({ x: center.x - width / 2, y: center.y - height / 2 }, { x: tl.x, y: tl.x }, deg * -1)

      const irX = deg < 0 ? center.x - width / 2 + offsetX * 2 : center.x - width / 2
      const irY = deg < 0 ? center.y - height / 2 : center.y - height / 2 + offsetY * 2
      const irW = deg < 0 ? width - offsetX * 2 : width - offsetX * 2
      const irH = deg < 0 ? height - offsetY * 2 : height - offsetY * 2

      const innerRect = new OpenSeadragon.Rect(irX, irY, irW, irH)
      const existingInnerOverlay = document.querySelector('.overlay.pageBorder.actualPage')

      if (!existingInnerOverlay) {
        const element = document.createElement('div')
        element.classList.add('overlay')
        element.classList.add('pageBorder')
        element.classList.add('actualPage')
        element.addEventListener('click', this.pageClickListener)

        this.viewer.addOverlay({
          element,
          location: innerRect,
          rotationMode: OpenSeadragon.OverlayRotationMode.NO_ROTATION
        })
      } else {
        this.viewer.updateOverlay(existingInnerOverlay, innerRect)
      }

      //
      /* document.querySelectorAll('.pageBorderPoint.overlay, .fragmentFrame, .pageBorder.overlay').forEach(overlay => {
        this.viewer.removeOverlay(overlay)
      }) */

      /* const xScale = parseFloat(pageDimensions.mmWidth) / parseFloat(pageDimensions.width)
      const yScale = parseFloat(pageDimensions.mmHeight) / parseFloat(pageDimensions.height)

      // const pageBorderPoints = this.$store.getters.pageBorderPoints
      const data = this.$store.getters.currentPageFragIdRect

      const renderPoint = ({ x, y }, className) => {
        const element = document.createElement('div')
        element.classList.add('overlay')
        element.classList.add('point')
        element.classList.add(className)

        this.viewer.addOverlay({
          element,
          location: new OpenSeadragon.Point(parseInt(x) * xScale, parseInt(y) * yScale),
          width: 3,
          height: 3,
          placement: 'CENTER'
        })
      }

      renderPoint(data.center, 'center')
      renderPoint(data.inner.ul, 'ul')
      renderPoint(data.inner.ur, 'ur')
      renderPoint(data.inner.lr, 'lr')
      renderPoint(data.inner.ll, 'll')
      renderPoint(data.rotate.handle, 'rotate')
      */

      /* const pageUnrotated = document.createElement('div')
      const pageRotated = document.createElement('div')
      pageUnrotated.append(pageRotated)
      const loc = new OpenSeadragon.Rect(0, 0, parseFloat(pageDimensions.mmWidth), parseFloat(pageDimensions.mmHeight))

      console.log('rect: ', loc)
      // inner.classList.add('unrotatedFrame')
      // inner.classList.add('fragmentFrame')

      pageUnrotated.classList.add('pageBorder')
      pageUnrotated.classList.add('overlay')
      pageRotated.classList.add('rotated')
      pageRotated.style.transform = 'rotate(' + data.rotate.deg + 'deg)'
      */
    },
    unload () {
      document.querySelectorAll('.overlay, .grid').forEach(overlay => {
        this.viewer.removeOverlay(overlay)
      })

      document.querySelectorAll('.pageBorder.overlay').forEach(overlay => {
        overlay.removeEventListener('click', this.pageClickListener)
      })
    }
  },
  created () {
    console.log('FacsimileComponent:created()')
    this.$watch(
      () => this.$route.query,
      (to, previous) => {
        console.log('FacsimileComponent watch($query): ' + previous.page + ' -> ' + to.page)
        // react to route changes...
      },
      () => this.$route.params,
      (to, previous) => {
        console.log('FacsimileComponent watch($params): ' + previous.source + ' -> ' + to.source)
        // react to route changes...
      }
    )
  },
  mounted () {
    console.log('FacsimileComponent:mounted()')
    this.viewer = OpenSeadragon(osdOptions)
    this.viewer.addHandler('open', (data) => {
      this.facsimileOpened(data)
    })
    this.viewer.addHandler('canvas-click', (data) => {
      this.facsimileClickListener(data)
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

    this.openFacsimile()
  },
  updated () {
    console.log('FacsimileComponent:updated()')
    this.openFacsimile()
  },
  beforeUnmount () {
    console.log('FacsimileComponent:beforeUnmount()')
    this.unload()
    // this.unwatchPageBorders()
    this.unwatchPageRotation()
    this.unwatchPageDimensions()
    this.unwatchTileSource()
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
@import '@/css/_variables.scss';

#facsimileContainer {
  width: 100%;
  height: 100%;
  position: relative;

  .system.overlay {
    z-index: 0;
    background-color: rgba(70 ,255, 70, 0.6);
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
    &:hover {
      stroke-width: 10px;
      stroke: lighten($svgUnassignedShapeColor, 15%);
    }
  }

  .writingZone path {
    fill: #666666;
    stroke: #666666;
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

.overlay.pageBorder.bbox {
  outline: 1px solid #ff00ff;
}

.overlay.pageBorder.mediaFragment {
  outline: 1px solid #00ffff;
}

.overlay.pageBorder.actualPage {
  outline: 8px solid #0000ff99;
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
