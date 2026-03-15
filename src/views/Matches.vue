<template>
  <div class="matches-container">
    <div class="matches-header">
      <h1>🎯 智能匹配结果</h1>
      <p class="subtitle">匿名浏览匹配工厂/需求（FR003）</p>
      
      <div class="type-switch">
        <button 
          :class="{ active: viewMode === 'factories' }" 
          @click="viewMode = 'factories'"
        >
          🏭 匹配工厂
        </button>
        <button 
          :class="{ active: viewMode === 'requests' }" 
          @click="viewMode = 'requests'"
        >
          📋 匹配需求
        </button>
      </div>
    </div>

    <!-- 匹配工厂列表（采购方视角） -->
    <div v-if="viewMode === 'factories'" class="matches-content">
      <div v-if="loading" class="loading">加载中...</div>
      
      <div v-else-if="factories.length === 0" class="empty-state">
        <p>暂无匹配工厂</p>
        <p class="hint">请先发布采购需求，系统会自动匹配</p>
        <router-link to="/purchase/request" class="btn-primary">发布需求</router-link>
      </div>
      
      <div v-else class="factory-list">
        <div v-for="factory in factories" :key="factory.id" class="factory-card">
          <div class="card-header">
            <h3>{{ factory.factory_info.company_name }}</h3>
            <div class="match-score">
              <span class="score">{{ factory.match_score }}</span>
              <span class="label">匹配度</span>
            </div>
          </div>
          
          <div class="card-body">
            <div class="info-row">
              <span class="label">工艺类型：</span>
              <span class="value">{{ getProcessTypeName(factory.factory_info.process_type) }}</span>
            </div>
            <div class="info-row">
              <span class="label">公差范围：</span>
              <span class="value">{{ factory.factory_info.tolerance }}</span>
            </div>
            <div class="info-row">
              <span class="label">镀种类型：</span>
              <span class="value">{{ getPlatingTypeName(factory.factory_info.plating_type) }}</span>
            </div>
            <div class="info-row">
              <span class="label">日产能：</span>
              <span class="value">{{ factory.factory_info.daily_capacity }} 件/天</span>
            </div>
            <div class="info-row">
              <span class="label">认证状态：</span>
              <span class="value verified">✅ 已验厂</span>
            </div>
          </div>
          
          <div class="card-footer">
            <button class="unlock-btn" @click="unlockContact(factory.id)">
              💰 使用询盘券联系（10 元/条）
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 匹配需求列表（工厂方视角） -->
    <div v-if="viewMode === 'requests'" class="matches-content">
      <div v-if="loading" class="loading">加载中...</div>
      
      <div v-else-if="requests.length === 0" class="empty-state">
        <p>暂无匹配需求</p>
        <p class="hint">请先发布产能档案，系统会自动匹配</p>
        <router-link to="/factory/profile" class="btn-primary">发布档案</router-link>
      </div>
      
      <div v-else class="request-list">
        <div v-for="request in requests" :key="request.id" class="request-card">
          <div class="card-header">
            <h3>{{ request.request_info.product_name }}</h3>
            <div class="match-score">
              <span class="score">{{ request.match_score }}</span>
              <span class="label">匹配度</span>
            </div>
          </div>
          
          <div class="card-body">
            <div class="info-row">
              <span class="label">采购方：</span>
              <span class="value">{{ request.request_info.buyer_info }}</span>
            </div>
            <div class="info-row">
              <span class="label">工艺类型：</span>
              <span class="value">{{ getProcessTypeName(request.request_info.process_type) }}</span>
            </div>
            <div class="info-row">
              <span class="label">公差要求：</span>
              <span class="value">{{ request.request_info.tolerance_required }}</span>
            </div>
            <div class="info-row">
              <span class="label">镀种要求：</span>
              <span class="value">{{ getPlatingTypeName(request.request_info.plating_required) }}</span>
            </div>
            <div class="info-row">
              <span class="label">采购数量：</span>
              <span class="value">{{ request.request_info.quantity }} 件</span>
            </div>
            <div class="info-row">
              <span class="label">预算：</span>
              <span class="value">¥{{ request.request_info.budget }}</span>
            </div>
          </div>
          
          <div class="card-footer">
            <button class="unlock-btn" @click="unlockContact(request.id)">
              💰 使用询盘券联系（10 元/条）
            </button>
          </div>
        </div>
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

