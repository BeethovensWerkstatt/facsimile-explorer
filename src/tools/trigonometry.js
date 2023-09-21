/**
 * @module toolbox/trigonometry
 */

/**
 * Returns an object with all information, coming from a fragment identifier
 * @param  {[type]} fragment             a string in fragmentIdentifier format, i.e. #xywh=100,200,1000,600&rotate=7.3
 * @return {[type]}        [description]
 */
export function getRectFromFragment (fragment) {
  // console.log('\ntrying to parse fragment ' + fragment)
  const xywh = fragment.split('&rotate=')[0].split('xywh=')[1].split(',')
  const degProvided = fragment.split('&rotate=')[1]
  const deg = degProvided !== undefined ? parseFloat(degProvided.split(',')[0]) : 0

  const x = parseFloat(xywh[0])
  const y = parseFloat(xywh[1])
  const w = parseFloat(xywh[2])
  const h = parseFloat(xywh[3])

  // the outer rectangle
  const outer = {
    ul: { x: x, y: y },
    ur: { x: x + w, y: y },
    lr: { x: x + w, y: y + h },
    ll: { x: x, y: y + h },
    w: w,
    h: h
  }

  const center = {
    x: x + w / 2,
    y: y + h / 2
  }

  const inner = {
    ul: rotatePoint(outer.ul, center, deg),
    ur: rotatePoint(outer.ur, center, deg),
    lr: rotatePoint(outer.lr, center, deg),
    ll: rotatePoint(outer.ll, center, deg)
  }

  inner.w = getDistance(inner.ul, inner.ur)
  inner.h = getDistance(inner.ul, inner.ll)

  const rotate = {
    deg,
    handle: {
      x: parseFloat((inner.ur.x + inner.lr.x) / 2),
      y: parseFloat((inner.ur.y + inner.lr.y) / 2)
    }
  }

  const fragmentIdentifier = degProvided !== undefined ? fragment + degProvided : fragment + '&rotate=0'

  return { outer, inner, rotate, center, fragmentIdentifier }
}

/**
 * Returns an object with all information, coming from four inner points
 * @param  {[type]} p1               [description]
 * @param  {[type]} p2               [description]
 * @param  {[type]} p3               [description]
 * @param  {[type]} p4               [description]
 * @return {[type]}    [description]
 */
export function getRectFromPoints (p1, p2, p3, p4) {
  const center = {
    x: (parseFloat(p1.x) + parseFloat(p2.x) + parseFloat(p3.x) + parseFloat(p4.x)) / 4,
    y: (parseFloat(p1.y) + parseFloat(p2.y) + parseFloat(p3.y) + parseFloat(p4.y)) / 4
  }

  const inner = {}
  const outer = {}

  // function to identify position of a point as one of the corners of the rect
  const determinePosition = (p) => {
    if (p.x < center.x) {
      if (p.y < center.y) {
        inner.ul = p
      } else {
        inner.ll = p
      }
    } else {
      if (p.y < center.y) {
        inner.ur = p
      } else {
        inner.lr = p
      }
    }
  }

  determinePosition(p1)
  determinePosition(p2)
  determinePosition(p3)
  determinePosition(p4)

  inner.w = getDistance(inner.ul, inner.ur)
  inner.h = getDistance(inner.ul, inner.ll)

  outer.ul = { x: Math.min(inner.ul.x, inner.ll.x), y: Math.min(inner.ul.y, inner.ur.y) }
  outer.ur = { x: Math.max(inner.ur.x, inner.lr.x), y: Math.min(inner.ul.y, inner.ur.y) }
  outer.lr = { x: Math.max(inner.ur.x, inner.lr.x), y: Math.max(inner.ll.y, inner.lr.y) }
  outer.ll = { x: Math.min(inner.ul.x, inner.ll.x), y: Math.max(inner.ll.y, inner.lr.y) }
  outer.w = outer.ur.x - outer.ul.x
  outer.h = outer.ll.y - outer.ul.y

  const rotate = {
    deg: determineDeg(inner.ul, inner.ll),
    handle: {
      x: parseFloat((inner.ur.x + inner.lr.x) / 2),
      y: parseFloat((inner.ur.y + inner.lr.y) / 2)
    }
  }

  const x = outer.ul.x
  const y = outer.ul.y
  const w = outer.w
  const h = outer.h

  const fragmentIdentifier = '#xywh=' + x + ',' + y + ',' + w + ',' + h + '&rotate=' + rotate

  return { outer, inner, rotate, center, fragmentIdentifier }
}

