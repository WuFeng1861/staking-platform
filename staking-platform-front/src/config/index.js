import { TOKEN_IMAGES, CHAIN_IMAGES, getTokenImage, getChainImage } from './images.js'

// 应用配置
export const APP_CONFIG = {
  name: 'NexaFi',
  version: '1.0.0',
  description: 'Decentralized Staking Platform',
  defaultLanguage: 'en',
  defaultTheme: 'light',
  supportedLanguages: ['en', 'zh'],
  supportedThemes: ['light', 'dark']
}

// 存储键名
export const STORAGE_KEYS = {
  THEME: 'nexafi_theme',
  LANGUAGE: 'nexafi_language',
  WALLET_ADDRESS: 'nexafi_wallet_address',
  CONNECTED_WALLET: 'nexafi_connected_wallet',
  REFERRER_ADDRESS: 'nexafi_referrer_address',
  SELECTED_CHAIN: 'nexafi_selected_chain'
}

// 支持的区块链网络配置
export const NETWORKS = {
  ethereum: {
    chainId: '0x1',
    chainName: 'Ethereum',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://mainnet.infura.io/v3/YOUR_INFURA_KEY'],
    blockExplorerUrls: ['https://etherscan.io'],
    icon: getChainImage('ethereum')
  },
  bsc: {
    chainId: '0x38',
    chainName: 'BSC',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    },
    rpcUrls: ['https://bsc-dataseed1.binance.org'],
    blockExplorerUrls: ['https://bscscan.com'],
    icon: getChainImage('bsc')
  },
  arbitrum: {
    chainId: '0xa4b1',
    chainName: 'ARBITRUM',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://arbiscan.io'],
    icon: getChainImage('arbitrum')
  }
}

// 代币配置
export const TOKEN_CONFIG = {
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    icon: getTokenImage('ETH'),
    coingeckoId: 'ethereum'
  },
  BNB: {
    symbol: 'BNB',
    name: 'BNB',
    decimals: 18,
    icon: getTokenImage('BNB'),
    coingeckoId: 'binancecoin'
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    icon: getTokenImage('USDT'),
    coingeckoId: 'tether'
  },
  NexaFi: {
    symbol: 'NexaFi',
    name: 'NexaFi Token',
    decimals: 18,
    icon: getTokenImage('NexaFi'),
    coingeckoId: 'nexafi'
  }
}

// 按链分类的质押池配置
export const STAKING_POOLS_BY_CHAIN = {
  ethereum: {
    chainInfo: {
      key: 'ethereum',
      name: 'Ethereum',
      symbol: 'ETH',
      icon: getChainImage('ethereum'),
      ...NETWORKS.ethereum
    },
    pools: [
      {
        id: 'eth-eth-pool',
        chainKey: 'ethereum',
        chainName: 'Ethereum',
        chainIcon: getChainImage('ethereum'),
        name: 'ETH Staking Pool',
        token: 'ETH',
        tokenInfo: TOKEN_CONFIG.ETH,
        apy: 5.2,
        totalStaked: 12500.75,
        minStake: 0.1,
        maxStake: 1000,
        lockPeriod: 0, // 0 表示灵活质押
        participants: 1250,
        contractAddress: '0x1234567890123456789012345678901234567890',
        isActive: true,
        rewards: {
          token: 'ETH',
          rate: 0.052 // 年化收益率
        }
      },
      {
        id: 'eth-usdt-pool',
        chainKey: 'ethereum',
        chainName: 'Ethereum',
        chainIcon: getChainImage('ethereum'),
        name: 'USDT Staking Pool',
        token: 'USDT',
        tokenInfo: TOKEN_CONFIG.USDT,
        apy: 6.8,
        totalStaked: 850000,
        minStake: 100,
        maxStake: 50000,
        lockPeriod: 30,
        participants: 2100,
        contractAddress: '0x2345678901234567890123456789012345678901',
        isActive: true,
        rewards: {
          token: 'USDT',
          rate: 0.068
        }
      },
      {
        id: 'eth-nexafi-pool',
        chainKey: 'ethereum',
        chainName: 'Ethereum',
        chainIcon: getChainImage('ethereum'),
        name: 'NexaFi Staking Pool',
        token: 'NexaFi',
        tokenInfo: TOKEN_CONFIG.NexaFi,
        apy: 15.5,
        totalStaked: 2500000,
        minStake: 1000,
        maxStake: 100000,
        lockPeriod: 90,
        participants: 850,
        contractAddress: '0x3456789012345678901234567890123456789012',
        isActive: true,
        rewards: {
          token: 'NexaFi',
          rate: 0.155
        }
      }
    ]
  },
  
  bsc: {
    chainInfo: {
      key: 'bsc',
      name: 'BSC',
      symbol: 'BNB',
      icon: getChainImage('bsc'),
      ...NETWORKS.bsc
    },
    pools: [
      {
        id: 'bsc-bnb-pool',
        chainKey: 'bsc',
        chainName: 'BSC',
        chainIcon: getChainImage('bsc'),
        name: 'BNB Staking Pool',
        token: 'BNB',
        tokenInfo: TOKEN_CONFIG.BNB,
        apy: 7.3,
        totalStaked: 8500.25,
        minStake: 0.1,
        maxStake: 1000,
        lockPeriod: 0,
        participants: 1850,
        contractAddress: '0x4567890123456789012345678901234567890123',
        isActive: true,
        rewards: {
          token: 'BNB',
          rate: 0.073
        }
      },
      {
        id: 'bsc-usdt-pool',
        chainKey: 'bsc',
        chainName: 'BSC',
        chainIcon: getChainImage('bsc'),
        name: 'USDT Staking Pool',
        token: 'USDT',
        tokenInfo: TOKEN_CONFIG.USDT,
        apy: 8.1,
        totalStaked: 650000,
        minStake: 50,
        maxStake: 30000,
        lockPeriod: 30,
        participants: 2800,
        contractAddress: '0x5678901234567890123456789012345678901234',
        isActive: true,
        rewards: {
          token: 'USDT',
          rate: 0.081
        }
      },
      {
        id: 'bsc-nexafi-pool',
        chainKey: 'bsc',
        chainName: 'BSC',
        chainIcon: getChainImage('bsc'),
        name: 'NexaFi Staking Pool',
        token: 'NexaFi',
        tokenInfo: TOKEN_CONFIG.NexaFi,
        apy: 18.2,
        totalStaked: 1800000,
        minStake: 500,
        maxStake: 80000,
        lockPeriod: 60,
        participants: 1200,
        contractAddress: '0x6789012345678901234567890123456789012345',
        isActive: true,
        rewards: {
          token: 'NexaFi',
          rate: 0.182
        }
      }
    ]
  },
  
  arbitrum: {
    chainInfo: {
      key: 'arbitrum',
      name: 'ARBITRUM',
      symbol: 'ETH',
      icon: getChainImage('arbitrum'),
      ...NETWORKS.arbitrum
    },
    pools: [
      {
        id: 'arb-eth-pool',
        chainKey: 'arbitrum',
        chainName: 'ARBITRUM',
        chainIcon: getChainImage('arbitrum'),
        name: 'ETH Staking Pool',
        token: 'ETH',
        tokenInfo: TOKEN_CONFIG.ETH,
        apy: 4.8,
        totalStaked: 5500.5,
        minStake: 0.05,
        maxStake: 500,
        lockPeriod: 0,
        participants: 950,
        contractAddress: '0x7890123456789012345678901234567890123456',
        isActive: true,
        rewards: {
          token: 'ETH',
          rate: 0.048
        }
      },
      {
        id: 'arb-usdt-pool',
        chainKey: 'arbitrum',
        chainName: 'ARBITRUM',
        chainIcon: getChainImage('arbitrum'),
        name: 'USDT Staking Pool',
        token: 'USDT',
        tokenInfo: TOKEN_CONFIG.USDT,
        apy: 6.2,
        totalStaked: 420000,
        minStake: 50,
        maxStake: 25000,
        lockPeriod: 14,
        participants: 1650,
        contractAddress: '0x8901234567890123456789012345678901234567',
        isActive: true,
        rewards: {
          token: 'USDT',
          rate: 0.062
        }
      },
      {
        id: 'arb-nexafi-pool',
        chainKey: 'arbitrum',
        chainName: 'ARBITRUM',
        chainIcon: getChainImage('arbitrum'),
        name: 'NexaFi Staking Pool',
        token: 'NexaFi',
        tokenInfo: TOKEN_CONFIG.NexaFi,
        apy: 12.8,
        totalStaked: 1200000,
        minStake: 500,
        maxStake: 60000,
        lockPeriod: 45,
        participants: 680,
        contractAddress: '0x9012345678901234567890123456789012345678',
        isActive: true,
        rewards: {
          token: 'NexaFi',
          rate: 0.128
        }
      }
    ]
  }
}

