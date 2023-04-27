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
    // route level code-splitting
    // this generates a separate chunk (authenticate.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AuthGithub.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
