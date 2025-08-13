import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Staking from '../views/Staking.vue'
import History from '../views/History.vue'
import Rewards from '../views/Rewards.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/staking',
    name: 'Staking',
    component: Staking
  },
  {
    path: '/history',
    name: 'History',
    component: History
  },
  {
    path: '/rewards',
    name: 'Rewards',
    component: Rewards
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router