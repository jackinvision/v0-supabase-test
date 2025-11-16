'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, MessageCircle } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface UserUsage {
  used: number;
  limit: number;
  isPremium: boolean;
  isLoggedIn: boolean;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userUsage, setUserUsage] = useState<UserUsage>({
    used: 0,
    limit: 3,
    isPremium: false,
    isLoggedIn: false
  });

  const supabase = createClient();

  // 检查用户使用情况
  useEffect(() => {
    checkUserUsage();
  }, []);

  const checkUserUsage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // 未登录用户 - 3轮限制
        const sessionId = getSessionId();
        const { data: usage } = await supabase
          .from('user_daily_usage')
          .select('message_count')
          .eq('session_id', sessionId)
          .eq('conversation_date', new Date().toISOString().split('T')[0])
          .single();

        setUserUsage({
          used: usage?.message_count || 0,
          limit: 3,
          isPremium: false,
          isLoggedIn: false
        });
        return;
      }

      // 已登录用户 - 检查订阅状态
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('status, current_period_end')
        .eq('user_id', user.id)
        .single();

      const isPremium = subscription?.status === 'active' &&
                       new Date(subscription.current_period_end) > new Date();

      const { data: usage } = await supabase
        .from('user_daily_usage')
        .select('message_count')
        .eq('user_id', user.id)
        .eq('conversation_date', new Date().toISOString().split('T')[0])
        .single();

      setUserUsage({
        used: usage?.message_count || 0,
        limit: isPremium ? Infinity : 7,
        isPremium: !!isPremium,
        isLoggedIn: true
      });

    } catch (error) {
      console.error('检查使用情况失败:', error);
    }
  };

  const getSessionId = () => {
    let sessionId = localStorage.getItem('chat_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('chat_session_id', sessionId);
    }
    return sessionId;
  };

  const incrementUsage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const sessionId = getSessionId();
      const today = new Date().toISOString().split('T')[0];

      if (user) {
        // 已登录用户 - 检查今天是否已有记录
        const { data: existingUsage } = await supabase
          .from('user_daily_usage')
          .select('id, message_count')
          .eq('user_id', user.id)
          .eq('conversation_date', today)
          .single();

        if (existingUsage) {
          // 更新现有记录
          await supabase
            .from('user_daily_usage')
            .update({ message_count: existingUsage.message_count + 1 })
            .eq('id', existingUsage.id);
        } else {
          // 创建新记录
          await supabase
            .from('user_daily_usage')
            .insert({
              user_id: user.id,
              conversation_date: today,
              message_count: 1,
            });
        }
      } else {
        // 未登录用户
        const { data: existingUsage } = await supabase
          .from('user_daily_usage')
          .select('id, message_count')
          .eq('session_id', sessionId)
          .eq('conversation_date', today)
          .single();

        if (existingUsage) {
          // 更新现有记录
          await supabase
            .from('user_daily_usage')
            .update({ message_count: existingUsage.message_count + 1 })
            .eq('id', existingUsage.id);
        } else {
          // 创建新记录
          await supabase
            .from('user_daily_usage')
            .insert({
              session_id: sessionId,
              conversation_date: today,
              message_count: 1,
            });
        }
      }
    } catch (error) {
      console.error('更新使用记录失败:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    if (userUsage.used >= userUsage.limit) {
      alert(userUsage.isLoggedIn ? '您已达到今日免费对话限制，请升级到高级版！' : '请登录以获得更多对话次数！');
      return;
    }

    setIsLoading(true);
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      // 模拟AI回复
      await new Promise(resolve => setTimeout(resolve, 1000));

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `这是对"${input}"的回复。这是一个简单的演示回复。`,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // 增加使用次数
      await incrementUsage();
      await checkUserUsage();

    } catch (error) {
      console.error('发送消息失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = () => {
    // 跳转到支付页面
    window.location.href = '/pricing';
  };

  const handleLogin = () => {
    window.location.href = '/auth/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 使用情况卡片 */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                <span className="font-medium">
                  今日对话: {userUsage.used}/{userUsage.limit === Infinity ? '无限' : userUsage.limit}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {userUsage.isPremium ? (
                  <Badge variant="default" className="bg-gradient-to-r from-amber-500 to-amber-600">
                    <Crown className="h-3 w-3 mr-1" />
                    高级版
                  </Badge>
                ) : userUsage.isLoggedIn ? (
                  <Button variant="outline" size="sm" onClick={handleUpgrade}>
                    <Crown className="h-3 w-3 mr-1" />
                    升级到高级版
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={handleLogin}>
                    <Lock className="h-3 w-3 mr-1" />
                    登录
                  </Button>
                )}
              </div>
            </div>
            {!userUsage.isPremium && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(userUsage.used / userUsage.limit) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 聊天区域 */}
        <Card className="h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              AI 对话助手
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {/* 消息列表 */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>开始对话吧！问我任何问题。</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="animate-pulse">正在思考...</div>
                  </div>
                </div>
              )}
            </div>

            {/* 输入区域 */}
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="输入你的问题..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isLoading || userUsage.used >= userUsage.limit}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || userUsage.used >= userUsage.limit}
              >
                发送
              </Button>
            </div>

            {/* 限制提示 */}
            {userUsage.used >= userUsage.limit && (
              <div className="mt-2 text-center text-sm text-red-600">
                {userUsage.isLoggedIn
                  ? '您已达到今日对话限制，升级到高级版以获得无限对话！'
                  : '请登录以获得更多对话次数！'
                }
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}