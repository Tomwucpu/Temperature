# Temperature

基于 [Fuwari](https://github.com/saicaca/fuwari) 二次开发的个人博客项目，使用 `Astro 5` 构建，结合 `Tailwind CSS`、`Svelte` 与 `TypeScript`，在保留 Fuwari 轻量、优雅、以内容为中心的基础上，加入了更贴近个人站点使用场景的功能扩展。

这个仓库更像是一个已经投入使用的个人博客方案，而不只是主题模板：除了文章系统本身，还集成了评论、统计、搜索、音乐播放器、随机壁纸和展示设置等能力。

## 项目特性

- 基于 Fuwari 的博客结构和视觉风格进行二次开发
- 使用 `Astro Content Collections` 管理文章与独立页面内容
- 支持文章分页、分类、标签、归档、目录、RSS、Sitemap、`robots.txt`
- 集成 `Pagefind` 本地搜索
- 集成 `Giscus` 评论系统
- 集成 `Umami` 站点统计与单篇文章浏览统计
- 自定义代码块体验，支持语言标识、行号、折叠和复制按钮
- 支持数学公式、Admonition、GitHub 卡片等 Markdown 扩展
- 支持主题色、组件背景透明度、壁纸开关与壁纸遮罩透明度调节
- 内置悬浮音乐播放器，支持顺序播放、随机播放和单曲循环
- 使用 `@astrojs/netlify` 适配 Netlify 部署
- 配套 GitHub Actions，覆盖 `Biome` 检查与 Astro 构建

## 技术栈

- `Astro 5`
- `Tailwind CSS 3`
- `Svelte 5`
- `TypeScript`
- `Stylus`
- `astro-expressive-code`
- `Pagefind`
- `Giscus`
- `Umami`
- `Swup`

## 目录结构

```text
.
├─ public/                     # 公共静态资源
├─ scripts/
│  └─ new-post.js             # 新建文章脚本
├─ src/
│  ├─ assets/                 # 站点资源，如头像、音乐列表等
│  ├─ components/             # 页面组件、侧边栏组件、评论、统计等
│  ├─ content/
│  │  ├─ posts/               # 博客文章
│  │  ├─ spec/                # about 等独立内容页
│  │  └─ config.ts            # 内容集合定义
│  ├─ layouts/                # 页面布局
│  ├─ pages/                  # 路由页面
│  ├─ plugins/                # remark/rehype/expressive-code 插件
│  ├─ styles/                 # 全局样式
│  └─ config.ts               # 站点主配置
├─ astro.config.mjs           # Astro 配置与集成
├─ frontmatter.json           # Front Matter CMS 配置
├─ package.json
└─ README.md
```

## 快速开始

推荐使用与仓库一致的工具链：

- Node.js `22+`
- `pnpm 9`

安装依赖：

```bash
pnpm install
```

启动开发环境：

```bash
pnpm dev
```

构建生产版本：

```bash
pnpm build
```

本地预览生产构建：

```bash
pnpm preview
```

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 启动本地开发服务器 |
| `pnpm check` | 执行 `astro check` |
| `pnpm build` | 构建站点并生成 `Pagefind` 搜索索引 |
| `pnpm preview` | 预览生产构建结果 |
| `pnpm new-post -- <name>` | 创建新文章模板 |
| `pnpm format` | 使用 Biome 格式化 `src` |
| `pnpm lint` | 使用 Biome 检查并修复 `src` |

## 内容编写

文章放在 [src/content/posts](./src/content/posts) 目录下，独立内容页如 About 放在 [src/content/spec](./src/content/spec)。

创建文章：

```bash
pnpm new-post -- hello-world
```

生成的 Front Matter 模板如下：

```md
---
title: hello-world
published: 2026-04-03
description: ''
image: ''
tags: []
category: ''
draft: false
lang: ''
---
```

当前内容模型定义见 [src/content/config.ts](./src/content/config.ts)，支持的主要字段有：

- `title`
- `published`
- `updated`
- `description`
- `image`
- `tags`
- `category`
- `draft`
- `lang`

## 二次开发点

相对于原版 Fuwari，这个仓库已经加入了比较明显的个性化改造：

- 在 [src/config.ts](./src/config.ts) 中扩展了站点、导航、个人信息、评论、音乐等集中配置
- 在 [src/components/widget/Umami.astro](./src/components/widget/Umami.astro) 和 [src/components/UmamiArticleStats.astro](./src/components/UmamiArticleStats.astro) 中实现站点级与文章级统计展示
- 在 [src/components/widget/MusicPlayer.svelte](./src/components/widget/MusicPlayer.svelte) 中实现悬浮音乐播放器
- 在 [src/components/widget/Wallpaper.svelte](./src/components/widget/Wallpaper.svelte) 和 [src/components/widget/DisplaySettings.svelte](./src/components/widget/DisplaySettings.svelte) 中加入壁纸和显示设置能力
- 在 [astro.config.mjs](./astro.config.mjs) 中加入了 `remark`、`rehype` 与 `Expressive Code` 的增强配置
- 在 [src/pages/rss.xml.ts](./src/pages/rss.xml.ts) 中输出 RSS，在 [src/pages/robots.txt.ts](./src/pages/robots.txt.ts) 中输出 robots 配置

## Fork 或自部署前建议先改的配置

这个项目目前已经绑定了一些个人站点服务，如果你准备继续二开或直接拿去部署，建议优先检查下面这些位置：

- [astro.config.mjs](./astro.config.mjs)
  当前 `site` 仍是 `https://fuwari.vercel.app/`，部署前应改成你自己的正式域名。
- [src/config.ts](./src/config.ts)
  这里包含站点标题、导航、头像、个人链接、`Giscus` 配置和音乐列表配置。
- [src/layouts/Layout.astro](./src/layouts/Layout.astro)
  这里写入了 `Umami` 埋点脚本与页面访问追踪逻辑。
- [src/components/widget/Umami.astro](./src/components/widget/Umami.astro)
  这里请求了 `https://umami.temperaturetw.top` 作为统计代理。
- [src/components/UmamiArticleStats.astro](./src/components/UmamiArticleStats.astro)
  这里使用了文章统计接口。
- [src/components/widget/Wallpaper.svelte](./src/components/widget/Wallpaper.svelte)
  当前随机壁纸源为 `https://image.temperaturetw.top/api/random`。
- [src/content/spec/about.md](./src/content/spec/about.md)
  About 页面内容在这里维护。

## 开发提示

- 搜索功能依赖 `Pagefind`。在开发模式下会使用 mock 数据；如果想验证真实搜索效果，请执行 `pnpm build && pnpm preview`。
- 生产构建时，`pnpm build` 会先执行 Astro 构建，再自动生成 `Pagefind` 索引。
- 仓库内已包含 GitHub Actions：
  - [.github/workflows/build.yml](./.github/workflows/build.yml)：构建与类型检查
  - [.github/workflows/biome.yml](./.github/workflows/biome.yml)：代码质量检查

## 部署

项目当前使用 `@astrojs/netlify` 适配器，适合直接部署到 Netlify。构建产物位于 `dist/`，如果切换到其他平台，可按需替换 [astro.config.mjs](./astro.config.mjs) 中的 adapter 配置。

## 致谢

- 原始主题项目：[saicaca/fuwari](https://github.com/saicaca/fuwari)
- 当前仓库沿用 MIT License，详见 [LICENSE](./LICENSE)