export function getRectFromCenterAndRotation (center, rotate) {
  //
}

export function getOuterBoundingRect (x, y, w, h, deg) {
  const center = {
    x: parseFloat(x) + parseFloat(w) / 2,
    y: parseFloat(y) + parseFloat(h) / 2
  }

  if (parseFloat(deg) === 0) {
    return { x, y, w, h }
  }

  const absDeg = Math.abs(deg)
  const rad = deg2rad(absDeg)
  const newWidth = parseFloat(w) * Math.cos(rad) + parseFloat(h) * Math.sin(rad)
  const newHeight = parseFloat(w) * Math.sin(rad) + parseFloat(h) * Math.cos(rad)

  /* let newX, newY

  if (deg < 0) {
    newX = parseFloat(x)
    newY = parseFloat(y) - parseFloat(w) * Math.sin(rad)
  } else {
    newX = parseFloat(x) - parseFloat(h) * Math.sin(rad)
    newY = parseFloat(y)
  } */

  const tlUnrotated = {
    x: center.x - newWidth / 2,
    y: center.y - newHeight / 2
  }

  const tl = rotatePoint(tlUnrotated, center, deg * -1)
  // console.log('x:' + tl.x + ' vs ' + newX + ' / y: ' + tl.y + ' vs ' + newY)
  const rect = {
    x: tl.x,
    y: tl.y,
    w: newWidth,
    h: newHeight
  }

  return rect
  // (305 * Math.cos(5 * Math.PI / 180)) + (232 * Math.sin(5 * Math.PI / 180))
}

/**
 * returns the rotation between two points in degrees
 * @param  {Object} p1               the upper point, an object with x and y props
 * @param  {Object} p2               the lower point, an object with x and y props
 * @return {Number}    the rotation in degrees, positive = clockwise
 */
function determineDeg (p1, p2) {
  const dy = p2.y - p1.y
  const dx = p2.x - p1.x
  let theta = Math.atan2(dy, dx) // range (-PI, PI]
  theta *= 180 / Math.PI // rads to degs, range (-180, 180]

  theta -= 90

  return parseFloat(theta.toFixed(3))
}

/**
 * calculates radians from degrees
 * @param  {[type]} deg               [description]
 * @return {[type]}     [description]
 */
function deg2rad (deg) {
  // console.log('\n\ndeg2rad. deg="' + deg + '", rad="' + deg * (Math.PI / 180) + '"')
  return deg * (Math.PI / 180)
}

/**
 * rotate point around specified center
 * @param  {[type]} point                a point with x and y props
 * @param  {[type]} center               a point with x and y props
 * @param  {[type]} deg                  the rotation in degrees
 * @return {[type]}        a point with x and y props
 */
export function rotatePoint (point, center, deg) {
  const xOff = center.x
  const yOff = center.y

  const x = point.x - xOff
  const y = point.y - yOff

  const rad = deg2rad(deg)

  const x1 = x * Math.cos(rad) - y * Math.sin(rad)
  const y1 = x * Math.sin(rad) + y * Math.cos(rad)

  const newPoint = {
    x: x1 + xOff, // Math.cos(rad) * dist + xOff,
    y: y1 + yOff // Math.sin(rad) * dist + xOff
  }

  // console.log('rotating points', deg, /* point, { x, y }, dist, */ rad, newPoint, center)

  return newPoint
}

/**
 * calculates the distance between two points in pixels
 * @param  {Object} pointA               an object with x and y props
 * @param  {Object} pointB               an object with x and y props
 * @return {Number}        The distance in pixels
 */
export function getDistance (pointA, pointB) {
  const a = Math.abs(pointA.x - pointB.x)
  const b = Math.abs(pointA.y - pointB.y)
  const c = Math.sqrt(a * a + b * b)

  return c
}
