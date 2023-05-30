<template>
  <div id="osdContainer" :class="currentTab">

  </div>
</template>

<script>
import OpenSeadragon from 'openseadragon'
import * as Annotorious from '@recogito/annotorious-openseadragon'
import '@recogito/annotorious-openseadragon/dist/annotorious.min.css'

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

export default {
  name: 'OpenSeadragonComponent',
  props: {
    svg: Boolean,
    annotorious: Boolean
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
      if (this.viewer === undefined) {
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

        const svgClone = svg.cloneNode(true)
        this.viewer.addOverlay({
          element: svgClone,
          x: 0,
          y: 0,
          width: page.width,
          height: page.height
        })

        const writingZonesOnCurrentPage = this.$store.getters.writingZonesOnCurrentPage
        const activeWritingZone = this.$store.getters.activeWritingZone

        const activeZone = writingZonesOnCurrentPage.find(wz => wz.id === activeWritingZone)

        if (activeZone) {
          svgClone.querySelector('#' + activeZone.svgGroupWzId).classList.add('activeWritingZone')
        }

        // console.log('done')
        svgClone.addEventListener('click', this.svgClickListener)
        svgClone.addEventListener('dblclick', this.svgDoubleClickListener)
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
      if (!this.annotorious) {
        return false
      }

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

      this.viewer.addOverlay({
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
      // const osdPage = this.$store.getters.pageArrayOSD[n]
      // console.log('osdPage', osdPage)
      this.viewer.open(this.$store.getters.pageArrayOSD, n)
    } catch (err) {
      console.warn('WARNING: Unable to init OSD yet…')
    }

    if (this.annotorios) {
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

      console.log('calling handler page, data.page ', data.page)

      if (data.page !== this.$store.getters.currentPageZeroBased) {
        console.log('going in')
        this.$store.dispatch('setCurrentPage', data.page)
        this.renderSystems()
        this.renderShapes()
      }
    })

    this.unwatchCurrentPage = this.$store.watch((state, getters) => getters.currentPageZeroBased,
      (newPage, oldPage) => {
        console.log('watchCurrentPage listener, calling goToPage(' + newPage + ')')
        this.viewer.goToPage(newPage)
        this.renderSystems()
        this.renderShapes()
      })
    this.unwatchPages = this.$store.watch((state, getters) => getters.pageArray,
      (newArr, oldArr) => {
        const page = this.$route.query.page
        // console.log('open', newArr)
        this.viewer.open(newArr, page ? +page - 1 : 0)
        this.$store.dispatch('setCurrentPage', page ? +page - 1 : 0)
        this.renderSystems()
        this.renderShapes()
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
        // console.log('RENDER NOW')
        this.renderVerovioOverlay()
      })
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

  .activeWritingZone path {
    fill: $svgActiveWritingZoneColor;
    stroke: $svgActiveWritingZoneColor;
  }
}
</style>
