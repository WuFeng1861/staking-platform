<template>
  <div class="token-balances-container">
    <div class="flex items-center justify-between p-3 bg-light-surface dark:bg-dark-surface rounded-lg border border-light-border dark:border-dark-border">
      <div class="text-sm text-secondary">{{ t('wallet.yourBalances') }}</div>
      <div v-if="tokenBalances.isLoading" class="flex items-center">
        <div class="animate-spin h-4 w-4 border-2 border-nexafi-primary border-t-transparent rounded-full mr-2"></div>
        <span class="text-sm text-secondary">{{ t('common.loading') }}</span>
      </div>
    </div>
    
    <div class="grid grid-cols-3 gap-3 mt-3">
      <div 
        v-for="(token, index) in displayTokens" 
        :key="index" 
        class="p-3 bg-light-surface dark:bg-dark-surface rounded-lg border border-light-border dark:border-dark-border"
      >
        <div class="flex items-center mb-2">
          <img 
            :src="token.icon" 
            :alt="token.symbol"
            class="w-6 h-6 rounded-full mr-2 object-cover"
            @error="handleImageError"
          />
          <span class="text-primary font-medium">{{ token.symbol }}</span>
        </div>
        <div class="text-lg font-bold text-primary">{{ token.balance }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useWallet } from '@/composables/useWallet'
import { useI18n } from '@/composables/useI18n'
import { tokenBalances, fetchTokenBalances, getCurrentChainTokens } from '@/data/tokenBalances'

const { t } = useI18n()
const { isConnected, chainId } = useWallet()

// 显示的代币数据
const displayTokens = computed(() => {
  return getCurrentChainTokens()
})

// 图片加载错误处理
const handleImageError = (event) => {
  // 如果图片加载失败，使用默认的ETH图片
  event.target.src = 'https://wufeng98.cn/imgServerApi/images/1bae875e-951d-4fb6-9967-a7c12b326adf.png'
}

// 监听钱包连接状态和链ID变化
watch([isConnected, chainId], () => {
  if (isConnected.value) {
    fetchTokenBalances()
  }
})

// 组件挂载时获取余额
onMounted(() => {
  if (isConnected.value) {
    fetchTokenBalances()
  }
})
</script>
