import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Mail } from 'lucide-react';

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-semibold">
              验证你的邮箱
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              我们已向你发送了一封确认邮件
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-sm leading-relaxed text-muted-foreground">
              请检查你的收件箱，点击邮件中的链接来激活你的账户。如果没有收到邮件，请检查垃圾邮件文件夹。
            </p>
            <Button asChild className="w-full rounded-full" variant="outline">
              <Link href="/auth/login">返回登录</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
