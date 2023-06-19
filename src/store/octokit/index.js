import { Octokit } from '@octokit/rest'
// import { createPullRequest } from 'octokit-plugin-create-pull-request'
import { OctokitRepo, base64dom, dom2base64 } from '@/tools/github'

import config from '@/config.json'
import { verifyUnassignedGroupInSvg } from '@/tools/mei.js'

// export const OctokitPR = Octokit.plugin(createPullRequest)

export const GH_ACCESS_TOKEN = 'GH_ACCESS_TOKEN'

const zpad = (o, n = 2, p = '0') => ('' + o).padStart(n, p)
const refdate = (date = new Date()) => date.getFullYear() + zpad(date.getMonth() + 1) + zpad(date.getDate()) + zpad(date.getHours()) + zpad(date.getMinutes()) + zpad(date.getSeconds())

const state = {
  user: {},
  auth: '',
  authenticated: false,
  octokit: new Octokit(),
  fileowner: undefined, // its the owner of the repo!
  filerepo: undefined,
  fileref: undefined,
  commit: undefined,

  sources: [],
  documents: {},
  // TODO rename / move to store.gui?
  filepath: undefined, // path of selected file
  filename: undefined, // name of selected file
  filesha: undefined, // sha of selected file ... this is better placed in store.data

  changes: [],
  commitMessage: null,
  changesNeedBranching: false, // TODO: this needs to be checked in preparation of commit

  commitResults: {
    status: 'uncommitted', // allowed values: 'uncommitted', 'success', 'merged', 'conflicts'
    prUrl: null,
    conflictingUser: null
  }
}

const getters = {
  gh_user: state => state.user,
  octokit: state => state.octokit,
  isAuthenticated: state => state.authenticated, // (state.auth && state.user?.login),
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
  getContentData: state => (path) => state.documents[path],
  loggedChanges: state => state.changes,
  changesNeedBranching: state => state.changesNeedBranching,

  proposedCommitMessage: state => {
    if (state.changes.length === 0) {
      return ''
    }

    const baseMessages = new Map()
    state.changes.forEach(change => {
      if (baseMessages.has(change.baseMessage)) {
        baseMessages.get(change.baseMessage).push(change.param)
      } else {
        baseMessages.set(change.baseMessage, [change.param])
      }
    })
    const out = []

    baseMessages.forEach((params, baseMessage) => {
      const uniqueParams = [...new Set(params)]
      out.push(baseMessage + uniqueParams.join(', '))
    })

    return '[FX] ' + out.join('; ')
  },
  commitMessage: state => state.commitMessage,
  changedFiles: state => {
    const paths = []
    state.changes.forEach(change => {
      paths.push(change.path)
    })
    return [...new Set(paths)]
  },

  commitResults: state => state.commitResults
}

const mutations = {
  SET_AUTHENTICATED (state, authenticated) {
    state.authenticated = authenticated
  },
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
    // console.log('commit', commit)
    state.commit = commit
  },
  SET_GH_FILE (state, { repo, owner, ref, path, name, sha }) {
    state.filerepo = repo
    state.fileowner = owner
    state.fileref = ref
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
  },
  LOG_CHANGE (state, { path, baseMessage, param }) {
    state.changes.push({ path, baseMessage, param })
  },
  EMPTY_CHANGELOG (state) {
    state.changes = []
  },
  SET_COMMIT_MESSAGE (state, message) {
    state.commitMessage = message
  },
  SET_CHANGES_NEED_BRANCHING (state, bool) {
    state.changesNeedBranching = bool
  },
  SET_COMMIT_RESULTS (state, { status, prUrl, conflictingUser }) {
    state.commitResults = { status, prUrl, conflictingUser }
  }
}

