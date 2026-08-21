/**
 * Prepares animations for <dir> elements (directions) between DT and AT transcripts.
 * Handles multi-line text and multiple DT correspondences.
 * @param {SVGSVGElement} ftSvg - The fluid transcript SVG
 * @param {SVGSVGElement} dtSvg - The diplomatic transcript SVG
 * @param {Document} atMeiDom - The annotated transcript MEI DOM
 * @param {object} tools - Object containing getNewPos, correspMappings, setAnimation, logger functions
 */
export function liquifyDirs (ftSvg, dtSvg, atMeiDom, tools) {
  const { getNewPos, correspMappings, setAnimation, logger } = tools

  // Find all AT <dir> elements
  const atDirs = atMeiDom.querySelectorAll('dir')
  logger.debug('[liquifyDirs] Found ' + atDirs.length + ' <dir> elements in AT')

  atDirs.forEach((atDir) => {
    const atId = atDir.getAttribute('xml:id')
    if (!atId) {
      logger.warn('[liquifyDirs] AT dir without xml:id, skipping')
      return
    }

    logger.debug(`[liquifyDirs] Processing AT dir ${atId}`)

    // Get corresponding DT dir IDs (may be multiple, order matters)
    const dtIds = correspMappings.get(atId)

    if (!dtIds || dtIds.length === 0) {
      logger.debug(`[liquifyDirs] AT dir ${atId} has no DT correspondence (editorial), fade in from supplements`)
      // TODO: Handle editorial dirs (fade in from supplements)
      return
    }

    // Find AT dir group in ftSvg
    const atDirGroup = ftSvg.querySelector(`g[data-id="x${atId}"][data-class="dir"]`)
    if (!atDirGroup) {
      logger.warn(`[liquifyDirs] Could not find AT dir group x${atId} in FT SVG`)
      return
    }

    // Find AT text element
    const atTextElement = atDirGroup.querySelector('text')
    if (!atTextElement) {
      logger.warn(`[liquifyDirs] Could not find text element in AT dir x${atId}`)
      return
    }

    // Extract AT text lines
    const atLines = extractAtTextLines(atTextElement)
    logger.debug(`[liquifyDirs] AT dir ${atId} has ${atLines.length} line(s)`)

    // Find all DT dir groups and extract text lines
    const dtDirData = []
    for (const dtId of dtIds) {
      const dtDirGroup = dtSvg.querySelector(`g[data-id="${dtId}"][data-class="dir"]`)
      if (!dtDirGroup) {
        logger.warn(`[liquifyDirs] Could not find DT dir ${dtId} in DT SVG`)
        continue
      }

      const dtTextElement = dtDirGroup.querySelector('text')
      if (!dtTextElement) {
        logger.warn(`[liquifyDirs] Could not find text element in DT dir ${dtId}`)
        continue
      }

      const dtLines = extractDtTextLines(dtTextElement)
      dtDirData.push({
        id: dtId,
        group: dtDirGroup,
        textElement: dtTextElement,
        lines: dtLines
      })
    }

    if (dtDirData.length === 0) {
      logger.warn(`[liquifyDirs] No valid DT dirs found for AT dir ${atId}`)
      return
    }

    logger.debug(`[liquifyDirs] Found ${dtDirData.length} DT dir(s) for AT dir ${atId}`)

    // Flatten all DT lines into a single array
    const allDtLines = []
    dtDirData.forEach(dtData => {
      dtData.lines.forEach(line => {
        allDtLines.push({
          text: line.text,
          x: line.x,
          y: line.y,
          dtId: dtData.id
        })
      })
    })

    logger.debug(`[liquifyDirs] Total DT lines: ${allDtLines.length}, AT lines: ${atLines.length}`)

    // TODO: Implement line alignment and text diff
    // For now, just log the structure
    logger.debug('[liquifyDirs] AT lines:', atLines.map(l => `"${l.text}" at (${l.x},${l.y})`).join(', '))
    logger.debug('[liquifyDirs] DT lines:', allDtLines.map(l => `"${l.text}" at (${l.x},${l.y})`).join(', '))
  })
}

/**
 * Extract text lines from AT text element.
 * AT structure: <text><tspan data-class="text">...</tspan><tspan data-class="lb"/><tspan data-class="text">...</tspan></text>
 * @param {SVGTextElement} textElement - The AT text element
 * @returns {Array<{text: string, x: number, y: number}>} Array of line objects
 */
function extractAtTextLines (textElement) {
  const lines = []
  const tspans = textElement.querySelectorAll('tspan[data-class="text"]')

  tspans.forEach(tspan => {
    // Get the nested tspan with actual text
    const textTspan = tspan.querySelector('tspan')
    const text = textTspan ? textTspan.textContent.trim() : tspan.textContent.trim()

    // Get position from this tspan or parent text element
    const x = parseFloat(tspan.getAttribute('x') || textElement.getAttribute('x') || '0')
    const y = parseFloat(tspan.getAttribute('y') || textElement.getAttribute('y') || '0')

    lines.push({ text, x, y })
  })

  return lines
}

/**
 * Extract text lines from DT text element.
 * DT structure: <text><tspan>...</tspan><tspan x="..." dy="...">...</tspan></text>
 * @param {SVGTextElement} textElement - The DT text element
 * @returns {Array<{text: string, x: number, y: number}>} Array of line objects
 */
function extractDtTextLines (textElement) {
  const lines = []
  const tspans = Array.from(textElement.querySelectorAll('tspan'))

  let currentY = parseFloat(textElement.getAttribute('y') || '0')
  const baseX = parseFloat(textElement.getAttribute('x') || '0')

  tspans.forEach(tspan => {
    const text = tspan.textContent.trim()
    const x = parseFloat(tspan.getAttribute('x') || baseX)
    const dy = parseFloat(tspan.getAttribute('dy') || '0')

    currentY += dy
    lines.push({ text, x, y: currentY })
  })

  return lines
}
