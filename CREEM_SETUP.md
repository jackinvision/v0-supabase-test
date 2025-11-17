# Creem 支付配置指南

## 🔑 需要配置的环境变量

在 Vercel Dashboard → Settings → Environment Variables 中添加以下变量：

### 后端环境变量（服务器端）

```bash
CREEM_API_KEY=your_creem_api_key
CREEM_API_URL=https://test-api.creem.io  # 测试环境，生产环境用 https://api.creem.io
CREEM_WEBHOOK_SECRET=your_webhook_secret
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 前端环境变量（浏览器端）

```bash
NEXT_PUBLIC_CREEM_PRODUCT_ID=your_product_id
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

## 📋 获取 Creem 凭证步骤

### 1. 注册 Creem 账号

访问 [Creem Dashboard](https://creem.io) 并注册账号

### 2. 获取 API Key

- 登录 Creem Dashboard
- 进入 **Settings** → **API Keys**
- 复制 **Test API Key**（用于测试）或 **Live API Key**（用于生产）

### 3. 创建产品

- 在 Dashboard 中点击 **Products**
- 点击 **Create Product**
- 填写产品信息：
  - Name: 高级版
  - Price: $10
  - Billing Period: Monthly
- 创建后复制 **Product ID**（格式如：`prod_xxxxx`）

### 4. 获取 Webhook Secret

- 进入 **Settings** → **Webhooks**
- 点击 **Add Endpoint**
- 输入 Webhook URL: `https://your-domain.vercel.app/api/webhooks/creem`
- 选择要监听的事件：
  - `checkout.session.completed`
  - `subscription.created`
  - `subscription.updated`
  - `subscription.cancelled`
- 创建后复制 **Webhook Secret**（格式如：`whsec_xxxxx`）

## 🔍 验证配置

### 检查 API Key 是否有效

你可以使用 curl 测试：

```bash
curl -X GET "https://test-api.creem.io/v1/products" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### 检查产品 ID 是否存在

```bash
curl -X GET "https://test-api.creem.io/v1/products/YOUR_PRODUCT_ID" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

如果返回 404，说明产品 ID 不存在，需要重新创建产品。

## ⚠️ 常见错误

### 404 Not Found

**原因**：产品 ID 不存在或 API Key 权限不足

**解决**：
1. 检查产品 ID 是否正确
2. 确认使用的是 Test API Key 还是 Live API Key
3. 确认产品是在对应的环境中创建的（Test/Live）

### 401 Unauthorized

**原因**：API Key 无效或过期

**解决**：
1. 重新生成 API Key
2. 确认 API Key 格式正确（应该以 `creem_` 开头）

### 500 Internal Server Error

**原因**：服务器配置问题

**解决**：
1. 检查 Vercel 环境变量是否正确设置
2. 查看 Vercel Function Logs 获取详细错误信息

## 🚀 测试环境 vs 生产环境

| 环境 | API URL | API Key 前缀 |
|------|---------|-------------|
| 测试 | https://test-api.creem.io | creem_test_ |
| 生产 | https://api.creem.io | creem_live_ |

**建议**：先在测试环境完成集成和测试，确认无误后再切换到生产环境。

## 📞 获取帮助

如果遇到问题，可以：
1. 查看 [Creem 官方文档](https://docs.creem.io)
2. 联系 Creem 支持团队
3. 检查 Vercel Function Logs：Vercel Dashboard → Deployments → 选择部署 → Functions

