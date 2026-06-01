# Cyanth

一个基于 Angular 及 AnalogJS 的 Material Design 3 博客。

## 特性

- Material Design 3 样式
- 支持从壁纸提取主题色
- 类似 Discord 的四栏布局
- 支持 Markdown 文章
- 支持 深色 / 浅色
- 评论系统
- 接入 Meting API 的音乐播放器

## 技术栈

使用 Angular 19 开发。元框架为 AnalogJS，UI 库使用 Angular Material .

## 快速开始

```bash
pnpm install
pnpm dev
pnpm build
pnpm test
pnpm lint       # ESLint
pnpm format     # Prettier
```

## 配置

集中于 `src/app/core/config.ts`：

包括:

- 站点信息
- 站长资料
- 链接与友链
- 导航
- 主题设置
- 布局尺寸
- 评论配置
- 版权信息

## 添加文章

在 `src/content/articles/` 下创建 `.md` 文件：

```markdown
---
title: "文章标题"
published: 2077-01-01
description: "文章简介"
tags: ["标签1", "标签2"]
category: "分类"
draft: false
cover: "type a pic url here"
type: "post"
---

正文
```

## 代码规范

- **ESLint**
- **Prettier**
- **TypeScript 严格**

```bash
pnpm lint:fix    # 自动修复 ESLint 问题
pnpm format      # 自动格式化
```

## 许可证

[MIT License](LICENSE)
