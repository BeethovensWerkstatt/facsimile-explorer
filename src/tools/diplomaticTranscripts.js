/**
 * cleans up the diplomatic transcript to overcome Verovio restrictions and other issues
 * @param {} svgDom
 */
export const cleanUpDiplomaticTranscript = (svgDom, meiDom, rastrumsOnCurrentPage) => {
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

    const section = barLine.closest('section')

    const diploStaffDef = section.parentElement.querySelector('staffDef[n="1"]')
    const rastrumId = diploStaffDef.getAttribute('decls').split('#')[1]

    const rastrum = rastrumsOnCurrentPage.find(rastrum => rastrum.id === rastrumId)

    console.log(571, 'barLine', barLine, barLine.closest('section'))
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.setAttribute('data-id', barLine.getAttribute('xml:id'))
    g.setAttribute('data-class', 'barLine')
    g.setAttribute('class', 'barLine')

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    const factor = 90 // 9px per vu, factor 10 as general factor of Verovio

    // TODO: the "+4" is a constant factor that I do not fully understand yet
    const x1 = (parseFloat(barLine.getAttribute('x')) + parseFloat(barLine.getAttribute('ho'))) * factor
    const y1 = (parseFloat(barLine.getAttribute('y')) + +rastrum.y) * factor
    const x2 = (parseFloat(barLine.getAttribute('x2')) + parseFloat(barLine.getAttribute('ho'))) * factor
    const y2 = (parseFloat(barLine.getAttribute('y2')) + +rastrum.y) * factor

    // console.log(463, 'barLine ', barLine, '\nx1 ', x1, '\nxy ', y1, '\nx2 ', x2, '\ny2 ', y2, '\nfactor ', factor)

    path.setAttribute('d', 'M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2)
    path.setAttribute('stroke-width', '27')

    g.append(path)
    measure.append(g)
  })

  // render dynams
  meiDom.querySelectorAll('dynam').forEach(dynam => {
    const measure = svgDom.querySelector('g.measure')

    const systemZoneId = dynam.closest('measure').previousElementSibling.getAttribute('facs').substr(1)
    console.log(571, 'systemZoneId', systemZoneId)
    const systemZone = [...meiDom.querySelectorAll('zone[type="sb"]')].find(zone => zone.getAttribute('xml:id') === systemZoneId)
    console.log(571, 'systemZone s', systemZone)
    console.log(571, meiDom.querySelectorAll('zone[type="sb"]'))
    const rastrumIds = systemZone.getAttribute('bw.rastrumIDs').split(' ')

    // const section = dynam.closest('section')
    const staffN = dynam.getAttribute('staff').replace(/\s+/g, ' ').trim().split(' ')[0]

    const index = +staffN - 1

    // const diploStaffDef = section.parentElement.querySelector('staffDef[n="' + staffN + '"]')

    // const staff = section.querySelector('staff[n="' + staffN + '"]')

    // const rastrumId = staff.getAttribute('decls').split('#')[1]
    const otherRastrumId = rastrumIds[index]

    const rastrum = rastrumsOnCurrentPage.find(rastrum => rastrum.id === otherRastrumId)

    console.log(571, 'dynam', dynam, 'rastrum', rastrum)

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
    const y1 = (parseFloat(dynam.getAttribute('y')) + +rastrum.y + (fontSize / 90)) * factor

    text.setAttribute('x', x1)
    text.setAttribute('y', y1)
    text.setAttribute('text-anchor', 'middle')
    text.setAttribute('font-size', '0px')

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

  // move flag(s) to the correct position
  const chords = svgDom.querySelectorAll('g.chord')
  console.log(443, 'chords', chords)
  chords.forEach((chord) => {
    if (chord.hasAttribute('data-stem.dir')) {
      const stemDir = chord.getAttribute('data-stem.dir')
      if (stemDir === 'down') {
        const flag = chord.querySelector('g.flag use')
        if (flag) {
          const x = chord.querySelector('g.notehead use').getAttribute('x')
          console.log(443, 'flag x', x, flag)
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

  return svgDom
}
