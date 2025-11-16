import { createClient } from '@/lib/supabase/server';
import { createCreemClient, CreemWebhookEvent } from '@/lib/creem';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const webhookSecret = process.env.CREEM_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('CREEM_WEBHOOK_SECRET环境变量未设置');
      return NextResponse.json(
        { error: '服务器配置错误' },
        { status: 500 }
      );
    }

    // 获取请求体
    const body = await request.text();
    const signature = request.headers.get('creem-signature') || '';

    // 验证webhook签名
    const isValidSignature = createCreemClient.constructor.verifyWebhookSignature(
      body,
      signature,
      webhookSecret
    );

    if (!isValidSignature) {
      console.error('Webhook签名验证失败');
      return NextResponse.json(
        { error: '无效的签名' },
        { status: 401 }
      );
    }

    // 解析webhook事件
    const event: CreemWebhookEvent = JSON.parse(body);
    console.log('收到webhook事件:', event.type);

    // 处理不同类型的事件
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event, supabase);
        break;

      case 'subscription.created':
        await handleSubscriptionCreated(event, supabase);
        break;

      case 'subscription.activated':
        await handleSubscriptionActivated(event, supabase);
        break;

      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event, supabase);
        break;

      case 'subscription.expired':
        await handleSubscriptionExpired(event, supabase);
        break;

      default:
        console.log('未处理的事件类型:', event.type);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('处理webhook失败:', error);
    return NextResponse.json(
      { error: '处理webhook失败' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(event: CreemWebhookEvent, supabase: any) {
  try {
    const { subscription, customer } = event.data;
    const userId = subscription?.metadata?.user_id;

    if (!userId || !subscription) {
      console.error('缺少必要信息');
      return;
    }

    // 创建或更新用户订阅记录
    const { error } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        creem_subscription_id: subscription.id,
        creem_customer_id: customer?.id || subscription.customer_id,
        product_id: subscription.product_id,
        status: subscription.status,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (error) {
      console.error('保存订阅记录失败:', error);
    } else {
      console.log('订阅记录保存成功，用户ID:', userId);
    }

  } catch (error) {
    console.error('处理支付完成事件失败:', error);
  }
}

async function handleSubscriptionCreated(event: CreemWebhookEvent, supabase: any) {
  console.log('订阅创建事件处理');
  // 类似于处理支付完成事件的逻辑
}

async function handleSubscriptionActivated(event: CreemWebhookEvent, supabase: any) {
  try {
    const { subscription } = event.data;
    const userId = subscription?.metadata?.user_id;

    if (!userId || !subscription) {
      console.error('缺少必要信息');
      return;
    }

    // 更新订阅状态为激活
    const { error } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'active',
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      console.error('更新订阅状态失败:', error);
    } else {
      console.log('订阅激活成功，用户ID:', userId);
    }

  } catch (error) {
    console.error('处理订阅激活事件失败:', error);
  }
}

async function handleSubscriptionCancelled(event: CreemWebhookEvent, supabase: any) {
  try {
    const { subscription } = event.data;

    // 查找对应的用户
    const { data: userSub, error: findError } = await supabase
      .from('user_subscriptions')
      .select('user_id')
      .eq('creem_subscription_id', subscription.id)
      .single();

    if (findError || !userSub) {
      console.error('未找到对应的用户订阅记录');
      return;
    }

    // 更新订阅状态为取消
    const { error } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userSub.user_id);

    if (error) {
      console.error('更新订阅取消状态失败:', error);
    } else {
      console.log('订阅取消成功，用户ID:', userSub.user_id);
    }

  } catch (error) {
    console.error('处理订阅取消事件失败:', error);
  }
}

async function handleSubscriptionExpired(event: CreemWebhookEvent, supabase: any) {
  try {
    const { subscription } = event.data;

    // 查找对应的用户
    const { data: userSub, error: findError } = await supabase
      .from('user_subscriptions')
      .select('user_id')
      .eq('creem_subscription_id', subscription.id)
      .single();

    if (findError || !userSub) {
      console.error('未找到对应的用户订阅记录');
      return;
    }

    // 更新订阅状态为过期
    const { error } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'expired',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userSub.user_id);

    if (error) {
      console.error('更新订阅过期状态失败:', error);
    } else {
      console.log('订阅过期处理成功，用户ID:', userSub.user_id);
    }

  } catch (error) {
    console.error('处理订阅过期事件失败:', error);
  }
}