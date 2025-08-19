# NFT交易模块 API

## 1. 上报 NFT 交易数据

- **URL**: `/nft/transaction`
- **方法**: `POST`
- **描述**: 上报 NFT 交易数据

### 请求参数

```json
{
  "txHash": "0x123456789abcdef",
  "currency": "ETH",
  "amount": "10.5",
  "startTime": "2023-01-01T00:00:00Z",
  "minTime": "30",
  "annualizedYield": "0.05",
  "fromAddress": "0xabc...",
  "toAddress": "0xdef...",
  "chain": "Ethereum"
}
```

### 响应示例

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

## 2. 查询 NFT 交易数据

- **URL**: `/nft/transactions`
- **方法**: `GET`
- **描述**: 查询 NFT 交易数据

### 请求参数

| 参数名 | 类型 | 必填 | 默认值 | 描述 |
|-------|-----|-----|-------|------|
| fromAddress | string | 否 | - | 转出地址 |
| toAddress | string | 否 | - | 转入地址 |
| minId | number | 否 | 0 | 最小ID，0表示从最新记录开始查询 |
| pageSize | number | 否 | 10 | 每页数据条数 |

### 响应示例

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
    }
  ],
  "message": "操作成功",
  "timestamp": 1672531260000
}
```

## 3. 查询 NFT 交易最大 ID

- **URL**: `/nft/max-id`
- **方法**: `GET`
- **描述**: 查询 NFT 交易记录中的最大 ID

### 请求参数

无

### 响应示例

```json
{
  "code": 0,
  "data": {
    "maxId": 12345
  },
  "message": "操作成功",
  "timestamp": 1672531260000
}