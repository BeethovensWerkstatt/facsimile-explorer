import { boundingboxDefaultControlpoints } from '@/tools'
import { uuid } from '@/tools/uuid.js'
import { getOsdRects } from '@/tools/facsimileHelpers.js'
import store from '@/store'
const parser = new DOMParser()

/**
 * MEI version tag
 */
export const MEIversion = '5.0'

const rawSelectables = [
  'note',
  'chord',
  'syl',
  'rest',
  'mRest',
  'beam',
  'beamSpan',
  'artic',
  'accid',
  'clef',
  'slur',
  'tie',
  'curve',
  'dynam',
  'dir',
  'keyAccid',
  'meterSig',
  'barLine',
  'dots',
  'hairpin',
  'trill'
  // 'staff',
  // 'measure'
]
const clsSelectables = []
rawSelectables.forEach(elem => {
  clsSelectables.push('.' + elem + ':not(.bounding-box)')
})
export const CSSselectables = clsSelectables.join(', ')

/**
 * generates a diplomatic transcription from a given annotated transcription and a list of shapes
 * @param {*} annotElem the annotated transcription to be converted
 * @param {*} shapes the shapes to be converted
 * @param {*} bbox the bounding box of the annotated transcription in mm and px
 * @param {*} svgPath the path to the SVG file containing the shapes
 * @param {*} correspPath the path to the corresponding diplomatic transcription
 * @param {*} annotElemRef the reference to the annotated element, used for dots
 * @returns the generated diplomatic transcription
 */
export function generateDiplomaticElement (annotElem, shapes, bbox, svgPath, correspPath, annotElemRef, specialModes) {
  let name = annotElem.localName

  // console.log(881, annotElem, shapes, bbox, svgPath, correspPath, annotElemRef)

  if (name === 'beam') {
    name = 'beamSpan'
  } else if (name === 'measure') {
    name = 'barLine'
  } if (name === 'staff') {
    switch (annotElemRef.name) {
      case 'keyAccid':
        name = 'accid'
        break
      default:
        name = annotElemRef.name
    }
  } else if (name === 'note' && annotElem.parentNode.localName === 'chord' && annotElemRef.name !== 'dots') {
    name = 'chord'
  } else if ((name === 'note' || name === 'rest') && annotElemRef.name === 'dots') {
    name = 'dot'
  } else if (name === 'keyAccid') {
    name = 'accid'
  } else if (name === 'tie' || name === 'slur') {
    name = 'curve'
  } else if (specialModes && specialModes.pitchClarificationLetter) {
    name = 'metaMark'
  }

  const elem = document.createElementNS('http://www.music-encoding.org/ns/mei', name)
  elem.setAttribute('xml:id', 'd' + uuid())
  elem.setAttribute('x', bbox.mm.x)

  const facs = []
  shapes.forEach(shape => {
    if (shape.hasAttribute('id')) {
      facs.push(svgPath + '#' + shape.getAttribute('id'))
    } else {
      console.warn('WARNING: Spotted a shape without an ID:', shape)
    }
  })
  elem.setAttribute('facs', facs.join(' '))
  // elem.setAttribute('corresp', annotElem.getAttribute('xml:id'))

  const existingCorresp = annotElem.getAttribute('corresp')
  const newCorresp = correspPath + elem.getAttribute('xml:id')
  const corresp = existingCorresp ? existingCorresp + ' ' + newCorresp : newCorresp
  if (annotElem.hasAttribute('dots') && annotElemRef.name === 'dots' && (annotElem.localName === 'note' || annotElem.localName === 'rest')) {
    const count = +annotElem.getAttribute('dots')
    annotElem.removeAttribute('dots')
    for (let i = 0; i < count; i++) {
      const dot = document.createElementNS('http://www.music-encoding.org/ns/mei', 'dot')
      dot.setAttribute('xml:id', 'd' + uuid())
      if (i === 0) {
        dot.setAttribute('corresp', newCorresp)
      }
      annotElem.appendChild(dot)
    }
  } else if (specialModes && specialModes.pitchClarificationLetter) {
    // Pitch Clarification Letters actually need a @corresp on the note they are clarifying, or an InfoBox won't be able to inform about them properly…
    annotElem.setAttribute('corresp', corresp)
  } else {
    annotElem.setAttribute('corresp', corresp)
  }

  if (name === 'note') {
    getDiplomaticNote(annotElem, elem)
  } else if (name === 'rest') {
    getDiplomaticRest(annotElem, elem)
  } else if (name === 'beamSpan' || name === 'beam') {
    getDiplomaticBeam(annotElem, elem)
  } else if (name === 'accid') {
    console.log(279, 'getDiplomaticAccid', annotElem, elem)
    getDiplomaticAccid(annotElem, elem, annotElemRef)
  } else if (name === 'barLine') {
    getDiplomaticBarline(annotElem, elem, bbox)
  } else if (name === 'dot') {
    getDiplomaticDot(annotElem, elem)
  } else if (name === 'chord') {
    if (annotElem.localName === 'note') {
      annotElem = annotElem.parentNode
    }
    getDiplomaticChord(annotElem, elem)
  } else if (name === 'keyAccid') {
    getDiplomaticKeyAccid(annotElem, elem)
  } else if (name === 'meterSig') {
    getDiplomaticMetersig(annotElem, elem, annotElemRef.meter)
  } else if (name === 'clef') {
    getDiplomaticClef(annotElem, elem, annotElemRef.clef)
  } else if (name === 'curve') {
    getDiplomaticCurve(annotElem, elem, bbox)
  } else if (name === 'dynam') {
    getDiplomaticDynam(annotElem, elem, bbox)
  } else if (name === 'dir') {
    getDiplomaticDir(annotElem, elem, bbox)
  } else if (name === 'hairpin') {
    getDiplomaticHairpin(annotElem, elem, bbox)
  } else if (name === 'trill') {
    getDiplomaticTrill(annotElem, elem, bbox)
  } else if (name === 'metaMark') {
    if (specialModes && specialModes.pitchClarificationLetter) {
      getPitchClarificationLetter(annotElem, elem, bbox)
    }
  } else {
    console.warn('TODO: @/tools/mei.js:generateDiplomaticElement() does not yet support ' + name + ' elements')
  }

  return elem
}

/**
 * translates an annotated note to a diplomatic note
 * @param {*} annotElem the annotated note to be translated
 * @param {*} note the diplomatic note to be translated
 */
function getDiplomaticNote (annotElem, note) {
  try {
    const loc = getLocAttribute(annotElem)

    note.setAttribute('loc', loc)

    // head shape
    let headshape
    const dur = annotElem.getAttribute('dur')
    if (dur === '1') {
      headshape = 'whole'
    } else if (dur === '2') {
      headshape = 'half'
    } else if (parseInt(dur) >= 4) {
      headshape = 'quarter'
    }
    if (annotElem.hasAttribute('head.shape')) {
      headshape = annotElem.getAttribute('head.shape')
    }
    note.setAttribute('head.shape', headshape)
    note.setAttribute('dur', dur)

    // stem direction
    if (annotElem.hasAttribute('stem.dir')) {
      note.setAttribute('stem.dir', annotElem.getAttribute('stem.dir'))
    } else if (dur !== '1') {
      note.setAttribute('stem.dir', loc < 4 ? 'up' : 'down')
    }

    const grace = annotElem.getAttribute('grace')
    if (grace) {
      note.setAttribute('grace', grace)
    }

    // log('diplomatic note:', note)
  } catch (err) {
    console.warn('WARNING: Could not properly generate diplomatic note for ' + annotElem, err)
  }
}

/**
 * translates an annotated rest to a diplomatic rest
 * @param {*} annotElem the annotated rest to be translated
 * @param {*} rest the diplomatic rest to be translated
 */
function getDiplomaticRest (annotElem, rest) {
  try {
    rest.setAttribute('loc', 5)

    let glyphName
    const dur = annotElem.getAttribute('dur')
    if (dur === '1') {
      glyphName = 'restWhole'
    } else if (dur === '2') {
      glyphName = 'restHalf'
    } else if (dur === '4') {
      glyphName = 'restQuarter'
    } else if (dur === '8') {
      glyphName = 'rest8th'
    } else if (dur === '16') {
      glyphName = 'rest16th'
    } else if (dur === '32') {
      glyphName = 'rest32nd'
    } else if (dur === '64') {
      glyphName = 'rest64th'
    }

    if (annotElem.hasAttribute('glyph.name')) {
      glyphName = annotElem.getAttribute('glyph.name')
    }
    rest.setAttribute('glyph.name', glyphName)
    rest.setAttribute('glyph.auth', 'smufl')
  } catch (err) {
    console.warn('WARNING: Could not properly generate diplomatic rest for ' + annotElem, err)
  }
}

/**
 * translates an annotated beam to a diplomatic beam
 * @param {*} annotElem the annotated beam to be translated
 * @param {*} beam the diplomatic beam to be translated
 */
