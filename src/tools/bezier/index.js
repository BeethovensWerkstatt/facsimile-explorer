import { bezier_norm, bezier_point } from "./bezier_tools"

/**
 * get control points from verovio generated slur bezier
 * @param {string} pathstr
 * @returns control points of cubic bezier as flat array
 */
export const verovio_svg_bezier_to_controlpoints = (pathstr) => {
  const pbreg = /(([CM]?)(\d+),(\d+))/
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
export const controlpoints_to_verovio_svg_bezier = (Q, w = 1) => {
  const p1 = bezier_point(Q, 1/3)
  const n1 = bezier_norm(Q, 1/3)
  const p2 = bezier_point(Q, 2/3)
  const n2 = bezier_norm(Q, 2/3)
  const a1 = [p1[0] + w * n1[0], p1[1] + w * n1[1]]
  const a2 = [p2[0] + w * n2[0], p2[1] + w * n2[1]]
  const b1 = [p1[0] - w * n1[0], p1[1] - w * n1[1]]
  const b2 = [p2[0] - w * n2[0], p2[1] - w * n2[1]]
  return `M${Q[0]},${Q[1]} C${a1.join(',')} ${a2.join(',')} ${Q[6]},${Q[7]} C${b2.join(',')} ${b1.join(',')} ${Q[0]},${Q[1]}`
}
