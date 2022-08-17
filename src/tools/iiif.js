function uuidv4 () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

function addPage (canvas, infoJson, n, file, meiPageTemplate, meiSurfaceTemplate) {
  // console.log(n, infoJson)
  const label = canvas.label
  const height = infoJson.height
  const width = infoJson.width
  let uri = canvas?.images[0]?.resource?.service['@id']

  if (uri.startsWith('https://gallica.bnf.fr/iiif/')) {
    uri += '/info.json'
  }

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
  page.setAttribute('ppu', 2.5)
  const comment = document.createComment('page ' + label)
  page.appendChild(comment)
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
  graphic.setAttribute('target', uri)
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
    if (uri.startsWith('https://gallica.bnf.fr/iiif/')) {
      uri += '/info.json'
    }

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

      const metadata = json.metadata

      const shelfmark = metadata.find(entry => { return entry.label === 'Signatur' })?.value
      file.querySelector('physLoc > identifier').textContent = shelfmark

      // const persistentIdentifier = metadata.find(entry => {entry.label = 'Persistente URL'}).value
      // file.querySelector('title').textContent = json.label

      const composer = metadata.find(entry => { return entry.label === 'Autor' })?.value
      file.querySelector('composer persName').textContent = composer

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
  const claimsManifest = json['@type'] === 'sc:Manifest'

  const hasId = typeof json['@id'] === 'string' && json['@id'].length > 0
  const hasSequences = Array.isArray(json.sequences)

  return (claimsIiif2 || claimsIiif3) && claimsManifest && hasId && hasSequences
}

export function getPageArray (mei) {
  const arr = []
  mei.querySelectorAll('surface').forEach((surface, n) => {
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
  })
  return arr
}
