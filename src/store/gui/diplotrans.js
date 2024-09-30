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
    }
  },
  actions: {
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