function getDiplomaticBeam (annotElem, beam) {
  const dtdoc = store.getters.diplomaticTranscriptForCurrentWz
  const targets = []
  annotElem.querySelectorAll('[corresp]').forEach(elem => {
    console.log('718: investigating ', elem)
    if (elem.localName === 'chord' || (elem.localName === 'note' && !elem.closest('chord'))) {
      // multiple associations are possible!
      for (const correspelem of elem.getAttribute('corresp').split(' ')) {
        // get uid for corresponding element
        const corresp = correspelem.split('#')[1]
        const dtelem = dtdoc.querySelector('*[*|id="' + corresp + '"]')
        console.log('718: found ', corresp, dtelem)
        // check target element
        if (corresp.trim().length > 0 && dtelem) {
          targets.push('#' + corresp)
        }
      }
    }
  })
  beam.setAttribute('plist', targets.join(' '))
  beam.setAttribute('startid', targets[0])
  beam.setAttribute('endid', targets.splice(-1)[0])
  beam.setAttribute('staff', annotElem.closest('staff').getAttribute('n'))
  console.log(718, '\n', beam, '\n', annotElem, '\n', targets)
}

/**
 * translates an annotated accidental to a diplomatic accidental
 * @param {*} annotElem the annotated accidental to be translated
 * @param {*} accid the diplomatic accid to be translated
 */
function getDiplomaticAccid (annotElem, accid, { keySig, keyAccid, keyBase }) {
  // console.log(279, 'getDiplomaticAccid', annotElem, accid, keySig)
  if (keySig) {
    const sharp = keySig >= 0
    accid.setAttribute('accid', sharp ? 's' : 'f')
    // get location of accidental in the range of [3-9] TODO: G-clef ... what about F-Clef?
    const base = keySig < 0 ? 1 : 5
    const fact = keySig < 0 ? 3 : 4
    const loc = (keyBase + base + (keyAccid * fact) - 3) % 7 + 3
    accid.setAttribute('loc', loc)
    // console.log(279, accid)
  } else {
    accid.setAttribute('accid', annotElem.getAttribute('accid'))
    const note = annotElem.closest('note')
    accid.setAttribute('loc', getLocAttribute(note))
  }
}

/**
 * translates an annotated barLine to a diplomatic barLine
 * @param {*} annotElem the annotated barLine to be translated
 * @param {*} barLine the diplomatic barLine to be translated
 */
function getDiplomaticBarline (annotElem, barLine, bbox) {
  barLine.setAttribute('form', 'single')
  barLine.setAttribute('x', (parseFloat(bbox.mm.x) + parseFloat(bbox.mm.w)).toFixed(1))
  barLine.setAttribute('y', bbox.mm.y)
  barLine.setAttribute('x2', (parseFloat(bbox.mm.x)).toFixed(1))
  barLine.setAttribute('y2', (parseFloat(bbox.mm.y) + parseFloat(bbox.mm.h)).toFixed(1))
  // console.log(364, '\n', barLine, '\n', annotElem)
}

/**
 * translates a dot from an annotated note to a diplomatic dot
 * @param {*} annotElem the annotated dot to be translated
 * @param {*} dot the diplomatic dot to be translated
 */
function getDiplomaticDot (annotElem, dot) {
  const loc = getLocAttribute(annotElem)

  dot.setAttribute('loc', loc)
}

/**
 * translates a dynamic from an annotated note to a diplomatic dynamic
 * @param {*} annotElem the annotated dynam to be translated
 * @param {*} dynam the initial dynam that needs specific treatment
 * @returns the dt:dynam element
 */
function getDiplomaticDynam (annotElem, dynam, bbox) {
  dynam.setAttribute('x', (parseFloat(bbox.mm.x)).toFixed(1))
  dynam.setAttribute('width', (parseFloat(bbox.mm.w)).toFixed(1))
  dynam.setAttribute('y', bbox.mm.y)
  dynam.setAttribute('staff', annotElem.getAttribute('staff').replace(/\s+/g, ' ').trim().split(' ')[0])
  dynam.innerHTML = annotElem.innerHTML.replace(/\s+/g, ' ').trim()
}

/**
 * translates a dir from an annotated note to a diplomatic dir
 * @param {*} annotElem the annotated dir to be translated
 * @param {*} dynam the initial dir that needs specific treatment
 * @returns the dt:dir element
 */
function getDiplomaticDir (annotElem, dir, bbox) {
  dir.setAttribute('x', (parseFloat(bbox.mm.x)).toFixed(1))
  dir.setAttribute('width', (parseFloat(bbox.mm.w)).toFixed(1))
  dir.setAttribute('y', bbox.mm.y)
  dir.setAttribute('staff', annotElem.getAttribute('staff').replace(/\s+/g, ' ').trim().split(' ')[0])
  dir.innerHTML = annotElem.innerHTML.replace(/\s+/g, ' ').trim()
}

/**
 * translates a trill from an annotated note to a diplomatic trill
 * @param {*} annotElem the annotated trill to be translated
 * @param {*} trill the initial trill that needs specific treatment
 * @returns the dt:trill element
 */
function getDiplomaticTrill (annotElem, trill, bbox) {
  trill.setAttribute('x', +bbox.mm.x.toFixed(1))
  trill.setAttribute('y', +bbox.mm.y.toFixed(1))
  trill.setAttribute('staff', annotElem.getAttribute('staff').replace(/\s+/g, ' ').trim().split(' ')[0])
}

/**
 * generates a diplomatic hairpin
 * @param {*} annotElem the annotated hairpin to be translated
 * @param {*} hairpin the initial hairpin that needs specific treatment
 * @returns the dt:dir element
 */
function getDiplomaticHairpin (annotElem, hairpin, bbox) {
  hairpin.setAttribute('form', annotElem.getAttribute('form') || 'cres')

  const centerY = (bbox.mm.y + bbox.mm.h / 2).toFixed(1)
  const opening = bbox.mm.h.toFixed(1)
  hairpin.setAttribute('staff', annotElem.getAttribute('staff').replace(/\s+/g, ' ').trim().split(' ')[0])
  hairpin.removeAttribute('x')
  hairpin.setAttribute('x', (parseFloat(bbox.mm.x)).toFixed(1))
  hairpin.setAttribute('y', centerY)
  hairpin.setAttribute('x2', (parseFloat(bbox.mm.x) + parseFloat(bbox.mm.w)).toFixed(1))
  hairpin.setAttribute('y2', centerY)
  hairpin.setAttribute('opening', opening)
  hairpin.setAttribute('bw:start.opening', 0)
}

/**
 * translates a chord to a diplomatic chord
 * @param {*} annotElem the annotated chord to be translated
 * @param {*} chord the diplomatic chord to be translated
 */
function getDiplomaticChord (annotElem, chord) {
  // console.log(472, ' entering ', annotElem, chord)

  // chords will probably incorrectly point from a note to the diplomatic chord
  const correspPrefix = annotElem.getAttribute('corresp') || annotElem.querySelector('*[corresp]').getAttribute('corresp')
  const correspPath = correspPrefix.split('#')[0] + '#'
  annotElem.setAttribute('corresp', correspPath + chord.getAttribute('xml:id'))

  let dur = annotElem.getAttribute('dur')
  const durs = annotElem.querySelectorAll('*[dur]')
  for (const d of durs) {
    console.log(563, 'getDiplomaticChord(): checking duration in chord', d, annotElem)
    if (!dur) {
      dur = d.getAttribute('dur')
    } else if (d.hasAttribute('dur') && d.getAttribute('dur') !== dur) {
      console.warn(563, 'getDiplomaticChord(): inconsistent duration in chord!', annotElem)
    }
  }
  chord.setAttribute('dur', dur)
  console.log(563, 'getDiplomaticChord(): setting duration', dur)
  // annotElem is the chord element. If stem.dir is not set here, stemdir will be null
  let stemdir = annotElem.getAttribute('stem.dir')
  const notes = annotElem.querySelectorAll('note')
  notes.forEach((note, i) => {
    const diploNote = document.createElementNS('http://www.music-encoding.org/ns/mei', 'note')
    diploNote.setAttribute('xml:id', 'd' + uuid())
    if (!note.hasAttribute('dur')) {
      // set duration if not set
      note.setAttribute('dur', dur)
    }
    getDiplomaticNote(note, diploNote)
    note.setAttribute('corresp', correspPath + diploNote.getAttribute('xml:id'))
    chord.append(diploNote)
    // if stem.dir is not set in chord element look into notes
    if (stemdir !== 'up' && stemdir !== 'down' && note.hasAttribute('stem.dir')) {
      stemdir = note.getAttribute('stem.dir')
    }
    /*
    if (i === 0 && !annotElem.hasAttribute('stem.dir')) {
      chord.setAttribute('stem.dir', note.getAttribute('stem.dir'))
    } else if (annotElem.hasAttribute('stem.dir')) {
      chord.setAttribute('stem.dir', annotElem.getAttribute('stem.dir'))
    }
    */
    diploNote.removeAttribute('stem.dir')
  })

  if (stemdir === 'up' || stemdir === 'down') {
    chord.setAttribute('stem.dir', stemdir)
  }
  // console.log(472, annotElem, chord)
}

function getDiplomaticKeyAccid (annotElem, keyAccid) {
  const loc = annotElem.getAttribute('loc')
  console.log('keyAccid:', loc)
  keyAccid.setAttribute('loc', loc)
  console.log('getDiplomaticKeysig', annotElem, keyAccid)
}

function getDiplomaticMetersig (annotElem, metersig, { count, unit }) {
  console.log('getDiplomaticMetersig', annotElem, metersig, count, unit)
  if (count && unit) {
    metersig.setAttribute('count', count)
    metersig.setAttribute('unit', unit)
  } else {
    console.warn('WARNING: Could not determine count or unit for metersig', annotElem, metersig)
  }
}

