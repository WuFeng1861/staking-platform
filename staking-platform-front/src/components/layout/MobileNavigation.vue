<template>
  <nav class="flex justify-around py-2">
    <router-link 
      v-for="item in navItems" 
      :key="item.path" 
      :to="item.path" 
      class="flex flex-col items-center p-2 text-light-text-secondary dark:text-dark-text-secondary hover:text-nexafi-primary"
      :class="{ 'text-nexafi-primary': currentRoute === item.path }"
    >
      <component :is="item.icon" class="w-6 h-6" />
      <span class="text-xs mt-1">{{ t(`nav.${item.key}`) }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { 
  HomeIcon, 
  CurrencyDollarIcon, 
  ClockIcon, 
  ChartBarIcon
} from '@heroicons/vue/24/outline'

const { t } = useI18n()

// 导航项
const navItems = [
  { key: 'dashboard', path: '/', icon: HomeIcon },
  { key: 'staking', path: '/staking', icon: CurrencyDollarIcon },
  { key: 'history', path: '/history', icon: ClockIcon },
  { key: 'rewards', path: '/rewards', icon: ChartBarIcon }
]

// 当前路由（实际项目中应该使用vue-router的useRoute）
const currentRoute = ref('/')
</script>