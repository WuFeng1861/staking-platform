// 合约地址配置（按链ID分类）
export const CONTRACT_ADDRESSES = {
  // 以太坊主网 (chainId: 1)
  '1': {
    stakingContract: '0x1234567890123456789012345678901234567890',
    nexaFiContract: '0x123456' // 测试地址
  },
  // BSC主网 (chainId: 56)
  '56': {
    stakingContract: '0x37800137E22a9844631559F98ea4E32dA54735F3',
    nexaFiContract: '0xA5a386410307C525E4707C7f9C3de73b19EC4Fb6'
  },
  // Arbitrum (chainId: 42161)
  '42161': {
    stakingContract: '0x9012345678901234567890123456789012345678',
    nexaFiContract: '0x123456' // 测试地址
  }
}

/**
 * 根据链ID获取合约地址
 * @param {number|string} chainId - 链ID
 * @returns {Object} 包含合约地址的对象
 */
export const getContractAddressesByChainId = (chainId) => {
  // 确保chainId是字符串
  const chainIdStr = String(chainId);
  
  // 返回对应链的合约地址，如果不存在则返回空对象
  return CONTRACT_ADDRESSES[chainIdStr] || {
    stakingContract: null,
    nexaFiContract: null
  };
}

export default {
  CONTRACT_ADDRESSES,
  getContractAddressesByChainId
}