# 质押平台 API 文档

## 📖 文档说明

本项目的 API 文档已按模块拆分，请查看 `docs/` 目录下的具体模块文档：

## 📁 模块文档

- **[总览文档](./docs/README.md)** - 基本信息和错误码说明
- **[质押模块 API](./docs/staking-api.md)** - 质押相关接口
- **[NFT交易模块 API](./docs/nft-api.md)** - NFT交易相关接口  
- **[推荐人模块 API](./docs/referral-api.md)** - 推荐人关系相关接口
- **[奖励记录模块 API](./docs/reward-api.md)** - 奖励记录相关接口
- **[币种兑换模块 API](./docs/exchange-api.md)** - 币种兑换相关接口

## 🚀 快速开始

1. 查看 [总览文档](./docs/README.md) 了解基本信息
2. 根据需要查看具体模块的 API 文档
3. 所有接口都使用统一的响应格式

## 📋 模块功能概览

| 模块 | 功能描述 | 主要接口 |
|------|----------|----------|
| 质押模块 | 质押操作、自动奖励发放 | POST /staking |
| NFT交易模块 | NFT交易记录管理 | POST /nft/transaction |
| 推荐人模块 | 推荐人关系管理 | POST /referral/bind |
| 奖励记录模块 | 奖励记录查询统计 | GET /reward |
| 币种兑换模块 | 币种兑换比例管理 | GET /exchange/rates |

## 🔗 相关链接

- 基础URL: `http://localhost:62777`
- 数据库初始化: `init-db.sql`
- 项目结构: `src/modules/`