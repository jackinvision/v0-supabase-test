import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from 'lucide-react';
import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl space-y-12 py-12">
        <div className="text-center">
          <Link href="/" className="mb-8 inline-block text-lg hover:opacity-80">
            ← 返回首页
          </Link>
          <h1 className="text-balance mb-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            选择适合你的方案
          </h1>
          <p className="text-pretty mx-auto max-w-2xl text-lg text-muted-foreground">
            简单透明的定价，随时可以升级或降级
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <PricingCard
            name="免费版"
            price="¥0"
            description="适合个人开发者和小型项目"
            features={[
              "最多 3 个项目",
              "基础功能",
              "社区支持",
              "每月 1GB 存储",
            ]}
            buttonText="当前方案"
            buttonVariant="outline"
          />
          <PricingCard
            name="专业版"
            price="¥99"
            description="适合成长型团队和企业"
            features={[
              "无限项目",
              "所有高级功能",
              "优先支持",
              "每月 50GB 存储",
              "自定义域名",
              "高级分析",
            ]}
            buttonText="立即升级"
            highlighted
          />
          <PricingCard
            name="企业版"
            price="¥299"
            description="适合大型企业和组织"
            features={[
              "专业版所有功能",
              "专属客户经理",
              "SLA 保障",
              "无限存储",
              "定制开发",
              "私有部署",
            ]}
            buttonText="联系销售"
            buttonVariant="outline"
          />
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            注：Stripe 支付集成即将推出。目前展示的是定价页面预览。
          </p>
        </div>
      </div>
    </div>
  );
}

function PricingCard({
  name,
  price,
  description,
  features,
  buttonText,
  buttonVariant = "default",
  highlighted = false,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant?: "default" | "outline";
  highlighted?: boolean;
}) {
  return (
    <Card
      className={
        highlighted
          ? "relative border-primary shadow-lg ring-2 ring-primary"
          : "border-border/50"
      }
    >
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-sm font-medium text-primary-foreground">
          最受欢迎
        </div>
      )}
      <CardHeader className="space-y-4 text-center">
        <CardTitle className="text-2xl font-semibold">{name}</CardTitle>
        <div>
          <span className="text-4xl font-bold">{price}</span>
          <span className="text-muted-foreground">/月</span>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <ul className="space-y-3">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        <Button
          className="w-full rounded-full"
          variant={buttonVariant}
          asChild
        >
          <Link href="/auth/sign-up">{buttonText}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
