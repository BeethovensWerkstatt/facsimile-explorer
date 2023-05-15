import { OctokitRepo } from '@/tools/github'
import { Octokit } from '@octokit/rest'
import { Base64 } from 'js-base64'

import config from '@/config.json'

export const GH_ACCESS_TOKEN = 'GH_ACCESS_TOKEN'

const state = {
  user: {},
  auth: '',
  octokit: new Octokit(), // avoid undefined
  fileowner: undefined, // its the owner of the repo!
  filerepo: undefined,
  fileref: undefined,
  commit: undefined,

  sources: [],
  documents: {},
  // TODO rename / move to store.gui?
  filepath: undefined, // path of selected file
  filename: undefined, // name of selected file
  filesha: undefined // sha of selected file ... this is better placed in store.data
}

const getters = {
  gh_user: state => state.user,
  octokit: state => state.octokit,
  isAuthenticated: state => (state.auth && state.user?.login),
  filerepo: state => state.filerepo,
  fileowner: state => state.fileowner,
  fileref: state => state.fileref,
  commit: state => state.commit,
  // TODO following moved to store.data!
  filepath: state => state.filepath,
  filename: state => state.filename,
  filesha: state => state.filesha,
  getPathByName: state => (name) => state.sources.find(s => s.name === name)?.path,
  // getNameByPath: state => (path) => state.sources.find(s => s.path === path)?.name,
  sources: state => state.sources, // TODO we don't need sources *and* documents, sources should receive the 'doc' attribute
  getContentData: state => (path) => state.documents[path]
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
  SET_COMMIT (state, commit) {
    state.commit = commit
  },
  SET_GH_FILE (state, { repo, owner, ref, commit, path, name, sha }) {
    state.filerepo = repo
    state.fileowner = owner
    state.fileref = ref
    state.commit = commit
    state.filepath = path
    state.filename = name
    state.filesha = sha
    // console.log(state.filerepo, state.fileowner, state.fileref, state.filepath, state.filesha)
  },
  SET_SOURCES (state, sources) {
    state.sources = sources
  },
  SET_CONTENT_DATA (state, { repo, owner, ref, path, name, sha, doc }) {
    if (!doc) console.warn(`no document '${path}'`)
    state.documents[path] = { repo, owner, ref, path, name, sha, doc }
  }
}

const actions = {
  authenticate ({ commit, dispatch }, { code, store, remove }) {
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
          dispatch('loadContent', {})
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
      ref = config.repository.branch, // 'dev'
      callback = null // optional callback to call, when loading is finished
    }) {
    let contentData = getters.getContentData(path)
    if (contentData?.doc) {
      dispatch('setData', contentData.doc)
      commit('SET_GH_FILE', contentData)
      console.log(contentData.path, 'loaded from cache')
    } else {
      getters.octokit.repos.getContent({ owner, repo, path, ref }).then(({ data }) => {
        console.log(data.download_url)
        try {
          const dec = new TextDecoder('utf-8')
          const txt = dec.decode(Base64.toUint8Array(data.content))
          const parser = new DOMParser()
          const mei = parser.parseFromString(txt, 'application/xml')
          if (callback) { // TODO if typeof function?
            const data = { xml: mei }
            callback(data)
            callback = null
          }
          const parr = path.split('/')
          dispatch('loadDocumentIntoStore', { path, name: parr[parr.length - 2], dom: mei })

          contentData = { ...data, owner, repo, ref }
          commit('SET_GH_FILE', contentData)
          commit('SET_CONTENT_DATA', { ...contentData, doc: mei })
        } catch (e) { // TODO if typeof function?
          console.error(e.message)
          if (callback) {
            const data = { error: e }
            callback(data)
            callback = null
          }
        }
      })
    }
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
  async createCommit ({ commit, getters }, { message, files, callback, owner = config.repository.owner, repo = config.repository.repo, branch = config.repository.branch }) {
    const octokit = getters.octokit

    // Check with former SHA!!! Conflict resolution!
    // Get the latest commit SHA for the specified branch
    const { data: { object: { sha } } } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`
    })
    console.log(sha, getters.commit)

    // Create a new tree that contains the specified files
    const newTree = await Promise.all(files.map(async ({ path, content }) => {
      // Create a blob for each file
      const { data: { sha: blobSha } } = await octokit.git.createBlob({
        owner,
        repo,
        content,
        encoding: 'base64'
      })
      // console.log('blobSha', blobSha, path)
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
    // console.log('treeSha', newTreeSha)

    // Create a new commit that references the new tree
    const { data: { sha: newCommitSha } } = await octokit.git.createCommit({
      owner,
      repo,
      message,
      tree: newTreeSha,
      parents: [sha]
    })
    // console.log('commitSha', newCommitSha)

    // Update the specified branch to point to the new commit
    await octokit.git.updateRef({
      owner,
      repo,
      ref: `heads/${branch}`,
      sha: newCommitSha
    })
    commit('SET_COMMIT', newCommitSha)

    callback()
  },

  async loadSources ({ commit, dispatch, getters }) {
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
    commit('SET_COMMIT', repo.sha)
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
    // TODO: this is a replacement for the commit above. This is in the data module
    commit('SET_DOCUMENTNAME_PATH_MAPPING', sourcefiles)
    // build a Promise to wait for loading of all sources
    dispatch('setLoading', true)
    const sourcePromises = sourcefiles.map(source => new Promise((resolve, reject) => {
      // loadContent calls (optional) callback, when loading finished
      dispatch('loadContent', { ...source, callback: d => resolve(d) })
    }))
    // finally if any file fails
    Promise.all(sourcePromises).finally(() => {
      dispatch('setLoading', false)
      console.log('all loaded')
    })
    // for (const source of sourcefiles) {
    //   dispatch('loadContent', source)
    // }
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
  },
  getJSON ({ dispatch }, { path, callback }) {
    dispatch('getFile', {
      path,
      callback (f) {
        callback(JSON.parse(f))
      }
    })
  }
}

const module = {
  state, getters, mutations, actions
}

export default module
