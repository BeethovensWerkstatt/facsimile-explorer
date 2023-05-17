import { Base64 } from 'js-base64'
import store from '@/store'

/**
 * An XML Serializer for converting back to string
 * @type {XMLSerializer}
 */
const serializer = new XMLSerializer()

/**
 * decode base63 encoded utf-8 string
 * @param {string} data base64 encoded utf-8 string
 * @returns decoded text
 */
export const base64text = (data) => {
  const dec = new TextDecoder('utf-8')
  const txt = dec.decode(Base64.toUint8Array(data))
  return txt
}

/**
 * decode and parse base64 encode utf-8 serialization of XML document
 * @param {string} data base64 encoded utf-8 serialization of DOM
 * @param {string='application/xml'} type type of XML
 * @returns parsed DOM
 */
export const base64dom = (data, type = 'application/xml') => {
  const parser = new DOMParser()
  const text = base64text(data)
  const dom = parser.parseFromString(text, type)
  return dom
}

/**
 * encode string to utf-8 base64
 * @param {string} str text to encode
 * @returns base64 encoded utf-8 coded string
 */
export const str2base64 = str => {
  const enc = new TextEncoder('utf-8')
  return Base64.fromUint8Array(enc.encode(str))
}
/**
 * serialize DOM and convert to utf-8 base64 encoding
 * @param {DOM} dom DOM object to serialize to string and encode utf-8 base64
 * @returns base64 encoded utf-8 coded serialization of dom
 */
export const dom2base64 = dom => {
  const str = serializer.serializeToString(dom)
  return str2base64(str)
}

export class OctokitNode {
  // orepo: OctokitRepo ... orepo.commit, orepo.revert
  _repo

  _parent
  _path
  _type

  constructor ({ repo, parent, path, type }) {
    this._parent = parent
    this._repo = repo
    this._path = path
    this._type = type
  }

  get isFile () { return false }
  get isFolder () { return false }

  get repo () { return this._repo }

  get parent () { return this._parent }
  get path () { return this._path }
  get name () {
    const apath = this.path.split('/').filter(p => p)
    return apath.length > 0 ? apath[apath.length - 1] : ''
  }

  get mode () { return this._mode }
  get sha () { return this._sha }
  get size () { return this._size }
  get type () { return this._type }
}

export class OctokitFile extends OctokitNode {
  _content
  _mode
  _sha
  _size
  _dirty

  constructor ({ repo, parent, path, mode, sha, size, type }) {
    super({ repo, parent, path, type })
    this._content = null
    this._mode = mode || '100644'
    this._sha = sha
    this._size = size
    this._dirty = false
  }

  get dirty () { return this._dirty }

  get isFile () { return true }
  get isFolder () { return false }

  getContent (refresh = false) {
    if (refresh || !this._content) {
      this._content = new Promise((resolve, reject) => {
        this.repo.octokit.repos.getContent({
          owner: this.repo.owner,
          repo: this.repo.repo,
          ref: this.repo.branch,
          path: this.path
        }).then(({ data }) => {
          this._dirty = false
          this._sha = data.sha
          const dec = new TextDecoder('utf-8')
          const content = dec.decode(Base64.toUint8Array(data.content))
          resolve(content)
        }).catch(error => reject(error))
      })
    }
    return this._content
  }

  setContent (content) {
    this._content = new Promise((resolve, reject) => {
      this.repo.octokit.git.createBlob({
        owner: this.repo.owner,
        repo: this.repo.repo,
        content,
        encoding: 'base64'
      }).then(({ data }) => {
        this._dirty = true
        this._sha = data.sha
        this._size = data.size
        // TODO in store
        resolve(content)
      }).catch(error => reject(error))
      this.repo.addModified(this)
    })
  }

  getObject (transformator, refresh = false) {
    return new Promise((resolve, reject) => {
      this.getContent(refresh).then(content => {
        try {
          const obj = transformator(content)
          if (typeof obj.then === 'function') {
            if (typeof obj.catch === 'function') {
              obj.then(cnt => resolve(cnt)).catch(err => reject(err))
            } else {
              obj.then(cnt => resolve(cnt))
            }
          } else {
            resolve(obj)
          }
        } catch (error) {
          reject(error)
        }
      }).catch(err => reject(err))
    })
  }

  getFile (path) {
    return this.parent.getFile(path)
  }
}

export class OctokitFolder extends OctokitNode {
  _tree

  constructor ({ repo, parent, path, type, tree }) {
    super({ repo, parent, path, type })
    this._tree = tree
    // console.log({ repo, parent, path, type, tree })
    // this.tree.then(t => console.log(t))
  }

  get isFile () { return false }
  get isFolder () { return true }

