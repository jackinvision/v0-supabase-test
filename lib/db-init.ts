import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function initializeDatabase() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🚀 开始初始化数据库表...');

    // 创建用户订阅表
    const { error: subscriptionError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_subscriptions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          creem_subscription_id VARCHAR(255) UNIQUE,
          creem_customer_id VARCHAR(255),
          product_id VARCHAR(255),
          status VARCHAR(50) NOT NULL DEFAULT 'inactive',
          current_period_start TIMESTAMP WITH TIME ZONE,
          current_period_end TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

        CREATE POLICY IF NOT EXISTS "Users can view own subscription" ON user_subscriptions
          FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can update own subscription" ON user_subscriptions
          FOR UPDATE USING (auth.uid() = user_id);
      `
    });

    if (subscriptionError) {
      console.log('⚠️ 订阅表创建可能已存在或出错:', subscriptionError.message);
    }

    // 创建用户使用记录表
    const { error: usageError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_daily_usage (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          session_id VARCHAR(255) UNIQUE,
          conversation_date DATE DEFAULT CURRENT_DATE,
          message_count INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          CONSTRAINT unique_daily_usage UNIQUE (user_id, conversation_date),
          CONSTRAINT unique_daily_session UNIQUE (session_id, conversation_date)
        );

        ALTER TABLE user_daily_usage ENABLE ROW LEVEL SECURITY;

        CREATE POLICY IF NOT EXISTS "Users can view own usage" ON user_daily_usage
          FOR SELECT USING (auth.uid() = user_id OR session_id IS NOT NULL);

        CREATE POLICY IF NOT EXISTS "Users can update own usage" ON user_daily_usage
          FOR UPDATE USING (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Allow insert usage records" ON user_daily_usage
          FOR INSERT WITH CHECK (auth.uid() = user_id OR session_id IS NOT NULL);
      `
    });

    if (usageError) {
      console.log('⚠️ 使用记录表创建可能已存在或出错:', usageError.message);
    }

    console.log('✅ 数据库初始化完成！');
    return true;

  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    return false;
  }
}