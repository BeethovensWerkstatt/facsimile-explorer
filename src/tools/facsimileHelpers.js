/**
 * This file contains helper functions for dealing with measurements in OpenSeadragon
 */

/**
 * gets the rotated bbox _around_ the straight IIIF media fragment rect
 * @param  {[type]} OpenSeadragon         the abstract OpenSeadragon object
 * @param  {[type]} getters               gives access to all vuex getters
 * @return {[type]}               [description]
 */
export function getMediaFragmentBBoxRect (OpenSeadragon, getters) {
  const fragment = getMediaFragmentRect(OpenSeadragon, getters)
  const rotationMode = OpenSeadragon.OverlayRotationMode.BOUNDING_BOX

  return { location: fragment.location, rotationMode }
}

/**
 * gets a rect with the straight (=unrotated) media fragment
 * @param  {[type]} OpenSeadragon         the abstract OpenSeadragon object
 * @param  {[type]} getters               gives access to all vuex getters
 * @return {[type]}                [description]
 */
export function getMediaFragmentRect (OpenSeadragon, getters) {
  const pageIndex = getters.currentPageZeroBased
  const path = getters.filepath
  const pages = getters.documentPagesForSidebars(path)

  const page = pages[pageIndex]
  if (!page || !page.uri) {
    return null
  }

  const fragmentRaw = page.uri.split('#xywh=')[1]
  const fragment = {
    x: 0,
    y: 0,
    w: parseInt(page.width),
    h: parseInt(page.height),
    rotate: 0
  }

  if (fragmentRaw !== undefined) {
    const xywh = fragmentRaw.split('&rotate=')[0]
    const rotate = fragmentRaw.split('&rotate=')[1]

    fragment.x = parseFloat(xywh.split(',')[0])
    fragment.y = parseFloat(xywh.split(',')[1])
    fragment.w = parseFloat(xywh.split(',')[2])
    fragment.h = parseFloat(xywh.split(',')[3])

    if (rotate !== undefined) {
      fragment.rotate = parseFloat(rotate.split(',')[0])
    }
  }

  const deg = fragment.rotate

  const pageRect = new OpenSeadragon.Rect(0, 0, page.mmWidth, page.mmHeight, deg)
  const pageBBox = pageRect.getBoundingBox()

  console.log('pageBBox from rendering', pageBBox)

  // const xScale = pageBBox.width / fragment.w

  // const imageOriginX = fragment.x * xScale * -1
  // const imageOriginY = fragment.y * xScale * -1
  // const imageOriginW = xScale * page.width
  // const bbox = new OpenSeadragon.Rect(pageBBox.getTopLeft().x * xScale, pageBBox.getTopLeft().y * xScale, xScale * page.width, xScale * page.height)

  const rotationMode = OpenSeadragon.OverlayRotationMode.EXACT

  return { location: pageBBox, rotationMode }
}

/**
 * gets a rect around the actual page
 * @param  {[type]} OpenSeadragon               [description]
 * @param  {[type]} getters                     [description]
 * @return {[type]}               [description]
 */
export function getMediaFragmentInnerBoxRect (OpenSeadragon, getters) {
  const pageDimensions = getters.currentPageDimensions

  if (!pageDimensions) {
    return null
  }

  const width = parseFloat(pageDimensions.mmWidth)
  const height = parseFloat(pageDimensions.mmHeight)

  const location = new OpenSeadragon.Rect(0, 0, width, height)
  const rotationMode = OpenSeadragon.OverlayRotationMode.NO_ROTATION

  return { location, rotationMode }
}

/**
 * returns the suggested position for a new rastrum on the current page
 * @return {[type]} [description]
 */
export function suggestRastrum (getters) {
  const existingRastrums = getters.rastrumsOnCurrentPage
  const page = getters.currentPageDetails

  const pageWidth = parseFloat(page.mmWidth)

  let leftmar = page.position === 'verso' ? 34 : 23
  let rightmar = page.position === 'recto' ? 34 : 23
  let topmar = 15
  let height = 7
  let rotate = 0
  let systemDistance = 6

  /*
  const mm = {
    x: parseFloat(rastrum.getAttribute('system.leftmar')),
    y: parseFloat(rastrum.getAttribute('system.topmar')),
    w: parseFloat(rastrum.getAttribute('width')),
    h: parseFloat(rastrum.getAttribute('system.height')),
    rotate: rastrum.hasAttribute('rotate') ? parseFloat(rastrum.getAttribute('rotate')) : 0
  }
   */

  if (existingRastrums.length === 1) {
    leftmar = parseFloat(existingRastrums[0].x)
    rightmar = pageWidth - leftmar - existingRastrums[0].w
    topmar = parseFloat(existingRastrums[0].y) + parseFloat(existingRastrums[0].h) + systemDistance
    height = parseFloat(existingRastrums[0].h)
    rotate = parseFloat(existingRastrums[0].rotate)
  } else if (existingRastrums.length > 1) {
    systemDistance = parseFloat(existingRastrums[1].y) - parseFloat(existingRastrums[0].y) - parseFloat(existingRastrums[0].h)
    const last = existingRastrums.pop()

    leftmar = parseFloat(last.x)
    rightmar = pageWidth - leftmar - last.w
    topmar = parseFloat(last.y) + parseFloat(last.h) + systemDistance
    height = parseFloat(last.h)
    rotate = parseFloat(last.rotate)
  }

  const w = pageWidth - leftmar - rightmar

  const rastrum = {
    x: parseFloat(leftmar.toFixed(1)),
    y: parseFloat(topmar.toFixed(1)),
    w: parseFloat(w.toFixed(1)),
    h: height,
    rotate
  }

  return rastrum
}
