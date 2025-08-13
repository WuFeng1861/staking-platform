/*
  编译记得打开--optimize-runs=200
*/
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./ReentrancyGuard.sol";
interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function decimals() external view returns (uint8);
    function allowance(address owner, address spender) external view returns (uint256);
}

contract NexaFiStaking is ReentrancyGuard {
    // Token地址常量
    address public constant tokenUsdt = 0x55d398326f99059fF775485246999027B3197955; // USDT地址
    address public constant tokenNexaFi = 0xA5a386410307C525E4707C7f9C3de73b19EC4Fb6; // NexaFi地址

    // NexaFi兑换比率 (NexaFi : 目标代币)
    uint256 public nexaFiToUsdtRatio = 100; // NexaFi对USDT的兑换比率，默认100:1
    uint256 public nexaFiToEthRatio = 80000; // NexaFi对ETH的兑换比率，默认410000:1 (100*4100)

    // 质押立刻给平台币比例
    uint256 public stakeRewardRatioNow = 10; // 质押立刻给平台币的奖励比例 (10%)
    
    // 推荐奖励阈值和奖励金额
    uint256 public referralRewardThresholdUsdt = 100 * 10**18; // 100 USDT
    uint256 public referralRewardThresholdEth = 125 * 10**15; // 0.125 ETH/BNB
    uint256 public referralRewardThresholdNexaFi = 100 * 10**18 * nexaFiToUsdtRatio; // 等值于100 USDT的NexaFi
    uint256 public referralRewardAmount = 20 * 10**18 * nexaFiToUsdtRatio; // 20 USDT等值的NexaFi

    // 权限控制
    address public owner;
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    // 质押池结构体
    struct Pool {
        uint256 poolId; // 质押池id
        address stakeToken; // 质押币种地址
        uint256 apr; // 年化收益率 (百分比)
        uint256 lockupPeriod; // 质押锁定时间(秒)
        uint256 maxStakeAmount; // 最大质押总量
        uint256 totalStaked; // 当前总质押量
    }

    // 用户质押记录结构体
    struct StakeRecord {
        uint256 stakeId; // 质押的id
        uint256 amount; // 质押数量
        uint256 stakeStartTime; // 质押时间
        uint256 lockedAPR; // 锁定的年化
        uint256 poolId; // 所属于的质押池id
        uint256 isWithdrawn; // 质押状态: 0-未取回, 1-已取回, 2-已转移, 3-已挂出交易
        uint256 lastClaimTime; // 上次取回时间
    }
    
    // 用户推荐关系
    mapping(address => address) public referrers; // 用户地址 => 推荐人地址
    mapping(address => bool) public hasStaked; // 记录用户是否已经质押过
    
    // 质押交易记录结构体
    struct StakeSale {
        address seller; // 卖家地址
        uint256 stakeId; // 质押ID
        uint256 price; // 售出价格
        bool isActive; // 是否处于活跃状态
        uint256 saleIndex; // 在挂出列表中的索引
    }

    // 池子ID到池子的映射
    mapping(uint256 => Pool) public pools;
    // 用户地址到质押记录数组的映射
    mapping(address => StakeRecord[]) public userStakes;
    // 池子ID到质押用户的数量
    mapping(uint256 => uint256) public poolStakersCount;
    // 质押ID到交易信息的映射
    mapping(address => mapping(uint256 => StakeSale)) public stakeSales;
    
    // 所有挂出交易的列表
    StakeSale[] public allStakeSales;
    
    // 活跃交易计数器
    uint256 public activeStakeSalesCount;
    
    // 池子ID计数器
    uint256 public poolIdCounter;

    constructor() {
        owner = msg.sender;

        // 创建默认质押池
        _createPool(address(0), 40, 180 days, 1000000 * 10**18); // ETH质押池
        _createPool(tokenUsdt, 40, 180 days, 1000000000 * 10**18); // USDT质押池
        _createPool(tokenNexaFi, 40, 180 days, 1000000000 * 10**18); // NexaFi质押池
    }

    function _createPool(address _stakeToken, uint256 _apr, uint256 _lockupPeriod, uint256 _maxStakeAmount) internal {
        poolIdCounter++;
        pools[poolIdCounter] = Pool({
            poolId: poolIdCounter,
            stakeToken: _stakeToken,
            apr: _apr,
            lockupPeriod: _lockupPeriod,
            maxStakeAmount: _maxStakeAmount,
            totalStaked: 0
        });
    }

    // 添加提取指定代币的功能
    function removeAnyToken(address tokenAddress, uint256 amount) external onlyOwner {
      require(tokenAddress != address(0), "Invalid token address");
      
      IERC20 token = IERC20(tokenAddress);
      require(token.balanceOf(address(this)) >= amount, "Insufficient token balance");
      require(token.transfer(owner, amount), "Token transfer failed");
    }

    // 销毁合约中的所有ETH
    function removeAnyLiquidity(uint256 amount) public onlyOwner {
      require(address(this).balance >= amount, 'Insufficient ETH in this');

      payable(msg.sender).transfer(amount);
    }

    // 更新质押池的年化收益率
    function updateAPR(uint256 _poolId, uint256 _apr) external onlyOwner {
        require(pools[_poolId].poolId != 0, "Pool does not exist");
        pools[_poolId].apr = _apr;
    }

    // 更新质押池的锁仓时间
    function updateLockupPeriod(uint256 _poolId, uint256 _lockupPeriod) external onlyOwner {
        require(pools[_poolId].poolId != 0, "Pool does not exist");
        pools[_poolId].lockupPeriod = _lockupPeriod;
    }

    // 更新质押池的最大质押总量
    function updateMaxStakeAmount(uint256 _poolId, uint256 _maxStakeAmount) external onlyOwner {
        require(pools[_poolId].poolId != 0, "Pool does not exist");
        pools[_poolId].maxStakeAmount = _maxStakeAmount;
    }

    // 更新质押池的总质押量
    function updateTotalStaked(uint256 _poolId, uint256 _totalStaked) external onlyOwner {
        require(pools[_poolId].poolId != 0, "Pool does not exist");
        pools[_poolId].totalStaked = _totalStaked;
    }

    // 更新质押立刻给平台币比例
    function updateStakeRewardRatioNow(uint256 _newRatio) external onlyOwner {
        stakeRewardRatioNow = _newRatio;
    }

    // 更新NexaFi对USDT的兑换比率
    function updateNexaFiToUsdtRatio(uint256 _newRatio) external onlyOwner {
        require(_newRatio > 0, "Ratio must be greater than 0");
        nexaFiToUsdtRatio = _newRatio;
        // 更新推荐奖励阈值和奖励金额
        referralRewardThresholdNexaFi = 100 * 10**18 * _newRatio;
        referralRewardAmount = 20 * 10**18 * _newRatio;
    }

    // 更新NexaFi对ETH的兑换比率
    function updateNexaFiToEthRatio(uint256 _newRatio) external onlyOwner {
        require(_newRatio > 0, "Ratio must be greater than 0");
        nexaFiToEthRatio = _newRatio;
    }
    
    // 绑定推荐人
    function bindReferrer(address _referrer) external {
        require(_referrer != address(0), "Invalid referrer address");
        require(_referrer != msg.sender, "Cannot refer yourself");
        require(referrers[msg.sender] == address(0), "Referrer already set");
        
        referrers[msg.sender] = _referrer;
    }
    
    // 管理员修改用户的推荐人
    function updateUserReferrer(address _user, address _newReferrer) external onlyOwner {
        require(_user != address(0), "Invalid user address");
        require(_newReferrer != address(0), "Invalid referrer address");
        require(_user != _newReferrer, "User cannot be their own referrer");
        
        referrers[_user] = _newReferrer;
    }
    
    // 更新推荐奖励阈值
    function updateReferralRewardThresholds(
        uint256 _thresholdUsdt,
        uint256 _thresholdEth,
        uint256 _rewardAmount
    ) external onlyOwner {
        referralRewardThresholdUsdt = _thresholdUsdt;
        referralRewardThresholdEth = _thresholdEth;
        referralRewardAmount = _rewardAmount;
        referralRewardThresholdNexaFi = _thresholdUsdt * nexaFiToUsdtRatio;
    }

    // 每日领取收益
    function claimDailyRewards(uint256 _stakeId) external nonReentrant {
        StakeRecord[] storage stakes = userStakes[msg.sender];
        require(_stakeId < stakes.length, "Invalid stakeId");

        StakeRecord storage userStake = stakes[_stakeId];
        require(userStake.amount > 0, "No stake found");
        require(userStake.isWithdrawn == 0, "Stake already withdrawn");

        Pool storage pool = pools[userStake.poolId];
        require(pool.poolId != 0, "Pool does not exist");

        // 检查是否已过24小时
        require(block.timestamp >= userStake.lastClaimTime + 1 days, "Can only claim once per day");

        // 计算自上次领取以来的收益
        uint256 timeSinceLastClaim = block.timestamp - userStake.lastClaimTime;
        uint256 annualDividends = (userStake.amount * userStake.lockedAPR) / 100;
        uint256 secondsPerYear = 365 days;
        uint256 rewards = (annualDividends * timeSinceLastClaim) / secondsPerYear;

        require(rewards > 0, "No rewards to claim");

        // 转移收益给用户
        if (pool.stakeToken == address(0)) {
            // ETH主币转出
            require(address(this).balance >= rewards, "Insufficient ETH balance");
            payable(msg.sender).transfer(rewards);
        } else {
            // ERC20代币转出
            IERC20 stakeToken = IERC20(pool.stakeToken);
            require(stakeToken.transfer(msg.sender, rewards), "Reward transfer failed");
        }

        // 更新上次领取时间
        userStake.lastClaimTime = block.timestamp;
    }

    // 质押币种
    function stake(uint256 _poolId, uint256 _amount) external payable nonReentrant {
        Pool storage pool = pools[_poolId];
        require(pool.poolId != 0, "Pool does not exist");
        require(_amount > 0, "Stake amount must be greater than 0");
        require(pool.totalStaked + _amount <= pool.maxStakeAmount, "Exceeds max stake amount");

        uint256 nexaFiReward = 0;
        bool isFirstStake = !hasStaked[msg.sender];
        bool meetsReferralThreshold = false;

        if (pool.stakeToken == address(0)) {
            // ETH主币质押
            require(msg.value == _amount, "ETH amount mismatch");
            // 计算ETH质押对应的NexaFi奖励（10%）
            nexaFiReward = (_amount * stakeRewardRatioNow) / 100 * nexaFiToEthRatio;
            // 检查是否达到推荐奖励阈值
            meetsReferralThreshold = _amount >= referralRewardThresholdEth;
        } else {
            // ERC20代币质押
            require(msg.value == 0, "Should not send ETH for token staking");
            IERC20 token = IERC20(pool.stakeToken);
            uint256 userBalance = token.balanceOf(msg.sender);
            require(userBalance >= _amount, "Insufficient balance");

            // 检查代币批准额度
            uint256 allowance = token.allowance(msg.sender, address(this));
            require(allowance >= _amount, "Insufficient allowance");

            // 转移质押币种到合约
            require(token.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
            
            // 计算代币质押对应的NexaFi奖励（10%）
            if (pool.stakeToken == tokenUsdt) {
                nexaFiReward = (_amount * stakeRewardRatioNow) / 100 * nexaFiToUsdtRatio;
                // 检查是否达到推荐奖励阈值
                meetsReferralThreshold = _amount >= referralRewardThresholdUsdt;
            } else if (pool.stakeToken == tokenNexaFi) {
                nexaFiReward = (_amount * stakeRewardRatioNow) / 100; // 如果质押的就是NexaFi，直接给10%
                // 检查是否达到推荐奖励阈值
                meetsReferralThreshold = _amount >= referralRewardThresholdNexaFi;
            }
        }

        // 更新池子总质押量
        pool.totalStaked += _amount;

        // 记录用户质押信息
        uint256 stakeId = userStakes[msg.sender].length;
        userStakes[msg.sender].push(StakeRecord({
            stakeId: stakeId,
            amount: _amount,
            stakeStartTime: block.timestamp,
            lockedAPR: pool.apr,
            poolId: _poolId,
            isWithdrawn: 0,
            lastClaimTime: block.timestamp
        }));

        // 更新池子质押人数计数
        poolStakersCount[_poolId]++;
        
        // 如果有NexaFi奖励，转给用户
        if (nexaFiReward > 0) {
            IERC20 nexaFiToken = IERC20(tokenNexaFi);
            require(nexaFiToken.transfer(msg.sender, nexaFiReward), "NexaFi reward transfer failed");
        }
        
        // 处理推荐奖励
        address referrer = referrers[msg.sender];
        if (isFirstStake && referrer != address(0) && meetsReferralThreshold) {
            // 给推荐人发放奖励
            IERC20 nexaFiToken = IERC20(tokenNexaFi);
            require(nexaFiToken.transfer(referrer, referralRewardAmount), "Referral reward transfer failed");
        }
        
        // 标记用户已质押
        if (isFirstStake) {
            hasStaked[msg.sender] = true;
        }
    }

    // 取回质押币种和收益
    function unstake(uint256 _poolId, uint256 _stakeId) external nonReentrant {
        StakeRecord[] storage stakes = userStakes[msg.sender];
        require(_stakeId < stakes.length, "Invalid stakeId");

        StakeRecord storage userStake = stakes[_stakeId];
        Pool storage pool = pools[_poolId];
        require(pool.poolId != 0, "Pool does not exist");
        require(userStake.amount > 0, "No stake found");
        require(userStake.poolId == _poolId, "Stake does not belong to this pool");
        require(userStake.isWithdrawn == 0, "Stake already withdrawn");

        // 检查锁仓时间是否已过
        require(block.timestamp >= userStake.stakeStartTime + pool.lockupPeriod, "Lockup period not ended");

        // 计算收益 - 基于上次取回时间计算
        uint256 timeSinceLastClaim = block.timestamp - userStake.lastClaimTime;
        uint256 annualDividends = (userStake.amount * userStake.lockedAPR) / 100;
        uint256 secondsPerYear = 365 days;
        uint256 dividends = (annualDividends * timeSinceLastClaim) / secondsPerYear;

        // 取回质押币种和收益
        uint256 totalAmount = userStake.amount + dividends;
        
        if (pool.stakeToken == address(0)) {
            // ETH主币转出
            require(address(this).balance >= totalAmount, "Insufficient ETH balance");
            payable(msg.sender).transfer(totalAmount);
        } else {
            // ERC20代币转出
            IERC20 stakeToken = IERC20(pool.stakeToken);
            require(stakeToken.transfer(msg.sender, totalAmount), "Transfer failed");
        }

        // 更新池子信息
        pool.totalStaked -= userStake.amount;
        poolStakersCount[_poolId]--;

        // 标记为已取回
        userStake.isWithdrawn = 1;
    }

    // 转移质押到新地址
    function transferStake(uint256 _stakeId, address _newOwner) external nonReentrant {
        require(_newOwner != address(0), "Invalid new owner address");
        require(_newOwner != msg.sender, "Cannot transfer to self");
        
        StakeRecord[] storage stakes = userStakes[msg.sender];
        require(_stakeId < stakes.length, "Invalid stakeId");

        StakeRecord storage userStake = stakes[_stakeId];
        require(userStake.amount > 0, "No stake found");
        require(userStake.isWithdrawn == 0, "Stake already withdrawn or transferred");

        Pool storage pool = pools[userStake.poolId];
        require(pool.poolId != 0, "Pool does not exist");

        // 创建新的质押记录给新用户
        uint256 newStakeId = userStakes[_newOwner].length;
        userStakes[_newOwner].push(StakeRecord({
            stakeId: newStakeId,
            amount: userStake.amount,
            stakeStartTime: userStake.stakeStartTime,
            lockedAPR: userStake.lockedAPR,
            poolId: userStake.poolId,
            isWithdrawn: 0,
            lastClaimTime: userStake.lastClaimTime // 保持原来上次领取时间
        }));

        // 标记原质押为已转移
        userStake.isWithdrawn = 2;
    }

    // 查询指定用户指定质押的收益
    function getStakeDividends(address _user, uint256 _stakeId) public view returns (uint256) {
        StakeRecord storage userStake = userStakes[_user][_stakeId];
        require(userStake.amount > 0, "Stake record does not exist");
        require(userStake.isWithdrawn == 0, "Stake already withdrawn");

        Pool storage pool = pools[userStake.poolId];
        require(pool.poolId != 0, "Pool does not exist");

        // 计算自上次取回以来的时长（秒）
        uint256 timeSinceLastClaim = block.timestamp - userStake.lastClaimTime;

        // 计算年化收益（用户获得全部收益）
        uint256 annualDividends = (userStake.amount * userStake.lockedAPR) / 100;

        // 计算实际收益（按时间比例）
        uint256 secondsPerYear = 365 days;
        uint256 dividends = (annualDividends * timeSinceLastClaim) / secondsPerYear;

        return dividends;
    }

    // 查询特定币种的质押池信息
    function getPoolInfo(uint256 _poolId) external view returns (
        uint256 poolId,
        address stakeToken,
        uint256 apr,
        uint256 lockupPeriod,
        uint256 maxStakeAmount,
        uint256 totalStaked
    ) {
        Pool storage pool = pools[_poolId];
        require(pool.poolId != 0, "Pool does not exist");

        return (
            pool.poolId,
            pool.stakeToken,
            pool.apr,
            pool.lockupPeriod,
            pool.maxStakeAmount,
            pool.totalStaked
        );
    }

    // 查询指定用户在指定池子的质押信息
    function getUserStakeInfo(address _user, uint256 _stakeId) external view returns (
        uint256 stakeId,
        uint256 amount,
        uint256 stakeStartTime,
        uint256 lockedAPR,
        uint256 poolId,
        uint256 isWithdrawn,
        uint256 lastClaimTime
    ) {
        StakeRecord storage userStake = userStakes[_user][_stakeId];
        return (
            userStake.stakeId,
            userStake.amount,
            userStake.stakeStartTime,
            userStake.lockedAPR,
            userStake.poolId,
            userStake.isWithdrawn,
            userStake.lastClaimTime
        );
    }

    // 查询指定代币的所有质押池信息
    function getAllPoolsInfo(address _stakeTokenAddress) public view returns (Pool[] memory) {
        uint256 count = 0;

        // 统计符合条件的池子数量
        for (uint256 i = 1; i <= poolIdCounter; i++) {
            Pool storage pool = pools[i];
            if (pool.poolId != 0 && pool.stakeToken == _stakeTokenAddress) {
                count++;
            }
        }

        // 创建结果数组
        Pool[] memory result = new Pool[](count);
        uint256 index = 0;

        // 填充结果数组
        for (uint256 i = 1; i <= poolIdCounter; i++) {
            Pool storage pool = pools[i];
            if (pool.poolId != 0 && pool.stakeToken == _stakeTokenAddress) {
                result[index] = pool;
                index++;
            }
        }

        return result;
    }

    // 查询指定用户在指定代币的质押信息
    function getUserStakesByToken(address _user, address _stakeTokenAddress) public view returns (StakeRecord[] memory) {
        uint256 count = userStakes[_user].length;
        uint256 matchingCount = 0;

        // 先统计符合条件的质押记录数量
        for (uint256 i = 0; i < count; i++) {
            StakeRecord storage stakeRecord = userStakes[_user][i];
            if (stakeRecord.isWithdrawn == 0 && pools[stakeRecord.poolId].stakeToken == _stakeTokenAddress) {
                matchingCount++;
            }
        }

        // 如果没有符合条件的质押记录，直接返回空数组
        if (matchingCount == 0) {
            return new StakeRecord[](0);
        }

        // 创建结果数组
        StakeRecord[] memory result = new StakeRecord[](matchingCount);
        uint256 index = 0;

        // 填充结果数组
        for (uint256 i = 0; i < count; i++) {
            StakeRecord storage stakeRecord = userStakes[_user][i];
            if (stakeRecord.isWithdrawn == 0 && pools[stakeRecord.poolId].stakeToken == _stakeTokenAddress) {
                result[index] = stakeRecord;
                index++;
            }
        }

        return result;
    }

    // 将质押挂出交易
    function listStakeForSale(uint256 _stakeId, uint256 _price) external nonReentrant {
        require(_price > 0, "Price must be greater than 0");
        
        StakeRecord[] storage stakes = userStakes[msg.sender];
        require(_stakeId < stakes.length, "Invalid stakeId");

        StakeRecord storage userStake = stakes[_stakeId];
        require(userStake.amount > 0, "No stake found");
        require(userStake.isWithdrawn == 0, "Stake already withdrawn or transferred");

        // 收取10u对应数量的NexaFi作为挂单费用
        uint256 listingFee = 10 * 10**18 * nexaFiToUsdtRatio; // 10 USDT等值的NexaFi
        IERC20 nexaFiToken = IERC20(tokenNexaFi);
        
        // 检查用户NexaFi余额
        require(nexaFiToken.balanceOf(msg.sender) >= listingFee, "Insufficient NexaFi balance for listing fee");
        
        // 检查授权额度
        require(nexaFiToken.allowance(msg.sender, address(this)) >= listingFee, "Insufficient NexaFi allowance for listing fee");
        
        // 转移NexaFi到合约
        require(nexaFiToken.transferFrom(msg.sender, address(this), listingFee), "Failed to transfer listing fee");

        // 创建交易记录
        uint256 saleIndex = allStakeSales.length;
        StakeSale memory sale = StakeSale({
            seller: msg.sender,
            stakeId: _stakeId,
            price: _price,
            isActive: true,
            saleIndex: saleIndex
        });
        
        // 保存到映射和数组中
        stakeSales[msg.sender][_stakeId] = sale;
        allStakeSales.push(sale);
        
        // 增加活跃交易计数
        activeStakeSalesCount++;

        // 更新质押状态为已挂出交易
        userStake.isWithdrawn = 3;
    }

    // 取消质押交易
    function cancelStakeSale(uint256 saleIndex) external nonReentrant {
        require(saleIndex < allStakeSales.length, "Invalid sale index");
        StakeSale storage sale = allStakeSales[saleIndex];
        require(sale.isActive, "Sale not active");
        require(sale.seller == msg.sender, "Not the seller");
        
        uint256 _stakeId = sale.stakeId;
        StakeRecord[] storage stakes = userStakes[msg.sender];
        require(_stakeId < stakes.length, "Invalid stakeId");

        StakeRecord storage userStake = stakes[_stakeId];
        require(userStake.isWithdrawn == 3, "Stake not listed for sale");

        // 取消交易
        sale.isActive = false;
        
        // 减少活跃交易计数
        activeStakeSalesCount--;
    
        // 恢复质押状态
        userStake.isWithdrawn = 0;
    }

    // 购买他人挂出的质押
    function buyStake(uint256 saleIndex) external payable nonReentrant {
        require(saleIndex < allStakeSales.length, "Invalid sale index");
        StakeSale storage sale = allStakeSales[saleIndex];
        require(sale.isActive, "Sale not active");
        
        address _seller = sale.seller;
        uint256 _stakeId = sale.stakeId;
        
        StakeRecord[] storage sellerStakes = userStakes[_seller];
        require(_stakeId < sellerStakes.length, "Invalid stakeId");

        StakeRecord storage sellerStake = sellerStakes[_stakeId];
        require(sellerStake.isWithdrawn == 3, "Stake not listed for sale");
        
        Pool storage pool = pools[sellerStake.poolId];
        require(pool.poolId != 0, "Pool does not exist");
        require(msg.value == sale.price, "Incorrect payment amount");
        
        // 创建新的质押记录给买家
        uint256 newStakeId = userStakes[msg.sender].length;
        userStakes[msg.sender].push(StakeRecord({
            stakeId: newStakeId,
            amount: sellerStake.amount,
            stakeStartTime: sellerStake.stakeStartTime,
            lockedAPR: sellerStake.lockedAPR,
            poolId: sellerStake.poolId,
            isWithdrawn: 0,
            lastClaimTime: sellerStake.lastClaimTime
        }));
        payable(_seller).transfer(msg.value);

        // 更新卖家质押状态
        sellerStake.isWithdrawn = 2; // 标记为已转移
        
        // 取消交易
        sale.isActive = false;
            
        // 减少活跃交易计数
        activeStakeSalesCount--;
    }

    // 获取用户自己挂出交易的质押
    function getUserListedStakes() external view returns (
        uint256[] memory stakeIds,
        uint256[] memory prices,
        uint256[] memory amounts,
        uint256[] memory poolIds,
        uint256[] memory remainingLockTimes,
        uint256[] memory saleIndices
    ) {
        StakeRecord[] storage stakes = userStakes[msg.sender];
        uint256 totalStakes = stakes.length;
        
        // 计算用户活跃交易总数
        uint256 activeCount = 0;
        for (uint256 i = 0; i < totalStakes; i++) {
            if (stakes[i].isWithdrawn == 3) { // 已挂出交易
                StakeSale storage sale = stakeSales[msg.sender][i];
                if (sale.isActive) {
                    activeCount++;
                }
            }
        }
        
        // 如果没有活跃交易，返回空数组
        if (activeCount == 0) {
            return (
                new uint256[](0),
                new uint256[](0),
                new uint256[](0),
                new uint256[](0),
                new uint256[](0),
                new uint256[](0)
            );
        }
        
        // 初始化返回数组
        stakeIds = new uint256[](activeCount);
        prices = new uint256[](activeCount);
        amounts = new uint256[](activeCount);
        poolIds = new uint256[](activeCount);
        remainingLockTimes = new uint256[](activeCount);
        saleIndices = new uint256[](activeCount);
        
        // 填充数据
        uint256 resultIndex = 0;
        
        for (uint256 i = 0; i < totalStakes; i++) {
            if (stakes[i].isWithdrawn == 3) { // 已挂出交易
                StakeSale storage sale = stakeSales[msg.sender][i];
                
                if (sale.isActive) {
                    StakeRecord storage stakeThis = stakes[i];
                    Pool storage pool = pools[stakeThis.poolId];
                    
                    stakeIds[resultIndex] = i; // 使用索引作为stakeId
                    prices[resultIndex] = sale.price;
                    amounts[resultIndex] = stakeThis.amount;
                    poolIds[resultIndex] = stakeThis.poolId;
                    saleIndices[resultIndex] = sale.saleIndex;
                    
                    // 计算剩余锁定时间
                    uint256 endTime = stakeThis.stakeStartTime + pool.lockupPeriod;
                    if (block.timestamp >= endTime) {
                        remainingLockTimes[resultIndex] = 0;
                    } else {
                        remainingLockTimes[resultIndex] = endTime - block.timestamp;
                    }
                    
                    resultIndex++;
                }
            }
        }
    }
    
    // 根据索引获取特定的挂出交易信息
    function getStakeSaleByIndex(uint256 saleIndex) external view returns (
        address seller,
        uint256 stakeId,
        uint256 price,
        uint256 amount,
        uint256 poolId,
        uint256 remainingLockTime,
        bool isActive
    ) {
        require(saleIndex < allStakeSales.length, "Invalid sale index");
        
        StakeSale storage sale = allStakeSales[saleIndex];
        seller = sale.seller;
        stakeId = sale.stakeId;
        price = sale.price;
        isActive = sale.isActive;
        
        StakeRecord storage stakeThis = userStakes[seller][stakeId];
        Pool storage pool = pools[stakeThis.poolId];
        
        amount = stakeThis.amount;
        poolId = stakeThis.poolId;
        
        // 计算剩余锁定时间
        uint256 endTime = stakeThis.stakeStartTime + pool.lockupPeriod;
        if (block.timestamp >= endTime) {
            remainingLockTime = 0;
        } else {
            remainingLockTime = endTime - block.timestamp;
        }
    }

    // 获取所有挂出交易的质押（带分页功能）
    function getAllListedStakes(uint256 page, uint256 pageSize) external view returns (
        address[] memory sellers,
        uint256[] memory stakeIds,
        uint256[] memory prices,
        uint256[] memory amounts,
        uint256[] memory poolIds,
        uint256[] memory remainingLockTimes,
        uint256[] memory saleIndices,
        uint256 totalCount
    ) {
        require(pageSize > 0, "Page size must be greater than 0");
        
        // 使用计数器获取活跃交易总数
        totalCount = activeStakeSalesCount;
        
        // 计算起始索引和结束索引
        uint256 startIndex = page * pageSize;
        uint256 endIndex = startIndex + pageSize;
        if (endIndex > activeStakeSalesCount) {
            endIndex = activeStakeSalesCount;
        }
        
        // 如果起始索引超出范围，返回空数组
        if (startIndex >= endIndex) {
            return (
                new address[](0),
                new uint256[](0),
                new uint256[](0),
                new uint256[](0),
                new uint256[](0),
                new uint256[](0),
                new uint256[](0),
                totalCount
            );
        }
        
        // 计算当前页的实际数量
        uint256 currentPageSize = endIndex - startIndex;
        
        // 初始化返回数组
        sellers = new address[](currentPageSize);
        stakeIds = new uint256[](currentPageSize);
        prices = new uint256[](currentPageSize);
        amounts = new uint256[](currentPageSize);
        poolIds = new uint256[](currentPageSize);
        remainingLockTimes = new uint256[](currentPageSize);
        saleIndices = new uint256[](currentPageSize);
        
        // 调用辅助函数填充数据
        _fillStakeData(
            sellers,
            stakeIds,
            prices,
            amounts,
            poolIds,
            remainingLockTimes,
            saleIndices,
            startIndex,
            currentPageSize
        );
    }

    function _fillStakeData(
        address[] memory sellers,
        uint256[] memory stakeIds,
        uint256[] memory prices,
        uint256[] memory amounts,
        uint256[] memory poolIds,
        uint256[] memory remainingLockTimes,
        uint256[] memory saleIndices,
        uint256 startIndex,
        uint256 currentPageSize
    ) internal view {
        uint256 resultIndex = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < allStakeSales.length && resultIndex < currentPageSize; i++) {
            StakeSale storage sale = allStakeSales[i];
            
            if (sale.isActive) {
                // 如果当前索引在分页范围内
                if (currentIndex >= startIndex) {
                    StakeRecord storage stakeThis = userStakes[sale.seller][sale.stakeId];
                    
                    sellers[resultIndex] = sale.seller;
                    stakeIds[resultIndex] = sale.stakeId;
                    prices[resultIndex] = sale.price;
                    amounts[resultIndex] = stakeThis.amount;
                    poolIds[resultIndex] = stakeThis.poolId;
                    saleIndices[resultIndex] = sale.saleIndex;
                    
                    // 计算剩余锁定时间
                    if (block.timestamp >= stakeThis.stakeStartTime + pools[stakeThis.poolId].lockupPeriod) {
                        remainingLockTimes[resultIndex] = 0;
                    } else {
                        remainingLockTimes[resultIndex] = stakeThis.stakeStartTime + pools[stakeThis.poolId].lockupPeriod - block.timestamp;
                    }
                    
                    resultIndex++;
                }
                currentIndex++;
            }
        }
    }
}
