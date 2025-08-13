import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('../views/History.vue'),
  },
  {
    path: '/review',
    name: 'Review',
    component: () => import('../views/Review.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
