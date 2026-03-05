---
title: Umami网站、文章浏览量统计
published: 2026-03-05
description: '手把手教会你如何应用Umami统计你的网站'
image: ''
tags: ["Umami","教程","api"]
category: 'Umami教程'
draft: false 
lang: 'zh-CN'
---

# 一、Umami介绍

Umami 是一款开源、隐私优先的网站统计分析工具，常被视为 Google Analytics 的轻量级替代品。

## 1. 核心功能

- **基础指标统计：** 实时追踪浏览量（PV）、访客数（UV）、跳出率及平均访问时长。
- **多维数据看板：** 自动分析访客的来源渠道（Referrers）、地理位置、使用的浏览器、操作系统及设备类型。
- **自定义事件：** 支持按钮点击、表单提交等交互行为的埋点追踪。
- **数据自持：** 支持自建部署（Self-hosted），所有访问数据存储在自己的数据库中。

------

## 2. 使用体验

- **轻量高效：** 追踪脚本极小（约 2KB），对网站加载速度几乎无影响。
- **界面简洁：** 单页 Dashboard 设计，数据一目了然，无学习成本。
- **多站点管理：** 一个后台可同时监控无限数量的网站。
- **共享报告：** 支持生成公开访问链接，方便向他人展示统计数据。

------

**一句话总结：** Umami 是一个**安装简单、界面漂亮且不侵犯隐私**的轻量级网站流量统计工具。



# 二、部署网页版Umami到自己的网站

