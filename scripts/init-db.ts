import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Supabase配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function initializeDatabase() {
  try {
    // 使用Service Role Key创建客户端（有管理员权限）
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 读取SQL文件
    const sqlPath = join(__dirname, '../supabase/migrations/001_initial_tables.sql');
    const sql = readFileSync(sqlPath, 'utf8');

    console.log('🚀 开始初始化数据库表...');

    // 执行SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      console.error('❌ 数据库初始化失败:', error);
      process.exit(1);
    }

    console.log('✅ 数据库表初始化成功！');
    console.log('📋 已创建表:');
    console.log('   - user_subscriptions (用户订阅状态)');
    console.log('   - user_daily_usage (用户每日使用记录)');

  } catch (error) {
    console.error('❌ 初始化过程中出错:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  // 加载环境变量
  require('dotenv').config({ path: './app/.env.local' });

  initializeDatabase();
}

export default initializeDatabase;