<template>
  <div class="admin-container">
    <div class="admin-header">
      <h1>👨‍💼 后台管理系统</h1>
      <div class="admin-info">
        <span>{{ userStore.userInfo.username }}</span>
        <button @click="logout" class="logout-btn">退出登录</button>
      </div>
    </div>

    <div class="admin-content">
      <!-- 统计卡片 -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <h3>{{ stats.total_users }}</h3>
            <p>总用户数</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🏭</div>
          <div class="stat-info">
            <h3>{{ stats.total_factories }}</h3>
            <p>工厂主</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🛒</div>
          <div class="stat-info">
            <h3>{{ stats.total_buyers }}</h3>
            <p>采购方</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📋</div>
          <div class="stat-info">
            <h3>{{ stats.total_requests }}</h3>
            <p>采购需求</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-info">
            <h3>{{ stats.total_matches }}</h3>
            <p>匹配记录</p>
          </div>
        </div>
        <div class="stat-card revenue">
          <div class="stat-icon">💰</div>
          <div class="stat-info">
            <h3>¥{{ stats.total_revenue }}</h3>
            <p>平台收入</p>
          </div>
        </div>
      </div>

      <!-- 功能导航 -->
      <div class="function-nav">
        <button :class="{ active: currentTab === 'users' }" @click="currentTab = 'users'">
          👥 用户管理
        </button>
        <button :class="{ active: currentTab === 'reviews' }" @click="currentTab = 'reviews'">
          ✅ 内容审核
        </button>
        <button :class="{ active: currentTab === 'logs' }" @click="currentTab = 'logs'">
          📊 系统日志
        </button>
      </div>

      <!-- 用户管理 -->
      <div v-if="currentTab === 'users'" class="tab-content">
        <h2>用户列表</h2>
        <div v-if="usersLoading" class="loading">加载中...</div>
        <div v-else-if="users.length === 0" class="empty">暂无用户数据</div>
        <div v-else class="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>用户名</th>
                <th>公司/工厂</th>
                <th>类型</th>
                <th>手机</th>
                <th>注册时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>{{ user.id }}</td>
                <td>{{ user.username }}</td>
                <td>{{ user.company_name || '-' }}</td>
                <td>
                  <span :class="['user-type', user.user_type]">
                    {{ getUserTypeText(user.user_type) }}
                  </span>
                </td>
                <td>{{ user.phone || '-' }}</td>
                <td>{{ formatDate(user.created_at) }}</td>
                <td>
                  <button class="btn-sm" @click="toggleUserStatus(user)">
                    {{ user.status === 'disabled' ? '启用' : '禁用' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 内容审核 -->
      <div v-if="currentTab === 'reviews'" class="tab-content">
        <h2>待审核内容</h2>
        <div class="review-section">
          <h3>🏭 工厂档案</h3>
          <div v-if="reviews.factory_profiles.length === 0" class="empty">暂无待审核</div>
          <div v-else class="review-list">
            <div v-for="item in reviews.factory_profiles" :key="item.id" class="review-item">
              <div class="review-info">
                <p><strong>公司：</strong>{{ item.company_name }}</p>
                <p><strong>工艺：</strong>{{ getProcessTypeName(item.process_type) }}</p>
                <p><strong>公差：</strong>{{ item.tolerance }}</p>
                <p><strong>镀种：</strong>{{ item.plating_type }}</p>
              </div>
              <div class="review-actions">
                <button class="btn-approve" @click="reviewContent('factory_profile', item.id, 'approved')">通过</button>
                <button class="btn-reject" @click="reviewContent('factory_profile', item.id, 'rejected')">拒绝</button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="review-section">
          <h3>📋 采购需求</h3>
          <div v-if="reviews.purchase_requests.length === 0" class="empty">暂无待审核</div>
          <div v-else class="review-list">
            <div v-for="item in reviews.purchase_requests" :key="item.id" class="review-item">
              <div class="review-info">
                <p><strong>采购方：</strong>{{ item.company_name }}</p>
                <p><strong>产品：</strong>{{ item.product_name }}</p>
                <p><strong>工艺：</strong>{{ getProcessTypeName(item.process_type) }}</p>
                <p><strong>数量：</strong>{{ item.quantity }} 件</p>
              </div>
              <div class="review-actions">
                <button class="btn-approve" @click="reviewContent('purchase_request', item.id, 'approved')">通过</button>
                <button class="btn-reject" @click="reviewContent('purchase_request', item.id, 'rejected')">拒绝</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 系统日志 -->
      <div v-if="currentTab === 'logs'" class="tab-content">
        <h2>系统日志（最近 100 条）</h2>
        <div v-if="logsLoading" class="loading">加载中...</div>
        <div v-else-if="logs.length === 0" class="empty">暂无日志数据</div>
        <div v-else class="table-container">
          <table>
            <thead>
              <tr>
                <th>类型</th>
                <th>描述</th>
                <th>金额</th>
                <th>时间</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in logs" :key="log.created_at">
                <td>{{ log.type }}</td>
                <td>{{ log.description }}</td>
                <td>¥{{ log.amount }}</td>
                <td>{{ formatDate(log.created_at) }}</td>
              </tr>
            </tbody>
          </table>
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

const stats = ref({
  total_users: 0,
  total_factories: 0,
  total_buyers: 0,
  total_requests: 0,
  total_matches: 0,
  total_revenue: 0
})

const currentTab = ref('users')
const users = ref([])
const usersLoading = ref(false)
const reviews = ref({ factory_profiles: [], purchase_requests: [] })
const logs = ref([])
const logsLoading = ref(false)

onMounted(() => {
  if (!userStore.token || userStore.userInfo.user_type !== 'admin') {
    alert('请先以管理员身份登录')
    router.push('/login')
    return
  }
  loadStats()
  loadUsers()
  loadReviews()
  loadLogs()
})

const loadStats = async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/admin/dashboard', {
      headers: { 'Authorization': `Bearer ${userStore.token}` }
    })
    stats.value = res.data.data
  } catch (error) {
    console.error('加载统计失败:', error)
  }
}

