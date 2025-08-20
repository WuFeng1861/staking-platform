import { ethers } from 'ethers';
import stakingContractAbi from '../assets/stakingContractAbi';
import nexaFiContractAbi from '../assets/NexaFiContractAbi';
import { getContractAddressesByChainId } from '../config/contracts';
import web3Wallet from './web3';

/**
 * 合约交互工具类
 * 封装了与 StakingContract 和 NexaFiContract 的交互方法
 */
class ContractInteractions {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.stakingContract = null;
    this.nexaFiContract = null;
    this.stakingContractAddress = null;
    this.nexaFiContractAddress = null;
    this.chainId = null;
  }

  /**
   * 初始化合约连接
   * @param {Object} provider - Web3提供者
   * @param {number} chainId - 当前链ID
   * @param {string} stakingContractAddress - Staking合约地址（可选，如果不提供则根据chainId自动获取）
   * @param {string} nexaFiContractAddress - NexaFi合约地址（可选，如果不提供则根据chainId自动获取）
   */
  async initialize(provider, signer, chainId, stakingContractAddress, nexaFiContractAddress) {
    console.log("开始初始化合约 ContractInteractions", provider, chainId);
    if (!provider) {
      throw new Error('Provider is required');
    }

    this.provider = provider;
    this.signer = signer;
    this.chainId = chainId;
    
    // 更新合约地址（如果没有提供合约地址，则根据chainId自动获取）
    const addresses = await this.updateContractAddresses(
      stakingContractAddress, 
      nexaFiContractAddress, 
      chainId
    );
    
    return {
      stakingContractAddress: addresses.stakingContractAddress,
      nexaFiContractAddress: addresses.nexaFiContractAddress,
      chainId: this.chainId
    };
  }

  /**
   * 更新合约地址
   * @param {string} stakingContractAddress - Staking合约地址（可选，如果不提供则根据chainId自动获取）
   * @param {string} nexaFiContractAddress - NexaFi合约地址（可选，如果不提供则根据chainId自动获取）
   * @param {number} chainId - 链ID（可选，如果提供则根据链ID自动获取合约地址）
   */
  async updateContractAddresses(stakingContractAddress, nexaFiContractAddress, chainId) {
    if (!this.provider || !this.signer) {
      throw new Error('Provider and signer must be initialized first');
    }

    // 如果提供了chainId，则根据chainId获取合约地址
    if (chainId && !stakingContractAddress && !nexaFiContractAddress) {
      const contractAddresses = getContractAddressesByChainId(chainId);
      stakingContractAddress = contractAddresses.stakingContract;
      nexaFiContractAddress = contractAddresses.nexaFiContract;
    }

    this.stakingContractAddress = stakingContractAddress;
    this.nexaFiContractAddress = nexaFiContractAddress;

    // 初始化合约实例 - 使用 ethers.js v6 的方式
    if (stakingContractAddress) {
      // 使用 ethers.Contract 而不是 BaseContract
      this.stakingContract = web3Wallet.createContract('stakingContract', stakingContractAddress, stakingContractAbi);
    } else {
      this.stakingContract = null;
    }

    if (nexaFiContractAddress) {
      // 使用 ethers.Contract 而不是 BaseContract
      this.nexaFiContract = web3Wallet.createContract('nexaFiContract', nexaFiContractAddress, nexaFiContractAbi);
    } else {
      this.nexaFiContract = null;
    }

    return {
      stakingContractAddress: this.stakingContractAddress,
      nexaFiContractAddress: this.nexaFiContractAddress
    };
  }

  /**
   * 检查用户是否已经绑定了上级推荐人
   * @param {string} userAddress - 用户地址，如果不提供则使用当前连接的钱包地址
   * @returns {Promise<Object>} 包含是否绑定及推荐人地址的对象
   */
  async checkReferrerBinding(userAddress = null) {
    if (!this.stakingContract) {
      throw new Error('Staking contract not initialized');
    }

    try {
      // 如果没有提供用户地址，则使用当前连接的钱包地址
      if (!userAddress) {
        userAddress = await this.signer.getAddress();
      }

      if (!ethers.isAddress(userAddress)) {
        throw new Error('Invalid user address');
      }
      console.log("Contract Instance:", this.stakingContract);
      console.log("User Address:", userAddress); 
      // 调用合约的referrers映射查询用户的推荐人
      const referrerAddress = await web3Wallet.callContractMethod('stakingContract', "referrers", userAddress);
      
      // 检查返回的地址是否为零地址（未绑定）
      const isZeroAddress = referrerAddress === '0x0000000000000000000000000000000000000000';
      
      console.log(`User ${userAddress} is bound to referrer ${referrerAddress}`);
      return {
        isBound: !isZeroAddress,
        referrerAddress: isZeroAddress ? null : referrerAddress
      };
    } catch (error) {
      console.error('Error checking referrer binding:', error);
      throw error;
    }
  }

  /**
   * 绑定上级推荐人
   * @param {string} referrerAddress - 推荐人地址
   * @returns {Promise<Object>} 交易结果，包含交易hash
   */
  async bindReferrer(referrerAddress) {
    if (!this.stakingContract) {
      throw new Error('Staking contract not initialized');
    }

    if (!ethers.isAddress(referrerAddress)) {
      throw new Error('Invalid referrer address');
    }

    try {
      // 检查用户是否已经绑定了推荐人
      const bindingStatus = await this.checkReferrerBinding();
      if (bindingStatus.isBound) {
        throw new Error('User has already bound a referrer');
      }

      // 调用合约的bindReferrer函数
      const tx = await this.stakingContract.bindReferrer(referrerAddress);
      
      // 等待交易被确认
      const receipt = await tx.wait();
      
      return {
        success: true,
        hash: receipt.transactionHash,
        receipt
      };
    } catch (error) {
      console.error('Error binding referrer:', error);
      throw error;
    }
  }

  /**
   * 转账NexaFi代币
   * @param {string} toAddress - 接收者地址
   * @param {string|number} amount - 转账金额
   * @returns {Promise<Object>} 交易结果，包含交易hash
   */
  async transferNexaFi(toAddress, amount) {
    if (!this.nexaFiContract) {
      throw new Error('NexaFi contract not initialized');
    }

    if (!ethers.utils.isAddress(toAddress)) {
      throw new Error('Invalid recipient address');
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      throw new Error('Invalid amount');
    }

    try {
      // 调用合约的transfer函数
      const tx = await this.nexaFiContract.transfer(toAddress, amount);
      
      // 等待交易被确认
      const receipt = await tx.wait();
      
      return {
        success: true,
        hash: receipt.transactionHash,
        receipt
      };
    } catch (error) {
      console.error('Error transferring NexaFi tokens:', error);
      throw error;
    }
  }
}

// 导出单例实例
const contractInteractions = new ContractInteractions();
export default contractInteractions;