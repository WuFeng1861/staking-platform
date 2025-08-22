<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- 背景遮罩 -->
    <div class="absolute inset-0 bg-black bg-opacity-50" @click="close"></div>
    
    <!-- 模态框内容 -->
    <div class="relative bg-light-background dark:bg-dark-background rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
      <!-- 标题栏 -->
      <div class="flex justify-between items-center p-4 border-b border-light-border dark:border-dark-border">
        <h3 class="text-lg font-semibold text-primary">{{ t('referral.bindReferrer') }}</h3>
        <button @click="close" class="text-secondary hover:text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- 内容区域 -->
      <div class="p-6">
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
            <span v-else>{{ t('referral.bind') }}</span>
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
import { STORAGE_KEYS } from '@/config'
import { ethers } from 'ethers'
import contractInteractions from '@/utils/contractInteractions'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'bind'])

const { t } = useI18n()

// 状态变量
const referrerInput = ref('')
const error = ref('')
const isLoading = ref(false)

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
  
  // 使用 ethers 检查地址是否有效
  const isValidFormat = ethers.isAddress(referrerInput.value)
  
  // 不能绑定自己为推荐人
  const userAddress = localStorage.getItem(STORAGE_KEYS.WALLET_ADDRESS)
  const notSelf = referrerInput.value.toLowerCase() !== userAddress?.toLowerCase()
  
  if (!isValidFormat) {
    error.value = t('referral.invalidAddress')
    return false
  }
  
  if (!notSelf) {
    error.value = t('referral.cannotBindSelf')
    return false
  }
  
  error.value = ''
  return true
})

// 保存推荐人信息到本地存储
const saveReferrerToStorage = (userAddress, referrerAddress) => {
  try {
    // 获取现有的推荐人映射关系
    let referrersMap = {}
    const storedReferrers = localStorage.getItem(STORAGE_KEYS.REFERRERS_MAP)
    
    if (storedReferrers) {
      referrersMap = JSON.parse(storedReferrers)
    }
    
    // 更新当前用户的推荐人
    referrersMap[userAddress.toLowerCase()] = referrerAddress.toLowerCase()
    
    // 保存回本地存储
    localStorage.setItem(STORAGE_KEYS.REFERRERS_MAP, JSON.stringify(referrersMap))
    
    return true
  } catch (error) {
    console.error('Failed to save referrer to storage:', error)
    return false
  }
}

// 绑定推荐人
const bindReferrer = async () => {
  if (!isValidAddress.value) {
    error.value = t('referral.invalidAddress')
    return
  }
  
  try {
    isLoading.value = true
    
    // 调用合约绑定上级
    const result = await contractInteractions.bindReferrer(referrerInput.value)
    
    if (result && result.success) {
      // 获取当前用户地址
      const userAddress = localStorage.getItem(STORAGE_KEYS.WALLET_ADDRESS)
      
      if (!userAddress) {
        throw new Error('User wallet address not found')
      }
      
      // 保存到本地存储（使用新的对象格式）
      saveReferrerToStorage(userAddress, referrerInput.value)
      
      // 通知父组件
      emit('bind', referrerInput.value)
      
      // 关闭模态框
      close()
    } else {
      throw new Error(result?.error || t('common.errorOccurred'))
    }
  } catch (err) {
    console.error('Failed to bind referrer:', err)
    error.value = err.message || t('common.errorOccurred')
  } finally {
    isLoading.value = false
  }
}

// 关闭模态框
const close = () => {
  emit('close')
}
</script>