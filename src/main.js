import { createApp } from 'vue'
import VueCookies from 'vue-cookies'
import App from './App.vue'
import store from './store'
import router from './router'

import 'spectre.css/dist/spectre-exp.css'
import 'spectre.css/dist/spectre-icons.css'
import 'spectre.css/dist/spectre.css'
import { GH_ACCESS_TOKEN } from './store/octokit'

createApp(App).use(router).use(store).use(VueCookies).mount('#app')

store.dispatch('initVerovio')
const token = VueCookies.get(GH_ACCESS_TOKEN)
// console.log(token)
store.dispatch('setAccessToken', { auth: token })
