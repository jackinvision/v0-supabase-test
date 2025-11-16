import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Zap, Globe } from 'lucide-react'

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
              <Link href="/auth/sign-up">
                开始使用
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