function getDiplomaticClef (annotElem, clef, annotElementClef) {
  const { shape, line } = annotElementClef || { shape: annotElem.getAttribute('shape'), line: annotElem.getAttribute('line') }
  console.log('getDiplomaticClef', annotElem, clef, shape, line)
  clef.setAttribute('shape', shape)
  clef.setAttribute('line', line)
}

function getDiplomaticCurve (annotElem, curve, bbox) {
  const bboxbezier = boundingboxDefaultControlpoints(bbox, annotElem.getAttribute('curvedir') === 'above')
  curve.removeAttribute('x')
  console.log('getDiplomaticCurve', annotElem, curve, bboxbezier, bbox)
  let staff
  if (annotElem.hasAttribute('staff')) {
    staff = annotElem.getAttribute('staff').replace(/\s+/g, ' ').trim().split(' ')[0]
  } else if (annotElem.closest('staff')) {
    staff = annotElem.closest('staff').getAttribute('n')
  } else if (annotElem.hasAttribute('startid')) {
    const startElem = annotElem.closest('mei').querySelector('*[*|id="' + annotElem.getAttribute('startid').substring(1) + '"]')
    if (startElem && startElem.closest('staff')) {
      staff = startElem.closest('staff').getAttribute('n')
    } else {
      console.warn('WARNING: Could not determine staff for curve', annotElem, startElem)
    }
  } else {
    staff = 1
  }
  curve.setAttribute('staff', staff)
  curve.setAttribute('bezier', bboxbezier.map(c => c.toFixed(2)).join(' '))
}

/**
 * generates a pitch clarification letter for the given annotated element
 * @param {*} annotElem the annotated element
 * @param {*} metaMark the metaMark element to be modified
 */
function getPitchClarificationLetter (annotElem, metaMark, bbox) {
  try {
    metaMark.setAttribute('function', 'clarification')
    metaMark.setAttribute('x', (parseFloat(bbox.mm.x)).toFixed(1))
    metaMark.setAttribute('width', (parseFloat(bbox.mm.w)).toFixed(1))
    metaMark.setAttribute('y', bbox.mm.y)
    const staff = annotElem.closest('staff').getAttribute('n')
    metaMark.setAttribute('staff', staff)

    const pname = annotElem.getAttribute('pname')
    if (pname) {
      const label = pname === 'b' ? 'h' : pname
      metaMark.innerHTML = label
    }
  } catch (err) {
    console.warn('WARNING: Could not properly generate pitch clarification letter for ' + annotElem, err)
  }
}

function getLocAttribute (annotElem) {
  if (!annotElem) {
    console.warn('WARNING: no proper annotElem provided to calculate @loc', annotElem)
    return 5
  }
  if (annotElem.localName === 'rest') {
    return 5
  }
  try {
    let staffN = annotElem.closest('staff').getAttribute('n')
    // TODO do we need other?
    if (annotElem.hasAttribute('staff')) {
      staffN = annotElem.getAttribute('staff')
    }
    if (!staffN) {
      console.warn('WARNING: Could not determine staff number for ' + annotElem)
    }
    const clefs = [...annotElem.closest('music').querySelectorAll('staff[n="' + staffN + '"] clef, staffDef[n="' + staffN + '"] clef, staffDef[n="' + staffN + '"][clef\\.line], *[*|id="' + annotElem.getAttribute('xml:id') + '"]')]
    clefs.sort((a, b) => {
      if (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) {
        return -1
      } else {
        return 1
      }
    })

    const annotIndex = clefs.indexOf(annotElem)
    const lastClef = clefs[annotIndex - 1]

    if (!lastClef) {
      console.warn('WARNING: Could not determine last clef for ' + annotElem)
    }

    const clefShape = lastClef.hasAttribute('clef.shape') ? lastClef.getAttribute('clef.shape') : lastClef.getAttribute('shape')
    const clefLine = lastClef.hasAttribute('clef.line') ? lastClef.getAttribute('clef.line') : lastClef.getAttribute('line')
    // const clefDis = lastClef.hasAttribute('clef.dis') ? lastClef.getAttribute('clef.dis') : lastClef.getAttribute('dis')

    const pitches = ['c', 'd', 'e', 'f', 'g', 'a', 'b']
    const pitchValue = pitches.indexOf(annotElem.getAttribute('pname'))
    const octaveValue = parseInt(annotElem.getAttribute('oct'))

    let loc = 4

    if (clefShape === 'G' && clefLine === '2') {
      loc = (octaveValue - 4) * 7 + pitchValue - 2
    } else if (clefShape === 'F' && clefLine === '4') {
      loc = (octaveValue - 3) * 7 + pitchValue + 3
    } else if (clefShape === 'C' && clefLine === '3') {
      loc = (octaveValue - 4) * 7 + pitchValue
    }

    // F4 in treble should be 1: (4-4) * 7 + 3 - 2
    // C4 in treble should be -2: (4-4) * 7 + 0 - 2
    // B3 in treble should be -3: (3-4) * 7 + 6 - 2

    // B3 in bass clef should be 9: (3-3) * 7 + 6 + 3
    // C3 in bass clef should be 3: (3-3) * 7 + 0 + 3
    // G2 in bass clef should be 0: (2-3) * 7 + 4 + 3

    return loc
  } catch (err) {
    console.warn('WARNING: Could not properly retrieve the @loc attribute for ' + annotElem + ' ' + annotElem.getAttribute('xml:id'), err)
    return 5
  }
}

/**
 * takes a template for diplomatic transcriptions and initializes it by generating IDs
 * @param {*} diploTemplate the template to be initialized
 * @param {*} filename the filename of the document containing the page where the diplomatic transcription is located
 * @param {*} wzObj the object for the current writing zone
 * @param {*} surfaceId the xml:id of the <surface> on which this writing zone is transcribed
 * @param {*} appVersion the version of the application, as taken from package.json
 * @param {*} affectedStaves the staves that are covered by this diplomatic transcription
 * @returns the initialized template
 */
export async function initializeDiploTrans (filename, wzObj, surfaceId, appVersion, affectedStaves, systemcount) {
  /*
  key words in the (former) template
  APP-VERSION
  CURRENT-DATE
  FILEPATH
  GENDESCWZ-ID
  NEW-ID
  SURFACE-ID
  */
  // console.log('881---------------------> ', affectedStaves, systemcount)
  const genDescWzId = wzObj.id
  const diploTemplate = await fetch('../assets/diplomaticTranscriptTemplate.xml')
    .then(response => response.text())
    .then(xmlString => parser.parseFromString(xmlString, 'application/xml'))

  diploTemplate.getElementsByTagNameNS('*', 'draft')[0].childNodes.forEach(node => {
    if (node.nodeType === Node.COMMENT_NODE) {
      node.remove()
    }
  })

  diploTemplate.querySelectorAll('*[*|id]').forEach(elem => {
    if (elem.getAttribute('xml:id') === '%NEW-ID%') {
      const id = elem.localName.substring(0, 1) + uuid()
      elem.setAttribute('xml:id', id)
    }
  })

  const date = new Date().toISOString().split('T')[0]
  const datePlaceholder = '%CURRENT-DATE%'
  diploTemplate.querySelectorAll('change').forEach(change => {
    if (change.getAttribute('isodate') === datePlaceholder) {
      change.setAttribute('isodate', date)
    }
  })

  diploTemplate.querySelector('application').setAttribute('version', appVersion)

  diploTemplate.querySelector('source').setAttribute('target', '../' + filename + '#' + genDescWzId)
  const pb = diploTemplate.querySelector('pb')
  pb.setAttribute('target', '../' + filename + '#' + surfaceId)
  const draft = diploTemplate.getElementsByTagNameNS('*', 'draft')[0]

  let system = null
  let section = null
  affectedStaves.forEach((obj, i) => {
    // TODO: explicit mapping!
    if (i % systemcount === 0) {
      system = document.createElementNS('https://beethovens-werkstatt.de/ns/meiAdditions', 'system')
      draft.append(system)
      system.setAttribute('xml:id', 's' + uuid())

      const scoreDef = document.createElementNS('http://www.music-encoding.org/ns/mei', 'scoreDef')
      scoreDef.setAttribute('xml:id', 's' + uuid())
      system.append(scoreDef)

      const staffGrp = document.createElementNS('http://www.music-encoding.org/ns/mei', 'staffGrp')
      staffGrp.setAttribute('xml:id', 's' + uuid())
      staffGrp.setAttribute('symbol', 'none')
      staffGrp.setAttribute('bar.thru', 'false')
      scoreDef.append(staffGrp)

      section = document.createElementNS('http://www.music-encoding.org/ns/mei', 'section')
      system.append(section)
      section.setAttribute('xml:id', 's' + uuid())

      for (let j = 0; j < systemcount; j++) {
        const staffDef = document.createElementNS('http://www.music-encoding.org/ns/mei', 'staffDef')
        staffDef.setAttribute('xml:id', 's' + uuid())
        staffDef.setAttribute('n', (j + 1))
        staffDef.setAttribute('lines', 5)
        staffDef.setAttribute('decls', '../' + filename + '#' + affectedStaves[i + j].rastrum.id)
        staffGrp.append(staffDef)

        const staff = document.createElementNS('http://www.music-encoding.org/ns/mei', 'staff')
        staff.setAttribute('n', (j + 1))
        staff.setAttribute('xml:id', 's' + uuid())
        section.append(staff)

        const layer = document.createElementNS('http://www.music-encoding.org/ns/mei', 'layer')
        layer.setAttribute('n', 1)
        layer.setAttribute('xml:id', 'l' + uuid())
        staff.append(layer)
      }
    }
  })

  // add join attributes to connect multiple accolades
  const sections = diploTemplate.querySelectorAll('section')
  if (sections.length > 1) {
    sections.forEach((section, i) => {
      const otherSectionIds = Array.from(sections)
        .filter((s, j) => j !== i)
        .map(s => '#' + s.getAttribute('xml:id'))

      section.setAttribute('join', otherSectionIds.join(' '))
    })
  }

  return diploTemplate
}

