<template>
  <div class="profile-container">
    <div class="profile-box">
      <h2>🏭 工厂产能档案发布</h2>
      <p class="subtitle">参数化发布您的生产能力（FR001）</p>
      
      <form @submit.prevent="submitProfile">
        <!-- 工艺类型 -->
        <div class="form-item">
          <label>工艺类型 *</label>
          <select v-model="formData.process_type" required>
            <option value="">请选择工艺类型</option>
            <option value="mold">模具制造</option>
            <option value="injection">注塑成型</option>
            <option value="plating">电镀处理</option>
            <option value="assembly">组装加工</option>
          </select>
        </div>

        <!-- 公差范围 -->
        <div class="form-item">
          <label>公差范围 *</label>
          <input 
            v-model="formData.tolerance" 
            type="text" 
            placeholder="例如：±0.01mm" 
            required 
          />
          <small>精度越高，匹配优先级越高</small>
        </div>

        <!-- 镀种类型 -->
        <div class="form-item">
          <label>镀种类型</label>
          <select v-model="formData.plating_type">
            <option value="">请选择镀种</option>
            <option value="IP_rose_gold">IP 玫瑰金</option>
            <option value="IP_gold">IP 真金</option>
            <option value="chrome">镀铬</option>
            <option value="nickel">镀镍</option>
            <option value="other">其他</option>
          </select>
        </div>

        <!-- 设备清单 -->
        <div class="form-item">
          <label>设备清单</label>
          <textarea 
            v-model="formData.equipment_list" 
            rows="4" 
            placeholder="请列出主要设备，如：CNC 加工中心 5 台、注塑机 10 台..."
          ></textarea>
        </div>

        <!-- 日产能 -->
        <div class="form-item">
          <label>日产能（件/天）</label>
          <input 
            v-model="formData.daily_capacity" 
            type="number" 
            placeholder="例如：1000"
          />
        </div>

        <!-- 视频验厂 -->
        <div class="form-item">
          <label>验厂视频 URL</label>
          <input 
            v-model="formData.video_url" 
            type="url" 
            placeholder="https://..."
          />
          <small>支持上传到云存储后的链接（AI OCR 解析功能开发中）</small>
        </div>

        <!-- 提交按钮 -->
        <button type="submit" class="submit-btn">
          {{ isLoading ? '提交中...' : '发布档案' }}
        </button>
      </form>

      <!-- 成功提示 -->
      <div v-if="successMessage" class="success-message">
        ✅ {{ successMessage }}
      </div>
      <div v-if="errorMessage" class="error-message">
        ❌ {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import axios from 'axios'

const router = useRouter()
const userStore = useUserStore()

const formData = ref({
  process_type: '',
  tolerance: '',
  plating_type: '',
  equipment_list: '',
  daily_capacity: '',
  video_url: ''
})

const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// 页面加载时检查是否已登录
onMounted(() => {
  if (!userStore.token) {
    alert('请先登录')
    router.push('/login')
  }
})

// 提交档案
const submitProfile = async () => {
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  
  try {
    const res = await axios.post(
      'http://localhost:3000/api/factory/profile',
      formData.value,
      {
        headers: {
          'Authorization': `Bearer ${userStore.token}`
        }
      }
    )
    
    successMessage.value = res.data.message
    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)
  } catch (error) {
    errorMessage.value = error.response?.data?.message || '提交失败'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.profile-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
  padding: 20px;
}

.profile-box {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 600px;
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

.form-item input,
.form-item select,
.form-item textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-item input:focus,
.form-item select:focus,
.form-item textarea:focus {
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

.submit-btn {
  width: 100%;
  padding: 14px;
  background-color: #409EFF;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-btn:hover {
  background-color: #66b1ff;
}

.submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

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
</style>