const actions = {
  checkAuthenticate ({ commit, getters }, opts) {
    getters.octokit.auth().then(auth => {
      const authenticated = auth.type !== 'unauthenticated'
      // console.log(auth, authenticated)
      commit('SET_AUTHENTICATED', authenticated)
      if (authenticated && opts?.authenticated) opts.authenticated()
    })
  },
  setAccessToken ({ commit, dispatch }, { auth, store, remove }) {
    commit('SET_ACCESS_TOKEN', { auth, store, remove })
    dispatch('checkAuthenticate', { authenticated: () => dispatch('loadSources') })
  },
  authenticate ({ commit, dispatch }, { code, store, remove }) {
    // NGINX has to be configured as a reverse proxy to https://github.com/login/oauth/access_token?code=${code}&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}
    const url = `auth?code=${code}`
    fetch(url).then(resp => {
      if (resp.ok) {
        resp.json().then(data => {
          const accessToken = data.access_token
          // console.log(data, accessToken)
          if (accessToken) {
            dispatch('setAccessToken', { auth: accessToken, store, remove })
          } else {
            console.error('authentication failed', data)
          }
          commit('SET_AUTHENTICATED', true)
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
      path = config.repository.default,
      ref = config.repository.branch, // 'dev'
      callback = null // optional callback to call, when loading is finished
    }) {
    let contentData = getters.getContentData(path)
    if (contentData?.doc) {
      dispatch('setData', contentData.doc)
      commit('SET_GH_FILE', contentData)
      // console.log(contentData.path, 'loaded from cache')
    } else {
      getters.octokit.repos.getContent({ owner, repo, path, ref }).then(({ data }) => {
        // console.log(data.download_url) // , data.content)
        try {
          const mei = base64dom(data.content)
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

  loadSvgFile (
    { commit, dispatch, getters },
    {
      owner = config.repository.owner, // 'BeethovensWerkstatt',
      repo = config.repository.repo, // 'data',
      path,
      ref = config.repository.branch, // 'dev'
      callback = null // optional callback to call, when loading is finished
    }) {
    const contentData = getters.getContentData(path)

    // console.log('\n\nYODIYAY')
    // console.log(contentData)

    if (contentData?.doc) {
      // dispatch('setData', contentData.doc) // TODO set SVG?
      console.log(contentData.path, 'loaded from cache')
    } else {
      getters.octokit.repos.getContent({
        owner,
        repo,
        path,
        ref,
        headers: {
          Accept: 'application/vnd.github.v3.raw'
        }
      }).then(({ data }) => {
        // console.log('received this as svg raw text')
        // console.log(data) // , data.content)
        const svgText = data
        // console.log(svgText)
        const parser = new DOMParser()
        const svg = parser.parseFromString(svgText, 'image/svg+xml')
        // const relativePath = './' + path.split('/').slice(config.root.split('/').length + 1).join('/')
        // console.log(path, relativePath)
        const dom = svg.querySelector('svg')

        const svgWithUnassignedGroup = verifyUnassignedGroupInSvg(dom)

        // console.log(dom)
        dispatch('loadDocumentIntoStore', { path, dom: svgWithUnassignedGroup })
        // dispatch('loadDocumentIntoStore', { path: relativePath, dom: svg })
        if (typeof callback === 'function') {
          const data = { xml: svg }
          callback(data)
          callback = null
        }
      })
    }
  },

  /**
   * commit multiple files in one commit. This isn't called directly, but through prepareGitCommit()
   *
   * @param {string} owner
   * @param {string} repo
   * @param {string} branch
   * @param {string} message
   * @param {{ path, content }[]} files - array of file specs with path and content as base64 encoded string
   *
   * to commit multiple files in one commit, a new commit is created with the given files and with the current head as parent commit.
   */
  async commit2GitHub ({ commit, dispatch, getters }, { message, files, owner = config.repository.owner, repo = config.repository.repo, branch = config.repository.branch }) {
    const octokit = getters.octokit

    // Check with former SHA!!! Conflict resolution!
    // Get the latest commit SHA for the specified branch
    const localSHA = getters.commit
    const { data: { object: { sha: remoteSHA } } } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`
    })
    if (remoteSHA !== localSHA) {
      commit('SET_CHANGES_NEED_BRANCHING', true)
    }
    const targetBranch = branch

    const tmpBranch = 'conflict-' + refdate() + '-' + getters.gh_user.login
    if (getters.changesNeedBranching) {
      console.log(remoteSHA, localSHA, tmpBranch)
      const newBranch = await octokit.request(`POST /repos/${owner}/${repo}/git/refs`, {
        owner,
        repo,
        ref: 'refs/heads/' + tmpBranch,
        sha: localSHA
      })
      branch = tmpBranch
      console.log(newBranch)
    }

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
      base_tree: localSHA,
      tree: newTree
    })
    // console.log('treeSha', newTreeSha)

    // Create a new commit that references the new tree
    const { data: { sha: newCommitSha } } = await octokit.git.createCommit({
      owner,
      repo,
      message,
      tree: newTreeSha,
      parents: [localSHA]
    })
    // console.log('commitSha', newCommitSha)

    // Update the specified branch to point to the new commit
    const ref = await octokit.git.updateRef({
      owner,
      repo,
      ref: `heads/${branch}`,
      sha: newCommitSha
    })
    console.log('updateRef', ref)
    // keep the new commit hash
    commit('SET_COMMIT', newCommitSha)
    dispatch('setCommitResults', { status: 'success', prUrl: null, conflictingUser: null })

    if (getters.changesNeedBranching) {
      // create PR
      const { data } = await octokit.request(`POST /repos/${owner}/${repo}/pulls`, {
        owner,
        repo,
        title: tmpBranch,
        body: message,
        head: tmpBranch,
        base: targetBranch
      })
      // merge PR
      const prUrl = data.html_url
      const prState = data.mergable_state
      const conflictingUser = '@jpvoigt'
      console.log('PR', prUrl, prState)
      const merge = await new Promise((resolve, reject) => {
        try {
          const merge = octokit.request(`PUT /repos/${owner}/${repo}/pulls/${data.number}/merge`, {
            owner,
            repo,
            pull_number: data.number,
            commit_title: 'merge ' + tmpBranch + ' into ' + targetBranch,
            commit_message: message,
            delete_branch_on_merge: true // does this work?
          })
          merge.then(m => resolve(m)).catch(e => {
            console.error(e)
            resolve(null)
          })
        } catch (e) {
          console.error(e)
          resolve(null)
        }
      })
      console.log(merge)
      // merged?
      if (merge?.data.merged) {
        console.log('merged', tmpBranch)
        // TODO: remove PR, temp branch
        dispatch('setCommitResults', { status: 'merged', prUrl: null, conflictingUser: null })
      } else {
        console.warn('merge failed!')
        dispatch('setCommitResults', { status: 'conflicts', prUrl, conflictingUser })
      }
    }

    commit('SET_COMMIT_MESSAGE', null)
    commit('EMPTY_CHANGELOG')
    commit('SET_CHANGES_NEED_BRANCHING', false)
  },

  /**
   * This is called whenever a file is changed
   * @param  {[type]} commit                    [description]
   * @param  {[type]} path                      [description]
   * @param  {[type]} baseMessage               [description]
   * @param  {[type]} param                     [description]
   * @return {[type]}             [description]
   */
  logChange ({ commit }, { path, baseMessage, param }) {
    commit('LOG_CHANGE', { path, baseMessage, param })
  },

  /**
   * prepareGitCommit will be triggered when the commit button is clicked.
   * It collects the proper commit message and takes care of all preparations.
   * @param  {[type]} commit                 [description]
   * @param  {[type]} dispatch               [description]
   * @param  {[type]} getters                [description]
   * @return {[type]}          [description]
   */
  prepareGitCommit ({ commit, dispatch, getters }) {
    const files = []
    const baseMessages = []
    getters.loggedChanges.forEach(change => {
      const path = change.path

      if (baseMessages.indexOf(change.baseMessage) === -1) {
        baseMessages.push(change.baseMessage)
      }

      // TODO: brauchen wir dafür rootgetters? Das ist aus dem data-module…
      const dom = getters.documentByPath(path)
      const content = dom2base64(dom)

      files.push({ path, content })
    })

    const message = getters.commitMessage !== null ? getters.commitMessage : getters.proposedCommitMessage

    dispatch('commit2GitHub', { message, files })
  },

  setCommitMessage ({ commit }, message) {
    commit('SET_COMMIT_MESSAGE', message)
  },

  setCommitResults ({ commit }, { status, prUrl, conflictingUser }) {
    if (['uncommitted', 'success', 'merged', 'conflicts'].indexOf(status) === -1) {
      console.error('Unknown status for commit results: ' + status)
      return false
    }
    const url = typeof prUrl === 'string' ? prUrl : null
    const user = typeof conflictingUser === 'string' ? conflictingUser : null

    commit('SET_COMMIT_RESULTS', { status, prUrl: url, conflictingUser: user })
  },

  async loadSources ({ commit, dispatch, getters }) {
    const repometa = {
      octokit: getters.octokit,
      owner: config.repository.owner,
      repo: config.repository.repo,
      branch: config.repository.branch
    }
    // console.log(repometa)
    dispatch('setLoading', true)
    const sourcefiles = []
    const repo = new OctokitRepo(repometa)
    const root = await repo.folder
    commit('SET_COMMIT', repo.sha)
    console.log('commit', getters.commit)
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
    const sourcePromises = sourcefiles.map(source => new Promise((resolve, reject) => {
      // loadContent calls (optional) callback, when loading finished
      dispatch('loadContent', { ...source, callback: d => resolve(d) })
    }))
    // finally if any file fails
    Promise.all(sourcePromises).finally(() => {
      dispatch('setLoading', false)
      console.log('all loaded')
      commit('SET_GH_FILE', {})
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
