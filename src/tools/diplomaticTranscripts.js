// import OpenSeadragon from 'openseadragon'
// import store from '@/store'
// import { controlpointsToVerovioSvgBezier } from '.'
// import store from '@/store'
// import { appendNewElement } from './mei'

/**
 * get control points for curve bezier attribute for rastrum on position x/y with factor (default 90)
 */
export const scaleXYControlpoints = (bezier, { x, y }, factor = 90) => bezier.map((c, i) => factor * (c + (i % 2 ? y : x)))

/**
 * Calculate the minimum distance between two bounding boxes
 * @param {Object} targetBbox - The target bbox {x, y, width, height}
 * @param {Object} systemBbox - The system bbox {x, y, width, height}
 * @returns {number} The minimum distance between the bboxes (0 if overlapping)
 */
const calculateBboxDistance = (targetBbox, systemBbox) => {
  // If bboxes overlap, distance is 0
  const xOverlap = targetBbox.x < (systemBbox.x + systemBbox.width) && (targetBbox.x + targetBbox.width) > systemBbox.x
  const yOverlap = targetBbox.y < (systemBbox.y + systemBbox.height) && (targetBbox.y + targetBbox.height) > systemBbox.y

  if (xOverlap && yOverlap) {
    return 0 // Overlapping
  }

  if (xOverlap) {
    // Horizontally aligned, calculate vertical distance
    const topDist = Math.abs(targetBbox.y - (systemBbox.y + systemBbox.height))
    const bottomDist = Math.abs((targetBbox.y + targetBbox.height) - systemBbox.y)
    return Math.min(topDist, bottomDist)
  }

  if (yOverlap) {
    // Vertically aligned, calculate horizontal distance
    const leftDist = Math.abs(targetBbox.x - (systemBbox.x + systemBbox.width))
    const rightDist = Math.abs((targetBbox.x + targetBbox.width) - systemBbox.x)
    return Math.min(leftDist, rightDist)
  }

  // No overlap, calculate corner-to-corner distance
  const corners = [
    { x: systemBbox.x, y: systemBbox.y },
    { x: systemBbox.x + systemBbox.width, y: systemBbox.y },
    { x: systemBbox.x, y: systemBbox.y + systemBbox.height },
    { x: systemBbox.x + systemBbox.width, y: systemBbox.y + systemBbox.height }
  ]
  const targetCorners = [
    { x: targetBbox.x, y: targetBbox.y },
    { x: targetBbox.x + targetBbox.width, y: targetBbox.y },
    { x: targetBbox.x, y: targetBbox.y + targetBbox.height },
    { x: targetBbox.x + targetBbox.width, y: targetBbox.y + targetBbox.height }
  ]

  let minDist = Infinity
  corners.forEach(corner => {
    targetCorners.forEach(targetCorner => {
      const dist = Math.sqrt(
        Math.pow(corner.x - targetCorner.x, 2) +
        Math.pow(corner.y - targetCorner.y, 2)
      )
      minDist = Math.min(minDist, dist)
    })
  })
  return minDist
}

/**
 * Calculate relative position of a clicked shape to the top rastrum of a system
 * @param {Object} targetBbox - The bbox of the clicked shape {x, y, width, height}
 * @param {Object} targetSystem - The system element containing the shape
 * @param {Array} rastrumsOnCurrentPage - Array of available rastrums
 * @param {Object} rects - Conversion ratios and image coordinates
 * @returns {Object|null} Relative position info {relativeX, relativeY, topRastrum, rastrumId}
 */
