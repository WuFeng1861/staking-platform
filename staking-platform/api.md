# 质押平台 API 文档

## 基本信息

- 基础URL: `http://localhost:62777`
- 所有接口返回格式统一为：

```

### 5. 上报 NFT 交易数据

- **URL**: `/nft/transaction`
- **方法**: `POST`
- **描述**: 上报 NFT 交易数据

#### 请求参数

```json
{
  "txHash": "0x123456789abcdef",  // 交易hash，唯一
  "currency": "ETH",                 // 质押币种
  "amount": "10.5",              // 质押数量
  "startTime": "2023-01-01T00:00:00Z", // 质押起始时间
  "minTime": "30",          // 质押最短时间（天）
  "annualizedYield": "0.05",                 // 质押年化
  "fromAddress": "0xabc...",   // 转出地址
  "toAddress": "0xdef...",   // 转入地址
  "chain": "Ethereum"            // 质押的链
}
```

#### 响应示例

```json
{
  "code": 0,
  "data": {
    "id": 1,
    "txHash": "0x123456789abcdef",
    "currency": "ETH",
    "amount": "10.5",
    "startTime": "2023-01-01T00:00:00Z",
    "minTime": "30",
    "annualizedYield": "0.05",
    "fromAddress": "0xabc...",
    "toAddress": "0xdef...",
    "chain": "Ethereum",
    "createdAt": "2023-01-01T00:01:00Z",
    "updatedAt": "2023-01-01T00:01:00Z"
  },
  "message": "操作成功",
  "timestamp": 1672531260000
}
```

### 6. 查询 NFT 交易数据

- **URL**: `/nft/transactions`
- **方法**: `GET`
- **描述**: 查询 NFT 交易数据

#### 请求参数

| 参数名 | 类型 | 必填 | 默认值 | 描述 |
|-------|-----|-----|-------|------|
| fromAddress | string | 否 | - | 转出地址 |
| toAddress | string | 否 | - | 转入地址 |
| minId | number | 否 | 0 | 最小ID，0表示从最新记录开始查询 |
| pageSize | number | 否 | 10 | 每页数据条数 |

#### 响应示例

```json
{
  "code": 0,
  "data": [
    {
      "id": 10,
      "txHash": "0x123456789abcdef",
      "currency": "ETH",
      "amount": "10.5",
      "startTime": "2023-01-01T00:00:00Z",
      "minTime": "30",
      "annualizedYield": "0.05",
      "fromAddress": "0xabc...",
      "toAddress": "0xdef...",
      "chain": "Ethereum",
      "createdAt": "2023-01-01T00:01:00Z",
      "updatedAt": "2023-01-01T00:01:00Z"
    },
    // ... 更多记录
  ],
  "message": "操作成功",
  "timestamp": 1672531260000
}
```

### 7. 查询 NFT 交易最大 ID

- **URL**: `/nft/max-id`
- **方法**: `GET`
- **描述**: 查询 NFT 交易记录中的最大 ID

#### 请求参数

无

#### 响应示例

```json
{
  "code": 0,
  "data": {
    "maxId": 12345
  },
  "message": "操作成功",
  "timestamp": 1672531260000
}
```json
{
  "code": 0,        // 0表示成功，非0表示错误
  "data": {},       // 实际返回数据
  "message": "操作成功", // 提示信息
  "timestamp": 1628000000000 // 时间戳
}
```

## 接口列表

### 1. 创建质押记录

- **URL**: `/staking`
- **方法**: `POST`
- **描述**: 记录用户的质押数据，根据交易hash作为唯一性判断

#### 请求参数

```json
{
  "transactionHash": "0x123456789abcdef",  // 交易hash，唯一
  "stakingCoin": "ETH",                 // 质押币种
  "stakingAmount": "10.5",              // 质押数量
  "stakingStartTime": "2023-01-01T00:00:00Z", // 质押起始时间
  "stakingMinDuration": 86400,          // 质押最短时间（秒）
  "stakingApr": "5.2",                 // 质押年化
  "stakingAddress": "0xabcdef123456",   // 质押地址
  "stakingChain": "Ethereum"            // 质押的链
}
```

