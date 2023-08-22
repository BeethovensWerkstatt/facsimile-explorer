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
  const pageDimensions = getters.currentPageDimensions

  if (!pageDimensions) {
    return null
  }

  const location = new OpenSeadragon.Rect(0, 0, parseFloat(pageDimensions.mmWidth), parseFloat(pageDimensions.mmHeight))
  const placement = OpenSeadragon.Placement.CENTER
  const rotationMode = OpenSeadragon.OverlayRotationMode.BOUNDING_BOX

  return { location, placement, rotationMode }
}

/**
 * gets a rect with the straight (=unrotated) media fragment
 * @param  {[type]} OpenSeadragon         the abstract OpenSeadragon object
 * @param  {[type]} getters               gives access to all vuex getters
 * @return {[type]}                [description]
 */
export function getMediaFragmentRect (OpenSeadragon, getters) {
  const pageDimensions = getters.currentPageDimensions
  // const deg = getters.currentPageRotation

  if (!pageDimensions) {
    return null
  }

  const location = new OpenSeadragon.Rect(0, 0, parseFloat(pageDimensions.mmWidth), parseFloat(pageDimensions.mmHeight))
  const rotationMode = OpenSeadragon.OverlayRotationMode.EXACT

  return { location, rotationMode }
}

/**
 * gets a rect around the actual page
 * @param  {[type]} OpenSeadragon               [description]
 * @param  {[type]} getters                     [description]
 * @return {[type]}               [description]
 */
export function getMediaFragmentInnerBoxRect (OpenSeadragon, getters) {
  const pageDimensions = getters.currentPageDimensions
  const deg = getters.currentPageRotation

  if (!pageDimensions) {
    return null
  }

  const width = parseFloat(pageDimensions.mmWidth)
  const height = parseFloat(pageDimensions.mmHeight)

  const center = new OpenSeadragon.Point(width / 2, height / 2)
  const tl = new OpenSeadragon.Point(0, 0)
  const centerRotated = center.rotate(deg, tl)

  const offsetX = Math.abs(center.x - centerRotated.x)
  const offsetY = Math.abs(center.y - centerRotated.y)

  const irX = deg < 0 ? center.x - width / 2 + offsetX * 2 : center.x - width / 2
  const irY = deg < 0 ? center.y - height / 2 : center.y - height / 2 + offsetY * 2
  const irW = deg < 0 ? width - offsetX * 2 : width - offsetX * 2
  const irH = deg < 0 ? height - offsetY * 2 : height - offsetY * 2

  const location = new OpenSeadragon.Rect(irX, irY, irW, irH)
  const rotationMode = OpenSeadragon.OverlayRotationMode.NO_ROTATION

  return { location, rotationMode }
}
