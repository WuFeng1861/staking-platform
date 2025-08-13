-- 创建数据库
CREATE DATABASE IF NOT EXISTS staking_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE staking_platform;

-- 创建质押记录表
CREATE TABLE IF NOT EXISTS staking_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transaction_hash VARCHAR(255) NOT NULL COMMENT '交易hash',
  staking_coin VARCHAR(50) NOT NULL COMMENT '质押币种',
  staking_amount DECIMAL(30, 18) NOT NULL COMMENT '质押数量',
  staking_start_time DATETIME NOT NULL COMMENT '质押起始时间',
  staking_min_duration INT NOT NULL COMMENT '质押最短时间（秒）',
  staking_apr DECIMAL(10, 2) NOT NULL COMMENT '质押年化',
  staking_address VARCHAR(255) NOT NULL COMMENT '质押地址',
  staking_chain VARCHAR(50) NOT NULL COMMENT '质押的链',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY uk_transaction_hash (transaction_hash),
  INDEX idx_staking_address (staking_address),
  INDEX idx_staking_coin (staking_coin),
  INDEX idx_staking_chain (staking_chain),
  INDEX idx_staking_start_time (staking_start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='质押记录表';

-- 创建质押总量表
CREATE TABLE IF NOT EXISTS staking_totals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  staking_chain VARCHAR(50) NOT NULL COMMENT '质押的链',
  staking_coin VARCHAR(50) NOT NULL COMMENT '质押的币种',
  total_amount DECIMAL(30, 18) NOT NULL DEFAULT 0 COMMENT '质押总币量',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY uk_chain_coin (staking_chain, staking_coin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='质押总量表';