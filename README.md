<h1 align="center">
影云CMS-star
</h1>

<p align="center">

![License](https://img.shields.io/badge/License-AGPLv3-blue.svg)
![PHP](https://img.shields.io/badge/PHP-8.2%2B-777bb3.svg)
![Vue](https://img.shields.io/badge/Vue-3-4fc08d.svg)

</p>

本项目基于 影云CMS2.0 二次开发而来，是一个基于 Vue 3 的前端项目，在保留 影云CMS2.0 核心功能的基础上，重绘了整套 UI 界面。

影云CMS2.0 是一个非常优秀的开源项目，详见：<https://github.com/sjzyingyunkeji/yinyun-cms>

## 技术栈

- **界面风格**：Canvas 星空动画（星星闪烁 / 流星 / 鼠标视差）+ 玻璃拟态（Glassmorphism）设计
- **前端**：Vue 3 + Vite + Vue Router + Pinia + Tailwind CSS
- **后端**：基于 影云CMS2.0 的后端服务，未作任何修改
- **数据库**：SQLite

## 项目预览

在线演示：<https://www.holytreasure.cn/>

<img src="https://www.holytreasure.cn/storage/uploads/202610/012313_2c2f56a6.webp" alt="首页">

### 快速开始

**环境要求**

- PHP >= 8.2
- Node.js >= 18

```bash
# 启动 PHP 后端服务
cd backend
php -S localhost:8080 -t public dev-router.php

# 启动 Vite 开发服务
cd frontend
npm install
npm run dev
```

启动后访问：

- 前台：<http://localhost:5173/>
- 后台：<http://localhost:5173/admin/>

### 生产构建

```bash
cd frontend
npm run build          # 构建默认主题 + 后台面板
npm run build:site     # 仅构建前台主题
npm run build:admin    # 仅构建后台面板
npm run pack:theme     # 将默认主题打包为 zip 压缩包
```

### 部署

参见：[deployment.md](https://github.com/holytreasure/yinyun-cms-star/blob/main/docs/deployment.md)

## 功能介绍

### 前台

- 星空 Canvas 背景：三层星星视差、闪烁、随机流星、鼠标 / 触摸视差
- 首页：Hero 首屏、数据统计、关于卡片、热门文章（排序可在后台切换「热门 / 最新」）、友链
- 文章列表：分类筛选、分页、排序切换（最新发布 / 热门阅读）、置顶标记、阅读量 / 评论数
- 文章详情：Markdown 渲染、上下篇导航、相关文章（同标签优先，用于 SEO 内链）、标签、浏览量统计
- 评论：昵称 / 邮箱 / 内容，支持审核开关（默认开启审核）
- 归档：按年份分组的时间轴
- 友链页、独立页面（关于我 / 留言板）、404 页
- SEO：`/post/{slug}` 可读地址、PHP 服务端渲染文章页（meta / OG / canonical / JSON-LD）、`/sitemap.xml`、`/robots.txt`、相关文章与上下篇内链

### 后台

- 仪表盘：统计卡片、30 天发布趋势图、最近文章 / 评论
- 访问统计：全站 PV / UV（含首页）、今日对比、访问趋势双线图（PV + UV）、热门文章 Top10、热门页面、来源站点、设备分布；访客 IP 仅哈希存储，30 分钟内同访客同页面去重
- 文章管理：搜索 / 状态 / 分类筛选、Markdown 编辑器（编辑 / 预览切换）、置顶（编辑页开关 + 列表内一键置顶 / 取消）、评论开关、草稿 / 发布、删除确认
- 分类管理：CRUD、文章数统计、排序（有文章的分类禁止删除）
- 标签管理：CRUD、文章数统计
- 页面管理：CRUD、别名（slug）、预览、排序
- 评论管理：待审核 / 已通过 / 垃圾筛选、通过、标垃圾、删除
- 媒体库：拖拽 / 点击上传（进度条）、支持图片压缩（可开关）、网格预览、复制链接、删除
- 友链管理：CRUD、排序、启用 / 停用
- 站点设置：站点信息、博主信息、关站设置（一键关站 + 自定义关站文案，后台仍可登录）、社交账号（GitHub / 邮箱 / 微博 / 知乎 / CSDN / 微信公众平台，支持二维码图片）、导航友站（前台导航栏「友站」下拉 + 首页友站区）、评论审核、每页文章数、首页文章排序（热门 / 最新）、访问统计开关
- 前台导航栏：「友站」下拉菜单导航至其他站点
- 个人资料：昵称 / 邮箱 / 头像 / 简介、修改密码

## API

参见：[api.md](https://github.com/holytreasure/yinyun-cms-star/blob/main/docs/api.md)

## 视觉设计系统

### 三层星空粒子

- **L1 远景静态星**：数量最多、体积极小、低透明度蓝灰调、不闪烁，构成深空底色
- **L2 中层呼吸星**：正弦慢呼吸，少量偏暖色
- **L3 暖芯亮恒星**：少量大星，径向渐变带极淡暖黄星核，外扩光晕
- 偶发流星（右下拖尾）+ 分层视差

### 全局氛围层

- 胶片噪点：SVG `feTurbulence` 分形噪声，`opacity ≈ 0.045` + steps 抖动，`mix-blend-overlay`
- 径向暗角：四角压暗突出中心
- 左右色彩偏移：左紫右青（与 body 极光渐变呼应）

### 玻璃分级体系

| 层级 | 类名 | 规格 | 用途 |
| --- | --- | --- | --- |
| 强磨砂 | `.glass-strong` | blur 12px、渐变描边、双层柔光阴影、圆角 16px | 置顶文章卡片、视觉重心 |
| 中度磨砂 | `.glass-medium` | blur 8px、圆角 16px | About 卡片、文章正文、弹窗、评论表单 |
| 弱磨砂 | `.glass` | blur 6px（或深色半透明）、圆角 12px、阴影极淡 | 普通文章卡片、评论项、友链 |
| 极简 | `.stat-card` | 无外阴影、无描边，hover 才浮现微光 | Hero / 仪表盘统计小卡片 |

## 常见问题

### Q：忘记后台管理员密码怎么办？

请前往源码目录 `backend/tools/reset-password.php`，将其上传至 `backend/public/`，然后访问 `/reset-password.php`，账号即重置为 `admin/admin123`。

> **注意：重置完成后请立刻删除该文件。**

## 致谢

本项目以 影云CMS2.0 作为整体基座，在此感谢影云网络科技（石家庄）有限公司的开发团队。同时也感谢 [Vue](https://vuejs.org)、[Vite](https://vitejs.dev)、[PHP](https://www.php.net) 与 [SQLite](https://www.sqlite.org) 等优秀开源项目奠定的技术底座。