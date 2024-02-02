import { Octokit } from '@octokit/rest'
// import { createPullRequest } from 'octokit-plugin-create-pull-request'
import { OctokitRepo, base64dom, dom2base64 } from '@/tools/github'
// import { Base64 } from 'js-base64'

// import config from '@/config.json'
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
  committing: false,

  sources: [],
  availableAnnotatedTranscripts: [],
  availableDiplomaticTranscripts: [],
  documents: {},
  // TODO rename / move to store.gui?
  filepath: undefined, // path of selected file
  filename: undefined, // name of selected file
  filesha: undefined, // sha of selected file ... this is better placed in store.data

  changes: [],
  commitMessage: null,
  changesNeedBranching: false,

  commitResults: {
    status: 'uncommitted', // allowed values: 'uncommitted', 'success', 'merged', 'conflicts'
    prUrl: null,
    conflictingUser: null
  }
}

const getters = {
  // TODO use OctokitRepo for GH access
  gh_user: state => state.user,
  octokit: state => state.octokit,
  isAuthenticated: state => state.authenticated, // (state.auth && state.user?.login),
  filerepo: state => state.filerepo,
  fileowner: state => state.fileowner,
  fileref: state => state.fileref,
  commit: state => state.commit,
  committing: state => state.committing,
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

  availableAnnotatedTranscripts: state => state.availableAnnotatedTranscripts,
  availableDiplomaticTranscripts: state => state.availableDiplomaticTranscripts,
  // getCommit: (state, getters) => (sha) => getters.octokit.

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
        userAgent: 'facsimile-explorer/v0.0.2',
        log: console.debug
      })
      console.log(31, state.octokit)
      if (state.auth) {
        state.octokit.users.getAuthenticated().then(({ data }) => {
          state.user = data
          if (store) store(state.auth)
        }).catch(e => {
          console.log('token invalid', state.auth)
          state.auth = ''
          state.user = {}
          if (remove) remove()
        })
      } else {
        state.user = {}
        if (remove) remove()
      }
      console.log(32)
    } catch (err) {
      console.error('authentication failed!', err)
      state.auth = ''
      state.user = {}
      if (remove) remove()
    }
  },

  SET_COMMIT (state, commit) {
    console.log('set commit', state.commit?.sha, '->', commit?.sha)
    if (!commit.tree?.sha) console.warn('incomplete commit', commit)
    state.commit = commit
  },
  SET_COMMITTING (state, committing) {
    state.committing = committing
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
  SET_AVAILABLE_ANNOTATED_TRANSCRIPTS (state, annotatedTranscripts) {
    state.availableAnnotatedTranscripts = annotatedTranscripts
  },
  SET_AVAILABLE_DIPLOMATIC_TRANSCRIPTS (state, diplomaticTranscripts) {
    state.availableDiplomaticTranscripts = diplomaticTranscripts
  },
  ADD_AVAILABLE_DIPLOMATIC_TRANSCRIPT (state, diplomaticTranscript) {
    if (state.availableDiplomaticTranscripts.indexOf(diplomaticTranscript) === -1) {
      state.availableDiplomaticTranscripts.push(diplomaticTranscript)
    }
  },
  SET_CONTENT_DATA (state, { repo, owner, ref, path, name, sha, doc }) {
    if (!doc) console.warn(`no document '${path}'`)
    state.documents[path] = { repo, owner, ref, path, name, sha, doc }
  },
  LOG_CHANGE (state, { path, baseMessage, param, xmlIDs, isNewDocument }) {
    state.changes.push({ path, baseMessage, param, xmlIDs, isNewDocument })
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
    const config = getters.config
    getters.octokit.auth().then(auth => {
      const authenticated = auth.type !== 'unauthenticated'
      // console.log(auth, authenticated)
      commit('SET_AUTHENTICATED', authenticated)
      if (authenticated) {
        if (opts?.authenticated) {
          opts.authenticated()
        }
        const repository = {
          owner: opts?.repository?.owner || config.repository.owner,
          repo: opts?.repository?.repo || config.repository.repo,
          ref: `heads/${opts?.repository?.branch || config.repository.branch}`
        }
        getters.octokit.git.getRef({
          ...repository,
          headers: {
            'If-None-Match': ''
          },
          request: {
            cache: 'reload'
          }
        }).then(({ data: { object: refObject } }) => {
          // console.log('R', refObject)
          fetch(refObject.url, {
            headers: {
              'If-None-Match': ''
            },
            request: {
              cache: 'reload'
            }
          }).then(res => res.json()).then(json => {
            // console.log('A', repository, json)
            commit('SET_COMMIT', json)
          })
        }).catch(e => {
          console.warn('not authenicated!')
        })
      }
    }).catch(e => {
      console.warn('not authenticated!')
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
          console.log('23', data, accessToken)
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
  loadContent (
    { commit, dispatch, getters },
    {
      owner = getters.config.repository.owner, // 'BeethovensWerkstatt',
      repo = getters.config.repository.repo, // 'data',
      path = getters.config.repository.default,
      ref = getters.config.repository.branch, // 'dev'
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
          const name = parr[parr.length - 2]
          dispatch('loadDocumentIntoStore', { path, name, dom: mei })

          contentData = { ...data, owner, repo, ref }
          if (!getters.awaitedDocument) {
            commit('SET_GH_FILE', contentData)
            commit('SET_CONTENT_DATA', { ...contentData, doc: mei })
          } else {
            // console.log('skipping to set-gh-file for ' + contentData.name + ' while waiting for ' + getters.awaitedDocument)
          }
        } catch (e) { // TODO if typeof function?
          console.error(e.message)
          console.error(e)
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
      owner = getters.config.repository.owner, // 'BeethovensWerkstatt',
      repo = getters.config.repository.repo, // 'data',
      path,
      ref = getters.config.repository.branch, // 'dev'
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
        const dom = svg // .querySelector('svg')

        const svgWithUnassignedGroup = verifyUnassignedGroupInSvg(dom)

        // console.log(dom)
        dispatch('loadDocumentIntoStore', { path, dom: svgWithUnassignedGroup })
        // dispatch('loadDocumentIntoStore', { path: relativePath, dom: svg })
        if (typeof callback === 'function') {
          const data = { xml: svg, dom }
          callback(data)
          callback = null
        }
      })
    }
  },

  loadAnnotatedTranscript (
    { commit, dispatch, getters },
    {
      owner = getters.config.repository.owner, // 'BeethovensWerkstatt',
      repo = getters.config.repository.repo, // 'data',
      path,
      ref = getters.config.repository.branch, // 'dev'
      callback = null // optional callback to call, when loading is finished
    }) {
    const contentData = getters.getContentData(path)

    console.log('\n\nYODIYAY loadAnnotatedTranscript')
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
        console.warn('received this as svg raw text, which is wrong media type!!!')
        // console.log(data) // , data.content)
        const svgText = data
        // console.log(svgText)
        const parser = new DOMParser()
        const mei = parser.parseFromString(svgText, 'image/svg+xml')
        // const relativePath = './' + path.split('/').slice(config.root.split('/').length + 1).join('/')
        // console.log(path, relativePath)
        const dom = mei // .querySelector('svg')

        // console.log(dom)
        dispatch('loadDocumentIntoStore', { path, dom })
        // dispatch('loadDocumentIntoStore', { path: relativePath, dom: svg })
        if (typeof callback === 'function') {
          const data = { xml: mei, dom }
          callback(data)
          callback = null
        }
      })
    }
  },

  loadXmlFile (
    { commit, dispatch, getters },
    {
      owner = getters.config.repository.owner, // 'BeethovensWerkstatt',
      repo = getters.config.repository.repo, // 'data',
      path,
      ref = getters.config.repository.branch, // 'dev'
      callback = null // optional callback to call, when loading is finished
    }) {
    const contentData = getters.getContentData(path)

    // console.log('\n\nYODIYAY')
    // console.log(contentData)

    if (contentData?.doc) {
      // dispatch('setData', contentData.doc) // TODO set SVG?
      console.log(contentData, 'loaded from cache')
      if (typeof callback === 'function') {
        const serializer = new XMLSerializer()
        const dom = contentData.doc
        const xml = serializer.serializeToString(dom)
        if (typeof callback === 'function') {
          const data = { xml, dom }
          callback(data)
          callback = null
        }
      }
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
        const xml = data
        // console.log(xmlText)
        const parser = new DOMParser()
        const dom = parser.parseFromString(xml, 'application/xml')
        // const selNoID = rawMEISelectables.map(elem => '.' + elem + ':not([id])').join(', ')
        // const selNoID = rawMEISelectables.join(', ')
        // console.log(selNoID, dom.querySelectorAll(selNoID))

        // console.log(dom)
        dispatch('loadDocumentIntoStore', { path, dom })
        // dispatch('loadDocumentIntoStore', { path: relativePath, dom: svg })
        if (typeof callback === 'function') {
          const data = { xml, dom }
          callback(data)
          callback = null
        }
      }).catch(error => {
        console.warn(error, path + ' not found!')
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
  async commit2GitHub ({ commit, dispatch, getters }, { message, files, owner = getters.config.repository.owner, repo = getters.config.repository.repo, branch = getters.config.repository.branch }) {
    const octoRepo = new OctokitRepo({ owner, repo, branch })
    const octokit = getters.octokit

    // start loading icon ...
    commit('SET_COMMITTING', true)

    try {
      // Create a new tree that contains the specified files
      console.log('commit 2 GitHub: create blobs ...')
      const newTree = await Promise.all(files.map(async ({ path, content }) => {
        // Create a blob for each file
        console.log(`commit 2 GitHub: create blob "${path}"`, content)
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

      // Check with former SHA!!! Conflict resolution!
      // Get the latest commit SHA for the specified branch
      const localSHA = getters.commit.sha
      const localTree = getters.commit.tree.sha

      console.log('commit 2 GitHub: create tree ...', localSHA, localTree)

      // Create a new tree that references the new blobs
      const { data: { sha: newTreeSha } } = await octokit.git.createTree({
        owner,
        repo,
        base_tree: localTree,
        tree: newTree
      })
      // console.log('treeSha', newTreeSha)

      console.log('commit 2 GitHub: create commit ...')

      // Create a new commit that references the new tree
      const { data: newCommit } = await octokit.git.createCommit({
        owner,
        repo,
        message,
        tree: newTreeSha,
        parents: [localSHA]
      })
      console.log('commit 2 GitHub: new commitSha', newCommit.sha)

      console.log('commit 2 GitHub: get ref ...')

      const remoteCommit = await octoRepo.getLastCommit()
      console.log('commit 2 GitHub: current commmit', getters.commit, remoteCommit)
      const { sha: remoteSHA, url: headURL } = remoteCommit
      commit('SET_CHANGES_NEED_BRANCHING', remoteSHA !== localSHA)

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
        console.log('commit 2 GitHub: created', newBranch)
      }

      // Update the specified branch to point to the new commit
      console.log('commit 2 GitHub: update "' + branch + '" ...')
      const ref = await octokit.git.updateRef({
        owner,
        repo,
        ref: `heads/${branch}`,
        sha: newCommit.sha
      })
      console.log('commit 2 GitHub: updateRef "' + branch + '" to ', ref)

      if (!getters.changesNeedBranching) { // direct commit
        console.log('committed')
        commit('SET_COMMIT', newCommit)
        dispatch('setCommitResults', { status: 'success', prUrl: null, conflictingUser: null })
      } else {
        // create PR
        console.log('commit 2 GitHub: create PR ...')
        const { data } = await octokit.request(`POST /repos/${owner}/${repo}/pulls`, {
          owner,
          repo,
          title: tmpBranch,
          body: message,
          head: tmpBranch,
          base: targetBranch,
          delete_branch_on_merge: true
        })
        // merge PR
        const prUrl = data.html_url
        const merge = await new Promise((resolve, reject) => {
          try {
            console.log('commit 2 GitHub: merge PR ...')
            const merge = octokit.request(`PUT /repos/${owner}/${repo}/pulls/${data.number}/merge`, {
              owner,
              repo,
              pull_number: data.number,
              commit_title: 'merge ' + tmpBranch + ' into ' + targetBranch,
              commit_message: message,
              delete_branch_on_merge: true // does this work?
            })
            merge.then(m => {
              console.log('merge', m)
              resolve(m)
            }).catch(e => {
              console.warn(e)
              resolve(null)
            })
          } catch (e) {
            console.error(e)
            resolve(null)
          }
        })
        console.log('commit 2 GitHub: merge result', merge)
        // merged?
        if (merge?.data.merged) {
          console.log('merged', tmpBranch)
          dispatch('setCommitResults', { status: 'merged', prUrl: null, conflictingUser: null })
          dispatch('deleteBranch', { ref: tmpBranch })

          const finalCommit = await octoRepo.getLastCommit(targetBranch)
          // console.log(targetBranch, finalCommit)
          commit('SET_COMMIT', finalCommit)
          // TODO reload data
          // dispatch('loadSources')
          files.forEach(({ path }) => {
            // console.log('reload', path)
            octokit.repos.getContent({
              owner,
              repo,
              ref: targetBranch,
              path,
              headers: {
                'If-None-Match': '',
                Accept: 'application/vnd.github.v3.raw'
              },
              request: {
                cache: 'reload'
              }
            }).then(({ data: content }) => {
              // const dec = new TextDecoder('utf-8')
              // const content = dec.decode(Base64.toUint8Array(data.content))
              // console.log(path, content.substring(0, 50))
              const parser = new DOMParser()
              const type = path.endsWith('.svg') ? 'image/svg+xml' : 'application/xml'
              const dom = parser.parseFromString(content, type)
              dispatch('loadDocumentIntoStore', { path, dom })
            }).catch(error => console.error(error))
          })
        } else {
          console.warn('merge failed!', prUrl)
          fetch(headURL).then(res => res.json()).then(json => dispatch('setCommitResults', { status: 'conflicts', prUrl, conflictingUser: json.author.name }))
        }
      }
    } finally {
      commit('SET_COMMITTING', false)
      // TODO what/when clear commit results
      commit('SET_COMMIT_MESSAGE', null)
      commit('EMPTY_CHANGELOG')
      commit('SET_CHANGES_NEED_BRANCHING', false)
    }
  },

  deleteBranch ({ getters }, { ref, owner = getters.config.repository.owner, repo = getters.config.repository.repo }) {
    // console.log('commit 2 GitHub: delete branch', ref)
    const octokit = getters.octokit
    octokit.request(`DELETE /repos/${owner}/${repo}/git/refs/heads/${ref}`, {
      owner,
      repo,
      ref,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }).then(res => console.log(res))
  },

  /**
   * This is called whenever a file is changed
   * @param  {[type]} commit                    [description]
   * @param  {[type]} path                      [description]
   * @param  {[type]} baseMessage               [description]
   * @param  {[type]} param                     [description]
   * @return {[type]}             [description]
   */
  logChange ({ commit }, { path, baseMessage, param, xmlIDs = [], isNewDocument = false }) {
    commit('LOG_CHANGE', { path, baseMessage, param, xmlIDs, isNewDocument })
  },

  /**
   * prepareGitCommit will be triggered when the commit button is clicked.
   * It collects the proper commit message and takes care of all preparations.
   * @param  {[type]} commit                 [description]
   * @param  {[type]} dispatch               [description]
   * @param  {[type]} getters                [description]
   * @return {[type]}          [description]
   */
  async prepareGitCommit ({ commit, dispatch, getters }, param) {
    // console.log('prepareGitCommit ...', getters.loggedChanges)
    const { owner = getters.config.repository.owner, repo = getters.config.repository.repo, branch = getters.config.repository.branch } = param || {}
    commit('SET_COMMITTING', true)

    const fileStore = {}
    const files = []
    const baseMessages = []
    getters.loggedChanges.forEach(change => {
      const path = change.path

      if (baseMessages.indexOf(change.baseMessage) === -1) {
        baseMessages.push(change.baseMessage)
      }

      const fileChange = fileStore[path] ? fileStore[path] : { xmlIDs: [], isNewDocument: true }
      fileStore[path] = { ...fileChange, xmlIDs: [...fileChange.xmlIDs, ...change.xmlIDs], isNewDocument: fileChange.isNewDocument && change.isNewDocument }
    })
    for (const path in fileStore) {
      const xmlIDs = fileStore[path].xmlIDs
      const isNewDocument = fileStore[path].isNewDocument
      const dom = getters.documentByPath(path)
      const finalDOM = isNewDocument
        ? dom
        : await new Promise((resolve, reject) => {
          getters.octokit.repos.getContent({
            owner,
            repo,
            ref: `heads/${branch}`,
            path,
            headers: {
              'If-None-Match': '',
              Accept: 'application/vnd.github.v3.raw'
            },
            request: {
              cache: 'reload'
            }
          }).then(({ data: content }) => {
            const parser = new DOMParser()
            // console.log('content', path, content)
            const dom = parser.parseFromString(content, path.endsWith('svg') ? 'image/svg+xml' : 'application/xml')
            // console.log('remote', path, dom)
            resolve(dom)
          }).catch(error => reject(error))
        })

      if (!isNewDocument) {
        for (const id of xmlIDs) {
          // TODO some documents are XMLDocuments, some (SVG) are Node trees ... make consistent!

          // const parser = new DOMParser() // one way to make sure you have an XMLDocument
          // const serializer = new XMLSerializer()
          // const localCopy = parser.parseFromString(serializer.serializeToString(dom), path.endsWith('svg') ? 'image/svg+xml' : 'application/xml')

          // check if dom is of type XMLDocument
          const localDOM = dom.documentElement
            ? dom
            : (() => {
                const doc = document.implementation.createDocument(null, dom.localName)
                doc.documentElement.replaceWith(dom)
                return doc
              })()
          const localNode = localDOM.querySelector(`*[*|id="${id}"]`)?.cloneNode(true) // querySelector() only works consistently on XMLDocument!
          // ... the same applys for querySelectorAll()!
          // const localNode = [...dom.querySelectorAll('*')].find(n => n.getAttribute('id') === id || n.getAttribute('xml:id') === id)?.cloneNode(true)
          const remoteNode = finalDOM.querySelector(`*[*|id="${id}"]`)
          if (localNode && remoteNode) {
            remoteNode.replaceWith(localNode)
          } else {
            console.warn('node not found:', path, id, localNode || dom, remoteNode || finalDOM)
          }
        }
        // console.log(path, 'finalDOM', finalDOM)
        dispatch('loadDocumentIntoStore', { path, dom: finalDOM })
      }

      const content = dom2base64(finalDOM)
      files.push({ path, content })
    }

    const message = getters.commitMessage !== null ? getters.commitMessage : getters.proposedCommitMessage
    // console.log('commit "' + message + '"')

    dispatch('commit2GitHub', { message, files })
    // commit('SET_COMMITTING', false)
  },

  setCommitMessage ({ commit }, message) {
    commit('SET_COMMIT_MESSAGE', message)
  },

  resetCommitResults ({ dispatch }) {
    const nullResults = {
      status: 'uncommitted',
      prUrl: null,
      conflictingUser: null
    }
    dispatch('setCommitResults', nullResults)
  },
  setCommitResults ({ commit }, { status, prUrl, conflictingUser }) {
    if (['uncommitted', 'success', 'merged', 'conflicts'].indexOf(status) === -1) {
      console.error('Unknown status for commit results: ' + status)
      return false
    }
    if (prUrl) console.log('PR URL', prUrl)
    const url = typeof prUrl === 'string' ? prUrl : null
    const user = typeof conflictingUser === 'string' ? conflictingUser : null

    commit('SET_COMMIT_RESULTS', { status, prUrl: url, conflictingUser: user })
  },

  async loadSources ({ commit, dispatch, getters }) {
    const repometa = {
      octokit: getters.octokit,
      owner: getters.config.repository.owner,
      repo: getters.config.repository.repo,
      branch: getters.config.repository.branch
    }
    // console.log(repometa)
    dispatch('setLoading', true)
    const sourcefiles = []
    const annotatedTranscripts = []
    const diplomaticTranscripts = []
    const repo = new OctokitRepo(repometa)
    // repo.getLastCommit().then(c => console.log('latest commit', c))
    const root = await repo.folder
    // console.log(repo.commitUrl)
    fetch(repo.commitUrl).then(resp => resp.json()).then(commitObj => commit('SET_COMMIT', commitObj))
    // console.log('commit', getters.commit)
    const folder = await root.getFile(getters.config.root)
    const sources = await folder.folder
    for (const source of sources) {
      if (source.type === 'dir' || source.type === 'tree') {
        const srcfiles = await source.folder
        for (const srcfile of srcfiles) {
          if (srcfile.name.endsWith('.xml') || srcfile.name.endsWith('.mei')) {
            // console.log('source:', srcfile.path)
            sourcefiles.push({ name: source.name, path: srcfile.path })
          }
          if (srcfile.name === 'annotatedTranscripts') {
            const transcripts = await srcfile.folder
            for (const transcript of transcripts) {
              if (transcript.name.endsWith('.xml') || transcript.name.endsWith('.mei')) {
                annotatedTranscripts.push(transcript.path)
              }
            }
          }
          if (srcfile.name === 'diplomaticTranscripts') {
            const transcripts = await srcfile.folder
            for (const transcript of transcripts) {
              if (transcript.name.endsWith('.xml') || transcript.name.endsWith('.mei')) {
                diplomaticTranscripts.push(transcript.path)
              }
            }
          }
        }
      }
    }
    commit('SET_SOURCES', sourcefiles)
    commit('SET_AVAILABLE_ANNOTATED_TRANSCRIPTS', annotatedTranscripts)
    commit('SET_AVAILABLE_DIPLOMATIC_TRANSCRIPTS', diplomaticTranscripts)
    // TODO: this is a replacement for the commit above. This is in the data module
    commit('SET_DOCUMENTNAME_PATH_MAPPING', sourcefiles)
    // build a Promise to wait for loading of all sources
    const sourcePromises = sourcefiles.map(source => new Promise((resolve, reject) => {
      // loadContent calls (optional) callback, when loading finished
      dispatch('loadContent', { ...source, callback: d => resolve(d) })
    }))
    // finally if any file fails
    Promise.all(sourcePromises).finally(() => {
      dispatch('setAllDocsLoaded')
      dispatch('setLoading', false)
      commit('SET_GH_FILE', {})
      if (getters.awaitedDocument !== null) {
        const path = getters.documentPathByName(getters.awaitedDocument)
        // console.log('I was waiting for ' + path + ', now I have it, so moving on…')
        dispatch('loadContent', { path })
        dispatch('setAwaitedDocument', null)
        // console.log('done')
        /* if (getters.awaitedPage !== -1) {
          dispatch('setCurrentPage', getters.awaitedPage - 1)
          dispatch('setAwaitedPage', -1)
          // console.log('done')
        } */
      }
      console.log('Octokit: All documents properly loaded')
    })
    // for (const source of sourcefiles) {
    //   dispatch('loadContent', source)
    // }
  },

  async getFile ({ getters }, { path, callback }) {
    const repometa = {
      octokit: getters.octokit,
      owner: getters.config.repository.owner,
      repo: getters.config.repository.repo,
      branch: getters.config.repository.branch
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
