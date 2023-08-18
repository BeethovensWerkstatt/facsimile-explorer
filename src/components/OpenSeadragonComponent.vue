<template>
  <div id="osdContainer" :class="explorerTab">

  </div>
</template>

<script>
import OpenSeadragon from 'openseadragon'

const verovioOptions = {
  scale: 30,
  breaks: 'none',
  openControlEvents: true,
  svgBoundingBoxes: true,
  svgRemoveXlink: true,
  header: 'none',
  footer: 'none' //,
  // unit: 18
}

const osdOptions = {
  id: 'osdContainer',
  preserveViewport: false,
  visibilityRatio: 0.8,
  sequenceMode: true,
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
//
export default {
  name: 'OpenSeadragonComponent',
  props: {
    svg: Boolean,
    pageBorders: Boolean,
    rastrums: Boolean
  },
  computed: {
    explorerTab () {
      return this.$store.getters.explorerTab
    }
  },
  methods: {
    facsimileClickListener (e) {
      const image = this.viewer.world.getItemAt(0)
      const imagePoint = image.viewerElementToImageCoordinates(e.position)

      const click = {
        x: imagePoint.x,
        y: imagePoint.y,
        shift: e.shift
      }
      this.$store.dispatch('facsimileClick', click)
    },
    systemClickListener (e) {
      e.preventDefault()
      e.stopPropagation()
      const n = e.target.getAttribute('data-n')
      console.log('clicked system ' + n)
      this.$store.dispatch('selectSystemOnCurrentPage', n)
    },
    systemDoubleClickListener (e) {
      e.preventDefault()
      e.stopPropagation()
      const n = e.target.getAttribute('data-n')
      console.log('doubleClicked system ' + n)
      this.$store.dispatch('editSystemOnCurrentPage', n)
    },
    svgClickListener (e) {
      e.preventDefault()
      e.stopPropagation()
      // console.log(e.target)
      if (e.target.localName === 'path') {
        console.log('clicked shape')
        console.log(e)

        this.$store.dispatch('clickedSvgShape', e.target.id)
      }
    },
    svgDoubleClickListener (e) {
      e.preventDefault()
      e.stopPropagation()
      // console.log('clicked shape')
      // console.log(e)
    },
    renderShapes () {
      if (!this.svg) {
        return false
      }

      // const svgPath = this.$store.getters.currentSvgPath
      const svg = this.$store.getters.svgForCurrentPage
      if (!svg) {
        return null
      }
      const page = this.$store.getters.page(this.$store.getters.currentPageZeroBased)
      // console.log('renderShapes() for ' + this.$store.getters.currentSvgPath)
      // only relevant before component is mounted
      if (!this.viewer) {
        return null
      }
      if (svg) {
        const existingOverlay = document.querySelector('#osdContainer svg')

        if (existingOverlay !== null) {
          const oldActive = existingOverlay.querySelector('.activeWritingZone')
          if (oldActive !== null) {
            oldActive.classList.remove('activeWritingZone')
          }

          this.removeListeners()
          this.viewer.removeOverlay(existingOverlay)
        }

        // JPV: svg is XMLDocument now
        if (!svg.documentElement) console.warn('not an XMLDocument', svg)
        const svgClone = svg.documentElement.cloneNode(true)
        this.viewer.world.getItemAt(0).addOverlay({
          element: svgClone,
          x: 0,
          y: 0,
          width: page.width,
          height: page.height
        })

        const writingZonesOnCurrentPage = this.$store.getters.writingZonesOnCurrentPage
        const activeWritingZone = this.$store.getters.activeWritingZone
        const activeWritingLayer = this.$store.getters.activeWritingLayer

        const activeZone = writingZonesOnCurrentPage.find(wz => wz.id === activeWritingZone)

        if (activeZone) {
          svgClone.querySelector('#' + activeZone.svgGroupWzId).classList.add('activeWritingZone')
        }

        if (activeWritingLayer) {
          const activeLayer = activeZone.layers.find(wl => wl.id === activeWritingLayer)

          if (activeLayer) {
            svgClone.querySelector('#' + activeLayer.svgGroupWlId).classList.add('activeWritingLayer')
          }
        }

        // console.log('done')
        svgClone.addEventListener('click', this.svgClickListener)
        svgClone.addEventListener('dblclick', this.svgDoubleClickListener)
      }
    },
    renderSystems () {
      if (!this.rastrums) {
        return null
      }

      const systems = this.$store.getters.rastrumsOnCurrentPage
      const editedSystem = this.$store.getters.editingSystemOnCurrentPage
      // const page = this.$store.getters.page(this.$store.getters.currentPageZeroBased)

      // only relevant before component is mounted
      if (!this.viewer) {
        return null
      }

      document.querySelectorAll('.system.overlay').forEach(overlay => {
        overlay.removeEventListener('click', this.systemClickListener)
        overlay.removeEventListener('dblclick', this.systemDoubleClickListener)
        this.viewer.removeOverlay(overlay)
      })

      systems.forEach((system, i) => {
        if (i !== editedSystem) {
          const overlay = document.createElement('div')
          overlay.classList.add('system')
          overlay.classList.add('overlay')
          overlay.setAttribute('title', i + 1)
          overlay.setAttribute('data-n', i)

          /* this.viewer.addOverlay({
            element: overlay,
            x: system.x,
            y: system.y,
            width: system.w,
            height: system.h
          }) */
          const rect = new OpenSeadragon.Rect(system.x, system.y, system.w, system.h)
          console.log(rect)
          console.log('\n\nHERE')
          console.log(this.viewer.world)
          console.log(this.viewer.world.getItemAt(0))
          this.viewer.world.getItemAt(0).addOverlay({
            element: overlay,
            location: rect
          })

          overlay.addEventListener('click', this.systemClickListener)
          overlay.addEventListener('dblclick', this.systemDoubleClickListener)
        }
      })
    },
    renderPageBorders (origin) {
      console.log(0)
      // only relevant before component is mounted
      if (!this.viewer || this.viewer.world.getItemCount() === 0) {
        return null
      }
      console.log(1)

      if (!this.pageBorders) {
        return null
      }

      // const page = this.$store.getters.currentPageDimensions
      // const fragment = this.$store.getters.currentPageFragmentIdentifier
      /* if (!fragment || !page) {
        return null
      } */

      document.querySelectorAll('.pageBorderPoint.overlay').forEach(overlay => {
        this.viewer.removeOverlay(overlay)
      })

      if (this.$store.getters.facsimileClickMode !== 'pageMargin') {
        return null
      }
      console.log(2)
      const pageBorderPoints = this.$store.getters.pageBorderPoints

      // const overlays = []
      pageBorderPoints.forEach((point, i) => {
        console.log(3, 'dealing with point')
        console.log(point)
        const overlay = document.createElement('div')
        overlay.classList.add('pageBorderPoint')
        overlay.classList.add('overlay')
        overlay.classList.add('point' + i)

        console.log('\n\nHERE2')
        console.log(this.viewer.world)
        console.log(this.viewer.world.getItemAt(0))

        this.viewer.world.getItemAt(0).addOverlay({
          element: overlay,
          location: new OpenSeadragon.Rect(point.x - 10, point.y - 10, 20, 20)
        })
        console.log(4)
      })

      /* const overlayTop = document.createElement('div')
      overlayTop.classList.add('pageBorder')
      overlayTop.classList.add('overlay')
      overlayTop.classList.add('top') */

      // console.info(tempRect.rotate(20, new OpenSeadragon.Point(1000, 1000)))
      // this.viewer.viewport.setRotation(10)
      // tempOverlay.setAttribute('data-rotate', -20)

      /* this.viewer.addOverlay({
        element: tempOverlay,
        location: tempRect.rotate(20),
        rotationMode: OpenSeadragon.OverlayRotationMode.NO_ROTATION
      }) */

      /* this.viewer.addOverlay({
        element: overlayTop,
        location: topRect
      }) */
    },

    focusRect () {
      const xywh = this.$store.getters.focusRect
      if (!this.viewer || !xywh) {
        return null
      }
      this.viewer.viewport.fitBoundsWithConstraints(new OpenSeadragon.Rect(xywh.x, xywh.y, xywh.w, xywh.h))
    },
    renderVerovioOverlay () {
      // only relevant before component is mounted
      if (!this.viewer) {
        return null
      }
      document.querySelectorAll('.verovio.overlay').forEach(overlay => {
        this.viewer.removeOverlay(overlay)
      })

      if (this.$store.getters.systemsOnCurrentPage.length === 0) {
        return false
      }

      const prefix = '<music meiversion="5.0.0-dev"><body><pages type="transcription">'
      const pageCode = this.$store.getters.xmlCode
      const postfix = '</pages></body></music>'

      const mei = prefix + pageCode + postfix
      this.vrvToolkit.loadData(mei)
      const svg = this.vrvToolkit.renderToSVG(1, {})

      const page = this.$store.getters.page(this.$store.getters.currentPageZeroBased)

      const overlay = document.createElement('div')
      overlay.classList.add('verovio')
      overlay.classList.add('overlay')
      overlay.innerHTML = svg

      this.viewer.world.getItemAt(0).addOverlay({
        element: overlay,
        x: 0,
        y: 0,
        width: page.width,
        height: page.height
      })

      console.log(overlay)
    },
    removeListeners () {
      document.querySelectorAll('#osdContainer .system').forEach(system => {
        system.removeEventListener('click', this.systemClickListener)
        system.removeEventListener('dblclick', this.systemDoubleClickListener)
      })

      document.querySelectorAll('#osdContainer svg').forEach(svg => {
        svg.removeEventListener('click', this.svgClickListener)
        svg.removeEventListener('click', this.svgDoubleClickListener)
      })
    }
  },
  created () {
    this.$store.getters.verovioToolkit().then(tk => {
      this.vrvToolkit = tk
      this.vrvToolkit.setOptions(verovioOptions)
      // console.log('verovio is there now')
      // console.log(this.vrvToolkit)
    })
  },
  mounted () {
    try {
      this.viewer = OpenSeadragon(osdOptions)
      // console.log('viewer', this.viewer)
      const page = this.$route.query.page
      const n = page ? +page - 1 : 0
      // console.log('open', this.$store.getters.pageArray[n])
      const osdPage = this.$store.getters.pageArrayOSD[n]
      console.log('osdPage', osdPage)
      // this.viewer.open(this.$store.getters.pageArrayOSD, n)
      // this.renderPageBorders('mounted')
    } catch (err) {
      console.warn('WARNING: Unable to init OSD yet…')
    }

    // TODO: Adjusted to see something for now…
    /*
    const pages = ['https://edirom-images.beethovens-werkstatt.de/Scaler/IIIF/D-BNba_HCB_Mh_34%252Ffol5v.jpg'] // this.$store.getters.pageArrayOSD
    if (pages.length > 0) {
      this.viewer.open(pages)
      this.$store.dispatch('setCurrentPage', 0)
      // this.renderSystems()
      // this.renderShapes()
    }
    */

    this.viewer.addHandler('page', (data) => {
      // remove listeners
      this.removeListeners()
      this.renderPageBorders('viewerPageListener')
      console.log('calling handler page, data.page ', data.page)

      if (data.page !== this.$store.getters.currentPageZeroBased) {
        console.log('going in')
        this.$store.dispatch('setCurrentPage', data.page)
        this.renderSystems()
        this.renderShapes()
      }
    })

    this.viewer.addHandler('canvas-click', (data) => {
      this.facsimileClickListener(data)
    })

    this.viewer.addHandler('open', (data) => {
      this.renderPageBorders('viewerOpenListener')
    })

    this.unwatchCurrentPage = this.$store.watch((state, getters) => getters.currentPageZeroBased,
      (newPage, oldPage) => {
        console.log('watchCurrentPage listener, calling goToPage(' + newPage + ')')
        this.viewer.goToPage(newPage)
        this.renderSystems()
        this.renderShapes()
        this.renderPageBorders('unwatchCurrentPage')
      })
    this.unwatchPages = this.$store.watch((state, getters) => getters.pageArray,
      (newArr, oldArr) => {
        const page = this.$route.query.page
        // console.log('open', newArr)
        this.viewer.open(newArr, page ? +page - 1 : 0)
        this.$store.dispatch('setCurrentPage', page ? +page - 1 : 0)
        this.renderSystems()
        this.renderShapes()
        this.renderPageBorders('unwatchPages')
      })
    this.unwatchSVG = this.$store.watch((state, getters) => getters.svgForCurrentPage,
      (svg) => {
        if (svg) {
          this.renderShapes()
        }
        // this.viewer.open(newArr)
      })
    this.unwatchUnAssignedShapes = this.$store.watch((state, getters) => getters.unassignedShapesOnCurrentPage,
      (arr) => {
        this.renderShapes()
      })
    this.unwatchActiveWritingZone = this.$store.watch((state, getters) => getters.activeWritingZone,
      (id) => {
        this.renderShapes()
      })
    this.unwatchFocusRect = this.$store.watch((state, getters) => getters.focusRect,
      (newRect, oldRect) => {
        console.log('rects changing…')
        if (newRect !== oldRect && newRect !== null) {
          this.focusRect()
        }
      })
    // const svg = this.$store.getters.svgOnCurrentPage
    this.unwatchSystems = this.$store.watch((state, getters) => getters.rastrumsOnCurrentPage,
      (newArr, oldArr) => {
        this.renderSystems()
      })
    this.unwatchEditingSystem = this.$store.watch((state, getters) => getters.editingSystemOnCurrentPage,
      (newIndex, oldIndex) => {
        if (newIndex !== oldIndex) {
          this.renderSystems()
        }
        if (newIndex !== -1) {
          this.generateSelectionFromZone()
        }
      })
    this.unwatchPageBorders = this.$store.watch((state, getters) => getters.currentPageFragmentIdentifier,
      (newObj, oldObj) => {
        this.renderPageBorders('unwatchPageBorders')
      })
    this.unwatchPageXML = this.$store.watch((state, getters) => getters.xmlCode,
      (newCode, oldCode) => {
        // console.log('RENDER NOW')
        this.renderVerovioOverlay()
      })
    this.unwatchPageBorderPoints = this.$store.watch((state, getters) => getters.pageBorderPointsLength,
      (num) => {
        console.log('value changed to  ' + num)
        /* if (newArr.length !== 0) {
          this.renderPageBorders()
        } */
        this.renderPageBorders()
      })

    const page = this.$route.query.page
    const n = page ? +page - 1 : 0
    this.viewer.open(this.$store.getters.pageArrayOSD, n)
    /*
    try {
      if (this.$store.getters.currentPageZeroBased !== -1) {
        this.viewer.open(this.$store.getters.documentPagesForOSD, this.$store.getters.currentPageZeroBased)
        console.log('opening page')
      }
    } catch (err) {
      console.log(err)
    }

    try {
      if (this.$store.getters.svgForCurrentPage) {
        console.log('x')
        this.renderShapes()
      }
    } catch (err) {
      console.log(err)
    } */
  },
  updated () {
    console.log('OSD updated – shall I now?')
  },
  beforeUnmount () {
    this.unwatchPages()
    this.unwatchSVG()
    this.unwatchSystems()
    this.unwatchUnAssignedShapes()
    this.unwatchActiveWritingZone()
    this.unwatchCurrentPage()
    this.unwatchEditingSystem()
    this.unwatchPageXML()
    this.removeListeners()
    this.unwatchFocusRect()
    this.unwatchPageBorderPoints()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
@import '@/css/_variables.scss';

*[data-rotate] {
  // set per JS: transform: 'rotate(10deg)';
  transform-origin: top left;
}

#osdContainer {
  width: 100%;
  height: 100%;

  .overlay.pageBorder {
    width: 100px;
    height: 100px;
    background-color: rgba(255, 70, 70, 0.6);
    backdrop-filter: blur(2px);
  }

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
</style>
