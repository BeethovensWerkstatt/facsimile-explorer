import { createRouter, createWebHistory } from 'vue-router'
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

export default router
