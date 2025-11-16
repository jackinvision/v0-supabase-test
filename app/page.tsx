"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Shield, Zap, Globe, Crown, Check, X, MessageCircle, Star } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

function PricingSection() {
  const [userPlan, setUserPlan] = useState<'free' | 'premium' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    checkUserPlan();
  }, []);

  const checkUserPlan = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setUserPlan('free');
        return;
      }

      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('status, current_period_end')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gte('current_period_end', new Date().toISOString())
        .single();

      setUserPlan(subscription ? 'premium' : 'free');
    } catch (error) {
      setUserPlan('free');
    }
  };

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = '/auth/login';
        return;
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: process.env.NEXT_PUBLIC_CREEM_PRODUCT_ID || 'prod_5zeSPatnY0iYdSrObAdfXQ',
        }),
      });

      const data = await response.json();

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        alert('创建支付会话失败，请稍后重试');
      }
    } catch (error) {
      console.error('订阅失败:', error);
      alert('订阅失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const plans = [
    {
      name: '免费版',
      description: '适合轻度使用',
      price: '$0',
      period: '/月',
      features: [
        { text: '每日7次对话', included: true },
        { text: '基础AI模型', included: true },
        { text: '社区支持', included: true },
        { text: '无限对话', included: false },
        { text: '高级AI模型', included: false },
        { text: '优先支持', included: false },
      ],
      buttonText: userPlan === 'free' ? '当前计划' : '开始使用',
      buttonVariant: userPlan === 'free' ? 'outline' : 'default',
      popular: false,
    },
    {
      name: '高级版',
      description: '适合重度使用',
      price: '$10',
      period: '/月',
      features: [
        { text: '每日7次对话', included: true },
        { text: '基础AI模型', included: true },
        { text: '社区支持', included: true },
        { text: '无限对话', included: true },
        { text: '高级AI模型', included: true },
        { text: '优先支持', included: true },
      ],
      buttonText: userPlan === 'premium' ? '当前计划' : (userPlan === 'free' ? '立即升级' : '升级到高级版'),
      buttonVariant: userPlan === 'premium' ? 'outline' : 'default',
      popular: true,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="text-center mb-16">
        <h2 className="text-balance mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          选择适合你的计划
        </h2>
        <p className="text-pretty mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
          从免费开始，随时可以升级到高级版解锁更多功能
        </p>
        {userPlan && (
          <div className="mt-4">
            <Badge variant={userPlan === 'premium' ? 'default' : 'secondary'} className="text-sm">
              {userPlan === 'premium' ? (
                <>
                  <Crown className="h-3 w-3 mr-1" />
                  您正在使用高级版
                </>
              ) : (
                '您正在使用免费版'
              )}
            </Badge>
          </div>
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative ${
              plan.popular
                ? 'border-2 border-primary shadow-lg scale-105'
                : 'border border-border'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
                  <Star className="h-3 w-3 mr-1" />
                  最受欢迎
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
              <p className="text-muted-foreground">{plan.description}</p>
              <div className="mt-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    )}
                    <span className={feature.included ? '' : 'text-muted-foreground'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full h-11"
                variant={plan.buttonVariant as any}
                onClick={plan.name === '高级版' && userPlan !== 'premium' ? handleSubscribe : undefined}
                disabled={isLoading || (plan.buttonText === '当前计划')}
                asChild={plan.buttonText === '当前计划' ? false : plan.name === '免费版' ? true : undefined}
              >
                {plan.name === '免费版' && plan.buttonText !== '当前计划' ? (
                  <Link href="/chat">{plan.buttonText}</Link>
                ) : (
                  <>
                    {plan.buttonText === '当前计划' ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        {plan.buttonText}
                      </>
                    ) : (
                      <>
                        {isLoading ? (
                          '处理中...'
                        ) : (
                          <>
                            {plan.name === '高级版' && <Crown className="h-4 w-4 mr-2" />}
                            {plan.buttonText}
                          </>
                        )}
                      </>
                    )}
                  </>
                )}
              </Button>

              {plan.name === '免费版' && (
                <p className="text-xs text-muted-foreground text-center mt-3">
                  无需信用卡 • 随时升级
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          所有计划均包含 • 安全加密 • 随时取消 • 24/7支持
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mx-auto max-w-4xl space-y-8">
          <h1 className="text-balance text-5xl font-semibold tracking-tight sm:text-6xl md:text-7xl">
            构建你的下一个
            <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              伟大产品
            </span>
          </h1>
          <p className="text-pretty mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            基于 Next.js 和 Supabase 的现代化应用模板，让你专注于创造价值
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="group min-w-[160px] rounded-full" asChild>
              <Link href="/chat">
                <MessageCircle className="mr-2 h-4 w-4" />
                立即体验
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="min-w-[160px] rounded-full" asChild>
              <Link href="/auth/login">登录</Link>
            </Button>
          </div>
        </div>

        {/* Floating gradient orbs for visual interest */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -bottom-40 right-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/30 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-balance mb-16 text-center text-3xl font-semibold tracking-tight sm:text-4xl">
            为什么选择我们
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="极速部署"
              description="基于 Vercel 和 Supabase，几分钟内即可上线你的应用"
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="安全可靠"
              description="内置身份验证和行级安全策略，保护你的数据"
            />
            <FeatureCard
              icon={<Globe className="h-6 w-6" />}
              title="全球加速"
              description="利用边缘网络，为全球用户提供快速访问体验"
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-muted/30 px-6 py-24">
        <PricingSection />
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-balance mb-6 text-3xl font-semibold tracking-tight sm:text-4xl">
            准备好开始了吗？
          </h2>
          <p className="text-pretty mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            立即注册，体验现代化的全栈开发体验
          </p>
          <Button size="lg" className="rounded-full" asChild>
            <Link href="/auth/sign-up">免费开始</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-8">
        <div className="mx-auto max-w-6xl text-center text-sm text-muted-foreground">
          <p>© 2025 Supabase Starter. 使用 Next.js 和 Supabase 构建</p>
        </div>
      </footer>
    </main>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="group relative rounded-2xl border bg-card p-8 transition-all hover:shadow-lg">
      <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="leading-relaxed text-muted-foreground">{description}</p>
    </div>
  )
}
