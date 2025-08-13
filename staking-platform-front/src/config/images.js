// 代币图片配置
export const TOKEN_IMAGES = {
  // 主要代币
  ETH: 'https://wufeng98.cn/imgServerApi/images/1bae875e-951d-4fb6-9967-a7c12b326adf.png',
  BNB: 'https://wufeng98.cn/imgServerApi/images/7151f34e-2b93-4684-91e9-c74d25d1c70f.png',
  USDT: 'https://wufeng98.cn/imgServerApi/images/8b4ac19c-a29c-490f-9a91-6ffe467fed7e.png',
  NexaFi: 'https://wufeng98.cn/imgServerApi/images/ef9ac546-c8c7-4d49-a8e2-24c98c962023.png',
  
  // 其他可能的代币
  MATIC: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
  USDC: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
  DAI: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png',
  WETH: 'https://wufeng98.cn/imgServerApi/images/1bae875e-951d-4fb6-9967-a7c12b326adf.png',
  WBNB: 'https://wufeng98.cn/imgServerApi/images/7151f34e-2b93-4684-91e9-c74d25d1c70f.png'
}

// 区块链网络图片配置
export const CHAIN_IMAGES = {
  ethereum: 'https://wufeng98.cn/imgServerApi/images/1bae875e-951d-4fb6-9967-a7c12b326adf.png',
  bsc: 'https://wufeng98.cn/imgServerApi/images/7151f34e-2b93-4684-91e9-c74d25d1c70f.png',
  arbitrum: 'https://wufeng98.cn/imgServerApi/images/31700eb9-c76b-4010-adcc-554ed3f5fdff.png',
  polygon: 'https://cryptologos.cc/logos/polygon-matic-logo.png'
}

// 获取代币图片的工具函数
export const getTokenImage = (tokenSymbol) => {
  return TOKEN_IMAGES[tokenSymbol] || TOKEN_IMAGES.ETH // 默认使用ETH图片
}

// 获取链图片的工具函数
export const getChainImage = (chainKey) => {
  return CHAIN_IMAGES[chainKey] || CHAIN_IMAGES.ethereum // 默认使用以太坊图片
}

// 图片预加载函数
export const preloadImages = () => {
  const allImages = [...Object.values(TOKEN_IMAGES), ...Object.values(CHAIN_IMAGES)]
  
  allImages.forEach(src => {
    const img = new Image()
    img.src = src
  })
}