/**
 * generates an MEI that will render empty rastrums for a given page
 * @param {*} mei the MEI document containing the page
 * @param {*} surfaceId the xml:id of the <surface> element of the page
 * @returns the MEI document containing the empty rastrums
 */
export async function getEmptyPage (mei, surfaceId) {
  if (!mei || !surfaceId) {
    return null
  }

  const defaultFactor = 9

  const template = await fetch('../assets/emptyPageTemplate.xml')
    .then(response => response.text())
    .then(xmlString => parser.parseFromString(xmlString, 'application/xml'))

  const surface = [...mei.querySelectorAll('surface')].find(s => s.getAttribute('xml:id') === surfaceId)
  const layout = [...mei.querySelectorAll('layout')].find(l => '#' + l.getAttribute('xml:id') === surface.getAttribute('decls'))

  // retrieve correct folium / bifolium
  const folium = [...mei.querySelectorAll('foliaDesc *')].find(f => {
    if (f.getAttribute('outer.recto') === '#' + surfaceId) {
      return true
    }
    if (f.getAttribute('inner.verso') === '#' + surfaceId) {
      return true
    }
    if (f.getAttribute('inner.recto') === '#' + surfaceId) {
      return true
    }
    if (f.getAttribute('outer.verso') === '#' + surfaceId) {
      return true
    }
    if (f.getAttribute('recto') === '#' + surfaceId) {
      return true
    }
    if (f.getAttribute('verso') === '#' + surfaceId) {
      return true
    }
    return false
  })

  const outSurface = template.querySelector('surface')

  // properly set page dimensions
  outSurface.setAttribute('lry', parseFloat(folium.getAttribute('height') * defaultFactor))
  outSurface.setAttribute('lrx', parseFloat(folium.getAttribute('width') * defaultFactor))

  const appendNewElement = (parent, name, ns = 'http://www.music-encoding.org/ns/mei') => {
    const elem = parent.appendChild(document.createElementNS(ns, name))
    if (ns === 'http://www.w3.org/2000/svg') {
      elem.setAttribute('id', 's' + uuid())
    } else {
      elem.setAttribute('xml:id', 'x' + uuid())
    }
    return elem
  }
  const staffGrp = template.querySelector('staffGrp')
  const section = template.querySelector('section')

  const pbZone = appendNewElement(outSurface, 'zone')
  pbZone.setAttribute('type', 'pb')
  pbZone.setAttribute('ulx', '0')
  pbZone.setAttribute('uly', '0')
  pbZone.setAttribute('lrx', parseFloat(folium.getAttribute('width') * defaultFactor))
  pbZone.setAttribute('lry', parseFloat(folium.getAttribute('height') * defaultFactor))

  const pb = appendNewElement(section, 'pb')
  pb.setAttribute('facs', '#' + pbZone.getAttribute('xml:id'))

  layout.querySelectorAll('rastrum').forEach((rastrum, i) => {
    const staffDef = appendNewElement(staffGrp, 'staffDef')
    staffDef.setAttribute('n', i + 1)
    staffDef.setAttribute('lines', 5)
    const scale = (100 / 72 * parseFloat(rastrum.getAttribute('system.height')) * defaultFactor).toFixed(1) + '%'
    staffDef.setAttribute('scale', scale)

    const sbZone = appendNewElement(outSurface, 'zone')
    sbZone.setAttribute('type', 'sb')
    sbZone.setAttribute('ulx', parseFloat(rastrum.getAttribute('system.leftmar') * defaultFactor))
    sbZone.setAttribute('uly', parseFloat(rastrum.getAttribute('system.topmar') * defaultFactor))

    const sb = appendNewElement(section, 'sb')
    sb.setAttribute('facs', '#' + sbZone.getAttribute('xml:id'))

    const measureZone = appendNewElement(outSurface, 'zone')
    measureZone.setAttribute('type', 'measure')
    measureZone.setAttribute('ulx', parseFloat(rastrum.getAttribute('system.leftmar') * defaultFactor))
    measureZone.setAttribute('lrx', (parseFloat(rastrum.getAttribute('system.leftmar')) + parseFloat(rastrum.getAttribute('width'))) * defaultFactor)

    const measure = appendNewElement(section, 'measure')
    measure.setAttribute('facs', '#' + measureZone.getAttribute('xml:id'))

    const staffZone = appendNewElement(outSurface, 'zone')
    staffZone.setAttribute('type', 'staff')
    staffZone.setAttribute('uly', parseFloat(rastrum.getAttribute('system.topmar')) * defaultFactor)

    const staff = appendNewElement(measure, 'staff')
    staff.setAttribute('facs', '#' + staffZone.getAttribute('xml:id'))
    staff.setAttribute('rotate', rastrum.getAttribute('rotate'))

    const layer = appendNewElement(staff, 'layer')
    layer.setAttribute('n', 1)
  })

  return template
}

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
                        <measure x="290" x2="3323" n="1">
                                  <staff n="1" coord.y1="2416">
  */
  system.setAttribute('system.leftmar', 0)
  system.setAttribute('system.rightmar', 0)
  system.append(document.createTextNode('\n    '))
  system.append(measure)
  system.append(document.createTextNode('\n  '))
  measure.setAttribute('x', left)
  measure.setAttribute('x2', right)
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

/**
 * checks if SVG has grouped unassigned shapes already. Used during import.
 * @param  {[type]} svg               [description]
 * @return {[type]}     [description]
 */
export function verifyUnassignedGroupInSvg (svg) {
  // JPV: svg is XMLDocument now
  const children = [...svg.documentElement.children]

  const unassignedShapes = []
  children.forEach(elem => {
    if (elem.localName === 'path') {
      unassignedShapes.push(elem)
    }
  })

  const outSvg = svg.cloneNode(true)

  if (unassignedShapes.length === 0) {
    // console.log('INFO no shapes to move')
    return outSvg
  }

  const existingGroup = svg.querySelector('g[class="unassigned"]')

  let g

  if (existingGroup) {
    g = existingGroup
  } else {
    g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.setAttribute('class', 'unassigned')
  }

  unassignedShapes.forEach(path => {
    g.append(path)
  })

  outSvg.append(g)

  return outSvg
}

/**
 * converts rectangles between mm and px units
 * @param  {[type]} dom                     [description]
 * @param  {[type]} surfaceId               [description]
 * @param  {[type]} xywh                    [description]
 * @param  {[type]} dir                     [description]
 * @param  {[type]} getters                 access to the store's getters
 * @return {[type]}           [description]
 */
export function convertRectUnits (dom, surfaceId, xywh, dir, getters) {
  if (dir !== 'px2mm' && dir !== 'mm2px') {
    console.log('Failed to provide proper translation direction on ' + surfaceId + ' for dir "' + dir + '". Rect: ', xywh)
    return false
  }

  const surface = dom.querySelector('surface[*|id="' + surfaceId + '"]')
  const graphic = surface.querySelector('graphic[type="facsimile"]')

  const xywhParam = graphic.getAttribute('target').split('#xywh=')[1]

  if (!xywhParam) {
    console.error('Surface ' + surfaceId + ' has apparently no media fragment identifier for determining the size of the actual page in that scan. Unable to calculate a proper factor between pixel and mm dimensions.')
    return false
  }

  const pxOffsetX = parseFloat(xywhParam.split(',')[0])
  const pxOffsetY = parseFloat(xywhParam.split(',')[1])
  // const pageWidthPx = xywhParam.split(',')[2]
  // const pageHeightPx = xywhParam.split(',')[3]

  /* const folium = [...dom.querySelectorAll('foliaDesc *')].find(foliumLike => {
    if (foliumLike.getAttribute('outer.recto') === '#' + surfaceId) {
      return true
    }
    if (foliumLike.getAttribute('inner.verso') === '#' + surfaceId) {
      return true
    }
    if (foliumLike.getAttribute('inner.recto') === '#' + surfaceId) {
      return true
    }
    if (foliumLike.getAttribute('outer.verso') === '#' + surfaceId) {
      return true
    }
    if (foliumLike.getAttribute('recto') === '#' + surfaceId) {
      return true
    }
    if (foliumLike.getAttribute('verso') === '#' + surfaceId) {
      return true
    }
    return false
  })
  */

  // const pageWidthMm = folium.getAttribute('width')
  // const pageHeightMm = folium.getAttribute('height')

  // const scaleFactorHeight = pageHeightMm / pageHeightPx
  // const scaleFactorWidth = pageWidthMm / pageWidthPx

  const pageIndex = getters.currentPageZeroBased
  const path = getters.filepath
  const pages = getters.documentPagesForSidebars(path)
  const page = pages[pageIndex]

  if (!page) {
    return null
  }
  // console.log('page: ', page)
  const rects = getOsdRects(page)
  // console.log('rects: ', rects)

  const ratio = 1 / parseFloat(rects.ratio)

  /* // DEBUG
  console.log('pageHeightMm: ' + pageHeightMm)
  console.log('pageHeightPx: ' + pageHeightPx)
  console.log('pageWidthMm: ' + pageWidthMm)
  console.log('pageWidthPx: ' + pageWidthPx)
  console.log('pxOffsetX: ' + pxOffsetX)
  console.log('pxOffsetY: ' + pxOffsetY)
  console.log('scaleFactors width=' + scaleFactorWidth + ' | height=' + scaleFactorHeight)
  */

  if (dir === 'px2mm') {
    const rect = {}
    rect.x = parseFloat(((xywh.x - pxOffsetX) * ratio).toFixed(2))
    rect.y = parseFloat(((xywh.y - pxOffsetY) * ratio).toFixed(2))
    rect.w = parseFloat((xywh.w * ratio).toFixed(2))
    rect.h = parseFloat((xywh.h * ratio).toFixed(2))

    return rect
  } else {
    const rect = {}
    rect.x = Math.round((xywh.x / ratio) + pxOffsetX)
    rect.y = Math.round((xywh.y / ratio) + pxOffsetY)
    rect.w = Math.round(xywh.w / ratio)
    rect.h = Math.round(xywh.h / ratio)

    return rect
  }
}

