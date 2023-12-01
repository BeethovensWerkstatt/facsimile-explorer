import { uuid } from '@/tools/uuid.js'
import { getOsdRects } from '@/tools/facsimileHelpers.js'
const parser = new DOMParser()

/**
 * takes a template for diplomatic transcriptions and initializes it by generating IDs
 * @param {*} diploTemplate the template to be initialized
 * @param {*} filename the filename of the document containing the page where the diplomatic transcription is located
 * @param {*} genDescWzId the xml:id of the <genDesc> of the writingZone to which this diplomatic transcription belongs
 * @param {*} surfaceId the xml:id of the <surface> on which this writing zone is transcribed
 * @param {*} appVersion the version of the application, as taken from package.json
 * @param {*} affectedStaves the staves that are covered by this diplomatic transcription
 * @returns the initialized template
 */
export async function initializeDiploTrans (filename, genDescWzId, surfaceId, appVersion, affectedStaves) {
  const diploTemplate = await fetch('../assets/diplomaticTranscriptTemplate.xml')
    .then(response => response.text())
    .then(xmlString => parser.parseFromString(xmlString, 'application/xml'))

  diploTemplate.querySelectorAll('*[*|id]').forEach(elem => {
    const id = elem.localName.substring(0, 1) + uuid()
    if (elem.getAttribute('xml:id') === '%NEW-ID%') {
      elem.setAttribute('xml:id', id)
    }
  })

  const date = new Date().toISOString().split('T')[0]
  const datePlaceholder = '%CURRENT-DATE%'
  diploTemplate.querySelectorAll('change').forEach(change => {
    if (change.getAttribute('isodate') === datePlaceholder) {
      change.setAttribute('isodate', date)
    }
  })

  affectedStaves.forEach((obj, i) => {
    const n = obj.n
    const rastrum = obj.rastrum
    const staffDef = document.createElementNS('http://www.music-encoding.org/ns/mei', 'staffDef')
    staffDef.setAttribute('xml:id', 's' + uuid())
    staffDef.setAttribute('n', (i + 1))
    staffDef.setAttribute('label', n)
    staffDef.setAttribute('sameas', '../' + filename + '#' + rastrum.id)
    staffDef.setAttribute('lines', 5)
    diploTemplate.querySelector('staffGrp').append(staffDef)

    const staff = document.createElementNS('http://www.music-encoding.org/ns/mei', 'staff')
    staff.setAttribute('n', (i + 1))
    staff.setAttribute('xml:id', 's' + uuid())

    const layer = document.createElementNS('http://www.music-encoding.org/ns/mei', 'layer')
    layer.setAttribute('n', 1)
    layer.setAttribute('xml:id', 'l' + uuid())
    staff.append(layer)

    diploTemplate.querySelector('measure').append(staff)
  })

  diploTemplate.querySelector('application').setAttribute('version', appVersion)

  diploTemplate.querySelector('source').setAttribute('target', '../' + filename + '#' + genDescWzId)
  diploTemplate.querySelector('pb').setAttribute('target', '../' + filename + '#' + surfaceId)

  return diploTemplate
}

/**
 * generates an MEI that will render empty rastrums for a given page
 * @param {*} mei the MEI document containing the page
 * @param {*} surfaceId the xml:id of the <surface> element of the page
 * @returns the MEI document containing the empty rastrums
 */
