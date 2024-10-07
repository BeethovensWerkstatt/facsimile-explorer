import { defineStore } from 'pinia'
import store from '@/store'

/**
 * pinia store for diplo trans GUI states
 */
export const useDiploTrans = defineStore('diplotrans', {
  state: () => ({
    /**
     * selections
     * wz 0|1
     * (wl 0|1)
     * facs 0-n
     * diplo 0|1 n?
     * anno 0-n
     *
     * wz=1
     */
    selections: {
      wz: null, // writing zone
      wl: null, // writing layer
      facs: {}, // selected facsimile elements
      diplo: null, // selected diplo trans element
      anno: {} // selected annot trans elements
    }
  }),
  getters: {
    facsLength (state) {
      return Object.keys(state.selections.facs).length
    },
    // proxy essential getters from vuex
    genWzIdForShape: (state) => (wzgroup) => store.getters.genWzIdForShape(wzgroup),
    diploTransActivationsInShapes: (state) => Object.keys(state.selections.facs),
    diploTransActivationsInAnnotTrans: (state) => Object.keys(state.selections.anno),
    activeWritingZone: (state) => state.selections.wz,
    activeDiploTransElementId: (state) => state.selections.diplo,
    contextMenu: (state) => store.getters.contextMenu,
    contextMenuVisible: (state) => store.getters.contextMenuVisible,

    currentWzAtPath: (state) => store.getters.currentWzAtPath,
    currentWzDtPath: (state) => store.getters.currentWzDtPath,
    svgForCurrentPage: (state) => store.getters.svgForCurrentPage,
    annotatedTranscriptForCurrentWz: (state) => store.getters.annotatedTranscriptForCurrentWz,
    diplomaticTranscriptForCurrentWz: (state) => store.getters.diplomaticTranscriptForCurrentWz,

    genDescForCurrentPage: (state) => store.getters.genDescForCurrentPage,
    genDescForCurrentWritingZone: (state) => store.getters.genDescForCurrentWritingZone,
    genDescForCurrentWritingLayer: (state) => store.getters.genDescForCurrentWritingLayer,
    genDescForFinalWritingLayerInCurrentWritingZone: (state) => store.getters.genDescForFinalWritingLayerInCurrentWritingZone,

    currentWzImageUri: (state) => store.getters.currentWzImageUri,
    currentWritingZoneObject: (state) => store.getters.currentWritingZoneObject
  },
  actions: {
    onclick (props) {
      const { click, type, ...payload } = props
      console.log('click', click, type, payload)
      const { genDescWzId } = payload
      switch (type) {
        case 'facsimile':
          {
            console.log('facs click ...')
            const wzactive = this.activeWritingZone && genDescWzId === this.activeWritingZone
            if (wzactive) {
              console.log('wz active')
            }
            // TODO generate context menu
          }
          break
        case 'diploTrans':
          break
        case 'annotTrans':
          break
      }
    },
    selectWZ (wzid) {
      this.wz = wzid
    },
    selectShape ({ id, svgGroupWzId }) {
      console.log('pinia select shape ...')
      const genDescWzId = store.getters.genWzIdForShape(svgGroupWzId)
      if (!this.wz && genDescWzId) {
        this.wz = genDescWzId
      }
      this.selections.facs[id] = svgGroupWzId
      console.log(Object.keys(this.selections.facs))
    }
  }
})
