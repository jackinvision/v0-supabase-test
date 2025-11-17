import { createClient } from '@/lib/supabase/server';
import { createCreemClient } from '@/lib/creem';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 检查 Creem 配置
    if (!process.env.CREEM_API_KEY) {
      console.error('CREEM_API_KEY 未配置');
      return NextResponse.json(
        { 
          error: '支付功能暂未配置',
          message: 'CREEM_API_KEY 环境变量未设置，请联系管理员'
        },
        { status: 503 }
      );
    }

    const supabase = await createClient();
    const creem = createCreemClient();

    // 获取当前用户
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '用户未登录' },
        { status: 401 }
      );
    }

    const { product_id, success_url, cancel_url } = await request.json();

    if (!product_id) {
      return NextResponse.json(
        { error: '缺少产品ID' },
        { status: 400 }
      );
    }

    // 创建Creem支付会话
    const checkoutSession = await creem.createCheckoutSession({
      product_id,
      success_url: success_url || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://v0-supabase-starter-next-js.vercel.app'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://v0-supabase-starter-next-js.vercel.app'}/payment/cancel`,
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        user_email: user.email || '',
      },
    });

    return NextResponse.json({
      success: true,
      checkout_url: checkoutSession.checkout_url,
      session_id: checkoutSession.session_id,
    });

  } catch (error) {
    console.error('创建支付会话失败:', error);
    return NextResponse.json(
      {
        error: '创建支付会话失败',
        message: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}