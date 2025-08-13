import { ethers } from 'ethers'
import { NETWORKS } from '@/config'

class Web3Wallet {
  constructor() {
    this.provider = null
    this.signer = null
    this.address = null
    this.chainId = null
    this.isConnected = false
  }

  // 检查是否安装了钱包
  isWalletInstalled() {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined'
  }

  // 连接钱包
  async connect() {
    try {
      if (!this.isWalletInstalled()) {
        throw new Error('Please install MetaMask or another Web3 wallet')
      }

      // 请求连接钱包
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      
      // 创建provider和signer
      this.provider = new ethers.BrowserProvider(window.ethereum)
      this.signer = await this.provider.getSigner()
      this.address = await this.signer.getAddress()
      
      // 获取网络信息
      const network = await this.provider.getNetwork()
      this.chainId = Number(network.chainId)
      
      this.isConnected = true
      
      // 监听账户变化
      this.setupEventListeners()
      
      return {
        address: this.address,
        chainId: this.chainId,
        isConnected: this.isConnected
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      throw error
    }
  }

  // 断开连接
  disconnect() {
    this.provider = null
    this.signer = null
    this.address = null
    this.chainId = null
    this.isConnected = false
    
    // 移除事件监听器
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.removeAllListeners('accountsChanged')
      window.ethereum.removeAllListeners('chainChanged')
    }
  }

  // 切换网络
  async switchNetwork(chainId) {
    try {
      const hexChainId = `0x${chainId.toString(16)}`
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChainId }]
      })
      
      this.chainId = chainId
      return true
    } catch (error) {
      // 如果网络不存在，尝试添加网络
      if (error.code === 4902) {
        return await this.addNetwork(chainId)
      }
      throw error
    }
  }

  // 添加网络
  async addNetwork(chainId) {
    const networkConfig = Object.values(NETWORKS).find(
      config => parseInt(config.chainId, 16) === chainId
    )
    
    if (!networkConfig) {
      throw new Error(`Unsupported network: ${chainId}`)
    }

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: networkConfig.chainId,
          chainName: networkConfig.chainName,
          nativeCurrency: networkConfig.nativeCurrency,
          rpcUrls: networkConfig.rpcUrls,
          blockExplorerUrls: networkConfig.blockExplorerUrls
        }]
      })
      
      this.chainId = chainId
      return true
    } catch (error) {
      console.error('Failed to add network:', error)
      throw error
    }
  }

  // 获取余额
  async getBalance(tokenAddress = null) {
    try {
      if (!this.provider || !this.address) {
        throw new Error('Wallet not connected')
      }

      if (!tokenAddress) {
        // 获取原生代币余额
        const balance = await this.provider.getBalance(this.address)
        return ethers.formatEther(balance)
      } else {
        // 获取ERC20代币余额
        const tokenContract = new ethers.Contract(
          tokenAddress,
          ['function balanceOf(address) view returns (uint256)'],
          this.provider
        )
        const balance = await tokenContract.balanceOf(this.address)
        return ethers.formatUnits(balance, 18) // 假设18位小数
      }
    } catch (error) {
      console.error('Failed to get balance:', error)
      throw error
    }
  }

  // 发送交易
  async sendTransaction(to, value, data = '0x') {
    try {
      if (!this.signer) {
        throw new Error('Wallet not connected')
      }

      const tx = await this.signer.sendTransaction({
        to,
        value: ethers.parseEther(value.toString()),
        data
      })

      return tx
    } catch (error) {
      console.error('Failed to send transaction:', error)
      throw error
    }
  }

  // 签名消息
  async signMessage(message) {
    try {
      if (!this.signer) {
        throw new Error('Wallet not connected')
      }

      const signature = await this.signer.signMessage(message)
      return signature
    } catch (error) {
      console.error('Failed to sign message:', error)
      throw error
    }
  }

  // 获取当前网络信息
  getCurrentNetwork() {
    return Object.values(NETWORKS).find(
      config => parseInt(config.chainId, 16) === this.chainId
    )
  }

  // 格式化地址
  formatAddress(address, length = 6) {
    if (!address) return ''
    return `${address.slice(0, length)}...${address.slice(-4)}`
  }

  // 设置事件监听器
  setupEventListeners() {
    if (typeof window !== 'undefined' && window.ethereum) {
      // 监听账户变化
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          this.disconnect()
        } else {
          this.address = accounts[0]
        }
      })

      // 监听网络变化
      window.ethereum.on('chainChanged', (chainId) => {
        this.chainId = parseInt(chainId, 16)
      })
    }
  }

  // 检查是否支持当前网络
  isSupportedNetwork() {
    return Object.values(NETWORKS).some(
      config => parseInt(config.chainId, 16) === this.chainId
    )
  }
}

// 创建全局实例
export const web3Wallet = new Web3Wallet()

// 导出工具函数
export const formatTokenAmount = (amount, decimals = 18, precision = 4) => {
  const formatted = ethers.formatUnits(amount, decimals)
  return parseFloat(formatted).toFixed(precision)
}

export const parseTokenAmount = (amount, decimals = 18) => {
  return ethers.parseUnits(amount.toString(), decimals)
}

export const isValidAddress = (address) => {
  return ethers.isAddress(address)
}

export default web3Wallet