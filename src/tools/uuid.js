/**
 * create a uuid (universally unique identifier) - not cryptographically secure, but good enough for our purposes
 * @returns {string} uuid
 */
export function uuid () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * check if id is an xuuid (starts with a letter followed by a uuid and optional suffix)
 * @param {string} id
 * @returns {boolean}
 */
const uuidRegex = /[a-z](([0-9,a-f]{8})-([0-9,a-f]{4})-([0-9,a-f]{4})-([0-9,a-f]{4})-([0-9,a-f]{12}))(_(.*))?/i
// x918f5394-e20d-432b-b4e9-2ef0f4326dd4_dot1
/**
 * check if id is an xuuid (starts with a letter followed by a uuid and optional suffix)
 * @param {string} id
 * @returns {boolean}
 */
export const isXUUID = (id) => uuidRegex.test(id)
/**
 * extract components from an xuuid
 * 1: uuid, 2: first letter, 3: optional suffix
 * @param {string} id
 * @returns {Array|null}
 */
export const getXUUID = (id) => {
  const m = uuidRegex.exec(id)
  if (m) {
    return [m[1], id[0], m.slice(-1)[0]]
  }
  return null
}