const loadUsers = async () => {
  usersLoading.value = true
  try {
    console.log('Token:', userStore.token)
    
    const res = await axios.get('http://localhost:3000/api/admin/users', {
      headers: { 'Authorization': `Bearer ${userStore.token}` }
    })
    
    console.log('用户数据:', res.data)
    users.value = res.data.data || []
  } catch (error) {
    console.error('加载用户失败:', error)
    alert('加载失败：' + (error.response?.data?.message || '未知错误'))
  } finally {
    usersLoading.value = false
  }
}

const loadReviews = async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/admin/reviews/pending', {
      headers: { 'Authorization': `Bearer ${userStore.token}` }
    })
    reviews.value = res.data.data
  } catch (error) {
    console.error('加载审核失败:', error)
  }
}

const loadLogs = async () => {
  logsLoading.value = true
  try {
    const res = await axios.get('http://localhost:3000/api/admin/logs', {
      headers: { 'Authorization': `Bearer ${userStore.token}` }
    })
    logs.value = res.data.data || []
  } catch (error) {
    console.error('加载日志失败:', error)
  } finally {
    logsLoading.value = false
  }
}

const toggleUserStatus = async (user) => {
  try {
    await axios.put(
      `http://localhost:3000/api/admin/users/${user.id}/status`,
      { status: user.status === 'disabled' ? 'active' : 'disabled' },
      { headers: { 'Authorization': `Bearer ${userStore.token}` } }
    )
    alert('用户状态已更新')
    loadUsers()
  } catch (error) {
    alert('操作失败')
  }
}

const reviewContent = async (contentType, contentId, status) => {
  const comment = prompt('请输入审核意见（可选）:')
  try {
    await axios.post(
      `http://localhost:3000/api/admin/reviews/${contentType}/${contentId}`,
      { status, comment },
      { headers: { 'Authorization': `Bearer ${userStore.token}` } }
    )
    alert('审核完成')
    loadReviews()
  } catch (error) {
    alert('审核失败')
  }
}

const logout = () => {
  userStore.logout()
  router.push('/login')
}

const getUserTypeText = (type) => {
  const map = { factory: '工厂主', buyer: '采购方', admin: '管理员' }
  return map[type] || type
}

const getProcessTypeName = (type) => {
  const map = { mold: '模具制造', injection: '注塑成型', plating: '电镀处理', assembly: '组装加工' }
  return map[type] || type
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.admin-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.admin-header h1 {
  color: #333;
  font-size: 24px;
}

.admin-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logout-btn {
  padding: 8px 16px;
  background-color: #f56c6c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.admin-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

.stat-card.revenue {
  background: linear-gradient(135deg, #67C23A 0%, #85ce61 100%);
  color: white;
}

.stat-icon {
  font-size: 40px;
}

.stat-info h3 {
  font-size: 24px;
  margin-bottom: 5px;
}

.stat-info p {
  font-size: 14px;
  opacity: 0.8;
}

.function-nav {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.function-nav button {
  padding: 12px 25px;
  border: 2px solid #409EFF;
  background: white;
  color: #409EFF;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
}

.function-nav button.active {
  background: #409EFF;
  color: white;
}

.tab-content {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
}

.tab-content h2 {
  margin-bottom: 20px;
  color: #333;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.empty {
  text-align: center;
  color: #999;
  padding: 40px;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

th {
  background: #f5f7fa;
  font-weight: 600;
  color: #333;
}

tr:hover {
  background: #f5f7fa;
}

.user-type {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
}

.user-type.factory {
  background: #ecf5ff;
  color: #409EFF;
}

.user-type.buyer {
  background: #f0f9ff;
  color: #67C23A;
}

.user-type.admin {
  background: #fef0f0;
  color: #f56c6c;
}

.btn-sm {
  padding: 5px 12px;
  font-size: 12px;
  background: #409EFF;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.review-section {
  margin-bottom: 30px;
}

.review-section h3 {
  margin-bottom: 15px;
  color: #333;
}

.review-list {
  display: grid;
  gap: 15px;
}

.review-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
}

.review-info p {
  margin: 5px 0;
  font-size: 14px;
  color: #666;
}

.review-actions {
  display: flex;
  gap: 10px;
}

.btn-approve {
  padding: 8px 16px;
  background: #67C23A;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-reject {
  padding: 8px 16px;
  background: #f56c6c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>