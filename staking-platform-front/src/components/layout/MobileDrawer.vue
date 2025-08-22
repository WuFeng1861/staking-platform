<template>
  <Transition name="drawer">
    <div v-if="isOpen" class="fixed inset-0 z-50 lg:hidden">
      <!-- 背景遮罩 -->
      <div 
        class="absolute inset-0 bg-black bg-opacity-50"
        @click="closeDrawer"
      ></div>
      
      <!-- 抽屉内容 -->
      <div class="absolute top-0 left-0 w-64 h-full bg-light-background dark:bg-dark-background shadow-xl flex flex-col">
        <!-- 抽屉头部 -->
        <div class="p-4 border-b border-light-border dark:border-dark-border flex items-center justify-between">
          <div class="text-xl font-bold text-gradient">NexaFi</div>
          <button 
            class="p-2 rounded-lg hover:bg-light-surface dark:hover:bg-dark-surface"
            @click="closeDrawer"
          >
            <XMarkIcon class="w-5 h-5 text-primary" />
          </button>
        </div>
        
        <!-- 用户信息 -->
        <div class="p-4 border-b border-light-border dark:border-dark-border">
          <div v-if="isConnected" class="card-surface p-3">
            <div class="flex items-center">
              <div class="w-10 h-10 rounded-full bg-nexafi-primary/20 flex items-center justify-center text-nexafi-primary">
                <UserIcon class="w-5 h-5" />
              </div>
              <div class="ml-3">
                <div class="text-sm font-medium text-primary">{{ formatAddress }}</div>
                <div class="text-xs text-secondary">{{ formattedBalance }} {{ currentNetwork?.symbol || 'ETH' }}</div>
              </div>
            </div>
          </div>
          <button 
            v-else 
            class="btn-primary w-full mt-2"
            @click="connectWallet"
          >
            {{ t('wallet.connect') }}
          </button>
        </div>
        
        <!-- 导航菜单 -->
        <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <router-link 
            v-for="item in navItems" 
            :key="item.path" 
            :to="item.path" 
            class="nav-item"
            :class="{ 'active': currentRoute === item.path }"
            @click="closeDrawer"
          >
            <component :is="item.icon" class="w-5 h-5 mr-3" />
            <span>{{ t(`nav.${item.key}`) }}</span>
          </router-link>
        </nav>
        
        <!-- 邀请链接和绑定上级 -->
        <div class="p-4 border-t border-light-border dark:border-dark-border space-y-3">
          <button 
            class="btn-outline w-full flex items-center justify-center text-sm"
            @click="copyReferralLink"
          >
            <LinkIcon class="w-4 h-4 mr-2" />
            {{ t('referral.inviteFriends') }}
          </button>
          
          <button 
            class="btn-outline-secondary w-full flex items-center justify-center text-sm"
            @click="openBindReferrerModal"
            v-if="!hasReferrer"
          >
            <UserPlusIcon class="w-4 h-4 mr-2" />
            {{t('referral.bindReferrer')}}
          </button>
          
          <!-- 复制成功提示 -->
          <div 
            v-if="showCopiedMessage" 
            class="mt-2 text-sm text-light-success dark:text-dark-success flex items-center justify-center"
          >
            <CheckCircleIcon class="w-4 h-4 mr-1" />
            {{ t('common.copied') }}
          </div>
        </div>
        
        <!-- 底部设置 -->
        <div class="p-4 border-t border-light-border dark:border-dark-border">
          <div class="flex items-center justify-between">
            <!-- 主题切换 -->
            <button 
              class="p-2 rounded-lg hover:bg-light-surface dark:hover:bg-dark-surface flex items-center"
              @click="toggleTheme"
            >
              <SunIcon v-if="isDark" class="w-5 h-5 text-primary mr-2" />
              <MoonIcon v-else class="w-5 h-5 text-primary mr-2" />
              <span class="text-primary">{{ isDark ? t('theme.light') : t('theme.dark') }}</span>
            </button>
            
            <!-- 语言切换 -->
            <button 
              class="p-2 rounded-lg hover:bg-light-surface dark:hover:bg-dark-surface flex items-center"
              @click="toggleLanguage"
            >
              <span class="mr-2">{{ currentLanguage === 'en' ? '🇺🇸' : '🇨🇳' }}</span>
              <span class="text-primary">{{ currentLanguage === 'en' ? '中文' : 'English' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { useI18n } from '@/composables/useI18n'
import { useWallet } from '@/composables/useWallet'
import { STORAGE_KEYS } from '@/config'
import { 
  HomeIcon, 
  CurrencyDollarIcon, 
  ClockIcon, 
  ChartBarIcon, 
  UserIcon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  LinkIcon,
  CheckCircleIcon,
  UserPlusIcon
} from '@heroicons/vue/24/outline'

const { theme, isDark, toggleTheme } = useTheme()
const { t, currentLanguage, setLanguage } = useI18n()
const { 
  isConnected, 
  connectWallet, 
  formatAddress, 
  address,
  formattedBalance,
  currentNetwork
} = useWallet()

// 抽屉状态
const isOpen = ref(false)

// 导航项
const navItems = [
  { key: 'dashboard', path: '/', icon: HomeIcon },
  { key: 'staking', path: '/staking', icon: CurrencyDollarIcon },
  { key: 'history', path: '/history', icon: ClockIcon },
  { key: 'rewards', path: '/rewards', icon: ChartBarIcon }
]

// 当前路由（实际项目中应该使用vue-router的useRoute）
const currentRoute = ref('/')

// 复制提示状态
const showCopiedMessage = ref(false)

// 推荐人相关
const hasReferrer = ref(false)
const referrerAddress = ref('')

// 获取当前用户的推荐人信息
const checkReferrerStatus = () => {
  if (!isConnected.value || !address.value) return;
  
  // 获取存储的推荐人映射
  const storedReferrers = localStorage.getItem(STORAGE_KEYS.REFERRERS_MAP);
  if (storedReferrers) {
    try {
      const referrersMap = JSON.parse(storedReferrers);
      const userAddress = address.value.toLowerCase();
      
      // 检查当前用户是否有推荐人
      if (referrersMap[userAddress]) {
        hasReferrer.value = true;
        referrerAddress.value = referrersMap[userAddress];
        return;
      }
      hasReferrer.value = false;
      referrerAddress.value = '';
    } catch (error) {
      console.error('Error parsing referrers map:', error);
    }
  }
}

// 打开抽屉
const openDrawer = () => {
  isOpen.value = true
  document.body.classList.add('overflow-hidden')
}

// 关闭抽屉
const closeDrawer = () => {
  isOpen.value = false
  document.body.classList.remove('overflow-hidden')
}

// 切换语言
const toggleLanguage = () => {
  setLanguage(currentLanguage.value === 'en' ? 'zh' : 'en')
}

// 复制邀请链接
const copyReferralLink = () => {
  const referralLink = `https://nexafi.com/ref/${isConnected.value ? address.value : 'join'}`
  navigator.clipboard.writeText(referralLink)
  showCopiedMessage.value = true
  setTimeout(() => {
    showCopiedMessage.value = false
  }, 2000)
}

// 打开绑定上级模态框
const openBindReferrerModal = () => {
  // 发送自定义事件，通知父组件打开模态框
  document.dispatchEvent(new CustomEvent('open-bind-referrer-modal'))
  // 关闭抽屉
  closeDrawer()
}

// 监听抽屉切换事件
onMounted(() => {
  document.addEventListener('toggle-drawer', toggleDrawer)
  
  // 检查是否已绑定推荐人
  checkReferrerStatus();
  
  // 监听钱包连接状态变化
  window.addEventListener('wallet-connected', checkReferrerStatus);
  window.addEventListener('wallet-disconnected', () => {
    hasReferrer.value = false;
    referrerAddress.value = '';
  });
})

onUnmounted(() => {
  document.removeEventListener('toggle-drawer', toggleDrawer)
})

// 切换抽屉状态
const toggleDrawer = () => {
  if (isOpen.value) {
    closeDrawer()
  } else {
    openDrawer()
  }
}
</script>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: all 0.3s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from > div:last-child,
.drawer-leave-to > div:last-child {
  transform: translateX(-100%);
}
</style>