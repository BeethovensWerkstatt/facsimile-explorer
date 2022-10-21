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

export function createElement (type, system, id) {
  const layer = system.querySelector('layer')

  let localName
  switch (type) {
    case 'notes':
      localName = 'note'
      break

    case 'accidental':
      localName = 'accid'
      break

    case 'rests':
    case 'barlines':
    case 'beams':
    case 'dynamics':
    case 'artic':
    case 'text':
    case 'other':
    default:
      localName = type
  }

  const elem = document.createElementNS('http://www.music-encoding.org/ns/mei', localName)
  elem.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:id', id)

  layer.append(document.createTextNode('\n                                  '))
  layer.append(elem)
  layer.append(document.createTextNode('\n                                '))
}
