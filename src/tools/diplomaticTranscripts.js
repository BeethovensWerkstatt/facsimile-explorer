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
/* export const cleanUpDiplomaticTranscript = (svgDom, meiDom, context, svgForCurrentPage) => {
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

  // render tempos
  renderTempos(svgDom, meiDom, rastrumsOnCurrentPage)

  // render dirs
  renderDirs(svgDom, meiDom, rastrumsOnCurrentPage)

  // render fings
  renderFings(svgDom, meiDom, rastrumsOnCurrentPage)

  // render pedals
  renderPedals(svgDom, meiDom, rastrumsOnCurrentPage)

  // render fermatas
  renderFermatas(svgDom, meiDom, rastrumsOnCurrentPage)

  // render octaves
  renderOctaves(svgDom, meiDom, rastrumsOnCurrentPage)

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
} */

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
 * this function renders the fings in the diplomatic transcription
 * @param {*} svgDom
 * @param {*} meiDom
 * @param {*} rastrumsOnCurrentPage
 */
const renderFings = (svgDom, meiDom, rastrumsOnCurrentPage) => {
  meiDom.querySelectorAll('fing').forEach(fing => {
    const measure = svgDom.querySelector('g.measure')

    const systemZoneId = fing.closest('measure').previousElementSibling.getAttribute('facs').substr(1)
    const systemZone = [...meiDom.querySelectorAll('zone[type="sb"]')].find(zone => zone.getAttribute('xml:id') === systemZoneId)
    const rastrumIds = systemZone.getAttribute('bw.rastrumIDs').split(' ')

    const staffN = fing.getAttribute('staff').replace(/\s+/g, ' ').trim().split(' ')[0]

    const index = +staffN - 1

    const otherRastrumId = rastrumIds[index]

    const rastrum = rastrumsOnCurrentPage.find(rastrum => rastrum.id === otherRastrumId)

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.setAttribute('id', fing.getAttribute('xml:id'))
    g.setAttribute('data-id', fing.getAttribute('xml:id'))
    g.setAttribute('data-class', 'fing')
    g.setAttribute('class', 'fing')

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    const factor = 90 // 9px per vu, factor 10 as general factor of Verovio

    const fontSize = 303 // 405px is the font size of the tspan in the original MEI file

    const x1 = (parseFloat(fing.getAttribute('x')) + +rastrum.x) * factor
    const y1 = (parseFloat(fing.getAttribute('y')) + +rastrum.y + fontSize / factor) * factor

    text.setAttribute('x', x1)
    text.setAttribute('y', y1)
    text.setAttribute('text-anchor', 'start')
    text.setAttribute('font-size', '0px')

    const outerTspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
    outerTspan.setAttribute('id', fing.getAttribute('xml:id') + '_tspan')
    outerTspan.setAttribute('class', 'text')

    const innerTspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
    innerTspan.setAttribute('font-size', fontSize + 'px')
    innerTspan.textContent = fing.textContent

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
 * this function renders the pedals in the diplomatic transcription
 * @param {*} svgDom
 * @param {*} meiDom
 * @param {*} rastrumsOnCurrentPage
 */
const renderPedals = (svgDom, meiDom, rastrumsOnCurrentPage) => {
  const pedals = meiDom.querySelectorAll('pedal')

  if (pedals.length) {
    // add a symbol in the defs area…
    const defs = svgDom.querySelector('defs')

    const symbol1 = document.createElementNS('http://www.w3.org/2000/svg', 'symbol')
    symbol1.setAttribute('id', 'pedalDown-symbol')
    symbol1.setAttribute('viewBox', '0 0 1000 1000')
    symbol1.setAttribute('overflow', 'inherit')

    const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path1.setAttribute('transform', 'scale(1,-1)')
    path1.setAttribute('d', 'M657 134c0 -35 -12 -66 -37 -93s-54 -41 -87 -41h-14c-6 8 -11 14 -14 17c-11 12 -21 18 -29 18c-15 0 -27 -3 -38 -10c-13 -11 -24 -19 -32 -25h-66l-40 47l-33 -47h-77c-5 19 -10 33 -13 42c-6 15 -13 22 -24 22h-3c-17 -2 -33 -12 -49 -30c-9 -11 -19 -23 -29 -34h-34 c0 29 34 67 103 113c33 22 49 46 49 72c0 17 -11 41 -32 71s-32 65 -33 106c0 15 1 30 3 47s6 37 11 61c-1 4 -4 7 -7 9s-9 3 -18 3c-19 -5 -33 -11 -42 -18c-28 -21 -42 -54 -42 -97c0 -11 2 -20 5 -27s8 -12 13 -15c2 -1 4 -1 6 -1c14 0 26 14 36 42c3 3 6 5 9 8 c1 -2 1 -6 1 -11c0 -15 -4 -28 -12 -40c-11 -16 -28 -26 -50 -31c-9 0 -17 5 -24 15c-9 13 -14 32 -14 55c0 45 15 82 45 110s68 42 113 42c52 0 92 -10 119 -30s41 -48 42 -83c0 -14 -2 -28 -7 -42c-12 -21 -27 -31 -44 -31c-18 0 -36 9 -53 28s-26 34 -26 47c0 6 2 9 7 10 c4 -11 8 -20 12 -25c12 -17 27 -26 46 -26c15 0 25 4 30 12s8 19 8 32c0 21 -8 36 -23 47s-35 19 -60 24c-10 2 -17 3 -20 3c-4 0 -13 -1 -26 -3c-5 -15 -9 -31 -11 -46s-3 -34 -3 -57c0 -21 7 -43 21 -68l54 -90c3 -13 4 -25 4 -37c0 -22 -8 -42 -25 -61 c-9 -9 -13 -17 -13 -22c9 -9 15 -20 18 -33s15 -23 36 -28c17 5 29 10 36 15s10 12 10 21c0 7 -4 19 -12 38c-5 13 -9 23 -11 30c-1 6 -1 11 -1 14c0 28 8 53 24 76s38 34 67 34c21 0 36 -4 44 -12s14 -23 17 -46c0 -3 1 -6 1 -9c0 -18 -8 -35 -22 -49 c-23 -21 -45 -41 -68 -61c6 -11 13 -21 21 -31c17 -21 33 -31 50 -31c12 0 25 5 39 15c4 3 10 8 17 15c-1 12 -2 22 -2 31c0 37 7 68 20 95c19 38 51 67 97 87c-21 47 -53 88 -96 124c-41 29 -82 57 -123 86c29 -3 66 -17 111 -44c55 -32 98 -70 131 -115 c42 -57 63 -118 63 -184zM379 227c-10 0 -20 -1 -31 -2s-18 -6 -22 -15s-7 -17 -8 -25s-2 -17 -2 -26v-20c28 0 46 9 55 28c5 11 8 31 8 60zM513 54c6 -13 16 -19 30 -19c16 0 30 8 43 24s19 39 20 70c0 25 -3 52 -10 80s-15 42 -25 43c-21 -9 -38 -26 -50 -52 s-18 -55 -18 -87c0 -23 3 -43 10 -59zM671 50c7 0 12 -3 17 -8s7 -11 7 -18s-3 -12 -8 -17s-12 -7 -19 -7s-12 3 -17 8s-7 12 -7 19c0 15 9 23 27 23z')

    const symbol2 = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    symbol2.setAttribute('id', 'pedalUp-symbol')

    const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path2.setAttribute('transform', 'scale(1,-1)')
    path2.setAttribute('d', 'M217 244c-22 0 -39 -16 -39 -37c0 -18 21 -34 39 -35c20 0 35 18 35 37c0 21 -15 34 -35 35zM44 317c3 26 25 51 52 51c16 0 28 -4 32 -12c11 -14 14 -56 22 -76c6 -8 14 -12 25 -14l16 5c9 5 14 11 15 25c0 7 -2 13 -5 17l-11 18l-17 17l-9 22c0 28 25 47 53 47 s50 -23 50 -47c0 -20 -7 -25 -21 -39l-15 -20c-4 -7 -6 -13 -7 -18c1 -4 5 -11 5 -14l11 -11l14 -7c20 2 30 22 33 47c0 39 17 58 49 58c26 0 46 -21 46 -47c0 -29 -23 -46 -54 -46c-30 0 -45 -11 -48 -34l5 -12c1 -3 4 -5 7 -8c1 -2 6 -3 14 -5c10 2 17 6 23 12 c8 3 6 4 16 12l21 15c4 3 12 5 21 5c23 0 43 -26 44 -49c0 -20 -16 -41 -30 -49c-3 -1 -10 -3 -19 -4c-7 1 -16 7 -30 18l-26 19c-4 3 -11 4 -20 4c-8 0 -14 -1 -17 -4l-9 -19c2 -13 6 -21 14 -24l11 -4l27 -5c16 0 28 -4 37 -12c9 -6 13 -17 13 -34c0 -13 -5 -25 -14 -34 c-9 -8 -22 -13 -36 -16c-11 2 -23 8 -34 19c-8 11 -11 27 -11 47c0 11 -4 21 -7 27c-5 8 -14 12 -26 12c-19 0 -29 -15 -32 -31c3 -7 8 -14 11 -21c4 -8 8 -14 13 -21l8 -8l5 -10c3 -5 4 -13 5 -21c0 -26 -26 -39 -52 -39c-25 0 -45 15 -48 39c1 6 5 18 7 21 c11 14 22 29 33 43c2 4 3 10 4 19c0 17 -8 26 -24 29c-31 0 -40 -20 -40 -51s-17 -49 -48 -54c-33 7 -42 20 -50 52c3 31 25 46 66 46c19 0 37 12 37 31c0 8 -3 13 -8 16c-3 4 -8 7 -16 7c-10 0 -24 -6 -40 -18c-14 -9 -25 -16 -39 -21c-28 3 -45 20 -46 51 c0 26 18 47 44 47c19 0 31 -9 44 -19l18 -14l19 -7c18 4 26 12 26 23c0 23 -15 34 -46 34c-37 0 -57 14 -61 44z')

    symbol1.appendChild(path1)
    defs.appendChild(symbol1)

    symbol2.appendChild(path2)
    defs.appendChild(symbol2)
  }

  pedals.forEach(pedal => {
    const measure = svgDom.querySelector('g.measure')

    const systemZoneId = pedal.closest('measure').previousElementSibling.getAttribute('facs').substr(1)
    const systemZone = [...meiDom.querySelectorAll('zone[type="sb"]')].find(zone => zone.getAttribute('xml:id') === systemZoneId)
    const rastrumIds = systemZone.getAttribute('bw.rastrumIDs').split(' ')

    const staffN = pedal.getAttribute('staff').replace(/\s+/g, ' ').trim().split(' ')[0]

    const index = +staffN - 1

    const otherRastrumId = rastrumIds[index]

    const rastrum = rastrumsOnCurrentPage.find(rastrum => rastrum.id === otherRastrumId)

    const factor = 90 // 9px per vu, factor 10 as general factor of Verovio
    const x = (parseFloat(pedal.getAttribute('x')) + +rastrum.x) * factor
    const y = (parseFloat(pedal.getAttribute('y')) + +rastrum.y + 405 / factor) * factor

    /*
      <g data-id="x8e1d4d35-2d97-4ce3-9f31-a6ca9dc4cd64" data-class="trill" class="trill">
        <use href="#E566-tuntfg1" x="31589" y="948" height="720px" width="720px"></use>
      </g >
    */
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.setAttribute('data-id', pedal.getAttribute('xml:id'))
    g.setAttribute('data-class', 'pedal')
    g.setAttribute('class', 'pedal')

    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use')
    if (pedal.hasAttribute('dir') && pedal.getAttribute('dir') === 'up') {
      use.setAttribute('href', '#pedalUp-symbol')
    } else {
      use.setAttribute('href', '#pedalDown-symbol')
    }

    use.setAttribute('x', x + 'px')
    use.setAttribute('y', y + 'px')
    use.setAttribute('height', '720px')
    use.setAttribute('width', '720px')

    g.append(use)
    measure.append(g)
  })
}

/**
 * this function renders the fermatas in the diplomatic transcription
 * @param {*} svgDom
 * @param {*} meiDom
 * @param {*} rastrumsOnCurrentPage
 */
const renderFermatas = (svgDom, meiDom, rastrumsOnCurrentPage) => {
  const fermatas = meiDom.querySelectorAll('fermata')

  if (fermatas.length) {
    // add a symbol in the defs area…
    const defs = svgDom.querySelector('defs')

    const symbol1 = document.createElementNS('http://www.w3.org/2000/svg', 'symbol')
    symbol1.setAttribute('id', 'fermataNorm-symbol')
    symbol1.setAttribute('viewBox', '0 0 1000 1000')
    symbol1.setAttribute('overflow', 'inherit')

    const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path1.setAttribute('transform', 'scale(1,-1)')
    path1.setAttribute('d', 'M0 0c0 0 40 320 300 320s300 -320 300 -320h-32s-38 227 -268 227s-268 -227 -268 -227h-32zM355 52c0 -30 -25 -55 -55 -55s-55 25 -55 55s25 55 55 55s55 -25 55 -55z')

    const symbol2 = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    symbol2.setAttribute('id', 'fermataInv-symbol')

    const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path2.setAttribute('transform', 'scale(1,-1)')
    path2.setAttribute('d', 'M0 0h32s38 -227 268 -227s268 227 268 227h32s-40 -320 -300 -320s-300 320 -300 320zM355 -52c0 -30 -25 -55 -55 -55s-55 25 -55 55s25 55 55 55s55 -25 55 -55z')

    symbol1.appendChild(path1)
    defs.appendChild(symbol1)

    symbol2.appendChild(path2)
    defs.appendChild(symbol2)
  }

  fermatas.forEach(fermata => {
    const measure = svgDom.querySelector('g.measure')

    const systemZoneId = fermata.closest('measure').previousElementSibling.getAttribute('facs').substr(1)
    const systemZone = [...meiDom.querySelectorAll('zone[type="sb"]')].find(zone => zone.getAttribute('xml:id') === systemZoneId)
    const rastrumIds = systemZone.getAttribute('bw.rastrumIDs').split(' ')

    const staffN = fermata.getAttribute('staff').replace(/\s+/g, ' ').trim().split(' ')[0]

    const index = +staffN - 1

    const otherRastrumId = rastrumIds[index]

    const rastrum = rastrumsOnCurrentPage.find(rastrum => rastrum.id === otherRastrumId)

    const factor = 90 // 9px per vu, factor 10 as general factor of Verovio
    const x = (parseFloat(fermata.getAttribute('x')) + +rastrum.x) * factor
    const y = (parseFloat(fermata.getAttribute('y')) + +rastrum.y) * factor

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.setAttribute('data-id', fermata.getAttribute('xml:id'))
    g.setAttribute('data-class', 'fermata')
    g.setAttribute('class', 'fermata')

    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use')
    if (fermata.hasAttribute('form') && fermata.getAttribute('form') === 'inv') {
      use.setAttribute('href', '#fermataInv-symbol')
    } else {
      use.setAttribute('href', '#fermataNorm-symbol')
    }

    use.setAttribute('x', x + 'px')
    use.setAttribute('y', y + 'px')
    use.setAttribute('height', '720px')
    use.setAttribute('width', '720px')

    g.append(use)
    measure.append(g)
  })
}

/**
 * this function renders the octaves in the diplomatic transcription
 * @param {*} svgDom
 * @param {*} meiDom
 * @param {*} rastrumsOnCurrentPage
 */
const renderOctaves = (svgDom, meiDom, rastrumsOnCurrentPage) => {
  const octaves = meiDom.querySelectorAll('octave')

  if (octaves.length) {
    // add a symbol in the defs area…
    const defs = svgDom.querySelector('defs')

    const symbol = document.createElementNS('http://www.w3.org/2000/svg', 'symbol')
    symbol.setAttribute('id', 'octave8-symbol')
    symbol.setAttribute('viewBox', '0 0 1000 1000')
    symbol.setAttribute('overflow', 'inherit')

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('transform', 'scale(1,-1)')
    path.setAttribute('d', 'M86 180c-15 17 -25 40 -28 67c0 11 3 22 8 33s13 21 23 29c21 15 47 23 78 23c29 0 53 -9 71 -27s27 -37 28 -58c0 -17 -6 -32 -17 -45s-28 -25 -51 -36c21 -25 32 -52 32 -80c0 -23 -10 -44 -30 -61c-21 -16 -51 -24 -90 -24c-34 0 -61 8 -80 25s-29 37 -30 60 c0 18 7 36 22 55c13 16 34 29 64 39zM98 168c-19 -12 -34 -25 -43 -38s-14 -28 -15 -44c2 -23 9 -38 21 -47s30 -15 55 -18c17 0 29 4 38 12s13 21 14 38c-3 21 -26 54 -70 97zM187 180c26 20 39 44 39 71c0 17 -5 31 -16 44s-25 19 -42 20c-28 0 -44 -15 -47 -44l2 -12 c7 -22 29 -48 64 -79z')

    symbol.appendChild(path)
    defs.appendChild(symbol)
  }

  octaves.forEach(octave => {
    const measure = svgDom.querySelector('g.measure')

    const systemZoneId = octave.closest('measure').previousElementSibling.getAttribute('facs').substr(1)
    const systemZone = [...meiDom.querySelectorAll('zone[type="sb"]')].find(zone => zone.getAttribute('xml:id') === systemZoneId)
    const rastrumIds = systemZone.getAttribute('bw.rastrumIDs').split(' ')

    const staffN = octave.getAttribute('staff').replace(/\s+/g, ' ').trim().split(' ')[0]

    const index = +staffN - 1

    const otherRastrumId = rastrumIds[index]

    const rastrum = rastrumsOnCurrentPage.find(rastrum => rastrum.id === otherRastrumId)

    const factor = 90 // 9px per vu, factor 10 as general factor of Verovio
    const x = (parseFloat(octave.getAttribute('x')) + +rastrum.x) * factor
    const y = (parseFloat(octave.getAttribute('y')) + +rastrum.y) * factor

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.setAttribute('data-id', octave.getAttribute('xml:id'))
    g.setAttribute('data-class', 'octave')
    g.setAttribute('class', 'octave')

    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use')
    if (octave.hasAttribute('dis') && octave.getAttribute('dis') === '15') {
      use.setAttribute('href', '#octave15-symbol')
    } else {
      use.setAttribute('href', '#octave8-symbol')
    }

    use.setAttribute('x', x + 'px')
    use.setAttribute('y', y + 'px')
    use.setAttribute('height', '720px')
    use.setAttribute('width', '720px')

    g.append(use)

    if (!octave.hasAttribute('extender') && octave.getAttribute('extender') !== 'false') {
      if (octave.getAttribute('dis.place') === 'above') {
        const lineX1 = x + 210 // taken from rendered example
        const lineY1 = y - 230 // taken from rendered example
        const lineX2 = lineX1 + parseFloat(octave.getAttribute('width')) * factor
        const d = `M${lineX1} ${lineY1} L${lineX2} ${lineY1}`

        const exPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        exPath.setAttribute('d', d)
        exPath.setAttribute('stroke-width', '18')
        exPath.setAttribute('stroke-linecap', 'square')
        exPath.setAttribute('stroke-dasharray', '36 72')

        g.append(exPath)

        const polyX1 = lineX2
        const polyY1 = lineY1 + 180
        const polyX2 = lineX2
        const polyY2 = lineY1
        const polyX3 = lineX2 - 90
        const polyY3 = lineY1

        const points = `${polyX1},${polyY1} ${polyX2},${polyY2} ${polyX3},${polyY3}`

        const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline')
        polyline.setAttribute('stroke', 'currentColor')
        polyline.setAttribute('stroke-width', '18')
        polyline.setAttribute('stroke-opacity', '1')
        polyline.setAttribute('fill', 'none')
        polyline.setAttribute('points', points)
        g.append(polyline)
      } else {
        const lineX1 = x + 210 // taken from rendered example
        const lineY1 = y - 9 // taken from rendered example
        const lineX2 = lineX1 + parseFloat(octave.getAttribute('width')) * factor
        const d = `M${lineX1} ${lineY1} L${lineX2} ${lineY1}`

        const exPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        exPath.setAttribute('d', d)
        exPath.setAttribute('stroke-width', '18')
        exPath.setAttribute('stroke-linecap', 'square')
        exPath.setAttribute('stroke-dasharray', '36 72')

        g.append(exPath)

        const polyX1 = lineX2
        const polyY1 = lineY1 - 180
        const polyX2 = lineX2
        const polyY2 = lineY1
        const polyX3 = lineX2 - 90
        const polyY3 = lineY1

        const points = `${polyX1},${polyY1} ${polyX2},${polyY2} ${polyX3},${polyY3}`

        const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline')
        polyline.setAttribute('stroke', 'currentColor')
        polyline.setAttribute('stroke-width', '18')
        polyline.setAttribute('stroke-opacity', '1')
        polyline.setAttribute('fill', 'none')
        polyline.setAttribute('points', points)
        g.append(polyline)
      }
    }

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
 * this function renders the tempos in the diplomatic transcription
 * @param {*} svgDom
 * @param {*} meiDom
 * @param {*} rastrumsOnCurrentPage
 */
const renderTempos = (svgDom, meiDom, rastrumsOnCurrentPage) => {
  meiDom.querySelectorAll('tempo').forEach(tempo => {
    const measure = svgDom.querySelector('g.measure')

    const systemZoneId = tempo.closest('measure').previousElementSibling.getAttribute('facs').substr(1)
    const systemZone = [...meiDom.querySelectorAll('zone[type="sb"]')].find(zone => zone.getAttribute('xml:id') === systemZoneId)
    const rastrumIds = systemZone.getAttribute('bw.rastrumIDs').split(' ')

    const staffN = tempo.getAttribute('staff').replace(/\s+/g, ' ').trim().split(' ')[0]

    const index = +staffN - 1

    const otherRastrumId = rastrumIds[index]

    const rastrum = rastrumsOnCurrentPage.find(rastrum => rastrum.id === otherRastrumId)

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.setAttribute('id', tempo.getAttribute('xml:id'))
    g.setAttribute('data-id', tempo.getAttribute('xml:id'))
    g.setAttribute('data-class', 'tempo')
    g.setAttribute('class', 'tempo')

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    const factor = 90 // 9px per vu, factor 10 as general factor of Verovio

    const fontSize = 405 // 405px is the font size of the tspan in the original MEI file

    const x1 = (parseFloat(tempo.getAttribute('x')) + +rastrum.x) * factor
    const y1 = (parseFloat(tempo.getAttribute('y')) + +rastrum.y + fontSize / factor) * factor
    const w = (parseFloat(tempo.getAttribute('width'))) * factor

    text.setAttribute('x', x1)
    text.setAttribute('y', y1)
    text.setAttribute('text-anchor', 'start')
    text.setAttribute('font-size', '0px')
    text.setAttribute('textLength', w + 'px')

    const outerTspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
    outerTspan.setAttribute('id', tempo.getAttribute('xml:id') + '_tspan')
    outerTspan.setAttribute('class', 'text')

    const innerTspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
    innerTspan.setAttribute('font-size', fontSize + 'px')
    innerTspan.textContent = tempo.textContent

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
