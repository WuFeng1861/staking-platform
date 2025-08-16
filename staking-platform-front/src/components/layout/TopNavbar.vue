<template>
  <div class="flex items-center justify-between">
    <!-- 左侧：邀请链接和绑定上级 -->
    <div class="flex items-center space-x-3">
      <button 
        class="btn-outline flex items-center text-sm"
        @click="copyReferralLink"
      >
        <LinkIcon class="w-4 h-4 mr-2" />
        {{ t('referral.inviteFriends') }}
      </button>
      
      <button 
        class="btn-outline-secondary flex items-center text-sm"
        @click="openBindReferrerModal"
      >
        <UserPlusIcon class="w-4 h-4 mr-2" />
        {{ hasReferrer ? t('referral.changeReferrer') : t('referral.bindReferrer') }}
      </button>
      
      <!-- 复制成功提示 -->
      <div 
        v-if="showCopiedMessage" 
        class="ml-3 text-sm text-light-success dark:text-dark-success flex items-center"
      >
        <CheckCircleIcon class="w-4 h-4 mr-1" />
        {{ t('common.copied') }}
      </div>
    </div>
    
    <!-- 右侧：钱包连接 -->
    <div class="flex items-center">
      <!-- 网络选择器 -->
      <div class="relative mr-4" v-if="isConnected">
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
        
        <!-- 网络下拉菜单 -->
        <div 
          v-if="showNetworkDropdown" 
          class="absolute top-full mt-2 right-0 bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border rounded-lg shadow-lg p-2 w-48 z-10"
        >
          <button 
            v-for="network in networks" 
            :key="network.chainId"
            class="w-full p-2 text-left flex items-center hover:bg-light-surface dark:hover:bg-dark-surface rounded-md"
            @click="switchToNetwork(network.chainId)"
          >
            <img 
              :src="network.icon" 
              :alt="network.chainName"
              class="w-4 h-4 rounded-full mr-2 object-cover"
              @error="handleImageError"
            />
            <span class="text-primary">{{ network.chainName }}</span>
          </button>
        </div>
      </div>
      
      <!-- 钱包连接按钮 -->
      <button 
        v-if="!isConnected" 
        class="btn-primary flex items-center"
        @click="connectWallet"
        :disabled="isConnecting"
      >
        <WalletIcon class="w-5 h-5 mr-2" />
        {{ isConnecting ? t('common.loading') : t('wallet.connect') }}
      </button>
      
      <!-- 已连接钱包 -->
      <div v-else class="relative">
        <button 
          class="flex items-center px-3 py-2 rounded-lg bg-nexafi-primary/10 hover:bg-nexafi-primary/20 text-nexafi-primary"
          @click="toggleWalletDropdown"
        >
          <WalletIcon class="w-5 h-5 mr-2" />
          <span>{{ formatAddress }}</span>
          <ChevronDownIcon class="w-4 h-4 ml-2" />
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
              {{ formattedBalance }} {{ currentNetwork?.nativeCurrency?.symbol || 'ETH' }}
            </div>
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
import { ref, computed, onMounted } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { useWallet } from '@/composables/useWallet'
import { NETWORKS, STORAGE_KEYS } from '@/config'
import { 
  LinkIcon, 
  WalletIcon, 
  ChevronDownIcon, 
  ClipboardDocumentIcon,
  CheckCircleIcon,
  UserPlusIcon
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
  switchNetwork
} = useWallet()

// 网络列表
const networks = Object.values(NETWORKS)

// 下拉菜单状态
const showNetworkDropdown = ref(false)
const showWalletDropdown = ref(false)
const showCopiedMessage = ref(false)

// 推荐人相关
const hasReferrer = ref(false)
const referrerAddress = ref('')
const isBindReferrerModalOpen = ref(false)

// 切换网络下拉菜单
const toggleNetworkDropdown = () => {
  showNetworkDropdown.value = !showNetworkDropdown.value
  if (showNetworkDropdown.value) {
    showWalletDropdown.value = false
  }
}

// 切换钱包下拉菜单
const toggleWalletDropdown = () => {
  showWalletDropdown.value = !showWalletDropdown.value
  if (showWalletDropdown.value) {
    showNetworkDropdown.value = false
  }
}

// 切换网络
const switchToNetwork = async (chainId) => {
  try {
    console.log('TopNavbar: Switching to network with chainId:', chainId);
    await switchNetwork(chainId)
    console.log('TopNavbar: Network switched, current network:', currentNetwork.value);
    showNetworkDropdown.value = false
  } catch (error) {
    console.error('Failed to switch network:', error)
  }
}

// 复制地址
const copyAddress = () => {
  if (isConnected.value) {
    navigator.clipboard.writeText(address.value)
    showCopiedMessage.value = true
    setTimeout(() => {
      showCopiedMessage.value = false
    }, 2000)
  }
}

// 复制邀请链接
const copyReferralLink = () => {
  const referralLink = `https://nexafi.com/ref/${isConnected.value ? formatAddress.value : 'join'}`
  navigator.clipboard.writeText(referralLink)
  showCopiedMessage.value = true
  setTimeout(() => {
    showCopiedMessage.value = false
  }, 2000)
}

// 图片加载错误处理
const handleImageError = (event) => {
  // 如果图片加载失败，使用默认的ETH图片
  event.target.src = 'https://wufeng98.cn/imgServerApi/images/1bae875e-951d-4fb6-9967-a7c12b326adf.png'
}

// 打开绑定上级模态框
const openBindReferrerModal = () => {
  // 发送自定义事件，通知父组件打开模态框
  document.dispatchEvent(new CustomEvent('open-bind-referrer-modal'))
}

// 组件挂载时检查是否已绑定推荐人
onMounted(() => {
  // 检查是否已绑定推荐人
  const savedReferrer = localStorage.getItem(STORAGE_KEYS.REFERRER_ADDRESS)
  if (savedReferrer) {
    hasReferrer.value = true
    referrerAddress.value = savedReferrer
  }
})
</script>