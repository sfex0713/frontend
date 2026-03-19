<template>
  <div class="request-container">
    <div class="request-box">
      <h2>📋 采购需求发布</h2>
      <p class="subtitle">参数化发布您的采购需求（FR002）</p>
      
      <form @submit.prevent="submitRequest">
        <!-- 产品名称 -->
        <div class="form-item">
          <label>产品名称 *</label>
          <input 
            v-model="formData.product_name" 
            type="text" 
            placeholder="例如：智能手表壳 44mm" 
            required 
          />
        </div>

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

        <!-- 公差要求 -->
        <div class="form-item">
          <label>公差要求 *</label>
          <input 
            v-model="formData.tolerance_required" 
            type="text" 
            placeholder="例如：±0.01mm" 
            required 
          />
          <small>精度要求越高，匹配工厂越少但质量越好</small>
        </div>

        <!-- 镀种要求 -->
        <div class="form-item">
          <label>镀种要求</label>
          <select v-model="formData.plating_required">
            <option value="">请选择镀种</option>
            <option value="IP_rose_gold">IP 玫瑰金</option>
            <option value="IP_gold">IP 真金</option>
            <option value="chrome">镀铬</option>
            <option value="nickel">镀镍</option>
            <option value="other">其他</option>
          </select>
        </div>

        <!-- 采购数量 -->
        <div class="form-item">
          <label>采购数量（件）</label>
          <input 
            v-model="formData.quantity" 
            type="number" 
            placeholder="例如：5000"
          />
        </div>

        <!-- 交期 -->
        <div class="form-item">
          <label>期望交期</label>
          <input 
            v-model="formData.deadline" 
            type="date" 
          />
        </div>

        <!-- 预算 -->
        <div class="form-item">
          <label>预算（元）</label>
          <input 
            v-model="formData.budget" 
            type="number" 
            step="0.01"
            placeholder="例如：50000.00"
          />
        </div>

        <!-- 提交按钮 -->
        <button type="submit" class="submit-btn" :disabled="isLoading">
          {{ isLoading ? '发布中...' : '发布需求' }}
        </button>
      </form>

      <!-- 匹配结果 -->
      <div v-if="matchResults.length > 0" class="match-results">
        <h3>🎯 智能匹配结果（{{ matchResults.length }}家工厂）</h3>
        <div v-for="factory in matchResults" :key="factory.id" class="factory-card">
          <h4>{{ factory.company_name }}</h4>
          <p>工艺：{{ getProcessTypeName(factory.process_type) }}</p>
          <p>公差：{{ factory.tolerance }}</p>
          <p>镀种：{{ getPlatingTypeName(factory.plating_type) }}</p>
          <p>日产能：{{ factory.daily_capacity }}件/天</p>
          <button class="contact-btn" @click="contactFactory(factory.id)">
            💰 使用询盘券联系（10 元/条）
          </button>
        </div>
      </div>

      <!-- 成功/错误提示 -->
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
  product_name: '',
  process_type: '',
  tolerance_required: '',
  plating_required: '',
  quantity: '',
  deadline: '',
  budget: ''
})

const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const matchResults = ref([])

// 页面加载时检查是否已登录
onMounted(() => {
  if (!userStore.token) {
    alert('请先登录')
    router.push('/login')
  }
})

// 提交需求
const submitRequest = async () => {
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  matchResults.value = []
  
  try {
    const res = await axios.post(
      '${import.meta.env.VITE_API_BASE_URL}/purchase/request',
      formData.value,
      {
        headers: {
          'Authorization': `Bearer ${userStore.token}`
        }
      }
    )
    
    successMessage.value = res.data.message
    matchResults.value = res.data.matched_factories || []
    
    if (matchResults.value.length === 0) {
      successMessage.value += '（暂无匹配工厂，需求已发布到平台）'
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.message || '发布失败'
  } finally {
    isLoading.value = false
  }
}

// 工艺类型名称映射
const getProcessTypeName = (type) => {
  const map = {
    mold: '模具制造',
    injection: '注塑成型',
    plating: '电镀处理',
    assembly: '组装加工'
  }
  return map[type] || type
}

// 镀种名称映射
const getPlatingTypeName = (type) => {
  const map = {
    IP_rose_gold: 'IP 玫瑰金',
    IP_gold: 'IP 真金',
    chrome: '镀铬',
    nickel: '镀镍',
    other: '其他'
  }
  return map[type] || type
}

// 联系工厂
const contactFactory = (factoryId) => {
  alert('询盘券支付功能开发中...')
  // 后续会集成支付接口
}
</script>

<style scoped>
.request-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  background-color: #f0f2f5;
  padding: 40px 20px;
}

.request-box {
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
.form-item select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-item input:focus,
.form-item select:focus {
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

.match-results {
  margin-top: 30px;
  padding: 20px;
  background-color: #f0f9ff;
  border: 1px solid #409EFF;
  border-radius: 8px;
}

.match-results h3 {
  color: #409EFF;
  margin-bottom: 15px;
}

.factory-card {
  background: white;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 15px;
  border: 1px solid #e0e0e0;
}

.factory-card h4 {
  color: #333;
  margin-bottom: 10px;
}

.factory-card p {
  color: #666;
  font-size: 14px;
  margin: 5px 0;
}

.contact-btn {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #E6A23C;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.contact-btn:hover {
  background-color: #ebb563;
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