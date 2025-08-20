# 质押模块 API

## 1. 创建质押

- **URL**: `/staking`
- **方法**: `POST`
- **描述**: 创建新的质押记录，自动发放10%U价值的NexaFi奖励，符合条件时发放推荐人奖励

### 请求参数

```json
{
  "chainId": 1,
  "stakingCoin": "USDT",
  "stakingHash": "0x123...",
  "stakingAmount": "1000.000000000000000000",
  "stakingStartTime": "2024-01-01T00:00:00.000Z",
  "stakingLockDuration": 86400,
  "stakingApy": 12.5,
  "stakingAddress": "0xabc..."
}
```

### 参数说明

| 参数名 | 类型 | 必填 | 描述 |
|-------|-----|-----|------|
| chainId | number | 是 | 链ID |
| stakingCoin | string | 是 | 质押币种 |
| stakingHash | string | 是 | 质押交易哈希（唯一） |
| stakingAmount | string | 是 | 质押数量 |
| stakingStartTime | string | 是 | 质押起始时间 |
| stakingLockDuration | number | 是 | 质押锁仓时间（秒） |
| stakingApy | number | 是 | 质押年化率(%) |
| stakingAddress | string | 是 | 质押地址 |

### 响应示例

```json
{
  "code": 0,
  "data": {
    "success": true,
    "message": "质押成功",
    "data": {
      "stakingRecord": {
        "id": 1,
        "chainId": 1,
        "stakingCoin": "USDT",
        "stakingHash": "0x123...",
        "stakingAmount": "1000.000000000000000000",
        "stakingStartTime": "2024-01-01T00:00:00.000Z",
        "stakingLockDuration": 86400,
        "stakingApy": 12.5,
        "stakingAddress": "0xabc...",
        "nexafiRewardAmount": "10000.000000000000000000",
        "referralRewardGiven": false,
        "isWithdrawn": false,
        "withdrawTime": null,
        "withdrawHash": null,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      },
      "nexafiReward": "10000.000000000000000000",
      "usdtValue": "1000"
    }
  },
  "message": "操作成功",
  "timestamp": 1672531260000
}
```

### 业务逻辑

1. **自动奖励**：质押时自动发放10%U价值的NexaFi奖励
2. **推荐人奖励**：首次质押超过100U时，给推荐人发放20U对应的NexaFi
3. **精确计算**：使用BigNumber.js确保金融级计算精度

## 2. 根据地址查询质押记录

- **URL**: `/staking/address/:stakingAddress`
- **方法**: `GET`
- **描述**: 根据质押地址查询质押记录列表

### 请求参数

| 参数名 | 类型 | 必填 | 默认值 | 描述 |
|-------|-----|-----|-------|------|
| stakingAddress | string | 是 | - | 质押地址 (路径参数) |
| chainId | number | 否 | - | 链ID (查询参数) |

### 响应示例

```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "chainId": 1,
      "stakingCoin": "USDT",
      "stakingHash": "0x123...",
      "stakingAmount": "1000.000000000000000000",
      "stakingStartTime": "2024-01-01T00:00:00.000Z",
      "stakingLockDuration": 86400,
      "stakingApy": 12.5,
      "stakingAddress": "0xabc...",
      "nexafiRewardAmount": "10000.000000000000000000",
      "referralRewardGiven": false,
      "isWithdrawn": false,
      "withdrawTime": null,
      "withdrawHash": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "message": "操作成功",
  "timestamp": 1672531260000
}
```

## 3. 根据ID获取质押记录详情

- **URL**: `/staking/:id`
- **方法**: `GET`
- **描述**: 根据质押记录ID获取详细信息

### 请求参数

| 参数名 | 类型 | 必填 | 默认值 | 描述 |
|-------|-----|-----|-------|------|
| id | number | 是 | - | 质押记录ID (路径参数) |

### 响应示例

