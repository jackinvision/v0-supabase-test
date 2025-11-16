# 部署指南

## 🚀 快速部署到 Vercel

### 1. 准备工作

确保你已经完成以下设置：

#### Supabase 设置
- [x] Supabase 项目已创建
- [x] 获得了 Supabase URL 和 API Keys
- [x] 环境变量已配置

#### Creem 设置
- [x] Creem 账号已注册
- [x] 产品已创建 (Product ID: `prod_5zeSPatnY0iYdSrObAdfXQ`)
- [x] Webhook 已配置: `https://v0-supabase-starter-next-js.vercel.app/api/webhooks/creem`
- [x] 获得了 API Keys

### 2. 环境变量配置

在 Vercel 项目设置中添加以下环境变量：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Creem
CREEM_API_KEY=creem_test_YmVRBU86Xx0TVCQsybPMH
CREEM_WEBHOOK_SECRET=whsec_4ne16fJraROBO5LDkW0vzK
CREEM_PRODUCT_ID=prod_5zeSPatnY0iYdSrObAdfXQ
CREEM_API_URL=https://test-api.creem.io

# 网站配置
NEXT_PUBLIC_SITE_URL=https://v0-supabase-starter-next-js.vercel.app
NEXT_PUBLIC_CREEM_PRODUCT_ID=prod_5zeSPatnY0iYdSrObAdfXQ
```

### 3. 数据库初始化

部署完成后，访问以下 URL 来初始化数据库表：

```
https://v0-supabase-starter-next-js.vercel.app/api/init-db
```

或者直接在 Supabase SQL 编辑器中运行 `supabase/migrations/001_initial_tables.sql` 中的 SQL 语句。

### 4. 功能测试

1. **基本功能测试**
   - 访问首页: `https://v0-supabase-starter-next-js.vercel.app`
   - 点击"立即体验"进入对话页面
   - 测试未登录用户的对话限制（3轮）

2. **用户注册/登录**
   - 访问 `/auth/sign-up` 注册新用户
   - 访问 `/auth/login` 登录
   - 测试登录用户的对话限制（7轮）

3. **支付功能测试**
   - 在首页点击"立即升级"
   - 测试 Creem 支付流程
   - 验证支付成功后的权限升级

### 5. Webhook 测试

在 Creem 后台发送测试 webhook 到：
```
https://v0-supabase-starter-next-js.vercel.app/api/webhooks/creem
```

## 📋 功能特性

### ✅ 已实现功能

1. **用户认证系统**
   - 用户注册/登录
   - 会话管理
   - 权限验证

2. **AI 对话功能**
   - 简单的对话界面
   - 按天计算对话次数
   - 不同用户类型的限制

3. **订阅系统**
   - 免费/高级版区分
   - Creem 支付集成
   - Webhook 自动处理

4. **权限管理**
   - 未登录用户：3轮/天
   - 免费用户：7轮/天
   - 高级用户：无限对话

### 🛠️ 技术栈

- **前端**: Next.js 16 + React 19
- **样式**: Tailwind CSS + shadcn/ui
- **数据库**: Supabase (PostgreSQL)
- **支付**: Creem (测试环境)
- **部署**: Vercel

### 📁 项目结构

```
├── app/
│   ├── api/                 # API 路由
│   │   ├── checkout/        # 支付会话创建
│   │   ├── webhooks/        # Webhook 处理
│   │   └── init-db/         # 数据库初始化
│   ├── auth/                # 认证页面
│   ├── chat/                # 对话页面
│   ├── payment/             # 支付结果页面
│   └── page.tsx             # 首页（含定价表）
├── lib/
│   ├── supabase/           # Supabase 客户端
│   ├── creem.ts            # Creem API 客户端
│   └── db-functions.ts     # 数据库操作函数
└── components/ui/          # UI 组件
```

## 🐛 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 Supabase URL 和 API Keys
   - 确认 RLS 策略设置正确

2. **支付失败**
   - 验证 Creem API Keys
   - 检查 Product ID 是否正确
   - 确认测试环境配置

3. **Webhook 不工作**
   - 验证 Webhook URL 是否可访问
   - 检查 Webhook Secret 是否匹配

### 日志检查

在 Vercel Functions 标签页查看应用日志，或直接访问：
- `/api/init-db` - 数据库初始化日志
- `/api/webhooks/creem` - Webhook 处理日志

## 🔄 更新部署

每次代码更新后，Vercel 会自动重新部署。如需手动触发：

1. 推送代码到 GitHub
2. 或在 Vercel 控制台点击 "Redeploy"

如需更新数据库结构，重新访问 `/api/init-db` 或运行迁移脚本。