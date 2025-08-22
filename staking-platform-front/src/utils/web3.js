import { ethers } from 'ethers'
import { NETWORKS } from '@/config'

class Web3Wallet {
  constructor() {
    this.provider = null
    this.signer = null
    this.address = null
    this.chainId = null
    this.isConnected = false
    this.contractMap = {}
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
      console.log('Network on connect:', network);
      
      // 确保 chainId 格式与 getCurrentNetwork 中的比较一致
      this.chainId = parseInt(network.chainId.toString())
      console.log('Set chainId on connect:', this.chainId);
      
      this.isConnected = true
      
      // 监听账户变化
      this.setupEventListeners()
      
      // 检查当前网络是否在支持列表中
      const currentNetwork = this.getCurrentNetwork();
      console.log('Current network on connect:', currentNetwork);
      
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

  // 创建合约实例
  createContract(contractName, contractAddress, abi) {
    try {
      if (!this.provider) {
        throw new Error('Wallet not connected')
      }
      
      const contract = new ethers.Contract(contractAddress, abi, this.signer)
      this.contractMap[contractName] = contract
      return contract;
    } catch (error) {
      console.error('Failed to create contract instance:', error)
      throw error
    }
  }

  // 执行合约方法

  async callContractMethod(contractName, methodName, ...args) {
    try {
      if (!this.provider) {
        throw new Error('Wallet not connected')
      }
      
      const contract = this.contractMap[contractName]
      if (!contract) {
        throw new Error(`Contract "${contractName}" not found`)
      }
      
      const result = await contract[methodName](...args)
      return result
    } catch (error) {
      console.error('Failed to call contract method:', error)
      throw error
    }
  }
  
  // 执行合约方法并返回交易哈希
  async callContractMethodWithTx(contractName, methodName, ...args) {
    try {
      if (!this.provider) {
        throw new Error('Wallet not connected')
      }
      
      const contract = this.contractMap[contractName]
      if (!contract) {
        throw new Error(`Contract "${contractName}" not found`)
      }
      
      // 发送交易
      const tx = await contract[methodName](...args)
      
      // 等待交易被确认
      const receipt = await tx.wait()
      
      return {
        success: true,
        hash: receipt.hash || tx.hash,
        receipt: receipt,
        transaction: tx
      }
    } catch (error) {
      console.error('Failed to call contract method with transaction:', error)
      return {
        success: false,
        error: error.message || '交易失败'
      }
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
      console.log('Switching to network with chainId:', chainId);
      
      // 检查 chainId 是否已经是十六进制格式
      const hexChainId = chainId.toString().startsWith('0x') ? chainId : `0x${chainId.toString(16)}`
      console.log('Hex chainId for wallet_switchEthereumChain:', hexChainId);
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChainId }]
      })
      
      // 网络切换后重新初始化 provider 和 signer
      this.provider = new ethers.BrowserProvider(window.ethereum)
      this.signer = await this.provider.getSigner()
      
      // 更新 chainId
      const network = await this.provider.getNetwork()
      console.log('Network after switch:', network);
      
      // 确保 chainId 格式与 getCurrentNetwork 中的比较一致
      this.chainId = parseInt(network.chainId.toString())
      console.log('Updated this.chainId:', this.chainId);
      
      return {
        chainId: this.chainId,
        success: true
      }
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
    console.log('Adding network with chainId:', chainId);
    
    const networkConfig = Object.values(NETWORKS).find(
      config => parseInt(config.chainId, 16) === chainId
    )
    
    if (!networkConfig) {
      throw new Error(`Unsupported network: ${chainId}`)
    }

    console.log('Network config for adding:', networkConfig);

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
      
      // 网络添加后重新初始化 provider 和 signer
      this.provider = new ethers.BrowserProvider(window.ethereum)
      this.signer = await this.provider.getSigner()
      
      // 更新 chainId
      const network = await this.provider.getNetwork()
      console.log('Network after add:', network);
      
      // 确保 chainId 格式与 getCurrentNetwork 中的比较一致
      this.chainId = parseInt(network.chainId.toString())
      console.log('Updated this.chainId after add:', this.chainId);
      
      return {
        chainId: this.chainId,
        success: true
      }
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
    // 如果没有 chainId，返回 null
    if (!this.chainId) {
      return null;
    }
    
    // 将 chainId 转换为十进制数字进行比较
    // 这样无论 chainId 是十六进制字符串还是数字，都能正确匹配
    const decimalChainId = typeof this.chainId === 'string' && this.chainId.startsWith('0x') 
      ? parseInt(this.chainId, 16) 
      : Number(this.chainId);
    
    // 查找匹配的网络
    const network = Object.values(NETWORKS).find(config => {
      const configChainId = parseInt(config.chainId, 16);
      return configChainId === decimalChainId;
    });
    
    return network;
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
        console.log('Chain changed event:', chainId);
        this.chainId = parseInt(chainId, 16)
        console.log('Updated chainId from event:', this.chainId);
        
        // 检查当前网络
        const currentNetwork = this.getCurrentNetwork();
        console.log('Current network after chain change:', currentNetwork);
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