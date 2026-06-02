<p align="center">
  <img src="https://raw.githubusercontent.com/Celvra/Cyanth/main/public/avatar.jpg" alt="Cyanth" width="120" />
</p>

<h1 align="center">Cyanth</h1>

<p align="center">
  一个基于 Angular 及 AnalogJS 的 Material Design 3 博客
</p>

<p align="center">
  <a href="https://github.com/Celvra/Cyanth/actions"><img src="https://img.shields.io/github/actions/workflow/status/Celvra/Cyanth/ci.yml?style=flat-square&logo=githubactions&logoColor=white&label=CI" alt="CI" /></a>
  <a href="https://github.com/Celvra/Cyanth/releases"><img src="https://img.shields.io/github/v/release/Celvra/Cyanth?style=flat-square&logo=github&logoColor=white&label=Release" alt="Release" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/Celvra/Cyanth?style=flat-square&logo=opensourceinitiative&logoColor=white&label=License" alt="License" /></a>
  <a href="https://angular.dev/"><img src="https://img.shields.io/badge/Angular-19-DD0031?style=flat-square&logo=angular&logoColor=white" alt="Angular" /></a>
  <a href="https://analogjs.org/"><img src="https://img.shields.io/badge/AnalogJS-latest-000000?style=flat-square&logo=analogjs&logoColor=white" alt="AnalogJS" /></a>
  <a href="https://material.angular.io/"><img src="https://img.shields.io/badge/Material%20Design-3-757575?style=flat-square&logo=materialdesign&logoColor=white" alt="Material Design" /></a>
</p>

<p align="center">
  <a href="https://github.com/Celvra/Cyanth/stargazers"><img src="https://img.shields.io/github/stars/Celvra/Cyanth?style=flat-square&logo=github&logoColor=white&label=Stars" alt="Stars" /></a>
  <a href="https://github.com/Celvra/Cyanth/network/members"><img src="https://img.shields.io/github/forks/Celvra/Cyanth?style=flat-square&logo=github&logoColor=white&label=Forks" alt="Forks" /></a>
</p>

<p align="center">
  <a href="#特性">特性</a> ·
  <a href="#技术栈">技术栈</a> ·
  <a href="#快速开始">快速开始</a> ·
  <a href="#配置">配置</a> ·
  <a href="#添加文章">添加文章</a> ·
  <a href="#许可证">许可证</a>
</p>

---

## 特性

- Material Design 3 样式
- 支持从壁纸提取主题色
- 类似 Discord 的四栏布局
- 支持 Markdown 文章
- 支持深色 / 浅色
- 评论系统
- 接入 Meting API 的音乐播放器

## 技术栈

使用 Angular 19 开发。元框架为 AnalogJS，UI 库使用 Angular Material。

## 快速开始

克隆仓库后在目录中运行

```bash
pnpm install
pnpm dev
pnpm build
pnpm test
pnpm lint
pnpm format
```

## 配置

修改 `src/app/core/config.ts`

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

## 许可证

[MIT License](LICENSE)
