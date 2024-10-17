import { uuid } from '@/tools/uuid.js'
import { getOsdRects } from '@/tools/facsimileHelpers.js'
const parser = new DOMParser()

/**
 * generates a diplomatic transcription from a given annotated transcription and a list of shapes
 * @param {*} annotElem the annotated transcription to be converted
 * @param {*} shapes the shapes to be converted
 * @param {*} x the x coordinate of the new element, relative to the staff and given in mm
 * @returns the generated diplomatic transcription
 */
export function generateDiplomaticElement (annotElem, shapes, x, svgPath, annotElemRef) {
  let name = annotElem.localName

  if (name === 'beam') {
    name = 'beamSpan'
  } else if (name === 'measure') {
    name = 'barLine'
  }

  const elem = document.createElementNS('http://www.music-encoding.org/ns/mei', name)
  elem.setAttribute('xml:id', 'd' + uuid())
  elem.setAttribute('x', x)

  const facs = []
  shapes.forEach(shape => {
    if (shape.hasAttribute('id')) {
      facs.push(svgPath + '#' + shape.getAttribute('id'))
    } else {
      console.warn('WARNING: Spotted a shape without an ID:', shape)
    }
  })
  elem.setAttribute('facs', facs.join(' '))
  elem.setAttribute('corresp', annotElem.getAttribute('xml:id'))

  if (name === 'note') {
    getDiplomaticNote(annotElem, elem)
  } else if (name === 'beamSpan' || name === 'beam') {
    getDiplomaticBeam(annotElem, elem)
  } else if (name === 'accid') {
    getDiplomaticAccid(annotElem, elem)
  } else if (name === 'barLine') {
    getDiplomaticBarline(annotElem, elem)
  } else {
    console.warn('TODO: @/tools/mei.js:generateDiplomaticElement() does not yet support ' + name + ' elements')
  }

  return elem
}

/**
 * translates an annotated note to a diplomatic note
 * @param {*} annotElem the annotated note to be translated
 * @param {*} note the diplomatic note to be translated
 */
function getDiplomaticNote (annotElem, note) {
  try {
    const staffN = annotElem.closest('staff').getAttribute('n')
    if (!staffN) {
      console.warn('WARNING: Could not determine staff number for ' + annotElem)
    }
    const clefs = [...annotElem.closest('music').querySelectorAll('staff[n="' + staffN + '"] clef, staffDef[n="' + staffN + '"] clef, staffDef[n="' + staffN + '"][clef\\.line], *[*|id="' + annotElem.getAttribute('xml:id') + '"]')]
    clefs.sort((a, b) => {
      if (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) {
        return -1
      } else {
        return 1
      }
    })

    const annotIndex = clefs.indexOf(annotElem)
    const lastClef = clefs[annotIndex - 1]

    if (!lastClef) {
      console.warn('WARNING: Could not determine last clef for ' + annotElem)
    }

    const clefShape = lastClef.hasAttribute('clef.shape') ? lastClef.getAttribute('clef.shape') : lastClef.getAttribute('shape')
    const clefLine = lastClef.hasAttribute('clef.line') ? lastClef.getAttribute('clef.line') : lastClef.getAttribute('line')
    // const clefDis = lastClef.hasAttribute('clef.dis') ? lastClef.getAttribute('clef.dis') : lastClef.getAttribute('dis')

    const pitches = ['c', 'd', 'e', 'f', 'g', 'a', 'b']
    const pitchValue = pitches.indexOf(annotElem.getAttribute('pname'))
    const octaveValue = parseInt(annotElem.getAttribute('oct'))

    let loc = 4

    if (clefShape === 'G' && clefLine === '2') {
      loc = (octaveValue - 4) * 7 + pitchValue - 2
    } else if (clefShape === 'F' && clefLine === '4') {
      loc = (octaveValue - 3) * 7 + pitchValue + 3
    } else if (clefShape === 'C' && clefLine === '3') {
      loc = (octaveValue - 4) * 7 + pitchValue
    }

    // F4 in treble should be 1: (4-4) * 7 + 3 - 2
    // C4 in treble should be -2: (4-4) * 7 + 0 - 2
    // B3 in treble should be -3: (3-4) * 7 + 6 - 2

    // B3 in bass clef should be 9: (3-3) * 7 + 6 + 3
    // C3 in bass clef should be 3: (3-3) * 7 + 0 + 3
    // G2 in bass clef should be 0: (2-3) * 7 + 4 + 3

    note.setAttribute('loc', loc)

    // head shape
    let headshape
    const dur = annotElem.getAttribute('dur')
    if (dur === '1') {
      headshape = 'whole'
    } else if (dur === '2') {
      headshape = 'half'
    } else if (parseInt(dur) > 4) {
      headshape = 'quarter'
    }
    if (annotElem.hasAttribute('head.shape')) {
      headshape = annotElem.getAttribute('head.shape')
    }
    note.setAttribute('head.shape', headshape)
    note.setAttribute('dur', dur)

    // stem direction
    if (annotElem.hasAttribute('stem.dir')) {
      note.setAttribute('stem.dir', annotElem.getAttribute('stem.dir'))
    } else if (dur !== '1') {
      note.setAttribute('stem.dir', loc < 4 ? 'up' : 'down')
    }

    // log('diplomatic note:', note)
  } catch (err) {
    console.warn('WARNING: Could not properly generate diplomatic note for ' + annotElem, err)
  }
}