export async function getEmptyPage (mei, surfaceId) {
  if (!mei || !surfaceId) {
    return null
  }

  const template = await fetch('../assets/emptyPageTemplate.xml')
    .then(response => response.text())
    .then(xmlString => parser.parseFromString(xmlString, 'application/xml'))

  const surface = [...mei.querySelectorAll('surface')].find(s => s.getAttribute('xml:id') === surfaceId)
  const layout = [...mei.querySelectorAll('layout')].find(l => '#' + l.getAttribute('xml:id') === surface.getAttribute('decls'))

  // retrieve correct folium / bifolium
  const folium = [...mei.querySelectorAll('foliaDesc *')].find(f => {
    if (f.getAttribute('outer.recto') === '#' + surfaceId) {
      return true
    }
    if (f.getAttribute('inner.verso') === '#' + surfaceId) {
      return true
    }
    if (f.getAttribute('inner.recto') === '#' + surfaceId) {
      return true
    }
    if (f.getAttribute('outer.verso') === '#' + surfaceId) {
      return true
    }
    if (f.getAttribute('recto') === '#' + surfaceId) {
      return true
    }
    if (f.getAttribute('verso') === '#' + surfaceId) {
      return true
    }
    return false
  })

  // properly set page dimensions
  template.querySelector('page').setAttribute('page.height', folium.getAttribute('height'))
  template.querySelector('page').setAttribute('page.width', folium.getAttribute('width'))

  // determine staff height relations
  const defaultFactor = 100 * 9 / 297 * 3 // INFO: I don't know the exact math behind the *3, but it works
  template.querySelector('staffDef').setAttribute('scale', defaultFactor + '%')
  const firstStaffHeight = parseFloat(layout.querySelector('rastrum').getAttribute('system.height'))

  // translate rastrums to systems
  layout.querySelectorAll('rastrum').forEach(rastrum => {
    const system = document.createElementNS('http://www.music-encoding.org/ns/mei', 'system')
    template.querySelector('page').append(system)
    system.setAttribute('system.leftmar', '0')
    system.setAttribute('system.rightmar', '0')

    const measure = document.createElementNS('http://www.music-encoding.org/ns/mei', 'measure')
    system.append(measure)
    measure.setAttribute('n', '1')
    measure.setAttribute('coord.x1', rastrum.getAttribute('system.leftmar'))
    measure.setAttribute('coord.x2', parseFloat(rastrum.getAttribute('system.leftmar')) + parseFloat(rastrum.getAttribute('width')))

    const staff = document.createElementNS('http://www.music-encoding.org/ns/mei', 'staff')
    measure.append(staff)
    staff.setAttribute('n', '1')
    staff.setAttribute('coord.y1', parseFloat(folium.getAttribute('height')) - parseFloat(rastrum.getAttribute('system.topmar')))

    const rotate = rastrum.getAttribute('rotate')
    const thisHeight = parseFloat(rastrum.getAttribute('system.height'))
    const relativeHeight = 1 / firstStaffHeight * thisHeight

    staff.setAttribute('rotateheight', rotate + ' ' + relativeHeight.toFixed(2))

    const layer = document.createElementNS('http://www.music-encoding.org/ns/mei', 'layer')
    staff.append(layer)
    layer.setAttribute('n', '1')
    layer.textContent = ' '
  })

  return template
}

export function initializePageIfNecessary (page, height) {
  const hasScoreDef = page.querySelector('score')
  if (hasScoreDef === null) {
    const scale = (100 / 80 * height).toFixed(1) + '%'

    const score = document.createElementNS('http://www.music-encoding.org/ns/mei', 'score')
    const scoreDef = document.createElementNS('http://www.music-encoding.org/ns/mei', 'scoreDef')
    const staffGrp = document.createElementNS('http://www.music-encoding.org/ns/mei', 'staffGrp')
    const staffDef = document.createElementNS('http://www.music-encoding.org/ns/mei', 'staffDef')
    score.append(document.createTextNode('\n    '))
    score.append(scoreDef)
    score.append(document.createTextNode('\n  '))
    scoreDef.append(document.createTextNode('\n      '))
    scoreDef.append(staffGrp)
    scoreDef.append(document.createTextNode('\n    '))
    staffGrp.append(document.createTextNode('\n        '))
    staffGrp.setAttribute('symbol', 'none')
    staffGrp.append(staffDef)
    staffGrp.append(document.createTextNode('\n      '))
    staffDef.setAttribute('xml:id', 'a' + uuid())
    staffDef.setAttribute('n', 1)
    staffDef.setAttribute('lines', 5)
    staffDef.setAttribute('scale', scale)
    page.prepend(score)
    page.prepend(document.createTextNode('\n  '))
  }

  const hasSecB = page.querySelector('secb')
  if (hasSecB === null) {
    const secb = document.createElementNS('http://www.music-encoding.org/ns/mei', 'secb')
    secb.setAttribute('xml:id', 's' + uuid())
    page.prepend(secb)
    page.prepend('\n  ')
  }

  const hasMdivB = page.querySelector('mdivb')
  if (hasMdivB === null) {
    const mdivb = document.createElementNS('http://www.music-encoding.org/ns/mei', 'mdivb')
    mdivb.setAttribute('xml:id', 'm' + uuid())
    page.prepend(mdivb)
    page.prepend('\n  ')
  }
}