// 工具函数：获取所有质押池
export const getAllStakingPools = () => {
  const allPools = []
  Object.values(STAKING_POOLS_BY_CHAIN).forEach(chain => {
    allPools.push(...chain.pools)
  })
  return allPools
}

// 工具函数：根据链获取质押池
export const getPoolsByChain = (chainKey) => {
  return STAKING_POOLS_BY_CHAIN[chainKey]?.pools || []
}

// 工具函数：根据ID获取质押池
export const getPoolById = (poolId) => {
  const allPools = getAllStakingPools()
  return allPools.find(pool => pool.id === poolId)
}

// 工具函数：获取支持的链列表
export const getSupportedChains = () => {
  return Object.keys(STAKING_POOLS_BY_CHAIN).map(key => ({
    key,
    ...STAKING_POOLS_BY_CHAIN[key].chainInfo
  }))
}

// 邀请链接配置
export const REFERRAL_CONFIG = {
  baseUrl: 'https://nexafi.com/ref/',
}

// API 配置
export const API_CONFIG = {
  baseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://api.nexafi.com' 
    : 'http://localhost:3001',
  timeout: 10000,
  retryAttempts: 3
}

// 代币合约地址配置（按链分类）
export const TOKEN_CONTRACTS = {
  ethereum: {
    // 以太坊主网上的代币合约地址
    ETH: null, // 原生代币没有合约地址
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    NexaFi: '0x123456' // 测试地址
  },
  bsc: {
    // BSC上的代币合约地址
    BNB: null, // 原生代币没有合约地址
    USDT: '0x55d398326f99059fF775485246999027B3197955',
    NexaFi: '0xA5a386410307C525E4707C7f9C3de73b19EC4Fb6'
  },
  arbitrum: {
    // Arbitrum上的代币合约地址
    ETH: null, // 原生代币没有合约地址
    USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    NexaFi: '0x123456' // 测试地址
  }
}

// 获取指定链上指定代币的合约地址
export const getTokenContract = (chainKey, tokenSymbol) => {
  if (!TOKEN_CONTRACTS[chainKey] || !TOKEN_CONTRACTS[chainKey][tokenSymbol]) {
    return null;
  }
  return TOKEN_CONTRACTS[chainKey][tokenSymbol];
}

// 导出图片配置
export { TOKEN_IMAGES, CHAIN_IMAGES, getTokenImage, getChainImage }