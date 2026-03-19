<template>
  <div class="coupon-container">
    <div class="coupon-header">
      <h1>💰 询盘券购买</h1>
      <p class="subtitle">10 元/条，解锁工厂联系方式（FR004）</p>
    </div>

    <div class="coupon-content">
     
      <div class="wallet-card">
        <div class="balance-info">
          <span class="label">当前余额</span>
          <span class="balance">{{ wallet.coupon_balance }} 张</span>
        </div>
        <div class="stats-row">
          <div class="stat-item">
            <span class="stat-label">累计购买</span>
            <span class="stat-value">{{ wallet.total_purchased }} 张</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">已使用</span>
            <span class="stat-value">{{ wallet.total_used }} 张</span>
          </div>
        </div>
      </div>

      <!-- 购买选项 -->
      <div class="purchase-section">
        <h2>选择购买数量</h2>
        <div class="quantity-grid">
          <div 
            v-for="option in purchaseOptions" 
            :key="option.quantity"
            :class="['quantity-card', { active: selectedQuantity === option.quantity }]"
            @click="selectedQuantity = option.quantity"
          >
            <div class="quantity">{{ option.quantity }} 张</div>
            <div class="price">¥{{ option.price }}</div>
            <div v-if="option.discount" class="discount">{{ option.discount }}</div>
          </div>
        </div>
      </div>

      <!-- 支付信息 -->
      <div class="payment-info">
        <div class="info-row">
          <span>单价</span>
          <span>¥10.00 / 张</span>
        </div>
        <div class="info-row">
          <span>购买数量</span>
          <span>{{ selectedQuantity }} 张</span>
        </div>
        <div class="info-row total">
          <span>应付金额</span>
          <span class="total-price">¥{{ totalPrice }}</span>
        </div>
      </div>

      <!-- 购买按钮 -->
      <button class="buy-btn" @click="handlePurchase" :disabled="isLoading">
        {{ isLoading ? '支付中...' : '立即支付' }}
      </button>

      <!-- 购买记录 -->
      <div class="records-section">
        <h2>📋 购买记录</h2>
        <div v-if="orders.length === 0" class="empty-records">暂无购买记录</div>
        <div v-else class="order-list">
          <div v-for="order in orders" :key="order.id" class="order-item">
            <div class="order-info">
              <span class="order-no">{{ order.order_no }}</span>
              <span class="order-date">{{ formatDate(order.created_at) }}</span>
            </div>
            <div class="order-detail">
              <span>{{ order.quantity }} 张 × ¥{{ order.coupon_price }}</span>
              <span class="order-status" :class="order.status">
                {{ order.status === 'paid' ? '✅ 已支付' : '⏳ 待支付' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 使用说明 -->
      <div class="usage-guide">
        <h2>📖 使用说明</h2>
        <ul>
          <li>每张询盘券可解锁 1 个工厂的联系方式</li>
          <li>解锁后可查看工厂电话、邮箱、公司名称</li>
          <li>询盘券永久有效，不设使用期限</li>
          <li>平台仅作为信息中介，不介入实际交易</li>
        </ul>
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

const wallet = ref({
  coupon_balance: 0,
  total_purchased: 0,
  total_used: 0
})

const selectedQuantity = ref(1)
const isLoading = ref(false)
const orders = ref([])

const purchaseOptions = [
  { quantity: 1, price: 10, discount: '' },
  { quantity: 5, price: 50, discount: '省¥10' },
  { quantity: 10, price: 90, discount: '省¥20' },
  { quantity: 20, price: 160, discount: '省¥40' }
]

const totalPrice = computed(() => {
  const option = purchaseOptions.find(o => o.quantity === selectedQuantity.value)
  return option ? option.price : selectedQuantity.value * 10
})

onMounted(() => {
  if (!userStore.token) {
    alert('请先登录')
    router.push('/login')
    return
  }
  loadWallet()
  loadOrders()
})

const loadWallet = async () => {
  try {
    const res = await axios.get(
      '${import.meta.env.VITE_API_BASE_URL}/coupon/wallet',
      {
        headers: {
          'Authorization': `Bearer ${userStore.token}`
        }
      }
    )
    wallet.value = res.data.data
  } catch (error) {
    console.error('加载钱包失败:', error)
  }
}

const loadOrders = async () => {
  try {
    const res = await axios.get(
      '${import.meta.env.VITE_API_BASE_URL}/coupon/orders',
      {
        headers: {
          'Authorization': `Bearer ${userStore.token}`
        }
      }
    )
    orders.value = res.data.data || []
  } catch (error) {
    console.error('加载订单失败:', error)
  }
}

const handlePurchase = async () => {
  if (!confirm(`确认购买 ${selectedQuantity.value} 张询盘券，共 ¥${totalPrice.value} 吗？`)) {
    return
  }
  
  isLoading.value = true
  
  try {
    const res = await axios.post(
      '${import.meta.env.VITE_API_BASE_URL}/payment/create',
      { 
        quantity: selectedQuantity.value,
        amount: totalPrice.value 
      },
      {
        headers: {
          'Authorization': `Bearer ${userStore.token}`
        }
      }
    )
    
    alert('✅ 支付成功！已到账 ' + selectedQuantity.value + ' 张询盘券')
    
    // 刷新钱包和订单
    loadWallet()
    loadOrders()
  } catch (error) {
    console.error('支付错误:', error)
    alert('支付失败：' + (error.response?.data?.message || '未知错误'))
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.coupon-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 30px 20px;
}

.coupon-header {
  max-width: 800px;
  margin: 0 auto 30px;
  text-align: center;
}

.coupon-header h1 {
  color: #333;
  margin-bottom: 10px;
}

.subtitle {
  color: #666;
}

.coupon-content {
  max-width: 800px;
  margin: 0 auto;
}

.wallet-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 30px;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.balance-info {
  text-align: center;
  margin-bottom: 20px;
}

.balance-info .label {
  display: block;
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 10px;
}

.balance-info .balance {
  display: block;
  font-size: 48px;
  font-weight: bold;
}

.stats-row {
  display: flex;
  justify-content: space-around;
  padding-top: 20px;
  border-top: 1px solid rgba(255,255,255,0.2);
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 5px;
}

.stat-value {
  display: block;
  font-size: 20px;
  font-weight: 600;
}

.purchase-section {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  margin-bottom: 20px;
}

.purchase-section h2 {
  font-size: 18px;
  color: #333;
  margin-bottom: 20px;
}

.quantity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.quantity-card {
  padding: 20px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.quantity-card:hover {
  border-color: #67C23A;
}

.quantity-card.active {
  border-color: #67C23A;
  background-color: #f0f9ff;
}

.quantity {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.price {
  font-size: 16px;
  color: #67C23A;
  font-weight: 600;
}

.discount {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #f56c6c;
  color: white;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
}

.payment-info {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row.total {
  font-size: 18px;
  font-weight: bold;
  padding-top: 15px;
}

.total-price {
  color: #f56c6c;
  font-size: 24px;
}

.buy-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #67C23A 0%, #85ce61 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 30px;
}

.buy-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(103, 194, 58, 0.4);
}

.buy-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.records-section {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  margin-bottom: 20px;
}

.records-section h2 {
  font-size: 18px;
  color: #333;
  margin-bottom: 20px;
}

.empty-records {
  text-align: center;
  color: #999;
  padding: 30px;
}

.order-list {
  max-height: 300px;
  overflow-y: auto;
}

.order-item {
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
}

.order-item:last-child {
  border-bottom: none;
}

.order-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.order-no {
  font-weight: 600;
  color: #333;
}

.order-date {
  color: #999;
  font-size: 13px;
}

.order-detail {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.order-status {
  font-size: 13px;
}

.order-status.paid {
  color: #67C23A;
}

.usage-guide {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
}

.usage-guide h2 {
  font-size: 18px;
  color: #333;
  margin-bottom: 15px;
}

.usage-guide ul {
  list-style: none;
  padding: 0;
}

.usage-guide li {
  padding: 10px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  padding-left: 20px;
  position: relative;
}

.usage-guide li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #67C23A;
  font-weight: bold;
}
</style>