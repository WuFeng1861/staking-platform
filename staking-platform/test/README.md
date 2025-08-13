# 质押平台测试说明

本目录包含质押平台后端服务的测试用例，主要测试了以下组件：

1. `StakingService` - 质押服务的核心业务逻辑
2. `StakingController` - 质押服务的API控制器
3. `CacheService` - 缓存服务

## 测试文件结构

```
test/
├── staking/
│   ├── cache.service.spec.ts     # 缓存服务测试
│   ├── staking.controller.spec.ts # 控制器测试
│   ├── staking.service.spec.ts    # 服务测试
│   └── test-utils.ts              # 测试工具函数
└── jest-e2e.json                  # Jest配置文件
```

## 运行测试

### 单元测试

运行所有单元测试：

```bash
npm test
```

运行特定测试文件：

```bash
npm test -- staking.service.spec
```

### 测试覆盖率

生成测试覆盖率报告：

```bash
npm run test:cov
```

## 测试内容

### StakingService 测试

- 创建质押记录
  - 成功创建新记录并更新总量
  - 创建新的总量记录（如果不存在）
  - 处理重复记录

- 查询质押记录
  - 分页查询

- 查询质押总量
  - 管理员验证

- 统计功能
  - 缓存处理
  - 不同时间范围的统计

### StakingController 测试

- API接口测试
  - 创建质押记录
  - 查询质押记录
  - 管理员查询总量
  - 查询统计数据

### CacheService 测试

- 基本缓存操作
  - 设置和获取缓存
  - 缓存过期
  - 删除缓存
  - 清空缓存
  - 获取所有键
  - 检查键是否存在

## 测试工具

`test-utils.ts` 文件提供了一系列辅助函数，用于生成测试数据和模拟对象：

- `createMockStakingRecord` - 创建模拟质押记录
- `createMockStakingRecords` - 创建多个模拟质押记录
- `createMockStakingTotal` - 创建模拟质押总量
- `createMockStakingTotals` - 创建多个模拟质押总量
- `createMockCreateStakingDto` - 创建模拟质押DTO
- `createMockStatsData` - 创建模拟统计数据
- `createMockRepository` - 创建模拟Repository