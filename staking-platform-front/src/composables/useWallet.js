import { ref, computed, nextTick } from 'vue'
import { web3Wallet } from '@/utils/web3'
import { STORAGE_KEYS } from '@/config'
import { eventBus, EVENTS } from '@/utils/eventBus'
import { useI18n } from '@/composables/useI18n'

const isConnected = ref(false)
const address = ref('')
const chainId = ref(null)
const balance = ref('0')
const isConnecting = ref(false)
const provider = ref(null)
const signer = ref(null)

// 连接钱包
const connectWallet = async () => {
  try {
    isConnecting.value = true
    const result = await web3Wallet.connect()
    
    isConnected.value = result.isConnected
    address.value = result.address
    chainId.value = result.chainId
    
    // 保存到本地存储
    localStorage.setItem(STORAGE_KEYS.WALLET_ADDRESS, result.address)
    
    // 设置provider
    provider.value = web3Wallet.provider
    signer.value = web3Wallet.signer
    
    // 获取余额
    await updateBalance()
    
    return result
  } catch (error) {
    console.error('Failed to connect wallet:', error)
    throw error
  } finally {
    isConnecting.value = false
  }
}

// 断开钱包连接
const disconnectWallet = () => {
  web3Wallet.disconnect()
  isConnected.value = false
  address.value = ''
  chainId.value = null
  balance.value = '0'
  provider.value = null
  signer.value = null
  
  // 清除本地存储
  localStorage.removeItem(STORAGE_KEYS.WALLET_ADDRESS)
}

// 更新余额
const updateBalance = async () => {
  try {
    if (isConnected.value) {
      const newBalance = await web3Wallet.getBalance()
      balance.value = newBalance
    }
  } catch (error) {
    console.error('Failed to update balance:', error)
  }
}

// 获取i18n
const { t } = useI18n()

// 切换网络
const switchNetwork = async (targetChainId) => {
  try {
    // 显示全局loading
    eventBus.emit(EVENTS.SHOW_LOADING, t('wallet.switchNetwork') + '...')
    
    const result = await web3Wallet.switchNetwork(targetChainId)
    // 使用 web3Wallet 返回的 chainId，确保与钱包实际链 ID 一致
    chainId.value = result.chainId
    
    // 更新provider
    provider.value = web3Wallet.provider
    signer.value = web3Wallet.signer
    
    await updateBalance()
    return true
  } catch (error) {
    console.error('Failed to switch network:', error)
    throw error
  } finally {
    // 隐藏全局loading
    eventBus.emit(EVENTS.HIDE_LOADING)
  }
}

// 格式化地址
const formatAddress = computed(() => {
  return address.value ? web3Wallet.formatAddress(address.value) : ''
})

// 获取当前网络信息
const currentNetwork = computed(() => {
  console.log('Computing currentNetwork with chainId:', chainId.value);
  const network = web3Wallet.getCurrentNetwork();
  console.log('Computed network:', network);
  return network;
})

// 检查是否支持当前网络
const isSupportedNetwork = computed(() => {
  return web3Wallet.isSupportedNetwork()
})

// 格式化余额
const formattedBalance = computed(() => {
  const bal = parseFloat(balance.value)
  if (bal === 0) return '0'
  if (bal < 0.0001) return '< 0.0001'
  return bal.toFixed(4)
})

// 初始化钱包连接（页面加载时检查）
const initWallet = async () => {
  console.log('Initializing wallet', 'useWallet')
  try {
    const savedAddress = localStorage.getItem(STORAGE_KEYS.WALLET_ADDRESS)
    if (savedAddress && web3Wallet.isWalletInstalled()) {
      // 尝试重新连接
      const accounts = await window.ethereum.request({ method: 'eth_accounts' })
      if (accounts.length > 0 && accounts[0].toLowerCase() === savedAddress.toLowerCase()) {
        await connectWallet()
      }
    }
  } catch (error) {
    console.error('Failed to initialize wallet:', error)
  }
}

// 监听钱包事件
const setupWalletListeners = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    // 监听账户变化
    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet()
      } else if (accounts[0] !== address.value) {
        disconnectWallet();
        nextTick(() => {
          address.value = accounts[0]
          connectWallet()
        })
      }
    })

    // 监听网络变化
    window.ethereum.on('chainChanged', (newChainId) => {
      disconnectWallet();
        nextTick(() => {
          chainId.value = parseInt(newChainId, 16)
          connectWallet()
        })
    })
  }
}

export const useWallet = () => {
  return {
    // 状态
    isConnected,
    address,
    chainId,
    balance,
    isConnecting,
    provider,
    signer,
    
    // 计算属性
    formatAddress,
    currentNetwork,
    isSupportedNetwork,
    formattedBalance,
    
    // 方法
    connectWallet,
    disconnectWallet,
    updateBalance,
    switchNetwork,
    initWallet,
    setupWalletListeners
  }
}
