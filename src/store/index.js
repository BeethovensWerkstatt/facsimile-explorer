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
    },
    getTestData ({ commit }) {
      fetch('testfile.xml')
        .then(res => {
          return res.text()
        })
        .then(xml => {
          console.log('got xml')
          commit('SET_XML_CODE', xml)
        })
    }
  },
  getters: {
    xmlCode: state => {
      return state.xmlCode
    }
  }
})