[Umami网站](https://cloud.umami.is/)

## 1、简单部署

有账号登录，没账号注册

![image-20260305161420940](./assets//Umami网站、文章浏览量统计/image-20260305161420940.png)

![image-20260305162233360](./assets//Umami网站、文章浏览量统计/image-20260305162233360.png)

![image-20260305162325083](./assets//Umami网站、文章浏览量统计/image-20260305162325083.png)

![image-20260305162613379](./assets//Umami网站、文章浏览量统计/image-20260305162613379.png)

![image-20260305162704550](./assets//Umami网站、文章浏览量统计/image-20260305162704550.png)

然后把跟踪代码放入到你网页代码中，一般放到`<head>` 内部

~~~html
<head>
    <title>我的网站</title>
    <script defer src="https://cloud.umami.is/script.js" data-website-id="94059cb0-4616-47ff-8625-3d3cc4c893df"></script>
</head>
~~~

这样就可以在概览中查看

![image-20260305164106038](./assets//Umami网站、文章浏览量统计/image-20260305164106038.png)

### 分享统计记录

![image-20260305164558334](./assets//Umami网站、文章浏览量统计/image-20260305164558334.png)

## 2、调用api查看网站浏览量

### 简单粗暴的方法直接看右键检测网站

得到访问的url，同时也得到了website-id

![image-20260305165900413](./assets//Umami网站、文章浏览量统计/image-20260305165900413.png)

得到访问需要用到的authorization

![image-20260305171157440](./assets//Umami网站、文章浏览量统计/image-20260305171157440.png)

对应的响应数据：

![image-20260305170133859](./assets//Umami网站、文章浏览量统计/image-20260305170133859.png)

得到website-id

![image-20260305181737482](./assets//Umami网站、文章浏览量统计/image-20260305181737482.png)

获取响应数据需要的内容（以下为样例）：

- **url**：`https://cloud.umami.is/analytics/us/api/websites/94059cb0-4616-47ff-8625-3d3cc4c893df/stats?startAt=1772611200000&endAt=1772701199999`
- **Authorization**:`Bearer Au58VsH1UhnGGIk/HFhGM76X2YVu0mSFo0EQ2RZJ3KwHMWGcf+bNhGuMZ12+6X2YVuPmaIocQdsSjA5e1Jxr8/hRx5KrZgPfnYH6m19vnAhP3VkRIq86ehysg6X2YVuvFAQXadt7PODcC28x52ZiMN+YOg35acg6tvUrpx+4CMSm7GDx+7luZ24X2rgbDoYC56X2YVuHiBX0uggrFWpET9vE1Qmjrye1zkRPjlXd00vsOzONO7tVlr4scZDIlcGKvv9A+umScR4QE+LjUlVPQoSjtIlNdloC74Ay2AjVowyqa8G2e6LaZwrZbnRqQdeuqJay6XuvK1oIasFx9htc2Xl276X2YVuGVIWcZQ==`
- **website-id**：`94059cb0-4616-47ff-8625-3d3cc4c893df`

通用样例：

- **url**：`https://cloud.umami.is/analytics/us/api/websites/{your-website-id}/stats?startAt={startAt}&endAt={endAt}`
- **Authorization**: `Bearer {your-token}`

部分内容需要修改为你们自己的内容（下列为需要修改的内容）：

- `{your-website-id}`
- `{startAt}`：可修改数字
- `{endAt}`：可修改数字
- `{your-token}`

### 自己写的组件代码

``` astro title="Umami.astro" "your-website-id" "your-token"
---
import WidgetLayout from './WidgetLayout.astro';
import { Icon } from 'astro-icon/components';

interface Props {
	class?: string;
	style?: string;
}

const { class: className, style } = Astro.props;

const UMAMI_CONFIG = {
    baseUrl: 'https://cloud.umami.is/analytics/us/api',
    websiteId: 'your-website-id',
    shareToken: 'your-token'
};

const endAt = Date.now();
const startAt = 0;

// 构造获取统计数据的 API 链接
const apiUrl = `${UMAMI_CONFIG.baseUrl}/websites/${UMAMI_CONFIG.websiteId}/stats?startAt=${startAt}&endAt=${endAt}`;
---

<WidgetLayout name="访问统计" id="umami-stats" isCollapsed={false} class={className} style={style}>
    <div class="flex flex-col gap-2 pb-2">
        <div class="flex justify-between items-center text-sm text-neutral-500 dark:text-neutral-400">
            <div class="flex items-center gap-2">
                <Icon name="material-symbols:visibility-outline-rounded" class="text-lg" />
                <span>浏览量</span>
            </div>
            <span id="umami-pageviews" class="font-bold text-neutral-700 dark:text-neutral-300">...</span>
        </div>
        <div class="flex justify-between items-center text-sm text-neutral-500 dark:text-neutral-400">
            <div class="flex items-center gap-2">
                <Icon name="material-symbols:touch-app-outline-rounded" class="text-lg" />
                <span>访问数</span>
            </div>
            <span id="umami-visits" class="font-bold text-neutral-700 dark:text-neutral-300">...</span>
        </div>
        <div class="flex justify-between items-center text-sm text-neutral-500 dark:text-neutral-400">
            <div class="flex items-center gap-2">
                <Icon name="material-symbols:person-outline-rounded" class="text-lg" />
                <span>访客数</span>
            </div>
            <span id="umami-visitors" class="font-bold text-neutral-700 dark:text-neutral-300">...</span>
        </div>
    </div>
</WidgetLayout>

<script define:vars={{ apiUrl,UMAMI_CONFIG }}>
    // 客户端获取动态 Umami 数据的脚本
    fetch(apiUrl, {
        method: 'GET',
        headers: {
            Authorization: `Bearer UMAMI_CONFIG.shareToken`,
            'Content-Type': 'application/json'
        }
    })
    .then(res => {
        if (!res.ok) {
            throw new Error('API 返回错误状态: ' + res.status);
        }
        return res.json();
    })
    .then(data => {
        if (data) {
            // 解析数据
            const pageviews = data.pageviews || 0;
            const visits = data.visits || 0;
            const visitors = data.visitors || 0;
            
            // 格式化数字
            const formatNumber = (num) => new Intl.NumberFormat('en-US').format(num);
            
            // 更新 DOM
            const elPageviews = document.getElementById('umami-pageviews');
            if (elPageviews) elPageviews.innerText = formatNumber(pageviews);

            const elVisits = document.getElementById('umami-visits');
            if (elVisits) elVisits.innerText = formatNumber(visits);
            
            const elVisitors = document.getElementById('umami-visitors');
            if (elVisitors) elVisitors.innerText = formatNumber(visitors);
        }
    })
    .catch(err => {
        console.error('获取 Umami 统计数据失败:', err);
        const elPageviews = document.getElementById('umami-pageviews');
        if (elPageviews) elPageviews.innerText = '获取失败';
        
        const elVisitors = document.getElementById('umami-visitors');
        if (elVisitors) elVisitors.innerText = '获取失败';
    });
</script>
```

### 关键代码

~~~ js "{your-website-id}" "{your-token}"
const startAt = 0;
const endAt = Date.now();

const apiUrl = https://cloud.umami.is/analytics/us/api/websites/{your-website-id}/stats?startAt=${startAt}&endAt=${endAt};

fetch(apiUrl, {
    method: 'GET',
    headers: {
        Authorization: `Bearer {your-token}`,
        'Content-Type': 'application/json'
    }
})
~~~

以下内容需要替换成自己的：

`{your-website-id}`

`{your-token}`

startAt和endAt根据自己需求修改（这个是修改获取起止时间）

## 3、调用api查看文章浏览量

跟上述方法相同，这里直接给出

### 关键代码

``` js "{your-website-id}" "{your-want-to-search-url}" "{your-token}"
const startAt = 0;
const endAt = Date.now();

const apiUrl = `https://cloud.umami.is/analytics/us/api/websites/{your-website-id}/metrics/expanded?startAt=${startAt}&endAt=${endAt}&search={encodeURIComponent({your-want-to-search-url})}&type=path`;

fetch(apiUrl, {
    method: 'GET',
    headers: {
        Authorization: `Bearer {your-token}`,
        'Content-Type': 'application/json'
    }
})
```

以下内容需要替换成自己的：

`{your-website-id}`

`{your-token}`

`{your-want-to-search-url}`

简单来说就是修改一下`apiUrl`

样例：

**apiUrl**：`https://cloud.umami.is/analytics/us/api/websites/94059cb0-4616-47ff-8625-3d3cc4c893df/metrics/expanded?startAt=1772622000000&endAt=1772711999999&search=&type=path`

响应内容：


![image-20260305194522678](./assets//Umami网站、文章浏览量统计/image-20260305194522678.png)


想要调用其他接口可以查看 [官方api接口文档](https://umami.is/docs/api/website-stats) | [网站统计 - Umami 中文文档](https://umami.zhcndoc.com/docs/api/website-stats)