const viewMode = ref('factories')
const loading = ref(false)
const factories = ref([])
const requests = ref([])

onMounted(() => {
  if (!userStore.token) {
    alert('请先登录')
    router.push('/login')
    return
  }
  
  if (userStore.userInfo.user_type === 'factory') {
    viewMode.value = 'requests'
  } else {
    viewMode.value = 'factories'
  }
  
  loadMatches()
})

const loadMatches = async () => {
  loading.value = true
  
  try {
    if (viewMode.value === 'factories') {
      const res = await axios.get(
        'http://localhost:3000/api/purchase/matches/factories',
        {
          headers: {
            'Authorization': `Bearer ${userStore.token}`
          }
        }
      )
      factories.value = res.data.data || []
    } else {
      const res = await axios.get(
        'http://localhost:3000/api/purchase/matches/requests',
        {
          headers: {
            'Authorization': `Bearer ${userStore.token}`
          }
        }
      )
      requests.value = res.data.data || []
    }
  } catch (error) {
    console.error('加载匹配数据失败:', error)
    alert('加载失败：' + (error.response?.data?.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

const unlockContact = async (matchId) => {
  if (!confirm('确认使用 1 张询盘券解锁联系方式吗？（10 元/条）')) {
    return
  }
  
  try {
    const res = await axios.post(
      'http://localhost:3000/api/coupon/unlock',
      { matchId: matchId },
      {
        headers: {
          'Authorization': `Bearer ${userStore.token}`
        }
      }
    )
    
    alert('解锁成功！\n电话：' + res.data.data.contact_info.phone + 
          '\n邮箱：' + res.data.data.contact_info.email +
          '\n剩余余额：' + res.data.data.remaining_balance + '张')
    loadMatches()
  } catch (error) {
    if (error.response?.data?.need_purchase) {
      if (confirm('询盘券余额不足，是否前往购买？')) {
        router.push('/coupon/shop')
      }
    } else {
      alert('解锁失败：' + (error.response?.data?.message || '未知错误'))
    }
  }
}

const getProcessTypeName = (type) => {
  const map = {
    mold: '模具制造',
    injection: '注塑成型',
    plating: '电镀处理',
    assembly: '组装加工'
  }
  return map[type] || type
}

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
</script>

<style scoped>
.matches-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 30px 20px;
}

.matches-header {
  max-width: 1200px;
  margin: 0 auto 30px;
  text-align: center;
}

.matches-header h1 {
  color: #333;
  margin-bottom: 10px;
}

.subtitle {
  color: #666;
  margin-bottom: 20px;
}

.type-switch {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

.type-switch button {
  padding: 10px 25px;
  border: 2px solid #409EFF;
  background: white;
  color: #409EFF;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.type-switch button.active {
  background: #409EFF;
  color: white;
}

.type-switch button:hover {
  background: #ecf5ff;
}

.matches-content {
  max-width: 1200px;
  margin: 0 auto;
}

.loading {
  text-align: center;
  padding: 60px;
  color: #666;
  font-size: 16px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
}

.empty-state p {
  color: #666;
  margin-bottom: 10px;
}

.empty-state .hint {
  color: #999;
  font-size: 14px;
  margin-bottom: 20px;
}

.btn-primary {
  display: inline-block;
  padding: 10px 25px;
  background-color: #409EFF;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-size: 14px;
}

.btn-primary:hover {
  background-color: #66b1ff;
}

.factory-list,
.request-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.factory-card,
.request-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.factory-card:hover,
.request-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.card-header h3 {
  font-size: 16px;
  margin: 0;
}

.match-score {
  text-align: center;
}

.match-score .score {
  display: block;
  font-size: 24px;
  font-weight: bold;
}

.match-score .label {
  font-size: 12px;
  opacity: 0.9;
}

.card-body {
  padding: 20px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row .label {
  color: #666;
  font-size: 14px;
}

.info-row .value {
  color: #333;
  font-size: 14px;
  font-weight: 500;
}

.info-row .value.verified {
  color: #67C23A;
}

.card-footer {
  padding: 20px;
  background: #f5f7fa;
  text-align: center;
}

.unlock-btn {
  width: 100%;
  padding: 12px;
  background-color: #E6A23C;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.3s;
}

.unlock-btn:hover {
  background-color: #ebb563;
}
</style>