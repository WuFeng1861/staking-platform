import { getTokenImage, getChainImage } from '@/config/images'

// 用户质押数据
export const userStakingData = {
  totalValue: 12345.67,
  totalRewards: 1234.56,
  activeStakes: 5,
  totalStaked: 9876.54,
  averageApy: 8.7,
  dailyChange: {
    totalValue: 5.2,
    totalRewards: 2.8
  }
}

// 质押历史数据
export const stakingHistory = [
  {
    id: 0,
    type: 'referralReward',
    amount: '20',
    token: 'USDT',
    tokenIcon: getTokenImage('USDT'),
    chainKey: 'ethereum',
    chainName: 'Ethereum',
    chainIcon: getChainImage('ethereum'),
    apy: 0,
    date: '2025-08-13 16:45',
    status: 'completed',
    txHash: '0x0123...4567',
    referrer: '0xabcd...ef12'
  },
  {
    id: 1,
    type: 'stake',
    amount: '1.5',
    token: 'ETH',
    tokenIcon: getTokenImage('ETH'),
    chainKey: 'ethereum',
    chainName: 'Ethereum',
    chainIcon: getChainImage('ethereum'),
    apy: 5.2,
    date: '2025-08-12 14:32',
    status: 'completed',
    txHash: '0x1234...5678'
  },
  {
    id: 2,
    type: 'stake',
    amount: '500',
    token: 'USDT',
    tokenIcon: getTokenImage('USDT'),
    chainKey: 'bsc',
    chainName: 'BSC',
    chainIcon: getChainImage('bsc'),
    apy: 6.8,
    date: '2025-08-10 09:15',
    status: 'completed',
    txHash: '0x2345...6789'
  },
  {
    id: 3,
    type: 'unstake',
    amount: '0.5',
    token: 'ETH',
    tokenIcon: getTokenImage('ETH'),
    chainKey: 'arbitrum',
    chainName: 'Arbitrum',
    chainIcon: getChainImage('arbitrum'),
    apy: 5.2,
    date: '2025-08-05 16:45',
    status: 'completed',
    txHash: '0x3456...7890'
  },
  {
    id: 4,
    type: 'claim',
    amount: '0.05',
    token: 'ETH',
    tokenIcon: getTokenImage('ETH'),
    chainKey: 'ethereum',
    chainName: 'Ethereum',
    chainIcon: getChainImage('ethereum'),
    apy: 5.2,
    date: '2025-08-01 10:20',
    status: 'completed',
    txHash: '0x4567...8901'
  },
  {
    id: 5,
    type: 'stake',
    amount: '2.5',
    token: 'BNB',
    tokenIcon: getTokenImage('BNB'),
    chainKey: 'bsc',
    chainName: 'BSC',
    chainIcon: getChainImage('bsc'),
    apy: 7.5,
    date: '2025-07-30 15:22',
    status: 'completed',
    txHash: '0x5678...9012'
  },
  {
    id: 6,
    type: 'stake',
    amount: '100',
    token: 'NexaFi',
    tokenIcon: getTokenImage('NexaFi'),
    chainKey: 'arbitrum',
    chainName: 'Arbitrum',
    chainIcon: getChainImage('arbitrum'),
    apy: 18.9,
    date: '2025-07-28 11:05',
    status: 'completed',
    txHash: '0x6789...0123'
  },
  {
    id: 7,
    type: 'stake',
    amount: '1000',
    token: 'USDT',
    tokenIcon: getTokenImage('USDT'),
    chainKey: 'ethereum',
    chainName: 'Ethereum',
    chainIcon: getChainImage('ethereum'),
    apy: 6.8,
    date: '2025-07-25 13:45',
    status: 'completed',
    txHash: '0x7890...1234'
  },
  {
    id: 8,
    type: 'unstake',
    amount: '50',
    token: 'NexaFi',
    tokenIcon: getTokenImage('NexaFi'),
    chainKey: 'bsc',
    chainName: 'BSC',
    chainIcon: getChainImage('bsc'),
    apy: 15.6,
    date: '2025-07-20 11:30',
    status: 'completed',
    txHash: '0x8901...2345'
  }
]

