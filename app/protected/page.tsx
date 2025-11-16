import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">欢迎回来</h1>
          <form action="/api/auth/signout" method="post">
            <Button variant="outline" type="submit">
              退出登录
            </Button>
          </form>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>你的账户信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">邮箱</span>
              <span className="font-medium">{user.email}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">用户 ID</span>
              <span className="font-mono text-sm">{user.id}</span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="text-muted-foreground">注册时间</span>
              <span className="font-medium">
                {new Date(user.created_at).toLocaleDateString("zh-CN")}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>升级到高级版</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              解锁更多功能和特性，提升你的使用体验
            </p>
            <Button asChild className="rounded-full">
              <Link href="/pricing">查看定价</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
