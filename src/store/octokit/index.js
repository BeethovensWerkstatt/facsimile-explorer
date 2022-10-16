import { Octokit } from '@octokit/rest'
import { Base64 } from 'js-base64'

export const GH_ACCESS_TOKEN = 'GH_ACCESS_TOKEN'

const state = {
  user: {},
  auth: '',
  octokit: new Octokit(),
  filerepo: undefined,
  fileowner: undefined,
  fileref: undefined,
  filepath: undefined,
  filesha: undefined
}
const getters = {
  gh_user: state => state.user,
  octokit: state => state.octokit,
  isAuthenticated: state => (state.auth && state.user?.login)
}
const mutations = {
  SET_ACCESS_TOKEN (state, { auth, store, remove }) {
    state.auth = auth
    console.log('set access token', state.auth)
    try {
      state.octokit = new Octokit({
        auth: state.auth,
        userAgent: 'facsimile-explorer/v0.0.1'
      })
      if (state.auth) {
        state.octokit.users.getAuthenticated().then(({ data }) => {
          state.user = data
          if (store) store(state.auth)
        })
      } else {
        state.user = {}
        if (remove) remove()
      }
    } catch (err) {
      console.error('authentication failed!')
      state.auth = ''
      state.user = {}
      if (remove) remove()
    }
  },
  SET_GH_FILE (state, { repo, owner, ref, path, sha }) {
    state.filerepo = repo
    state.fileowner = owner
    state.fileref = ref
    state.filepath = path
    state.filesha = sha
    console.log(state.filerepo, state.fileowner, state.fileref, state.filepath, state.filesha)
  }
}
const actions = {
  authenticate ({ commit }, { code, store, remove }) {
    // NGINX has to be configured as a reverse proxy to https://github.com/login/oauth/access_token?code=${code}&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}
    const url = `auth?code=${code}`
    fetch(url).then(resp => {
      if (resp.ok) {
        resp.json().then(data => {
          const accessToken = data.access_token
          // console.log(data, accessToken)
          if (accessToken) {
            commit('SET_ACCESS_TOKEN', { auth: accessToken, store, remove })
          } else {
            console.error('authentication failed', data)
          }
        })
      } else {
        console.error('authentication failed', resp.statusText)
      }
    })
  },
  logout ({ commit }, { remove }) {
    commit('SET_ACCESS_TOKEN', { auth: '', remove })
  },
  // TODO select owner, repo, path, branch (ref)
  loadContent (
    { commit, dispatch, getters },
    {
      owner = 'BeethovensWerkstatt',
      repo = 'data',
      path = 'data/sources/Notirungsbuch K/Notirungsbuch_K.xml',
      ref = 'dev'
    }) {
    getters.octokit.repos.getContent({ owner, repo, path, ref }).then(({ data }) => {
      const dec = new TextDecoder('utf-8')
      const txt = dec.decode(Base64.toUint8Array(data.content))
      const parser = new DOMParser()
      const mei = parser.parseFromString(txt, 'application/xml')
      dispatch('setData', mei)
      commit('SET_GH_FILE', { ...data, owner, repo, ref })
    })
  },
  saveContent ({ state, getters }) {
    const mei = getters.xmlDocumentCode
    console.log(mei)
    console.log(state.filerepo, state.fileowner, state.fileref, state.filepath, state.filesha)
  }
}

const module = {
  state, getters, mutations, actions
}

export default module