/**
 * translates an annotated note to a diplomatic note
 * @param {*} annotElem the annotated note to be translated
 * @param {*} beam the diplomatic beam to be translated
 */
function getDiplomaticBeam (annotElem, beam) {
  const targets = []
  annotElem.querySelectorAll('*').forEach(elem => {
    if (elem.localName === 'note' && !elem.closest('chord') && elem.hasAttribute('corresp')) {
      targets.push('#' + elem.getAttribute('corresp').split('#')[1])
    }
  })
  beam.setAttribute('plist', targets.join(' '))
  beam.setAttribute('startid', targets[0])
  beam.setAttribute('endid', targets.splice(-1)[0])
  beam.setAttribute('staff', annotElem.closest('staff').getAttribute('n'))
  // console.log(718, '\n', beam, '\n', annotElem, '\n', targets)
}

/**
 * translates an annotated accidental to a diplomatic accidental
 * @param {*} annotElem the annotated accidental to be translated
 * @param {*} accid the diplomatic accid to be translated
 */
function getDiplomaticAccid (annotElem, accid) {
  accid.setAttribute('accid', annotElem.getAttribute('accid'))
  // console.log(411, '\n', accid, '\n', annotElem)
}

/**
 * translates an annotated barLine to a diplomatic barLine
 * @param {*} annotElem the annotated barLine to be translated
 * @param {*} barLine the diplomatic barLine to be translated
 */
function getDiplomaticBarline (annotElem, barLine) {
  barLine.setAttribute('form', 'single')
  // console.log(364, '\n', barLine, '\n', annotElem)
}

/**
 * takes a template for diplomatic transcriptions and initializes it by generating IDs
 * @param {*} diploTemplate the template to be initialized
 * @param {*} filename the filename of the document containing the page where the diplomatic transcription is located
 * @param {*} wzObj the object for the current writing zone
 * @param {*} surfaceId the xml:id of the <surface> on which this writing zone is transcribed
 * @param {*} appVersion the version of the application, as taken from package.json
 * @param {*} affectedStaves the staves that are covered by this diplomatic transcription
 * @returns the initialized template
 */
