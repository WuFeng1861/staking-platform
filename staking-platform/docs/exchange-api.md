# 币种兑换模块 API

## 1. 创建兑换比例

- **URL**: `/exchange/rate`
- **方法**: `POST`
- **描述**: 创建新的币种兑换比例

### 请求参数

```json
{
  "fromToken": "USDT",
  "toToken": "NexaFi",
  "exchangeRate": "100",
  "isActive": true
}
```

### 响应示例

```json
{
  "code": 0,
  "data": {
    "id": 1,
    "fromToken": "USDT",
    "toToken": "NexaFi",
    "exchangeRate": "100",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "操作成功",
  "timestamp": 1672531260000
}
```

## 2. 获取所有兑换比例

- **URL**: `/exchange/rates`
- **方法**: `GET`
- **描述**: 获取所有币种兑换比例

### 响应示例

```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "fromToken": "USDT",
      "toToken": "NexaFi",
      "exchangeRate": "100",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "fromToken": "BNB",
      "toToken": "NexaFi",
      "exchangeRate": "80000",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "message": "操作成功",
  "timestamp": 1672531260000
}
```

## 3. 获取启用的兑换比例

- **URL**: `/exchange/rates/active`
- **方法**: `GET`
- **描述**: 获取所有启用的币种兑换比例

### 响应示例

同上，但只返回 `isActive: true` 的记录

## 4. 根据币种对获取兑换比例

- **URL**: `/exchange/rate/:fromToken/:toToken`
- **方法**: `GET`
- **描述**: 根据币种对获取兑换比例

### 请求参数

| 参数名 | 类型 | 必填 | 默认值 | 描述 |
|-------|-----|-----|-------|------|
| fromToken | string | 是 | - | 源币种 (路径参数) |
| toToken | string | 是 | - | 目标币种 (路径参数) |

### 响应示例

```json
{
  "code": 0,
  "data": {
    "id": 1,
    "fromToken": "USDT",
    "toToken": "NexaFi",
    "exchangeRate": "100",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "操作成功",
  "timestamp": 1672531260000
}
```

## 5. 计算兑换数量

- **URL**: `/exchange/calculate/:fromToken/:toToken`
- **方法**: `GET`
- **描述**: 计算币种兑换数量

### 请求参数

| 参数名 | 类型 | 必填 | 默认值 | 描述 |
|-------|-----|-----|-------|------|
| fromToken | string | 是 | - | 源币种 (路径参数) |
| toToken | string | 是 | - | 目标币种 (路径参数) |
| amount | string | 是 | - | 兑换数量 (查询参数) |

### 响应示例

```json
{
  "code": 0,
  "data": {
    "fromAmount": "10",
    "toAmount": "1000",
    "rate": "100"
  },
  "message": "操作成功",
  "timestamp": 1672531260000
}
```

## 6. 更新兑换比例

- **URL**: `/exchange/rate/:id`
- **方法**: `PUT`
- **描述**: 更新指定的兑换比例

### 请求参数

| 参数名 | 类型 | 必填 | 默认值 | 描述 |
|-------|-----|-----|-------|------|
| id | number | 是 | - | 兑换比例ID (路径参数) |

```json
{
  "exchangeRate": "120",
  "isActive": true
}
```

### 响应示例

```json
{
  "code": 0,
  "data": {
    "id": 1,
    "fromToken": "USDT",
    "toToken": "NexaFi",
    "exchangeRate": "120",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:01:00.000Z"
  },
  "message": "操作成功",
  "timestamp": 1672531260000
}
```

## 7. 启用/禁用兑换比例

- **URL**: `/exchange/rate/:id/toggle`
- **方法**: `PUT`
- **描述**: 启用或禁用指定的兑换比例

### 请求参数

| 参数名 | 类型 | 必填 | 默认值 | 描述 |
|-------|-----|-----|-------|------|
| id | number | 是 | - | 兑换比例ID (路径参数) |

```json
{
  "isActive": false
}
```

### 响应示例

同上

## 8. 删除兑换比例

- **URL**: `/exchange/rate/:id`
- **方法**: `DELETE`
- **描述**: 删除指定的兑换比例

### 请求参数

| 参数名 | 类型 | 必填 | 默认值 | 描述 |
|-------|-----|-----|-------|------|
| id | number | 是 | - | 兑换比例ID (路径参数) |

### 响应示例

```json
{
  "code": 0,
  "data": {
    "message": "兑换比例删除成功"
  },
  "message": "操作成功",
  "timestamp": 1672531260000
}