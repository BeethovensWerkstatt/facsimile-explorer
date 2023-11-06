/**
 * load config from BASE_URL/config.json and export as a promise
 */
export const config = new Promise((resolve, reject) => {
  console.log('load config.json ...')
  const configURL = process.env.BASE_URL + 'config.json'
  fetch(configURL).then(resp => resp.json()).then(config => {
    if (!config.repository.CLIENT_ID && process.env.VUE_APP_CLIENT_ID && process.env.VUE_APP_CLIENT_ID !== '<CLIENT_ID>') {
      config.repository.CLIENT_ID = process.env.VUE_APP_CLIENT_ID
    }
    console.log(config)
    resolve(config)
  }).catch(err => reject(err))
})
export default config
