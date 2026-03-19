<template>
  <div class="register-container">
    <div class="register-box">
      <h2>📝 手表壳产业链平台 - 注册</h2>
      <p class="subtitle">填写信息创建您的账户</p>
      
      <form @submit.prevent="handleRegister">
        <!-- 用户名 -->
        <div class="form-item">
          <label>用户名 *</label>
          <input 
            v-model="formData.username" 
            type="text" 
            placeholder="请输入用户名（4-20 位）" 
            required 
            minlength="4"
            maxlength="20"
          />
        </div>

        <!-- 密码 -->
        <div class="form-item">
          <label>密码 *</label>
          <input 
            v-model="formData.password" 
            type="password" 
            placeholder="请输入密码（6 位以上）" 
            required 
            minlength="6"
          />
        </div>

        <!-- 确认密码 -->
        <div class="form-item">
          <label>确认密码 *</label>
          <input 
            v-model="formData.confirmPassword" 
            type="password" 
            placeholder="请再次输入密码" 
            required 
          />
          <p v-if="passwordError" class="error-text">{{ passwordError }}</p>
        </div>

        <!-- 用户类型 -->
        <div class="form-item">
          <label>账户类型 *</label>
          <div class="type-selector">
            <label class="type-option" :class="{ active: formData.user_type === 'factory' }">
              <input 
                type="radio" 
                value="factory" 
                v-model="formData.user_type"
              />
              <div class="type-card">
                <div class="type-icon">🏭</div>
                <div class="type-name">工厂主</div>
                <div class="type-desc">发布产能档案，接收采购需求</div>
              </div>
            </label>
            <label class="type-option" :class="{ active: formData.user_type === 'buyer' }">
              <input 
                type="radio" 
                value="buyer" 
                v-model="formData.user_type"
              />
              <div class="type-card">
                <div class="type-icon">🛒</div>
                <div class="type-name">采购方</div>
                <div class="type-desc">发布采购需求，匹配优质工厂</div>
              </div>
            </label>
          </div>
        </div>

        <!-- 公司名称 -->
        <div class="form-item">
          <label>公司/工厂名称 *</label>
          <input 
            v-model="formData.company_name" 
            type="text" 
            placeholder="请输入公司或工厂名称" 
            required 
          />
        </div>

        <!-- 邮箱 -->
        <div class="form-item">
          <label>邮箱</label>
          <input 
            v-model="formData.email" 
            type="email" 
            placeholder="请输入邮箱地址" 
          />
        </div>

        <!-- 电话 -->
        <div class="form-item">
          <label>联系电话 *</label>
          <input 
            v-model="formData.phone" 
            type="tel" 
            placeholder="请输入手机号码" 
            required 
            pattern="[0-9]{11}"
          />
          <small>用于接收匹配通知（11 位手机号）</small>
        </div>

        <!-- 提交按钮 -->
        <button type="submit" class="submit-btn" :disabled="isLoading">
          {{ isLoading ? '注册中...' : '立即注册' }}
        </button>
      </form>

      <!-- 成功/错误提示 -->
      <div v-if="successMessage" class="success-message">
        ✅ {{ successMessage }}
      </div>
      <div v-if="errorMessage" class="error-message">
        ❌ {{ errorMessage }}
      </div>

      <!-- 登录链接 -->
      <p class="login-link">
        已有账号？<router-link to="/login">立即登录</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const formData = ref({
  username: '',
  password: '',
  confirmPassword: '',
  user_type: 'factory', // 默认工厂主
  company_name: '',
  email: '',
  phone: ''
})

const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const passwordError = ref('')

// 验证密码
const validatePassword = () => {
  if (formData.value.password !== formData.value.confirmPassword) {
    passwordError.value = '两次输入的密码不一致'
    return false
  }
  if (formData.value.password.length < 6) {
    passwordError.value = '密码长度至少 6 位'
    return false
  }
  passwordError.value = ''
  return true
}

// 注册处理
const handleRegister = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  
  // 验证密码
  if (!validatePassword()) {
    return
  }
  
  // 验证手机号
  const phoneRegex = /^[0-9]{11}$/
  if (!phoneRegex.test(formData.value.phone)) {
    errorMessage.value = '请输入正确的 11 位手机号码'
    return
  }
  
  isLoading.value = true
  
  try {
    const res = await axios.post('${import.meta.env.VITE_API_BASE_URL}/auth/register', {
      username: formData.value.username,
      password: formData.value.password,
      email: formData.value.email,
      phone: formData.value.phone,
      user_type: formData.value.user_type,
      company_name: formData.value.company_name
    })
    
    successMessage.value = '注册成功！即将跳转到登录页面...'
    
    // 清空表单
    formData.value = {
      username: '',
      password: '',
      confirmPassword: '',
      user_type: 'factory',
      company_name: '',
      email: '',
      phone: ''
    }
    
    // 2 秒后跳转到登录页
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (error) {
    errorMessage.value = error.response?.data?.message || '注册失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  background-color: #f0f2f5;
  padding: 40px 20px;
}

.register-box {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 500px;
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 10px;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 30px;
  font-size: 14px;
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

.form-item input[type="text"],
.form-item input[type="password"],
.form-item input[type="email"],
.form-item input[type="tel"] {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-item input:focus {
  outline: none;
  border-color: #409EFF;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.form-item small {
  display: block;
  margin-top: 5px;
  color: #999;
  font-size: 12px;
}

.error-text {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 5px;
}

/* 用户类型选择器 */
.type-selector {
  display: flex;
  gap: 15px;
}

.type-option {
  flex: 1;
  cursor: pointer;
}

.type-option input[type="radio"] {
  display: none;
}

.type-card {
  padding: 20px 15px;
  border: 2px solid #ddd;
  border-radius: 8px;
  text-align: center;
  transition: all 0.3s;
}

.type-option.active .type-card {
  border-color: #409EFF;
  background-color: #ecf5ff;
}

.type-card:hover {
  border-color: #409EFF;
}

.type-icon {
  font-size: 32px;
  margin-bottom: 10px;
}

.type-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.type-desc {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  padding: 14px;
  background-color: #67C23A;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-btn:hover {
  background-color: #85ce61;
}

.submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* 提示信息 */
.success-message {
  margin-top: 20px;
  padding: 15px;
  background-color: #f0f9ff;
  border: 1px solid #409EFF;
  border-radius: 6px;
  color: #409EFF;
  text-align: center;
}

.error-message {
  margin-top: 20px;
  padding: 15px;
  background-color: #fef0f0;
  border: 1px solid #f56c6c;
  border-radius: 6px;
  color: #f56c6c;
  text-align: center;
}

/* 登录链接 */
.login-link {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.login-link a {
  color: #409EFF;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>