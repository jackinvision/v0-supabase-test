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

    const { product_id, success_url } = await request.json();

    if (!product_id) {
      return NextResponse.json(
        { error: '缺少产品ID' },
        { status: 400 }
      );
    }

    // 记录请求信息（用于调试）
    console.log('创建支付会话请求:', {
      product_id,
      customer_email: user.email,
      api_url: process.env.CREEM_API_URL || 'https://test-api.creem.io'
    });

    // 创建Creem支付会话
    const checkoutSession = await creem.createCheckoutSession({
      product_id,
      success_url: success_url || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://v0-supabase-starter-next-js.vercel.app'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    });

    console.log('支付会话创建成功:', {
      session_id: checkoutSession.id,
      checkout_url: checkoutSession.checkout_url
    });

    return NextResponse.json({
      success: true,
      checkout_url: checkoutSession.checkout_url,
      session_id: checkoutSession.id, // 使用实际的字段名
    });

  } catch (error) {
    console.error('创建支付会话失败:', error);
    
    // 返回更详细的错误信息
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    
    return NextResponse.json(
      {
        error: '创建支付会话失败',
        message: errorMessage,
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}