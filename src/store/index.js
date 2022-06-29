import { createStore } from 'vuex'

export default createStore({
  modules: {
  },
  state: {
    xmlCode: ''
  },
  mutations: {
    SET_XML_CODE (state, val) {
      state.xmlCode = val
    }
  },
  actions: {
    setXmlCode ({ commit }, val) {
      commit('SET_XML_CODE', val)
    }
  },
  getters: {
    xmlCode: state => {
      return state.xmlCode
    }
  }
})
