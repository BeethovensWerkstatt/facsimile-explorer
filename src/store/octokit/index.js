import { Octokit } from '@octokit/rest'

const state = {
  user: {},
  auth: '',
  octokit: new Octokit()
}
const getters = {}
const mutations = {
  SET_ACCESS_TOKEN (state, auth) {
    state.auth = auth
    console.log(state.auth)
    try {
      state.octokit = new Octokit({ auth: state.auth })
      state.octokit.users.getAuthenticated().then(({ data }) => {
        state.user = data
        return false
      })
    } catch (err) {
      console.error(err)
    }
  }
}
const actions = {
  authenticate ({ commit }, code) {
    const url = `auth?code=${code}`
    fetch(url).then(resp => resp.json().then(data => {
      const accessToken = data.access_token
      console.log(data, accessToken)
      if (accessToken) {
        commit('SET_ACCESS_TOKEN', accessToken)
      } else {
        console.error(data)
      }
    }))
  }
}

const module = {
  state, getters, mutations, actions
}

export default module
