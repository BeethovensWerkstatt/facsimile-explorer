<template>
  <div id="osdContainer" :class="currentTab">

  </div>
</template>

<script>
import OpenSeadragon from 'openseadragon'
import * as Annotorious from '@recogito/annotorious-openseadragon'
import '@recogito/annotorious-openseadragon/dist/annotorious.min.css'
import verovio from 'verovio'

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

export default {
  name: 'OpenSeadragonComponent',
  props: {
  },
  computed: {
    currentTab () {
      return this.$store.getters.explorerTab
    }
  },
  methods: {
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
      if (e.target.localName === 'path') {
        this.$store.dispatch('clickedShape', e.target)
      }
      this.adjustShapeHighlights(this.$store.getters.activeElement, null)
    },
    svgDoubleClickListener (e) {
      e.preventDefault()
      e.stopPropagation()
      console.log('clicked shape')
      console.log(e)
    },
    renderShapes () {
      const svg = this.$store.getters.svgOnCurrentPage
      const page = this.$store.getters.page(this.$store.getters.currentPageZeroBased)

      // only relevant before component is mounted
      if (this.viewer === undefined) {
        return null
      }
      if (svg !== null) {
        svg.classList.add('shapeOverlay')
        this.viewer.addOverlay({
          element: svg,
          x: 0,
          y: 0,
          width: page.width,
          height: page.height
        })
        svg.addEventListener('click', this.svgClickListener)
        svg.addEventListener('dblclick', this.svgDoubleClickListener)
      }
    },
    renderSystems () {
      const systems = this.$store.getters.systemsOnCurrentPage
      const editedSystem = this.$store.getters.editingSystemOnCurrentPage
      const page = this.$store.getters.page(this.$store.getters.currentPageZeroBased)

      // only relevant before component is mounted
      if (this.viewer === undefined) {
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

          this.viewer.addOverlay({
            element: overlay,
            x: system.left,
            y: system.top,
            width: system.right - system.left,
            height: page.height / 30
          })

          overlay.addEventListener('click', this.systemClickListener)
          overlay.addEventListener('dblclick', this.systemDoubleClickListener)
        }
      })
    },
    generateSelectionFromZone () {
      const systems = this.$store.getters.systemsOnCurrentPage
      const index = this.$store.getters.editingSystemOnCurrentPage
      const system = systems[index]
      if (index === -1 || system === undefined || system === null) {
        return false
      }

      const page = this.$store.getters.page(this.$store.getters.currentPageZeroBased)
      const imageUri = this.$store.getters.pageArray[this.$store.getters.currentPageZeroBased]
      const xywh = 'xywh=pixel:' + system.left + ',' + system.top + ',' + parseInt(system.right - system.left) + ',' + Math.round(page.height / 30)

      const anno = {
        type: 'Annotation',
        body: [{
          type: 'TextualBody',
          purpose: 'tagging',
          value: ''
        }
        ],
        target: {
          source: imageUri,
          selector: {
            type: 'FragmentSelector',
            conformsTo: 'http://www.w3.org/TR/media-frags/',
            value: xywh
          }
        },
        '@context': 'http://www.w3.org/ns/anno.jsonld',
        id: 'prefix' + index
      }

      this.anno.setAnnotations([anno])
      this.anno.selectAnnotation(anno)
    },
    renderVerovioOverlay () {
      document.querySelectorAll('.verovio.overlay').forEach(overlay => {
        this.viewer.removeOverlay(overlay)
      })
      console.log('doing the overlay…')
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

      const compensatedRotation = page.rotation * -1
      overlay.querySelector('svg').style.transform = 'rotate(' + compensatedRotation + 'deg)'

      this.viewer.addOverlay({
        element: overlay,
        x: 0,
        y: 0,
        width: page.width,
        height: page.height
      })

      // console.log(overlay)
    },
    adjustShapeHighlights (newElem, oldElem) {
      console.log('adjusting highlights')
      if (oldElem !== null && oldElem.hasAttribute('facs')) {
        const oldShapes = oldElem.getAttribute('facs').replace(/\s+g/, ' ').trim().split(' ')
        document.querySelectorAll(oldShapes.join(', ')).forEach(shape => {
          shape.classList.remove('activeElem')
        })
      }
      if (newElem !== null && newElem.hasAttribute('facs')) {
        const newShapes = newElem.getAttribute('facs').replace(/\s+g/, ' ').trim().split(' ')
        document.querySelectorAll(newShapes.join(', ')).forEach(shape => {
          shape.classList.add('activeElem')
        })
      }
    }
  },
  mounted: function () {
    // eslint-disable-next-line
    this.vrvToolkit = new verovio.toolkit()
    this.vrvToolkit.setOptions(verovioOptions)

    console.log('verovio is there now')
    console.log(this.vrvToolkit)

    this.viewer = OpenSeadragon({
      id: 'osdContainer',
      preserveViewport: false,
      visibilityRatio: 0.8,
      sequenceMode: true,
      showNavigator: true,
      navigatorId: 'openSeadragonNavigator',
      homeButton: 'zoomHome',
      zoomInButton: 'zoomIn',
      zoomOutButton: 'zoomOut',
      previousButton: 'pageLeft',
      nextButton: 'pageRight',
      gestureSettingsMouse: {
        clickToZoom: false
      },
      silenceMultiImageWarnings: true
    })

    const annotoriousConfig = {
      disableEditor: true
    }
    // Initialize the Annotorious plugin
    this.anno = Annotorious(this.viewer, annotoriousConfig)
    // this.anno.setVisible(false)
    // this.anno.readOnly = true

    // Listener for new Selections
    this.anno.on('createSelection', async (selection) => {
      // console.log('created selection:', selection)
      selection.body = [{
        type: 'TextualBody',
        purpose: 'tagging',
        value: ''
      }]

      await this.anno.updateSelected(selection)
      this.anno.saveSelected()
    })

    // automatically triggered through createSelection
    this.anno.on('createAnnotation', async (annotation) => {
      // xywh=pixel:647.4000244140625,802,1304.3333740234375,199.3333740234375
      const raw = annotation.target.selector.value.substr(11).split(',')
      const xywh = {
        x: Math.max(Math.round(raw[0]), 0),
        y: Math.max(Math.round(raw[1]), 0),
        w: Math.round(raw[2]),
        h: Math.round(raw[3])
      }
      this.$store.dispatch('createSystem', xywh)
      this.anno.clearAnnotations()
      this.renderSystems()
    })

    // Listener for changing selections
    /* this.anno.on('changeSelectionTarget', (a) => {
      console.log('changeSelectionTarget')
      console.log(a)

      // console.log('changed selection:', a)
      const raw = a.selector.value.substr(11).split(',')
      const xywh = {
        x: Math.round(raw[0]),
        y: Math.round(raw[1]),
        w: Math.round(raw[2]),
        h: Math.round(raw[3])
      }
      this.$store.dispatch('setSelectionRect', xywh)
    }) */

    this.anno.on('updateAnnotation', (annotation) => {
      // The users has selected an existing annotation
      console.log('updateAnnotation')
      console.log(annotation)

      const raw = annotation.target.selector.value.substr(11).split(',')
      const xywh = {
        x: Math.round(raw[0]),
        y: Math.round(raw[1]),
        w: Math.round(raw[2]),
        h: Math.round(raw[3])
      }
      const system = {
        i: annotation.id.substring(6),
        rect: xywh
      }

      this.$store.dispatch('updateSystemCoordinates', system)
      this.anno.clearAnnotations()
      this.renderSystems()
    })

    const pages = this.$store.getters.pageArrayOSD
    if (pages.length > 0) {
      this.viewer.open(pages)
      this.$store.dispatch('setCurrentPage', 0)
      this.renderSystems()
      this.renderShapes()
      this.renderVerovioOverlay()
    }

    this.viewer.addHandler('page', (data) => {
      // remove listeners
      document.querySelectorAll('#osdContainer .system').forEach(system => {
        system.removeEventListener('click', this.systemClickListener)
        system.removeEventListener('dblclick', this.systemDoubleClickListener)
      })

      document.querySelectorAll('#osdContainer svg').forEach(svg => {
        svg.removeEventListener('click', this.svgClickListener)
        svg.removeEventListener('click', this.svgDoubleClickListener)
      })

      if (data.page !== this.$store.getters.currentPageZeroBased) {
        this.$store.dispatch('setCurrentPage', data.page)
        this.renderSystems()
        this.renderShapes()
        this.renderVerovioOverlay()
      }
    })

    this.unwatchCurrentPage = this.$store.watch((state, getters) => getters.currentPageZeroBased,
      (newPage, oldPage) => {
        this.viewer.goToPage(newPage)
      })
    this.unwatchPages = this.$store.watch((state, getters) => getters.pageArray,
      (newArr, oldArr) => {
        this.viewer.open(newArr)
        this.$store.dispatch('setCurrentPage', 0)
        this.renderSystems()
        this.renderShapes()
        this.renderVerovioOverlay()
      })
    this.unwatchSVG = this.$store.watch((state, getters) => getters.svgOnCurrentPage,
      (svg) => {
        if (svg !== null) {
          this.renderShapes()
        }
        // this.viewer.open(newArr)
      })
    // const svg = this.$store.getters.svgOnCurrentPage
    this.unwatchSystems = this.$store.watch((state, getters) => getters.systemsOnCurrentPage,
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
    this.unwatchPageXML = this.$store.watch((state, getters) => getters.xmlCode,
      (newCode, oldCode) => {
        this.renderVerovioOverlay()
      })
    this.unwatchActiveElement = this.$store.watch((state, getters) => getters.activeElement,
      (newElem, oldElem) => {
        this.adjustShapeHighlights(newElem, oldElem)
      })
    this.unwatchActiveSketchArea = this.$store.watch((state, getters) => getters.activeSketchArea,
      (newId, oldId) => {
        if (oldId !== null) {
          document.querySelector('#' + oldId).classList.remove('activeGroup')
        }
        if (newId !== null) {
          document.querySelector('#' + newId).classList.add('activeGroup')
        }
      })
  },
  beforeUnmount () {
    this.unwatchPages()
    this.unwatchSVG()
    this.unwatchSystems()
    this.unwatchCurrentPage()
    this.unwatchEditingSystem()
    this.unwatchPageXML()
    this.unwatchActiveElement()
    this.unwatchActiveSketchArea()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
@import '@/css/_variables.scss';

#osdContainer {
  width: 100%;
  height: 100%;

  .system.overlay {
    z-index: -1
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
    .a9s-annotationlayer {
        z-index: -1;
     }
  }

  &.systems .system.overlay {
    z-index: 5;
    background-color: rgba(57, 6, 238, 0.2);
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
}
</style>
