/**
 * improves display of <sb> and <pb> indicators in the SVG rendered from Verovio
 * @param {*} svgDom
 * @param {*} atDom
 */
export const resolveSbIndicators = (svgDom, atDom, getters) => {
  const wzBegins = svgDom.querySelectorAll('g.annot')

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

  wzBegins.forEach((wzb, i) => {
    const content = []
    const box = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    box.setAttribute('class', 'writingZone')
    box.setAttribute('data-id', 'wz_' + wzb.getAttribute('data-id'))
    box.setAttribute('data-class', 'writingZone')

    let next = wzb.nextElementSibling
    while (next && !next.classList.contains('annot')) {
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
    console.log(911, atWzBegin)
    let label = 'x'

    if (atWzBegin && atWzBegin.hasAttribute('corresp')) {
      console.log('911 getting in')
      try {
        const relativePath = atWzBegin.getAttribute('corresp').split('#')[0]
        const wzId = atWzBegin.getAttribute('corresp').split('#')[1]

        box.setAttribute('data-wz-id', wzId)

        const fileName = relativePath.split('/').slice(-1)[0]
        const sourceInfo = getters.sources.find(s => s.path.split('/').indexOf(fileName) !== -1)
        const fullPath = sourceInfo.path

        box.setAttribute('data-source', fullPath)

        const sourceLabel = getters.title // sourceInfo.name

        console.log(911, 'wzId', wzId, 'fullPath', fullPath, 'sourceLabel', sourceLabel, 'sourceInfo', sourceInfo)

        const source = getters.documentByPath(fullPath)
        const gendescWZ = source.querySelector('genDesc[*|id="' + wzId + '"]')
        const wzLabel = gendescWZ.getAttribute('label')

        const surfaceId = gendescWZ.parentElement.getAttribute('corresp').substring(1)
        const surface = source.querySelector('surface[*|id="' + surfaceId + '"]')
        const surfaceLabel = surface.getAttribute('label')

        const wzIndexPadded = wzLabel.padStart(2, '0')
        const docName = sourceInfo.name
        const diploTransFilePath = 'data/sources/' + docName + '/diplomaticTranscripts/' + docName + '_p' + surface.getAttribute('n').padStart(3, '0') + '_wz' + wzIndexPadded + '_dt.xml'

        box.setAttribute('data-dt-path', diploTransFilePath)

        label = sourceLabel + ', p.' + surfaceLabel + ', WZ ' + wzLabel
        console.log(911, 'wzLabel', wzLabel)
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