export async function initializeDiploTrans (filename, wzObj, surfaceId, appVersion, affectedStaves, systemcount) {
  /*
  key words in the (former) template
  APP-VERSION
  CURRENT-DATE
  FILEPATH
  GENDESCWZ-ID
  NEW-ID
  SURFACE-ID
  */
  console.log('---------------------> ', affectedStaves, systemcount)
  const genDescWzId = wzObj.id
  const diploTemplate = await fetch('../assets/diplomaticTranscriptTemplate.xml')
    .then(response => response.text())
    .then(xmlString => parser.parseFromString(xmlString, 'application/xml'))

  diploTemplate.querySelectorAll('*[*|id]').forEach(elem => {
    if (elem.getAttribute('xml:id') === '%NEW-ID%') {
      const id = elem.localName.substring(0, 1) + uuid()
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

  diploTemplate.querySelector('application').setAttribute('version', appVersion)

  diploTemplate.querySelector('source').setAttribute('target', '../' + filename + '#' + genDescWzId)
  const pb = diploTemplate.querySelector('pb')
  pb.setAttribute('target', '../' + filename + '#' + surfaceId)
  const section = pb.parentNode

  const staffGrp = diploTemplate.querySelector('staffGrp')
  const staffDefs = []
  const staffDecls = []

  for (let i = 0; i < systemcount; i++) {
    const staffDef = document.createElementNS('http://www.music-encoding.org/ns/mei', 'staffDef')
    staffDef.setAttribute('xml:id', 's' + uuid())
    staffDef.setAttribute('n', (i + 1))
    staffDef.setAttribute('lines', 5)
    staffGrp.append(staffDef)
    staffDefs.push(staffDef)
    staffDecls.push([])
  }

  let sb = null
  let corresp = null
  affectedStaves.forEach((obj, i) => {
    if (i % systemcount === 0) {
      if (sb && corresp) {
        sb.setAttribute('corresp', ' '.join(corresp))
      }
      corresp = []
      sb = document.createElementNS('http://www.music-encoding.org/ns/mei', 'sb')
      section.append(sb)
      sb.setAttribute('xml:id', 's' + uuid())
      const measure = document.createElementNS('http://www.music-encoding.org/ns/mei', 'measure')
      section.append(measure)
      measure.setAttribute('xml:id', 'm' + uuid())

      for (let i = 0; i < systemcount; i++) {
        const staff = document.createElementNS('http://www.music-encoding.org/ns/mei', 'staff')
        staff.setAttribute('n', (i + 1))
        staff.setAttribute('xml:id', 's' + uuid())
        measure.append(staff)

        const layer = document.createElementNS('http://www.music-encoding.org/ns/mei', 'layer')
        layer.setAttribute('n', 1)
        layer.setAttribute('xml:id', 'l' + uuid())
        staff.append(layer)
      }
    }
    // const n = obj.n
    const rastrum = obj.rastrum
    const rastrumurl = `../${filename}#${rastrum.id}`
    staffDecls[i % systemcount].push(rastrumurl)
    corresp.push(rastrumurl)
  })
  if (sb && corresp) {
    sb.setAttribute('corresp', corresp.join(' '))
  }
  staffDecls.forEach((sd, i) => {
    staffDefs[i].setAttribute('decls', sd.join(' '))
  })

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

  const defaultFactor = 9

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

  const outSurface = template.querySelector('surface')

  // properly set page dimensions
  outSurface.setAttribute('lry', parseFloat(folium.getAttribute('height') * defaultFactor))
  outSurface.setAttribute('lrx', parseFloat(folium.getAttribute('width') * defaultFactor))

  const appendNewElement = (parent, name, ns = 'http://www.music-encoding.org/ns/mei') => {
    const elem = parent.appendChild(document.createElementNS(ns, name))
    if (ns === 'http://www.w3.org/2000/svg') {
      elem.setAttribute('id', 's' + uuid())
    } else {
      elem.setAttribute('xml:id', 'x' + uuid())
    }
    return elem
  }
  const staffGrp = template.querySelector('staffGrp')
  const section = template.querySelector('section')

  const pbZone = appendNewElement(outSurface, 'zone')
  pbZone.setAttribute('type', 'pb')
  pbZone.setAttribute('ulx', '0')
  pbZone.setAttribute('uly', '0')
  pbZone.setAttribute('lrx', parseFloat(folium.getAttribute('width') * defaultFactor))
  pbZone.setAttribute('lry', parseFloat(folium.getAttribute('height') * defaultFactor))

  const pb = appendNewElement(section, 'pb')
  pb.setAttribute('facs', '#' + pbZone.getAttribute('xml:id'))

  layout.querySelectorAll('rastrum').forEach((rastrum, i) => {
    const staffDef = appendNewElement(staffGrp, 'staffDef')
    staffDef.setAttribute('n', i + 1)
    staffDef.setAttribute('lines', 5)
    const scale = (100 / 72 * parseFloat(rastrum.getAttribute('system.height')) * defaultFactor).toFixed(1) + '%'
    staffDef.setAttribute('scale', scale)

    const sbZone = appendNewElement(outSurface, 'zone')
    sbZone.setAttribute('type', 'sb')
    sbZone.setAttribute('ulx', parseFloat(rastrum.getAttribute('system.leftmar') * defaultFactor))
    sbZone.setAttribute('uly', parseFloat(rastrum.getAttribute('system.topmar') * defaultFactor))

    const sb = appendNewElement(section, 'sb')
    sb.setAttribute('facs', '#' + sbZone.getAttribute('xml:id'))

    const measureZone = appendNewElement(outSurface, 'zone')
    measureZone.setAttribute('type', 'measure')
    measureZone.setAttribute('ulx', parseFloat(rastrum.getAttribute('system.leftmar') * defaultFactor))
    measureZone.setAttribute('lrx', (parseFloat(rastrum.getAttribute('system.leftmar')) + parseFloat(rastrum.getAttribute('width'))) * defaultFactor)

    const measure = appendNewElement(section, 'measure')
    measure.setAttribute('facs', '#' + measureZone.getAttribute('xml:id'))

    const staffZone = appendNewElement(outSurface, 'zone')
    staffZone.setAttribute('type', 'staff')
    staffZone.setAttribute('uly', parseFloat(rastrum.getAttribute('system.topmar')) * defaultFactor)

    const staff = appendNewElement(measure, 'staff')
    staff.setAttribute('facs', '#' + staffZone.getAttribute('xml:id'))
    staff.setAttribute('rotate', rastrum.getAttribute('rotate'))

    const layer = appendNewElement(staff, 'layer')
    layer.setAttribute('n', 1)
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
    console.warn('draft:', draft)
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
  // console.log(arr)
  if (arr.length === 0) {
    console.warn('draft2score: try to add score elements ...')
    meiDom.querySelectorAll('score').forEach(score => {
      const music = document.createElementNS('http://www.music-encoding.org/ns/mei', 'music')
      music.setAttribute('meiversion', '5.0.0-dev')
      const body = document.createElementNS('http://www.music-encoding.org/ns/mei', 'body')
      const mdiv = document.createElementNS('http://www.music-encoding.org/ns/mei', 'mdiv')

      music.append(body)
      body.append(mdiv)
      mdiv.append(score.cloneNode(true))

      arr.push(music)
    })
  }
  if (arr.length === 0) {
    console.error('draft2score: no scores!')
  }
  return arr
}

/**
 * Translates diplomatic transcripts (draft elements) to page-based MEI.
 * @param {[type]} meiDom the MEI DOM of a diplomatic transcript to be converted to page-based MEI
 */
export function draft2page (meiDom) {
  return meiDom
}

/**
 * ATTENTION: This is superseded by prepareDtForRendering, as taken from Liquifier
 * @param {*} param0
 * @param {*} emptyPage
 * @param {*} osdRects
 * @param {*} currentPageInfo
 * @returns
 */
export async function getRenderableDiplomaticTranscript ({ wzDetails, dtDoc }, emptyPage, osdRects, currentPageInfo) {
  const requiredStaves = []

  if (!dtDoc) {
    console.log('no dtDoc')
    return null
  }

  console.warn('\n\n\n----HELLO POLLY----')
  console.log(wzDetails)
  console.log(dtDoc)
  console.log(emptyPage)
  console.log(osdRects)
  console.log(currentPageInfo)
  console.warn('-----done-----')

  dtDoc.querySelectorAll('staffDef').forEach(staffDef => {
    requiredStaves.push(staffDef.getAttribute('label'))
  })

  const clonedPage = emptyPage.cloneNode(true)
  // const clonedDt = dtDoc.cloneNode(true)

  const bbox = {}
  bbox.x = parseFloat(wzDetails.xywh.split(',')[0])
  bbox.y = parseFloat(wzDetails.xywh.split(',')[1])
  bbox.w = parseFloat(wzDetails.xywh.split(',')[2])
  bbox.h = parseFloat(wzDetails.xywh.split(',')[3])

  // const pagePixWidth = parseInt(currentPageInfo.width)
  // const pagePixHeight = parseInt(currentPageInfo.height)
  // const pageHeight = parseFloat(currentPageInfo.mmHeight)

  const margin = 10
  const pixMargin = osdRects.ratio * margin // 10mm margin

  console.log('clonedPage:', clonedPage, typeof appendNewElement)

  const pixBox = {}
  pixBox.x = bbox.x - pixMargin
  pixBox.y = bbox.y - pixMargin
  pixBox.w = bbox.w + pixMargin * 3
  pixBox.h = bbox.h + pixMargin * 3

  const mmBox = {}
  mmBox.x = parseFloat((pixBox.x / osdRects.ratio + osdRects.image.x).toFixed(8))
  mmBox.y = parseFloat((pixBox.y / osdRects.ratio + osdRects.image.y).toFixed(8))
  mmBox.w = parseFloat((pixBox.w / osdRects.ratio + osdRects.image.x).toFixed(8))
  mmBox.h = parseFloat((pixBox.h / osdRects.ratio + osdRects.image.y).toFixed(8))

  // const factor = 9

  // const pageElem = clonedPage.querySelector('page')
  // pageElem.setAttribute('viewBox', pos1 + ' ' + pos2 + ' ' + pos3 + ' ' + pos4)

  const outSurface = clonedPage.querySelector('surface')
  const outStaffGrp = clonedPage.querySelector('staffGrp')
  const outSection = clonedPage.querySelector('section')

  // const defaultRastrumHeight = factor * 8 // 8vu = 72px

  dtDoc.querySelectorAll('scoreDef staffDef').forEach(dtStaffDef => {
    /* const staffDef = */ outStaffGrp.appendChild(dtStaffDef.cloneNode(true))

    // TODO: add scaling
    /* const rastrumIDs = staffDef.getAttribute('decls').split(' ').map(ref => ref.split('#')[1])
    const rastrums = [...layout.querySelectorAll('rastrum')].filter(r => {
      return rastrumIDs.indexOf(r.getAttribute('xml:id')) !== -1
    })
    staffDef.setAttribute('scale', (100 / defaultRastrumHeight * parseFloat(rastrums[0].getAttribute('system.height')) * factor).toFixed(1) + '%')
    */
  })

  dtDoc.querySelectorAll('section > *').forEach(dtNode => {
    const node = outSection.appendChild(dtNode.cloneNode(true))
    const name = node.localName

    if (name === 'pb') {
      /* const pageZone = appendNewElement(outSurface, 'zone')
      pageZone.setAttribute('type', 'pb')
      pageZone.setAttribute('lrx', pos3)
      pageZone.setAttribute('lry', pos4)
      pageZone.setAttribute('ulx', 0)
      pageZone.setAttribute('uly', 0)
      node.setAttribute('facs', '#' + pageZone.getAttribute('xml:id')) */
      console.log('there should already be a pb in here: ', outSurface)
    } else if (name === 'sb') {
      /* const systemZone = appendNewElement(outSurface, 'zone')
      const rastrumIDs = node.getAttribute('corresp').split(' ').map(ref => ref.split('#')[1])
      const rastrums = [...layout.querySelectorAll('rastrum')].filter(r => {
        return rastrumIDs.indexOf(r.getAttribute('xml:id')) !== -1
      })
      let x = mmBox.w
      let y = mmBox.h
      let x2 = 0
      rastrums.forEach(rastrum => {
        const rx = parseFloat(rastrum.getAttribute('system.leftmar'))
        const ry = parseFloat(rastrum.getAttribute('system.topmar'))
        const rw = parseFloat(rastrum.getAttribute('width')) + rx
        x = Math.min(rx, x)
        y = Math.min(ry, y)
        x2 = Math.max(rw, x2)
      })

      systemZone.setAttribute('type', 'sb')
      systemZone.setAttribute('ulx', (x * factor).toFixed(1))
      systemZone.setAttribute('bw.lrx', (x2 * factor).toFixed(1))
      systemZone.setAttribute('bw.rastrumIDs', rastrumIDs.join(' '))
      systemZone.setAttribute('uly', (y * factor).toFixed(1)) // todo: how to determine sb/@uly properly? This is not the same as staff/@uly!!!!
      node.setAttribute('facs', '#' + systemZone.getAttribute('xml:id')) */
    } else if (name === 'measure') {
      /* const measureZone = appendNewElement(outSurface, 'zone')
      measureZone.setAttribute('type', 'measure')

      let measureX = mmBox.w * factor
      let measureX2 = 0
      node.querySelectorAll('*').forEach(child => {
        if (child.hasAttribute('x')) {
          const x = parseFloat(child.getAttribute('x')) * factor
          measureX = Math.min(measureX, x)
          measureX2 = Math.max(measureX2, x)
        }
        if (child.hasAttribute('x2')) {
          const x = parseFloat(child.getAttribute('x2')) * factor
          measureX2 = Math.max(measureX2, x)
        }

        const childName = child.localName
        const supportedElements = ['note', 'staff', 'accid']
        const ignoreElements = ['layer']

        if (supportedElements.indexOf(childName) !== -1) {
          const childZone = appendNewElement(outSurface, 'zone')
          childZone.setAttribute('type', childName)

          if (childName === 'note' || childName === 'accid') {
            childZone.setAttribute('ulx', (parseFloat(child.getAttribute('x')) * factor).toFixed(1))
          } else if (childName === 'staff') {
            const staffN = parseInt(child.getAttribute('n'))
            const getSbZone = (node) => {
              let sibling = node
              while (sibling) {
                if (sibling.hasAttribute('type') && sibling.getAttribute('type') === 'sb') { //sibling.matches('[type="sb"]')) {
                  return sibling // Found the matching sibling
                }
                sibling = sibling.previousElementSibling // Move to the next preceding sibling
              }
              return null
            }
            /* const getSbZone = (node) => {
                      console.log('examining sibling: ', node)
                      // Base case: if the node is null, return null
                      if (!node) {
                          console.warn('no more preceding siblings')
                          return null
                      }
                      const serializer = new dom.window.XMLSerializer()
                      const serializedString = serializer.serializeToString(node)
                      console.log(serializedString.substring(0, 130))
                      // Check if the current node matches the condition
                      try {
                          if (node.hasAttribute('type') && node.getAttribute('type') === 'sb') {
                              console.warn('found sb')
                              return node // Found the matching sibling
                          } else {
                              console.warn('no sb')
                          }
                      } catch(err) {
                          console.trace('error in getSbZone: ', err)
                          return false
                      }

                      // Recursive step: move to the previous sibling
                      return getSbZone(node.previousElementSibling)
                  } * /
            const sbZone = getSbZone(childZone)
            const rastrumID = sbZone.getAttribute('bw.rastrumIDs').split(' ')[staffN - 1]
            const rastrum = layout.querySelector('rastrum[xml\\:id="' + rastrumID + '"]')
            const staffY = parseFloat(rastrum.getAttribute('system.topmar')) * factor
            childZone.setAttribute('uly', staffY.toFixed(1))
            * /
          }

          child.setAttribute('facs', '#' + childZone.getAttribute('xml:id'))
        } else if (ignoreElements.indexOf(childName) === -1) {
          console.warn('Unsupported element in diplomatic transcription: ' + childName)
          // todo: autogenerate an issue for unsupported elements?! If so, leave a stack trace of the file in which they occur?
        }
      })

      /* TODO: make this work again
      const sbZone = measureZone.previousElementSibling
      const sbX = parseFloat(sbZone.getAttribute('ulx'))
      const sbX2 = parseFloat(sbZone.getAttribute('bw.lrx'))

      measureX = Math.max(measureX - 10 * factor, sbX) // give 1cm margin, if possible
      measureX2 = Math.min(measureX2 + 10 * factor, sbX2) // give 1cm margin, if possible

      measureZone.setAttribute('ulx', measureX.toFixed(1))
      measureZone.setAttribute('lrx', measureX2.toFixed(1))
      * /
      node.setAttribute('facs', '#' + measureZone.getAttribute('xml:id')) */
    }
    // outDom.querySelector('section').appendChild(node)
  })

  console.log('diplomatic transcript for fragment', clonedPage)

  // temporaryVerovio3to4(clonedPage)

  return clonedPage
}

const appendNewElement = (parent, name, ns = 'http://www.music-encoding.org/ns/mei') => {
  const elem = parent.appendChild(document.createElementNS(ns, name))
  if (ns === 'http://www.w3.org/2000/svg') {
    elem.setAttribute('id', 's' + uuid())
  } else {
    elem.setAttribute('xml:id', 'x' + uuid())
  }
  return elem
}

/* function temporaryVerovio3to4 (dom) {
  const appendNewElement = (parent, name, ns = 'http://www.music-encoding.org/ns/mei') => {
    const elem = parent.appendChild(document.createElementNS(ns, name))
    if (ns === 'http://www.w3.org/2000/svg') {
      elem.setAttribute('id', 's' + uuid())
    } else {
      elem.setAttribute('xml:id', 'x' + uuid())
    }
    return elem
  }

  const factor = 9
  const pageWidth = parseFloat(dom.querySelector('page').getAttribute('page.width'))
  const pageHeight = parseFloat(dom.querySelector('page').getAttribute('page.height'))

  const music = dom.querySelector('music')
  const facsimile = appendNewElement(music, 'facsimile')
  facsimile.setAttribute('type', 'transcription')
  music.prepend(facsimile)
  const surface = appendNewElement(facsimile, 'surface')
  surface.setAttribute('lrx', pageWidth * factor)
  surface.setAttribute('lry', pageHeight * factor)

  music.querySelectorAll('section > *').forEach(node => {
    const name = node.localName

    if (name === 'pb') {
      const pageZone = appendNewElement(outSurface, 'zone')
      pageZone.setAttribute('type', 'pb')
      pageZone.setAttribute('lrx', (pageMM.w * factor).toFixed(1))
      pageZone.setAttribute('lry', (pageMM.h * factor).toFixed(1))
      pageZone.setAttribute('ulx', 0)
      pageZone.setAttribute('uly', 0)
      node.setAttribute('facs', '#' + pageZone.getAttribute('xml:id'))
    } else if (name === 'sb') {
      const systemZone = appendNewElement(outSurface, 'zone')
      const rastrumIDs = node.getAttribute('corresp').split(' ').map(ref => ref.split('#')[1])
      const rastrums = [...layout.querySelectorAll('rastrum')].filter(r => {
        return rastrumIDs.indexOf(r.getAttribute('xml:id')) !== -1
      })
      let x = pageMM.w
      let y = pageMM.h
      let x2 = 0
      rastrums.forEach(rastrum => {
        const rx = parseFloat(rastrum.getAttribute('system.leftmar'))
        const ry = parseFloat(rastrum.getAttribute('system.topmar'))
        const rw = parseFloat(rastrum.getAttribute('width')) + rx
        x = Math.min(rx, x)
        y = Math.min(ry, y)
        x2 = Math.max(rw, x2)
      })

      systemZone.setAttribute('type', 'sb')
      systemZone.setAttribute('ulx', (x * factor).toFixed(1))
      systemZone.setAttribute('bw.lrx', (x2 * factor).toFixed(1))
      systemZone.setAttribute('bw.rastrumIDs', rastrumIDs.join(' '))
      systemZone.setAttribute('uly', (y * factor).toFixed(1)) // todo: how to determine sb/@uly properly? This is not the same as staff/@uly!!!!
      node.setAttribute('facs', '#' + systemZone.getAttribute('xml:id'))
    } else if (name === 'measure') {
      const measureZone = appendNewElement(outSurface, 'zone')
      measureZone.setAttribute('type', 'measure')

      let measureX = pageMM.w * factor
      let measureX2 = 0
      const content = node.querySelectorAll('*').forEach(child => {
        if (child.hasAttribute('x')) {
          const x = parseFloat(child.getAttribute('x')) * factor
          measureX = Math.min(measureX, x)
          measureX2 = Math.max(measureX2, x)
        }
        if (child.hasAttribute('x2')) {
          const x = parseFloat(child.getAttribute('x2')) * factor
          measureX2 = Math.max(measureX2, x)
        }

        const childName = child.localName
        const supportedElements = ['note', 'staff', 'accid']
        const ignoreElements = ['layer']

        if (supportedElements.indexOf(childName) !== -1) {
          const childZone = appendNewElement(outSurface, 'zone')
          childZone.setAttribute('type', childName)

          if (childName === 'note' || childName === 'accid') {
            childZone.setAttribute('ulx', (parseFloat(child.getAttribute('x')) * factor).toFixed(1))
          } else if (childName === 'staff') {
            const staffN = parseInt(child.getAttribute('n'))
            const getSbZone = (node) => {
              let sibling = node
              while (sibling) {
                if (sibling.hasAttribute('type') && sibling.getAttribute('type') === 'sb') { //sibling.matches('[type="sb"]')) {
                  return sibling // Found the matching sibling
                }
                sibling = sibling.previousElementSibling // Move to the next preceding sibling
              }
              return null
            }
            / * const getSbZone = (node) => {
                      console.log('examining sibling: ', node)
                      // Base case: if the node is null, return null
                      if (!node) {
                          console.warn('no more preceding siblings')
                          return null
                      }
                      const serializer = new dom.window.XMLSerializer()
                      const serializedString = serializer.serializeToString(node)
                      console.log(serializedString.substring(0, 130))
                      // Check if the current node matches the condition
                      try {
                          if (node.hasAttribute('type') && node.getAttribute('type') === 'sb') {
                              console.warn('found sb')
                              return node // Found the matching sibling
                          } else {
                              console.warn('no sb')
                          }
                      } catch(err) {
                          console.trace('error in getSbZone: ', err)
                          return false
                      }

                      // Recursive step: move to the previous sibling
                      return getSbZone(node.previousElementSibling)
                  } * /
            const sbZone = getSbZone(childZone)
            const rastrumID = sbZone.getAttribute('bw.rastrumIDs').split(' ')[staffN - 1]
            const rastrum = layout.querySelector('rastrum[xml\\:id="' + rastrumID + '"]')
            const staffY = parseFloat(rastrum.getAttribute('system.topmar')) * factor
            childZone.setAttribute('uly', staffY.toFixed(1))
          }

          child.setAttribute('facs', '#' + childZone.getAttribute('xml:id'))
        } else if (ignoreElements.indexOf(childName) === -1) {
          console.warn('Unsupported element in diplomatic transcription: ' + childName)
          // todo: autogenerate an issue for unsupported elements?! If so, leave a stack trace of the file in which they occur?
        }
      })
      node.setAttribute('facs', '#' + measureZone.getAttribute('xml:id'))
    }
  })
} */

/**
 * Converts a diplomatic transcription into a renderable MEI, using Verovio v4's facsimile-based approach
 * @param {*} node
 * @returns
 */
/* export const prepareDtForRendering = ({ dtDom, atDom, sourceDom }) => {
  // TODO: verify the inputs are proper XML documents
  const outDom = new DOMParser().parseFromString('<music xmlns="http://www.music-encoding.org/ns/mei"><facsimile type="transcription"><surface/></facsimile><body><mdiv><score><scoreDef><staffGrp/></scoreDef><section></section></score></mdiv></body></music>', 'text/xml')

  try {
    const writingZoneGenDescId = dtDom.querySelector('source').getAttribute('target').split('#')[1]
    const writingZoneGenDesc = sourceDom.querySelector('genDesc[xml\\:id="' + writingZoneGenDescId + '"]')
    const surface = sourceDom.querySelector('surface[xml\\:id="' + writingZoneGenDesc.closest('genDesc[class="#geneticOrder_pageLevel"]').getAttribute('corresp').substring(1) + '"]')
    // const writingZoneZone = surface.querySelectorAll('zone').values().find(z => writingZoneGenDesc.getAttribute('xml:id') === z.getAttribute('data').substring(1))

    const layout = sourceDom.querySelector('layout[xml\\:id="' + surface.getAttribute('decls').substring(1) + '"]')
    const foliumLike = sourceDom.querySelectorAll('foliaDesc > *').values().find(f => {
      const ref = '#' + surface.getAttribute('xml:id')
      return f.getAttribute('recto') === ref || f.getAttribute('verso') === ref || f.getAttribute('outer.recto') === ref || f.getAttribute('inner.verso') === ref || f.getAttribute('inner.recto') === ref || f.getAttribute('outer.verso') === ref
    })

    const pageMM = {
      x: 0,
      y: 0,
      w: parseFloat(foliumLike.getAttribute('width')),
      h: parseFloat(foliumLike.getAttribute('height'))
    }

    // Verovio uses a default of 9px per vu. This is used as factor for Verovio coordinate space
    const factor = 9

    const outSurface = outDom.querySelector('surface')
    outSurface.setAttribute('lrx', pageMM.w * factor)
    outSurface.setAttribute('lry', pageMM.h * factor)

    const outStaffGrp = outDom.querySelector('staffGrp')
    const outSection = outDom.querySelector('section')

    const defaultRastrumHeight = factor * 8 // 8vu = 72px

    dtDom.querySelectorAll('scoreDef staffDef').forEach(dtStaffDef => {
      const staffDef = outStaffGrp.appendChild(dtStaffDef.cloneNode(true))

      const rastrumIDs = staffDef.getAttribute('decls').split(' ').map(ref => ref.split('#')[1])
      const rastrums = [...layout.querySelectorAll('rastrum')].filter(r => {
        return rastrumIDs.indexOf(r.getAttribute('xml:id')) !== -1
      })
      staffDef.setAttribute('scale', (100 / defaultRastrumHeight * parseFloat(rastrums[0].getAttribute('system.height')) * factor).toFixed(1) + '%')
    })

    dtDom.querySelectorAll('section > *').forEach(dtNode => {
      const node = outSection.appendChild(dtNode.cloneNode(true))
      const name = node.localName

      if (name === 'pb') {
        const pageZone = appendNewElement(outSurface, 'zone')
        pageZone.setAttribute('type', 'pb')
        pageZone.setAttribute('lrx', (pageMM.w * factor).toFixed(1))
        pageZone.setAttribute('lry', (pageMM.h * factor).toFixed(1))
        pageZone.setAttribute('ulx', 0)
        pageZone.setAttribute('uly', 0)
        node.setAttribute('facs', '#' + pageZone.getAttribute('xml:id'))
      } else if (name === 'sb') {
        const systemZone = appendNewElement(outSurface, 'zone')
        const rastrumIDs = node.getAttribute('corresp').split(' ').map(ref => ref.split('#')[1])
        const rastrums = [...layout.querySelectorAll('rastrum')].filter(r => {
          return rastrumIDs.indexOf(r.getAttribute('xml:id')) !== -1
        })
        let x = pageMM.w
        let y = pageMM.h
        let x2 = 0
        rastrums.forEach(rastrum => {
          const rx = parseFloat(rastrum.getAttribute('system.leftmar'))
          const ry = parseFloat(rastrum.getAttribute('system.topmar'))
          const rw = parseFloat(rastrum.getAttribute('width')) + rx
          x = Math.min(rx, x)
          y = Math.min(ry, y)
          x2 = Math.max(rw, x2)
        })

        systemZone.setAttribute('type', 'sb')
        systemZone.setAttribute('ulx', (x * factor).toFixed(1))
        systemZone.setAttribute('bw.lrx', (x2 * factor).toFixed(1))
        systemZone.setAttribute('bw.rastrumIDs', rastrumIDs.join(' '))
        systemZone.setAttribute('uly', (y * factor).toFixed(1)) // todo: how to determine sb/@uly properly? This is not the same as staff/@uly!!!!
        node.setAttribute('facs', '#' + systemZone.getAttribute('xml:id'))
      } else if (name === 'measure') {
        const measureZone = appendNewElement(outSurface, 'zone')
        measureZone.setAttribute('type', 'measure')

        let measureX = pageMM.w * factor
        let measureX2 = 0
        node.querySelectorAll('*').forEach(child => {
          if (child.hasAttribute('x')) {
            const x = parseFloat(child.getAttribute('x')) * factor
            measureX = Math.min(measureX, x)
            measureX2 = Math.max(measureX2, x)
          }
          if (child.hasAttribute('x2')) {
            const x = parseFloat(child.getAttribute('x2')) * factor
            measureX2 = Math.max(measureX2, x)
          }

          const childName = child.localName
          const supportedElements = ['note', 'staff', 'accid']
          const ignoreElements = ['layer']

          if (supportedElements.indexOf(childName) !== -1) {
            const childZone = appendNewElement(outSurface, 'zone')
            childZone.setAttribute('type', childName)

            if (childName === 'note' || childName === 'accid') {
              childZone.setAttribute('ulx', (parseFloat(child.getAttribute('x')) * factor).toFixed(1))
            } else if (childName === 'staff') {
              const staffN = parseInt(child.getAttribute('n'))
              const getSbZone = (node) => {
                let sibling = node
                while (sibling) {
                  if (sibling.hasAttribute('type') && sibling.getAttribute('type') === 'sb') {
                    return sibling // Found the matching sibling
                  }
                  sibling = sibling.previousElementSibling // Move to the next preceding sibling
                }
                return null
              }
              const sbZone = getSbZone(childZone)
              const rastrumID = sbZone.getAttribute('bw.rastrumIDs').split(' ')[staffN - 1]
              const rastrum = layout.querySelector('rastrum[xml\\:id="' + rastrumID + '"]')
              const staffY = parseFloat(rastrum.getAttribute('system.topmar')) * factor
              childZone.setAttribute('uly', staffY.toFixed(1))
            }

            child.setAttribute('facs', '#' + childZone.getAttribute('xml:id'))
          } else if (ignoreElements.indexOf(childName) === -1) {
            console.warn('Unsupported element in diplomatic transcription: ' + childName)
            // todo: autogenerate an issue for unsupported elements?! If so, leave a stack trace of the file in which they occur?
          }
        })

        / * TODO: make this work again
        const sbZone = measureZone.previousElementSibling
        const sbX = parseFloat(sbZone.getAttribute('ulx'))
        const sbX2 = parseFloat(sbZone.getAttribute('bw.lrx'))

        measureX = Math.max(measureX - 10 * factor, sbX) // give 1cm margin, if possible
        measureX2 = Math.min(measureX2 + 10 * factor, sbX2) // give 1cm margin, if possible

        measureZone.setAttribute('ulx', measureX.toFixed(1))
        measureZone.setAttribute('lrx', measureX2.toFixed(1))
        * /
        node.setAttribute('facs', '#' + measureZone.getAttribute('xml:id'))
      }
      // outDom.querySelector('section').appendChild(node)
    })
  } catch (err) {
    console.error('Error in prepareDtForRendering: ' + err, err)
  }
  return outDom
}

export const appendNewElement = (parent, name, ns = 'http://www.music-encoding.org/ns/mei') => {
  const elem = parent.appendChild(document.createElementNS(ns, name))
  if (ns === 'http://www.w3.org/2000/svg') {
    elem.setAttribute('id', 's' + uuid())
  } else {
    elem.setAttribute('xml:id', 'x' + uuid())
  }
  return elem
} */
/*
function convertDiploTransEvent (event) {
  const name = event.localName

  if (name === 'note') {
    getRenderableDiplomaticNote(event)
  }

  return event
}
*/
/**
 * converts a diplomatic note to something renderable
 * @param {*} note the diplomatic note to be translated
 */
/*
function getRenderableDiplomaticNote (note) {
  const headshape = note.getAttribute('head.shape')
  let dur = 4
  if (headshape === 'whole') {
    dur = 1
  } else if (headshape === 'half') {
    dur = 2
  }

  // TODO DIPLOTRANS: Wie mit kürzeren Notenwerten umgehen? überhaupt wichtig?
  note.setAttribute('dur', dur)
}
*/
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
