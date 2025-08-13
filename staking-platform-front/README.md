# NexaFi - 区块链质押平台

NexaFi是一个现代化的区块链质押平台前端项目，支持多链多币种质押功能。

## 特点

- 使用Vue 3和Tailwind CSS构建的现代UI
- 支持白天/黑夜两种主题模式
- 支持中英文语言切换
- 响应式设计，适配PC和移动设备
- 集成ethers.js v6，支持连接Web3钱包
- 支持多链（以太坊、BSC、Polygon、Arbitrum等）
- 支持多币种质押（ETH、BNB、MATIC、USDT、USDC等）

## 技术栈

- Vue 3
- Tailwind CSS 3.3.3
- Vue Router
- Ethers.js v6
- Headless UI
- Heroicons

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 项目结构

```
/
├── public/              # 静态资源
├── src/
│   ├── components/      # 组件
│   │   └── layout/      # 布局组件
│   ├── composables/     # 组合式API
│   ├── config/          # 配置文件
│   ├── styles/          # 样式文件
│   ├── utils/           # 工具函数
│   ├── views/           # 页面视图
│   ├── App.vue          # 根组件
│   └── main.js          # 入口文件
├── index.html           # HTML模板
├── package.json         # 项目配置
├── tailwind.config.js   # Tailwind配置
└── vite.config.js       # Vite配置
```

## 功能

- 用户质押数据展示
- 多链多币种质押
- 质押历史和收益查询
- 钱包连接和管理
- 邀请链接系统
- 主题切换
- 语言切换