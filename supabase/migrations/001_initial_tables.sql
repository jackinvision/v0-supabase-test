-- 用户订阅状态表
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  creem_subscription_id VARCHAR(255) UNIQUE,
  creem_customer_id VARCHAR(255),
  product_id VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'inactive', -- active, cancelled, expired, inactive
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户每日使用记录表
CREATE TABLE IF NOT EXISTS user_daily_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id VARCHAR(255) UNIQUE, -- 用于未登录用户
  conversation_date DATE DEFAULT CURRENT_DATE,
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_daily_usage UNIQUE (user_id, conversation_date),
  CONSTRAINT unique_daily_session UNIQUE (session_id, conversation_date)
);

-- 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_daily_usage_user_id ON user_daily_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_daily_usage_date ON user_daily_usage(conversation_date);
CREATE INDEX IF NOT EXISTS idx_user_daily_usage_session_id ON user_daily_usage(session_id);

-- 创建RLS策略
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_usage ENABLE ROW LEVEL SECURITY;

-- 用户订阅表的RLS策略
CREATE POLICY "Users can view own subscription" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- 用户使用记录表的RLS策略
CREATE POLICY "Users can view own usage" ON user_daily_usage
  FOR SELECT USING (auth.uid() = user_id OR session_id IS NOT NULL);

CREATE POLICY "Users can update own usage" ON user_daily_usage
  FOR UPDATE USING (auth.uid() = user_id);

-- 允许插入新的使用记录（包括未登录用户）
CREATE POLICY "Allow insert usage records" ON user_daily_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id OR session_id IS NOT NULL);

-- 创建更新时间戳的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建触发器自动更新updated_at字段
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_daily_usage_updated_at
  BEFORE UPDATE ON user_daily_usage
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();