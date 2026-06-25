# AI-Class 调研问卷系统

一个简洁美观的在线调研问卷系统，支持问卷填写、数据统计和后台管理。

## 功能特性

- 📝 **问卷填写** - 简洁的表单界面，支持移动端
- 📊 **数据统计** - 实时查看参与人数和各题统计
- 🔧 **题目管理** - 后台可在线编辑、启用/禁用题目
- 📋 **回答记录** - 查看所有参与者的详细回答
- 🔐 **权限控制** - 管理后台需要登录验证

## 技术栈

- **前端**: Next.js 16 + React 19 + Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: SQLite (better-sqlite3)
- **认证**: JWT (jose) + bcryptjs

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 初始化数据库

```bash
npm run db:init
```

这将创建数据库并插入默认管理员账号和15道示例题目。

**默认管理员账号:**
- 用户名: `admin`
- 密码: `admin123`

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看问卷页面。

### 4. 访问管理后台

访问 http://localhost:3000/admin 进入管理后台。

## 项目结构

```
ai-class-survey/
├── src/
│   ├── app/
│   │   ├── api/                    # API 路由
│   │   │   ├── admin/             # 管理后台 API
│   │   │   ├── questions/         # 获取题目 API
│   │   │   └── survey/            # 提交问卷 API
│   │   ├── admin/                 # 管理后台页面
│   │   └── page.tsx               # 问卷首页
│   ├── components/
│   │   ├── admin/                 # 管理后台组件
│   │   ├── SurveyForm.tsx         # 问卷表单
│   │   ├── WelcomePage.tsx        # 欢迎页
│   │   └── ThankYouPage.tsx       # 感谢页
│   └── lib/
│       ├── auth.ts                # 认证工具
│       └── db.ts                  # 数据库工具
├── scripts/
│   └── init-db.ts                 # 数据库初始化脚本
└── data/                          # SQLite 数据库文件（自动生成）
```

## 部署

### Vercel 部署

1. Fork 本仓库
2. 在 Vercel 中导入项目
3. 设置环境变量:
   - `JWT_SECRET`: 你的 JWT 密钥
4. 部署完成后运行数据库初始化

### 自部署

1. 克隆仓库
2. 安装依赖: `npm install`
3. 初始化数据库: `npm run db:init`
4. 构建项目: `npm run build`
5. 启动服务: `npm start`

## 环境变量

创建 `.env.local` 文件:

```env
JWT_SECRET=your-secret-key-here
```

## 自定义题目

登录管理后台后，可以:

1. 编辑现有题目的内容和选项
2. 调整题目顺序
3. 启用/禁用题目
4. 查看各题统计数据

## License

MIT
