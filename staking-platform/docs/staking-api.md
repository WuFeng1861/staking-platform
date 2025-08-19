# 质押模块 API

## 1. 进行质押

- **URL**: `/staking`
- **方法**: `POST`
- **描述**: 进行质押操作，自动发放NexaFi奖励和推荐人奖励

### 请求参数

```json
{
  "chainId": 1,
  "stakingCoin": "USDT",
  "stakingHash": "0x123...",
  "stakingAmount": "1000",
  "stakingStartTime": "2024-01-01T00:00:00.000Z",
  "stakingLockDuration": 2592000,
  "stakingApy": 12.5,
  "stakingAddress": "0x456..."
}
```

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
        "stakingAmount": "1000",
        "stakingStartTime": "2024-01-01T00:00:00.000Z",
        "stakingLockDuration": 2592000,
        "stakingApy": 12.5,
        "stakingAddress": "0x456...",
        "nexafiRewardAmount": "10000",
        "referralRewardGiven": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      },
      "nexafiReward": "10000",
      "usdtValue": "1000"
    }
  },
  "message": "操作成功",
  "timestamp": 1672531260000
}
```

### 业务逻辑说明

1. **质押奖励**: 获取质押金额10%U价值的NexaFi奖励
2. **推荐人奖励**: 满足以下条件时给推荐人发放20U对应的NexaFi：
   - 有推荐人关系
   - 是该地址在当前链的第一次质押
   - 质押金额换算成U超过100U
3. **自动记录**: 同时创建质押记录和奖励记录

## 2. 根据地址查询质押记录

- **URL**: `/staking/address/:stakingAddress`
- **方法**: `GET`
- **描述**: 根据地址查询质押记录

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
      "stakingAmount": "1000",
      "stakingStartTime": "2024-01-01T00:00:00.000Z",
      "stakingLockDuration": 2592000,
      "stakingApy": 12.5,
      "stakingAddress": "0x456...",
      "nexafiRewardAmount": "10000",
      "referralRewardGiven": true,
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
- **描述**: 根据ID获取质押记录详情

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
    "stakingAmount": "1000",
    "stakingStartTime": "2024-01-01T00:00:00.000Z",
    "stakingLockDuration": 2592000,
    "stakingApy": 12.5,
    "stakingAddress": "0x456...",
    "nexafiRewardAmount": "10000",
    "referralRewardGiven": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "操作成功",
  "timestamp": 1672531260000
}