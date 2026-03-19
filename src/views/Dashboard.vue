<template>
  <div class="dashboard-container">
    <!-- 顶部导航栏 -->
    <div class="navbar">
      <div class="logo">⌚ 手表壳产业链平台</div>
      <div class="user-info">
        <span>{{ userStore.userInfo.username }}</span>
        <span class="user-type">{{ userTypeText }}</span>
        <button @click="logout" class="logout-btn">退出登录</button>
      </div>
    </div>

    <div class="dashboard-content">
      <!-- 欢迎区域 -->
      <div class="welcome-section">
        <h1>👋 欢迎回来，{{ userStore.userInfo.company_name || userStore.userInfo.username }}！</h1>
        <p>这是您的工作台，管理您的产能档案和采购需求</p>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">🏭</div>
          <div class="stat-info">
            <h3>{{ stats.factoryProfileStatus }}</h3>
            <p>工厂档案状态</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📋</div>
          <div class="stat-info">
            <h3>{{ stats.purchaseRequestsCount }}</h3>
            <p>采购需求数量</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-info">
            <h3>{{ stats.matchesCount }}</h3>
            <p>匹配记录数量</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-info">
            <h3>{{ stats.couponsCount }}</h3>
            <p>询盘券数量</p>
          </div>
        </div>
      </div>

      <!-- 快捷操作 -->
      <div class="quick-actions">
        <h2>⚡ 快捷操作</h2>
        <div class="actions-grid">
          <router-link v-if="userStore.userInfo.user_type === 'factory'" 
            to="/factory/profile" 
            class="action-card">
            <div class="action-icon">📝</div>
            <h3>发布产能档案</h3>
            <p>参数化展示您的生产能力</p>
          </router-link>
          
          <router-link v-if="userStore.userInfo.user_type === 'buyer'" 
            to="/purchase/request" 
            class="action-card">
            <div class="action-icon">🛒</div>
            <h3>发布采购需求</h3>
            <p>快速找到匹配工厂</p>
          </router-link>
          
          <router-link to="/matches" class="action-card">
            <div class="action-icon">🔍</div>
            <h3>查看匹配结果</h3>
            <p>匿名浏览匹配工厂/需求</p>
          </router-link>
          
          <router-link to="/coupon/shop" class="action-card">
            <div class="action-icon">💰</div>
            <h3>购买询盘券</h3>
            <p>10 元/条，解锁工厂联系方式</p>
          </router-link>
        </div>
      </div>

      <!-- 最新动态 -->
      <div class="recent-section">
        <h2>📊 最新动态</h2>
        <div class="recent-list">
          <div v-if="recentActivities.length === 0" class="empty-state">
            <p>暂无动态</p>
          </div>
          <div v-else v-for="activity in recentActivities" :key="activity.id" class="activity-item">
            <div class="activity-icon">{{ activity.icon }}</div>
            <div class="activity-content">
              <p class="activity-title">{{ activity.title }}</p>
              <p class="activity-time">{{ activity.time }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import axios from 'axios'

const router = useRouter()
const userStore = useUserStore()

// 用户类型文本映射
const userTypeText = computed(() => {
  const map = {
    factory: '🏭 工厂主',
    buyer: '🛒 采购方',
    admin: '👨‍💼 管理员'
  }
  return map[userStore.userInfo.user_type] || userStore.userInfo.user_type
})

// 统计数据
const stats = ref({
  factoryProfileStatus: '未发布',
  purchaseRequestsCount: 0,
  matchesCount: 0,
  couponsCount: 0  // 询盘券数量
})

// 最新动态
const recentActivities = ref([])

// 页面加载时获取数据
onMounted(async () => {
  if (!userStore.token) {
    alert('请先登录')
    router.push('/login')
    return
  }
  
  await loadDashboardData()
})

// 加载仪表盘数据
const loadDashboardData = async () => {
  try {
    // 获取工厂档案状态
    if (userStore.userInfo.user_type === 'factory') {
      try {
        const profileRes = await axios.get(
          '${import.meta.env.VITE_API_BASE_URL}/factory/profile',
          {
            headers: {
              'Authorization': `Bearer ${userStore.token}`
            }
          }
        )
        stats.value.factoryProfileStatus = profileRes.data.data ? '已发布 ✅' : '未发布 ❌'
      } catch (e) {
        stats.value.factoryProfileStatus = '未发布 ❌'
      }
    } else {
      stats.value.factoryProfileStatus = '不适用'
    }
    
    // 获取采购需求数量
    try {
      const requestsRes = await axios.get(
        '${import.meta.env.VITE_API_BASE_URL}/purchase/requests',
        {
          headers: {
            'Authorization': `Bearer ${userStore.token}`
          }
        }
      )
      stats.value.purchaseRequestsCount = requestsRes.data.data?.length || 0
    } catch (e) {
      stats.value.purchaseRequestsCount = 0
    }
    
    // 获取询盘券余额
    try {
      const walletRes = await axios.get(
        '${import.meta.env.VITE_API_BASE_URL}/coupon/wallet',
        {
          headers: {
            'Authorization': `Bearer ${userStore.token}`
          }
        }
      )
      stats.value.couponsCount = walletRes.data.data?.coupon_balance || 0
    } catch (e) {
      console.log('获取钱包失败:', e.message)
      stats.value.couponsCount = 0
    }
    
    // 匹配记录数量（暂时设为 0）
    stats.value.matchesCount = 0
    
    // 加载动态
    loadRecentActivities()
  } catch (error) {
    console.error('加载仪表盘数据失败:', error)
  }
}

// 加载动态
const loadRecentActivities = () => {
  recentActivities.value = [
    {
      id: 1,
      icon: '✅',
      title: '账户注册成功',
      time: new Date().toLocaleDateString()
    }
  ]
  
  // 如果有采购需求，添加动态
  if (stats.value.purchaseRequestsCount > 0) {
    recentActivities.value.unshift({
      id: 2,
      icon: '📋',
      title: '发布了新的采购需求',
      time: new Date().toLocaleDateString()
    })
  }
  
  // 如果有询盘券，添加动态
  if (stats.value.couponsCount > 0) {
    recentActivities.value.unshift({
      id: 3,
      icon: '💰',
      title: `购买了 ${stats.value.couponsCount} 张询盘券`,
      time: new Date().toLocaleDateString()
    })
  }
}

// 退出登录
const logout = () => {
  if (confirm('确定要退出登录吗？')) {
    userStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* 导航栏 */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  color: #409EFF;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-type {
  padding: 4px 12px;
  background-color: #ecf5ff;
  color: #409EFF;
  border-radius: 20px;
  font-size: 13px;
}

.logout-btn {
  padding: 6px 16px;
  background-color: #f56c6c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.logout-btn:hover {
  background-color: #f78989;
}

/* 主内容区 */
.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
}

/* 欢迎区域 */
.welcome-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px;
  border-radius: 12px;
  margin-bottom: 30px;
}

