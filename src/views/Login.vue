<template>
  <div class="login-container">
    <div class="login-box">
      <h2>⌚ 手表壳产业链平台 - 登录</h2>
      <p class="subtitle">欢迎回来，请选择登录类型</p>
      
      <!-- 登录类型选择 -->
      <div class="login-type-selector">
        <button 
          :class="['type-btn', { active: loginType === 'user' }]" 
          @click="loginType = 'user'"
        >
          👤 用户登录
        </button>
        <button 
          :class="['type-btn', { active: loginType === 'admin' }]" 
          @click="loginType = 'admin'"
        >
          👨‍💼 管理员登录
        </button>
      </div>
      
      <form @submit.prevent="handleLogin">
        <div class="form-item">
          <label>用户名</label>
          <input 
            v-model="username" 
            type="text" 
            :placeholder="loginType === 'admin' ? '请输入管理员账号' : '请输入用户名'" 
            required 
          />
        </div>
        <div class="form-item">
          <label>密码</label>
          <input 
            v-model="password" 
            type="password" 
            placeholder="请输入密码" 
            required 
          />
        </div>
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? '登录中...' : '登录' }}
        </button>
      </form>
      
      <p v-if="error" class="error">{{ error }}</p>
      
      <!-- 用户登录时显示注册链接 -->
      <p v-if="loginType === 'user'" class="register-link">
        还没有账号？<router-link to="/register">去注册</router-link>
      </p>
      
      <!-- 管理员登录提示 -->
      <p v-if="loginType === 'admin'" class="admin-hint">
        💡 仅限平台管理人员使用
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import axios from 'axios'

const router = useRouter()
const userStore = useUserStore()

const loginType = ref('user') // 'user' 或 'admin'
const username = ref('')
const password = ref('')
const isLoading = ref(false)
const error = ref('')

const handleLogin = async () => {
  isLoading.value = true
  error.value = ''
  
  try {
    const res = await axios.post('${import.meta.env.VITE_API_BASE_URL}/auth/login', {
      username: username.value,
      password: password.value
    })
    
    userStore.setToken(res.data.token)
    userStore.setUserInfo(res.data.user)
    
    // 根据登录类型和用户类型跳转
    if (loginType.value === 'admin') {
      // 管理员登录，验证用户类型
      if (res.data.user.user_type !== 'admin') {
        error.value = '该账号不是管理员账号，请使用用户登录'
        userStore.logout()
        return
      }
      alert('管理员登录成功！')
      router.push('/admin/dashboard')
    } else {
      // 普通用户登录
      if (res.data.user.user_type === 'admin') {
        error.value = '管理员账号请使用管理员登录入口'
        userStore.logout()
        return
      }
      alert('登录成功！')
      router.push('/dashboard')
    }
  } catch (err) {
    console.error('登录错误:', err)
    error.value = err.response?.data?.message || '登录失败'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  width: 400px;
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 10px;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 25px;
  font-size: 14px;
}

/* 登录类型选择器 */
.login-type-selector {
  display: flex;
  gap: 10px;
  margin-bottom: 25px;
}

.type-btn {
  flex: 1;
  padding: 12px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.type-btn:hover {
  border-color: #667eea;
}

.type-btn.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.form-item {
  margin-bottom: 20px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.form-item input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-item input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

button[type="submit"] {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

button[type="submit"]:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

button[type="submit"]:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.error {
  color: #f56c6c;
  font-size: 14px;
  margin-top: 15px;
  text-align: center;
  padding: 10px;
  background: #fef0f0;
  border-radius: 6px;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.register-link a {
  color: #667eea;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}

.admin-hint {
  text-align: center;
  margin-top: 20px;
  color: #667eea;
  font-size: 13px;
  padding: 10px;
  background: #ecf5ff;
  border-radius: 6px;
}
</style>