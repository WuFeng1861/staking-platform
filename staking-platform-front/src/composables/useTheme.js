import { ref, watch } from 'vue'
import { STORAGE_KEYS } from '@/config'

const theme = ref('light')
const isDark = ref(false)

// 从本地存储加载主题
const loadTheme = () => {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME)
  if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
    theme.value = savedTheme
  } else {
    // 检查系统主题偏好
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    theme.value = prefersDark ? 'dark' : 'light'
  }
  isDark.value = theme.value === 'dark'
  applyTheme()
}

// 应用主题
const applyTheme = () => {
  const html = document.documentElement
  if (theme.value === 'dark') {
    html.classList.add('dark')
  } else {
    html.classList.remove('dark')
  }
}

// 切换主题
const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  isDark.value = theme.value === 'dark'
  localStorage.setItem(STORAGE_KEYS.THEME, theme.value)
  applyTheme()
}

// 设置主题
const setTheme = (newTheme) => {
  if (['light', 'dark'].includes(newTheme)) {
    theme.value = newTheme
    isDark.value = newTheme === 'dark'
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme)
    applyTheme()
  }
}

// 监听系统主题变化
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(STORAGE_KEYS.THEME)) {
      theme.value = e.matches ? 'dark' : 'light'
      isDark.value = e.matches
      applyTheme()
    }
  })
}

export const useTheme = () => {
  return {
    theme,
    isDark,
    toggleTheme,
    setTheme,
    loadTheme
  }
}