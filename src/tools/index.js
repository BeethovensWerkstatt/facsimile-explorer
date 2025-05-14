export const flattenarray = (arr) => {
  return arr.reduce((acc, val) => {
    if (Array.isArray(val)) {
      acc.push(...flattenarray(val))
    } else {
      acc.push(val)
    }
    return acc
  }, [])
}
