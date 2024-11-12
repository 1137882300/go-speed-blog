# BlogCDN 智能访问网关

## 项目简介

这是一个基于 Next.js 的博客智能访问网关，提供以下核心功能：

- 🚀 多域名智能测速
- 🔄 自动选择最快域名
- 🖱️ 手动选择域名访问
- 📊 实时访问人数统计

## 功能详细说明

### 域名测速
- 自动测试预配置的多个博客域名
- 测量每个域名的响应速度
- 使用颜色标记域名速度等级
  - 绿色：快速 (<500ms)
  - 黄色：中等 (500-1000ms)
  - 红色：较慢 (>1000ms)
  - 灰色：超时

### 访问模式
1. 自动模式
   - 可通过开关控制
   - 自动跳转到最快的域名

2. 手动模式
   - 点击任意域名
   - 在新标签页打开
   - 显示已选择的域名

### 访问统计
- 实时记录今日访问人数
- 每次加载页面自动递增

## 技术栈
- Next.js 14
- TypeScript
- Tailwind CSS
- shadcn/ui 组件库

## 快速开始

```bash
npm install
npm run dev
```

## 部署

可以直接部署到 Vercel 平台

## 贡献

欢迎提交 PR 和 Issue！
