/**
 * determines the center of a rendered system
 * @param {} system
 */
export const getSystemCenter = (system) => {
  const measures = system.querySelectorAll('.measure:not(.bounding-box)')

  const firstMeasure = measures[0]
  const lastMeasure = measures[measures.length - 1]

  const firstStaffLine = firstMeasure.querySelector('.staff:not(.bounding-box) > path')
  const lastStaffLine = lastMeasure.querySelectorAll('.staff:not(.bounding-box) > path')[4]

  const parseDAttribute = (d) => {
    const commands = d.match(/[a-zA-Z][^a-zA-Z]*/g)
    return commands.map(command => {
      const type = command[0]
      const coords = command.slice(1).trim().split(/[\s,]+/).map(Number)
      return { type, coords }
    })
  }
  const firstPathData = parseDAttribute(firstStaffLine.getAttribute('d'))
  const lastPathData = parseDAttribute(lastStaffLine.getAttribute('d'))

  const firstStart = firstPathData[0].coords
  const firstEnd = firstPathData[firstPathData.length - 1].coords
  const lastStart = lastPathData[0].coords
  const lastEnd = lastPathData[lastPathData.length - 1].coords

  const allX = [firstStart[0], firstEnd[0], lastStart[0], lastEnd[0]]
  const allY = [firstStart[1], firstEnd[1], lastStart[1], lastEnd[1]]

  const topLeftX = Math.min(...allX)
  const topLeftY = Math.min(...allY)
  const bottomRightX = Math.max(...allX)
  const bottomRightY = Math.max(...allY)

  const centerX = (topLeftX + bottomRightX) / 2
  const centerY = (topLeftY + bottomRightY) / 2

  return { x: centerX, y: centerY }
}