export function generateSystemFromRect (uly, left, right) {
  const system = document.createElementNS('http://www.music-encoding.org/ns/mei', 'system')
  const measure = document.createElementNS('http://www.music-encoding.org/ns/mei', 'measure')
  const staff = document.createElementNS('http://www.music-encoding.org/ns/mei', 'staff')
  const layer = document.createElementNS('http://www.music-encoding.org/ns/mei', 'layer')

  /* <system system.leftmar="0" system.rightmar="0" uly="2711">
                        <measure coord.x1="290" coord.x2="3323" n="1">
                                  <staff n="1" coord.y1="2416">
  */
  system.setAttribute('system.leftmar', 0)
  system.setAttribute('system.rightmar', 0)
  system.append(document.createTextNode('\n    '))
  system.append(measure)
  system.append(document.createTextNode('\n  '))
  measure.setAttribute('coord.x1', left)
  measure.setAttribute('coord.x2', right)
  measure.setAttribute('n', 1)
  measure.append(document.createTextNode('\n      '))
  measure.append(staff)
  measure.append(document.createTextNode('\n    '))
  staff.setAttribute('n', 1)
  staff.setAttribute('coord.y1', uly)
  staff.append(document.createTextNode('\n        '))
  staff.append(layer)
  staff.append(document.createTextNode('\n      '))
  layer.setAttribute('n', 1)

  return system
}

export function insertSystem (page, system, followingSystem) {
  const where = (followingSystem === null || followingSystem === undefined) ? null : followingSystem.previousSibling
  page.insertBefore(document.createTextNode('\n  '), where)
  page.insertBefore(system, where)
  page.insertBefore(document.createTextNode('\n'), where)
}

/**
 * checks if SVG has grouped unassigned shapes already. Used during import.
 * @param  {[type]} svg               [description]
 * @return {[type]}     [description]
 */
export function verifyUnassignedGroupInSvg (svg) {
  // JPV: svg is XMLDocument now
  const children = [...svg.documentElement.children]

  const unassignedShapes = []
  children.forEach(elem => {
    if (elem.localName === 'path') {
      unassignedShapes.push(elem)
    }
  })

  const outSvg = svg.cloneNode(true)

  if (unassignedShapes.length === 0) {
    // console.log('INFO no shapes to move')
    return outSvg
  }

  const existingGroup = svg.querySelector('g[class="unassigned"]')

  let g

  if (existingGroup) {
    g = existingGroup
  } else {
    g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.setAttribute('class', 'unassigned')
  }

  unassignedShapes.forEach(path => {
    g.append(path)
  })

  outSvg.append(g)

  return outSvg
}

/**
 * converts rectangles between mm and px units
 * @param  {[type]} dom                     [description]
 * @param  {[type]} surfaceId               [description]
 * @param  {[type]} xywh                    [description]
 * @param  {[type]} dir                     [description]
 * @param  {[type]} getters                 access to the store's getters
 * @return {[type]}           [description]
 */
