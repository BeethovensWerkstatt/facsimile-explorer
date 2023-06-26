import { uuid } from '@/tools/uuid.js'

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
  const children = [...svg.children]

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
 * @return {[type]}           [description]
 */
export function convertRectUnits (dom, surfaceId, xywh, dir) {
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

  const pxOffsetX = xywhParam.split(',')[0]
  const pxOffsetY = xywhParam.split(',')[1]
  const pageWidthPx = xywhParam.split(',')[2]
  const pageHeightPx = xywhParam.split(',')[3]

  const folium = [...dom.querySelectorAll('foliaDesc *')].find(foliumLike => {
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

  const pageWidthMm = folium.getAttribute('width')
  const pageHeightMm = folium.getAttribute('height')

  const scaleFactorHeight = pageHeightMm / pageHeightPx
  const scaleFactorWidth = pageWidthMm / pageWidthPx

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
    rect.x = parseFloat(((xywh.x - pxOffsetX) * scaleFactorWidth).toFixed(2))
    rect.y = parseFloat(((xywh.y - pxOffsetY) * scaleFactorHeight).toFixed(2))
    rect.w = parseFloat((xywh.w * scaleFactorWidth).toFixed(2))
    rect.h = parseFloat((xywh.h * scaleFactorHeight).toFixed(2))

    return rect
  } else {
    const rect = {}
    rect.x = Math.round(xywh.x / scaleFactorWidth + pxOffsetX)
    rect.y = Math.round(xywh.y / scaleFactorHeight + pxOffsetY)
    rect.w = Math.round(xywh.w / scaleFactorWidth)
    rect.h = Math.round(xywh.h / scaleFactorHeight)

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
