# 推荐人模块 API

## 1. 绑定推荐人

- **URL**: `/referral/bind`
- **方法**: `POST`
- **描述**: 绑定推荐人上级关系

### 请求参数

```json
{
  "currentAddress": "0x123...",
  "referrerAddress": "0x456...",
  "chainId": "1",
  "chainName": "Ethereum",
  "transactionHash": "0x789..."
}
```

### 响应示例

```json
{
  "code": 0,
  "data": {
    "success": true,
    "message": "绑定上级成功"
  },
  "message": "操作成功",
  "timestamp": 1672531260000
}
```

## 2. 查询下级数量

- **URL**: `/referral/subordinates/count`
- **方法**: `GET`
- **描述**: 查询指定地址的下级数量

### 请求参数

| 参数名 | 类型 | 必填 | 默认值 | 描述 |
|-------|-----|-----|-------|------|
| address | string | 是 | - | 查询的地址 |
| chainId | string | 否 | - | 链ID，不传则查询所有链 |

### 响应示例

查询指定链：
```json
{
  "code": 0,
  "data": {
    "count": 5
  },
  "message": "操作成功",
  "timestamp": 1672531260000
}
```

查询所有链：
```json
{
  "code": 0,
  "data": {
    "count": 15,
    "chainCounts": [
      {
        "chainId": "1",
        "chainName": "Ethereum",
        "count": 8
      },
      {
        "chainId": "56",
        "chainName": "BSC",
        "count": 7
      }
    ]
  },
  "message": "操作成功",
  "timestamp": 1672531260000
}
```

## 3. 根据地址获取推荐人关系

- **URL**: `/referral/referrer/:address`
- **方法**: `GET`
- **描述**: 根据用户地址获取推荐人关系信息

### 请求参数

| 参数名 | 类型 | 必填 | 默认值 | 描述 |
|-------|-----|-----|-------|------|
| address | string | 是 | - | 用户地址 (路径参数) |
| chainId | string | 是 | - | 链ID (查询参数) |

### 响应示例

有推荐人关系：
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "currentAddress": "0x123...",
    "referrerAddress": "0x456...",
    "chainId": "1",
    "chainName": "Ethereum",
    "transactionHash": "0x789...",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "操作成功",
  "timestamp": 1672531260000
}
```

无推荐人关系：
```json
{
  "code": 0,
  "data": null,
  "message": "操作成功",
  "timestamp": 1672531260000
}