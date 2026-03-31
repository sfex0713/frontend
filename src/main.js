import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import axios from 'axios'

const app = createApp(App)
const pinia = createPinia()

// 获取 API 基础 URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://eaf5e69c.natappfree.cc/api'

console.log('🔗 API 基础 URL:', API_BASE_URL)

// 全局配置 axios
axios.defaults.baseURL = API_BASE_URL
axios.defaults.timeout = 10000

// 请求拦截器
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
axios.interceptors.response.use(
  response => response,
  error => {
    console.error('API 错误:', error)
    return Promise.reject(error)
  }
)

// 把 axios 挂载到全局
app.config.globalProperties.$axios = axios

app.use(pinia)
app.use(router)
app.mount('#app')