.welcome-section h1 {
  margin-bottom: 10px;
}

.welcome-section p {
  opacity: 0.9;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  font-size: 40px;
}

.stat-info h3 {
  font-size: 24px;
  color: #333;
  margin-bottom: 5px;
}

.stat-info p {
  color: #999;
  font-size: 14px;
}

/* 快捷操作 */
.quick-actions {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  margin-bottom: 30px;
}

.quick-actions h2 {
  margin-bottom: 20px;
  color: #333;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.action-card {
  display: block;
  padding: 25px;
  background: #f5f7fa;
  border-radius: 8px;
  text-decoration: none;
  color: #333;
  transition: all 0.3s;
  text-align: center;
}

.action-card:hover {
  background: #ecf5ff;
  transform: translateY(-3px);
  box-shadow: 0 4px 15px rgba(64, 158, 255, 0.2);
}

.action-icon {
  font-size: 36px;
  margin-bottom: 15px;
}

.action-card h3 {
  font-size: 16px;
  margin-bottom: 8px;
}

.action-card p {
  font-size: 13px;
  color: #666;
}

/* 最新动态 */
.recent-section {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  margin-bottom: 30px;
}

.recent-section h2 {
  margin-bottom: 20px;
  color: #333;
}

.recent-list {
  max-height: 300px;
  overflow-y: auto;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #999;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  font-size: 24px;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
}

.activity-time {
  font-size: 13px;
  color: #999;
}

/* 平台公告 */
.notice-section {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
}

.notice-section h2 {
  margin-bottom: 20px;
  color: #333;
}

.notice-item {
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 15px;
}

.notice-item:last-child {
  margin-bottom: 0;
}

.notice-tag {
  display: inline-block;
  padding: 3px 10px;
  background-color: #409EFF;
  color: white;
  border-radius: 4px;
  font-size: 12px;
  margin-bottom: 10px;
}

.notice-item p {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
}
</style>