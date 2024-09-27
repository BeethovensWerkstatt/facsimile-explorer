import { createApp } from 'vue'
import VueCookies from 'vue-cookies'
import App from './App.vue'
import store from './store'
import router from './router'
import config from './config'

import 'spectre.css/dist/spectre-exp.css'
import 'spectre.css/dist/spectre-icons.css'
import 'spectre.css/dist/spectre.css'
import { GH_ACCESS_TOKEN } from './store/octokit'
import { createPinia } from 'pinia'

// console.log(config)

// config is a promise...
config.then(config => {
  // create app, when config is fully loaded
  // TODO use Vue-plugin?
  store.dispatch('set_config', config)
  store.dispatch('initVerovio')
  createApp(App).use(createPinia()).use(router).use(store).use(VueCookies).mount('#app')
  const token = VueCookies.get(GH_ACCESS_TOKEN)
  // console.log(token)
  store.dispatch('setAccessToken', { auth: token })
})
