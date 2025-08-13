<template>
  <div>
    <h1 class="text-2xl font-bold text-primary mb-6">{{ t('history.title') }}</h1>
    
    <!-- 筛选器 -->
    <div class="mb-6 flex flex-wrap gap-3">
      <button 
        v-for="filter in filters" 
        :key="filter.value"
        class="px-4 py-2 rounded-lg border border-light-border dark:border-dark-border"
        :class="activeFilter === filter.value ? 'bg-nexafi-primary text-white' : 'bg-light-surface dark:bg-dark-surface text-primary hover:bg-light-border dark:hover:bg-dark-border'"
        @click="activeFilter = filter.value"
      >
        {{ t(`history.${filter.key}`) }}
      </button>
    </div>
    
    <!-- 交易历史表格 -->
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-light-surface dark:bg-dark-surface">
              <th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">{{ t('history.type') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">{{ t('history.amount') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">{{ t('common.chain') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">{{ t('staking.apy') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">{{ t('history.date') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">{{ t('history.status') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">{{ t('history.txHash') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-light-border dark:divide-dark-border">
            <tr v-for="(tx, index) in filteredTransactions" :key="index" class="hover:bg-light-surface dark:hover:bg-dark-surface">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div :class="{
                    'text-nexafi-primary': tx.type === 'stake',
                    'text-light-warning dark:text-dark-warning': tx.type === 'unstake',
                    'text-light-success dark:text-dark-success': tx.type === 'claim',
                    'text-nexafi-accent': tx.type === 'referralReward'
                  }">
                    {{ t(`history.${tx.type}`) }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center text-primary">
                  <img 
                    :src="tx.tokenIcon" 
                    :alt="tx.token"
                    class="w-5 h-5 rounded-full mr-2 object-cover"
                    @error="handleImageError"
                  />
                  {{ tx.amount }} {{ tx.token }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center text-primary">
                  <img 
                    :src="tx.chainIcon" 
                    :alt="tx.chainName"
                    class="w-4 h-4 rounded-full mr-2 object-cover"
                    @error="handleImageError"
                  />
                  {{ tx.chainName }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-primary">{{ tx.apy }}%</td>
              <td class="px-6 py-4 whitespace-nowrap text-secondary">{{ tx.date }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="{
                  'status-success': tx.status === 'completed',
                  'status-warning': tx.status === 'pending',
                  'status-error': tx.status === 'failed'
                }">
                  {{ t(`status.${tx.status}`) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <a 
                  :href="`https://etherscan.io/tx/${tx.txHash}`" 
                  target="_blank"
                  class="text-nexafi-primary hover:text-nexafi-primary/80 flex items-center"
                >
                  {{ tx.txHash.substring(0, 6) }}...{{ tx.txHash.substring(tx.txHash.length - 4) }}
                  <ArrowTopRightOnSquareIcon class="w-4 h-4 ml-1" />
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { ArrowTopRightOnSquareIcon } from '@heroicons/vue/24/outline'
import { getStakingHistory } from '@/data/stakingData'

const { t } = useI18n()

// 筛选器
const filters = [
  { key: 'all', value: 'all' },
  { key: 'stake', value: 'stake' },
  { key: 'unstake', value: 'unstake' },
  { key: 'claim', value: 'claim' },
  { key: 'referralReward', value: 'referralReward' }
]

const activeFilter = ref('all')

// 获取交易历史数据
const allTransactions = getStakingHistory()

// 根据筛选器过滤交易
const filteredTransactions = computed(() => {
  if (activeFilter.value === 'all') {
    return allTransactions
  }
  return getStakingHistory({ type: activeFilter.value })
})

// 图片加载错误处理
const handleImageError = (event) => {
  // 如果图片加载失败，使用默认的ETH图片
  event.target.src = 'https://wufeng98.cn/imgServerApi/images/1bae875e-951d-4fb6-9967-a7c12b326adf.png'
}
</script>