<template>
  <div>
    <h1 class="text-2xl font-bold text-primary mb-6">{{ t('nav.rewards') }}</h1>
    
    <!-- 奖励统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="card p-6">
        <div class="text-secondary text-sm mb-1">{{ t('staking.totalRewards') }}</div>
        <div class="text-3xl font-bold text-gradient">${{ rewardStats.totalRewards }}</div>
        <div class="text-nexafi-accent text-sm mt-2 flex items-center">
          <ArrowUpIcon class="w-4 h-4 mr-1" />
          +12.5% {{ t('common.thisMonth') }}
        </div>
      </div>
      
      <div class="card p-6">
        <div class="text-secondary text-sm mb-1">{{ t('staking.pendingRewards') }}</div>
        <div class="text-3xl font-bold text-primary">${{ rewardStats.pendingRewards }}</div>
        <button class="btn-primary text-sm mt-3">{{ t('staking.claim') }}</button>
      </div>
      
      <div class="card p-6">
        <div class="text-secondary text-sm mb-1">{{ t('staking.claimedRewards') }}</div>
        <div class="text-3xl font-bold text-primary">${{ rewardStats.claimedRewards }}</div>
        <div class="text-secondary text-sm mt-2">
          {{ t('common.lastClaim') }}: {{ rewardHistory[0]?.date.split(' ')[0] || '2025-08-01' }}
        </div>
      </div>
      
      <div class="card p-6">
        <div class="text-secondary text-sm mb-1">{{ t('rewards.referralRewards') }}</div>
        <div class="text-3xl font-bold text-nexafi-accent">${{ rewardStats.referralRewards }}</div>
        <div class="text-secondary text-sm mt-2">
          {{ referralCount }} {{ t('referral.totalReferrals') }}
        </div>
      </div>
    </div>
    
    <!-- 奖励图表 -->
    <div class="card p-6 mb-8">
      <h2 class="text-xl font-semibold text-primary mb-4">{{ t('rewards.rewardsOverTime') }}</h2>
      <div class="h-64 bg-light-surface dark:bg-dark-surface rounded-lg flex items-center justify-center">
        <!-- 实际项目中应该使用图表库，如Chart.js或ECharts -->
        <div class="text-secondary">{{ t('rewards.chartPlaceholder') }}</div>
      </div>
    </div>
    
    <!-- 奖励历史 -->
    <div>
      <h2 class="text-xl font-semibold text-primary mb-4">{{ t('staking.rewardHistory') }}</h2>
      
      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-light-surface dark:bg-dark-surface">
                <th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">{{ t('history.type') }}</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">{{ t('staking.title') }}</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">{{ t('staking.amount') }}</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">{{ t('common.chain') }}</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">{{ t('history.date') }}</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">{{ t('history.txHash') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-light-border dark:divide-dark-border">
              <tr v-for="(reward, index) in rewardHistory" :key="index" class="hover:bg-light-surface dark:hover:bg-dark-surface">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div :class="{
                    'text-light-success dark:text-dark-success': reward.type === 'claim',
                    'text-nexafi-accent': reward.type === 'referralReward'
                  }">
                    {{ t(`history.${reward.type}`) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <img 
                      :src="reward.tokenIcon" 
                      :alt="reward.token"
                      class="w-6 h-6 rounded-full mr-3 object-cover"
                      @error="handleImageError"
                    />
                    <div class="text-primary">{{ reward.poolName }}</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center text-primary">
                    <img 
                      :src="reward.tokenIcon" 
                      :alt="reward.token"
                      class="w-5 h-5 rounded-full mr-2 object-cover"
                      @error="handleImageError"
                    />
                    {{ reward.amount }} {{ reward.token }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center text-primary">
                    <img 
                      :src="reward.chainIcon" 
                      :alt="reward.chainName"
                      class="w-4 h-4 rounded-full mr-2 object-cover"
                      @error="handleImageError"
                    />
                    {{ reward.chainName }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-secondary">{{ reward.date }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <a 
                    :href="`https://etherscan.io/tx/${reward.txHash}`" 
                    target="_blank"
                    class="text-nexafi-primary hover:text-nexafi-primary/80 flex items-center"
                  >
                    {{ reward.txHash.substring(0, 6) }}...{{ reward.txHash.substring(reward.txHash.length - 4) }}
                    <ArrowTopRightOnSquareIcon class="w-4 h-4 ml-1" />
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { ArrowUpIcon } from '@heroicons/vue/24/solid'
import { ArrowTopRightOnSquareIcon } from '@heroicons/vue/24/outline'
import { getStakingHistory, getStakingStats, getUserStakingPools } from '@/data/stakingData'

const { t } = useI18n()

// 获取统计数据
const stakingStats = getStakingStats()

// 获取用户质押池数据
const userPools = getUserStakingPools()

// 获取邀请奖励数据
const referralRewards = computed(() => {
  return getStakingHistory({ type: 'referralReward' })
})

// 邀请人数
const referralCount = computed(() => {
  return referralRewards.value.length
})

// 计算奖励统计
const rewardStats = computed(() => {
  const totalRewards = userPools.reduce((sum, pool) => sum + parseFloat(pool.rewards), 0)
  const pendingRewards = totalRewards * 0.1 // 假设10%为待领取
  const claimedRewards = totalRewards * 0.9 // 假设90%已领取
  
  // 计算邀请奖励总额
  const totalReferralRewards = referralRewards.value.reduce(
    (sum, reward) => sum + parseFloat(reward.amount), 
    0
  )
  
  return {
    totalRewards: totalRewards.toFixed(2),
    pendingRewards: pendingRewards.toFixed(2),
    claimedRewards: claimedRewards.toFixed(2),
    referralRewards: totalReferralRewards.toFixed(2)
  }
})

// 获取奖励历史（显示claim和referralReward类型的交易）
const rewardHistory = computed(() => {
  return getStakingHistory({ type: ['claim', 'referralReward'] }).map(tx => ({
    type: tx.type,
    poolName: tx.type === 'referralReward' ? 'Referral Program' : `${tx.token} Staking`,
    token: tx.token,
    tokenIcon: tx.tokenIcon,
    chainName: tx.chainName,
    chainIcon: tx.chainIcon,
    amount: tx.amount,
    date: tx.date,
    txHash: tx.txHash
  }))
})

// 图片加载错误处理
const handleImageError = (event) => {
  event.target.src = 'https://wufeng98.cn/imgServerApi/images/1bae875e-951d-4fb6-9967-a7c12b326adf.png'
}
</script>