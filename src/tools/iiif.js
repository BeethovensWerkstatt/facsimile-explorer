import store from '@/store'

function uuidv4 () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export const fixLink = uri => {
  uri = uri.replace('http://', 'https://')
  return (uri?.startsWith('https://gallica.bnf.fr/iiif/') && !uri?.endsWith('/info.json')) ? uri + '/info.json' : uri
}

// meta now contains a property doc with the parsed XML. Should we change this?
function addPage (canvas, infoJson, n, meta, meiPageTemplate, meiSurfaceTemplate) {
  // console.log(n, infoJson)
  const file = meta.doc
  const label = canvas.label
  const height = infoJson.height
  const width = infoJson.width

  const surfaceId = 's' + uuidv4()
  const graphicId = 'g' + uuidv4()
  const pageId = 'p' + uuidv4()

  // const mdivId = 'm' + uuidv4()
  // const sectionId = 's' + uuidv4()

  const page = meiPageTemplate.querySelector('page').cloneNode(true)
  page.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:id', pageId)
  page.setAttribute('page.width', width)
  page.setAttribute('page.height', height)
  page.setAttribute('surface', '#' + surfaceId)
  // page.setAttribute('ppu', 1)
  const comment = document.createComment('page ' + label)
  page.append(document.createTextNode('  '))
  page.append(comment)
  page.append(document.createTextNode('\n'))
  // page.querySelector('mdivb').setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:id', mdivId)
  // page.querySelector('secb').setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:id', sectionId)
  // page.querySelector('msEnd').setAttribute('startid', '#' + mdivId)
  // page.querySelector('msEnd + msEnd').setAttribute('startid', '#' + sectionId)
  file.querySelector('pages').appendChild(page)

  const surface = meiSurfaceTemplate.querySelector('surface').cloneNode(true)
  surface.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:id', surfaceId)
  surface.setAttribute('n', n)
  surface.setAttribute('label', label)
  surface.setAttribute('lrx', width)
  surface.setAttribute('lry', height)

  const graphic = surface.querySelector('graphic')
  graphic.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:id', graphicId)
  graphic.setAttribute('target', fixLink(canvas?.images[0]?.resource?.service['@id']))
  graphic.setAttribute('width', width)
  graphic.setAttribute('height', height)

  file.querySelector('facsimile').appendChild(surface)
}

export async function iiifManifest2mei (json, url, parser) {
  const promises = []
  let meiFileTemplate
  let meiPageTemplate
  let meiSurfaceTemplate

  const imageData = []
  const imageLinks = []

  json.sequences[0].canvases.forEach((canvas, i) => {
    const uri = canvas?.images[0]?.resource?.service['@id']
    imageLinks.push(uri)
  })

  imageLinks.forEach((uri, i) => {
    uri = fixLink(uri)

    promises.push(
      fetch(uri)
        .then(res => res.json())
        .then(json => { imageData[i] = json })
    )
  })

  promises.push(
    fetch('./assets/meiFileTemplate.xml')
      .then(res => res.text())
      .then(xml => { meiFileTemplate = parser.parseFromString(xml, 'application/xml') })
  )
  promises.push(
    fetch('./assets/meiPageTemplate.xml')
      .then(res => res.text())
      .then(xml => { meiPageTemplate = parser.parseFromString(xml, 'application/xml') })
  )
  promises.push(
    fetch('./assets/meiSurfaceTemplate.xml')
      .then(res => res.text())
      .then(xml => { meiSurfaceTemplate = parser.parseFromString(xml, 'application/xml') })
  )

  return Promise.all(promises)
    .then(() => {
      const file = meiFileTemplate.querySelector('mei').cloneNode(true)

      // set file id
      file.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:id', 'm' + uuidv4())
      // set file title
      file.querySelector('title').textContent = json.label
      // set reference to Manifest
      file.querySelector('source').setAttribute('target', url)
      // add current date
      file.querySelector('change date').setAttribute('isodate', new Date().toISOString().substring(0, 10))

      if ('metadata' in json) {
        const metadata = json.metadata

        const shelfmark = metadata.find(entry => { return entry.label === 'Signatur' })?.value
        file.querySelector('physLoc > identifier').textContent = shelfmark

        // const persistentIdentifier = metadata.find(entry => {entry.label = 'Persistente URL'}).value
        // file.querySelector('title').textContent = json.label

        const composer = metadata.find(entry => { return entry.label === 'Autor' })?.value
        file.querySelector('composer persName').textContent = composer
      }

      // handle pages
      json.sequences[0].canvases.forEach((canvas, i) => {
        addPage(canvas, imageData[i], i + 1, file, meiPageTemplate, meiSurfaceTemplate)
      })

      return file
    })
}

