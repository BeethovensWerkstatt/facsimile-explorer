import { defineStore } from 'pinia'
import store from '@/store'

export const useDiploTrans = defineStore('diplotrans', {
  state: () => ({
    selections: {
      wz: null,
      facs: {},
      diplo: {},
      anno: {}
    }
  }),
  getters: {
    facsLength (state) {
      return Object.keys(state.selections.facs).length
    },
    // proxy essential getters from vuex
    genWzIdForShape: (state) => (wzgroup) => store.getters.genWzIdForShape(wzgroup),
    diploTransActivationsInShapes: (state) => store.getters.diploTransActivationsInShapes,
    diploTransActivationsInAnnotTrans: (state) => store.getters.diploTransActivationsInAnnotTrans,
    diploTransSelectedId: (state) => store.getters.diploTransSelectedId,
    activeWritingZone: (state) => store.getters.activeWritingZone,
    activeDiploTransElementId: (state) => store.getters.activeDiploTransElementId,
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
      if (type === 'facsimile') {
        const { genDescWzId } = payload
        console.log('facs click', genDescWzId, this.activeWritingZone)
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
