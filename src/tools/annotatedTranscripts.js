import store from '@/store'

/**
 * improves display of <sb> and <pb> indicators in the SVG rendered from Verovio
 * @param {*} svgDom
 * @param {*} atDom
 */
export const resolveSbIndicators = (svgDom, atDom, getters) => {
  const wzBegins = svgDom.querySelectorAll('g.annot:not(.bounding-box)')

  const getMeasure = (node) => {
    let sibling = node.nextElementSibling
    while (sibling) {
      if (sibling.getAttribute('data-class') === 'measure') {
        return sibling
      }
      sibling = sibling.nextElementSibling
    }
    return null
  }

  const staffLines = getMeasure(wzBegins[0]).querySelectorAll('g.staff > path')
  const staffHeight = +staffLines[4].getAttribute('d').split(' ')[1] - +staffLines[0].getAttribute('d').split(' ')[1]
  const fontSize = staffHeight / 1.5

  // const path = getters.filepath
  // const pages = getters.documentPagesForSidebars(path)

  // console.log('\n\n\n911 wzBegins', wzBegins)

  wzBegins.forEach((wzb, i) => {
    const content = []
    const box = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    box.setAttribute('class', 'writingZone')
    box.setAttribute('data-id', 'wz_' + wzb.getAttribute('data-id'))
    box.setAttribute('data-class', 'writingZone')

    let next = wzb.nextElementSibling
    while (next && !next.classList.contains('annot')) {
      if (next.classList.contains('sb')) {
        // console.log(912, 'found sb', next)

        const sysBox = document.createElementNS('http://www.w3.org/2000/svg', 'g')
        sysBox.setAttribute('class', 'systemBegin')
        sysBox.setAttribute('data-class', 'systemBegin')
        sysBox.setAttribute('data-id', next.getAttribute('data-id'))
        sysBox.setAttribute('data-system-id', next.hasAttribute('data-corresp') ? next.getAttribute('data-corresp').split('#')[1] : '')

        content.push(sysBox)
        const sysBoxContent = []

        let sysNext = next.nextElementSibling
        while (sysNext && !sysNext.classList.contains('sb') && !sysNext.classList.contains('pb')) {
          sysBoxContent.push(sysNext)
          sysNext = sysNext.nextElementSibling
        }
        sysBoxContent.forEach((node) => {
          sysBox.append(node)
        })
        box.append(sysBox)
      }

      if (!next.classList.contains('pb')) {
        content.push(next)
      }
      next = next.nextElementSibling
    }
    const parent = wzb.parentElement
    box.append(wzb.cloneNode(true))
    content.forEach((node) => {
      box.append(node)
    })

    parent.replaceChild(box, wzb)

    const atWzBegin = atDom.querySelector('annot[*|id="' + wzb.getAttribute('data-id') + '"]')
    // console.log(911, atWzBegin)
    let label = 'x'

    if (atWzBegin && atWzBegin.hasAttribute('corresp')) {
      // console.log('911 getting in')
      try {
        const relativePath = atWzBegin.getAttribute('corresp').split('#')[0]
        const wzId = atWzBegin.getAttribute('corresp').split('#')[1]

        box.setAttribute('data-wz-id', wzId)

        const fileName = relativePath.split('/').slice(-1)[0]
        const sourceInfo = getters.sources.find(s => s.path.split('/').indexOf(fileName) !== -1)
        const fullPath = sourceInfo.path

        box.setAttribute('data-source', fullPath)

        const sourceLabel = getters.title === 'Notirungsbuch K' || getters.title === '' ? 'NK' : getters.title// sourceInfo.name

        // console.log(911, 'wzId', wzId, 'fullPath', fullPath, 'sourceLabel', sourceLabel, 'sourceInfo', sourceInfo)

        const source = getters.documentByPath(fullPath)
        const gendescWZ = source.querySelector('genDesc[*|id="' + wzId + '"]')
        const wzLabel = gendescWZ.getAttribute('label')

        const surfaceId = gendescWZ.parentElement.getAttribute('corresp').substring(1)
        const surface = source.querySelector('surface[*|id="' + surfaceId + '"]')

        const pageInfo = getters.documentPagesForSidebars(getters.filepath).find(p => p.id === surfaceId)

        const surfaceLabel = pageInfo.label // surface.getAttribute('label')

        // console.log(911, 'genDescWz', gendescWZ)
        // console.log(911, 'surfaceId', surfaceId)
        // console.log(911, 'surface', surface)
        // console.log(911, 'pages2', getters.documentPagesForSidebars(getters.filepath))

        const wzIndexPadded = wzLabel.padStart(2, '0')
        const docName = sourceInfo.name
        const diploTransFilePath = 'data/sources/' + docName + '/diplomaticTranscripts/' + docName + '_p' + surface.getAttribute('n').padStart(3, '0') + '_wz' + wzIndexPadded + '_dt.xml'

        box.setAttribute('data-dt-path', diploTransFilePath)

        label = sourceLabel + ' ' + surfaceLabel + ' / ' + wzLabel
        // console.log(911, 'wzLabel', wzLabel)
      } catch (err) {
        console.warn('Unable to retrieve wz label for writingZone', atWzBegin)
      }
    }

    const bbox = box.getBBox()
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('x', bbox.x + staffHeight / 8)
    rect.setAttribute('y', staffHeight * -2)
    rect.setAttribute('width', bbox.width - staffHeight / 4)
    rect.setAttribute('height', staffHeight)
    rect.classList.add('pageLabelBox')

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    text.setAttribute('x', bbox.x + staffHeight / 8 + fontSize / 3)
    text.setAttribute('y', staffHeight * -2 + fontSize * 1)
    text.setAttribute('font-size', fontSize)
    text.classList.add('pageLabel')
    text.textContent = label
    box.prepend(text)
    box.prepend(rect)

    const sysBoxes = box.querySelectorAll('g.systemBegin')
    const sourceDocPath = box.getAttribute('data-source')
    const dtDocPath = box.getAttribute('data-dt-path')

    sysBoxes.forEach((sysBox) => {
      const sysId = sysBox.getAttribute('data-system-id')
      const sysBbox = sysBox.getBBox()
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rect.setAttribute('x', sysBbox.x + staffHeight / 8)
      rect.setAttribute('y', staffHeight * -0.8)
      rect.setAttribute('width', sysBbox.width - staffHeight / 4)
      rect.setAttribute('height', staffHeight * 0.6)
      rect.classList.add('pageLabelBox')

      const systemLabels = getters.systemNumbersByDtSystem(sysId, sourceDocPath, dtDocPath)
      const pageHeight = staffHeight * 0.6 * 0.8
      const pageWidth = systemLabels.length > 0 ? parseFloat((pageHeight * systemLabels[0].ratio).toFixed(2)) : 1

      const previewPageBox = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      previewPageBox.classList.add('pageBg')
      previewPageBox.setAttribute('x', sysBbox.x + staffHeight / 8 + pageHeight * 0.1)
      previewPageBox.setAttribute('y', staffHeight * -0.8 + pageHeight * 0.1)

      previewPageBox.setAttribute('height', pageHeight)
      previewPageBox.setAttribute('width', pageWidth)

      let x1 = 1
      let y1 = 1
      let x2 = 0
      let y2 = 0
      systemLabels.forEach((systemLabel) => {
        x1 = Math.min(x1, systemLabel.x)
        y1 = Math.min(y1, systemLabel.y)
        x2 = Math.max(x2, systemLabel.x + systemLabel.w)
        y2 = Math.max(y2, systemLabel.y + systemLabel.h)
      })

      const previewSystemBox = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      previewSystemBox.classList.add('sysPreview')
      previewSystemBox.setAttribute('x', sysBbox.x + staffHeight / 8 + pageHeight * 0.1 + pageWidth * x1)
      previewSystemBox.setAttribute('y', staffHeight * -0.8 + pageHeight * 0.1 + pageHeight * y1)

      previewSystemBox.setAttribute('height', pageHeight * (y2 - y1))
      previewSystemBox.setAttribute('width', pageWidth * (x2 - x1))

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      text.setAttribute('x', sysBbox.x + staffHeight / 8 + parseFloat(pageHeight * 0.5) + parseFloat(pageWidth))
      text.setAttribute('y', staffHeight * -0.8 + fontSize * 0.65)
      text.setAttribute('font-size', fontSize * 0.75)
      text.classList.add('sysLabel')

      let systemLabel

      if (systemLabels.length > 1) {
        systemLabel = 'Staves ' + systemLabels.map(label => label.pos).join(', ')
      } else if (systemLabels.length === 1) {
        systemLabel = 'Staff ' + systemLabels[0].pos
      } else {
        systemLabel = 'data unavailable'
      }
      text.textContent = systemLabel // 'Systems'

      sysBox.prepend(text)
      sysBox.prepend(previewSystemBox)
      sysBox.prepend(previewPageBox)
      sysBox.prepend(rect)
    })
  })

  return svgDom
}

