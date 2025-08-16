<template>
  <div>
    <!-- 绑定上级模态框 -->
    <BindReferrerModal 
      :is-open="isBindReferrerModalOpen" 
      :current-referrer="referrerAddress"
      @close="isBindReferrerModalOpen = false"
      @bind="handleReferrerBound"
    />
    
    <!-- 质押模态框 -->
    <StakeModal
      :is-open="isStakeModalOpen"
      :pool="selectedPool || {}"
      :balance="currentTokenBalance"
      @close="isStakeModalOpen = false"
      @stake="handleStake"
    />
    <h1 class="text-2xl font-bold text-primary mb-6">{{ t('staking.title') }}</h1>
    
    <!-- 代币余额 -->
    <div class="mb-6">
      <TokenBalances />
    </div>
    
    <!-- 链选择器 -->
    <div class="mb-6">
      <div class="flex flex-wrap gap-3">
        <button 
          v-for="chain in supportedChains" 
          :key="chain.key"
          class="flex items-center px-4 py-2 rounded-lg border border-light-border dark:border-dark-border transition-all duration-200"
          :class="selectedChain === chain.key ? 'bg-nexafi-primary text-white border-nexafi-primary' : 'bg-light-surface dark:bg-dark-surface text-primary hover:bg-light-border dark:hover:bg-dark-border'"
          @click="selectChain(chain.key)"
        >
          <img 
            :src="chain.icon" 
            :alt="chain.name"
            class="w-5 h-5 rounded-full mr-2 object-cover"
            @error="handleImageError"
          />
          <span>{{ chain.name }}</span>
        </button>
      </div>
    </div>
    
    <!-- 当前链信息 -->
    <div v-if="currentChainData" class="mb-6 card p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <img 
            :src="currentChainData.chainInfo.icon" 
            :alt="currentChainData.chainInfo.name"
            class="w-8 h-8 rounded-full mr-3 object-cover"
            @error="handleImageError"
          />
          <div>
            <h2 class="text-lg font-semibold text-primary">{{ currentChainData.chainInfo.name }} {{ t('staking.stakingPools') }}</h2>
            <p class="text-sm text-secondary">{{ t('staking.selectPoolToStake') }}</p>
          </div>
        </div>
        <div class="text-right">
          <div class="text-sm text-secondary">{{ t('staking.totalPools') }}</div>
          <div class="text-lg font-bold text-primary">{{ currentChainData.pools.length }}</div>
        </div>
      </div>
    </div>
    
    <!-- 质押池列表 -->
    <div v-if="currentChainData" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <div v-for="pool in currentChainData.pools" :key="pool.id" class="card p-6">
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center">
            <div class="w-12 h-12 rounded-full bg-nexafi-primary/20 flex items-center justify-center overflow-hidden">
              <img 
                :src="pool.tokenInfo.icon" 
                :alt="pool.token"
                class="w-10 h-10 rounded-full object-cover"
                @error="handleImageError"
              />
            </div>
            <div class="ml-3">
              <div class="font-medium text-primary">{{ pool.name }}</div>
              <div class="text-sm text-secondary flex items-center">
                <img 
                  :src="currentChainData.chainInfo.icon" 
                  :alt="currentChainData.chainInfo.name"
                  class="w-4 h-4 rounded-full mr-1 object-cover"
                  @error="handleImageError"
                />
                {{ currentChainData.chainInfo.name }}
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-lg font-bold text-gradient">{{ pool.apy }}%</div>
            <div class="text-xs text-secondary">APY</div>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div class="text-sm text-secondary">{{ t('staking.totalStaked') }}</div>
            <div class="font-medium text-primary">{{ formatNumber(pool.totalStaked) }} {{ pool.token }}</div>
          </div>
          <div>
            <div class="text-sm text-secondary">{{ t('staking.participants') }}</div>
            <div class="font-medium text-primary">{{ formatNumber(pool.participants) }}</div>
          </div>
          <div>
            <div class="text-sm text-secondary">{{ t('staking.minStake') }}</div>
            <div class="font-medium text-primary">{{ pool.minStake }} {{ pool.token }}</div>
          </div>
          <div>
            <div class="text-sm text-secondary">{{ t('staking.lockPeriod') }}</div>
            <div class="font-medium text-primary">
              {{ pool.lockPeriod > 0 ? `${pool.lockPeriod} ${t('staking.days')}` : t('staking.flexible') }}
            </div>
          </div>
        </div>
        
        <div class="flex space-x-3">
          <button 
            class="btn-primary flex-1"
            @click="openStakeModal(pool)"
            :disabled="!isConnected || chainId !== parseInt(currentChainData.chainInfo.chainId, 16)"
          >
            {{ t('staking.stake') }}
          </button>
          <button 
            class="btn-secondary flex-1"
            @click="openUnstakeModal(pool)"
            :disabled="!isConnected || chainId !== parseInt(currentChainData.chainInfo.chainId, 16)"
          >
            {{ t('staking.unstake') }}
          </button>
        </div>
        
        <!-- 网络不匹配提示 -->
        <div v-if="isConnected && chainId !== parseInt(currentChainData.chainInfo.chainId, 16)" class="mt-3 text-center">
          <button 
            class="text-sm text-nexafi-primary hover:text-nexafi-primary/80"
            @click="switchToChain(currentChainData.chainInfo.chainId)"
          >
            {{ t('wallet.switchTo') }} {{ currentChainData.chainInfo.name }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- 我的质押 -->
    <div class="mb-8">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-primary">{{ t('staking.myStakes') }}</h2>
        <button 
          class="btn-secondary flex items-center space-x-2 text-sm"
          @click="openBindReferrerModal"
        >
          <span>{{ hasReferrer ? t('referral.changeReferrer') : t('referral.bindReferrer') }}</span>
        </button>
      </div>
      
      <div v-if="myStakes.length > 0" class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-light-surface dark:bg-dark-surface">
                <th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">{{ t('staking.pool') }}</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">{{ t('staking.chain') }}</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">{{ t('staking.amount') }}</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">{{ t('staking.apy') }}</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">{{ t('staking.rewards') }}</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">{{ t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-light-border dark:divide-dark-border">
              <tr v-for="(stake, index) in myStakes" :key="index" class="hover:bg-light-surface dark:hover:bg-dark-surface">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <img 
                      :src="stake.tokenIcon" 
                      :alt="stake.token"
                      class="w-6 h-6 rounded-full mr-2 object-cover"
                      @error="handleImageError"
                    />
                    <div class="text-primary">{{ stake.poolName }}</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <img 
                      :src="stake.chainIcon" 
                      :alt="stake.chainName"
                      class="w-4 h-4 rounded-full mr-1 object-cover"
                      @error="handleImageError"
                    />
                    <span class="text-primary">{{ stake.chainName }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-primary">{{ stake.amount }} {{ stake.token }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-primary">{{ stake.apy }}%</td>
                <td class="px-6 py-4 whitespace-nowrap text-primary">{{ stake.rewards }} {{ stake.token }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex space-x-2">
                    <button 
                      class="px-3 py-1 text-sm bg-nexafi-primary text-white rounded-md hover:bg-nexafi-primary/90"
                      @click="claimRewards(stake)"
                      :disabled="parseFloat(stake.rewards) === 0"
                    >
                      {{ t('staking.claim') }}
                    </button>
                    <button 
                      class="px-3 py-1 text-sm bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-md hover:bg-light-border dark:hover:bg-dark-border"
                      @click="openUnstakeModal(stake)"
                    >
                      {{ t('staking.unstake') }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div v-else class="card p-8 text-center">
        <div class="text-secondary mb-4">{{ t('staking.noStakes') }}</div>
        <button class="btn-primary" @click="selectChain('ethereum')">{{ t('staking.startStaking') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { useWallet } from '@/composables/useWallet'
import { 
  STAKING_POOLS_BY_CHAIN, 
  getSupportedChains, 
  getPoolsByChain,
  STORAGE_KEYS,
  REFERRAL_CONFIG
} from '@/config'
import { getUserStakingPools } from '@/data/stakingData'
import { getTokenBalance } from '@/data/tokenBalances'
import BindReferrerModal from '@/components/modals/BindReferrerModal.vue'
import StakeModal from '@/components/modals/StakeModal.vue'
import TokenBalances from '@/components/common/TokenBalances.vue'

const { t } = useI18n()
const { isConnected, chainId, switchNetwork, updateBalance } = useWallet()

// 推荐人相关
const hasReferrer = ref(false)
const referrerAddress = ref('')
const isBindReferrerModalOpen = ref(false)

// 质押模态框相关
const isStakeModalOpen = ref(false)
const selectedPool = ref(null)
const currentTokenBalance = ref('0')

// 支持的链
const supportedChains = getSupportedChains()

// 当前选中的链
const selectedChain = ref('ethereum')

// 当前链的数据
const currentChainData = computed(() => {
  return STAKING_POOLS_BY_CHAIN[selectedChain.value]
})

// 获取我的质押数据
const myStakes = computed(() => {
  return getUserStakingPools().map(pool => ({
    poolId: pool.poolId,
    poolName: `${pool.token} Staking Pool`,
    chainName: pool.chainName,
    chainIcon: pool.chainIcon,
    token: pool.token,
    tokenIcon: pool.tokenIcon,
    amount: pool.stakedAmount,
    apy: pool.apy,
    rewards: pool.rewards,
    startDate: pool.stakeDate.split(' ')[0] // 只取日期部分
  }))
})

// 选择链
const selectChain = (chainKey) => {
  selectedChain.value = chainKey
  localStorage.setItem(STORAGE_KEYS.SELECTED_CHAIN, chainKey)
}

// 切换到指定链
const switchToChain = async (targetChainId) => {
  try {
    await switchNetwork(targetChainId)
  } catch (error) {
    console.error('Failed to switch network:', error)
  }
}

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

// 打开质押模态框
const openStakeModal = (pool) => {
  if (!isConnected.value) {
    console.log('Wallet not connected')
    return
  }
  
  selectedPool.value = pool
  
  // 直接从代币余额数据中获取余额
  currentTokenBalance.value = getTokenBalance(pool.token)
  
  // 打开模态框
  isStakeModalOpen.value = true
}

// 打开取消质押模态框
const openUnstakeModal = (pool) => {
  console.log('Open unstake modal for pool:', pool)
  // 实际项目中应该打开模态框
}

// 领取奖励
const claimRewards = (stake) => {
  console.log('Claim rewards for stake:', stake)
  // 实际项目中应该调用智能合约
}

// 打开绑定上级模态框
const openBindReferrerModal = () => {
  isBindReferrerModalOpen.value = true
}

// 处理绑定上级完成
const handleReferrerBound = (address) => {
  referrerAddress.value = address
  hasReferrer.value = true
  console.log('Referrer bound:', address)
}

// 处理质押操作
const handleStake = async (stakeData) => {
  try {
    console.log('Staking:', stakeData)
    // 实际项目中应该调用智能合约进行质押
    
    // 模拟质押成功
    // 更新余额
    await updateBalance()
    
    // 显示成功提示
    alert(t('staking.stakeSuccess'))
  } catch (error) {
    console.error('Staking failed:', error)
    alert(t('errors.stakingFailed'))
  }
}

// 组件挂载时加载保存的链选择和检查推荐人状态
onMounted(() => {
  const savedChain = localStorage.getItem(STORAGE_KEYS.SELECTED_CHAIN)
  if (savedChain && supportedChains.find(chain => chain.key === savedChain)) {
    selectedChain.value = savedChain
  }
  
  // 检查是否已绑定推荐人
  const savedReferrer = localStorage.getItem(STORAGE_KEYS.REFERRER_ADDRESS)
  if (savedReferrer) {
    hasReferrer.value = true
    referrerAddress.value = savedReferrer
  }
})
</script>