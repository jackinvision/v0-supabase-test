interface CreemCheckoutRequest {
  product_id: string;
  success_url: string;
  cancel_url: string;
  customer_email?: string;
  metadata?: Record<string, string>;
}

interface CreemCheckoutResponse {
  checkout_url: string;
  session_id: string;
}

interface CreemCustomer {
  id: string;
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}

interface CreemSubscription {
  id: string;
  customer_id: string;
  product_id: string;
  status: 'active' | 'cancelled' | 'expired' | 'incomplete';
  current_period_start: string;
  current_period_end: string;
  metadata?: Record<string, string>;
}

interface CreemWebhookEvent {
  id: string;
  type: string;
  data: {
    checkout?: CreemCheckoutResponse;
    subscription?: CreemSubscription;
    customer?: CreemCustomer;
    [key: string]: any;
  };
  created_at: string;
}

class CreemClient {
  private apiKey: string;
  private apiUrl: string;

  constructor(apiKey: string, apiUrl: string = 'https://test-api.creem.io') {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.apiUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Creem API error: ${response.status} ${response.statusText} - ${
          errorData.message || 'Unknown error'
        }`
      );
    }

    return response.json();
  }

  /**
   * 创建支付会话
   */
  async createCheckoutSession(data: CreemCheckoutRequest): Promise<CreemCheckoutResponse> {
    return this.makeRequest<CreemCheckoutResponse>('/v1/checkout/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * 获取订阅信息
   */
  async getSubscription(subscriptionId: string): Promise<CreemSubscription> {
    return this.makeRequest<CreemSubscription>(`/v1/subscriptions/${subscriptionId}`);
  }

  /**
   * 获取客户信息
   */
  async getCustomer(customerId: string): Promise<CreemCustomer> {
    return this.makeRequest<CreemCustomer>(`/v1/customers/${customerId}`);
  }

  /**
   * 获取客户的订阅列表
   */
  async getCustomerSubscriptions(customerId: string): Promise<CreemSubscription[]> {
    return this.makeRequest<CreemSubscription[]>(`/v1/customers/${customerId}/subscriptions`);
  }

  /**
   * 取消订阅
   */
  async cancelSubscription(subscriptionId: string): Promise<CreemSubscription> {
    return this.makeRequest<CreemSubscription>(`/v1/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
    });
  }

  /**
   * 验证webhook签名
   */
  static verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    // 这里需要实现具体的签名验证逻辑
    // 根据Creem文档的说明来实现
    // 现在先简单返回true，实际使用时需要实现真正的签名验证
    try {
      // 示例验证逻辑（需要根据Creem的具体实现调整）
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload, 'utf8')
        .digest('hex');

      return signature === `sha256=${expectedSignature}`;
    } catch (error) {
      console.error('Webhook签名验证失败:', error);
      return false;
    }
  }
}

// 创建Creem客户端实例
export function createCreemClient() {
  const apiKey = process.env.CREEM_API_KEY;
  const apiUrl = process.env.CREEM_API_URL || 'https://test-api.creem.io';

  if (!apiKey) {
    throw new Error('CREEM_API_KEY环境变量未设置');
  }

  return new CreemClient(apiKey, apiUrl);
}

// 导出类型
export type {
  CreemCheckoutRequest,
  CreemCheckoutResponse,
  CreemCustomer,
  CreemSubscription,
  CreemWebhookEvent,
};