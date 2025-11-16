import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    console.log('🚀 开始初始化数据库表...');

    // 创建用户订阅表
    const { error: subscriptionError } = await supabase.rpc('exec_sql', {
      sql: `
        -- 创建用户订阅表
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

        -- 启用RLS
        ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

        -- 创建RLS策略
        DROP POLICY IF EXISTS "Users can view own subscription" ON user_subscriptions;
        CREATE POLICY "Users can view own subscription" ON user_subscriptions
          FOR SELECT USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can update own subscription" ON user_subscriptions;
        CREATE POLICY "Users can update own subscription" ON user_subscriptions
          FOR UPDATE USING (auth.uid() = user_id);
      `
    });

    // 创建用户使用记录表
    const { error: usageError } = await supabase.rpc('exec_sql', {
      sql: `
        -- 创建用户使用记录表
        CREATE TABLE IF NOT EXISTS user_daily_usage (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          session_id VARCHAR(255),
          conversation_date DATE DEFAULT CURRENT_DATE,
          message_count INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          CONSTRAINT unique_daily_usage UNIQUE (user_id, conversation_date),
          CONSTRAINT unique_daily_session UNIQUE (session_id, conversation_date)
        );

        -- 启用RLS
        ALTER TABLE user_daily_usage ENABLE ROW LEVEL SECURITY;

        -- 创建RLS策略
        DROP POLICY IF EXISTS "Users can view own usage" ON user_daily_usage;
        CREATE POLICY "Users can view own usage" ON user_daily_usage
          FOR SELECT USING (auth.uid() = user_id OR session_id IS NOT NULL);

        DROP POLICY IF EXISTS "Users can update own usage" ON user_daily_usage;
        CREATE POLICY "Users can update own usage" ON user_daily_usage
          FOR UPDATE USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Allow insert usage records" ON user_daily_usage;
        CREATE POLICY "Allow insert usage records" ON user_daily_usage
          FOR INSERT WITH CHECK (auth.uid() = user_id OR session_id IS NOT NULL);

        DROP POLICY IF EXISTS "Allow insert anonymous usage" ON user_daily_usage;
        CREATE POLICY "Allow insert anonymous usage" ON user_daily_usage
          FOR INSERT WITH CHECK (session_id IS NOT NULL);
      `
    });

    if (subscriptionError || usageError) {
      console.log('⚠️ 表创建可能已存在或有其他问题:', { subscriptionError, usageError });
    }

    console.log('✅ 数据库初始化完成！');

    return NextResponse.json({
      success: true,
      message: '数据库初始化成功',
      tables: ['user_subscriptions', 'user_daily_usage']
    });

  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '数据库初始化失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}