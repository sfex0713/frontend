import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import FactoryProfile from '../views/FactoryProfile.vue'
import PurchaseRequest from '../views/PurchaseRequest.vue'
import Dashboard from '../views/Dashboard.vue'
import Matches from '../views/Matches.vue'
import CouponShop from '../views/CouponShop.vue'
import AdminDashboard from '../views/AdminDashboard.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/factory/profile', name: 'FactoryProfile', component: FactoryProfile, meta: { requiresAuth: true } },
  { path: '/purchase/request', name: 'PurchaseRequest', component: PurchaseRequest, meta: { requiresAuth: true } },
  { path: '/matches', name: 'Matches', component: Matches, meta: { requiresAuth: true } },
  { path: '/coupon/shop', name: 'CouponShop', component: CouponShop, meta: { requiresAuth: true } },
  { path: '/admin/dashboard', name: 'AdminDashboard', component: AdminDashboard, meta: { requiresAuth: true, requiresAdmin: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.meta.requiresAdmin && userInfo.user_type !== 'admin') {
    next('/login')
  } else if (to.path === '/login' && token) {
    // 已登录用户访问登录页，根据类型跳转
    if (userInfo.user_type === 'admin') {
      next('/admin/dashboard')
    } else {
      next('/dashboard')
    }
  } else {
    next()
  }
})

export default router