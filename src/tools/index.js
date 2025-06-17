
export class Vector {
  constructor (x, y) {
    this.x = x
    this.y = y
  }

  add (vector) {
    return new Vector(this.x + vector.x, this.y + vector.y)
  }

  sub (vector) {
    return new Vector(this.x - vector.x, this.y - vector.y)
  }

  mul (scalar) {
    return new Vector(this.x * scalar, this.y * scalar)
  }

  div (scalar) {
    return new Vector(this.x / scalar, this.y / scalar)
  }

  length () {
    return Math.sqrt(this.x ** 2 + this.y ** 2)
  }

  normalize () {
    const length = this.length()
    return new Vector(this.x / length, this.y / length)
  }

  dot (vector) {
    return this.x * vector.x + this.y * vector.y
  }

  toString () {
    // console.log(837, 'Vector.toString()', `${this.x.toFixed(2)},${this.y.toFixed(2)}`)
    // round to 2 decimals
    return `${this.x.toFixed(2)},${this.y.toFixed(2)}`
  }
}

export const flattenarray = (arr) => {
  return arr.reduce((acc, val) => {
    if (Array.isArray(val)) {
      acc.push(...flattenarray(val))
    } else {
      acc.push(val)
    }
    return acc
  }, [])
}

/**
 * get control points from verovio generated slur bezier
 * @param {string} pathstr
 * @returns control points of cubic bezier as flat array
 */
export const verovioSvgBezierToControlpoints = (pathstr) => {
  const pbreg = /(([CM]?)([+-.\d]+),([+-.\d]+))/
  const d = []
  let pos = []
  let bezier = []
  for (const e of pathstr.split(' ')) {
    const m = pbreg.exec(e)
    if (m) {
      if (m[2] === 'M') {
        pos = [+m[3], +m[4]]
      } else if (m[2] === 'C') {
        bezier = [pos, [+m[3], +m[4]]]
      } else if (m[2] === '') {
        bezier.push([+m[3], +m[4]])
        if (bezier.length === 4) {
          d.push(bezier)
          pos = bezier[3]
          bezier = []
        }
      }
    }
  }
  const Q = []
  for (const i in d[0]) {
    Q.push((d[0][i][0] + d[1][3 - i][0]) / 2)
    Q.push((d[0][i][1] + d[1][3 - i][1]) / 2)
  }
  return Q
}

/**
 * generate string for SVG path element
 * @param {*} Q control points
 * @param {*} w width of slur
 * @returns
 */
export const controlpointsToVerovioSvgBezier = (Q, w = 1) => {
  // console.log(837, 'controlpointsToVerovioSvgBezier')
  if (!Q?.length) {
    return ''
  }
  w /= 2
  const c1 = new Vector(Q[0], Q[1])
  const c2 = new Vector(Q[2], Q[3])
  const c3 = new Vector(Q[4], Q[5])
  const c4 = new Vector(Q[6], Q[7])
  const d = c2.add(c3).div(2).sub(c1.add(c4).div(2)).normalize().mul(w)
  const c2a = c2.add(d)
  const c2b = c2.sub(d)
  const c3a = c3.add(d)
  const c3b = c3.sub(d)
  // console.log(837, 'controlpointsToVerovioSvgBezier', `M${c1} C${c2a} ${c3a} ${c4} C${c3b} ${c2b} ${c1}`)
  return `M${c1} C${c2a} ${c3a} ${c4} C${c3b} ${c2b} ${c1}`
}

/**
 * calculate default control points for slur inside bounding box
 * @param {number} x upper left x
 * @param {number} y upper left y
 * @param {number} width width
 * @param {number} height height
 * @param {boolean=true} up wether the slur is up or down
 * @returns array of control points
 */
export const boundingboxDefaultControlpoints = (bbox, up = true) => {
  const { mm: { x, y, w, h } } = bbox
  const controlfactor = 1.5 // factor from box height to controlpoint distance
  const c3 = new Vector(x, y)
  const c4 = new Vector(x + w, y)
  const c1 = new Vector(x + w, y + h)
  const c2 = new Vector(x, y + h)
  const m = c1.add(c3).div(2)
  const cp3 = up ? c1 : c4
  // calculate middle control point for binary bezier curve
  const cp2 = up ? m.sub(new Vector(0, h * controlfactor)) : m.add(new Vector(0, h * controlfactor))
  const cp1 = up ? c2 : c3

  // calculate control points for cubic bezier curve
  const q = [
    cp1.x, cp1.y,
    (1 / 3) * cp1.x + (2 / 3) * cp2.x,
    (1 / 3) * cp1.y + (2 / 3) * cp2.y,
    (2 / 3) * cp2.x + (1 / 3) * cp3.x,
    (2 / 3) * cp2.y + (1 / 3) * cp3.y,
    cp3.x, cp3.y
  ]
  // console.log(bbox, q)
  return q
}