/**
 * sorts the rastrum elements inside a given rastrumDesc
 * @param  {[type]} rastrumDesc               [description]
 * @return {[type]}             [description]
 */
export function sortRastrumsByVerticalPosition (rastrumDesc) {
  const rastrums = [...rastrumDesc.querySelectorAll('rastrum')]

  const sortFunc = (a, b) => {
    const aY = parseFloat(a.getAttribute('system.topmar'))
    const bY = parseFloat(b.getAttribute('system.topmar'))

    return aY - bY
  }

  const reordered = rastrums.sort(sortFunc)
  reordered.forEach(rastrum => rastrumDesc.append(rastrum))
}

/**
 * Translates draft elements to regular score elements.
 * Generates an array of MEI DOMs, each starting with <music>
 * @param  {[type]} meiDom               [description]
 * @return {[type]}        [description]
 */
export function draft2score (meiDom) {
  const arr = []
  meiDom.querySelectorAll('draft').forEach(draft => {
    console.warn('draft:', draft)
    const music = document.createElementNS('http://www.music-encoding.org/ns/mei', 'music')
    music.setAttribute('meiversion', MEIversion)
    const body = document.createElementNS('http://www.music-encoding.org/ns/mei', 'body')
    const mdiv = document.createElementNS('http://www.music-encoding.org/ns/mei', 'mdiv')
    const score = document.createElementNS('http://www.music-encoding.org/ns/mei', 'score')

    music.append(body)
    body.append(mdiv)
    mdiv.append(score)

    const childArr = [...draft.children]
    childArr.forEach(child => {
      score.append(child)
    })
    arr.push(music)
  })
  // console.log(arr)
  if (arr.length === 0) {
    console.warn('draft2score: try to add score elements ...')
    meiDom.querySelectorAll('score').forEach(score => {
      const music = document.createElementNS('http://www.music-encoding.org/ns/mei', 'music')
      music.setAttribute('meiversion', MEIversion)
      const body = document.createElementNS('http://www.music-encoding.org/ns/mei', 'body')
      const mdiv = document.createElementNS('http://www.music-encoding.org/ns/mei', 'mdiv')

      music.append(body)
      body.append(mdiv)
      mdiv.append(score.cloneNode(true))

      arr.push(music)
    })
  }
  if (arr.length === 0) {
    console.error('draft2score: no scores!')
  }
  return arr
}

/**
 * Translates diplomatic transcripts (draft elements) to page-based MEI.
 * @param {[type]} meiDom the MEI DOM of a diplomatic transcript to be converted to page-based MEI
 */
export function draft2page (meiDom) {
  return meiDom
}

/**
 * ATTENTION: This is superseded by prepareDtForRendering, as taken from Liquifier
 * @param {*} param0
 * @param {*} emptyPage
 * @param {*} osdRects
 * @param {*} currentPageInfo
 * @returns
 */
export async function getRenderableDiplomaticTranscript ({ wzDetails, dtDoc }, emptyPage, osdRects, currentPageInfo) {
  const requiredStaves = []

  if (!dtDoc) {
    console.log('no dtDoc')
    return null
  }

  /* console.warn('\n\n\n515----HELLO POLLY----')
  console.log(515, wzDetails)
  console.log(515, dtDoc)
  console.log(515, emptyPage)
  console.log(515, osdRects)
  console.log(515, currentPageInfo)
  console.warn('515-----done-----') */

  dtDoc.querySelectorAll('staffDef').forEach(staffDef => {
    requiredStaves.push(staffDef.getAttribute('label'))
  })

  const clonedPage = emptyPage.cloneNode(true)
  clonedPage.querySelectorAll('section > *').forEach(node => node.remove())
  clonedPage.querySelectorAll('surface > *').forEach(node => node.remove())
  // const clonedDt = dtDoc.cloneNode(true)

  const bbox = {}
  bbox.x = parseFloat(wzDetails.xywh.split(',')[0])
  bbox.y = parseFloat(wzDetails.xywh.split(',')[1])
  bbox.w = parseFloat(wzDetails.xywh.split(',')[2])
  bbox.h = parseFloat(wzDetails.xywh.split(',')[3])

  // const pagePixWidth = parseInt(currentPageInfo.width)
  // const pagePixHeight = parseInt(currentPageInfo.height)
  // const pageHeight = parseFloat(currentPageInfo.mmHeight)

  const margin = 10
  const pixMargin = osdRects.ratio * margin // 10mm margin

  const pixBox = {}
  pixBox.x = bbox.x - pixMargin
  pixBox.y = bbox.y - pixMargin
  pixBox.w = bbox.w + pixMargin * 3
  pixBox.h = bbox.h + pixMargin * 3

  const mmBox = {}
  mmBox.x = parseFloat((pixBox.x / osdRects.ratio + osdRects.image.x).toFixed(8))
  mmBox.y = parseFloat((pixBox.y / osdRects.ratio + osdRects.image.y).toFixed(8))
  mmBox.w = parseFloat((pixBox.w / osdRects.ratio + osdRects.image.x).toFixed(8))
  mmBox.h = parseFloat((pixBox.h / osdRects.ratio + osdRects.image.y).toFixed(8))

  // const factor = 9

  // const pageElem = clonedPage.querySelector('page')
  // pageElem.setAttribute('viewBox', pos1 + ' ' + pos2 + ' ' + pos3 + ' ' + pos4)

  const outSurface = clonedPage.querySelector('surface')
  const outStaffGrp = clonedPage.querySelector('staffGrp')
  const outSection = clonedPage.querySelector('section')

  // const defaultRastrumHeight = factor * 8 // 8vu = 72px

  // console.log('appendNewElement: ' + typeof appendNewElement)
  dtDoc.querySelectorAll('scoreDef staffDef').forEach(dtStaffDef => {
    /* const staffDef = */ outStaffGrp.appendChild(dtStaffDef.cloneNode(true))

    // TODO: add scaling
    /* const rastrumIDs = staffDef.getAttribute('decls').split(' ').map(ref => ref.split('#')[1])
    const rastrums = [...layout.querySelectorAll('rastrum')].filter(r => {
      return rastrumIDs.indexOf(r.getAttribute('xml:id')) !== -1
    })
    staffDef.setAttribute('scale', (100 / defaultRastrumHeight * parseFloat(rastrums[0].getAttribute('system.height')) * factor).toFixed(1) + '%')
    */
  })

  dtDoc.querySelectorAll('section > *').forEach(dtNode => {
    const node = outSection.appendChild(dtNode.cloneNode(true))
    const name = node.localName

    if (name === 'pb') {
      /* const pageZone = appendNewElement(outSurface, 'zone')
      pageZone.setAttribute('type', 'pb')
      pageZone.setAttribute('lrx', pos3)
      pageZone.setAttribute('lry', pos4)
      pageZone.setAttribute('ulx', 0)
      pageZone.setAttribute('uly', 0)
      node.setAttribute('facs', '#' + pageZone.getAttribute('xml:id')) */
      console.log('there should already be a pb in here: ', outSurface)
    } else if (name === 'sb') {
      // console.log('812', dtNode)
      /* const systemZone = appendNewElement(outSurface, 'zone')
      const rastrumIDs = node.getAttribute('corresp').split(' ').map(ref => ref.split('#')[1])
      const rastrums = [...layout.querySelectorAll('rastrum')].filter(r => {
        return rastrumIDs.indexOf(r.getAttribute('xml:id')) !== -1
      })
      let x = mmBox.w
      let y = mmBox.h
      let x2 = 0
      rastrums.forEach(rastrum => {
        const rx = parseFloat(rastrum.getAttribute('system.leftmar'))
        const ry = parseFloat(rastrum.getAttribute('system.topmar'))
        const rw = parseFloat(rastrum.getAttribute('width')) + rx
        x = Math.min(rx, x)
        y = Math.min(ry, y)
        x2 = Math.max(rw, x2)
      })

      systemZone.setAttribute('type', 'sb')
      systemZone.setAttribute('ulx', (x * factor).toFixed(1))
      systemZone.setAttribute('bw.lrx', (x2 * factor).toFixed(1))
      systemZone.setAttribute('bw.rastrumIDs', rastrumIDs.join(' '))
      systemZone.setAttribute('uly', (y * factor).toFixed(1)) // todo: how to determine sb/@uly properly? This is not the same as staff/@uly!!!!
      node.setAttribute('facs', '#' + systemZone.getAttribute('xml:id')) */
    } else if (name === 'measure') {
      /* const measureZone = appendNewElement(outSurface, 'zone')
      measureZone.setAttribute('type', 'measure')

      let measureX = mmBox.w * factor
      let measureX2 = 0
      node.querySelectorAll('*').forEach(child => {
        if (child.hasAttribute('x')) {
          const x = parseFloat(child.getAttribute('x')) * factor
          measureX = Math.min(measureX, x)
          measureX2 = Math.max(measureX2, x)
        }
        if (child.hasAttribute('x2')) {
          const x = parseFloat(child.getAttribute('x2')) * factor
          measureX2 = Math.max(measureX2, x)
        }

        const childName = child.localName
        const supportedElements = ['note', 'staff', 'accid']
        const ignoreElements = ['layer']

        if (supportedElements.indexOf(childName) !== -1) {
          const childZone = appendNewElement(outSurface, 'zone')
          childZone.setAttribute('type', childName)

          if (childName === 'note' || childName === 'accid') {
            childZone.setAttribute('ulx', (parseFloat(child.getAttribute('x')) * factor).toFixed(1))
          } else if (childName === 'staff') {
            const staffN = parseInt(child.getAttribute('n'))
            const getSbZone = (node) => {
              let sibling = node
              while (sibling) {
                if (sibling.hasAttribute('type') && sibling.getAttribute('type') === 'sb') { //sibling.matches('[type="sb"]')) {
                  return sibling // Found the matching sibling
                }
                sibling = sibling.previousElementSibling // Move to the next preceding sibling
              }
              return null
            }
            /* const getSbZone = (node) => {
                      console.log('examining sibling: ', node)
                      // Base case: if the node is null, return null
                      if (!node) {
                          console.warn('no more preceding siblings')
                          return null
                      }
                      const serializer = new dom.window.XMLSerializer()
                      const serializedString = serializer.serializeToString(node)
                      console.log(serializedString.substring(0, 130))
                      // Check if the current node matches the condition
                      try {
                          if (node.hasAttribute('type') && node.getAttribute('type') === 'sb') {
                              console.warn('found sb')
                              return node // Found the matching sibling
                          } else {
                              console.warn('no sb')
                          }
                      } catch(err) {
                          console.trace('error in getSbZone: ', err)
                          return false
                      }

                      // Recursive step: move to the previous sibling
                      return getSbZone(node.previousElementSibling)
                  } * /
            const sbZone = getSbZone(childZone)
            const rastrumID = sbZone.getAttribute('bw.rastrumIDs').split(' ')[staffN - 1]
            const rastrum = layout.querySelector('rastrum[xml\\:id="' + rastrumID + '"]')
            const staffY = parseFloat(rastrum.getAttribute('system.topmar')) * factor
            childZone.setAttribute('uly', staffY.toFixed(1))
            * /
          }

          child.setAttribute('facs', '#' + childZone.getAttribute('xml:id'))
        } else if (ignoreElements.indexOf(childName) === -1) {
          console.warn('Unsupported element in diplomatic transcription: ' + childName)
          // todo: autogenerate an issue for unsupported elements?! If so, leave a stack trace of the file in which they occur?
        }
      })

      /* TODO: make this work again
      const sbZone = measureZone.previousElementSibling
      const sbX = parseFloat(sbZone.getAttribute('ulx'))
      const sbX2 = parseFloat(sbZone.getAttribute('bw.lrx'))

      measureX = Math.max(measureX - 10 * factor, sbX) // give 1cm margin, if possible
      measureX2 = Math.min(measureX2 + 10 * factor, sbX2) // give 1cm margin, if possible

      measureZone.setAttribute('ulx', measureX.toFixed(1))
      measureZone.setAttribute('lrx', measureX2.toFixed(1))
      * /
      node.setAttribute('facs', '#' + measureZone.getAttribute('xml:id')) */
    }
    // outDom.querySelector('section').appendChild(node)
  })

  // console.log('846: diplomatic transcript for fragment', clonedPage)

  // temporaryVerovio3to4(clonedPage)

  return clonedPage
}

