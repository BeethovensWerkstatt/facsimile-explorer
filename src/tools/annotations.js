/**
 * Helpers for annotation files, which live in their own folder of the data repository (e.g. data/annots/NK/)
 * and link to annotated or diplomatic transcripts with relative paths in @plist.
 */

/**
 * resolves a path relative to a file in the repository
 * @param {string} fromFile repository path of the file containing the relative path
 * @param {string} relative the relative path
 * @returns {string} the repository path
 */
export const resolvePath = (fromFile, relative) => {
  const parts = fromFile.split('/').slice(0, -1)
  relative.split('/').forEach(segment => {
    if (segment === '..') {
      parts.pop()
    } else if (segment !== '.' && segment !== '') {
      parts.push(segment)
    }
  })
  return parts.join('/')
}

/**
 * creates the path of a repository file relative to another file
 * @param {string} fromFile repository path of the file that will contain the relative path
 * @param {string} toFile repository path of the target
 * @returns {string} the relative path
 */
export const relativePath = (fromFile, toFile) => {
  const from = fromFile.split('/').slice(0, -1)
  const to = toFile.split('/')
  let common = 0
  while (common < from.length && common < to.length - 1 && from[common] === to[common]) {
    common++
  }
  return [...Array(from.length - common).fill('..'), ...to.slice(common)].join('/')
}

/**
 * resolves all entries of an annotation's @plist to repository paths
 * @param {string} annotPath repository path of the annotation file
 * @param {string} plist the value of @plist, a white-space separated list of relative paths
 * @returns {string[]} the repository paths
 */
export const plistTargets = (annotPath, plist) => {
  return plist.trim().split(/\s+/).filter(ref => ref).map(ref => resolvePath(annotPath, ref.split('#')[0]))
}

/**
 * creates a new, empty annotation
 * @param {Object} param0 id: xml:id of the annot; plist: value for @plist; date: ISO date; resp: pointer to the author
 * @returns {XMLDocument} the annotation
 */
export const createAnnotationDom = ({ id, plist, date, resp = '#bw' }) => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-model href="https://music-encoding.org/schema/dev/mei-all_anyStart.rng" type="application/xml" schematypens="http://relaxng.org/ns/structure/1.0"?>
<?xml-model href="https://music-encoding.org/schema/dev/mei-all_anyStart.rng" type="application/xml" schematypens="http://purl.oclc.org/dsdl/schematron"?>
<annot xmlns="http://www.music-encoding.org/ns/mei" meiversion="6.0-dev+anyStart" xml:id="${id}" plist="${plist}">
    <head>
        <title/>
        <bibl resp="${resp}">
            <date isodate="${date}"/>
        </bibl>
    </head>
    <p/>
</annot>`
  return new DOMParser().parseFromString(xml, 'application/xml')
}