#### 响应示例

```json
{
  "code": 0,
  "data": {
    "id": 1,
    "transactionHash": "0x123456789abcdef",
    "stakingCoin": "ETH",
    "stakingAmount": "10.5",
    "stakingStartTime": "2023-01-01T00:00:00Z",
    "stakingMinDuration": 86400,
    "stakingApr": "5.2",
    "stakingAddress": "0xabcdef123456",
    "stakingChain": "Ethereum",
    "createdAt": "2023-01-01T00:01:00Z",
    "updatedAt": "2023-01-01T00:01:00Z"
  },
  "message": "操作成功",
  "timestamp": 1672531260000
}
```

### 2. 查询质押记录（分页）

- **URL**: `/staking`
- **方法**: `GET`
- **描述**: 分页查询质押记录，每页10条数据

#### 请求参数

| 参数名 | 类型 | 必填 | 默认值 | 描述 |
|-------|-----|-----|-------|------|
| stakingAddress | string | 是 | - | 质押地址 |
| minId | number | 否 | 0 | 最小ID，0表示从最新记录开始查询 |
| pageSize | number | 否 | 10 | 每页数据条数 |

#### 响应示例

```json
{
  "code": 0,
  "data": [
    {
      "id": 10,
      "transactionHash": "0x123456789abcdef",
      "stakingCoin": "ETH",
      "stakingAmount": "10.5",
      "stakingStartTime": "2023-01-01T00:00:00Z",
      "stakingMinDuration": 86400,
      "stakingApr": "5.2",
      "stakingAddress": "0xabcdef123456",
      "stakingChain": "Ethereum",
      "createdAt": "2023-01-01T00:01:00Z",
      "updatedAt": "2023-01-01T00:01:00Z"
    },
    // ... 更多记录
  ],
  "message": "操作成功",
  "timestamp": 1672531260000
}
```

### 3. 管理员查询所有质押总量

- **URL**: `/staking/admin/total`
- **方法**: `POST`
- **描述**: 管理员查询所有链的所有币种的质押总量

#### 请求参数

```json
{
  "password": "wufeng1998-staking-platform" // 管理员密码
}
```

#### 响应示例

```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "stakingChain": "Ethereum",
      "stakingCoin": "ETH",
      "totalAmount": "100.5",
      "createdAt": "2023-01-01T00:01:00Z",
      "updatedAt": "2023-01-01T00:01:00Z"
    },
    {
      "id": 2,
      "stakingChain": "Binance Smart Chain",
      "stakingCoin": "BNB",
      "totalAmount": "200.75",
      "createdAt": "2023-01-01T00:01:00Z",
      "updatedAt": "2023-01-01T00:01:00Z"
    }
    // ... 更多记录
  ],
  "message": "操作成功",
  "timestamp": 1672531260000
}
```

### 4. 查询统计数据

- **URL**: `/staking/stats`
- **方法**: `GET`
- **描述**: 查询使用缓存统计最近1小时/1天/3天/1周的质押交易笔数/交易各币种数量

#### 请求参数

| 参数名 | 类型 | 必填 | 默认值 | 描述 |
|-------|-----|-----|-------|------|
| timeRange | string | 否 | "1d" | 时间范围，可选值："1h"(1小时), "1d"(1天), "3d"(3天), "1w"(1周) |

#### 响应示例

```json
{
  "code": 0,
  "data": {
    "timeRange": "1d",
    "transactionCount": 25,
    "coinAmounts": {
      "ETH": 50.5,
      "BTC": 2.3,
      "BNB": 120.75
    }
  },
  "message": "操作成功",
  "timestamp": 1672531260000
}
```

## 错误码说明

| 错误码 | 描述 |
|-------|------|
| 0 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（管理员密码错误） |
| 404 | 资源不存在 |
| 409 | 资源冲突（如交易hash已存在） |
| 500 | 服务器内部错误 |