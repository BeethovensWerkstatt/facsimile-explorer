// if VUE_APP_CLIENT_ID is given return that, otherwise try config.json
const CLIENT_ID = new Promise((resolve, reject) => {
  if (process.env.VUE_APP_CLIENT_ID && process.env.VUE_APP_CLIENT_ID !== '<CLIENT_ID>') {
    resolve(process.env.VUE_APP_CLIENT_ID)
  } else {
    const configURL = process.env.BASE_URL + 'config.json'
    fetch(configURL).then(resp => resp.json().then(config => resolve(config.repository?.CLIENT_ID))).catch(err => reject(err))
  }
})
export default CLIENT_ID