export function checkIiifManifest (json) {
  const claimsIiif2 = json['@context'] === 'http://iiif.io/api/presentation/2/context.json'
  const claimsIiif3 = json['@context'] === 'http://iiif.io/api/presentation/3/context.json'
  const claimsManifest = json['@type'] === 'sc:Manifest' || json.type === 'Manifest'

  // console.log('json.type: ' + json.type)
  // console.log('json.@type: ' + json['@type'])
  // console.log('claimsManifest: ' + claimsManifest)

  const hasId = (typeof json['@id'] === 'string' && json['@id'].length > 0) || (typeof json.id === 'string' && json.id.length > 0)
  const hasSequences = Array.isArray(json.sequences)

  // console.log('hasId: ' + hasId)
  // console.log('hasSequences: ' + hasSequences)

  return (claimsIiif2 || claimsIiif3) && claimsManifest && hasId && hasSequences
}

export function getPageArray (mei) {
  // function to build an array of surface links
  const resolveFoliumLike = (arr, foliumLike) => {
    const type = foliumLike.localName
    if (type === undefined) {
      // this is a textnode
    } else if (type === 'bifolium') {
      if (foliumLike.hasAttribute('outer.recto')) {
        arr.push(foliumLike.getAttribute('outer.recto'))
      }
      if (foliumLike.hasAttribute('inner.verso')) {
        arr.push(foliumLike.getAttribute('inner.verso'))
      }

      foliumLike.childNodes.forEach(child => {
        resolveFoliumLike(arr, child)
      })

      if (foliumLike.hasAttribute('inner.recto')) {
        arr.push(foliumLike.getAttribute('inner.recto'))
      }
      if (foliumLike.hasAttribute('outer.verso')) {
        arr.push(foliumLike.getAttribute('outer.verso'))
      }
    } else if (type === 'folium' || type === 'unknownFoliation') {
      if (foliumLike.hasAttribute('recto')) {
        arr.push(foliumLike.getAttribute('recto'))
      }

      foliumLike.childNodes.forEach(child => {
        resolveFoliumLike(arr, child)
      })

      if (foliumLike.hasAttribute('verso')) {
        arr.push(foliumLike.getAttribute('verso'))
      }
    } else {
      // continue searching for child elements, like when nested inside an add or so
      foliumLike.childNodes.forEach(child => {
        resolveFoliumLike(arr, child)
      })
    }
  }

  const arr = []
  mei.querySelectorAll('foliaDesc > *').forEach(foliumLike => {
    resolveFoliumLike(arr, foliumLike)
  })

  arr.forEach((link, i) => {
    if (link.startsWith('#')) {
      arr[i] = mei.querySelector('surface[*|id = "' + link.substring(1) + '"]')
    } else {
      const relativePath = link.split('#')[0]
      const id = link.split('#')[1]
      const folder = relativePath.split('/')[relativePath.split('/').length - 2]

      const fullPath = store.getters.getPathByName(folder)
      const file = store.getters.getContentData(fullPath)?.doc
      arr[i] = file.querySelector('surface[*|id = "' + id + '"]')
    }
  })

  arr.forEach((surface, n) => {
    const graphic = surface.querySelector('graphic[type="facsimile"]')
    // const i = n + 1
    // const page = mei.querySelector('page:nth-child(' + i + ')')

    const obj = {}
    obj.uri = graphic.getAttributeNS('', 'target').trim()
    obj.id = surface.getAttribute('xml:id').trim()
    obj.n = surface.hasAttribute('n') ? surface.getAttributeNS('', 'n').trim() : n
    obj.label = surface.hasAttribute('label') ? surface.getAttributeNS('', 'label').trim() : n
    obj.width = parseInt(graphic.getAttributeNS('', 'width').trim(), 10)
    obj.height = parseInt(graphic.getAttributeNS('', 'height').trim(), 10)
    obj.hasSvg = surface.querySelector('graphic[type="shapes"]') !== null // exists(graphic[@type='svg']) inside relevant /surface
    obj.hasZones = surface.querySelector('zone') !== null // exists(mei:zone) inside relevant /surface

    obj.systems = 0 // page.querySelectorAll('system').length // count(mei:system) inside relevant /page
    arr[n] = obj
  })
  // console.log(arr)
  /* mei.querySelectorAll('surface').forEach((surface, n) => {
    const graphic = surface.querySelector('graphic')
    const i = n + 1
    const page = mei.querySelector('page:nth-child(' + i + ')')

    const obj = {}
    obj.uri = graphic.getAttributeNS('', 'target').trim()
    obj.id = surface.getAttribute('xml:id').trim()
    obj.n = surface.getAttributeNS('', 'n').trim()
    obj.label = surface.getAttributeNS('', 'label').trim()
    obj.width = parseInt(graphic.getAttributeNS('', 'width').trim(), 10)
    obj.height = parseInt(graphic.getAttributeNS('', 'height').trim(), 10)
    obj.hasSvg = surface.querySelector('svg') !== null // exists(svg:svg) inside relevant /surface
    obj.hasZones = surface.querySelector('zone') !== null // exists(mei:zone) inside relevant /surface

    obj.systems = page.querySelectorAll('system').length // count(mei:system) inside relevant /page
    arr.push(obj)
  }) */
  return arr
}
