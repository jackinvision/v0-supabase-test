import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.CREEM_API_KEY;
    const apiUrl = process.env.CREEM_API_URL || 'https://test-api.creem.io';
    const productId = process.env.NEXT_PUBLIC_CREEM_PRODUCT_ID || 'prod_5zeSPatnY0iYdSrObAdfXQ';

    if (!apiKey) {
      return NextResponse.json({ error: 'CREEM_API_KEY not configured' }, { status: 500 });
    }

    console.log('Testing Creem API with:', { apiUrl, productId: productId.substring(0, 15) + '...' });

    // 测试获取产品信息
    const response = await fetch(`${apiUrl}/v1/products/${productId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      data: responseData,
      config: {
        apiUrl,
        productId,
        hasApiKey: !!apiKey,
      }
    });

  } catch (error) {
    console.error('Creem API test failed:', error);
    return NextResponse.json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

