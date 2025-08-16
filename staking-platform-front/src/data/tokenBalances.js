import { ref, reactive, computed } from 'vue'
import { web3Wallet } from '@/utils/web3'
import { TOKEN_CONFIG, getTokenContract } from '@/config'
import { useWallet } from '@/composables/useWallet'

// 代币余额状态
const tokenBalances = reactive({
  isLoading: false,
  balances: {
    ETH: '0',
    BNB: '0',
    USDT: '0',
    NexaFi: '0'
  }
})

// 获取当前链上的三个代币余额
const fetchTokenBalances = async () => {
  const { isConnected, currentNetwork } = useWallet()
  
  if (!isConnected.value || !currentNetwork.value) {
    resetBalances()
    return
  }

  try {
    tokenBalances.isLoading = true
    const chainKey = currentNetwork.value.chainName.toLowerCase()
    
    // 获取当前链的原生代币
    const nativeToken = currentNetwork.value.nativeCurrency.symbol
    
    // 获取原生代币余额
    const nativeBalance = await web3Wallet.getBalance()
    tokenBalances.balances[nativeToken] = nativeBalance
    
    // 获取USDT余额
    const usdtContractAddress = getTokenContract(chainKey, 'USDT')
    if (usdtContractAddress) {
      try {
        const usdtBalance = await web3Wallet.getBalance(usdtContractAddress)
        tokenBalances.balances.USDT = usdtBalance
      } catch (error) {
        console.error('Failed to get USDT balance:', error)
        tokenBalances.balances.USDT = '0'
      }
    }
    
    // 获取NexaFi余额
    const nexaFiContractAddress = getTokenContract(chainKey, 'NexaFi')
    if (nexaFiContractAddress) {
      try {
        const nexaFiBalance = await web3Wallet.getBalance(nexaFiContractAddress)
        tokenBalances.balances.NexaFi = nexaFiBalance
      } catch (error) {
        console.error('Failed to get NexaFi balance:', error)
        tokenBalances.balances.NexaFi = '0'
      }
    }
  } catch (error) {
    console.error('Failed to fetch token balances:', error)
    resetBalances()
  } finally {
    tokenBalances.isLoading = false
  }
}

// 重置余额
const resetBalances = () => {
  tokenBalances.balances = {
    ETH: '0',
    BNB: '0',
    USDT: '0',
    NexaFi: '0'
  }
}

// 格式化余额
const formatBalance = (balance) => {
  const bal = parseFloat(balance)
  if (bal === 0) return '0'
  if (bal < 0.0001) return '< 0.0001'
  return bal.toFixed(4)
}

// 获取指定代币的余额
const getTokenBalance = (symbol) => {
  return tokenBalances.balances[symbol] || '0'
}

// 获取指定代币的格式化余额
const getFormattedTokenBalance = (symbol) => {
  return formatBalance(getTokenBalance(symbol))
}

// 获取当前链上的三个代币数据
const getCurrentChainTokens = () => {
  const { currentNetwork } = useWallet()
  
  if (!currentNetwork.value) {
    return [
      {
        symbol: 'ETH',
        name: TOKEN_CONFIG.ETH.name,
        icon: TOKEN_CONFIG.ETH.icon,
        balance: '0'
      },
      {
        symbol: 'USDT',
        name: TOKEN_CONFIG.USDT.name,
        icon: TOKEN_CONFIG.USDT.icon,
        balance: '0'
      },
      {
        symbol: 'NexaFi',
        name: TOKEN_CONFIG.NexaFi.name,
        icon: TOKEN_CONFIG.NexaFi.icon,
        balance: '0'
      }
    ]
  }
  
  const nativeToken = currentNetwork.value.nativeCurrency.symbol
  const nativeTokenConfig = TOKEN_CONFIG[nativeToken] || TOKEN_CONFIG.ETH
  
  return [
    {
      symbol: nativeToken,
      name: nativeTokenConfig.name,
      icon: nativeTokenConfig.icon,
      balance: getFormattedTokenBalance(nativeToken)
    },
    {
      symbol: 'USDT',
      name: TOKEN_CONFIG.USDT.name,
      icon: TOKEN_CONFIG.USDT.icon,
      balance: getFormattedTokenBalance('USDT')
    },
    {
      symbol: 'NexaFi',
      name: TOKEN_CONFIG.NexaFi.name,
      icon: TOKEN_CONFIG.NexaFi.icon,
      balance: getFormattedTokenBalance('NexaFi')
    }
  ]
}

export {
  tokenBalances,
  fetchTokenBalances,
  resetBalances,
  getTokenBalance,
  getFormattedTokenBalance,
  getCurrentChainTokens
}