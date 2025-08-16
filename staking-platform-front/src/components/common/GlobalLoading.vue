<template>
  <div v-if="isVisible" class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
    <div class="bg-light-background dark:bg-dark-background p-6 rounded-lg shadow-lg flex flex-col items-center">
      <div class="w-12 h-12 border-4 border-nexafi-primary border-t-transparent rounded-full animate-spin mb-4"></div>
      <div class="text-primary font-medium">{{ message }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { eventBus, EVENTS } from '@/utils/eventBus'
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()
const isVisible = ref(false)
const message = ref(t('common.loading'))

// 显示loading
const show = (msg = t('common.loading')) => {
  message.value = msg
  isVisible.value = true
}

// 隐藏loading
const hide = () => {
  isVisible.value = false
}

// 监听事件总线上的事件
onMounted(() => {
  eventBus.on(EVENTS.SHOW_LOADING, (msg) => {
    show(msg)
  })
  
  eventBus.on(EVENTS.HIDE_LOADING, () => {
    hide()
  })
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  eventBus.off(EVENTS.SHOW_LOADING)
  eventBus.off(EVENTS.HIDE_LOADING)
})

// 暴露方法给外部使用
defineExpose({
  show,
  hide
})
</script>
