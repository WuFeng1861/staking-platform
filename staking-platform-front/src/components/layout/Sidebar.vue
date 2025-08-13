<template>
  <div class="h-full flex flex-col">
    <!-- Logo -->
    <div class="p-6 flex items-center">
      <div class="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden mr-3">
        <img 
          src="https://wufeng98.cn/imgServerApi/images/ef9ac546-c8c7-4d49-a8e2-24c98c962023.png"
          alt="NexaFi"
          class="w-10 h-10 object-cover rounded-lg"
          @error="handleImageError"
        />
      </div>
      <div class="text-2xl font-bold text-gradient">NexaFi</div>
    </div>
    
    <!-- 导航菜单 -->
    <nav class="flex-1 px-3 py-4 space-y-1">
      <router-link 
        v-for="item in navItems" 
        :key="item.path" 
        :to="item.path" 
        class="nav-item"
        :class="{ 'active': $route.path === item.path }"
      >
        <component :is="item.icon" class="w-5 h-5 mr-3" />
        <span>{{ t(`nav.${item.key}`) }}</span>
      </router-link>
    </nav>
    
    <!-- 用户信息 -->
    <div class="p-4 border-t border-light-border dark:border-dark-border">
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
    
    <!-- 底部设置 -->
    <div class="p-4 border-t border-light-border dark:border-dark-border">
      <div class="flex items-center justify-between">
        <!-- 主题切换 -->
        <button 
          class="p-2 rounded-lg hover:bg-light-surface dark:hover:bg-dark-surface"
          @click="toggleTheme"
        >
          <SunIcon v-if="isDark" class="w-5 h-5 text-primary" />
          <MoonIcon v-else class="w-5 h-5 text-primary" />
        </button>
        
        <!-- 语言切换 -->
        <div class="relative">
          <button 
            class="p-2 rounded-lg hover:bg-light-surface dark:hover:bg-dark-surface flex items-center"
            @click="toggleLanguageDropdown"
          >
            <span class="mr-1">{{ currentLanguage === 'en' ? '🇺🇸' : '🇨🇳' }}</span>
            <span class="text-sm text-primary">{{ currentLanguage.toUpperCase() }}</span>
          </button>
          
          <div 
            v-if="showLanguageDropdown" 
            class="absolute bottom-full mb-2 right-0 bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border rounded-lg shadow-lg p-2 w-24"
          >
            <button 
              class="w-full p-2 text-left flex items-center hover:bg-light-surface dark:hover:bg-dark-surface rounded-md text-light-text dark:text-dark-text"
              @click="changeLanguage('en')"
            >
              <span class="mr-2">🇺🇸</span> English
            </button>
            <button 
              class="w-full p-2 text-left flex items-center hover:bg-light-surface dark:hover:bg-dark-surface rounded-md text-light-text dark:text-dark-text"
              @click="changeLanguage('zh')"
            >
              <span class="mr-2">🇨🇳</span> 中文
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { useI18n } from '@/composables/useI18n'
import { useWallet } from '@/composables/useWallet'
import { 
  HomeIcon, 
  CurrencyDollarIcon, 
  ClockIcon, 
  ChartBarIcon, 
  UserIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const route = useRoute()

const { theme, isDark, toggleTheme } = useTheme()
const { t, currentLanguage, setLanguage } = useI18n()
const { 
  isConnected, 
  connectWallet, 
  formatAddress, 
  formattedBalance,
  currentNetwork
} = useWallet()

// 导航项
const navItems = [
  { key: 'dashboard', path: '/', icon: HomeIcon },
  { key: 'staking', path: '/staking', icon: CurrencyDollarIcon },
  { key: 'history', path: '/history', icon: ClockIcon },
  { key: 'rewards', path: '/rewards', icon: ChartBarIcon }
]

// 语言下拉菜单
const showLanguageDropdown = ref(false)

const toggleLanguageDropdown = () => {
  showLanguageDropdown.value = !showLanguageDropdown.value
}

const changeLanguage = (lang) => {
  setLanguage(lang)
  showLanguageDropdown.value = false
}

// 图片加载错误处理
const handleImageError = (event) => {
  // 如果图片加载失败，使用默认的NexaFi图片或显示文字
  event.target.style.display = 'none'
}
</script>