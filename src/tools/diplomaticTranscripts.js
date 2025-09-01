// import OpenSeadragon from 'openseadragon'
// import store from '@/store'
import { controlpointsToVerovioSvgBezier } from '.'
import store from '@/store'
import { appendNewElement } from './mei'

/**
 * get control points for curve bezier attribute for rastrum on position x/y with factor (default 90)
 */
export const scaleXYControlpoints = (bezier, { x, y }, factor = 90) => bezier.map((c, i) => factor * (c + (i % 2 ? y : x)))

/**
 * cleans up the diplomatic transcript to overcome Verovio restrictions and other issues; called after the diplomatic transcript has been rendered
 * @param {} svgDom
 */
export const cleanUpDiplomaticTranscript = (svgDom, meiDom, context, svgForCurrentPage) => {
  const { rastrumsOnCurrentPage } = context || {}
  // console.log(571, 'cleanUpDiplomaticTranscript', svgDom, meiDom, rastrumsOnCurrentPage)
  svgDom.querySelectorAll('.barLine, .system + path, .system.bounding-box, .system .grpSym').forEach(barLine => {
    if (!barLine.closest('.layer')) {
      barLine.remove()
    }
  })

  svgDom.querySelectorAll('.chord:not(.bounding-box)').forEach(chord => {
    const stem = chord.querySelector('.stem > path')

    if (stem) {
      const stemDir = meiDom.querySelector('chord[*|id = "' + chord.getAttribute('data-id') + '"]').getAttribute('stem.dir')

      const x = stemDir === 'up'
        ? parseFloat(parseFloat(chord.querySelector('.note.bounding-box > rect').getAttribute('x')) + parseFloat(chord.querySelector('.note.bounding-box > rect').getAttribute('width')))
        : chord.querySelector('.note.bounding-box > rect').getAttribute('x')
      const arr = stem.getAttribute('d').split(' ')
      stem.setAttribute('d', 'M' + x + ' ' + arr[1] + ' L' + x + ' ' + arr[3])
      chord.querySelector('.stem.bounding-box rect').setAttribute('x', x)
    }
  })

  svgDom.querySelectorAll('g.staff[data-rotate]').forEach(staff => {
    if (!staff.classList.contains('bounding-box')) {
      // const topLineCoordinates = staff.querySelector('path').getAttribute('d').split(' ')
      // const x = parseFloat(topLineCoordinates[0].substring(1)) - parseFloat(staff.getAttribute('data-pivot'))
      // const y = topLineCoordinates[1]
      const rotation = staff.getAttribute('data-rotate')
      staff.style.transform = 'rotate(' + rotation + 'deg)'
      // staff.style.transformOrigin = x + 'px ' + y + 'px'
    }
  })

  // render barLines
  meiDom.querySelectorAll('barLine').forEach(barLine => {
    const measure = svgDom.querySelector('g.measure')

    // controlevents are always measured from the top rastrum!!!
    const currentMeasure = barLine.closest('measure')
    const rastrumId = currentMeasure.querySelector('staff[n="1"]').getAttribute('decls').split('#')[1]
    if (store.getters.activeDiploTransElementId === barLine.getAttribute('xml:id')) {
      console.log(753, 'barLine rastrum cleanup', rastrumId)
    }

    const rastrum = rastrumsOnCurrentPage.find(rastrum => rastrum.id === rastrumId)

    // console.log(571, 'barLine', barLine, barLine.closest('section'))
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.setAttribute('data-id', barLine.getAttribute('xml:id'))
    g.setAttribute('data-class', 'barLine')
    g.setAttribute('class', 'barLine')

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    const factor = 90 // 9px per vu, factor 10 as general factor of Verovio

    // (*TODO: the "+4" is a constant factor that I do not fully understand yet*)
    // const x1 = (parseFloat(barLine.getAttribute('x')) + parseFloat(barLine.getAttribute('ho'))) * factor
    const x1 = (parseFloat(barLine.getAttribute('x')) + +rastrum.x) * factor
    const y1 = (parseFloat(barLine.getAttribute('y')) + +rastrum.y) * factor
    // const x2 = (parseFloat(barLine.getAttribute('x2')) + parseFloat(barLine.getAttribute('ho'))) * factor
    const x2 = (parseFloat(barLine.getAttribute('x2')) + +rastrum.x) * factor
    const y2 = (parseFloat(barLine.getAttribute('y2')) + +rastrum.y) * factor

    // console.log(463, 'barLine ', barLine, '\nx1 ', x1, '\nxy ', y1, '\nx2 ', x2, '\ny2 ', y2, '\nfactor ', factor)

    path.setAttribute('d', 'M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2)
    path.setAttribute('stroke-width', '27')

    g.append(path)
    measure.append(g)
  })

  // render curves
  meiDom.querySelectorAll('curve').forEach(curve => {
    const curveid = curve.getAttribute('xml:id')
    // TODO check for curve on activeDiploTransElementId
    const bezier = (curve.getAttribute('bezier') || '').split(' ').map(p => parseFloat(p))
    // console.log(571, 'curve', curve, bezier, controlpointsToVerovioSvgBezier(bezier))

    const measure = svgDom.querySelector('g.measure')

    // controlevents are always measured from the top rastrum!!!
    const rastrumId = curve.closest('measure').querySelector('staff[n="1"]').getAttribute('decls').split('#')[1]

    const rastrum = rastrumsOnCurrentPage.find(rastrum => rastrum.id === rastrumId)

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.setAttribute('data-id', curveid)
    g.setAttribute('data-class', 'curve')
    g.setAttribute('class', 'curve')
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    const factor = 90 // 9px per vu, factor 10 as general factor of Verovio
    // shift bezier control points by rastrum x and y position [x1, y1, x2, y2, x3, y3, x4, y4]
    const controlpoints = scaleXYControlpoints(bezier, rastrum, factor)
    const d = controlpointsToVerovioSvgBezier(controlpoints, 52)
    path.setAttribute('d', d)
    // taken from verovio generated slur svg
    path.setAttribute('stroke-width', '9')
    path.setAttribute('stroke-linecap', 'round')
    path.setAttribute('stroke-linejoin', 'round')
    g.append(path)
    measure.append(g)
    // console.log(836, selectedElementId, curveid)
    // console.log(571, 'curve', curve, controlpointsToVerovioSvgBezier)
  })

  // render metaMarks
  renderMetaMarks(svgDom, meiDom, rastrumsOnCurrentPage)

  renderDeletions(svgDom, meiDom, context, svgForCurrentPage)

  // render dynams
  renderDynams(svgDom, meiDom, rastrumsOnCurrentPage)

  // render dirs
  renderDirs(svgDom, meiDom, rastrumsOnCurrentPage)

  // render words
  renderWords(svgDom, meiDom, rastrumsOnCurrentPage)

  // render trills
  renderTrills(svgDom, meiDom, rastrumsOnCurrentPage)

  renderHairpins(svgDom, meiDom, rastrumsOnCurrentPage)

  // move flag(s) to the correct position
  const chords = svgDom.querySelectorAll('g.chord')
  // console.log(443, 'chords', chords)
  chords.forEach((chord) => {
    if (chord.hasAttribute('data-stem.dir')) {
      const stemDir = chord.getAttribute('data-stem.dir')
      if (stemDir === 'down') {
        const flag = chord.querySelector('g.flag use')
        if (flag) {
          const x = chord.querySelector('g.notehead use').getAttribute('x')
          // console.log(443, 'flag x', x, flag)
          flag.setAttribute('x', x)
        }
      } else if (stemDir === 'up') {
        const flag = chord.querySelector('g.flag use')
        if (flag) {
          const x = chord.querySelector('g.stem.bounding-box rect').getAttribute('x')
          flag.setAttribute('x', x)
        }
      }
    }
  })

  // reposition beamSpans
  /* const beamSpans = svgDom.querySelectorAll('g.beamSpan')
  beamSpans.forEach(b => {
    try {
      const firstPoints = b.querySelector('polygon').getAttribute('points').split(' ')
      const x1 = firstPoints[0].split(',')[0]
      const y1 = firstPoints[0].split(',')[1]

      const startElem = svgDom.querySelector(`g[data-id="${b.getAttribute('data-startid').substr(1)}"]`)
      console.log(643, startElem)
      const stemDir = startElem.getAttribute('data-stem.dir')
      const strokeWidth = 0 // +startElem.querySelector('g.stem path').getAttribute('stroke-width')
      const stemX = +startElem.querySelector('g.stem path').getAttribute('d').split(' ')[0].substr(1) - strokeWidth / 2
      let stemY
      if (stemDir === 'down') {
        stemY = +startElem.querySelector('g.stem path').getAttribute('d').split(' ')[3] + strokeWidth / 2
      } else if (stemDir === 'up') {
        stemY = +startElem.querySelector('g.stem path').getAttribute('d').split(' ')[1] - strokeWidth / 2
      }

      const xOff = stemX - x1
      const yOff = stemY - y1
      console.log(643, 'I need to move beamSpan ' + b.getAttribute('data-id') + ' by ' + xOff + ' / ' + yOff, b)
      console.log(643, 'x1 (beamSpan links): ', x1, b.querySelector('polygon'))
      console.log(643, 'stemX: ', stemX, startElem)

      // M19337 12879 L19337 13373
      // 19330,13388 21664,13086 21664,13010 19330,13312
    } catch (err) {
      console.warn('Error while repositioning beamSpan', b, err)
    }
  }) */

  // calculate x position for all clefs and meterSigs
  // this is necessary because the x position in the MEI file is relative to the left
  // margin of the system, but in the SVG it is relative to the left margin of
  // the page, so we need to add the left margin of the system to the x
  // position of the clef and meterSig elements
  // console.log(279, 'cleanUpDiplomaticTranscript', 'calculating x position for clefs and meterSigs')
  const factor = 90 // 9px per vu, factor 10 as general factor of Verovio

  const clefs = meiDom.querySelectorAll('staff clef')
  for (const clef of clefs) {
    const clefId = clef.getAttribute('xml:id')
    const clefElements = svgDom.querySelectorAll('g.clef[data-id="' + clefId + '"] use,rect')
    const x1 = (parseFloat(clef.getAttribute('x')) + parseFloat(clef.getAttribute('ho'))) * factor
    for (const clefElement of clefElements) {
      clefElement.setAttribute('x', x1)
    }
    // console.log(279, 'clef x', x1, clef)
  }

  const meterSigs = meiDom.querySelectorAll('staff meterSig')
  for (const meterSig of meterSigs) {
    const meterSigId = meterSig.getAttribute('xml:id')
    const meterSigElements = svgDom.querySelectorAll('g.meterSig[data-id="' + meterSigId + '"] use,rect')
    const x1 = (parseFloat(meterSig.getAttribute('x')) + parseFloat(meterSig.getAttribute('ho'))) * factor
    for (const meterSigElement of meterSigElements) {
      meterSigElement.setAttribute('x', x1)
    }
    // console.log(279, 'meterSig x', x1, meterSig)
  }

  return svgDom
}

/**
 * renders deletions in the diplomatic transcription by copying in the shapes from the originally traced handwriting
 * @param {Object} svgDom the SVG DOM of the diplomatic transcription
 * @param {Object} meiDom the MEI DOM of the diplomatic transcription
 * @param {Object} context the context containing activeDiploTransElementId and rastrumsOnCurrentPage
 * @param {Object} svgForCurrentPage the SVG for the current page
 */
const renderDeletions = (svgDom, meiDom, context, svgForCurrentPage) => {
  // const { activeDiploTransElementId, rastrumsOnCurrentPage } = context || {}
  // console.log(571, 'renderDeletions', svgDom, meiDom, activeDiploTransElementId, rastrumsOnCurrentPage)
  // console.log(572, 'meiDom', meiDom)
  meiDom.querySelectorAll('del').forEach(deletion => {
    console.log(572, 'deletion', deletion, svgForCurrentPage)
    const measure = svgDom.querySelector('g.measure')

    // deletions are always rendered in relation to the full page

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.setAttribute('data-id', deletion.getAttribute('xml:id'))
    g.setAttribute('data-class', 'deletion')
    g.setAttribute('class', 'deletion')

    measure.append(g)
    const copiedPath = deletion.querySelector('path').cloneNode(true)

    const points = copiedPath.getAttribute('d').split(' ')

    // scale points to Verovio output scale
    const scalePoint = (point) => {
      const command = point.substring(0, 1)

      let out
      if (point.length > 1) {
        const x = parseFloat(point.substring(1).split(',')[0])
        const y = parseFloat(point.substring(1).split(',')[1])
        const factor = 90 // 9px per vu, factor 10 as general factor of Verovio
        out = (x * factor).toFixed(1) + ',' + (y * factor).toFixed(1)
      } else {
        out = ''
      }
      return command + out
    }
    copiedPath.setAttribute('d', points.map(scalePoint).join(' '))

    copiedPath.classList.add('deletionBack')
    g.append(copiedPath)

    const diagonal1 = appendNewElement(g, 'path', 'http://www.w3.org/2000/svg')
    diagonal1.setAttribute('d', scalePoint(points[0]) + ' ' + scalePoint(points[2]))
    diagonal1.setAttribute('stroke-width', '9')
    diagonal1.classList.add('deletionLine')
    g.append(diagonal1)

    const diagonal2 = appendNewElement(g, 'path', 'http://www.w3.org/2000/svg')
    diagonal2.setAttribute('d', scalePoint(points[1]).replace('L', 'M') + ' ' + scalePoint(points[3]))
    diagonal2.setAttribute('stroke-width', '9')
    diagonal2.classList.add('deletionLine')
    g.append(diagonal2)
  })
}

/**
 * this function renders the dirs in the diplomatic transcription
 * @param {*} svgDom
 * @param {*} meiDom
 * @param {*} rastrumsOnCurrentPage
 */
const renderDirs = (svgDom, meiDom, rastrumsOnCurrentPage) => {
  meiDom.querySelectorAll('dir').forEach(dir => {
    const measure = svgDom.querySelector('g.measure')

    const systemZoneId = dir.closest('measure').previousElementSibling.getAttribute('facs').substr(1)
    const systemZone = [...meiDom.querySelectorAll('zone[type="sb"]')].find(zone => zone.getAttribute('xml:id') === systemZoneId)
    const rastrumIds = systemZone.getAttribute('bw.rastrumIDs').split(' ')

    const staffN = dir.getAttribute('staff').replace(/\s+/g, ' ').trim().split(' ')[0]

    const index = +staffN - 1

    const otherRastrumId = rastrumIds[index]

    const rastrum = rastrumsOnCurrentPage.find(rastrum => rastrum.id === otherRastrumId)

    // console.log(572, 'dir', dir, 'rastrum', rastrum)

    /*
    <g id="d6iolw9" class="dynam">
      <text x="2241" y="4211" text-anchor="middle" font-size="0px">
        <tspan id="k1caa3av" class="text">
          <tspan font-size="405px">ppo</tspan>
        </tspan>
      </text>
    </g>
    */

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.setAttribute('id', dir.getAttribute('xml:id'))
    g.setAttribute('data-id', dir.getAttribute('xml:id'))
    g.setAttribute('data-class', 'dir')
    g.setAttribute('class', 'dir')

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    const factor = 90 // 9px per vu, factor 10 as general factor of Verovio

    const fontSize = 405 // 405px is the font size of the tspan in the original MEI file

    const x1 = (parseFloat(dir.getAttribute('x')) + parseFloat(dir.getAttribute('ho'))) * factor
    const y1 = (parseFloat(dir.getAttribute('y')) + +rastrum.y) * factor
    const w = (parseFloat(dir.getAttribute('width'))) * factor

    text.setAttribute('x', x1)
    text.setAttribute('y', y1)
    text.setAttribute('text-anchor', 'start')
    text.setAttribute('font-size', '0px')
    text.setAttribute('textLength', w + 'px')

    const outerTspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
    outerTspan.setAttribute('id', dir.getAttribute('xml:id') + '_tspan')
    outerTspan.setAttribute('class', 'text')

    const innerTspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
    innerTspan.setAttribute('font-size', fontSize + 'px')
    innerTspan.textContent = dir.textContent

    outerTspan.append(innerTspan)
    text.append(outerTspan)
    g.append(text)
    measure.append(g)
  })
}

/**
 * this function renders the words in the diplomatic transcription
 * @param {*} svgDom
 * @param {*} meiDom
 * @param {*} rastrumsOnCurrentPage
 */
const renderWords = (svgDom, meiDom, rastrumsOnCurrentPage) => {
  meiDom.querySelectorAll('word').forEach(word => {
    const measure = svgDom.querySelector('g.measure')

    const systemZoneId = word.closest('measure').previousElementSibling.getAttribute('facs').substr(1)
    const systemZone = [...meiDom.querySelectorAll('zone[type="sb"]')].find(zone => zone.getAttribute('xml:id') === systemZoneId)
    const rastrumIds = systemZone.getAttribute('bw.rastrumIDs').split(' ')

    const staffN = word.getAttribute('staff').replace(/\s+/g, ' ').trim().split(' ')[0]

    const index = +staffN - 1

    const otherRastrumId = rastrumIds[index]

    const rastrum = rastrumsOnCurrentPage.find(rastrum => rastrum.id === otherRastrumId)

    // console.log(572, 'dir', dir, 'rastrum', rastrum)

    /*
    <g id="d6iolw9" class="dynam">
      <text x="2241" y="4211" text-anchor="middle" font-size="0px">
        <tspan id="k1caa3av" class="text">
          <tspan font-size="405px">ppo</tspan>
        </tspan>
      </text>
    </g>
    */

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.setAttribute('id', word.getAttribute('xml:id'))
    g.setAttribute('data-id', word.getAttribute('xml:id'))
    g.setAttribute('data-class', 'word')
    g.setAttribute('class', 'word')

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    const factor = 90 // 9px per vu, factor 10 as general factor of Verovio

    const fontSize = 360 // 405px is the font size of the tspan in the original MEI file

    const x1 = (parseFloat(word.getAttribute('x')) + +rastrum.x) * factor
    const y1 = (parseFloat(word.getAttribute('y')) + +rastrum.y + fontSize / factor) * factor
    const w = (parseFloat(word.getAttribute('width'))) * factor

    text.setAttribute('x', x1)
    text.setAttribute('y', y1)
    text.setAttribute('text-anchor', 'start')
    text.setAttribute('font-size', '0px')
    text.setAttribute('textLength', w + 'px')

    const outerTspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
    outerTspan.setAttribute('id', word.getAttribute('xml:id') + '_tspan')
    outerTspan.setAttribute('class', 'text')

    const innerTspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
    innerTspan.setAttribute('font-size', fontSize + 'px')
    innerTspan.textContent = word.textContent

    outerTspan.append(innerTspan)
    text.append(outerTspan)
    g.append(text)
    measure.append(g)
  })
}

/**
 * this function renders the trills in the diplomatic transcription
 * @param {*} svgDom
 * @param {*} meiDom
 * @param {*} rastrumsOnCurrentPage
 */
const renderTrills = (svgDom, meiDom, rastrumsOnCurrentPage) => {
  const trills = meiDom.querySelectorAll('trill')

  if (trills.length) {
    // add a symbol in the defs area…
    const defs = svgDom.querySelector('defs')

    const symbol = document.createElementNS('http://www.w3.org/2000/svg', 'symbol')
    symbol.setAttribute('id', 'trill-symbol')
    symbol.setAttribute('viewBox', '0 0 1000 1000')
    symbol.setAttribute('overflow', 'inherit')

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('transform', 'scale(1,-1)')
    path.setAttribute('d', 'M162 167l-36 -115l-1 -10c0 -10 5 -16 16 -19c32 18 48 43 48 75c0 20 -9 43 -27 69zM432 225c0 -21 -11 -36 -31 -37c-15 0 -20 10 -23 25l3 14l2 11l1 9l-4 4c-1 -1 -2 -1 -3 -1c-23 -13 -36 -24 -47 -48l-12 -27c-18 -50 -31 -105 -47 -157h-60l58 214c0 7 -3 5 -5 9 c-7 0 -25 -8 -51 -28l-37 -28c20 -34 31 -67 31 -97c0 -12 -1 -21 -4 -28l-6 -15c-1 -3 -5 -10 -12 -19c-14 -18 -30 -26 -49 -26c-30 0 -67 18 -67 52c1 1 1 6 3 15l20 84c-9 -5 -21 -8 -36 -8c-21 0 -29 7 -40 19c-10 12 -16 27 -16 47c0 23 6 33 17 45s25 18 46 18 c19 0 39 -8 60 -25l34 117h63l-46 -158l38 31l32 20c21 10 35 13 62 15c16 0 24 -7 24 -21l-1 -10l-6 -24c21 37 44 55 70 55c23 0 39 -23 39 -47zM18 208c0 -27 17 -47 45 -47l3 -2l13 4l23 9l14 55c-17 15 -35 22 -55 22c-26 0 -43 -17 -43 -41z')

    symbol.appendChild(path)
    defs.appendChild(symbol)
  }

  trills.forEach(trill => {
    const measure = svgDom.querySelector('g.measure')

    const systemZoneId = trill.closest('measure').previousElementSibling.getAttribute('facs').substr(1)
    const systemZone = [...meiDom.querySelectorAll('zone[type="sb"]')].find(zone => zone.getAttribute('xml:id') === systemZoneId)
    const rastrumIds = systemZone.getAttribute('bw.rastrumIDs').split(' ')

    const staffN = trill.getAttribute('staff').replace(/\s+/g, ' ').trim().split(' ')[0]

    const index = +staffN - 1

    const otherRastrumId = rastrumIds[index]

    const rastrum = rastrumsOnCurrentPage.find(rastrum => rastrum.id === otherRastrumId)

    const factor = 90 // 9px per vu, factor 10 as general factor of Verovio
    const x = (parseFloat(trill.getAttribute('x')) + +rastrum.x) * factor
    const y = (parseFloat(trill.getAttribute('y')) + +rastrum.y) * factor

    /*
      <g data-id="x8e1d4d35-2d97-4ce3-9f31-a6ca9dc4cd64" data-class="trill" class="trill">
        <use href="#E566-tuntfg1" x="31589" y="948" height="720px" width="720px"></use>
      </g >
    */
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.setAttribute('data-id', trill.getAttribute('xml:id'))
    g.setAttribute('data-class', 'trill')
    g.setAttribute('class', 'trill')

    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use')
    use.setAttribute('href', '#trill-symbol')
    use.setAttribute('x', x + 'px')
    use.setAttribute('y', y + 'px')
    use.setAttribute('height', '720px')
    use.setAttribute('width', '720px')

    g.append(use)
    measure.append(g)
  })
}

/**
 * this function renders the hairpins in the diplomatic transcription
 * @param {*} svgDom
 * @param {*} meiDom
 * @param {*} rastrumsOnCurrentPage
 */
const renderHairpins = (svgDom, meiDom, rastrumsOnCurrentPage) => {
  // output:
  /*
  <g data-id="MEI-ID" data-class="hairpin" class="hairpin">
    <polyline stroke="currentColor"
      stroke-width="18"
      stroke-opacity="1"
      stroke-linecap="square"
      stroke-linejoin="miter"
      fill="none"
      points="19772,696 13943,561 19772,426"></polyline>
  </g>
  */
  meiDom.querySelectorAll('hairpin').forEach(hairpin => {
    const measure = svgDom.querySelector('g.measure')

    const systemZoneId = hairpin.closest('measure').previousElementSibling.getAttribute('facs').substr(1)
    const systemZone = [...meiDom.querySelectorAll('zone[type="sb"]')].find(zone => zone.getAttribute('xml:id') === systemZoneId)
    const rastrumIds = systemZone.getAttribute('bw.rastrumIDs').split(' ')

    // const staffN = hairpin.getAttribute('staff').replace(/\s+/g, ' ').trim().split(' ')[0]
    // const index = +staffN - 1
    const otherRastrumId = rastrumIds[0] // [index]

    const rastrum = rastrumsOnCurrentPage.find(rastrum => rastrum.id === otherRastrumId)

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.setAttribute('id', hairpin.getAttribute('xml:id'))
    g.setAttribute('data-id', hairpin.getAttribute('xml:id'))
    g.setAttribute('data-class', 'hairpin')
    g.setAttribute('class', 'hairpin')

    const factor = 90 // 9px per vu, factor 10 as general factor of Verovio

    const x1 = (parseFloat(hairpin.getAttribute('x')) + +rastrum.x) * factor
    const y1 = (parseFloat(hairpin.getAttribute('y')) + +rastrum.y) * factor
    const x2 = (parseFloat(hairpin.getAttribute('x2')) + +rastrum.x) * factor
    const y2 = (parseFloat(hairpin.getAttribute('y2')) + +rastrum.y) * factor
    const opening = parseFloat(hairpin.getAttribute('opening')) * factor
    const startOpening = parseFloat(hairpin.getAttribute('bw:start.opening')) * factor

    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline')
    polyline.setAttribute('stroke', 'currentColor')
    polyline.setAttribute('stroke-width', '18')
    polyline.setAttribute('stroke-opacity', '1')
    polyline.setAttribute('stroke-linecap', 'square')
    polyline.setAttribute('stroke-linejoin', 'miter')
    polyline.setAttribute('fill', 'none')

    // console.log(881, polyline, opening, startOpening, rastrum)

    if (hairpin.getAttribute('form') === 'cres' && +hairpin.getAttribute('bw:start.opening') === 0) {
      // top right – center left – bottom right
      // console.log(881, 'cres closed')
      const p1x = x2.toFixed(1)
      const p1y = (y2 - opening / 2).toFixed(1)
      const p2x = x1.toFixed(1)
      const p2y = y1.toFixed(1)
      const p3x = x2.toFixed(1)
      const p3y = (y2 + opening / 2).toFixed(1)

      polyline.setAttribute('points', `${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y}`)
      g.append(polyline)
    } else if (hairpin.getAttribute('form') === 'cres' && +hairpin.getAttribute('bw:start.opening') !== 0) {
      // top right – two center left – bottom right
      // console.log(881, 'cres open')

      const p1x = x2.toFixed(1)
      const p1y = (y2 - opening / 2).toFixed(1)
      const p2x = x1.toFixed(1)
      const p2y = (y1 - startOpening / 2).toFixed(1)
      const p3x = x1.toFixed(1)
      const p3y = (y1 + startOpening / 2).toFixed(1)
      const p4x = x2.toFixed(1)
      const p4y = (y2 + opening / 2).toFixed(1)

      const polyline2 = polyline.cloneNode(true)
      polyline.setAttribute('points', `${p1x},${p1y} ${p2x},${p2y}`)
      polyline2.setAttribute('points', `${p3x},${p3y} ${p4x},${p4y}`)
      g.append(polyline)
      g.append(polyline2)
    } else if (hairpin.getAttribute('form') === 'dim' && +hairpin.getAttribute('bw:start.opening') === 0) {
      // top left - center right – bottom left
      // console.log(881, 'dim closed')
      const p1x = x1.toFixed(1)
      const p1y = (y1 - opening / 2).toFixed(1)
      const p2x = x2.toFixed(1)
      const p2y = y2.toFixed(1)
      const p3x = x1.toFixed(1)
      const p3y = (y1 + opening / 2).toFixed(1)

      polyline.setAttribute('points', `${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y}`)
      g.append(polyline)
    } else if (hairpin.getAttribute('form') === 'dim' && +hairpin.getAttribute('bw:start.opening') !== 0) {
      // top left - two center right – bottom left
      // console.log(881, 'dim open')
      const p1x = x1.toFixed(1)
      const p1y = (y1 - opening / 2).toFixed(1)
      const p2x = x2.toFixed(1)
      const p2y = (y2 - startOpening / 2).toFixed(1)
      const p3x = x2.toFixed(1)
      const p3y = (y2 + startOpening / 2).toFixed(1)
      const p4x = x1.toFixed(1)
      const p4y = (y1 + opening / 2).toFixed(1)

      const polyline2 = polyline.cloneNode(true)
      polyline.setAttribute('points', `${p1x},${p1y} ${p2x},${p2y}`)
      polyline2.setAttribute('points', `${p3x},${p3y} ${p4x},${p4y}`)
      g.append(polyline)
      g.append(polyline2)
    }

    measure.append(g)
  })
}

/**
 * this function renders the dynams in the diplomatic transcription
 * @param {*} svgDom
 * @param {*} meiDom
 * @param {*} rastrumsOnCurrentPage
 */
const renderDynams = (svgDom, meiDom, rastrumsOnCurrentPage) => {
  meiDom.querySelectorAll('dynam').forEach(dynam => {
    const measure = svgDom.querySelector('g.measure')

    const systemZoneId = dynam.closest('measure').previousElementSibling.getAttribute('facs').substr(1)
    const systemZone = [...meiDom.querySelectorAll('zone[type="sb"]')].find(zone => zone.getAttribute('xml:id') === systemZoneId)
    const rastrumIds = systemZone.getAttribute('bw.rastrumIDs').split(' ')

    const staffN = dynam.getAttribute('staff').replace(/\s+/g, ' ').trim().split(' ')[0]

    const index = +staffN - 1

    const otherRastrumId = rastrumIds[index]

    const rastrum = rastrumsOnCurrentPage.find(rastrum => rastrum.id === otherRastrumId)

    // console.log(572, 'dynam', dynam, 'rastrum', rastrum)

    /*
    <g id="d6iolw9" class="dynam">
      <text x="2241" y="4211" text-anchor="middle" font-size="0px">
        <tspan id="k1caa3av" class="text">
          <tspan font-size="405px">ppo</tspan>
        </tspan>
      </text>
    </g>
    */

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.setAttribute('id', dynam.getAttribute('xml:id'))
    g.setAttribute('data-id', dynam.getAttribute('xml:id'))
    g.setAttribute('data-class', 'dynam')
    g.setAttribute('class', 'dynam')

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    const factor = 90 // 9px per vu, factor 10 as general factor of Verovio

    const fontSize = 405 // 405px is the font size of the tspan in the original MEI file

    const x1 = (parseFloat(dynam.getAttribute('x')) + parseFloat(dynam.getAttribute('ho'))) * factor
    const y1 = (parseFloat(dynam.getAttribute('y')) + +rastrum.y) * factor
    const w = (parseFloat(dynam.getAttribute('width'))) * factor

    text.setAttribute('x', x1)
    text.setAttribute('y', y1)
    text.setAttribute('text-anchor', 'start')
    text.setAttribute('font-size', '0px')
    text.setAttribute('textLength', w + 'px')

    const outerTspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
    outerTspan.setAttribute('id', dynam.getAttribute('xml:id') + '_tspan')
    outerTspan.setAttribute('class', 'text')

    const innerTspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
    innerTspan.setAttribute('font-size', fontSize + 'px')
    innerTspan.textContent = dynam.textContent

    outerTspan.append(innerTspan)
    text.append(outerTspan)
    g.append(text)
    measure.append(g)
  })
}

/**
 * renders the metaMarks in the diplomatic transcription
 * @param {*} svgDom
 * @param {*} meiDom
 * @param {*} rastrumsOnCurrentPage
 */
const renderMetaMarks = (svgDom, meiDom, rastrumsOnCurrentPage) => {
  meiDom.querySelectorAll('metaMark').forEach(metaMark => {
    const measure = svgDom.querySelector('g.measure')

    const systemZoneId = metaMark.closest('measure').previousElementSibling.getAttribute('facs').substr(1)
    const systemZone = [...meiDom.querySelectorAll('zone[type="sb"]')].find(zone => zone.getAttribute('xml:id') === systemZoneId)
    const rastrumIds = systemZone.getAttribute('bw.rastrumIDs').split(' ')

    const staffN = metaMark.getAttribute('staff').replace(/\s+/g, ' ').trim().split(' ')[0]

    const index = +staffN - 1

    const otherRastrumId = rastrumIds[index]

    const rastrum = rastrumsOnCurrentPage.find(rastrum => rastrum.id === otherRastrumId)

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.setAttribute('id', metaMark.getAttribute('xml:id'))
    g.setAttribute('data-id', metaMark.getAttribute('xml:id'))
    g.setAttribute('data-class', 'metaMark')
    g.setAttribute('class', 'metaMark')

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    const factor = 90 // 9px per vu, factor 10 as general factor of Verovio

    const fontSize = 555 // 405px is the font size of the tspan in the original MEI file

    const x1 = (parseFloat(metaMark.getAttribute('x')) + +rastrum.x) * factor
    const y1 = (parseFloat(metaMark.getAttribute('y')) + +rastrum.y) * factor
    const w = (parseFloat(metaMark.getAttribute('width'))) * factor

    text.setAttribute('x', x1)
    text.setAttribute('y', y1)
    text.setAttribute('text-anchor', 'start')
    text.setAttribute('font-size', '0px')
    text.setAttribute('textLength', w + 'px')

    const outerTspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
    outerTspan.setAttribute('id', metaMark.getAttribute('xml:id') + '_tspan')
    outerTspan.setAttribute('class', 'text')

    const innerTspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
    innerTspan.setAttribute('font-size', fontSize + 'px')
    innerTspan.textContent = metaMark.textContent

    outerTspan.append(innerTspan)
    text.append(outerTspan)
    g.append(text)
    measure.append(g)
  })
}