/**
 * fixes corresp attributes for dots in the SVG output, as ATs use attributes, but DTs use elements
 * @param {*} svgDom
 * @param {*} atDom
 */
export const addSbIndicators = (svgDom, atDom) => {
  atDom.querySelectorAll('annot[class="#bw_writingZoneBegin"]').forEach((annot) => {
    annot.setAttribute('type', '#bw_writingZoneBegin')
  })

  const sbs = atDom.querySelectorAll('sb')

  const getMeasure = (node) => {
    let sibling = node.nextElementSibling
    while (sibling) {
      if (sibling.localName === 'measure') {
        return sibling
      }
      sibling = sibling.nextElementSibling
    }
    return null
  }

  sbs.forEach((sb, i) => {
    if (i > 0) {
      const measure = getMeasure(sb)
      if (measure) {
        const dir = document.createElementNS('http://www.music-encoding.org/ns/mei', 'dir')
        const pb = sb.previousElementSibling.localName === 'pb'
        dir.innerHTML = pb ? '⫪' : '⊤'
        dir.setAttribute('staff', 1)
        dir.setAttribute('tstamp', 0)
        dir.setAttribute('place', 'above')
        const classes = pb ? 'pb sb unselectable' : 'sb unselectable'
        dir.setAttribute('type', classes)
        dir.setAttribute('xml:id', 'dir_' + sb.getAttribute('xml:id'))
        measure.append(dir)
      }
    }
  })

  return atDom
}