```json
{
  "code": 0,
  "data": {
    "id": 1,
    "chainId": 1,
    "stakingCoin": "USDT",
    "stakingHash": "0x123...",
    "stakingAmount": "1000.000000000000000000",
    "stakingStartTime": "2024-01-01T00:00:00.000Z",
    "stakingLockDuration": 86400,
    "stakingApy": 12.5,
    "stakingAddress": "0xabc...",
    "nexafiRewardAmount": "10000.000000000000000000",
    "referralRewardGiven": false,
    "isWithdrawn": false,
    "withdrawTime": null,
    "withdrawHash": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "操作成功",
  "timestamp": 1672531260000
}
```

## 4. 取回质押

- **URL**: `/staking/withdraw`
- **方法**: `PUT`
- **描述**: 取回质押资产

### 请求参数

```json
{
  "stakingRecordId": 1,
  "chainId": 1,
  "withdrawHash": "0x456...",
  "stakingAddress": "0xabc...",
  "withdrawCoin": "USDT",
  "stakingApy": 12.5,
  "stakingStartTime": "2024-01-01T00:00:00.000Z",
  "stakingLockDuration": 86400,
  "withdrawTime": "2024-01-02T00:00:00.000Z"
}
```

### 参数说明

| 参数名 | 类型 | 必填 | 描述 |
|-------|-----|-----|------|
| stakingRecordId | number | 是 | 质押记录ID |
| chainId | number | 是 | 链ID |
| withdrawHash | string | 是 | 取回交易哈希 |
| stakingAddress | string | 是 | 质押地址 |
| withdrawCoin | string | 是 | 取回币种 |
| stakingApy | number | 是 | 质押年化率 |
| stakingStartTime | string | 是 | 质押起始时间 |
| stakingLockDuration | number | 是 | 质押锁仓时间（秒） |
| withdrawTime | string | 是 | 取回时间 |

### 响应示例

#### 成功响应

```json
{
  "code": 0,
  "data": {
    "success": true,
    "message": "取回质押成功",
    "data": {
      "stakingRecord": {
        "id": 1,
        "chainId": 1,
        "stakingCoin": "USDT",
        "stakingHash": "0x123...",
        "stakingAmount": "1000.000000000000000000",
        "stakingStartTime": "2024-01-01T00:00:00.000Z",
        "stakingLockDuration": 86400,
        "stakingApy": 12.5,
        "stakingAddress": "0xabc...",
        "nexafiRewardAmount": "10000.000000000000000000",
        "referralRewardGiven": false,
        "isWithdrawn": true,
        "withdrawTime": "2024-01-02T00:00:00.000Z",
        "withdrawHash": "0x456...",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-02T00:00:00.000Z"
      },
      "withdrawAmount": "1000.000000000000000000",
      "withdrawCoin": "USDT"
    }
  },
  "message": "操作成功",
  "timestamp": 1672531260000
}
```

#### 失败响应

```json
{
  "code": 0,
  "data": {
    "success": false,
    "message": "质押锁仓期未到，解锁时间为: 2024-01-02T00:00:00.000Z"
  },
  "message": "操作成功",
  "timestamp": 1672531260000
}
```

### 业务规则

1. **锁仓期检查**：只有超过锁仓期的质押才能取回
2. **重复检查**：已取回的质押不能重复取回
3. **哈希唯一性**：取回交易哈希必须唯一
4. **权限验证**：只有质押地址本人才能取回对应的质押
5. **时间验证**：取回时间必须晚于质押起始时间+锁仓时间

## 错误码说明

| 错误信息 | 描述 |
|---------|------|
| 该质押交易哈希已存在 | 质押哈希重复 |
| 质押记录不存在 | 找不到对应的质押记录 |
| 该质押已经取回 | 质押已被取回，不能重复操作 |
| 该取回交易哈希已存在 | 取回哈希重复 |
| 质押锁仓期未到 | 还未到解锁时间 |