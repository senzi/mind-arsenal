import { createRouter, createWebHistory } from 'vue-router'
import TextConverter from '../components/TextConverter.vue'

const routes = [
  {
    path: '/converter',
    name: 'TextConverter',
    component: TextConverter
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
