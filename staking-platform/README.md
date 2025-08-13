# 质押平台后端

基于NestJS实现的质押平台后端系统，提供质押记录、查询和统计功能。

## 功能特点

- 记录用户质押数据，支持多种币种和多条链
- 分页查询质押记录
- 管理员查询所有质押总量
- 统计最近时间段的质押交易笔数和各币种数量
- 自定义缓存实现
- 统一接口返回格式
- 环境变量配置

## 技术栈

- NestJS: 后端框架
- TypeORM: ORM框架
- MySQL: 数据库
- TypeScript: 开发语言
- dotenv: 环境变量管理

## 安装与运行

### 前置条件

- Node.js (v14+)
- MySQL

### 安装依赖

```bash
npm install
```

### 配置环境变量

复制`.env.example`文件为`.env`，并根据实际情况修改配置：

```
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=staking_platform

# 应用配置
PORT=62777

# 管理员密码
ADMIN_PASSWORD=wufeng1998-staking-platform
```

### 创建数据库

```sql
CREATE DATABASE staking_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 运行应用

开发模式：

```bash
npm run start:dev
```

生产模式：

```bash
npm run build
npm run start:prod
```

## API文档

详细的API文档请参考 [api.md](./api.md)

## 数据库设计

### 质押记录表 (staking_records)

- id: 主键
- transactionHash: 交易hash（唯一索引）
- stakingCoin: 质押币种
- stakingAmount: 质押数量
- stakingStartTime: 质押起始时间
- stakingMinDuration: 质押最短时间
- stakingApr: 质押年化
- stakingAddress: 质押地址（索引）
- stakingChain: 质押的链
- createdAt: 创建时间
- updatedAt: 更新时间

### 质押总量表 (staking_totals)

- id: 主键
- stakingChain: 质押的链
- stakingCoin: 质押的币种
- totalAmount: 质押总币量
- createdAt: 创建时间
- updatedAt: 更新时间

## 缓存设计

自定义缓存类实现了以下功能：

- 设置缓存（支持TTL）
- 获取缓存
- 删除缓存
- 清空所有缓存
- 获取所有缓存键
- 检查缓存键是否存在

用于统计最近时间段的质押交易笔数和各币种数量。