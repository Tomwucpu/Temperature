# Temperature

基于 [Fuwari](https://github.com/saicaca/fuwari) 二次开发的个人博客项目，使用 `Astro 5`、`Svelte 5`、`Tailwind CSS` 与 `TypeScript` 构建。这个仓库已经不是单纯的主题示例，而是一个带有评论、统计、搜索、音乐播放器、随机壁纸和显示设置的实际站点工程。

当前代码里的默认站点语言是 `zh_CN`，当前构建与部署链路以 `Cloudflare Workers + Wrangler` 为主。

## 功能概览

- 基于 `Astro Content Collections` 管理博客文章和独立内容页
- 支持首页分页、文章详情、归档、About、分类、标签、目录、RSS、Sitemap、`robots.txt`
- 集成 `Pagefind` 本地搜索
- 集成 `Giscus` 评论系统
- 集成 `Umami` 站点统计和文章级浏览/访问统计
- 集成悬浮音乐播放器，音乐列表来自 `src/assets/music/like.json`
- 支持随机壁纸、壁纸刷新、壁纸遮罩透明度调节
- 支持主题模式、主题色、组件背景透明度等显示设置
- 使用 `Swup` 实现页面切换与过渡
- Markdown 扩展包含数学公式、Admonition、GitHub 卡片、阅读时长与摘要提取
- 自定义代码块体验，包含语言标识、折叠、行号和复制按钮
- 内置中英文翻译映射，当前默认文案语言由 `src/config.ts` 控制

## 技术栈

- `Astro 5`
- `Svelte 5`
- `Tailwind CSS 3`
- `TypeScript 5`
- `Stylus`
- `Swup`
- `Pagefind`
- `Giscus`
- `Umami`
- `astro-expressive-code`
- `Cloudflare Workers`
- `Wrangler`

## 目录结构

```text
.
├─ public/                         # 静态资源
├─ scripts/
│  └─ new-post.js                  # 新建文章脚本
├─ src/
│  ├─ assets/                      # 头像、音乐列表等站点资源
│  ├─ components/                  # 页面组件、评论、统计、侧边栏、小组件
│  ├─ constants/                   # 常量与导航预设
│  ├─ content/
│  │  ├─ posts/                    # 博客文章
│  │  ├─ spec/                     # About 等独立内容页
│  │  └─ config.ts                 # Content Collections 定义
│  ├─ i18n/                        # 文案翻译
│  ├─ layouts/                     # 页面布局
│  ├─ pages/                       # Astro 路由
│  ├─ plugins/                     # remark/rehype/expressive-code 插件
│  ├─ styles/                      # 全局样式
│  ├─ types/                       # 配置类型定义
│  ├─ utils/                       # 工具函数
│  └─ config.ts                    # 站点主配置
├─ tests/                          # 当前仓库内的 Node 侧测试
├─ astro.config.mjs                # Astro 集成与 Markdown 配置
├─ frontmatter.json                # Front Matter CMS 配置
├─ wrangler.jsonc                  # Cloudflare Workers 部署配置
├─ package.json
└─ README.md
```

## 快速开始

推荐使用和仓库一致的工具链：

- Node.js `22+`
- `pnpm 9`

安装依赖：

```bash
pnpm install
```

启动本地开发环境：

```bash
pnpm dev
```

执行生产构建：

```bash
pnpm build
```

本地以 Cloudflare Worker 方式预览生产构建：

```bash
pnpm preview
```

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 启动 Astro 开发服务器 |
| `pnpm check` | 执行 `astro check` |
| `pnpm type-check` | 执行 `tsc --noEmit --isolatedDeclarations` |
| `pnpm build` | 构建站点并生成 `Pagefind` 搜索索引 |
| `pnpm preview` | 先构建，再通过 `wrangler dev` 本地预览 |
| `pnpm deploy` | 构建后发布到 Cloudflare |
| `pnpm cf-typegen` | 生成 Wrangler 相关类型定义 |
| `pnpm new-post -- <name>` | 创建新文章模板 |
| `pnpm format` | 使用 Biome 格式化 `src` |
| `pnpm lint` | 使用 Biome 检查并修复 `src` |

当前仓库还包含一个独立测试文件，可直接运行：

```bash
node tests/photoswipe-controls.test.mjs
```

## 内容编写

文章位于 [src/content/posts](./src/content/posts)，独立内容页位于 [src/content/spec](./src/content/spec)。

创建文章：

```bash
pnpm new-post -- hello-world
```

脚本会生成如下 Front Matter 模板：

```md
---
title: hello-world
published: 2026-04-13
description: ''
image: ''
tags: []
category: ''
draft: false
lang: ''
---
```

当前文章内容模型定义见 [src/content/config.ts](./src/content/config.ts)，主要字段包括：

- `title`
- `published`
- `updated`
- `description`
- `image`
- `tags`
- `category`
- `draft`
- `lang`

其中 `prevTitle`、`prevSlug`、`nextTitle`、`nextSlug` 是内部字段，不需要手动维护。

如果你使用 VS Code 的 Front Matter 扩展，仓库已附带 [frontmatter.json](./frontmatter.json) 配置。

## 关键配置位置

这个仓库已经绑定了一些个人站点配置。Fork 或自部署前，建议优先检查下面这些文件：

- [astro.config.mjs](./astro.config.mjs)
  当前 `site` 仍是 `https://fuwari.vercel.app/`，应改成你自己的正式域名；Markdown、Swup、Expressive Code 与 Cloudflare adapter 也都在这里配置。
- [src/config.ts](./src/config.ts)
  这里维护站点标题、副标题、导航、头像、社交链接、主题色、评论、音乐播放器等核心配置。
- [src/layouts/Layout.astro](./src/layouts/Layout.astro)
  这里注入了 Umami 统计脚本和全局布局级别资源。
- [src/components/widget/Umami.astro](./src/components/widget/Umami.astro)
  这里请求了 `https://umami.temperaturetw.top` 作为站点统计代理。
- [src/components/UmamiArticleStats.astro](./src/components/UmamiArticleStats.astro)
  这里使用了文章级访问统计接口。
- [src/components/widget/Wallpaper.svelte](./src/components/widget/Wallpaper.svelte)
  当前随机壁纸源为 `https://image.temperaturetw.top/api/random`。
- [src/content/spec/about.md](./src/content/spec/about.md)
  About 页面内容在这里维护。
- [wrangler.jsonc](./wrangler.jsonc)
  这里维护 Cloudflare Worker 名称、兼容日期与静态资源绑定。

## 开发说明

- 搜索依赖 `Pagefind`。开发模式下会返回内置 mock 数据；如果要验证真实搜索效果，请使用 `pnpm build` 后再执行 `pnpm preview`。
- `pnpm preview` 的实际行为是 `pnpm run build && wrangler dev`，不是单纯的静态文件预览。
- 当前 Cloudflare Worker 入口由 [wrangler.jsonc](./wrangler.jsonc) 指向 `dist/_worker.js/index.js`，静态资源目录为 `dist/`。
- 当前仓库中的 GitHub Actions 只有一个工作流：[.github/workflows/build.yml](./.github/workflows/build.yml)，用于安装依赖并执行 `pnpm astro check`。

## 部署

当前构建配置使用的是 `@astrojs/cloudflare` 适配器，部署命令为：

```bash
pnpm deploy
```

如果你要切换到其他平台，主要需要调整：

- [astro.config.mjs](./astro.config.mjs) 中的 adapter
- [wrangler.jsonc](./wrangler.jsonc) 中的 Cloudflare 相关配置
- [src/config.ts](./src/config.ts) 与 [astro.config.mjs](./astro.config.mjs) 中的站点域名和外部服务地址

## 许可

- 仓库代码许可证见 [LICENSE](./LICENSE)，当前为 MIT License
- 站点文章页展示的版权声明默认配置为 `CC BY-NC-SA 4.0`，可在 [src/config.ts](./src/config.ts) 中修改

## 致谢

- 原始主题项目：[saicaca/fuwari](https://github.com/saicaca/fuwari)
