<template>
  <div class="container-main">
    <!-- 绑定上级模态框 -->
    <BindReferrerModal 
      :is-open="isBindReferrerModalOpen" 
      :current-referrer="referrerAddress"
      @close="isBindReferrerModalOpen = false"
      @bind="handleReferrerBound"
    />
    <!-- PC端布局 -->
    <div class="hidden lg:flex h-screen">
      <!-- 左侧边栏 -->
      <aside class="sidebar w-64 flex-shrink-0">
        <Sidebar />
      </aside>
      
      <!-- 主内容区域 -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- 顶部导航栏 -->
        <header class="bg-light-surface dark:bg-dark-surface border-b border-light-border dark:border-dark-border px-6 py-4">
          <TopNavbar />
        </header>
        
        <!-- 主要内容 -->
        <main class="flex-1 overflow-auto p-6">
          <router-view />
        </main>
      </div>
    </div>
    
    <!-- 移动端布局 -->
    <div class="lg:hidden flex flex-col h-screen">
      <!-- 移动端顶部导航 -->
      <header class="bg-light-surface dark:bg-dark-surface border-b border-light-border dark:border-dark-border px-4 py-3">
        <MobileHeader />
      </header>
      
      <!-- 移动端主内容 -->
      <main class="flex-1 overflow-auto p-4">
        <router-view />
      </main>
      
      <!-- 移动端底部导航 -->
      <footer class="bg-light-surface dark:bg-dark-surface border-t border-light-border dark:border-dark-border">
        <MobileNavigation />
      </footer>
    </div>
    
    <!-- 移动端侧边栏抽屉 -->
    <MobileDrawer />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { useI18n } from '@/composables/useI18n'
import { useWallet } from '@/composables/useWallet'
import { STORAGE_KEYS } from '@/config'

import Sidebar from '@/components/layout/Sidebar.vue'
import TopNavbar from '@/components/layout/TopNavbar.vue'
import MobileHeader from '@/components/layout/MobileHeader.vue'
import MobileNavigation from '@/components/layout/MobileNavigation.vue'
import MobileDrawer from '@/components/layout/MobileDrawer.vue'
import BindReferrerModal from '@/components/modals/BindReferrerModal.vue'

const { loadTheme } = useTheme()
const { loadLanguage } = useI18n()
const { initWallet, setupWalletListeners } = useWallet()

// 推荐人相关
const hasReferrer = ref(false)
const referrerAddress = ref('')
const isBindReferrerModalOpen = ref(false)

// 处理绑定上级完成
const handleReferrerBound = (address) => {
  referrerAddress.value = address
  hasReferrer.value = true
  console.log('Referrer bound:', address)
}

onMounted(async () => {
  // 初始化主题
  loadTheme()
  
  // 初始化语言
  loadLanguage()
  
  // 初始化钱包
  await initWallet()
  
  // 设置钱包事件监听
  setupWalletListeners()
  
  // 检查是否已绑定推荐人
  const savedReferrer = localStorage.getItem(STORAGE_KEYS.REFERRER_ADDRESS)
  if (savedReferrer) {
    hasReferrer.value = true
    referrerAddress.value = savedReferrer
  }
  
  // 监听打开绑定上级模态框事件
  document.addEventListener('open-bind-referrer-modal', () => {
    isBindReferrerModalOpen.value = true
  })
})

onUnmounted(() => {
  // 移除事件监听
  document.removeEventListener('open-bind-referrer-modal', () => {
    isBindReferrerModalOpen.value = true
  })
})
</script>