export const appendNewElement = (parent, name, ns = 'http://www.music-encoding.org/ns/mei') => {
  const elem = parent.appendChild(document.createElementNS(ns, name))
  if (ns === 'http://www.w3.org/2000/svg') {
    elem.setAttribute('id', 's' + uuid())
  } else {
    elem.setAttribute('xml:id', 'x' + uuid())
  }
  return elem
}

/* function temporaryVerovio3to4 (dom) {
  const appendNewElement = (parent, name, ns = 'http://www.music-encoding.org/ns/mei') => {
    const elem = parent.appendChild(document.createElementNS(ns, name))
    if (ns === 'http://www.w3.org/2000/svg') {
      elem.setAttribute('id', 's' + uuid())
    } else {
      elem.setAttribute('xml:id', 'x' + uuid())
    }
    return elem
  }

  const factor = 9
  const pageWidth = parseFloat(dom.querySelector('page').getAttribute('page.width'))
  const pageHeight = parseFloat(dom.querySelector('page').getAttribute('page.height'))

  const music = dom.querySelector('music')
  const facsimile = appendNewElement(music, 'facsimile')
  facsimile.setAttribute('type', 'transcription')
  music.prepend(facsimile)
  const surface = appendNewElement(facsimile, 'surface')
  surface.setAttribute('lrx', pageWidth * factor)
  surface.setAttribute('lry', pageHeight * factor)

  music.querySelectorAll('section > *').forEach(node => {
    const name = node.localName

    if (name === 'pb') {
      const pageZone = appendNewElement(outSurface, 'zone')
      pageZone.setAttribute('type', 'pb')
      pageZone.setAttribute('lrx', (pageMM.w * factor).toFixed(1))
      pageZone.setAttribute('lry', (pageMM.h * factor).toFixed(1))
      pageZone.setAttribute('ulx', 0)
      pageZone.setAttribute('uly', 0)
      node.setAttribute('facs', '#' + pageZone.getAttribute('xml:id'))
    } else if (name === 'sb') {
      const systemZone = appendNewElement(outSurface, 'zone')
      const rastrumIDs = node.getAttribute('corresp').split(' ').map(ref => ref.split('#')[1])
      const rastrums = [...layout.querySelectorAll('rastrum')].filter(r => {
        return rastrumIDs.indexOf(r.getAttribute('xml:id')) !== -1
      })
      let x = pageMM.w
      let y = pageMM.h
      let x2 = 0
      rastrums.forEach(rastrum => {
        const rx = parseFloat(rastrum.getAttribute('system.leftmar'))
        const ry = parseFloat(rastrum.getAttribute('system.topmar'))
        const rw = parseFloat(rastrum.getAttribute('width')) + rx
        x = Math.min(rx, x)
        y = Math.min(ry, y)
        x2 = Math.max(rw, x2)
      })

      systemZone.setAttribute('type', 'sb')
      systemZone.setAttribute('ulx', (x * factor).toFixed(1))
      systemZone.setAttribute('bw.lrx', (x2 * factor).toFixed(1))
      systemZone.setAttribute('bw.rastrumIDs', rastrumIDs.join(' '))
      systemZone.setAttribute('uly', (y * factor).toFixed(1)) // todo: how to determine sb/@uly properly? This is not the same as staff/@uly!!!!
      node.setAttribute('facs', '#' + systemZone.getAttribute('xml:id'))
    } else if (name === 'measure') {
      const measureZone = appendNewElement(outSurface, 'zone')
      measureZone.setAttribute('type', 'measure')

      let measureX = pageMM.w * factor
      let measureX2 = 0
      const content = node.querySelectorAll('*').forEach(child => {
        if (child.hasAttribute('x')) {
          const x = parseFloat(child.getAttribute('x')) * factor
          measureX = Math.min(measureX, x)
          measureX2 = Math.max(measureX2, x)
        }
        if (child.hasAttribute('x2')) {
          const x = parseFloat(child.getAttribute('x2')) * factor
          measureX2 = Math.max(measureX2, x)
        }

        const childName = child.localName
        const supportedElements = ['note', 'staff', 'accid']
        const ignoreElements = ['layer']

        if (supportedElements.indexOf(childName) !== -1) {
          const childZone = appendNewElement(outSurface, 'zone')
          childZone.setAttribute('type', childName)

          if (childName === 'note' || childName === 'accid') {
            childZone.setAttribute('ulx', (parseFloat(child.getAttribute('x')) * factor).toFixed(1))
          } else if (childName === 'staff') {
            const staffN = parseInt(child.getAttribute('n'))
            const getSbZone = (node) => {
              let sibling = node
              while (sibling) {
                if (sibling.hasAttribute('type') && sibling.getAttribute('type') === 'sb') { //sibling.matches('[type="sb"]')) {
                  return sibling // Found the matching sibling
                }
                sibling = sibling.previousElementSibling // Move to the next preceding sibling
              }
              return null
            }
            / * const getSbZone = (node) => {
                      console.log('examining sibling: ', node)
                      // Base case: if the node is null, return null
                      if (!node) {
                          console.warn('no more preceding siblings')
                          return null
                      }
                      const serializer = new dom.window.XMLSerializer()
                      const serializedString = serializer.serializeToString(node)
                      console.log(serializedString.substring(0, 130))
                      // Check if the current node matches the condition
                      try {
                          if (node.hasAttribute('type') && node.getAttribute('type') === 'sb') {
                              console.warn('found sb')
                              return node // Found the matching sibling
                          } else {
                              console.warn('no sb')
                          }
                      } catch(err) {
                          console.trace('error in getSbZone: ', err)
                          return false
                      }

                      // Recursive step: move to the previous sibling
                      return getSbZone(node.previousElementSibling)
                  } * /
            const sbZone = getSbZone(childZone)
            const rastrumID = sbZone.getAttribute('bw.rastrumIDs').split(' ')[staffN - 1]
            const rastrum = layout.querySelector('rastrum[xml\\:id="' + rastrumID + '"]')
            const staffY = parseFloat(rastrum.getAttribute('system.topmar')) * factor
            childZone.setAttribute('uly', staffY.toFixed(1))
          }

          child.setAttribute('facs', '#' + childZone.getAttribute('xml:id'))
        } else if (ignoreElements.indexOf(childName) === -1) {
          console.warn('Unsupported element in diplomatic transcription: ' + childName)
          // todo: autogenerate an issue for unsupported elements?! If so, leave a stack trace of the file in which they occur?
        }
      })
      node.setAttribute('facs', '#' + measureZone.getAttribute('xml:id'))
    }
  })
} */

