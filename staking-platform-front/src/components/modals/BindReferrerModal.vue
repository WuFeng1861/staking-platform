<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- 背景遮罩 -->
    <div class="absolute inset-0 bg-black bg-opacity-50" @click="close"></div>
    
    <!-- 模态框内容 -->
    <div class="relative bg-light-background dark:bg-dark-background rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
      <!-- 标题栏 -->
      <div class="flex justify-between items-center p-4 border-b border-light-border dark:border-dark-border">
        <h3 class="text-lg font-semibold text-primary">{{ hasReferrer ? t('referral.changeReferrer') : t('referral.bindReferrer') }}</h3>
        <button @click="close" class="text-secondary hover:text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- 内容区域 -->
      <div class="p-6">
        <div v-if="hasReferrer" class="mb-4">
          <div class="text-sm text-secondary mb-1">{{ t('referral.currentReferrer') }}</div>
          <div class="text-primary font-medium">{{ formatAddress(currentReferrer) }}</div>
        </div>
        
        <div class="mb-6">
          <label class="block text-sm text-secondary mb-2">{{ t('referral.enterReferrerAddress') }}</label>
          <input 
            type="text" 
            v-model="referrerInput"
            class="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-primary focus:outline-none focus:ring-2 focus:ring-nexafi-primary"
            :placeholder="t('referral.addressPlaceholder')"
          />
          <div v-if="error" class="text-light-error dark:text-dark-error text-sm mt-1">{{ error }}</div>
        </div>
        
        <div class="text-sm text-secondary mb-4">
          <p>{{ t('referral.bindDescription') }}</p>
          <ul class="list-disc pl-5 mt-2 space-y-1">
            <li>{{ t('referral.ethReward') }}</li>
            <li>{{ t('referral.bnbReward') }}</li>
            <li>{{ t('referral.usdtReward') }}</li>
            <li>{{ t('referral.nexafiReward') }}</li>
          </ul>
        </div>
        
        <div class="flex space-x-3">
          <button 
            class="btn-primary flex-1"
            @click="bindReferrer"
            :disabled="!isValidAddress || isLoading"
          >
            <span v-if="isLoading" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ t('common.processing') }}
            </span>
            <span v-else>{{ hasReferrer ? t('referral.change') : t('referral.bind') }}</span>
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
import { REFERRAL_CONFIG, STORAGE_KEYS } from '@/config'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  currentReferrer: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'bind'])

const { t } = useI18n()

// 状态变量
const referrerInput = ref('')
const error = ref('')
const isLoading = ref(false)
const hasReferrer = computed(() => !!props.currentReferrer)

// 监听模态框打开，重置输入
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    referrerInput.value = ''
    error.value = ''
  }
})

// 检查地址是否有效
const isValidAddress = computed(() => {
  if (!referrerInput.value) return false
  
  // 简单的以太坊地址验证（以0x开头，长度为42）
  const isValidFormat = /^0x[a-fA-F0-9]{40}$/.test(referrerInput.value)
  
  // 不能绑定自己为推荐人
  const userAddress = localStorage.getItem(STORAGE_KEYS.WALLET_ADDRESS)
  const notSelf = referrerInput.value.toLowerCase() !== userAddress?.toLowerCase()
  
  return isValidFormat && notSelf
})

// 格式化地址显示
const formatAddress = (address) => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// 绑定推荐人
const bindReferrer = async () => {
  if (!isValidAddress.value) {
    error.value = t('referral.invalidAddress')
    return
  }
  
  try {
    isLoading.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 保存到本地存储（实际项目中应该调用API或智能合约）
    localStorage.setItem(STORAGE_KEYS.REFERRER_ADDRESS, referrerInput.value)
    
    // 通知父组件
    emit('bind', referrerInput.value)
    
    // 关闭模态框
    close()
  } catch (err) {
    console.error('Failed to bind referrer:', err)
    error.value = t('common.errorOccurred')
  } finally {
    isLoading.value = false
  }
}

// 关闭模态框
const close = () => {
  emit('close')
}
</script>