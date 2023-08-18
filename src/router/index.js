import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store/index.js'

import HomeView from '@/views/HomeView.vue'
import ModusView from '@/views/ModusView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/:source/:modus',
    name: 'modus',
    component: ModusView
  },
  {
    path: '/authenticate',
    name: 'authenticate',
    component: () => import(/* webpackChunkName: "about" */ '../views/AuthGithub.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'notfound',
    component: () => import(/* webpackChunkName: "http404" */ '../views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

/**
 * Listener that will update the Vue store properly when routes change
 * @type {[type]}
 */
router.beforeEach((to, from) => {
  // console.log('\nthis is captain speaking, going to')
  // console.log(to)
  // console.log(from)
  try {
    if (to.name === 'modus') {
      const tab = to.params.modus
      console.log('trying to open tab "' + tab + '", typeof store: ' + typeof store)
      store.dispatch('setExplorerTab', tab)
      console.log('done')

      const path = store.getters.documentPathByName(to.params.source)
      console.log('received the following path from: ' + to.params.source + ': ' + path)
      if (!path) {
        console.log('I need to retrieve ' + to.params.source)
        store.dispatch('setAwaitedDocument', to.params.source)
        if (to.query.page && parseInt(to.query.page).toFixed(0) === to.query.page) {
          store.dispatch('setAwaitedPage', to.query.page)
        }
      } else {
        console.log('loading content')
        store.dispatch('loadContent', { path })

        // check if queried page is a proper integer
        /* if (to.query.page && parseInt(to.query.page).toFixed(0) === to.query.page) {
          if (path && store.getters.documentPagesForSidebars(path)[parseInt(to.query.page)] !== undefined) {
            store.dispatch('setCurrentPage', parseInt(to.query.page) - 1)
          } else {
            store.dispatch('setAwaitedPage', to.query.page)
          }
        } */
      }
    }
  } catch (err) {
    console.error('Router Error: ' + err, to, from)
    console.log(err)
  }
  // explicitly return false to cancel the navigation
  // return false
})

export default router