// 用户当前质押池数据
export const userStakingPools = [
  {
    id: 1,
    poolId: 'eth-ethereum-1',
    token: 'ETH',
    tokenIcon: getTokenImage('ETH'),
    chainKey: 'ethereum',
    chainName: 'Ethereum',
    chainIcon: getChainImage('ethereum'),
    stakedAmount: '2.5',
    apy: 5.2,
    rewards: '0.15',
    lockPeriod: 0,
    stakeDate: '2025-07-15 10:30',
    status: 'active'
  },
  {
    id: 2,
    poolId: 'usdt-bsc-2',
    token: 'USDT',
    tokenIcon: getTokenImage('USDT'),
    chainKey: 'bsc',
    chainName: 'BSC',
    chainIcon: getChainImage('bsc'),
    stakedAmount: '1500',
    apy: 8.2,
    rewards: '45.6',
    lockPeriod: 30,
    stakeDate: '2025-07-10 14:20',
    status: 'active'
  },
  {
    id: 3,
    poolId: 'nexafi-arbitrum-3',
    token: 'NexaFi',
    tokenIcon: getTokenImage('NexaFi'),
    chainKey: 'arbitrum',
    chainName: 'Arbitrum',
    chainIcon: getChainImage('arbitrum'),
    stakedAmount: '500',
    apy: 18.9,
    rewards: '28.5',
    lockPeriod: 0,
    stakeDate: '2025-07-05 16:45',
    status: 'active'
  },
  {
    id: 4,
    poolId: 'bnb-bsc-4',
    token: 'BNB',
    tokenIcon: getTokenImage('BNB'),
    chainKey: 'bsc',
    chainName: 'BSC',
    chainIcon: getChainImage('bsc'),
    stakedAmount: '5.2',
    apy: 7.5,
    rewards: '1.2',
    lockPeriod: 7,
    stakeDate: '2025-07-01 09:15',
    status: 'active'
  },
  {
    id: 5,
    poolId: 'usdt-ethereum-5',
    token: 'USDT',
    tokenIcon: getTokenImage('USDT'),
    chainKey: 'ethereum',
    chainName: 'Ethereum',
    chainIcon: getChainImage('ethereum'),
    stakedAmount: '2000',
    apy: 6.8,
    rewards: '68.5',
    lockPeriod: 0,
    stakeDate: '2025-06-25 11:30',
    status: 'active'
  }
]

// 获取质押历史数据的工具函数
export const getStakingHistory = (filters = {}) => {
  let filteredHistory = [...stakingHistory]
  
  // 按类型筛选
  if (filters.type) {
    if (Array.isArray(filters.type)) {
      filteredHistory = filteredHistory.filter(item => filters.type.includes(item.type))
    } else {
      filteredHistory = filteredHistory.filter(item => item.type === filters.type)
    }
  }
  
  // 按链筛选
  if (filters.chainKey) {
    filteredHistory = filteredHistory.filter(item => item.chainKey === filters.chainKey)
  }
  
  // 按代币筛选
  if (filters.token) {
    filteredHistory = filteredHistory.filter(item => item.token === filters.token)
  }
  
  // 按状态筛选
  if (filters.status) {
    filteredHistory = filteredHistory.filter(item => item.status === filters.status)
  }
  
  // 按日期范围筛选
  if (filters.dateFrom || filters.dateTo) {
    filteredHistory = filteredHistory.filter(item => {
      const itemDate = new Date(item.date)
      const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null
      const toDate = filters.dateTo ? new Date(filters.dateTo) : null
      
      if (fromDate && itemDate < fromDate) return false
      if (toDate && itemDate > toDate) return false
      return true
    })
  }
  
  // 排序（默认按日期倒序）
  filteredHistory.sort((a, b) => new Date(b.date) - new Date(a.date))
  
  return filteredHistory
}

// 获取用户质押池数据的工具函数
export const getUserStakingPools = (filters = {}) => {
  let filteredPools = [...userStakingPools]
  
  // 按链筛选
  if (filters.chainKey) {
    filteredPools = filteredPools.filter(pool => pool.chainKey === filters.chainKey)
  }
  
  // 按代币筛选
  if (filters.token) {
    filteredPools = filteredPools.filter(pool => pool.token === filters.token)
  }
  
  // 按状态筛选
  if (filters.status) {
    filteredPools = filteredPools.filter(pool => pool.status === filters.status)
  }
  
  return filteredPools
}

// 获取统计数据的工具函数
export const getStakingStats = () => {
  return {
    ...userStakingData,
    // 计算一些动态统计
    totalPools: userStakingPools.length,
    activePools: userStakingPools.filter(pool => pool.status === 'active').length,
    totalHistoryCount: stakingHistory.length,
    recentTransactions: stakingHistory.slice(0, 5)
  }
}

// 添加新的质押记录
export const addStakingRecord = (record) => {
  const newRecord = {
    id: stakingHistory.length + 1,
    ...record,
    tokenIcon: getTokenImage(record.token),
    chainIcon: getChainImage(record.chainKey),
    date: new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\//g, '-')
  }
  
  stakingHistory.unshift(newRecord)
  return newRecord
}

// 更新用户质押池
export const updateUserStakingPool = (poolId, updates) => {
  const poolIndex = userStakingPools.findIndex(pool => pool.id === poolId)
  if (poolIndex !== -1) {
    userStakingPools[poolIndex] = { ...userStakingPools[poolIndex], ...updates }
    return userStakingPools[poolIndex]
  }
  return null
}