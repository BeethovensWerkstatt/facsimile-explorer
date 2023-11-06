const configModule = {
  state: {
    config: {}
  },
  mutations: {
    SET_CONFIG (state, config) {
      state.config = config
    }
  },
  actions: {
    set_config ({ commit }, config) {
      commit('SET_CONFIG', config)
    }
  },
  getters: {
    config (state) {
      return state.config
    }
  }
}

export default configModule
