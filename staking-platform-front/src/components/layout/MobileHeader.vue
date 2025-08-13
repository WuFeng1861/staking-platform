<template>
  <div class="flex items-center justify-between">
    <!-- 左侧：Logo和菜单按钮 -->
    <div class="flex items-center">
      <button 
        class="p-2 rounded-lg hover:bg-light-surface dark:hover:bg-dark-surface mr-2"
        @click="toggleDrawer"
      >
        <Bars3Icon class="w-6 h-6 text-primary" />
      </button>
      
      <div class="text-xl font-bold text-gradient">NexaFi</div>
    </div>
    
    <!-- 右侧：钱包连接 -->
    <div>
      <!-- 钱包连接按钮 -->
      <button 
        v-if="!isConnected" 
        class="btn-primary text-sm px-4 py-2 flex items-center"
        @click="connectWallet"
        :disabled="isConnecting"
      >
        <WalletIcon class="w-4 h-4 mr-2" />
        {{ isConnecting ? t('common.loading') : t('wallet.connect') }}
      </button>
      
      <!-- 已连接钱包 -->
      <div v-else class="relative">
        <button 
          class="flex items-center px-3 py-2 rounded-lg border border-light-border dark:border-dark-border hover:bg-light-surface dark:hover:bg-dark-surface"
          @click="toggleNetworkDropdown"
        >
          <img 
            v-if="currentNetwork?.icon"
            :src="currentNetwork.icon" 
            :alt="currentNetwork.chainName"
            class="w-4 h-4 rounded-full mr-2 object-cover"
            @error="handleImageError"
          />
          <span class="text-primary mr-2">{{ currentNetwork?.chainName || 'Unsupported' }}</span>
          <ChevronDownIcon class="w-4 h-4 text-secondary" />
        </button>
        
        <!-- 钱包下拉菜单 -->
        <div 
          v-if="showWalletDropdown" 
          class="absolute top-full mt-2 right-0 bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border rounded-lg shadow-lg p-3 w-64 z-10"
        >
          <div class="mb-3">
            <div class="text-sm text-secondary">{{ t('wallet.address') }}</div>
            <div class="flex items-center justify-between">
              <div class="text-primary font-medium">{{ formatAddress }}</div>
              <button 
                class="text-nexafi-primary hover:text-nexafi-primary/80"
                @click="copyAddress"
              >
                <ClipboardDocumentIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div class="mb-3">
            <div class="text-sm text-secondary">{{ t('wallet.balance') }}</div>
            <div class="text-primary font-medium">
              {{ formattedBalance }} {{ currentNetwork?.symbol || 'ETH' }}
            </div>
          </div>
          
          <div class="mb-3">
            <div class="text-sm text-secondary">{{ t('wallet.network') }}</div>
            <select 
              class="input-field mt-1 py-2"
              @change="switchToNetwork($event.target.value)"
            >
              <option 
                v-for="network in networks" 
                :key="network.chainId"
                :value="network.chainId"
                :selected="network.chainId === chainId"
              >
                {{ network.icon }} {{ network.name }}
              </option>
            </select>
          </div>
          
          <button 
            class="w-full btn-secondary mt-2"
            @click="disconnectWallet"
          >
            {{ t('wallet.disconnect') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { useWallet } from '@/composables/useWallet'
import { NETWORKS } from '@/config'
import { 
  Bars3Icon,
  WalletIcon,
  ClipboardDocumentIcon
} from '@heroicons/vue/24/outline'

const { t } = useI18n()
const { 
  isConnected, 
  isConnecting,
  connectWallet, 
  disconnectWallet,
  formatAddress, 
  formattedBalance,
  currentNetwork,
  switchNetwork,
  chainId,
  address
} = useWallet()

// 网络列表
const networks = Object.values(NETWORKS)

// 下拉菜单状态
const showWalletDropdown = ref(false)

// 切换钱包下拉菜单
const toggleWalletDropdown = () => {
  showWalletDropdown.value = !showWalletDropdown.value
}

// 切换网络
const switchToNetwork = async (chainId) => {
  try {
    await switchNetwork(Number(chainId))
    showWalletDropdown.value = false
  } catch (error) {
    console.error('Failed to switch network:', error)
  }
}

// 复制地址
const copyAddress = () => {
  if (isConnected.value) {
    navigator.clipboard.writeText(address.value)
    showWalletDropdown.value = false
  }
}

// 触发侧边栏抽屉
const toggleDrawer = () => {
  // 通过事件总线或状态管理触发抽屉
  document.dispatchEvent(new CustomEvent('toggle-drawer'))
}
</script>