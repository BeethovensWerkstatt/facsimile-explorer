import { OctokitRepo } from '@/tools/github'
import { Octokit } from '@octokit/rest'
import { Base64 } from 'js-base64'

import config from '@/config.json'

export const GH_ACCESS_TOKEN = 'GH_ACCESS_TOKEN'

const state = {
  user: {},
  auth: '',
  octokit: new Octokit(),
  fileowner: undefined,
  filerepo: undefined,
  fileref: undefined,

  sources: [],

  filepath: undefined,
  filesha: undefined
}
const getters = {
  gh_user: state => state.user,
  octokit: state => state.octokit,
  isAuthenticated: state => (state.auth && state.user?.login),
  filerepo: state => state.filerepo,
  fileowner: state => state.fileowner,
  fileref: state => state.fileref,
  filepath: state => state.filepath,
  filesha: state => state.filesha,
  sources: state => state.sources
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
  },
  SET_SOURCES (state, sources) {
    state.sources = sources
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
      owner = config.repository.owner, // 'BeethovensWerkstatt',
      repo = config.repository.repo, // 'data',
      path = 'data/sources/Notirungsbuch K/Notirungsbuch_K.xml',
      ref = config.repository.branch // 'dev'
    }) {
    getters.octokit.repos.getContent({ owner, repo, path, ref }).then(({ data }) => {
      console.log(data.download_url)
      const dec = new TextDecoder('utf-8')
      const txt = dec.decode(Base64.toUint8Array(data.content))
      const parser = new DOMParser()
      const mei = parser.parseFromString(txt, 'application/xml')
      dispatch('setData', mei)
      commit('SET_GH_FILE', { ...data, owner, repo, ref })
    })
  },
  saveContent ({ state, getters }, opts) {
    const mei = getters.xmlDocumentCode()
    console.log(mei)
    // console.log(state.filerepo, state.fileowner, state.fileref, state.filepath, state.filesha)
    const enc = new TextEncoder('utf-8')
    const content = Base64.fromUint8Array(enc.encode(mei))
    const message = opts?.message || `updated '${state.filepath}'`
    const commit = {
      owner: state.fileowner,
      repo: state.filerepo,
      path: state.filepath,
      sha: state.filesha,
      branch: state.fileref,
      message,
      content
    }
    console.log(commit)
    if (typeof opts?.callback === 'function') {
      opts.callback()
    }
    /*
    getters.octokit.repos.createOrUpdateFileContents(commit).then(({ data }) => {
      console.log(data)
      commit('SET_GH_FILE', { ...data, owner: state.fileowner, repo: state.filerepo, ref: state.fileref })
    })
    */
  },
  /**
   * commit multiple files in one commit
   *
   * @param {string} owner
   * @param {string} repo
   * @param {string} branch
   * @param {string} message
   * @param {{ path, content }[]} files - array of file specs with path and content as base64 encoded string
   *
   * to commit multiple files in one commit, a new commit is created with the given files and with the current head as parent commit.
   */
  async createCommit ({ getters }, { owner, repo, branch, message, files }) {
    const octokit = getters.octokit

    // Get the latest commit SHA for the specified branch
    const { data: { object: { sha } } } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`
    })

    // Create a new tree that contains the specified files
    const newTree = await Promise.all(files.map(async ({ path, content }) => {
      // Create a blob for each file
      const { data: { sha: blobSha } } = await octokit.git.createBlob({
        owner,
        repo,
        content,
        encoding: 'base64'
      })

      // Return the path and blob SHA for each file
      return {
        path,
        mode: '100644',
        type: 'blob',
        sha: blobSha
      }
    }))

    // Create a new tree that references the new blobs
    const { data: { sha: newTreeSha } } = await octokit.git.createTree({
      owner,
      repo,
      base_tree: sha,
      tree: newTree
    })

    // Create a new commit that references the new tree
    const { data: { sha: newCommitSha } } = await octokit.git.createCommit({
      owner,
      repo,
      message,
      tree: newTreeSha,
      parents: [sha]
    })

    // Update the specified branch to point to the new commit
    await octokit.git.updateRef({
      owner,
      repo,
      ref: `heads/${branch}`,
      sha: newCommitSha
    })
  },

  async loadSources ({ commit, getters }) {
    const repometa = {
      octokit: getters.octokit,
      owner: config.repository.owner,
      repo: config.repository.repo,
      branch: config.repository.branch
    }
    // console.log(repometa)
    const sourcefiles = []

    const repo = new OctokitRepo(repometa)
    const root = await repo.folder
    const folder = await root.getFile(config.root)
    const sources = await folder.folder
    for (const source of sources) {
      if (source.type === 'dir' || source.type === 'tree') {
        const srcfiles = await source.folder
        for (const srcfile of srcfiles) {
          if (srcfile.name.endsWith('.xml')) {
            console.log(srcfile.path)
            sourcefiles.push({ name: source.name, path: srcfile.path })
          }
        }
      }
    }
    commit('SET_SOURCES', sourcefiles)
  },

  async getFile ({ getters }, { path, callback }) {
    const repometa = {
      octokit: getters.octokit,
      owner: config.repository.owner,
      repo: config.repository.repo,
      branch: config.repository.branch
    }
    const repo = new OctokitRepo(repometa)
    const root = await repo.folder
    root.getFile(path).then(file => callback(file))
  },
  getXML ({ dispatch }, { path, callback }) {
    dispatch('getFile', {
      path,
      callback (f) {
        const parser = new DOMParser()
        callback(parser.parseFromString(f))
      }
    })
  }
}

const module = {
  state, getters, mutations, actions
}

export default module
