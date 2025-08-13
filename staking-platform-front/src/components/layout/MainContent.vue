<template>
  <div>
    <!-- 仪表板内容 -->
    <div class="fade-in">
      <h1 class="text-2xl font-bold text-primary mb-6">{{ t('dashboard.title') }}</h1>
      
      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="card p-6">
          <div class="text-secondary text-sm mb-1">{{ t('dashboard.totalValue') }}</div>
          <div class="text-3xl font-bold text-primary">${{ stakingStats.totalValue.toLocaleString() }}</div>
          <div class="text-nexafi-accent text-sm mt-2 flex items-center">
            <ArrowUpIcon class="w-4 h-4 mr-1" />
            +{{ stakingStats.dailyChange.totalValue }}% {{ t('common.today') }}
          </div>
        </div>
        
        <div class="card p-6">
          <div class="text-secondary text-sm mb-1">{{ t('dashboard.totalRewards') }}</div>
          <div class="text-3xl font-bold text-primary">${{ stakingStats.totalRewards.toLocaleString() }}</div>
          <div class="text-nexafi-accent text-sm mt-2 flex items-center">
            <ArrowUpIcon class="w-4 h-4 mr-1" />
            +{{ stakingStats.dailyChange.totalRewards }}% {{ t('common.today') }}
          </div>
        </div>
        
        <div class="card p-6">
          <div class="text-secondary text-sm mb-1">{{ t('dashboard.activeStakes') }}</div>
          <div class="text-3xl font-bold text-primary">{{ stakingStats.activeStakes }}</div>
          <div class="text-secondary text-sm mt-2">
            {{ t('staking.totalStaked') }}: ${{ stakingStats.totalStaked.toLocaleString() }}
          </div>
        </div>
        
        <div class="card p-6">
          <div class="text-secondary text-sm mb-1">APY {{ t('common.average') }}</div>
          <div class="text-3xl font-bold text-gradient">{{ stakingStats.averageApy }}%</div>
          <div class="text-secondary text-sm mt-2">
            {{ t('staking.flexible') }}
          </div>
        </div>
      </div>
      
      <!-- 质押池 -->
      <div class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-primary">{{ t('staking.title') }}</h2>
          
          <!-- 链选择器 -->
          <div class="flex space-x-2">
            <button 
              v-for="chain in supportedChains" 
              :key="chain.key"
              @click="selectedChain = chain.key"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2',
                selectedChain === chain.key 
                  ? 'bg-nexafi-primary text-white shadow-lg' 
                  : 'bg-light-surface dark:bg-dark-surface text-secondary hover:bg-nexafi-primary/10'
              ]"
            >
              <img 
                :src="chain.icon" 
                :alt="chain.name"
                class="w-4 h-4 rounded-full object-cover"
                @error="handleImageError"
              />
              <span>{{ chain.name }}</span>
            </button>
          </div>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div v-for="pool in currentChainPools" :key="pool.id" class="card p-6">
            <div class="flex justify-between items-center mb-4">
              <div class="flex items-center">
                <div class="w-10 h-10 rounded-full bg-nexafi-primary/20 flex items-center justify-center overflow-hidden">
                  <img 
                    :src="pool.tokenInfo.icon" 
                    :alt="pool.token"
                    class="w-8 h-8 rounded-full object-cover"
                    @error="handleImageError"
                  />
                </div>
                <div class="ml-3">
                  <div class="font-medium text-primary">{{ pool.name }}</div>
                  <div class="text-sm text-secondary flex items-center">
                    <img 
                      :src="pool.chainIcon" 
                      :alt="pool.chainName"
                      class="w-4 h-4 rounded-full mr-1 object-cover"
                      @error="handleImageError"
                    />
                    {{ pool.chainName }}
                  </div>
                </div>
              </div>
              <div class="text-lg font-bold text-gradient">{{ pool.apy }}% APY</div>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div class="text-sm text-secondary">{{ t('staking.totalStaked') }}</div>
                <div class="font-medium text-primary">{{ formatNumber(pool.totalStaked) }} {{ pool.token }}</div>
              </div>
              <div>
                <div class="text-sm text-secondary">{{ t('staking.lockPeriod') }}</div>
                <div class="font-medium text-primary">
                  {{ pool.lockPeriod > 0 ? `${pool.lockPeriod} ${t('staking.days')}` : t('staking.flexible') }}
                </div>
              </div>
            </div>
            
            <div class="flex space-x-3">
              <button class="btn-primary flex-1">{{ t('staking.stake') }}</button>
              <button class="btn-secondary flex-1">{{ t('staking.unstake') }}</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 质押历史 -->
      <div>
        <h2 class="text-xl font-semibold text-primary mb-4">{{ t('staking.stakingHistory') }}</h2>
        
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
                </tr>
              </thead>
              <tbody class="divide-y divide-light-border dark:divide-dark-border">
                <tr v-for="(tx, index) in transactions" :key="index" class="hover:bg-light-surface dark:hover:bg-dark-surface">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div :class="{
                        'text-nexafi-primary': tx.type === 'stake',
                        'text-light-warning dark:text-dark-warning': tx.type === 'unstake',
                        'text-light-success dark:text-dark-success': tx.type === 'claim'
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
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { ArrowUpIcon } from '@heroicons/vue/24/solid'
import { getAllStakingPools, getSupportedChains, TOKEN_CONFIG } from '@/config'
import { getStakingHistory, getStakingStats } from '@/data/stakingData'

const { t } = useI18n()

// 获取支持的链
const supportedChains = getSupportedChains()

// 当前选中的链
const selectedChain = ref('ethereum')

// 获取所有质押池
const allPools = getAllStakingPools()

// 当前链的质押池
const currentChainPools = computed(() => {
  return allPools.filter(pool => pool.chainKey === selectedChain.value)
})

// 获取统计数据
const stakingStats = getStakingStats()

// 获取质押历史数据
const transactions = getStakingHistory()

// 格式化数字
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toLocaleString()
}

// 图片加载错误处理
const handleImageError = (event) => {
  // 如果图片加载失败，使用默认的ETH图片
  event.target.src = 'https://wufeng98.cn/imgServerApi/images/1bae875e-951d-4fb6-9967-a7c12b326adf.png'
}
</script>