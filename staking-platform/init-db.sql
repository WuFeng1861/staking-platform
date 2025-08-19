-- 创建数据库
CREATE DATABASE IF NOT EXISTS staking_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE staking_platform;

-- NFT交易记录表
CREATE TABLE nft_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_hash VARCHAR(255) NOT NULL COMMENT '交易哈希',
    from_address VARCHAR(255) NOT NULL COMMENT '发送方地址',
    to_address VARCHAR(255) NOT NULL COMMENT '接收方地址',
    token_id VARCHAR(255) NOT NULL COMMENT 'NFT Token ID',
    contract_address VARCHAR(255) NOT NULL COMMENT '合约地址',
    chain_id INT NOT NULL COMMENT '链ID',
    chain_name VARCHAR(100) NOT NULL COMMENT '链名称',
    transaction_type ENUM('mint', 'transfer', 'burn') NOT NULL COMMENT '交易类型',
    block_number BIGINT NOT NULL COMMENT '区块号',
    transaction_fee DECIMAL(30,18) DEFAULT 0 COMMENT '交易手续费',
    gas_used BIGINT DEFAULT 0 COMMENT '消耗的Gas',
    gas_price DECIMAL(30,18) DEFAULT 0 COMMENT 'Gas价格',
    status ENUM('pending', 'success', 'failed') DEFAULT 'pending' COMMENT '交易状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_transaction_hash (transaction_hash),
    INDEX idx_from_address (from_address),
    INDEX idx_to_address (to_address),
    INDEX idx_chain_id (chain_id),
    INDEX idx_block_number (block_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='NFT交易记录表';

-- 推荐人关系表
CREATE TABLE referrals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    current_address VARCHAR(255) NOT NULL COMMENT '当前用户地址',
    referrer_address VARCHAR(255) NOT NULL COMMENT '推荐人地址',
    chain_id INT NOT NULL COMMENT '链ID',
    chain_name VARCHAR(100) NOT NULL COMMENT '链名称',
    transaction_hash VARCHAR(255) NOT NULL COMMENT '交易哈希',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY unique_current_address (current_address, chain_id),
    INDEX idx_referrer_address (referrer_address),
    INDEX idx_chain_id (chain_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='推荐人关系表';

-- 奖励记录表
CREATE TABLE reward_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chain_id INT NOT NULL COMMENT '链ID',
    claim_hash VARCHAR(255) NOT NULL COMMENT '领取奖励交易哈希',
    reward_token VARCHAR(100) NOT NULL COMMENT '领取奖励币种',
    reward_time TIMESTAMP NOT NULL COMMENT '领取奖励时间',
    staking_apy DECIMAL(10,4) NOT NULL COMMENT '质押年化率(%)',
    claim_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '领取时间',
    reward_amount DECIMAL(30,18) NOT NULL COMMENT '领取奖励数量',
    claim_address VARCHAR(255) NOT NULL COMMENT '领取地址',
    reward_type ENUM('staking', 'referral', 'bonus', 'airdrop') NOT NULL COMMENT '奖励类型',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_claim_address (claim_address),
    INDEX idx_chain_id (chain_id),
    INDEX idx_reward_type (reward_type),
    INDEX idx_reward_time (reward_time),
    UNIQUE KEY unique_claim_record (claim_hash, reward_type, claim_address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='奖励记录表';

-- 币种兑换比例表
CREATE TABLE token_exchange_rates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    from_token VARCHAR(100) NOT NULL COMMENT '源币种',
    to_token VARCHAR(100) NOT NULL COMMENT '目标币种',
    exchange_rate DECIMAL(30,18) NOT NULL COMMENT '兑换比例',
    is_active TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY unique_token_pair (from_token, to_token),
    INDEX idx_from_token (from_token),
    INDEX idx_to_token (to_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='币种兑换比例表';

-- 插入初始兑换比例数据
INSERT INTO token_exchange_rates (from_token, to_token, exchange_rate) VALUES
('USDT', 'NexaFi', 100),
('BNB', 'NexaFi', 80000),
('ETH', 'NexaFi', 410000),
('BNB', 'USDT', 800),
('ETH', 'USDT', 4100);

-- 质押记录表
CREATE TABLE staking_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chain_id INT NOT NULL COMMENT '链ID',
    staking_coin VARCHAR(100) NOT NULL COMMENT '质押币种',
    staking_hash VARCHAR(255) NOT NULL COMMENT '质押交易哈希',
    staking_amount DECIMAL(30,18) NOT NULL COMMENT '质押数量',
    staking_start_time TIMESTAMP NOT NULL COMMENT '质押起始时间',
    staking_lock_duration INT NOT NULL COMMENT '质押锁仓时间（秒）',
    staking_apy DECIMAL(10,4) NOT NULL COMMENT '质押年化率(%)',
    staking_address VARCHAR(255) NOT NULL COMMENT '质押地址',
    nexafi_reward_amount DECIMAL(30,18) DEFAULT '0' COMMENT 'NexaFi奖励数量',
    referral_reward_given TINYINT(1) DEFAULT 0 COMMENT '是否已发放推荐奖励',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_staking_address (staking_address),
    INDEX idx_chain_id (chain_id),
    UNIQUE KEY unique_staking_hash (staking_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='质押记录表';
