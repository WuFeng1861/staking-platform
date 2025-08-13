import { ref, computed } from 'vue'
import { STORAGE_KEYS } from '@/config'

const currentLanguage = ref('en')

// 语言包
const messages = {
  en: {
    // 通用
    common: {
      connect: 'Connect',
      disconnect: 'Disconnect',
      confirm: 'Confirm',
      cancel: 'Cancel',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      copy: 'Copy',
      copied: 'Copied!',
      more: 'More',
      less: 'Less',
      all: 'All',
      none: 'None',
      actions: 'Actions',
      today: 'Today',
      thisMonth: 'This Month',
      lastClaim: 'Last Claim',
      average: 'Average',
      chain: 'Chain'
    },
    
    // 导航
    nav: {
      dashboard: 'Dashboard',
      staking: 'Staking',
      history: 'History',
      rewards: 'Rewards',
      profile: 'Profile'
    },
    
    // 钱包
    wallet: {
      connect: 'Connect Wallet',
      disconnect: 'Disconnect',
      connected: 'Connected',
      address: 'Address',
      balance: 'Balance',
      network: 'Network',
      switchNetwork: 'Switch Network',
      switchTo: 'Switch to',
      unsupportedNetwork: 'Unsupported Network',
      installWallet: 'Please install MetaMask',
      connectionFailed: 'Connection failed'
    },
    
    // 质押
    staking: {
      title: 'Staking Pools',
      stake: 'Stake',
      unstake: 'Unstake',
      claim: 'Claim Rewards',
      amount: 'Amount',
      apy: 'APY',
      totalStaked: 'Total Staked',
      myStaked: 'My Staked',
      myStakes: 'My Stakes',
      availableRewards: 'Available Rewards',
      lockPeriod: 'Lock Period',
      flexible: 'Flexible',
      days: 'days',
      minStake: 'Min Stake',
      participants: 'Participants',
      stakingHistory: 'Staking History',
      rewardHistory: 'Reward History',
      totalRewards: 'Total Rewards',
      pendingRewards: 'Pending Rewards',
      claimedRewards: 'Claimed Rewards',
      stakingPools: 'Staking Pools',
      selectPoolToStake: 'Select a pool to start staking',
      totalPools: 'Total Pools',
      pool: 'Pool',
      chain: 'Chain',
      rewards: 'Rewards',
      noStakes: 'No active stakes found',
      startStaking: 'Start Staking'
    },
    
    // 仪表板
    dashboard: {
      title: 'Dashboard',
      totalValue: 'Total Value',
      totalRewards: 'Total Rewards',
      activeStakes: 'Active Stakes',
      portfolioOverview: 'Portfolio Overview',
      recentActivity: 'Recent Activity',
      topPools: 'Top Performing Pools'
    },
    
    // 历史记录
    history: {
      title: 'Transaction History',
      type: 'Type',
      amount: 'Amount',
      date: 'Date',
      status: 'Status',
      txHash: 'Transaction Hash',
      viewOnExplorer: 'View on Explorer',
      filter: 'Filter',
      all: 'All',
      stake: 'Stake',
      unstake: 'Unstake',
      claim: 'Claim',
      referralReward: 'Referral Reward'
    },
    
    // 状态
    status: {
      pending: 'Pending',
      completed: 'Completed',
      failed: 'Failed',
      processing: 'Processing'
    },
    
    // 错误信息
    errors: {
      insufficientBalance: 'Insufficient balance',
      invalidAmount: 'Invalid amount',
      networkError: 'Network error',
      transactionFailed: 'Transaction failed',
      walletNotConnected: 'Wallet not connected',
      unsupportedToken: 'Unsupported token'
    },
    
    // 邀请
    referral: {
      title: 'Referral Program',
      yourLink: 'Your Referral Link',
      totalReferrals: 'Total Referrals',
      referralRewards: 'Referral Rewards',
      inviteFriends: 'Invite Friends',
      copyLink: 'Copy Link',
      shareLink: 'Share Link',
      bindReferrer: 'Bind Referrer',
      changeReferrer: 'Change Referrer',
      currentReferrer: 'Current Referrer',
      enterReferrerAddress: 'Enter Referrer Address',
      addressPlaceholder: 'Please enter a valid wallet address',
      invalidAddress: 'Invalid address',
      bind: 'Bind',
      change: 'Change',
      bindDescription: 'After binding a referrer, your first-time staking will bring the following rewards to your referrer:',
      ethReward: 'ETH: 20 USDT reward when staking more than 0.027 ETH',
      bnbReward: 'BNB: 20 USDT reward when staking more than 0.125 BNB',
      arbReward: 'ARB: 20 USDT reward when staking more than 100 USDT',
      nexafiReward: 'NexaFi: 20 USDT reward when staking more than 10,000 NexaFi'
    },
    
    // 奖励
    rewards: {
      rewardsOverTime: 'Rewards Over Time',
      chartPlaceholder: 'Chart will be displayed here',
      referralRewards: 'Referral Rewards',
      totalReferralRewards: 'Total Referral Rewards'
    },
    
    // 主题
    theme: {
      light: 'Light Mode',
      dark: 'Dark Mode'
    }
  },
  
  zh: {
    // 通用
    common: {
      connect: '连接',
      disconnect: '断开连接',
      confirm: '确认',
      cancel: '取消',
      loading: '加载中...',
      error: '错误',
      success: '成功',
      warning: '警告',
      copy: '复制',
      copied: '已复制！',
      more: '更多',
      less: '收起',
      all: '全部',
      none: '无',
      actions: '操作',
      today: '今天',
      thisMonth: '本月',
      lastClaim: '上次领取',
      average: '平均',
      chain: '链'
    },
    
    // 导航
    nav: {
      dashboard: '仪表板',
      staking: '质押',
      history: '历史记录',
      rewards: '奖励',
      profile: '个人资料'
    },
    
    // 钱包
    wallet: {
      connect: '连接钱包',
      disconnect: '断开连接',
      connected: '已连接',
      address: '地址',
      balance: '余额',
      network: '网络',
      switchNetwork: '切换网络',
      switchTo: '切换到',
      unsupportedNetwork: '不支持的网络',
      installWallet: '请安装 MetaMask',
      connectionFailed: '连接失败'
    },
    
    // 质押
    staking: {
      title: '质押池',
      stake: '质押',
      unstake: '取消质押',
      claim: '领取奖励',
      amount: '数量',
      apy: '年化收益率',
      totalStaked: '总质押量',
      myStaked: '我的质押',
      myStakes: '我的质押',
      availableRewards: '可用奖励',
      lockPeriod: '锁定期',
      flexible: '灵活',
      days: '天',
      minStake: '最小质押',
      participants: '参与者',
      stakingHistory: '质押历史',
      rewardHistory: '奖励历史',
      totalRewards: '总奖励',
      pendingRewards: '待领取奖励',
      claimedRewards: '已领取奖励',
      stakingPools: '质押池',
      selectPoolToStake: '选择一个池开始质押',
      totalPools: '总池数',
      pool: '池',
      chain: '链',
      rewards: '奖励',
      noStakes: '未找到活跃质押',
      startStaking: '开始质押'
    },
    
    // 仪表板
    dashboard: {
      title: '仪表板',
      totalValue: '总价值',
      totalRewards: '总奖励',
      activeStakes: '活跃质押',
      portfolioOverview: '投资组合概览',
      recentActivity: '最近活动',
      topPools: '表现最佳的池'
    },
    
    // 历史记录
    history: {
      title: '交易历史',
      type: '类型',
      amount: '数量',
      date: '日期',
      status: '状态',
      txHash: '交易哈希',
      viewOnExplorer: '在浏览器中查看',
      filter: '筛选',
      all: '全部',
      stake: '质押',
      unstake: '取消质押',
      claim: '领取',
      referralReward: '邀请奖励'
    },
    
    // 状态
    status: {
      pending: '待处理',
      completed: '已完成',
      failed: '失败',
      processing: '处理中'
    },
    
    // 错误信息
    errors: {
      insufficientBalance: '余额不足',
      invalidAmount: '无效金额',
      networkError: '网络错误',
      transactionFailed: '交易失败',
      walletNotConnected: '钱包未连接',
      unsupportedToken: '不支持的代币'
    },
    
    // 邀请
    referral: {
      title: '邀请计划',
      yourLink: '您的邀请链接',
      totalReferrals: '总邀请数',
      referralRewards: '邀请奖励',
      inviteFriends: '邀请朋友',
      copyLink: '复制链接',
      shareLink: '分享链接',
      bindReferrer: '绑定上级',
      changeReferrer: '更换上级',
      currentReferrer: '当前上级',
      enterReferrerAddress: '输入上级地址',
      addressPlaceholder: '请输入有效的钱包地址',
      invalidAddress: '无效的地址',
      bind: '绑定',
      change: '更换',
      bindDescription: '绑定上级后，您的首次质押将为上级带来以下奖励：',
      ethReward: 'ETH：质押超过0.027 ETH时，上级获得20 USDT奖励',
      bnbReward: 'BNB：质押超过0.125 BNB时，上级获得20 USDT奖励',
      arbReward: 'ARB：质押超过100 USDT时，上级获得20 USDT奖励',
      nexafiReward: 'NexaFi：质押超过10,000 NexaFi时，上级获得20 USDT奖励'
    },
    
    // 奖励
    rewards: {
      rewardsOverTime: '奖励趋势',
      chartPlaceholder: '图表将在此处显示',
      referralRewards: '邀请奖励',
      totalReferralRewards: '总邀请奖励'
    },
    
    // 主题
    theme: {
      light: '浅色模式',
      dark: '深色模式'
    }
  }
}