/**
 * Converts a diplomatic transcription into a renderable MEI, using Verovio v4's facsimile-based approach
 * @param {*} node
 * @returns
 */
export const prepareDtForRendering = ({ dtDom, sourceDom }) => {
  if (!dtDom || !sourceDom) {
    console.warn('714: prepareDtForRendering: missing input')
    return null
  }

  // TODO: verify the inputs are proper XML documents
  const outDom = new DOMParser().parseFromString('<music xmlns="http://www.music-encoding.org/ns/mei"><facsimile type="transcription"><surface/></facsimile><body><mdiv><score><scoreDef><staffGrp/></scoreDef><section></section></score></mdiv></body></music>', 'text/xml')

  try {
    const writingZoneGenDescId = dtDom.querySelector('source').getAttribute('target').split('#')[1]
    const writingZoneGenDesc = sourceDom.querySelector('genDesc[*|id="' + writingZoneGenDescId + '"]')
    const surfaceGenDesc = writingZoneGenDesc.parentNode
    const surface = sourceDom.querySelector('surface[*|id="' + surfaceGenDesc.getAttribute('corresp').substring(1) + '"]')
    // const writingZoneZone = surface.querySelectorAll('zone').values().find(z => writingZoneGenDesc.getAttribute('xml:id') === z.getAttribute('data').substring(1))

    const layout = sourceDom.querySelector('layout[*|id="' + surface.getAttribute('decls').substring(1) + '"]')
    const foliumLike = sourceDom.querySelectorAll('foliaDesc *').values().find(f => {
      const ref = '#' + surface.getAttribute('xml:id')
      return f.getAttribute('recto') === ref || f.getAttribute('verso') === ref || f.getAttribute('outer.recto') === ref || f.getAttribute('inner.verso') === ref || f.getAttribute('inner.recto') === ref || f.getAttribute('outer.verso') === ref
    })
    if (!foliumLike) {
      console.error(`969: no folium found for surface ${surface.getAttribute('xml:id')}`)
      return null
    }

    const pageMM = {
      x: 0,
      y: 0,
      w: parseFloat(foliumLike.getAttribute('width')),
      h: parseFloat(foliumLike.getAttribute('height'))
    }

    // Verovio uses a default of 9px per vu. This is used as factor for Verovio coordinate space
    const factor = 9

    const outSurface = outDom.querySelector('surface')
    outSurface.setAttribute('lrx', pageMM.w * factor)
    outSurface.setAttribute('lry', pageMM.h * factor)

    const outStaffGrp = outDom.querySelector('staffGrp')
    const outSection = outDom.querySelector('section')

    const defaultRastrumHeight = factor * 8 // 8vu = 72px

    dtDom.querySelectorAll('scoreDef staffDef').forEach((dtStaffDef, i) => {
      const staffDef = outStaffGrp.appendChild(dtStaffDef.cloneNode(true))

      const rastrumIDs = staffDef.getAttribute('decls').split(' ').map(ref => ref.split('#')[1])
      const rastrums = [...layout.querySelectorAll('rastrum')].filter(r => {
        return rastrumIDs.indexOf(r.getAttribute('xml:id')) !== -1
      })
      staffDef.setAttribute('scale', (100 / defaultRastrumHeight * parseFloat(rastrums[0].getAttribute('system.height')) * factor).toFixed(1) + '%')
      const staff = dtDom.querySelectorAll('staff')[i]
      staff.setAttribute('rotate', rastrums[0].getAttribute('rotate'))
      staff.setAttribute('decls', staffDef.getAttribute('decls'))
    })

    dtDom.querySelectorAll('draft > *').forEach(dtNode => {
      const node = dtNode.cloneNode(true)
      const name = node.localName

      if (name === 'pb') {
        outSection.appendChild(node)
        const pageZone = appendNewElement(outSurface, 'zone')
        pageZone.setAttribute('type', 'pb')
        pageZone.setAttribute('lrx', (pageMM.w * factor).toFixed(1))
        pageZone.setAttribute('lry', (pageMM.h * factor).toFixed(1))
        pageZone.setAttribute('ulx', 0)
        pageZone.setAttribute('uly', 0)
        node.setAttribute('facs', '#' + pageZone.getAttribute('xml:id'))
      } else if (name === 'system') {
        const sb = appendNewElement(outSection, 'sb')

        const systemZone = appendNewElement(outSurface, 'zone')
        const rastrumIDs = [...node.querySelectorAll('staffDef')].map(staffDef => staffDef.getAttribute('decls').split('#')[1])
        // console.log(714, 'rastrumIDs:', rastrumIDs)
        const rastrums = [...layout.querySelectorAll('rastrum')].filter(r => {
          return rastrumIDs.indexOf(r.getAttribute('xml:id')) !== -1
        })
        // console.log(714, 'passed rastrums', rastrums)
        let x1 = pageMM.w
        let y = pageMM.h
        let x2 = 0
        rastrums.forEach(rastrum => {
          const rx = parseFloat(rastrum.getAttribute('system.leftmar'))
          const ry = parseFloat(rastrum.getAttribute('system.topmar'))
          const rw = parseFloat(rastrum.getAttribute('width')) + rx
          x1 = Math.min(rx, x1)
          y = Math.min(ry, y)
          x2 = Math.max(rw, x2)
        })

        systemZone.setAttribute('type', 'sb')
        systemZone.setAttribute('ulx', (x1 * factor).toFixed(1))
        systemZone.setAttribute('bw.lrx', (x2 * factor).toFixed(1))
        systemZone.setAttribute('bw.rastrumIDs', rastrumIDs.join(' '))
        systemZone.setAttribute('uly', (y * factor).toFixed(1)) // todo: how to determine sb/@uly properly? This is not the same as staff/@uly!!!!
        sb.setAttribute('facs', '#' + systemZone.getAttribute('xml:id'))

        const measure = appendNewElement(outSection, 'measure')

        const measureZone = appendNewElement(outSurface, 'zone')
        measureZone.setAttribute('type', 'measure')
        measure.setAttribute('facs', '#' + measureZone.getAttribute('xml:id'))

        let measureX = pageMM.w * factor
        let measureX2 = 0
        // console.log(714, 'getting in')
        node.querySelectorAll('staff').forEach(staff => {
          // console.log(714, 'staff:', staff)
          const outStaff = measure.appendChild(staff.cloneNode(true))

          const staffN = parseInt(staff.getAttribute('n'))
          const scoreDef = staff.closest('system').querySelector('scoreDef')
          // console.log(714, 'scoreDef:', scoreDef)
          const rastrumID = scoreDef.querySelector('staffDef[n="' + staffN + '"]').getAttribute('decls').split('#')[1]
          const rastrum = layout.querySelector('rastrum[*|id="' + rastrumID + '"]')
          // TODO: if rastrum is null/undefined set to 0 ???
          const staffY = rastrum ? parseFloat(rastrum.getAttribute('system.topmar')) * factor : 0

          const staffZone = appendNewElement(outSurface, 'zone')
          staffZone.setAttribute('type', 'staff')
          staffZone.setAttribute('uly', staffY.toFixed(1))

          outStaff.setAttribute('facs', '#' + staffZone.getAttribute('xml:id'))

          // enter data that will allow rotation around the correct pivot in SVG
          const pivot = (measureX - parseFloat(rastrum.getAttribute('system.leftmar'))) * factor * 10
          staff.setAttribute('pivot', pivot)
        })

        // handle events
        // TODO: fix multiple sections (=accolades)
        measure.querySelectorAll('staff *').forEach(child => {
          if (child.hasAttribute('x')) {
            const testX = parseFloat(child.getAttribute('x')) * factor
            measureX = Math.min(measureX, testX)
            measureX2 = Math.max(measureX2, testX)
          }
          if (child.hasAttribute('x2')) {
            const testX = parseFloat(child.getAttribute('x2')) * factor
            measureX2 = Math.max(measureX2, testX)
          }

          const childName = child.localName
          const supportedElements = ['note', 'staff', 'accid', 'barLine', 'chord', 'rest', 'dot', 'dynam']
          const ignoreElements = ['layer']

          if (supportedElements.indexOf(childName) !== -1) {
            const childZone = appendNewElement(outSurface, 'zone')
            childZone.setAttribute('type', childName)

            const getSbZone = (node) => {
              let sibling = node
              while (sibling) {
                if (sibling.hasAttribute('type') && sibling.getAttribute('type') === 'sb') {
                  return sibling // Found the matching sibling
                }
                sibling = sibling.previousElementSibling // Move to the next preceding sibling
              }
              return null
            }
            const sbZone = getSbZone(childZone)

            if (childName === 'note' || childName === 'accid' || childName === 'barLineX' || childName === 'chord' || childName === 'rest' || childName === 'dot') {
              const ownX = child.hasAttribute('x') ? parseFloat(child.getAttribute('x')) * factor : parseFloat(child.parentNode.getAttribute('x')) * factor
              const fixOwnX = childName === 'barLine' ? ownX * 2 : ownX
              const systemX = parseFloat(sbZone.getAttribute('ulx'))
              childZone.setAttribute('ulx', (fixOwnX + systemX).toFixed(1))

              // TODO accids should use @loc
              if (childName === 'accid') {
                childZone.setAttribute('uly', 1415)
              }
            }

            if (childName === 'rest') {
              const glyphName = child.getAttribute('glyph.name')
              let dur = null
              if (glyphName === 'restWhole') {
                dur = '1'
              } else if (glyphName === 'restHalf') {
                dur = '2'
              } else if (glyphName === 'restQuarter') {
                dur = '4'
              } else if (glyphName === 'rest8th') {
                dur = '8'
              } else if (glyphName === 'rest16th') {
                dur = '16'
              } else if (glyphName === 'rest32nd') {
                dur = '32'
              } else if (glyphName === 'rest64th') {
                dur = '64'
              }
              child.setAttribute('dur', dur)
            }

            if (childName === 'chord') {
              if (!child.hasAttribute('dur')) {
                // TODO takes first duration it finds!
                const dur = child.querySelector('[dur]')?.getAttribute('dur')
                if (dur) {
                  child.setAttribute('dur', dur)
                }
              }
            }

            // console.log(714, ' setting facs of ' + childName + '#' + child.getAttribute('xml:id') + ' to #' + childZone.getAttribute('xml:id'))
            child.setAttribute('facs', '#' + childZone.getAttribute('xml:id'))
          } else if (ignoreElements.indexOf(childName) === -1) {
            console.warn('Unsupported element in diplomatic transcription: ' + childName)
            // todo: autogenerate an issue for unsupported elements?! If so, leave a stack trace of the file in which they occur?
          }
        })

        // handle controlevents
        const controlEvents = node.querySelectorAll('section > *:not(staff)')
        controlEvents.forEach(controlEvent => {
          const ctrlevt = controlEvent.cloneNode(true)
          // console.log('Control Event', ctrlevt.localName)
          if (ctrlevt.localName === 'beamSpan') {
            const facs = ctrlevt.getAttribute('facs').split([' '])
            let bbox = null
            const setBBox = (_bbox) => {
              if (bbox) {
                bbox.x = Math.min(bbox.x, _bbox.x)
                bbox.y = Math.min(bbox.y, _bbox.y)
                bbox.width = Math.max(bbox.width, _bbox.width)
                bbox.height = Math.max(bbox.height, _bbox.height)
              } else {
                bbox = _bbox
              }
            }
            facs.forEach(f => {
              const shapeid = f.split('#')[1]
              // console.log(shapeid)
              const shape = document.querySelector(`[*|id="${shapeid}"]`)
              // console.log(shape)
              if (shape) {
                setBBox(shape.getBBox())
              }
            })
            // console.log(bbox)
            if (bbox) {
              const ctrlZone = appendNewElement(outSurface, 'zone')
              ctrlZone.setAttribute('type', 'beamSpan')
              ctrlZone.setAttribute('ulx', (bbox.x / factor).toFixed(1))
              ctrlZone.setAttribute('uly', (bbox.y / factor).toFixed(1))
              ctrlZone.setAttribute('lrx', ((bbox.x + bbox.width) / factor).toFixed(1))
              ctrlZone.setAttribute('lry', ((bbox.y + bbox.height) / factor).toFixed(1))
              ctrlevt.setAttribute('facs', '#' + ctrlZone.getAttribute('xml:id'))
            } else {
              ctrlevt.removeAttribute('facs')
              // console.warn('element has no bbox ...')
            }
            // console.log(ctrlevt)
          }
          if (ctrlevt.localName === 'curve') {
            // console.log(668, 'curve control event', ctrlevt)
            /* const facs = ctrlevt.getAttribute('facs').split([' '])
            let bbox = null
            const setBBox = (_bbox) => {
              if (bbox) {
                bbox.x = Math.min(bbox.x, _bbox.x)
                bbox.y = Math.min(bbox.y, _bbox.y)
                bbox.width = Math.max(bbox.width, _bbox.width)
                bbox.height = Math.max(bbox.height, _bbox.height)
              } else {
                bbox = _bbox
              }
            }
            facs.forEach(f => {
              const shapeid = f.split('#')[1]
              // console.log(shapeid)
              const shape = document.querySelector(`[*|id="${shapeid}"]`)
              // console.log(shape)
              if (shape) {
                setBBox(shape.getBBox())
              }
            })
            // console.log(bbox)
            if (bbox) {
              const ctrlZone = appendNewElement(outSurface, 'zone')
              ctrlZone.setAttribute('type', 'curve')
              ctrlZone.setAttribute('ulx', (bbox.x / factor).toFixed(1))
              ctrlZone.setAttribute('uly', (bbox.y / factor).toFixed(1))
              ctrlZone.setAttribute('lrx', ((bbox.x + bbox.width) / factor).toFixed(1))
              ctrlZone.setAttribute('lry', ((bbox.y + bbox.height) / factor).toFixed(1))
              ctrlevt.setAttribute('facs', '#' + ctrlZone.getAttribute('xml:id'))
            } else {
              ctrlevt.removeAttribute('facs')
              // console.warn('element has no bbox ...')
            }
            // console.log(ctrlevt)
            */
          }
          measure.appendChild(ctrlevt)
        })

        // TODO: this is not correct, as it takes the leftmost rastrum, not the current one
        let x = pageMM.w * factor
        layout.querySelectorAll('rastrum').forEach(rastrum => {
          const rx = parseFloat(rastrum.getAttribute('system.leftmar')) * factor
          x = Math.min(rx, x)
        })
        const ulx = measureX + x
        const lrx = measureX2 + x
        measureZone.setAttribute('ulx', ulx.toFixed(1))
        measureZone.setAttribute('lrx', lrx.toFixed(1))
        /* TODO: make this work again
        const sbZone = measureZone.previousElementSibling
        const sbX = parseFloat(sbZone.getAttribute('ulx'))
        const sbX2 = parseFloat(sbZone.getAttribute('bw.lrx'))

        measureX = Math.max(measureX - 10 * factor, sbX) // give 1cm margin, if possible
        measureX2 = Math.min(measureX2 + 10 * factor, sbX2) // give 1cm margin, if possible

        */
        node.setAttribute('facs', '#' + measureZone.getAttribute('xml:id'))
      } else if (name === 'del') {
        console.log(573, 'del node', node)
        outSection.appendChild(node)
      }

      // outDom.querySelector('section').appendChild(node)
    })
  } catch (err) {
    // console.error('714: Error in prepareDtForRendering: ' + err, err)
  }
  // console.log('714 outDom: ', outDom)
  return outDom
}

