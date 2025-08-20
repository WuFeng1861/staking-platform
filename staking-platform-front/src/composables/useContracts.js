import { ref, watch } from 'vue'
import { useWallet } from './useWallet'
import contractInteractions from '@/utils/contractInteractions'
import { getContractAddressesByChainId } from '@/config/contracts'

// 合约状态
const isInitialized = ref(false)
const stakingContractAddress = ref(null)
const nexaFiContractAddress = ref(null)
const hasReferrer = ref(false)
const referrerAddress = ref(null)

/**
 * 合约交互 Composable
 * 管理合约的初始化和交互
 */
export function useContracts() {
  const { isConnected, chainId, provider, signer } = useWallet()

  /**
   * 初始化合约
   */
  const initializeContracts = async () => {
    if (!isConnected.value || !provider.value) {
      isInitialized.value = false
      stakingContractAddress.value = null
      nexaFiContractAddress.value = null
      hasReferrer.value = false
      referrerAddress.value = null
      return
    }

    try {
      // 根据当前链ID获取合约地址
      const result = await contractInteractions.initialize(
        provider.value,
        signer.value,
        chainId.value
      )

      stakingContractAddress.value = result.stakingContractAddress
      nexaFiContractAddress.value = result.nexaFiContractAddress
      isInitialized.value = true

      console.log('合约初始化成功:', {
        chainId: chainId.value,
        stakingContractAddress: stakingContractAddress.value,
        nexaFiContractAddress: nexaFiContractAddress.value
      })

      // 初始化后检查用户是否已绑定推荐人
      await checkReferrerBinding()

      return result
    } catch (error) {
      console.error('合约初始化失败:', error)
      isInitialized.value = false
      hasReferrer.value = false
      referrerAddress.value = null
      throw error
    }
  }

  /**
   * 检查用户是否已绑定推荐人
   * @param {string} userAddress - 用户地址（可选）
   * @returns {Promise<Object>} 绑定状态
   */
  const checkReferrerBinding = async (userAddress = null) => {
    if (!isInitialized.value) {
      // 如果合约未初始化，先尝试初始化
      if (isConnected.value && provider.value) {
        await initializeContracts()
      } else {
        hasReferrer.value = false
        referrerAddress.value = null
        return { isBound: false, referrerAddress: null }
      }
    }

    try {
      // 调用合约方法检查绑定状态
      const result = await contractInteractions.checkReferrerBinding(userAddress)
      
      // 更新状态
      hasReferrer.value = result.isBound
      referrerAddress.value = result.referrerAddress
      
      return result
    } catch (error) {
      console.error('检查推荐人绑定状态失败:', error)
      hasReferrer.value = false
      referrerAddress.value = null
      return { isBound: false, referrerAddress: null }
    }
  }

  /**
   * 绑定推荐人
   * @param {string} referrerAddress - 推荐人地址
   * @returns {Promise<Object>} 交易结果
   */
  const bindReferrer = async (referrerAddress) => {
    if (!isInitialized.value) {
      await initializeContracts()
    }
    
    try {
      // 先检查是否已绑定推荐人
      const bindingStatus = await checkReferrerBinding()
      if (bindingStatus.isBound) {
        throw new Error('已经绑定了推荐人，无法重复绑定')
      }
      
      // 调用合约方法绑定推荐人
      const result = await contractInteractions.bindReferrer(referrerAddress)
      
      // 绑定成功后更新状态
      hasReferrer.value = true
      referrerAddress.value = referrerAddress
      
      return result
    } catch (error) {
      console.error('绑定推荐人失败:', error)
      throw error
    }
  }

  /**
   * 转账NexaFi代币
   * @param {string} toAddress - 接收者地址
   * @param {string|number} amount - 转账金额
   * @returns {Promise<Object>} 交易结果
   */
  const transferNexaFi = async (toAddress, amount) => {
    if (!isInitialized.value) {
      await initializeContracts()
    }
    return await contractInteractions.transferNexaFi(toAddress, amount)
  }

  // 监听钱包连接状态和链ID变化
  watch(
    [isConnected, chainId],
    async ([newIsConnected, newChainId], [oldIsConnected, oldChainId]) => {
      // 当钱包连接状态或链ID发生变化时，重新初始化合约
      if (
        newIsConnected !== oldIsConnected ||
        (newIsConnected && newChainId !== oldChainId)
      ) {
        if (newIsConnected) {
          console.log(newIsConnected, oldIsConnected, newChainId, oldChainId, '监听钱包连接状态和链ID变化');
          await initializeContracts()
        } else {
          isInitialized.value = false
          stakingContractAddress.value = null
          nexaFiContractAddress.value = null
        }
      }
    }
  )

  return {
    // 状态
    isInitialized,
    stakingContractAddress,
    nexaFiContractAddress,
    hasReferrer,
    referrerAddress,

    // 方法
    initializeContracts,
    bindReferrer,
    transferNexaFi,
    checkReferrerBinding
  }
}

export default useContracts