// 从本地存储加载语言
const loadLanguage = () => {
  const savedLanguage = localStorage.getItem(STORAGE_KEYS.LANGUAGE)
  if (savedLanguage && ['en', 'zh'].includes(savedLanguage)) {
    currentLanguage.value = savedLanguage
  } else {
    // 检查浏览器语言偏好
    const browserLanguage = navigator.language.toLowerCase()
    currentLanguage.value = browserLanguage.startsWith('zh') ? 'zh' : 'en'
  }
}

// 切换语言
const setLanguage = (lang) => {
  if (['en', 'zh'].includes(lang)) {
    currentLanguage.value = lang
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang)
  }
}

// 获取翻译文本
const t = (key, params = {}) => {
  const keys = key.split('.')
  let value = messages[currentLanguage.value]
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      // 如果找不到翻译，返回英文版本
      value = messages.en
      for (const k2 of keys) {
        if (value && typeof value === 'object' && k2 in value) {
          value = value[k2]
        } else {
          return key // 如果英文版本也没有，返回key
        }
      }
      break
    }
  }
  
  // 替换参数
  if (typeof value === 'string' && Object.keys(params).length > 0) {
    return value.replace(/\{(\w+)\}/g, (match, param) => {
      return params[param] || match
    })
  }
  
  return value || key
}

// 获取当前语言的计算属性
const locale = computed(() => currentLanguage.value)

export const useI18n = () => {
  return {
    currentLanguage,
    locale,
    t,
    setLanguage,
    loadLanguage,
    messages
  }
}