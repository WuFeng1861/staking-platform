<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- 背景遮罩 -->
    <div class="absolute inset-0 bg-black bg-opacity-50" @click="close"></div>
    
    <!-- 模态框内容 -->
    <div class="relative bg-light-background dark:bg-dark-background rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
      <!-- 标题栏 -->
      <div class="flex justify-between items-center p-4 border-b border-light-border dark:border-dark-border">
        <h3 class="text-lg font-semibold text-primary">{{ t('staking.stakeToken', { token: pool.token }) }}</h3>
        <button @click="close" class="text-secondary hover:text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- 内容区域 -->
      <div class="p-6">
        <!-- 池信息 -->
        <div class="flex items-center mb-4">
          <div class="w-10 h-10 rounded-full bg-nexafi-primary/20 flex items-center justify-center overflow-hidden">
            <img 
              :src="pool.tokenInfo.icon" 
              :alt="pool.token"
              class="w-8 h-8 rounded-full object-cover"
              @error="handleImageError"
            />
          </div>
          <div class="ml-3">
            <div class="font-medium text-primary">{{ pool.name }}</div>
            <div class="text-sm text-secondary">{{ pool.apy }}% APY</div>
          </div>
        </div>
        
        <!-- 余额信息 -->
        <div class="mb-4 p-3 bg-light-surface dark:bg-dark-surface rounded-lg">
          <div class="flex justify-between items-center">
            <div class="text-sm text-secondary">{{ t('wallet.balance') }}</div>
            <div class="text-primary font-medium">{{ formattedBalance }} {{ pool.token }}</div>
          </div>
        </div>
        
        <!-- 质押金额输入 -->
        <div class="mb-6">
          <label class="block text-sm text-secondary mb-2">{{ t('staking.amount') }}</label>
          <div class="relative">
          <input 
            type="number" 
            v-model="stakeAmount"
            class="w-full px-4 py-3 pr-16 rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-primary focus:outline-none focus:ring-2 focus:ring-nexafi-primary"
            :placeholder="t('staking.enterAmount')"
            step="any"
          />
            <div class="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary font-medium">
              {{ pool.token }}
            </div>
          </div>
          
          <!-- 错误提示 -->
          <div v-if="error" class="text-light-error dark:text-dark-error text-sm mt-1">{{ error }}</div>
        </div>
        
        <!-- 快速选择按钮 -->
        <div class="grid grid-cols-5 gap-2 mb-6">
          <button 
            v-for="(amount, index) in quickSelectAmounts" 
            :key="index"
            class="px-2 py-1 text-sm rounded-md border border-light-border dark:border-dark-border hover:bg-light-surface dark:hover:bg-dark-surface text-primary dark:text-white"
            :class="{'bg-nexafi-primary border-nexafi-primary text-white': stakeAmount === amount}"
            @click="stakeAmount = amount"
          >
            {{ amount }}
          </button>
        </div>
        
        <!-- 质押信息 -->
        <div class="mb-6 p-3 bg-light-surface dark:bg-dark-surface rounded-lg space-y-2">
          <div class="flex justify-between items-center">
            <div class="text-sm text-secondary">{{ t('staking.lockPeriod') }}</div>
            <div class="text-primary">
              {{ pool.lockPeriod > 0 ? `${pool.lockPeriod} ${t('staking.days')}` : t('staking.flexible') }}
            </div>
          </div>
          <div class="flex justify-between items-center">
            <div class="text-sm text-secondary">{{ t('staking.estimatedRewards') }}</div>
            <div class="text-primary font-medium">
              {{ calculateEstimatedRewards() }} {{ pool.token }} / {{ t('staking.year') }}
            </div>
          </div>
        </div>
        
        <!-- 按钮 -->
        <div class="flex space-x-3">
          <button 
            class="btn-primary flex-1"
            @click="stake"
            :disabled="!isValidAmount || isLoading"
          >
            <span v-if="isLoading" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ t('common.processing') }}
            </span>
            <span v-else>{{ t('staking.stake') }}</span>
          </button>
          <button 
            class="btn-secondary flex-1"
            @click="close"
            :disabled="isLoading"
          >
            {{ t('common.cancel') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { useWallet } from '@/composables/useWallet'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  pool: {
    type: Object,
    default: () => ({
      id: '',
      name: '',
      token: '',
      tokenInfo: { icon: '' },
      apy: 0
    })
  },
  balance: {
    type: String,
    default: '0'
  }
})

const emit = defineEmits(['close', 'stake'])

const { t } = useI18n()
const { formatAddress } = useWallet()

// 状态变量
const stakeAmount = ref('')
const error = ref('')
const isLoading = ref(false)

// 格式化余额
const formattedBalance = computed(() => {
  const bal = parseFloat(props.balance)
  if (bal === 0) return '0'
  if (bal < 0.0001) return '< 0.0001'
  return bal.toFixed(4)
})

// 用户余额
const userBalance = computed(() => {
  return parseFloat(props.balance)
})

// 快速选择金额
const quickSelectAmounts = computed(() => {
  const token = props.pool.token
  
  switch (token) {
    case 'ETH':
      return [0.027, 0.135, 0.27, 0.54, 1.35]
    case 'BNB':
      return [0.125, 0.625, 1.25, 2.5, 6.25]
    case 'USDT':
      return [100, 500, 1000, 2000, 5000]
    case 'NexaFi':
      return [10000, 50000, 100000, 200000, 500000]
    default:
      return [1, 5, 10, 20, 50]
  }
})

// 检查金额是否有效
const isValidAmount = computed(() => {
  if (!stakeAmount.value) return false
  
  const amount = parseFloat(stakeAmount.value)
  return amount > 0 && amount <= parseFloat(props.balance)
})

// 计算预估奖励
const calculateEstimatedRewards = () => {
  if (!stakeAmount.value) return '0'
  
  const amount = parseFloat(stakeAmount.value)
  const annualReward = amount * (props.pool.apy / 100)
  return annualReward.toFixed(4)
}

// 监听模态框打开，重置输入
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    stakeAmount.value = ''
    error.value = ''
  }
})

// 质押
const stake = async () => {
  if (!isValidAmount.value) {
    if (!stakeAmount.value) {
      error.value = t('errors.enterAmount')
    } else if (parseFloat(stakeAmount.value) <= 0) {
      error.value = t('errors.invalidAmount')
    } else if (parseFloat(stakeAmount.value) > parseFloat(props.balance)) {
      error.value = t('errors.insufficientBalance')
    }
    return
  }
  
  try {
    isLoading.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 通知父组件
    emit('stake', {
      poolId: props.pool.id,
      amount: parseFloat(stakeAmount.value)
    })
    
    // 关闭模态框
    close()
  } catch (err) {
    console.error('Failed to stake:', err)
    error.value = t('errors.stakingFailed')
  } finally {
    isLoading.value = false
  }
}

// 图片加载错误处理
const handleImageError = (event) => {
  // 如果图片加载失败，使用默认的ETH图片
  event.target.src = 'https://wufeng98.cn/imgServerApi/images/1bae875e-951d-4fb6-9967-a7c12b326adf.png'
}

// 关闭模态框
const close = () => {
  emit('close')
}
</script>