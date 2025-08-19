# 奖励记录模块 API

## 1. 创建奖励记录

- **URL**: `/reward`
- **方法**: `POST`
- **描述**: 创建新的奖励记录

### 请求参数

```json
{
  "chainId": 1,
  "claimHash": "0x789...",
  "rewardToken": "USDT",
  "rewardTime": "2024-01-01T00:00:00.000Z",
  "stakingApy": 12.5,
  "rewardAmount": "100.5",
  "claimAddress": "0x123...",
  "rewardType": "staking"
}
```

### 响应示例

```json
{
  "code": 0,
  "data": {
    "id": 1,
    "chainId": 1,
    "claimHash": "0x789...",
    "rewardToken": "USDT",
    "rewardTime": "2024-01-01T00:00:00.000Z",
    "stakingApy": 12.5,
    "claimTime": "2024-01-01T00:00:00.000Z",
    "rewardAmount": "100.5",
    "claimAddress": "0x123...",
    "rewardType": "staking",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "操作成功",
  "timestamp": 1672531260000
}
```

## 2. 查询奖励记录列表

- **URL**: `/reward`
- **方法**: `GET`
- **描述**: 查询奖励记录列表，支持多种筛选条件

### 请求参数

| 参数名 | 类型 | 必填 | 默认值 | 描述 |
|-------|-----|-----|-------|------|
| claimAddress | string | 否 | - | 领取地址 |
| chainId | number | 否 | - | 链ID |
| rewardType | string | 否 | - | 奖励类型 (staking/referral/bonus/airdrop) |
| rewardToken | string | 否 | - | 奖励币种 |
| startTime | string | 否 | - | 开始时间 |
| endTime | string | 否 | - | 结束时间 |
| page | number | 否 | 1 | 页码 |
| limit | number | 否 | 10 | 每页数量 |

### 响应示例

```json
{
  "code": 0,
  "data": {
    "records": [
      {
        "id": 1,
        "chainId": 1,
        "claimHash": "0x789...",
        "rewardToken": "USDT",
        "rewardTime": "2024-01-01T00:00:00.000Z",
        "stakingApy": 12.5,
        "claimTime": "2024-01-01T00:00:00.000Z",
        "rewardAmount": "100.5",
        "claimAddress": "0x123...",
        "rewardType": "staking",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  },
  "message": "操作成功",
  "timestamp": 1672531260000
}
```

## 3. 根据ID获取奖励记录详情

- **URL**: `/reward/:id`
- **方法**: `GET`
- **描述**: 根据ID获取奖励记录详情

### 请求参数

| 参数名 | 类型 | 必填 | 默认值 | 描述 |
|-------|-----|-----|-------|------|
| id | number | 是 | - | 奖励记录ID (路径参数) |

### 响应示例

```json
{
  "code": 0,
  "data": {
    "id": 1,
    "chainId": 1,
    "claimHash": "0x789...",
    "rewardToken": "USDT",
    "rewardTime": "2024-01-01T00:00:00.000Z",
    "stakingApy": 12.5,
    "claimTime": "2024-01-01T00:00:00.000Z",
    "rewardAmount": "100.5",
    "claimAddress": "0x123...",
    "rewardType": "staking",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "操作成功",
  "timestamp": 1672531260000
}
```

## 4. 根据交易哈希获取奖励记录

- **URL**: `/reward/hash/:claimHash`
- **方法**: `GET`
- **描述**: 根据交易哈希获取奖励记录

### 请求参数

| 参数名 | 类型 | 必填 | 默认值 | 描述 |
|-------|-----|-----|-------|------|
| claimHash | string | 是 | - | 交易哈希 (路径参数) |

### 响应示例

同上

## 5. 获取用户奖励统计

- **URL**: `/reward/stats/:claimAddress`
- **方法**: `GET`
- **描述**: 获取指定地址的奖励统计信息

### 请求参数

| 参数名 | 类型 | 必填 | 默认值 | 描述 |
|-------|-----|-----|-------|------|
| claimAddress | string | 是 | - | 用户地址 (路径参数) |
| chainId | number | 否 | - | 链ID (查询参数) |

### 响应示例

```json
{
  "code": 0,
  "data": [
    {
      "rewardType": "staking",
      "rewardToken": "USDT",
      "totalAmount": "1000.5",
      "count": "10"
    },
    {
      "rewardType": "referral",
      "rewardToken": "USDT",
      "totalAmount": "50.0",
      "count": "2"
    }
  ],
  "message": "操作成功",
  "timestamp": 1672531260000
}
```

## 6. 删除奖励记录

- **URL**: `/reward/:id`
- **方法**: `DELETE`
- **描述**: 删除指定的奖励记录

### 请求参数

| 参数名 | 类型 | 必填 | 默认值 | 描述 |
|-------|-----|-----|-------|------|
| id | number | 是 | - | 奖励记录ID (路径参数) |

### 响应示例

```json
{
  "code": 0,
  "data": {
    "message": "奖励记录删除成功"
  },
  "message": "操作成功",
  "timestamp": 1672531260000
}