export function convertRectUnits (dom, surfaceId, xywh, dir, getters) {
  if (dir !== 'px2mm' && dir !== 'mm2px') {
    console.log('Failed to provide proper translation direction on ' + surfaceId + ' for dir "' + dir + '". Rect: ', xywh)
    return false
  }

  const surface = dom.querySelector('surface[*|id="' + surfaceId + '"]')
  const graphic = surface.querySelector('graphic[type="facsimile"]')

  const xywhParam = graphic.getAttribute('target').split('#xywh=')[1]

  if (!xywhParam) {
    console.error('Surface ' + surfaceId + ' has apparently no media fragment identifier for determining the size of the actual page in that scan. Unable to calculate a proper factor between pixel and mm dimensions.')
    return false
  }

  const pxOffsetX = parseFloat(xywhParam.split(',')[0])
  const pxOffsetY = parseFloat(xywhParam.split(',')[1])
  // const pageWidthPx = xywhParam.split(',')[2]
  // const pageHeightPx = xywhParam.split(',')[3]

  /* const folium = [...dom.querySelectorAll('foliaDesc *')].find(foliumLike => {
    if (foliumLike.getAttribute('outer.recto') === '#' + surfaceId) {
      return true
    }
    if (foliumLike.getAttribute('inner.verso') === '#' + surfaceId) {
      return true
    }
    if (foliumLike.getAttribute('inner.recto') === '#' + surfaceId) {
      return true
    }
    if (foliumLike.getAttribute('outer.verso') === '#' + surfaceId) {
      return true
    }
    if (foliumLike.getAttribute('recto') === '#' + surfaceId) {
      return true
    }
    if (foliumLike.getAttribute('verso') === '#' + surfaceId) {
      return true
    }
    return false
  })
  */

  // const pageWidthMm = folium.getAttribute('width')
  // const pageHeightMm = folium.getAttribute('height')

  // const scaleFactorHeight = pageHeightMm / pageHeightPx
  // const scaleFactorWidth = pageWidthMm / pageWidthPx

  const pageIndex = getters.currentPageZeroBased
  const path = getters.filepath
  const pages = getters.documentPagesForSidebars(path)
  const page = pages[pageIndex]

  if (!page) {
    return null
  }
  // console.log('page: ', page)
  const rects = getOsdRects(page)
  // console.log('rects: ', rects)

  const ratio = 1 / parseFloat(rects.ratio)

  /* // DEBUG
  console.log('pageHeightMm: ' + pageHeightMm)
  console.log('pageHeightPx: ' + pageHeightPx)
  console.log('pageWidthMm: ' + pageWidthMm)
  console.log('pageWidthPx: ' + pageWidthPx)
  console.log('pxOffsetX: ' + pxOffsetX)
  console.log('pxOffsetY: ' + pxOffsetY)
  console.log('scaleFactors width=' + scaleFactorWidth + ' | height=' + scaleFactorHeight)
  */

  if (dir === 'px2mm') {
    const rect = {}
    rect.x = parseFloat(((xywh.x - pxOffsetX) * ratio).toFixed(2))
    rect.y = parseFloat(((xywh.y - pxOffsetY) * ratio).toFixed(2))
    rect.w = parseFloat((xywh.w * ratio).toFixed(2))
    rect.h = parseFloat((xywh.h * ratio).toFixed(2))

    return rect
  } else {
    const rect = {}
    rect.x = Math.round((xywh.x / ratio) + pxOffsetX)
    rect.y = Math.round((xywh.y / ratio) + pxOffsetY)
    rect.w = Math.round(xywh.w / ratio)
    rect.h = Math.round(xywh.h / ratio)

    return rect
  }
}

/**
 * sorts the rastrum elements inside a given rastrumDesc
 * @param  {[type]} rastrumDesc               [description]
 * @return {[type]}             [description]
 */
export function sortRastrumsByVerticalPosition (rastrumDesc) {
  const rastrums = [...rastrumDesc.querySelectorAll('rastrum')]

  const sortFunc = (a, b) => {
    const aY = parseFloat(a.getAttribute('system.topmar'))
    const bY = parseFloat(b.getAttribute('system.topmar'))

    return aY - bY
  }

  const reordered = rastrums.sort(sortFunc)
  reordered.forEach(rastrum => rastrumDesc.append(rastrum))
}

/**
 * Translates draft elements to regular score elements.
 * Generates an array of MEI DOMs, each starting with <music>
 * @param  {[type]} meiDom               [description]
 * @return {[type]}        [description]
 */
export function draft2score (meiDom) {
  const arr = []
  meiDom.querySelectorAll('draft').forEach(draft => {
    const music = document.createElementNS('http://www.music-encoding.org/ns/mei', 'music')
    music.setAttribute('meiversion', '5.0.0-dev')
    const body = document.createElementNS('http://www.music-encoding.org/ns/mei', 'body')
    const mdiv = document.createElementNS('http://www.music-encoding.org/ns/mei', 'mdiv')
    const score = document.createElementNS('http://www.music-encoding.org/ns/mei', 'score')

    music.append(body)
    body.append(mdiv)
    mdiv.append(score)

    const childArr = [...draft.children]
    childArr.forEach(child => {
      score.append(child)
    })
    arr.push(music)
  })
  return arr
}

/**
 * Translates diplomatic transcripts (draft elements) to page-based MEI.
 * @param {[type]} meiDom the MEI DOM of a diplomatic transcript to be converted to page-based MEI
 */
export function draft2page (meiDom) {
  return meiDom
}

export const rawMEISelectables = [
  'note',
  'chord',
  'syl',
  'rest',
  'beam',
  'artic',
  'accid',
  'clef',
  'slur',
  'dynam',
  'dir',
  'keySig',
  'meterSig',
  'staff',
  'measure'
]
export const MEIselectables = rawMEISelectables.map(elem => '.' + elem + ':not(.bounding-box').join(', ')
