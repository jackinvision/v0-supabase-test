import { createClient } from '@/lib/supabase/client';

export async function incrementUserUsage(
  userId: string | null,
  sessionId: string | null,
  conversationDate: string
) {
  const supabase = createClient();

  try {
    if (userId) {
      // 已登录用户
      const { error } = await supabase
        .from('user_daily_usage')
        .upsert({
          user_id: userId,
          conversation_date: conversationDate,
          message_count: 1,
        }, {
          onConflict: 'user_id,conversation_date',
          ignoreDuplicates: false
        });

      if (!error) {
        // 如果记录已存在，增加计数
        await supabase.rpc('increment_usage_count', {
          p_user_id: userId,
          p_conversation_date: conversationDate
        });
      }
    } else if (sessionId) {
      // 未登录用户
      const { error } = await supabase
        .from('user_daily_usage')
        .upsert({
          session_id: sessionId,
          conversation_date: conversationDate,
          message_count: 1,
        }, {
          onConflict: 'session_id,conversation_date',
          ignoreDuplicates: false
        });

      if (!error) {
        // 如果记录已存在，增加计数
        await supabase.rpc('increment_session_usage_count', {
          p_session_id: sessionId,
          p_conversation_date: conversationDate
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error('增加使用记录失败:', error);
    return { success: false, error };
  }
}

export async function getUserUsage(userId: string | null, sessionId: string | null) {
  const supabase = createClient();
  const today = new Date().toISOString().split('T')[0];

  try {
    if (userId) {
      const { data, error } = await supabase
        .from('user_daily_usage')
        .select('message_count')
        .eq('user_id', userId)
        .eq('conversation_date', today)
        .single();

      return { data, error };
    } else if (sessionId) {
      const { data, error } = await supabase
        .from('user_daily_usage')
        .select('message_count')
        .eq('session_id', sessionId)
        .eq('conversation_date', today)
        .single();

      return { data, error };
    }

    return { data: null, error: new Error('No user_id or sessionId provided') };
  } catch (error) {
    console.error('获取使用记录失败:', error);
    return { data: null, error };
  }
}

export async function getUserSubscription(userId: string) {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gte('current_period_end', new Date().toISOString())
      .single();

    return { data, error };
  } catch (error) {
    console.error('获取订阅状态失败:', error);
    return { data: null, error };
  }
}

export async function createUserSubscription(
  userId: string,
  creemSubscriptionId: string,
  creemCustomerId: string,
  productId: string,
  status: string,
  currentPeriodStart?: string,
  currentPeriodEnd?: string
) {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        creem_subscription_id: creemSubscriptionId,
        creem_customer_id: creemCustomerId,
        product_id: productId,
        status,
        current_period_start: currentPeriodStart,
        current_period_end: currentPeriodEnd,
      }, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error('创建订阅记录失败:', error);
    return { data: null, error };
  }
}

export async function updateUserSubscription(
  userId: string,
  updates: {
    status?: string;
    current_period_start?: string;
    current_period_end?: string;
  }
) {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error('更新订阅记录失败:', error);
    return { data: null, error };
  }
}