  get tree () { return this._tree }

  get folder () {
    return new Promise((resolve, reject) => {
      this.tree.then(t => {
        const tree = t.filter(n => n.type === 'file' || n.type === 'blob' || n.type === 'dir' || n.type === 'tree')
        // console.log(t, tree)
        const folder = tree.map(n => {
          // console.log(n)
          if (n.type === 'file' || n.type === 'blob') return new OctokitFile({ ...n, repo: this.repo, parent: this })
          const tree = new Promise((resolve, reject) => {
            // console.log({ owner: this.repo.owner, repo: this.repo.repo, path: n.path })
            this.repo.octokit.repos.getContent({
              owner: this.repo.owner,
              repo: this.repo.repo,
              path: n.path,
              ref: this.repo.branch
            }).then(({ data }) => {
              // console.log(n.path, data)
              resolve(data)
            }).catch(err => reject(err))
          })
          // console.log({ ...n, repo: this.repo, tree })
          return new OctokitFolder({ ...n, repo: this.repo, parent: this, tree })
        })
        resolve(folder)
      }).catch(err => reject(err))
    })
  }

  getFile (path, i) {
    if (typeof path === 'string') {
      // TODO if absolute getFile from root
      // TODO normalize '.' and '..'
      return this.getFile(path.split('/').filter(p => p), 0)
    }
    // console.log(this.path, path[i])
    if (i < path.length) {
      // console.log(this.path, this.folder)
      return new Promise((resolve, reject) => {
        this.folder.then(f => {
          // this.tree.then(t => console.log(t))
          // console.log(f)
          const n = f.find(t => {
            // console.log(t.name, path[i], i, t.name === path[i])
            return t.name === path[i]
          })
          if (n) {
            i++
            if (i < path.length) { n.getFile(path, i).then(n => resolve(n)).catch(err => reject(err)) } else resolve(n)
          } else reject(new Error(`'${path.join('/')}' not found!`))
        }).catch(err => reject(err))
      })
    }
    console.warn('we shouldnt comer here!')
    return new Promise(resolve => resolve(this))
  }

  // mkdir, mkfile, getNode
}

export class OctokitRepo {
  _owner
  _repo
  _branch
  _sha
  _ready
  _folder
  _modified

  constructor ({ owner, repo, branch }) {
    this._ready = false
    this._owner = owner
    this._repo = repo
    this._branch = branch
    this._sha = null
    this._modified = {}
    this.refreshFolder()
  }

  get octokit () { return store.getters.octokit }

  get owner () { return this._owner }

  get repo () { return this._repo }

  get branch () { return this._branch }

  get sha () { return this._sha }

  get ready () { return this._ready }

  get folder () { return this._folder }

  refreshFolder () {
    this._folder = new Promise((resolve, reject) => {
      this.octokit.repos.get({
        owner: this.owner,
        repo: this.repo
      }).then(({ data }) => {
        // console.log(data.default_branch);
        this.octokit.git.getRef({
          owner: this.owner,
          repo: this.repo,
          ref: `heads/${this.branch || data.default_branch}`
        }).then(({ data }) => {
          // console.log(data.object);
          this._sha = data.object.sha
          this.octokit.git.getTree({
            owner: this.owner,
            repo: this.repo,
            tree_sha: data.object.sha
          }).then(({ data }) => {
            // console.log(data)
            resolve(new OctokitFolder({ repo: this, parent: null, path: '', type: 'tree', tree: new Promise(resolve => resolve(data.tree)) }))
          })
        })
      }).catch(error => reject(error))
    })
  }

  addModified (file) {
    this._modified[file.path] = file
    console.log(this._modified)
  }

  async commitModified (message = 'github changes') {
    // TODO check repo for changed HEAD! branch, PR, merge
    const tree = Object.values(this._modified).map(f => ({
      path: f.path,
      sha: f.sha,
      type: 'blob',
      mode: f.mode
    }))
    // Create a new tree that references the new blobs
    const { data: { sha: newTreeSha } } = await this.octokit.git.createTree({
      owner: this.owner,
      repo: this.repo,
      base_tree: this.sha,
      tree: tree
    })
    // Create a new commit that references the new tree
    const { data: { sha: newCommitSha } } = await this.octokit.git.createCommit({
      owner: this.owner,
      repo: this.repo,
      message,
      tree: newTreeSha,
      parents: [this.sha]
    })

    // Update the specified branch to point to the new commit
    await this.octokit.git.updateRef({
      owner: this.owner,
      repo: this.repo,
      ref: `heads/${this.branch}`,
      sha: newCommitSha
    })

    console.log(this._modified, newCommitSha)
    // TODO clear _modified on successful commit
  }
}