/**
 * This function prepares an AT for rendering by Verovio
 * @param {*} atDom
 * @returns
 */
export const prepareAtDomForRendering = (atDom) => {
  const clone = atDom.cloneNode(true)
  const map = new Map()
  const dots = clone.querySelectorAll('dot')
  dots.forEach((dot) => {
    const parent = dot.parentElement
    const parentId = parent.getAttribute('xml:id')
    if (!map.has(parentId)) {
      map.set(parentId, parent)
    }
  })
  map.forEach((parent) => {
    const dots = parent.querySelectorAll('dot')
    const count = dots.length

    const dotAttCount = parent.hasAttribute('dots') ? parseInt(parent.getAttribute('dots')) : 0
    if (dotAttCount > 0) {
      console.warn(parent.localName + ' ' + parent.getAttribute('xml:id') + ' has dots attribute and also dots children.')
    }
    parent.setAttribute('dots', dotAttCount + count)
    dots.forEach(dot => dot.remove())
    const refs = [...dots].map(dot => dot.getAttribute('corresp')).filter(corresp => corresp !== null).join(' ')
    if (parent.hasAttribute('dot-corresp')) {
      console.warn(parent.localName + ' ' + parent.getAttribute('xml:id') + ' already has dot-corresp attribute.')
      parent.setAttribute('dot-corresp', parent.getAttribute('dot-corresp') + ' ' + refs)
    } else {
      parent.setAttribute('dot-corresp', refs)
    }
    // console.log(611, 'parent resolved', parent)
  })
  const staffCorresp = clone.querySelectorAll('staff[corresp]')
  staffCorresp.forEach((staff) => {
    const corresps = staff.getAttribute('corresp').split(' ')
    console.log(279, 'prepareAtDomForRendering', staff.getAttribute('xml:id'), 'corresp', corresps)
  })
  return clone
}

/**
 * This function fixes some artifacts of an AT as rendered by Verovio
 * @param {*} svgDom
 * @param {*} atDom
 */
export const improveAtSvg = (svgDom, atDom) => {
  console.log(279, 'improveAtSvg', svgDom, atDom)
  const dotBearers = svgDom.querySelectorAll('*[data-dot-corresp]')
  dotBearers.forEach((dotBearer) => {
    const corresp = dotBearer.getAttribute('data-dot-corresp')
    const dotRefs = corresp.split(' ')
    const dots = dotBearer.querySelectorAll('g.dots:not(.bounding-box) ellipse')
    dots.forEach((dot, i) => {
      if (dotRefs[i]) {
        dot.setAttribute('data-corresp', dotRefs[i])
      }
    })
  })

  const measureCorresp = svgDom.querySelectorAll('g.measure:not(.bounding-box)[data-corresp]')
  measureCorresp.forEach((measure) => {
    const corresps = measure.getAttribute('data-corresp').split(' ')
    for (const corresp of corresps) {
      const shapeId = corresp.split('#')[1]
      console.log(845, 'improveAtSvg', shapeId, 'measure corresp', measure)
    }
  })

  // we need the current WZ DT Dom to resolve the type of the corresponding element
  // because the corresp attribute in the staff element doesn't contain the type, but only the ID of the corresponding elements
  const staffCorresp = svgDom.querySelectorAll('g.staff:not(.bounding-box)[data-corresp]')
  const dtPath = store.getters.currentWzDtPath
  const dtDom = dtPath ? store.getters.documentByPath(dtPath) : null
  console.log(279, 'improveAtSvg', 'staffCorresp', staffCorresp, dtPath, dtDom)
  staffCorresp.forEach((staff) => {
    const corresps = staff.getAttribute('data-corresp').split(' ')
    for (const corresp of corresps) {
      const dtElementId = corresp.split('#')[1]
      const dtElement = dtDom.querySelector('*[*|id="' + dtElementId + '"]')
      console.log(279, 'improveAtSvg', dtElementId, 'staff corresp', dtElement)
      const dtName = (dtElement?.localName || '').replace('accid', 'keyAccid') // keyAccid is a special case, as it is rendered as keyAccid in the SVG, but the DT uses accid
      if (dtName) {
        const elements = staff.querySelectorAll(`*[data-class="${dtName}"]`)
        for (const element of elements) {
          element.setAttribute('data-corresp', corresp)
          console.log(279, 'improveAtSvg', dtElementId, 'staff corresp', staff, dtName)
        }
      } else {
        console.warn(279, 'improveAtSvg', dtElementId, 'staff corresp', staff, dtName)
      }
    }
  })

  return svgDom
}