/**
 * adds indicators for system begins to the MEI, using dir elements
 * @param {*} meiDom
 */
export const addSbIndicators = (meiDom) => {
  const sbs = meiDom.querySelectorAll('sb')

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

  return meiDom
}

/* export const appendNewElement = (parent, name, ns = 'http://www.music-encoding.org/ns/mei') => {
  const elem = parent.appendChild(document.createElementNS(ns, name))
  if (ns === 'http://www.w3.org/2000/svg') {
    elem.setAttribute('id', 's' + uuid())
  } else {
    elem.setAttribute('xml:id', 'x' + uuid())
  }
  return elem
} */

/*
function convertDiploTransEvent (event) {
  const name = event.localName

  if (name === 'note') {
    getRenderableDiplomaticNote(event)
  }

  return event
}
*/
/**
 * converts a diplomatic note to something renderable
 * @param {*} note the diplomatic note to be translated
 */
/*
function getRenderableDiplomaticNote (note) {
  const headshape = note.getAttribute('head.shape')
  let dur = 4
  if (headshape === 'whole') {
    dur = 1
  } else if (headshape === 'half') {
    dur = 2
  }

  // TODO DIPLOTRANS: Wie mit kürzeren Notenwerten umgehen? überhaupt wichtig?
  note.setAttribute('dur', dur)
}
*/
