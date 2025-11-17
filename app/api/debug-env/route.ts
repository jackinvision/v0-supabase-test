import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasCreemApiKey: !!process.env.CREEM_API_KEY,
    hasCreemProductId: !!process.env.NEXT_PUBLIC_CREEM_PRODUCT_ID,
    hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasCreemWebhookSecret: !!process.env.CREEM_WEBHOOK_SECRET,
    creemApiUrl: process.env.CREEM_API_URL || 'https://test-api.creem.io',
    productIdPrefix: process.env.NEXT_PUBLIC_CREEM_PRODUCT_ID?.substring(0, 10) + '...',
    // 不显示完整的密钥，只显示是否存在
  });
}