const calculateRelativePosition = (targetBbox, targetSystem, rastrumsOnCurrentPage, rects) => {
  // Get rastrum IDs from staffDef elements in the system
  const staffDefs = targetSystem.element.querySelectorAll('staffDef')
  const rastrumIds = []
  staffDefs.forEach(staffDef => {
    const declsAttr = staffDef.getAttribute('decls')
    if (declsAttr) {
      const rastrumId = declsAttr.split('#')[1]
      rastrumIds.push(rastrumId)
    }
  })

  // Get rastrums that belong to this system
  const systemRastrums = rastrumsOnCurrentPage.filter(rastrum =>
    rastrumIds.includes(rastrum.id)
  )

  if (systemRastrums.length === 0) {
    console.warn('No rastrums found for system:', targetSystem.id)
    return null
  }

  // Find top rastrum (smallest y coordinate - topmar)
  const topRastrum = systemRastrums.reduce((top, current) => {
    const currentTopmar = current.y || 0
    const topTopmar = top.y || 0
    return currentTopmar < topTopmar ? current : top
  }, systemRastrums[0])

  // Convert clicked position from px to mm
  const clickedMmX = targetBbox.x / rects.ratio + rects.image.x
  const clickedMmY = targetBbox.y / rects.ratio + rects.image.y

  // Get rastrum position and rotation
  const rastrumLeftmar = topRastrum.x || 0
  const rastrumTopmar = topRastrum.y || 0
  const rastrumRotate = topRastrum.rotate || 0

  // Calculate relative position (before rotation)
  let relativeX = clickedMmX - rastrumLeftmar
  let relativeY = clickedMmY - rastrumTopmar

  // Account for rotation if needed (rotate around rastrum origin)
  if (rastrumRotate !== 0) {
    // Apply inverse rotation to get position relative to unrotated rastrum
    const cos = Math.cos(-rastrumRotate) // negative for inverse
    const sin = Math.sin(-rastrumRotate)
    const rotatedX = relativeX * cos - relativeY * sin
    const rotatedY = relativeX * sin + relativeY * cos
    relativeX = rotatedX
    relativeY = rotatedY
  }

  return {
    relativeX,
    relativeY,
    topRastrum,
    rastrumId: topRastrum.id
  }
}

/**
 * Identify the closest system to a clicked shape based on spatial proximity
 * @param {Object} targetBbox - The bbox of the clicked shape {x, y, width, height}
 * @param {NodeList} systems - NodeList of system elements from MEI DOM
 * @param {NodeList} wzShapes - NodeList of SVG path elements in the writing zone
 * @param {Array} rastrumsOnCurrentPage - Array of available rastrums (optional, for relative positioning)
 * @param {Object} rects - Conversion ratios and image coordinates (optional, for relative positioning)
 * @returns {Object|null} System information {element, id, n, bounds, distance, relativePosition?} or null if no systems
 */
export const identifyClosestSystem = (targetBbox, systems, wzShapes, rastrumsOnCurrentPage = null, rects = null) => {
  if (!systems || systems.length === 0) {
    return null
  }

  let targetSystem = null

  // If there's only one system, use it directly
  if (systems.length === 1) {
    const sys = systems[0]
    targetSystem = {
      element: sys,
      id: sys.getAttribute('xml:id'),
      n: sys.getAttribute('n'),
      bounds: null, // no bbox calculation needed
      distance: 0 // single system, so distance is irrelevant
    }
  } else {
    // Multiple systems - find the closest one by distance
    let closestDistance = Infinity

    systems.forEach(sys => {
      let x, y, w, h

      // Calculate system bounding box from all its shapes
      sys.querySelectorAll('*[facs]').forEach(facsHolder => {
        const refs = facsHolder.getAttribute('facs')?.split(' ') || []
        refs.forEach(ref => {
          const refId = ref.split('#')[1]
          const shape = [...wzShapes].find(s => s.id === refId)
          if (shape) {
            const sbbox = shape.getBBox()
            if (x === undefined || sbbox.x < x) x = sbbox.x
            if (y === undefined || sbbox.y < y) y = sbbox.y
            if (w === undefined || sbbox.x + sbbox.width > w) w = sbbox.x + sbbox.width
            if (h === undefined || sbbox.y + sbbox.height > h) h = sbbox.y + sbbox.height
          }
        })
      })

      // Calculate distance if we have a valid system bbox
      if (x !== undefined && y !== undefined && w !== undefined && h !== undefined) {
        const systemBbox = { x, y, width: w - x, height: h - y }
        const distance = calculateBboxDistance(targetBbox, systemBbox)

        if (distance < closestDistance) {
          closestDistance = distance
          targetSystem = {
            element: sys,
            id: sys.getAttribute('xml:id'),
            n: sys.getAttribute('n'),
            bounds: { x, y, w, h },
            distance: distance
          }
        }
      }
    })
  }

  // Calculate relative position if we have the required data
  if (targetSystem && rastrumsOnCurrentPage && rects) {
    const relativePosition = calculateRelativePosition(targetBbox, targetSystem, rastrumsOnCurrentPage, rects)
    targetSystem.relativePosition = relativePosition
  }

  return targetSystem
}
